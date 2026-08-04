import { ChildProcess, spawn } from "node:child_process";
import {
  createReadStream,
  existsSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";

// Headroom the join wants on top of the pieces it is about to read before it
// keeps them until the .mp4 is finished. Below that it deletes each piece the
// moment ffmpeg has swallowed it, which is the only way a broadcast bigger
// than half the free disk can be joined at all.
const KEEP_SOURCE_MARGIN = 1.2;

/**
 * Whether the pieces can be kept until the join has finished.
 *
 * Keeping them is the safe option: an interrupted join is then simply redone.
 * It does mean the disk holds the broadcast twice at once, so there has to be
 * room for a whole second copy — a five-hour 1080p stream is ~15 GB. When
 * there is not, each piece is freed as ffmpeg consumes it, and an interruption
 * costs whatever has already been consumed.
 */
export function canKeepChunksWhileJoining(freeBytes: number | null, totalBytes: number) {
  if (freeBytes === null) {
    // Unmeasurable disk: keep them. Deleting the only copy of a broadcast on
    // a guess is the worse way to be wrong.
    return true;
  }

  return freeBytes > totalBytes * KEEP_SOURCE_MARGIN;
}

/** The pieces of a joined capture, in the order they were recorded. */
export function listCaptureChunks(chunkDir: string) {
  if (!existsSync(chunkDir)) {
    return [] as string[];
  }

  try {
    return readdirSync(chunkDir)
      .filter((name) => /^part\d+\.ts$/i.test(name))
      .sort()
      .map((name) => join(chunkDir, name));
  } catch {
    return [] as string[];
  }
}

/** When the capture behind these pieces actually stopped. */
export function lastChunkModifiedAt(chunkDir: string) {
  let latest: Date | null = null;

  for (const chunk of listCaptureChunks(chunkDir)) {
    try {
      const { mtime } = statSync(chunk);
      if (!latest || mtime > latest) latest = mtime;
    } catch {
      // A piece that vanished between listing and stat tells us nothing.
    }
  }

  return latest;
}

export function removeChunkDir(chunkDir: string) {
  try {
    rmSync(chunkDir, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup; ignore filesystem errors.
  }
}

export type JoinResult = {
  ok: boolean;
  sizeBytes: number;
};

/**
 * Put a broadcast back together: feed every TS piece, in order, through one
 * ffmpeg stream copy into the single .mp4 the recording is meant to be.
 *
 * The pieces go in over a pipe rather than through the concat demuxer for one
 * reason — a piece can then be deleted the moment ffmpeg has swallowed it,
 * which is what keeps the peak at one copy of the broadcast instead of two.
 *
 * Nothing is re-encoded and nothing is cut: TS pieces carry no container of
 * their own and their timestamps run straight through the boundaries, so the
 * bytes ffmpeg reads here are the bytes streamlink pulled. That is the whole
 * point of the exercise — cutting the capture into playable .mp4 pieces as it
 * ran re-based and re-primed the audio at every boundary, and the player hopping
 * from one piece to the next turned that into an audible break mid-broadcast.
 */
export async function joinCaptureChunks(options: {
  chunkDir: string;
  outputPath: string;
  ffmpeg?: { command: string; args: string[] };
  freeBytes?: () => Promise<number | null>;
  log?: (message: string) => void;
}): Promise<JoinResult> {
  const { chunkDir, outputPath } = options;
  const log = options.log ?? (() => undefined);
  const ffmpeg = options.ffmpeg ?? { command: "ffmpeg", args: [] };
  const chunks = listCaptureChunks(chunkDir);

  if (chunks.length === 0) {
    log("nothing to join: the capture produced no pieces.");
    removeChunkDir(chunkDir);

    return { ok: false, sizeBytes: 0 };
  }

  const totalBytes = chunks.reduce((sum, path) => {
    try {
      return sum + statSync(path).size;
    } catch {
      return sum;
    }
  }, 0);

  const freeBytes = options.freeBytes ? await options.freeBytes() : null;
  const keepSources = canKeepChunksWhileJoining(freeBytes, totalBytes);

  log(
    `joining ${chunks.length} piece(s), ${Math.round(totalBytes / 1024 / 1024)} MB, into one recording${
      keepSources ? "" : " (freeing each piece as it is read: disk is tight)"
    }.`,
  );

  const child = spawn(
    ffmpeg.command,
    [
      ...ffmpeg.args,
      "-hide_banner",
      "-loglevel",
      "warning",
      "-y",
      // The pieces are a raw stream, not a file ffmpeg can seek in, so the
      // format has to be stated up front.
      "-f",
      "mpegts",
      "-i",
      "pipe:0",
      "-c",
      "copy",
      "-bsf:a",
      "aac_adtstoasc",
      "-movflags",
      "+faststart",
      outputPath,
    ],
    { stdio: ["pipe", "ignore", "pipe"] },
  );

  let stderrTail = "";
  child.stderr?.on("data", (chunk) => {
    stderrTail = `${stderrTail}${chunk.toString()}`.slice(-2000);
  });

  const exited = new Promise<number | null>((resolvePromise) => {
    child.once("error", () => resolvePromise(null));
    child.once("exit", (code) => resolvePromise(code));
  });

  try {
    for (const chunk of chunks) {
      await pipeFileInto(chunk, child);

      if (!keepSources) {
        try {
          unlinkSync(chunk);
        } catch {
          // Best-effort; the whole folder goes once the join lands.
        }
      }
    }

    child.stdin?.end();
  } catch (error) {
    // ffmpeg died with pieces still to come: stop feeding a closed pipe and
    // let the exit code below decide what the session becomes.
    log(`feeding the join failed: ${error instanceof Error ? error.message : String(error)}`);
    child.stdin?.destroy();
  }

  const code = await exited;
  const sizeBytes = existsSync(outputPath) ? statSync(outputPath).size : 0;

  if (code !== 0 || sizeBytes === 0) {
    log(`join failed (ffmpeg code ${String(code)}): ${stderrTail.trim()}`);

    // Whatever pieces are left are the only copy of the broadcast, so they
    // stay: the recovery pass retries the join on the next boot.
    return { ok: false, sizeBytes };
  }

  log(`joined into one recording (${Math.round(sizeBytes / 1024 / 1024)} MB).`);
  removeChunkDir(chunkDir);

  return { ok: true, sizeBytes };
}

/** Write one file into a child's stdin, respecting backpressure. */
function pipeFileInto(filePath: string, child: ChildProcess) {
  return new Promise<void>((resolvePromise, rejectPromise) => {
    const source = createReadStream(filePath);
    const stdin = child.stdin;

    if (!stdin) {
      rejectPromise(new Error("ffmpeg has no stdin."));
      return;
    }

    const fail = (error: Error) => {
      source.destroy();
      rejectPromise(error);
    };

    source.once("error", fail);
    stdin.once("error", fail);
    source.once("end", () => {
      stdin.off("error", fail);
      resolvePromise();
    });
    // The child keeps reading after this file: only the last one ends stdin.
    source.pipe(stdin, { end: false });
  });
}
