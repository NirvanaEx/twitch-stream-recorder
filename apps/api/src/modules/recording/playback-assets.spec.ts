import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getPlaybackAssets, playbackAssetPath } from "./playback-assets";

test("asset route rejects traversal and non-media files", () => {
  const id = "cmqoelw7a2ol4nb01une6t6aa";
  assert.ok(playbackAssetPath(id, "index.m3u8"));
  assert.ok(playbackAssetPath(id, "segment-000000.m4s"));
  for (const name of ["../ready.json", "ready.json", "../init.mp4", "/etc/passwd", "constructor", "__proto__"]) {
    assert.equal(playbackAssetPath(id, name), null);
  }
  assert.equal(playbackAssetPath("../../secret", "init.mp4"), null);
});

test("only completed and unexpired bundles appear in public metadata", async () => {
  const previous = process.env.DATA_DIR;
  const dir = await mkdtemp(join(tmpdir(), "tsr-assets-"));
  process.env.DATA_DIR = dir;
  const id = "cmqoelw7a2ol4nb01une6t6aa";
  try {
    assert.equal(await getPlaybackAssets(id), null);
    const bundle = join(dir, "playback-cache", id);
    await mkdir(bundle, { recursive: true });
    const data = { version: 1, expiresAt: Date.now() + 10000, durationSec: 520, previewCount: 52, previewIntervalSec: 10 };
    await writeFile(join(bundle, "ready.json"), JSON.stringify(data));
    assert.equal((await getPlaybackAssets(id))?.previewFrames.count, 52);
    await writeFile(join(bundle, "ready.json"), JSON.stringify({ ...data, expiresAt: 1 }));
    assert.equal(await getPlaybackAssets(id), null);
    await writeFile(join(bundle, "ready.json"), JSON.stringify({ ...data, expiresAt: undefined }));
    assert.equal(await getPlaybackAssets(id), null);
  } finally {
    if (previous === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = previous;
    await rm(dir, { recursive: true, force: true });
  }
});
