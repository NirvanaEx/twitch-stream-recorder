import { createFile, type MP4BoxBuffer, type Movie } from "mp4box";

export type MediaPart = { src: string; durationSec: number; startOffsetSec?: number };
export function mediaParts(parts: MediaPart[]) {
  let end = 0;
  return parts.map(part => { const start = part.startOffsetSec ?? end; end = start + part.durationSec; return { ...part, start, end }; });
}
export function partAt(parts: ReturnType<typeof mediaParts>, time: number) {
  const index = parts.findIndex(p => time < p.end - 0.001);
  return index < 0 ? Math.max(0, parts.length - 1) : index;
}

const RANGE_BYTES = 1024 * 1024;
const AHEAD = 45;
const BEHIND = 20;
const cancelled = () => new DOMException("Cancelled", "AbortError");
function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(cancelled()); return; }
    const stop = () => { clearTimeout(timer); reject(cancelled()); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", stop); resolve(); }, ms);
    signal.addEventListener("abort", stop, { once: true });
  });
}

/** Remux range-fetched MP4 samples into one MSE timeline; no transcoding or
 * media-element replacement at storage-file boundaries. */
export function attachSeamlessMedia(video: HTMLMediaElement, input: MediaPart[], initialTime: number, onError: (error: unknown) => void) {
  const parts = mediaParts(input);
  const duration = parts.at(-1)!.end;
  const source = new MediaSource();
  const url = URL.createObjectURL(source);
  let buffer: SourceBuffer | undefined;
  let codec = "";
  let disposed = false;
  let controller: AbortController | undefined;
  let job = Promise.resolve();
  let initialized = false;
  let lastTrim = 0;
  let internalSeek = false;
  let retries = 0;
  video.dataset.continuousTimeline = "1";
  video.dataset.delivery = "mse-mp4";
  video.src = url;

  const operation = (action: () => void) => new Promise<void>((resolve, reject) => {
    if (disposed || source.readyState !== "open" || !buffer) { reject(cancelled()); return; }
    const sb = buffer;
    const clean = () => { sb.removeEventListener("updateend", done); sb.removeEventListener("error", fail); };
    const done = () => { clean(); resolve(); };
    const fail = () => { clean(); reject(new Error("Media buffer rejected a fragment")); };
    sb.addEventListener("updateend", done, { once: true }); sb.addEventListener("error", fail, { once: true });
    try { action(); } catch (error) { clean(); reject(error); }
  });
  const has = (time: number) => {
    for (let i = 0; i < video.buffered.length; i++) if (time >= video.buffered.start(i) && time < video.buffered.end(i) - 0.15) return true;
    return false;
  };
  const ahead = () => {
    for (let i = 0; i < video.buffered.length; i++) if (video.currentTime >= video.buffered.start(i) - 0.15 && video.currentTime <= video.buffered.end(i)) return video.buffered.end(i) - video.currentTime;
    return 0;
  };
  async function readRange(src: string, offset: number, signal: AbortSignal) {
    const res = await fetch(src, { headers: { Range: `bytes=${offset}-${offset + RANGE_BYTES - 1}` }, signal });
    if (res.status !== 206) { await res.body?.cancel(); throw new Error(`Range playback returned ${res.status}`); }
    const match = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(res.headers.get("Content-Range") ?? "");
    if (!match || Number(match[1]) !== offset) { await res.body?.cancel(); throw new Error("Invalid media range"); }
    const data = await res.arrayBuffer() as MP4BoxBuffer;
    data.fileStart = offset;
    return { data, total: Number(match[3]) };
  }
  async function loadPart(index: number, localTime: number, signal: AbortSignal) {
    const part = parts[index];
    const parser = createFile();
    let info: Movie | undefined;
    let parseError: unknown;
    let offset = 0, total = Infinity;
    const pending: { id: number; bytes: ArrayBuffer; sample: number }[] = [];
    parser.onReady = value => { info = value; };
    parser.onError = error => { parseError = new Error(String(error)); };
    parser.onSegment = (id, _user, bytes, sample) => { pending.push({ id, bytes, sample }); };
    try {
      while (!info) {
        const range = await readRange(part.src, offset, signal);
        total = range.total;
        offset = parser.appendBuffer(range.data);
        if (parseError) throw parseError;
        if (!info && (offset >= total || offset < 0)) throw new Error("Missing MP4 metadata");
      }
      const tracks = (info as Movie).tracks.filter(t => t.video || t.audio);
      const mime = `video/mp4; codecs="${tracks.map(t => t.codec).join(",")}"`;
      if (!tracks.length || !MediaSource.isTypeSupported(mime)) throw new Error("Unsupported recording codecs");
      if (!buffer) { buffer = source.addSourceBuffer(mime); codec = mime; }
      else if (codec !== mime) { buffer.changeType(mime); codec = mime; }
      buffer.timestampOffset = part.start;
      for (const track of tracks) parser.setSegmentOptions(track.id, null, { nbSamples: 120, rapAlignement: true });
      const init = parser.initializeSegmentation();
      await operation(() => buffer!.appendBuffer(init.buffer as ArrayBuffer));
      if (!initialized) {
        initialized = true;
        source.duration = duration;
        const target = Math.min(initialTime, duration - 0.05);
        if (Math.abs(video.currentTime - target) > 0.001) {
          internalSeek = true;
          video.currentTime = target;
        }
      }
      offset = parser.seek(Math.max(0, localTime), true).offset;
      // MP4Box 2.3 seek updates nextSample but leaves the fragment start at
      // sample zero. Align both cursors so a range seek needs only its GOP.
      for (const track of parser.fragmentedTracks) {
        track.state.lastFragmentSampleNumber = track.trak.nextSample;
        track.state.lastSegmentSampleNumber = track.trak.nextSample;
      }
      parser.start();
      let parsedUntil = part.start;
      async function drain() {
        while (pending.length) {
          if (signal.aborted) throw cancelled();
          const fragment = pending.shift()!;
          await operation(() => buffer!.appendBuffer(fragment.bytes));
          const sample = parser.getTrackSamplesInfo(fragment.id)[fragment.sample - 1];
          if (sample) parsedUntil = Math.max(parsedUntil, part.start + (sample.cts + sample.duration) / sample.timescale);
          parser.releaseUsedSamples(fragment.id, fragment.sample);
        }
      }
      await drain();
      while (offset < total) {
        if (signal.aborted) throw cancelled();
        while (ahead() > AHEAD || parsedUntil > video.currentTime + AHEAD + 5) await sleep(250, signal);
        if (video.currentTime > BEHIND + 10 && video.currentTime - lastTrim > 10) {
          lastTrim = video.currentTime;
          await operation(() => buffer!.remove(0, video.currentTime - BEHIND));
        }
        const range = await readRange(part.src, offset, signal);
        total = range.total;
        const next = parser.appendBuffer(range.data);
        if (parseError) throw parseError;
        offset = Math.max(offset + range.data.byteLength, next);
        await drain();
      }
      parser.flush(); await drain();
    } finally { parser.stop(); }
  }
  function start(time: number, clear = false) {
    controller?.abort();
    const current = new AbortController(); controller = current;
    job = job.catch(() => {}).then(async () => {
      if (disposed || current.signal.aborted) return;
      if (source.readyState === "ended") { if (buffer) buffer.timestampOffset = buffer.timestampOffset; }
      if (clear && buffer?.buffered.length) await operation(() => buffer!.remove(0, duration + 1));
      let index = partAt(parts, time);
      for (; index < parts.length; index++) {
        if (current.signal.aborted) throw cancelled();
        while (initialized && parts[index].start > video.currentTime + AHEAD) await sleep(250, current.signal);
        await loadPart(index, Math.max(0, time - parts[index].start), current.signal);
      }
      if (!disposed && !current.signal.aborted && source.readyState === "open") source.endOfStream();
    }).catch(error => {
      if (disposed || current.signal.aborted) return;
      if (retries++ < 2 && !video.error) {
        void sleep(750 * retries, current.signal).then(() => start(video.currentTime, true)).catch(() => {});
      } else onError(error);
    });
  }
  const open = () => start(initialTime);
  const seeking = () => {
    if (internalSeek) { internalSeek = false; return; }
    if (initialized && !has(video.currentTime)) { retries = 0; start(video.currentTime, true); }
  };
  // A broadcaster reconnect may leave an explicit hole between recordings.
  // Skip only a known missing interval, never an ordinary buffering wait.
  const skipGap = () => {
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].start - parts[i - 1].end > 0.05 && video.currentTime >= parts[i - 1].end - 0.05 && video.currentTime < parts[i].start) {
        video.currentTime = parts[i].start; break;
      }
    }
  };
  source.addEventListener("sourceopen", open, { once: true });
  video.addEventListener("seeking", seeking);
  video.addEventListener("waiting", skipGap);
  return {
    dispose() {
      disposed = true; controller?.abort();
      source.removeEventListener("sourceopen", open); video.removeEventListener("seeking", seeking);
      video.removeEventListener("waiting", skipGap);
      delete video.dataset.continuousTimeline;
      if (video.getAttribute("src") === url) { video.removeAttribute("src"); video.load(); }
      URL.revokeObjectURL(url);
    },
  };
}
