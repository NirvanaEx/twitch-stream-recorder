import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer, request, type Server } from "node:http";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RecordingService } from "../modules/recording/recording.service";
import { TelegramService } from "../modules/telegram/telegram.service";
import { ArchiveStorageService } from "../modules/archive-storage/archive-storage.service";
import { GifMirrorService } from "../modules/chat/gif-mirror.service";
import { ChannelsService } from "../modules/channels/channels.service";
import { AuthService } from "../modules/auth/auth.service";
import { TelegramClientService } from "../modules/telegram/telegram-client.service";
import { recorderProxy, isRecorderRequest } from "./recorder-proxy";
import { runtimeRole } from "./role";

test("API startup/restart never recovers sessions, deletes upload temp files, starts jobs or creates accounts", async () => {
  const previousRole = process.env.TSR_ROLE;
  const previousDir = process.env.DATA_DIR;
  const dir = mkdtempSync(join(tmpdir(), "tsr-isolation-"));
  process.env.TSR_ROLE = "api";
  process.env.DATA_DIR = dir;
  mkdirSync(join(dir, "tmp", "telegram"), { recursive: true });
  const uploading = join(dir, "tmp", "telegram", "active-upload.part");
  writeFileSync(uploading, "still uploading");
  const forbidden = new Proxy({}, { get: (_, key) => { throw new Error(`API touched a worker dependency: ${String(key)}`); } });
  try {
    for (let restart = 0; restart < 3; restart++) {
      for (const Service of [RecordingService, TelegramService, ArchiveStorageService, GifMirrorService, ChannelsService, AuthService]) {
        const service = Reflect.construct(Service, Array(12).fill(forbidden));
        await service.onModuleInit();
        if (service.onModuleDestroy) await service.onModuleDestroy();
      }
      assert.equal(readFileSync(uploading, "utf8"), "still uploading");
    }
    const recording = Reflect.construct(RecordingService, Array(12).fill(forbidden));
    await assert.rejects(recording.startRecording("channel"), /recorder service/);
    await assert.rejects(recording.stopRecording("channel"), /recorder service/);
    await assert.rejects(recording.syncAllChannels(), /recorder service/);
    await assert.rejects(recording.deleteArchive("session"), /recorder service/);
    const telegram = new TelegramClientService(forbidden as any);
    await assert.rejects(telegram.getClient(), /recorder service/);
  } finally {
    if (previousRole === undefined) delete process.env.TSR_ROLE; else process.env.TSR_ROLE = previousRole;
    if (previousDir === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = previousDir;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("production cannot silently start another recorder through a missing/mistyped role", () => {
  assert.throws(() => runtimeRole({ NODE_ENV: "production" }), /explicitly/);
  assert.throws(() => runtimeRole({ TSR_ROLE: "aip" }), /explicitly/);
  assert.equal(runtimeRole({ TSR_ROLE: "api" }), "api");
  assert.equal(runtimeRole({ TSR_ROLE: "recorder" }), "recorder");
});

async function listen(server: Server) {
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  return new URL(`http://127.0.0.1:${address.port}`);
}
async function close(server: Server) {
  server.closeAllConnections();
  await new Promise<void>((done) => server.close(() => done()));
}
async function call(origin: URL, path: string, method = "GET", body?: string, headers: Record<string, string> = {}) {
  return new Promise<{ status: number; body: string; headers: any }>((done, reject) => {
    const req = request(new URL(path, origin), { method, headers }, (res) => {
      const parts: Buffer[] = [];
      res.on("data", (data) => parts.push(data));
      res.on("end", () => done({ status: res.statusCode!, body: Buffer.concat(parts).toString(), headers: res.headers }));
    });
    req.on("error", reject); req.end(body);
  });
}

test("recorder state, original auth and command body survive replacing API; uncertain writes are never retried", async () => {
  let starts = 0;
  let acceptedBody = "";
  let receivedAuth = "";
  const capture = { id: "persistent-session", bytes: 100 };
  const recorder = createServer((req, res) => {
    if (req.url === "/api/recording/active") { res.end(JSON.stringify(capture)); return; }
    if (req.url === "/api/channels/test/start") {
      receivedAuth = String(req.headers.authorization);
      if (receivedAuth !== "Bearer viewer") { res.writeHead(401); res.end("Unauthorized"); return; }
      req.on("data", (data) => { acceptedBody += data; });
      req.on("end", () => { starts++; res.destroy(); }); // accepted command, lost acknowledgement
      return;
    }
    if (req.url === "/api/public/streams/session/audio") {
      assert.equal(req.headers.range, "bytes=0-3");
      res.writeHead(206, { "Content-Range": "bytes 0-3/10", ETag: '"unchanged"' }); res.end("1234"); return;
    }
    res.writeHead(404); res.end();
  });
  const origin = await listen(recorder);
  let api: Server | undefined;
  try {
    for (let deployment = 0; deployment < 3; deployment++) {
      const proxy = recorderProxy(origin);
      api = createServer((req, res) => proxy(req, res, () => { res.end("API catalog"); }));
      const apiOrigin = await listen(api);
      capture.bytes += 100;
      const state = await call(apiOrigin, "/api/recording/active");
      assert.deepEqual(JSON.parse(state.body), capture);
      const denied = await call(apiOrigin, "/api/channels/test/start", "POST", "{}");
      assert.equal(denied.status, 401);
      const uncertain = await call(apiOrigin, "/api/channels/test/start", "POST", '{"recordAudio":true}', { Authorization: "Bearer viewer", "Content-Type": "application/json" });
      assert.equal(uncertain.status, 503);
      assert.equal(starts, deployment + 1);
      assert.equal(acceptedBody, '{"recordAudio":true}'.repeat(deployment + 1));
      assert.equal(receivedAuth, "Bearer viewer");
      const media = await call(apiOrigin, "/api/public/streams/session/audio", "GET", undefined, { Range: "bytes=0-3" });
      assert.equal(media.status, 206); assert.equal(media.body, "1234"); assert.equal(media.headers.etag, '"unchanged"');
      await close(api); api = undefined;
    }
    await close(recorder);
    const proxy = recorderProxy(origin);
    api = createServer((req, res) => proxy(req, res, () => res.end("catalog still available")));
    const apiOrigin = await listen(api);
    assert.equal((await call(apiOrigin, "/api/recording/active")).status, 503);
    assert.equal((await call(apiOrigin, "/api/public/streams")).body, "catalog still available");
    assert.equal(capture.id, "persistent-session");
    assert.equal(starts, 3);
  } finally { if (api) await close(api); if (recorder.listening) await close(recorder); }
});

test("all stateful command, export and media routes retain a single owner", () => {
  for (const path of ["/api/channels", "/api/channels/a/start", "/api/channels/a/stop", "/api/channels/a/sync", "/api/archives/a/audio", "/api/storage/disk/cleanup", "/api/archive-storage/sweep"]) {
    assert.ok(isRecorderRequest("POST", path), path);
  }
  for (const path of ["/api/recording/active", "/api/telegram/storage", "/api/public/streams/a/audio?x=1", "/api/archives/a/bundle", "/api/archives/a/stream-stats", "/api/public/streams/a/emotes/live"]) {
    assert.ok(isRecorderRequest("GET", path), path);
  }
  for (const path of ["/api/health", "/api/channels", "/api/public/streams", "/api/public/streams/a/chat", "/api/auth/me"]) {
    assert.equal(isRecorderRequest("GET", path), false, path);
  }
});
