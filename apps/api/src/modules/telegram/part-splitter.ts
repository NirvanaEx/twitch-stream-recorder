import { ChildProcess, spawn } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, unlinkSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { basename, join } from "node:path";
import { parseSegmentManifest } from "../recording/segment-manifest.utils";

export type SplitPart = {
  /** 1-based, matching the part numbering in the database and the captions. */
  index: number;
  path: string;
  sizeBytes: number;
  /** Where this part starts on the recording's timeline. */
  startOffsetSec: number;
  durationSec: number;
};

// The manifest is flushed the instant a part closes, so this only bounds how
// long a finished part waits before its upload starts.
const POLL_MS = 2_000;

// Below this much free space — measured in parts, since one part is the unit
// the splitter writes in — the splitter stops reading the recording until an
// uploaded part has been deleted. Three is one part being written, one being
// uploaded, and one part of slack for everything else on the disk.
const HOLD_BELOW_PARTS = 3;

/**
 * Whether the splitter should stop feeding ffmpeg right now.
 *
 * Holding is only correct while a finished part is waiting to be uploaded: it
 * is that upload which frees the space we are waiting for. With nothing
 * pending there is nobody to release anything, so holding would deadlock and
 * we let ffmpeg run into whatever space is left.
 */
export function shouldHoldSplit(
  freeBytes: number | null,
  maxPartBytes: number,
  pendingParts: number,
) {
  if (freeBytes === null || pendingParts === 0) {
    return false;
  }

  return freeBytes < maxPartBytes * HOLD_BELOW_PARTS;
}

type PartSplitterOptions = {
  filePath: string;
  tempDir: string;
  /** Target length of one part, chosen so it lands just under the size limit. */
  segmentSec: number;
  maxPartBytes: number;
  log: (message: string) => void;
  freeBytes: () => Promise<number | null>;
};

/**
 * Cuts a finished recording into Telegram-sized parts, one at a time, at the
 * pace the uploads can carry them away.
 *
 * Splitting used to run to completion before the first byte was uploaded, so
 * a 15 GB recording needed another 15 GB of free disk for the duration — on a
 * server that has less than that spare, the split filled the disk and took
 * every other container down with it. Here ffmpeg is fed the recording
 * through a pipe, and the feeding stops whenever a finished part is waiting
 * and free space is down to a few parts' worth. Peak cost is the recording
 * plus two parts, whatever the length of the broadcast.
 *
 * The pipe is also what makes this safe to abandon: kill the API mid-split
 * and ffmpeg sees its input close and exits, instead of lingering as a
 * process nothing will ever wake up.
 */
export class PartSplitter {
  private child: ChildProcess | null = null;
  private feeding: Promise<void> | null = null;
  private stderrTail = "";
  private exit: { code: number | null } | null = null;
  private exitError: Error | null = null;
  private disposed = false;
  private held = false;
  private releaseWaiters: Array<() => void> = [];
  private readonly delivered = new Set<number>();
  private readonly pending = new Map<number, number>();
  private readonly listPath: string;
  private readonly pattern: string;

  constructor(private readonly options: PartSplitterOptions) {
    this.listPath = join(options.tempDir, "parts.csv");
    // The file name is what Telegram shows next to the video, so it keeps
    // carrying the channel and date of the recording it came from.
    this.pattern = join(
      options.tempDir,
      `${basename(options.filePath, ".mp4")}_part%03d.mp4`,
    );
  }

