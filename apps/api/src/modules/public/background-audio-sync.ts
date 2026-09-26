import { spawn } from 'node:child_process';
import { SAMPLE_RATE, type AudioMatch } from './audio-fingerprint';
import { Worker } from 'node:worker_threads';
import { resolve } from 'node:path';
import { boundedFetch, getVodMetadata, parseVodPlaylist, selectVodWindow, type VodMetadata } from './twitch-sync-source';
import { parseMediaTimeline } from '../recording/media-timeline';

type Session = { id: string; durationSec: number | null; mediaTimelineJson: string | null;
  createdAt: Date; startedAt: Date | null; endedAt: Date | null; channel: { twitchLogin: string } };
export type SyncResult = {
  status: 'matched' | 'unmatched' | 'unavailable' | 'busy';
  vodTimeSec: number; recordTimeSec?: number; score?: number; margin?: number;
  chatOffsetSec?: number; chatClock?: 'recording' | 'twitch-pdt';
  sampleDurationSec?: number; elapsedMs?: number; reason?: string; retryAfterMs?: number;
};
const SAMPLE_SECONDS = 12;
const MAX_CACHE = 128;

export function comparePcm(reference: Float32Array, candidate: Float32Array): Promise<AudioMatch | null> {
  const query = reference.slice().buffer;
  const data = candidate.slice().buffer;
  return new Promise((resolveResult, reject) => {
    const worker = new Worker(resolve(__dirname, 'audio-sync.worker.js'), {
      workerData: { reference: query, candidate: data }, transferList: [query, data],
    });
    let settled = false;
    const timer = setTimeout(() => finish(new Error('Audio comparison timed out')), 15000);
    function finish(error: Error | null, result: AudioMatch | null = null) {
      if (settled) return; settled = true; clearTimeout(timer); void worker.terminate();
      if (error) reject(error); else resolveResult(result);
    }
    worker.once('message', result => finish(null, result));
    worker.once('error', error => finish(error));
    worker.once('exit', () => { if (!settled) finish(new Error('Audio worker exited')); });
  });
}

export function decodePcm(input: string | Buffer, startSec: number, durationSec: number): Promise<Float32Array> {
  const isBytes = Buffer.isBuffer(input);
  const args = ['-hide_banner', '-loglevel', 'error', '-nostdin', '-threads', '1'];
  if (!isBytes) args.push('-rw_timeout', '15000000', '-ss', startSec.toFixed(3));
  args.push('-i', isBytes ? 'pipe:0' : input as string);
  if (isBytes) args.push('-ss', startSec.toFixed(3));
  args.push('-t', durationSec.toFixed(3), '-map', '0:a:0', '-vn', '-sn', '-dn', '-ac', '1',
    '-ar', String(SAMPLE_RATE), '-f', 'f32le', 'pipe:1');
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args, { stdio: [isBytes ? 'pipe' : 'ignore', 'pipe', 'ignore'] });
    const chunks: Buffer[] = []; let size = 0, settled = false;
    function fail(reason: string) {
      if (settled) return; settled = true; clearTimeout(timer); child.kill('SIGKILL'); reject(new Error(reason));
    }
    const timer = setTimeout(() => fail('Audio extraction timed out'), 25000);
    child.once('error', () => fail('Audio extraction could not start'));
    child.stdout!.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > (durationSec + 1) * SAMPLE_RATE * 4) return fail('Audio extraction exceeded its limit');
      chunks.push(chunk);
    });
    child.once('close', code => {
      if (settled) return; settled = true; clearTimeout(timer);
      if (code !== 0 || size < SAMPLE_RATE * 4) return reject(new Error('Audio sample is unavailable'));
      const bytes = Buffer.concat(chunks), pcm = new Float32Array(Math.floor(bytes.length / 4));
      for (let i = 0; i < pcm.length; i++) pcm[i] = bytes.readFloatLE(i * 4);
      resolve(pcm);
    });
    if (isBytes) { child.stdin!.on('error', () => {}); child.stdin!.end(input); }
  });
}

export function recordingChatClock(raw: string | null, mediaSec: number, spanSec: number, vodStartMs: number, vodSec: number) {
  const map = parseMediaTimeline(raw);
  if (!map || mediaSec < map.points[0].mediaSec) return null;
  let point = map.points[0];
  for (const next of map.points) {
    if (next.mediaSec <= mediaSec) point = next;
    else if (next.mediaSec < mediaSec + spanSec &&
      Math.abs(next.wallClockMs - point.wallClockMs - (next.mediaSec - point.mediaSec) * 1000) > 500) return null;
  }
  return (point.wallClockMs - vodStartMs) / 1000 + mediaSec - point.mediaSec - vodSec;
}

export class BackgroundAudioSync {
  private active = false;
  private cache = new Map<string, { until: number; value: SyncResult }>();
  private pending = new Map<string, Promise<SyncResult>>();
  private metadata = new Map<string, { until: number; value: VodMetadata }>();

