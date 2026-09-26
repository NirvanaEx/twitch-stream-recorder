// sidecar/server.ts
var import_node_http = require("node:http");
var import_node_fs = require("node:fs");
var import_node_path2 = require("node:path");
var import_client = require("@prisma/client");

// apps/api/src/modules/public/background-audio-sync.ts
var import_node_child_process = require("node:child_process");

// apps/api/src/modules/public/audio-fingerprint.ts
var SAMPLE_RATE = 8e3;

// apps/api/src/modules/public/background-audio-sync.ts
var import_node_worker_threads = require("node:worker_threads");
var import_node_path = require("node:path");

// apps/api/src/modules/public/twitch-sync-source.ts
var CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";
function twitchMediaUrl(raw, base) {
  const url = new URL(raw, base);
  if (url.protocol !== "https:" || url.username || url.password || url.port && url.port !== "443" || ![".ttvnw.net", ".cloudfront.net", ".twitch.tv"].some((suffix) => url.hostname.endsWith(suffix))) {
    throw new Error("Unsupported Twitch media host");
  }
  return url.href;
}
async function boundedFetch(url, limit, init = {}) {
  const response = await fetch(url, { ...init, redirect: "error", signal: AbortSignal.timeout(12e3) });
  if (!response.ok || !response.body) throw new Error(`Source returned HTTP ${response.status}`);
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error("Source response is too large");
      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    await reader.cancel().catch(() => {
    });
    throw error;
  }
  return Buffer.concat(chunks);
}
async function getVodMetadata(vodId) {
  if (!/^\d{1,20}$/.test(vodId)) throw new Error("Invalid VOD ID");
  const query = `query($id:ID!){video(id:$id){owner{login} createdAt lengthSeconds} videoPlaybackAccessToken(id:$id,params:{platform:"web",playerBackend:"mediaplayer",playerType:"site"}){value signature}}`;
  const payload = JSON.parse((await boundedFetch("https://gql.twitch.tv/gql", 2e5, {
    method: "POST",
    headers: { "Client-ID": CLIENT_ID, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id: vodId } })
  })).toString());
  const video = payload.data?.video, token = payload.data?.videoPlaybackAccessToken;
  if (!video || !token?.value || !token.signature) throw new Error("Twitch VOD is unavailable");
  const master = new URL(`https://usher.ttvnw.net/vod/${vodId}.m3u8`);
  master.search = new URLSearchParams({
    nauth: token.value,
    nauthsig: token.signature,
    allow_source: "true",
    allow_audio_only: "true",
    player: "twitchweb"
  }).toString();
  const playlist = (await boundedFetch(master.href, 5e5)).toString();
  const audio = playlist.split(/\r?\n/).find((line) => /^https:/.test(line) && new URL(line).pathname.includes("/audio_only/"));
  if (!audio) throw new Error("Twitch audio-only stream is unavailable");
  const result = {
    login: String(video.owner?.login || "").toLowerCase(),
    createdAtMs: Date.parse(video.createdAt),
    durationSec: Number(video.lengthSeconds),
    playlistUrl: twitchMediaUrl(audio)
  };
  if (!Number.isFinite(result.createdAtMs) || !(result.durationSec > 0)) throw new Error("Invalid VOD clock");
  return result;
}
function parseVodPlaylist(text, base) {
  if (!text.startsWith("#EXTM3U")) throw new Error("Invalid Twitch playlist");
  let startSec = 0, durationSec = 0, wallMs = null, discontinuity = 0;
  const segments = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("#EXT-X-KEY:") && !line.includes("METHOD=NONE")) throw new Error("Encrypted VOD is unsupported");
    if (line.startsWith("#EXT-X-MAP:")) throw new Error("This VOD segment format is unsupported");
    if (line === "#EXT-X-DISCONTINUITY") {
      discontinuity++;
      wallMs = null;
    }
    if (line.startsWith("#EXT-X-PROGRAM-DATE-TIME:")) {
      const parsed = Date.parse(line.slice(25));
      wallMs = Number.isFinite(parsed) ? parsed : null;
    }
    if (line.startsWith("#EXTINF:")) durationSec = Number.parseFloat(line.slice(8));
    else if (line && !line.startsWith("#")) {
      if (!(durationSec > 0 && durationSec <= 30) || segments.length > 5e4) throw new Error("Invalid VOD segment");
      segments.push({ url: twitchMediaUrl(line, base), startSec, durationSec, wallMs, discontinuity });
      startSec += durationSec;
      if (wallMs !== null) wallMs += durationSec * 1e3;
      durationSec = 0;
    }
  }
  return segments;
}
function selectVodWindow(segments, start, duration) {
  const selected = segments.filter((s) => s.startSec < start + duration && s.startSec + s.durationSec > start);
  if (!selected.length || selected[0].startSec > start + 1e-3 || selected.at(-1).startSec + selected.at(-1).durationSec < start + duration - 0.05) throw new Error("VOD window is incomplete");
  const first = selected[0];
  for (const segment of selected) {
    if (segment.discontinuity !== first.discontinuity) throw new Error("Delay changed inside the VOD sample");
    if (first.wallMs !== null && segment.wallMs !== null && Math.abs(segment.wallMs - first.wallMs - (segment.startSec - first.startSec) * 1e3) > 500) throw new Error("VOD clock jumps inside the sample");
  }
  return {
    segments: selected,
    skipSec: start - first.startSec,
    wallAtStartMs: first.wallMs === null ? null : first.wallMs + (start - first.startSec) * 1e3
  };
}