  start() {
    // A previous attempt may have left parts behind; they would be picked up
    // as if this run had produced them.
    rmSync(this.options.tempDir, { recursive: true, force: true });
    mkdirSync(this.options.tempDir, { recursive: true });

    this.child = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "warning",
        "-y",
        // Read from a pipe rather than the file itself: that is the throttle.
        // It only works because recordings are written with the index up
        // front (+faststart) — see splitUnpaced for what happens when one is
        // not.
        "-f",
        "mp4",
        "-i",
        "pipe:0",
        "-c",
        "copy",
        "-map",
        "0",
        "-f",
        "segment",
        "-segment_time",
        String(this.options.segmentSec),
        "-reset_timestamps",
        "1",
        // moov up front in every part: without it the web player has to fetch
        // the tail of a 1.9 GB file from Telegram before playback can start.
        "-segment_format_options",
        "movflags=+faststart",
        // "name,start,end" appended the instant a part closes: the completion
        // signal and the offsets, without probing anything.
        "-segment_list",
        this.listPath,
        "-segment_list_type",
        "csv",
        "-segment_list_flags",
        "+live",
        this.pattern,
      ],
      { stdio: ["pipe", "ignore", "pipe"] },
    );

    this.child.stderr?.on("data", (chunk) => {
      this.stderrTail = `${this.stderrTail}${chunk.toString()}`.slice(-2000);
    });
    this.child.once("error", (error) => {
      this.exitError = error;
      this.exit = { code: null };
      this.wakeWaiters();
    });
    this.child.once("exit", (code) => {
      this.exit = { code };
      this.wakeWaiters();
    });

    this.feeding = this.feed().catch((error: Error) => {
      // A pipe that breaks because ffmpeg died is not the failure worth
      // reporting; the exit code below is.
      if (!this.exit && !this.disposed) {
        this.exitError = error;
      }
    });
  }

  /**
   * The next finished part, or null once the recording has been fully cut.
   * Throws if ffmpeg failed, so a broken split fails the upload instead of
   * quietly delivering half a broadcast.
   */
  async next(): Promise<SplitPart | null> {
    for (;;) {
      const ready = await this.readClosedParts();

      if (ready) {
        return ready;
      }

      if (this.exit) {
        // The exit may have closed one last part after the read above.
        const last = await this.readClosedParts();

        if (last) {
          return last;
        }

        if (this.exitError) {
          throw this.exitError;
        }

        if (this.exit.code !== 0) {
          throw new Error(
            `ffmpeg exited with code ${String(this.exit.code)}: ${this.stderrTail.trim()}`,
          );
        }

        return null;
      }

      await sleep(POLL_MS);
    }
  }

  /** Drop a part once Telegram has it, which is what lets the split go on. */
  async release(part: SplitPart) {
    this.pending.delete(part.index);

    try {
      unlinkSync(part.path);
    } catch {
      // dispose() sweeps the whole temp directory anyway.
    }

    await this.updateHold();
    this.wakeWaiters();
  }

  async dispose() {
    this.disposed = true;
    this.wakeWaiters();

    if (this.child && !this.exit) {
      this.child.stdin?.destroy();
      this.child.kill("SIGKILL");
    }

    // Let the feeding loop unwind before the directory goes, or it writes
    // into a folder that is being removed underneath it.
    await this.feeding?.catch(() => undefined);

    try {
      rmSync(this.options.tempDir, { recursive: true, force: true });
    } catch {
      // Best-effort temp cleanup; ignore filesystem errors.
    }
  }

  /** True when ffmpeg refused the piped input before producing anything. */
  get failedWithoutOutput() {
    return Boolean(this.exit && this.exit.code !== 0 && this.delivered.size === 0);
  }

  private async feed() {
    const stdin = this.child?.stdin;

    if (!stdin) {
      throw new Error("ffmpeg has no stdin.");
    }

    const source = createReadStream(this.options.filePath);

    try {
      for await (const chunk of source) {
        if (this.disposed || this.exit) {
          break;
        }

        while (this.held && !this.disposed && !this.exit) {
          await this.waitForRelease();
        }

        if (!stdin.write(chunk as Buffer)) {
          await once(stdin, "drain");
        }
      }
    } finally {
      source.destroy();
      stdin.end();
    }
  }

  /**
   * Register everything ffmpeg has closed since the last pass and hand back
   * the first part nobody has taken yet.
   */
  private async readClosedParts(): Promise<SplitPart | null> {
    let raw: string;

    try {
      raw = await readFile(this.listPath, "utf8");
    } catch {
      return null; // No part has closed yet — ffmpeg writes the manifest with the first.
    }

    for (const row of parseSegmentManifest(raw)) {
      if (this.delivered.has(row.index)) {
        continue;
      }

      const path = join(this.options.tempDir, row.name);

      if (!existsSync(path)) {
        continue;
      }

      this.delivered.add(row.index);

      const sizeBytes = statSync(path).size;
      // ffmpeg counts from zero, parts in the database from one.
      const index = row.index + 1;

      this.pending.set(index, sizeBytes);
      await this.updateHold();

      return {
        index,
        path,
        sizeBytes,
        startOffsetSec: row.startOffsetSec,
        durationSec: row.durationSec,
      };
    }

    return null;
  }

  private async updateHold() {
    const free = await this.options.freeBytes();
    const held = shouldHoldSplit(free, this.options.maxPartBytes, this.pending.size);

    if (held !== this.held) {
      this.held = held;
      this.options.log(
        held
          ? `disk is down to ${formatGb(free)} — pausing the split until the part being uploaded is gone.`
          : `disk is back to ${formatGb(free)} — cutting the next part.`,
      );
    }

    if (!held) {
      this.wakeWaiters();
    }
  }

  private waitForRelease() {
    return new Promise<void>((resolvePromise) => {
      this.releaseWaiters.push(resolvePromise);
    });
  }

  private wakeWaiters() {
    const waiters = this.releaseWaiters;
    this.releaseWaiters = [];
    waiters.forEach((wake) => wake());
  }
}

function formatGb(bytes: number | null) {
  return bytes === null ? "an unknown amount" : `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function sleep(ms: number) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}
