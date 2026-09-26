import assert from "node:assert/strict";
import { test } from "node:test";
import { ChunkTimeoutError, DownloadAbortedError, TelegramChunkScheduler } from "./telegram-chunk-scheduler";

const turn = () => new Promise<void>((resolve) => setImmediate(resolve));
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function setup(parallelism = 1, timeoutMs = 5000) {
  const cache = new Map<string, Buffer>();
  let bytes = 0;
  const scheduler = new TelegramChunkScheduler({
    parallelism: () => parallelism, timeoutMs: () => timeoutMs,
    cacheGet: (key) => cache.get(key) ?? null,
    cachePut: (key, buffer) => { cache.set(key, buffer); return true; },
    downloaded: (count) => { bytes += count; }, recoveryFailed: () => {},
  });
  return { scheduler, cache, bytes: () => bytes };
}
const block = Buffer.alloc(512 * 1024, 19);

test("overlapping consumers share a single download and count its bytes once", async () => {
  const { scheduler, bytes } = setup();
  const request = deferred<Buffer>();
  let calls = 0;
  const load = () => { calls++; return request.promise; };
  const a = scheduler.read("x:0", new AbortController().signal, load, async () => {});
  const b = scheduler.read("x:0", new AbortController().signal, load, async () => {});
  request.resolve(block);
  const results = await Promise.all([a, b]);
  assert.equal(calls, 1);
  assert.equal(bytes(), block.length);
  assert.equal(results.reduce((n, result) => n + result.downloadedBytes, 0), block.length);
  assert.ok(results.every((result) => result.buffer.equals(block)));
});

test("an aborted RPC retains its real slot; a seek cannot exceed the budget", async () => {
  const { scheduler, cache } = setup();
  const first = deferred<Buffer>(), second = deferred<Buffer>();
  const controller = new AbortController();
  const a = scheduler.read("x:0", controller.signal, () => first.promise, async () => {});
  const rejected = assert.rejects(a, DownloadAbortedError);
  controller.abort();
  await rejected;
  let calls = 0;
  const b = scheduler.read("y:0", new AbortController().signal, () => { calls++; return second.promise; }, async () => {});
  assert.equal(scheduler.activeDownloads, 1);
  assert.equal(scheduler.queuedDownloads, 1);
  assert.equal(calls, 0);
  first.resolve(block);
  await turn();
  assert.ok(cache.get("x:0")!.equals(block));
  assert.equal(calls, 1);
  second.resolve(block);
  await b;
  assert.equal(scheduler.activeDownloads, 0);
});

test("aborted queued work is removed without starting Telegram requests", async () => {
  const { scheduler } = setup();
  const active = deferred<Buffer>();
  const a = scheduler.read("a", new AbortController().signal, () => active.promise, async () => {});
  const controller = new AbortController();
  let calls = 0;
  const b = scheduler.read("b", controller.signal, async () => { calls++; return block; }, async () => {});
  const rejected = assert.rejects(b, DownloadAbortedError);
  controller.abort();
  await rejected;
  active.resolve(block);
  await a;
  assert.equal(calls, 0);
  assert.equal(scheduler.queuedDownloads, 0);
});

test("one viewer's abort does not cancel another viewer of the shared chunk", async () => {
  const { scheduler } = setup();
  const pending = deferred<Buffer>();
  const controller = new AbortController();
  const a = scheduler.read("a", controller.signal, () => pending.promise, async () => {});
  const b = scheduler.read("a", new AbortController().signal, async () => { throw new Error("duplicate"); }, async () => {});
  const rejected = assert.rejects(a, DownloadAbortedError);
  controller.abort();
  await rejected;
  pending.resolve(block);
  assert.equal((await b).downloadedBytes, block.length);
});

test("a hung RPC times out for the viewer but holds its slot until real settlement", async () => {
  const { scheduler } = setup(1, 20);
  const pending = deferred<Buffer>();
  let recoveries = 0, nextStarted = false;
  const a = scheduler.read("a", new AbortController().signal, () => pending.promise, async () => { recoveries++; });
  const rejected = assert.rejects(a, ChunkTimeoutError);
  const b = scheduler.read("b", new AbortController().signal, async () => { nextStarted = true; return block; }, async () => {});
  await new Promise((resolve) => setTimeout(resolve, 35));
  await rejected;
  assert.equal(recoveries, 1);
  assert.equal(nextStarted, false);
  assert.equal(scheduler.activeDownloads, 1);
  pending.reject(new Error("transport disconnected"));
  assert.ok((await b).buffer.equals(block));
  assert.equal(scheduler.activeDownloads, 0);
});
