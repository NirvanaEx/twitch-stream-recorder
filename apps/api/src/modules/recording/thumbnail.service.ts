import { Injectable, Logger, NotFoundException, OnModuleDestroy } from "@nestjs/common";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { dirname, join, resolve } from "node:path";
import { ARCHIVE_FILES } from "../archive-storage/archive-paths";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramStreamService } from "../telegram/telegram-stream.service";

/**
 * Archive covers, rendered on demand straight from the video instead of being
 * stored as .jpg files on disk. The frame is taken at 1% of the recording
 * (never before the 1st second), scaled to 640px — same look the stored
 * covers had, minus the stored part.
 *
 * Source resolution mirrors playback: the local file while it exists, the
 * Telegram copy after the local cache was cleaned up. For Telegram, ffmpeg
 * reads over HTTP from a loopback-only helper server that pipes ranges
 * through TelegramStreamService — ffmpeg gets the seekable input it needs for
 * a fast keyframe seek (index + one chunk, not the whole part), and the
 * existing range/cache/slot machinery is reused as-is.
 *
 * Rendered covers live in a small in-memory LRU: repeated list visits cost
 * nothing, a restart simply re-renders on first view, and nothing is ever
 * written to disk.
 */

const COVER_CACHE_MAX_ENTRIES = 64;

// Concurrent ffmpeg renders. The archive list can ask for 15 covers at once;
// rendering them all in parallel would spawn 15 ffmpeg processes and fight
// for the shared Telegram stream slots. Two at a time keeps the queue short
// without starving actual playback.
const MAX_CONCURRENT_RENDERS = 2;

const LOCAL_RENDER_TIMEOUT_MS = 30_000;
// Telegram renders pull the mp4 index and a chunk over MTProto and may briefly
// wait for a stream slot behind an active viewer.
const TELEGRAM_RENDER_TIMEOUT_MS = 120_000;

