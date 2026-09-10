import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GifMirrorService } from "./gif-mirror.service";
import { gifSourceKey, gifSourceUrls } from "./chat-gifs.utils";

const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
const source = "https://media4.giphy.com/media/test/giphy.gif?cid=original&rid=giphy.gif&ct=g";
const tag = (url = source) => `0-15|test|${url}`;

async function fixture(run: (service: GifMirrorService, dir: string) => Promise<void>, prisma: any = { chatMessage: { findMany: async () => [] } }) {
  const previousDir = process.env.DATA_DIR;
  const previousFetch = globalThis.fetch;
  const dir = mkdtempSync(join(tmpdir(), "tsr-gifs-"));
  process.env.DATA_DIR = dir;
  const service = new GifMirrorService(prisma);
  try { await run(service, dir); }
  finally {
    service.onModuleDestroy();
    globalThis.fetch = previousFetch;
    if (previousDir === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = previousDir;
    rmSync(dir, { recursive: true, force: true });
  }
}

test("GIF bytes survive provider deletion and service recreation; snapshots deduplicate URL variants", async () => {
  await fixture(async (service, dir) => {
    const other = source + "&client=second";
    const requested: string[] = [];
    globalThis.fetch = async (input, options) => {
      requested.push(String(input));
      assert.equal(options?.redirect, "manual");
      return new Response(gif, { headers: { "Content-Type": "image/gif" } });
    };
    await Promise.all([service.ensure(source), service.ensure(source), service.ensure(other)]);
    assert.deepEqual(requested.sort(), [source, other].sort());
    assert.equal(readdirSync(join(dir, "chat-gifs", "files")).length, 1);
    assert.equal(readdirSync(join(dir, "chat-gifs", "index")).length, 2);
    const file = service.resolveFile(gifSourceKey(source))!;
    assert.deepEqual(readFileSync(file.path), gif);
    globalThis.fetch = async () => { throw new Error("provider deleted it"); };
    const restarted = new GifMirrorService({} as never);
    const bundle = await restarted.buildBundleAssets([tag(), tag(), tag(other)]);
    assert.deepEqual(bundle.missing, []);
    assert.equal(Object.keys(bundle.assets).length, 1);
    assert.equal(bundle.sources[source], bundle.sources[other]);
    assert.deepEqual(Buffer.from(Object.values(bundle.assets)[0].split(",")[1], "base64"), gif);
    assert.equal(restarted.resolveFile("../../etc/passwd"), null);
    assert.equal(restarted.resolveFile("a".repeat(64)), null);
  });
});

test("failed captures persist a retry and report missing assets instead of pretending to be offline", async () => {
  await fixture(async (service, dir) => {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return new Response("missing", { status: 404 }); };
    await service.ensure(source);
    const bundle = await service.buildBundleAssets([tag()]);
    assert.equal(calls, 1, "backoff also applies to bundle downloads");
    assert.deepEqual(bundle.assets, {});
    assert.match(bundle.missing[0].reason, /404/);
    const path = join(dir, "chat-gifs", "index", `${gifSourceKey(source)}.json`);
    const record = JSON.parse(readFileSync(path, "utf8"));
    assert.ok(record.nextAttemptAt > Date.now());
    record.nextAttemptAt = 0;
    writeFileSync(path, JSON.stringify(record));
    globalThis.fetch = async () => new Response(gif);
    const restarted = new GifMirrorService({} as never);
    await restarted.ensure(source);
    assert.ok(restarted.resolveFile(gifSourceKey(source)));
  });
});

test("untrusted source URLs and redirect destinations are never requested", async () => {
  await fixture(async (service) => {
    const calls: string[] = [];
    globalThis.fetch = async (input) => {
      calls.push(String(input));
      return new Response(null, { status: 302, headers: { location: "http://127.0.0.1/private" } });
    };
    for (const url of ["http://media.giphy.com/a", "https://example.com/a", "https://media.giphy.com:123/a", "https://media.giphy.com@localhost/a"]) {
      await service.ensure(url);
      assert.deepEqual(gifSourceUrls(tag(url)), []);
    }
    await service.ensure(source);
    assert.deepEqual(calls, [source]);
    assert.equal(service.resolveFile(gifSourceKey(source)), null);
  });
});

test("redirects inside the media allowlist preserve the saved original URL", async () => {
  await fixture(async (service) => {
    const redirected = "https://i.giphy.com/test.gif?tracking=unchanged";
    globalThis.fetch = async (input) => String(input) === source
      ? new Response(null, { status: 302, headers: { location: redirected } })
      : (assert.equal(String(input), redirected), new Response(gif));
    await service.ensure(source);
    assert.ok(service.resolveFile(gifSourceKey(source)));
    assert.equal(service.resolveFile(gifSourceKey(redirected)), null);
  });
});

test("HTML and SVG returned as successful images cannot become public archived files", async () => {
  await fixture(async (service, dir) => {
    for (const [index, bytes] of ["<html><script>alert(1)</script>", "<svg onload='alert(1)'/>"] .entries()) {
      globalThis.fetch = async () => new Response(bytes, { headers: { "Content-Type": "image/gif" } });
      const url = source + "&bad=" + index;
      await service.ensure(url);
      assert.equal(service.resolveFile(gifSourceKey(url)), null);
    }
    assert.deepEqual(readdirSync(join(dir, "chat-gifs", "files")), []);
  });
});

test("chunked oversized responses stop at the limit and leave no partial image", async () => {
  await fixture(async (service, dir) => {
    let cancelled = false;
    let sent = 0;
    globalThis.fetch = async () => new Response(new ReadableStream({
      pull(controller) { sent++; controller.enqueue(new Uint8Array(1024 * 1024)); },
      cancel() { cancelled = true; },
    }));
    await service.ensure(source);
    assert.equal(cancelled, true);
    assert.ok(sent <= 28);
    assert.deepEqual(readdirSync(join(dir, "chat-gifs", "files")), []);
    assert.equal(service.resolveFile(gifSourceKey(source)), null);
  });
});

test("export and background capture share a maximum of two concurrent downloads", async () => {
  await fixture(async (service) => {
    let active = 0;
    let maxActive = 0;
    globalThis.fetch = async () => {
      active++;
      maxActive = Math.max(active, maxActive);
      await new Promise((done) => setTimeout(done, 5));
      active--;
      return new Response(gif);
    };
    const urls = Array.from({ length: 9 }, (_, index) => source + "&item=" + index);
    service.enqueue(tag(urls[0]));
    const bundle = await service.buildBundleAssets(urls.map(tag));
    assert.equal(maxActive, 2);
    assert.equal(Object.keys(bundle.sources).length, 9);
    assert.equal(Object.keys(bundle.assets).length, 1);
  });
});

test("startup backfill paginates URL-only history without trying to guess caption-only messages", async () => {
  const calls: any[] = [];
  const prisma = { chatMessage: { findMany: async (query: any) => {
    calls.push(query);
    return calls.length === 1
      ? Array.from({ length: 250 }, (_, index) => ({ id: String(index), gifsJson: JSON.stringify(tag()) }))
      : [{ id: "last", gifsJson: null }];
  } } };
  await fixture(async (service) => {
    globalThis.fetch = async () => new Response(gif);
    await (service as any).backfill();
    await service.ensure(source);
    assert.ok(service.resolveFile(gifSourceKey(source)));
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1].cursor, { id: "249" });
    assert.equal(calls[1].skip, 1);
  }, prisma);
});
