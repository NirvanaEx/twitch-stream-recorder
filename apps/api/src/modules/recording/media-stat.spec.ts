import assert from "node:assert/strict";
import test from "node:test";
import type { Stats } from "node:fs";
import { createMediaStatCache } from "./media-stat";

const file = { isFile: () => true, size: 42 } as Stats;
test("listing stats coalesce slow reads without blocking timers, then expire", async () => {
  let calls = 0, time = 0;
  let done!: (value: Stats) => void;
  const stat = createMediaStatCache(() => { calls++; return new Promise(resolve => { done = resolve; }); }, () => time);
  const first = stat("drive/video.mp4", true);
  const second = stat("drive/video.mp4", true);
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(calls, 1);
  done(file);
  assert.deepEqual(await Promise.all([first, second]), [file, file]);
  assert.equal(await stat("drive/video.mp4", true), file);
  time = 3001;
  const third = stat("drive/video.mp4", true);
  assert.equal(calls, 2);
  done(file); await third;
});

test("serving bypasses listing cache and notices deleted files", async () => {
  let exists = true;
  const stat = createMediaStatCache(async () => {
    if (!exists) throw new Error("ENOENT");
    return file;
  });
  assert.equal(await stat("video", true), file);
  exists = false;
  assert.equal(await stat("video"), null);
});

test("listing cache is bounded even during a crawl", async () => {
  let calls = 0;
  const stat = createMediaStatCache(async () => { calls++; return file; });
  for (let i = 0; i < 257; i++) await stat(String(i), true);
  await stat("256", true); assert.equal(calls, 257);
  await stat("0", true); assert.equal(calls, 258);
});
