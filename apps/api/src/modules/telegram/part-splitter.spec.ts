import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PartSplitter, shouldHoldSplit } from "./part-splitter";

const GB = 1024 ** 3;
const PART = 1900 * 1024 * 1024;

test("keeps cutting while the disk has room for several more parts", () => {
  assert.equal(shouldHoldSplit(20 * GB, PART, 1), false);
});

test("holds the split once free space is down to a couple of parts", () => {
  assert.equal(shouldHoldSplit(3 * GB, PART, 1), true);
});

test("never holds with nothing pending: there would be nobody to release it", () => {
  // The upload of a finished part is what frees space, so holding before the
  // first one has been cut would wait forever.
  assert.equal(shouldHoldSplit(1 * GB, PART, 0), false);
});

test("keeps cutting when free space cannot be measured", () => {
  // statfs failing is not a reason to stall an upload; the old unpaced split
  // did not look at the disk at all.
  assert.equal(shouldHoldSplit(null, PART, 2), false);
});

const hasFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;

/**
 * The split has to run to the end even when the disk leaves it no room to
 * work ahead — that is the case it exists for, and the case a deadlock would
 * hide in: the splitter waits for space, the uploader waits for a part.
 */
test("cuts a recording part by part, at the pace parts are taken away", { skip: !hasFfmpeg }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "tsr-split-"));

  try {
    const source = join(dir, "recording.mp4");
    const tempDir = join(dir, "parts");

    const encoded = spawnSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-f", "lavfi", "-i", "testsrc2=size=160x120:rate=25:duration=8",
      "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=8",
      "-c:v", "libx264", "-preset", "ultrafast", "-g", "25",
      "-c:a", "aac", "-movflags", "+faststart", source,
    ]);
    assert.equal(encoded.status, 0, encoded.stderr.toString());

    const splitter = new PartSplitter({
      filePath: source,
      tempDir,
      segmentSec: 2,
      maxPartBytes: 1024 * 1024,
      log: () => undefined,
      // A disk with no room to work ahead: the splitter may only continue
      // once the part in hand has been released.
      freeBytes: async () => 1024,
    });

    splitter.start();

    const taken: number[] = [];
    let previousEnd = 0;

    for (;;) {
      const part = await splitter.next();

      if (!part) {
        break;
      }

      assert.ok(existsSync(part.path), "the part handed over must be on disk");
      // Parts tile the recording: each one starts where the last one ended.
      assert.ok(Math.abs(part.startOffsetSec - previousEnd) <= 1);
      previousEnd = part.startOffsetSec + part.durationSec;
      taken.push(part.index);

      await splitter.release(part);
      assert.equal(existsSync(part.path), false, "a released part is gone from the disk");
    }

    assert.deepEqual(taken, [1, 2, 3, 4]);

    await splitter.dispose();
    assert.equal(existsSync(tempDir), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