  async measure(session: Session, vodId: string, positionSec: number, estimateSec: number): Promise<SyncResult> {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(session.id) || !/^\d{1,20}$/.test(vodId) ||
        !Number.isFinite(positionSec) || positionSec < 0 || positionSec > 86400 ||
        !Number.isFinite(estimateSec) || estimateSec < 0 || estimateSec > 86400) {
      return { status: 'unavailable', vodTimeSec: positionSec, reason: 'Invalid sync position' };
    }
    const vodTimeSec = Math.max(0, Math.floor(positionSec / 10) * 10);
    const key = `${session.id}:${vodId}:${vodTimeSec}`;
    const cached = this.cache.get(key);
    if (cached && cached.until > Date.now()) return cached.value;
    const pending = this.pending.get(key);
    if (pending) return pending;
    if (this.active) return { status: 'busy', vodTimeSec, retryAfterMs: 3000 };
    this.active = true;
    const started = Date.now();
    const work = this.run(session, vodId, vodTimeSec, estimateSec + vodTimeSec - positionSec)
      .catch((): SyncResult => ({ status: 'unavailable', vodTimeSec,
        reason: 'Background sample unavailable; no offset was changed' }))
      .then(value => {
        value.elapsedMs = Date.now() - started;
        this.cache.set(key, { until: Date.now() + (value.status === 'matched' ? 600000 : 15000), value });
        while (this.cache.size > MAX_CACHE) this.cache.delete(this.cache.keys().next().value!);
        return value;
      }).finally(() => { this.active = false; this.pending.delete(key); });
    this.pending.set(key, work);
    return work;
  }

  private async run(session: Session, vodId: string, vodTimeSec: number, estimateSec: number): Promise<SyncResult> {
    let meta = this.metadata.get(vodId);
    if (!meta || meta.until < Date.now()) {
      meta = { value: await getVodMetadata(vodId), until: Date.now() + 120000 };
      this.metadata.set(vodId, meta);
      while (this.metadata.size > 32) this.metadata.delete(this.metadata.keys().next().value!);
    }
    const vod = meta.value;
    if (vod.login !== session.channel.twitchLogin.toLowerCase()) throw new Error('Foreign channel');
    const sessionStart = (session.startedAt || session.createdAt).getTime();
    const sessionEnd = session.endedAt?.getTime() || session.createdAt.getTime() + (session.durationSec || 0) * 1000;
    if (sessionStart > vod.createdAtMs + vod.durationSec * 1000 || sessionEnd < vod.createdAtMs) throw new Error('Foreign broadcast');
    if (vodTimeSec + SAMPLE_SECONDS > vod.durationSec) return { status: 'unavailable', vodTimeSec, reason: 'Too close to VOD end' };
    const segments = parseVodPlaylist((await boundedFetch(vod.playlistUrl, 12_000_000)).toString(), vod.playlistUrl);
    const window = selectVodWindow(segments, vodTimeSec, SAMPLE_SECONDS);
    const bytes = await Promise.all(window.segments.map(s => boundedFetch(s.url, 2_000_000)));
    const reference = await decodePcm(Buffer.concat(bytes), window.skipSec, SAMPLE_SECONDS);
    const base: SyncResult = { status: 'unmatched', vodTimeSec, sampleDurationSec: SAMPLE_SECONDS };
    if (window.wallAtStartMs !== null) {
      base.chatOffsetSec = (window.wallAtStartMs - vod.createdAtMs) / 1000 - vodTimeSec;
      base.chatClock = 'twitch-pdt';
    }
    let energy = 0;
    for (const sample of reference) energy += sample * sample;
    if (energy / reference.length < 1e-8) return { ...base, reason: 'Original audio is silent' };
    const port = Number(process.env.PORT || 3001);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid API port');
    const sourceOrigin = process.env.TSR_SOURCE_API_ORIGIN || `http://127.0.0.1:${port}`;
    const recordingUrl = new URL(`/api/public/streams/${session.id}/audio`, sourceOrigin).href;
    // Search nearby first, then expand for a delay toggle up to two minutes.
    for (const radius of [12, 120]) {
      const recordStart = Math.max(0, estimateSec - radius);
      const length = Math.min(estimateSec + radius + SAMPLE_SECONDS, session.durationSec || 86400) - recordStart;
      if (length < SAMPLE_SECONDS) continue;
      const candidate = await decodePcm(recordingUrl, recordStart, length);
      const match = await comparePcm(reference, candidate);
      if (!match?.matched) { if (match) { base.score = match.score; base.margin = match.margin; } continue; }
      const recordTimeSec = recordStart + match.offsetSec;
      const chatOffsetSec = recordingChatClock(session.mediaTimelineJson, recordTimeSec, SAMPLE_SECONDS, vod.createdAtMs, vodTimeSec);
      return { ...base, status: 'matched', recordTimeSec, score: match.score, margin: match.margin,
        ...(chatOffsetSec === null ? {} : { chatOffsetSec, chatClock: 'recording' as const }) };
    }
    return { ...base, reason: 'No unique audio match; audio offset was left unchanged' };
  }
}

export const backgroundAudioSync = new BackgroundAudioSync();
