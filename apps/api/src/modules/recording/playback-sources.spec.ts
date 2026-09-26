import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";
import { parsePlaybackSource, resolveRecordingSources } from "./playback-sources";

const root = resolve("test-drive");
process.env.ARCHIVE_DIR = root;
const session = { id: "a", playbackPath: `${root}/video.mp4`, audioOnly: false, telegramStatus: "uploaded", archiveStatus: "stored",
  telegramParts: [1, 2].map((partIndex) => ({ partIndex, partCount: 2, startOffsetSec: (partIndex - 1) * 900, durationSec: 900 })) };
test("both complete stores: Drive is default; Telegram retains its own partition and forced URLs", async () => {
  const result = await resolveRecordingSources(session, "/video", async () => true);
  assert.equal(result.videoSource, "drive");
  assert.deepEqual(result.parts, []);
  assert.equal(result.storage.drive.state, "saved");
  assert.equal(result.storage.telegram.state, "saved");
  assert.deepEqual(result.playbackSources.map((item) => item.source), ["drive", "telegram"]);
  assert.equal(result.playbackSources[1].parts[1].streamUrl, "/video?source=telegram&part=2");
});
test("missing Drive falls back to complete Telegram, and missing both is unplayable", async () => {
  const result = await resolveRecordingSources(session, "/video", async () => false);
  assert.equal(result.videoSource, "telegram");
  assert.equal(result.storage.drive.state, "unavailable");
  const missing = await resolveRecordingSources({ ...session, playbackPath: null, archiveStatus: "expired", telegramStatus: "none", telegramParts: [] }, "/video", async () => false);
  assert.equal(missing.storage.drive.state, "missing");
  assert.equal(missing.storage.telegram.state, "missing");
  assert.equal(missing.videoReady, false);
});
test("partial Telegram upload is visible but cannot be selected as the entire recording", async () => {
  for (const status of ["uploading", "uploaded", "error"]) {
    const result = await resolveRecordingSources({ ...session, telegramStatus: status, telegramParts: session.telegramParts.slice(0, 1) }, "/video", async () => true);
    assert.equal(result.storage.telegram.available, false);
    assert.equal(result.storage.telegram.savedParts, 1);
    assert.equal(result.storage.telegram.totalParts, 2);
    assert.equal(result.playbackSources.length, 1);
  }
});
test("segmented sources require every actual part; a stale path is not a saved copy", async () => {
  const segmented = { ...session, segmented: true, playbackPath: null, segments: [1, 2].map((index) => ({ index, localPath: `/local/${index}`, archivePath: `${root}/${index}`, telegramStatus: "uploaded", startOffsetSec: (index - 1) * 900, durationSec: 900 })) };
  const result = await resolveRecordingSources(segmented, "/video", async (path) => path !== `${root}/2`);
  assert.equal(result.storage.drive.state, "partial");
  assert.equal(result.storage.drive.savedParts, 1);
  assert.equal(result.videoSource, "telegram");
  assert.deepEqual(result.parts.map((part) => part.source), ["telegram", "telegram"]);
  const missingPart = await resolveRecordingSources({ ...segmented, telegramParts: session.telegramParts.slice(0, 1) }, "/video", async () => true);
  assert.equal(missingPart.storage.telegram.available, false);
});
test("audio-only and local-only recordings show truthful store indicators", async () => {
  const audio = await resolveRecordingSources({ ...session, playbackPath: null, audioOnly: true, telegramAudioMessageId: "42" }, "/video", async () => false);
  assert.equal(audio.videoSource, "telegram");
  assert.deepEqual(audio.parts, []);
  const local = await resolveRecordingSources({ ...session, playbackPath: "/local/video.mp4", archiveStatus: "pending", telegramStatus: "none", telegramParts: [] }, "/video", async () => true);
  assert.equal(local.videoSource, "local");
  assert.equal(local.storage.drive.state, "saving");
  assert.equal(local.storage.telegram.state, "missing");
});
test("source query accepts only known scalar choices", () => {
  assert.equal(parsePlaybackSource(undefined), undefined);
  assert.equal(parsePlaybackSource("telegram"), "telegram");
  assert.throws(() => parsePlaybackSource(["drive", "telegram"]));
  assert.throws(() => parsePlaybackSource("other"));
});
