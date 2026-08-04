import assert from "node:assert/strict";
import test from "node:test";
import { parseSegmentManifest } from "./segment-manifest.utils";

// Real output of the capture command, verified against ffmpeg 6 in the API
// image: "name,start,end" with the offsets measured on the whole broadcast.
const MANIFEST = [
  "part0000.mp4,0.000000,8.023222",
  "part0001.mp4,8.023222,16.023222",
  "part0002.mp4,16.023222,24.023222",
  "",
].join("\n");

test("reads chunk numbers without folding in the 4 of .mp4", () => {
  const rows = parseSegmentManifest(MANIFEST);

  assert.deepEqual(
    rows.map((row) => row.index),
    [0, 1, 2],
  );
  assert.equal(rows[0].name, "part0000.mp4");
});

test("derives per-chunk duration and its offset on the broadcast timeline", () => {
  const rows = parseSegmentManifest(MANIFEST);

  assert.equal(rows[1].startOffsetSec, 8);
  assert.equal(rows[1].durationSec, 8);
});

test("ignores the half-written last line the manifest is appended to", () => {
  // ffmpeg is writing while we read: the tail can be an incomplete record.
  const rows = parseSegmentManifest("part0000.mp4,0.000000,8.023222\npart0001.mp4,8.0232");

  assert.equal(rows.length, 1);
  assert.equal(rows[0].index, 0);
});

test("keeps the last line when the manifest ends on a newline", () => {
  const rows = parseSegmentManifest("part0000.mp4,0.000000,8.023222\n");

  assert.equal(rows.length, 1);
});

test("reads the TS pieces a joined capture writes", () => {
  const rows = parseSegmentManifest("part0000.ts,0.000000,900.000000\npart0001.ts,900.0,1800.0\n");

  assert.deepEqual(
    rows.map((row) => row.index),
    [0, 1],
  );
  assert.equal(rows[1].startOffsetSec, 900);
});

test("reads the parts the Telegram split names after the recording", () => {
  const rows = parseSegmentManifest("stream_2026-08-04_12-00-00_part003.mp4,0.0,120.0\n");

  assert.equal(rows[0].index, 3);
  assert.equal(rows[0].durationSec, 120);
});

test("skips anything that is not a chunk record", () => {
  const rows = parseSegmentManifest("\ngarbage\npart0007.mp4,1.0,2.0\n,,\n");

  assert.deepEqual(
    rows.map((row) => row.index),
    [7],
  );
});