// apps/api/src/modules/recording/media-timeline.ts
function parseMediaTimeline(raw) {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Number.isFinite(value.captureAnchorMs) || !Array.isArray(value.points) || !value.points.length || value.points.length > 1e4) return null;
    for (let i = 0; i < value.points.length; i++) {
      const p = value.points[i];
      const previous = value.points[i - 1];
      if (!p || !Number.isFinite(p.mediaSec) || !Number.isFinite(p.wallClockMs) || previous && (p.mediaSec <= previous.mediaSec || p.wallClockMs <= previous.wallClockMs)) return null;
    }
    return value;
  } catch {
    return null;
  }
}

// apps/api/src/modules/public/background-audio-sync.ts
var SAMPLE_SECONDS = 12;
var MAX_CACHE = 128;
function comparePcm(reference, candidate) {
  const query = reference.slice().buffer;
  const data = candidate.slice().buffer;
  return new Promise((resolveResult, reject) => {
    const worker = new import_node_worker_threads.Worker((0, import_node_path.resolve)(__dirname, "audio-sync.worker.js"), {
      workerData: { reference: query, candidate: data },
      transferList: [query, data]
    });
    let settled = false;
    const timer = setTimeout(() => finish(new Error("Audio comparison timed out")), 15e3);
    function finish(error, result = null) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      if (error) reject(error);
      else resolveResult(result);
    }
    worker.once("message", (result) => finish(null, result));
    worker.once("error", (error) => finish(error));
    worker.once("exit", () => {
      if (!settled) finish(new Error("Audio worker exited"));
    });
  });
}
function decodePcm(input, startSec, durationSec) {
  const isBytes = Buffer.isBuffer(input);
  const args = ["-hide_banner", "-loglevel", "error", "-nostdin", "-threads", "1"];
  if (!isBytes) args.push("-rw_timeout", "15000000", "-ss", startSec.toFixed(3));
  args.push("-i", isBytes ? "pipe:0" : input);
  if (isBytes) args.push("-ss", startSec.toFixed(3));
  args.push(
    "-t",
    durationSec.toFixed(3),
    "-map",
    "0:a:0",
    "-vn",
    "-sn",
    "-dn",
    "-ac",
    "1",
    "-ar",
    String(SAMPLE_RATE),
    "-f",
    "f32le",
    "pipe:1"
  );
  return new Promise((resolve3, reject) => {
    const child = (0, import_node_child_process.spawn)("ffmpeg", args, { stdio: [isBytes ? "pipe" : "ignore", "pipe", "ignore"] });
    const chunks = [];
    let size = 0, settled = false;
    function fail(reason) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill("SIGKILL");
      reject(new Error(reason));
    }
    const timer = setTimeout(() => fail("Audio extraction timed out"), 25e3);
    child.once("error", () => fail("Audio extraction could not start"));
    child.stdout.on("data", (chunk) => {
      size += chunk.length;
      if (size > (durationSec + 1) * SAMPLE_RATE * 4) return fail("Audio extraction exceeded its limit");
      chunks.push(chunk);
    });
    child.once("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code !== 0 || size < SAMPLE_RATE * 4) return reject(new Error("Audio sample is unavailable"));
      const bytes = Buffer.concat(chunks), pcm = new Float32Array(Math.floor(bytes.length / 4));
      for (let i = 0; i < pcm.length; i++) pcm[i] = bytes.readFloatLE(i * 4);
      resolve3(pcm);
    });
    if (isBytes) {
      child.stdin.on("error", () => {
      });
      child.stdin.end(input);
    }
  });
}
function recordingChatClock(raw, mediaSec, spanSec, vodStartMs, vodSec) {
  const map = parseMediaTimeline(raw);
  if (!map || mediaSec < map.points[0].mediaSec) return null;
  let point = map.points[0];
  for (const next of map.points) {
    if (next.mediaSec <= mediaSec) point = next;
    else if (next.mediaSec < mediaSec + spanSec && Math.abs(next.wallClockMs - point.wallClockMs - (next.mediaSec - point.mediaSec) * 1e3) > 500) return null;
  }
  return (point.wallClockMs - vodStartMs) / 1e3 + mediaSec - point.mediaSec - vodSec;
}
var BackgroundAudioSync = class {
  active = false;
  cache = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Map();
  metadata = /* @__PURE__ */ new Map();
  async measure(session, vodId, positionSec, estimateSec) {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(session.id) || !/^\d{1,20}$/.test(vodId) || !Number.isFinite(positionSec) || positionSec < 0 || positionSec > 86400 || !Number.isFinite(estimateSec) || estimateSec < 0 || estimateSec > 86400) {
      return { status: "unavailable", vodTimeSec: positionSec, reason: "Invalid sync position" };
    }
    const vodTimeSec = Math.max(0, Math.floor(positionSec / 10) * 10);
    const key = `${session.id}:${vodId}:${vodTimeSec}`;
    const cached = this.cache.get(key);
    if (cached && cached.until > Date.now()) return cached.value;
    const pending = this.pending.get(key);
    if (pending) return pending;
    if (this.active) return { status: "busy", vodTimeSec, retryAfterMs: 3e3 };
    this.active = true;
    const started = Date.now();
    const work = this.run(session, vodId, vodTimeSec, estimateSec + vodTimeSec - positionSec).catch(() => ({
      status: "unavailable",
      vodTimeSec,
      reason: "Background sample unavailable; no offset was changed"
    })).then((value) => {
      value.elapsedMs = Date.now() - started;
      this.cache.set(key, { until: Date.now() + (value.status === "matched" ? 6e5 : 15e3), value });
      while (this.cache.size > MAX_CACHE) this.cache.delete(this.cache.keys().next().value);
      return value;
    }).finally(() => {
      this.active = false;
      this.pending.delete(key);
    });
    this.pending.set(key, work);
    return work;
  }
  async run(session, vodId, vodTimeSec, estimateSec) {
    let meta = this.metadata.get(vodId);
    if (!meta || meta.until < Date.now()) {
      meta = { value: await getVodMetadata(vodId), until: Date.now() + 12e4 };
      this.metadata.set(vodId, meta);
      while (this.metadata.size > 32) this.metadata.delete(this.metadata.keys().next().value);
    }
    const vod = meta.value;
    if (vod.login !== session.channel.twitchLogin.toLowerCase()) throw new Error("Foreign channel");
    const sessionStart = (session.startedAt || session.createdAt).getTime();
    const sessionEnd = session.endedAt?.getTime() || session.createdAt.getTime() + (session.durationSec || 0) * 1e3;
    if (sessionStart > vod.createdAtMs + vod.durationSec * 1e3 || sessionEnd < vod.createdAtMs) throw new Error("Foreign broadcast");
    if (vodTimeSec + SAMPLE_SECONDS > vod.durationSec) return { status: "unavailable", vodTimeSec, reason: "Too close to VOD end" };
    const segments = parseVodPlaylist((await boundedFetch(vod.playlistUrl, 12e6)).toString(), vod.playlistUrl);
    const window = selectVodWindow(segments, vodTimeSec, SAMPLE_SECONDS);
    const bytes = await Promise.all(window.segments.map((s) => boundedFetch(s.url, 2e6)));
    const reference = await decodePcm(Buffer.concat(bytes), window.skipSec, SAMPLE_SECONDS);
    const base = { status: "unmatched", vodTimeSec, sampleDurationSec: SAMPLE_SECONDS };
    if (window.wallAtStartMs !== null) {
      base.chatOffsetSec = (window.wallAtStartMs - vod.createdAtMs) / 1e3 - vodTimeSec;
      base.chatClock = "twitch-pdt";
    }
    let energy = 0;
    for (const sample of reference) energy += sample * sample;
    if (energy / reference.length < 1e-8) return { ...base, reason: "Original audio is silent" };
    const port = Number(process.env.PORT || 3001);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid API port");
    const sourceOrigin = process.env.TSR_SOURCE_API_ORIGIN || `http://127.0.0.1:${port}`;
    const recordingUrl = new URL(`/api/public/streams/${session.id}/audio`, sourceOrigin).href;
    for (const radius of [12, 120]) {
      const recordStart = Math.max(0, estimateSec - radius);
      const length = Math.min(estimateSec + radius + SAMPLE_SECONDS, session.durationSec || 86400) - recordStart;
      if (length < SAMPLE_SECONDS) continue;
      const candidate = await decodePcm(recordingUrl, recordStart, length);
      const match = await comparePcm(reference, candidate);
      if (!match?.matched) {
        if (match) {
          base.score = match.score;
          base.margin = match.margin;
        }
        continue;
      }
      const recordTimeSec = recordStart + match.offsetSec;
      const chatOffsetSec = recordingChatClock(session.mediaTimelineJson, recordTimeSec, SAMPLE_SECONDS, vod.createdAtMs, vodTimeSec);
      return {
        ...base,
        status: "matched",
        recordTimeSec,
        score: match.score,
        margin: match.margin,
        ...chatOffsetSec === null ? {} : { chatOffsetSec, chatClock: "recording" }
      };
    }
    return { ...base, reason: "No unique audio match; audio offset was left unchanged" };
  }
};
var backgroundAudioSync = new BackgroundAudioSync();

