import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  canKeepChunksWhileJoining,
  joinCaptureChunks,
  lastChunkModifiedAt,
  listCaptureChunks,
} from "./chunk-join";

const GB = 1024 ** 3;

test("keeps the pieces when the finished recording still fits beside them", () => {
  // 15 GB of pieces, 29 GB free: the .mp4 lands next to them with room over.
  assert.equal(canKeepChunksWhileJoining(29 * GB, 15 * GB), true);
});

test("frees each piece as it is read when the recording would not fit", () => {
  assert.equal(canKeepChunksWhileJoining(14 * GB, 15 * GB), false);
});

test("keeps the pieces when free space cannot be measured", () => {
  // Deleting the only copy of a broadcast on a guess is the worse mistake.
  assert.equal(canKeepChunksWhileJoining(null, 15 * GB), true);
});

test("orders the pieces the way they were recorded, ignoring everything else", () => {
  const dir = mkdtempSync(join(tmpdir(), "tsr-chunks-"));

  try {
    for (const name of ["part0010.ts", "part0002.ts", "part0001.ts", "segments.csv", "notes.txt"]) {
      writeFileSync(join(dir, name), "x");
    }

    assert.deepEqual(
      listCaptureChunks(dir).map((path) => path.slice(dir.length + 1)),
      ["part0001.ts", "part0002.ts", "part0010.ts"],
    );
    assert.ok(lastChunkModifiedAt(dir) instanceof Date);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("says so instead of pretending, when the capture produced no pieces", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tsr-chunks-"));
  const output = join(dir, "..", "never-written.mp4");

  const result = await joinCaptureChunks({ chunkDir: dir, outputPath: output });

  assert.equal(result.ok, false);
  assert.equal(existsSync(dir), false);
  assert.equal(existsSync(output), false);
});

/**
 * The claim this whole path exists for: joining the pieces afterwards gives
 * back the broadcast exactly, while cutting the capture into playable .mp4
 * chunks as it runs does not — every boundary re-primes the audio, and that
 * is the break heard in the middle of a stream.
 *
 * Needs a real ffmpeg, so it runs where recordings are actually made (the API
 * image, the server) and skips on a workstation without one.
 */
const hasFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;

test("joined pieces decode to the same audio as the uncut capture", { skip: !hasFfmpeg }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "tsr-join-"));

  try {
    const source = join(dir, "source.ts");
    const chunkDir = join(dir, "chunks");
    const liveDir = join(dir, "live");
    mkdirSync(chunkDir);
    mkdirSync(liveDir);

    // Six seconds of an unbroken tone, keyframes every second: the shape a
    // capture has, small enough to run in a test.
    run("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-f", "lavfi", "-i", "testsrc2=size=160x120:rate=25:duration=6",
      "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=6",
      "-c:v", "libx264", "-preset", "ultrafast", "-g", "25",
      "-c:a", "aac", "-f", "mpegts", source,
    ]);

    // The two ways of cutting the same capture: TS pieces to be joined after
    // the broadcast, and finished .mp4 chunks the way live segments write them.
    cut(source, chunkDir, "mpegts", "part%04d.ts", false);
    cut(source, liveDir, "mp4", "part%04d.mp4", true);
    assert.equal(listCaptureChunks(chunkDir).length, 3);

    const joined = join(dir, "joined.mp4");
    const { ok } = await joinCaptureChunks({ chunkDir, outputPath: joined });

    assert.equal(ok, true);
    assert.ok(statSync(joined).size > 0);
    // The pieces are gone once they are one recording again.
    assert.equal(existsSync(chunkDir), false);

    const original = decodedAudio(source);

    assert.equal(
      decodedAudio(joined),
      original,
      "the join must reproduce the captured audio sample for sample",
    );
    assert.notEqual(
      decodedAudio(...liveChunks(liveDir)),
      original,
      "cutting the capture into .mp4 chunks as it runs is what alters the audio at every boundary",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function cut(source: string, dir: string, format: string, pattern: string, live: boolean) {
  run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", source, "-c", "copy",
    "-f", "segment", "-segment_time", "2", "-segment_format", format,
    ...(live ? ["-segment_format_options", "movflags=+faststart", "-reset_timestamps", "1"] : []),
    join(dir, pattern),
  ]);
}

function liveChunks(dir: string) {
  return spawnSync("sh", ["-c", `ls ${dir}/part*.mp4`])
    .stdout.toString()
    .trim()
    .split("\n");
}

/** Fingerprint of the decoded audio, so two files can be compared by content. */
function decodedAudio(...files: string[]) {
  const hash = createHash("md5");

  for (const file of files) {
    const decoded = spawnSync(
      "ffmpeg",
      ["-hide_banner", "-loglevel", "error", "-i", file, "-map", "0:a", "-f", "s16le", "-ar", "48000", "-ac", "1", "-"],
      { maxBuffer: 256 * 1024 * 1024 },
    );

    assert.equal(decoded.status, 0, decoded.stderr.toString());
    hash.update(decoded.stdout);
  }

  return hash.digest("hex");
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { maxBuffer: 64 * 1024 * 1024 });

  assert.equal(result.status, 0, `${command} failed: ${result.stderr?.toString()}`);
}