@Injectable()
export class ThumbnailService implements OnModuleDestroy {
  private readonly logger = new Logger(ThumbnailService.name);
  private readonly cache = new Map<string, Buffer>();
  private readonly inFlight = new Map<string, Promise<Buffer>>();
  private renders = 0;
  private readonly renderWaiters: Array<() => void> = [];
  private helperServer: Server | null = null;
  private helperPort = 0;
  private readonly helperSecret = randomBytes(16).toString("hex");

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramStreamService: TelegramStreamService,
  ) {}

  onModuleDestroy() {
    this.helperServer?.close();
    this.helperServer = null;
  }

  /** Rendered cover of a session. Throws NotFoundException when there is no video to render from. */
  async getCover(sessionId: string): Promise<{ buffer: Buffer; etag: string }> {
    const cached = this.cache.get(sessionId);

    if (cached) {
      // Re-insert to refresh LRU recency (Map preserves insertion order).
      this.cache.delete(sessionId);
      this.cache.set(sessionId, cached);
      return { buffer: cached, etag: this.etagFor(sessionId) };
    }

    let pending = this.inFlight.get(sessionId);

    if (!pending) {
      pending = this.renderCover(sessionId).finally(() => {
        this.inFlight.delete(sessionId);
      });
      this.inFlight.set(sessionId, pending);
    }

    const buffer = await pending;
    return { buffer, etag: this.etagFor(sessionId) };
  }

  private etagFor(sessionId: string) {
    return `"cover-${sessionId}"`;
  }

  /**
   * Where a session's cover is kept on the server disk once it has been
   * rendered. Covers used to be produced on demand, every time, which made the
   * archive list wait on fifteen ffmpeg seeks — and after the recording moved
   * to Telegram or a network mount, each of those seeks went over the network.
   * Rendering once, at the end of the capture, turns that into a file read.
   */
  private storedCoverPath(sessionId: string): string {
    return join(resolve(process.env.DATA_DIR ?? "./data"), "covers", `${sessionId}.jpg`);
  }

  /**
   * Render a session's cover and keep it, so the first person to open the
   * archive list does not pay for it. Called once, right after the capture
   * finishes, and deliberately best-effort: a cover is not worth failing a
   * recording over.
   */
  async storeCover(sessionId: string): Promise<void> {
    try {
      const { buffer } = await this.getCover(sessionId);
      const target = this.storedCoverPath(sessionId);

      mkdirSync(dirname(target), { recursive: true });
      await writeFile(target, buffer);

      await this.prisma.streamSession.update({
        where: { id: sessionId },
        data: { thumbnailPath: target },
      });
    } catch (error) {
      this.logger.warn(
        `Could not store the cover of session ${sessionId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** Path of the cover stored in a session's archive folder, if it is there. */
  private archivedCoverPath(archiveDir: string | null): string | null {
    if (!archiveDir) {
      return null;
    }

    try {
      const candidate = join(archiveDir, ARCHIVE_FILES.cover);
      return existsSync(candidate) ? candidate : null;
    } catch {
      // Unreachable mount — fall through to rendering from Telegram.
      return null;
    }
  }

  private async renderCover(sessionId: string): Promise<Buffer> {
    const session = await this.prisma.streamSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        audioOnly: true,
        playbackPath: true,
        durationSec: true,
        telegramStatus: true,
        archiveDir: true,
        thumbnailPath: true,
        segmented: true,
        // First chunk of a segmented capture: the cover is taken near the
        // start of the broadcast, so that is the only one worth looking at.
        segments: {
          where: { index: 1 },
          take: 1,
          select: { localPath: true, archivePath: true },
        },
        telegramParts: {
          orderBy: { partIndex: "asc" },
          take: 1,
          select: { partIndex: true, durationSec: true },
        },
      },
    });

    if (!session || session.audioOnly) {
      throw new NotFoundException("Обложка для этой записи недоступна.");
    }

    // Already rendered once, either here on the server disk or next to the
    // video in the archive folder. Both are a file read instead of an ffmpeg
    // seek over a network.
    for (const candidate of [session.thumbnailPath, this.archivedCoverPath(session.archiveDir)]) {
      if (!candidate) continue;

      try {
        if (existsSync(candidate)) {
          return await readFile(candidate);
        }
      } catch {
        // Unreadable or an unreachable mount — fall through and render.
      }
    }

    // The archive tier already carries a rendered cover next to the video.
    // Reading those few kilobytes beats seeking through an mp4 that now lives
    // on a network mount — the archive list asks for fifteen of these at once.
    const archivedCover = this.archivedCoverPath(session.archiveDir);

    if (archivedCover) {
      try {
        return await readFile(archivedCover);
      } catch (error) {
        this.logger.debug(
          `Stored cover ${archivedCover} unreadable, rendering instead: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    let input: string | null = null;
    let durationSec = session.durationSec ?? 0;
    let timeoutMs = LOCAL_RENDER_TIMEOUT_MS;

    if (session.playbackPath) {
      const absolutePath = resolve(session.playbackPath);
      if (existsSync(absolutePath)) {
        input = absolutePath;
      }
    }

    // A segmented capture has no playbackPath; its first chunk stands in for
    // the whole recording, wherever that chunk currently lives.
    if (!input && session.segmented) {
      const first = session.segments[0];

      for (const candidate of [first?.localPath, first?.archivePath]) {
        if (candidate && existsSync(candidate)) {
          input = candidate;
          // The seek must stay inside the chunk, not the whole broadcast.
          durationSec = Math.min(durationSec || 600, 600);
          break;
        }
      }
    }

    if (!input && session.telegramStatus === "uploaded" && session.telegramParts[0]) {
      const part = session.telegramParts[0];
      input = `${await this.ensureHelperServer()}/${this.helperSecret}/${session.id}/${part.partIndex}`;
      // The frame comes from part 1, so the seek must stay inside part 1.
      durationSec = part.durationSec ?? durationSec;
      timeoutMs = TELEGRAM_RENDER_TIMEOUT_MS;
    }

    if (!input) {
      throw new NotFoundException("Видео этой записи недоступно для обложки.");
    }

    const seekSec = Math.max(1, Math.floor(durationSec * 0.01));

    await this.acquireRenderSlot();

    try {
      let buffer: Buffer;
      try {
        buffer = await this.runFfmpeg(input, seekSec, timeoutMs);
      } catch (error) {
        // A wrong duration can put the seek past the end of the file; the
        // very first second always exists.
        if (seekSec <= 1) throw error;
        buffer = await this.runFfmpeg(input, 1, timeoutMs);
      }

      this.cache.set(sessionId, buffer);
      while (this.cache.size > COVER_CACHE_MAX_ENTRIES) {
        const oldest = this.cache.keys().next().value;
        if (oldest === undefined) break;
        this.cache.delete(oldest);
      }

      return buffer;
    } catch (error) {
      this.logger.warn(
        `Cover render failed for ${sessionId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new NotFoundException("Не удалось получить кадр для обложки.");
    } finally {
      this.releaseRenderSlot();
    }
  }

  private runFfmpeg(input: string, seekSec: number, timeoutMs: number): Promise<Buffer> {
    return new Promise<Buffer>((resolvePromise, rejectPromise) => {
      const child = spawn(
        "ffmpeg",
        [
          "-hide_banner",
          "-loglevel",
          "error",
          // -ss before -i seeks by keyframe over the demuxer index — on HTTP
          // input that is a couple of range requests, not a full download.
          "-ss",
          String(seekSec),
          "-i",
          input,
          "-frames:v",
          "1",
          "-vf",
          "scale=640:-2",
          "-q:v",
          "4",
          "-f",
          "mjpeg",
          "pipe:1",
        ],
        { stdio: ["ignore", "pipe", "pipe"] },
      );

      const chunks: Buffer[] = [];
      let stderrTail = "";
      let settled = false;

      const timer = setTimeout(() => {
        settled = true;
        child.kill();
        rejectPromise(new Error(`ffmpeg timed out after ${timeoutMs} ms`));
      }, timeoutMs);
      timer.unref();

      child.stdout?.on("data", (chunk: Buffer) => chunks.push(chunk));
      child.stderr?.on("data", (chunk) => {
        stderrTail = `${stderrTail}${chunk.toString()}`.slice(-1500);
      });

      child.once("error", (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        rejectPromise(error);
      });

      child.once("exit", (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        const buffer = Buffer.concat(chunks);

        if (code === 0 && buffer.length > 0) {
          resolvePromise(buffer);
        } else {
          rejectPromise(
            new Error(
              `ffmpeg exited with ${String(code)} (${buffer.length} bytes): ${stderrTail.trim()}`,
            ),
          );
        }
      });
    });
  }

  /**
   * Loopback-only HTTP bridge that lets ffmpeg read a Telegram-backed part as
   * a seekable file. Requests carry a per-process random secret, the socket
   * binds to 127.0.0.1, and everything else is the same code path the player
   * uses — including range handling and the chunk cache.
   */
  private async ensureHelperServer(): Promise<string> {
    if (this.helperServer && this.helperPort > 0) {
      return `http://127.0.0.1:${this.helperPort}`;
    }

    const server = createServer((req, res) => {
      const match = /^\/([0-9a-f]{32})\/([^/]+)\/(\d+)$/.exec(req.url ?? "");

      if (!match || match[1] !== this.helperSecret) {
        res.writeHead(404);
        res.end();
        return;
      }

      const sessionId = match[2];
      const partIndex = Number.parseInt(match[3], 10);

      this.telegramStreamService.streamToResponse(sessionId, partIndex, req, res).catch(() => {
        if (!res.headersSent) {
          res.writeHead(404);
        }
        res.end();
      });
    });

    await new Promise<void>((resolvePromise, rejectPromise) => {
      server.once("error", rejectPromise);
      server.listen(0, "127.0.0.1", () => resolvePromise());
    });

    const address = server.address();
    this.helperPort = typeof address === "object" && address ? address.port : 0;
    this.helperServer = server;
    server.unref();

    return `http://127.0.0.1:${this.helperPort}`;
  }

  private async acquireRenderSlot() {
    if (this.renders < MAX_CONCURRENT_RENDERS && this.renderWaiters.length === 0) {
      this.renders += 1;
      return;
    }

    // The releaser hands its slot straight to the first waiter (the count
    // never dips), so a fresh caller cannot slip past the queue in between.
    await new Promise<void>((resolvePromise) => {
      this.renderWaiters.push(resolvePromise);
    });
  }

  private releaseRenderSlot() {
    const next = this.renderWaiters.shift();
    if (next) {
      next();
    } else {
      this.renders -= 1;
    }
  }
}