// sidecar/payload-origin.ts
var CANONICAL_ORIGIN = "https://stream.neyron.site";
var LEGACY_ORIGIN = "http://193.160.119.15:9000";
function resolvePayloadOrigin(requestUrl, host) {
  const url = new URL(requestUrl, CANONICAL_ORIGIN);
  const requested = url.searchParams.get("origin")?.replace(/\/+$/, "");
  if (requested === CANONICAL_ORIGIN || requested === LEGACY_ORIGIN) return requested;
  return host === "193.160.119.15:9000" ? LEGACY_ORIGIN : CANONICAL_ORIGIN;
}

// sidecar/server.ts
var database = new URL(process.env.DATABASE_URL);
database.searchParams.set("connection_limit", "2");
var prisma = new import_client.PrismaClient({ datasources: { db: { url: database.href } } });
var engine = new BackgroundAudioSync();
var payloads = /* @__PURE__ */ new Map([
  [CANONICAL_ORIGIN, (0, import_node_fs.readFileSync)((0, import_node_path2.resolve)(__dirname, "twitch-audio.payload.js"))],
  [LEGACY_ORIGIN, (0, import_node_fs.readFileSync)((0, import_node_path2.resolve)(__dirname, "twitch-audio.legacy.payload.js"))]
]);
var version = process.env.TSR_SYNC_VERSION || "20260923-background";
var server = (0, import_node_http.createServer)(async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-TSR-Sync-Version", version);
  const json = (status, value) => {
    response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(value));
  };
  try {
    if (request.method !== "GET") return json(405, { error: "GET required" });
    const url = new URL(request.url || "/", "http://localhost");
    if (url.pathname === "/health") return json(200, { ok: true, service: "tsr-sync", version });
    if (url.pathname === "/twitch-audio.payload.js") {
      response.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
      response.end(payloads.get(resolvePayloadOrigin(request.url || "/", request.headers.host)));
      return;
    }
    const match = /^\/api\/public\/streams\/([a-zA-Z0-9_-]{1,80})\/audio-sync$/.exec(url.pathname);
    if (!match) return json(404, { error: "Not found" });
    const vod = url.searchParams.get("vod") || "";
    const position = Number(url.searchParams.get("position"));
    const estimate = Number(url.searchParams.get("estimate"));
    if (!/^\d{1,20}$/.test(vod) || !url.searchParams.has("position") || !url.searchParams.has("estimate") || !Number.isFinite(position) || position < 0 || position > 86400 || !Number.isFinite(estimate) || estimate < 0 || estimate > 86400) return json(400, { error: "Invalid position" });
    const session = await prisma.streamSession.findUnique({ where: { id: match[1] }, select: {
      id: true,
      durationSec: true,
      mediaTimelineJson: true,
      createdAt: true,
      startedAt: true,
      endedAt: true,
      status: true,
      audioDeletedAt: true,
      channel: { select: { twitchLogin: true } }
    } });
    if (!session || session.status !== "completed" || session.audioDeletedAt) return json(404, { error: "Audio not found" });
    json(200, await engine.measure(session, vod, position, estimate));
  } catch {
    json(503, { status: "unavailable", reason: "Background sync unavailable; no offset changed" });
  }
});
server.listen(Number(process.env.PORT || 3002), "0.0.0.0", () => console.log(`tsr-sync ${version} ready`));
process.on("SIGTERM", () => {
  server.close();
  void prisma.$disconnect().finally(() => process.exit(0));
});
