import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Readable } from "node:stream";
import { Api } from "telegram";
import { returnBigInt } from "telegram/Helpers";
import { PrismaService } from "../prisma/prisma.service";
import { parseMediaRange } from "../recording/playback.utils";
import { TelegramClientService } from "./telegram-client.service";

// MTProto upload.getFile requires the offset to be 4 KB aligned and the chunk
// size to divide 1 MB; 512 KB satisfies both and is the maximum allowed.
const CHUNK_SIZE = 512 * 1024;

// How many 512 KB chunks are fetched from Telegram concurrently. All requests
// share ONE MTProto connection, so this is NOT "more workers = more speed":
// past a handful of in-flight requests Telegram throttles the connection and
// throughput DROPS (raising this to 12 made playback worse). 6 is the sweet
// spot. Tune per-deployment with TELEGRAM_STREAM_PARALLELISM (1-32) — if the
// stream stalls, try LOWER values (3-4) before higher ones.
const DEFAULT_PARALLEL_CHUNKS = 6;

// In-memory LRU of downloaded chunks. Seeks usually re-read the same areas
// (the mp4 index, recently watched ranges, timeline previews), so serving
// them from RAM removes the multi-second round-trip to Telegram. Buffers live
// OUTSIDE the V8 heap, so this must stay well below the container's memory
// limit — 64 MB covers the mp4 index and the recent window without pushing a
// small VPS into swap/OOM (192 MB did exactly that).
const DEFAULT_CACHE_MB = 64;

// How many HTTP responses may pull from Telegram at the same time. Every
// stream keeps PARALLEL_CHUNKS requests in flight on the ONE shared MTProto
// connection, so unbounded concurrency (a viewer scrubbing the timeline opens
// a new range request per seek) floods that connection: every stream crawls,
// the queued 512 KB chunks pile up in memory and the whole API looks frozen.
// Excess requests briefly wait for a slot instead. Tune with
// TELEGRAM_STREAM_MAX_CONCURRENT (1-16).
const DEFAULT_MAX_CONCURRENT_STREAMS = 3;
const STREAM_SLOT_WAIT_MS = 15_000;

// Resolved message medias are small, but the map is keyed per part/audio and
// would otherwise grow for as long as the process lives.
const MEDIA_CACHE_MAX_ENTRIES = 64;

// Resolved messages carry a file_reference that Telegram expires after a
// while; re-fetch the message when the cached one gets stale or rejected.
const MEDIA_CACHE_TTL_MS = 5 * 60_000;

// A transient Telegram failure mid-stream (timeout, dropped chunk, brief
// flood) used to abort the whole HTTP response — the player then showed a
// "network error" the viewer had to clear by hand. Retry the current position
// a few times with backoff instead, turning a hiccup into a short stall.
const MAX_CHUNK_RETRIES = 6;
const RETRY_BASE_DELAY_MS = 400;

// How often an active stream logs its throughput / refreshes the live stats.
const SPEED_LOG_INTERVAL_MS = 2_000;

// Live stats older than this are considered idle (no active playback).
const LIVE_STATS_TTL_MS = 8_000;

// One Telegram message whose document we stream back over HTTP. cacheKey
// scopes the media/chunk caches (a part id or an "audio:<sessionId>" tag).
// statsKey groups live throughput by the archive the viewer is watching.
type StreamSource = {
  cacheKey: string;
  statsKey: string;
  chatId: string;
  messageId: string;
  totalSize: number;
  contentType: string;
  // How long the browser may keep fetched ranges (Cache-Control max-age).
  // Audio tracks get a full day — the Twitch overlay reloads them on every
  // VOD visit; video defaults to an hour.
  cacheSeconds?: number;
};

// Live throughput for an archive being streamed from Telegram, surfaced in the
// admin panel so speed can be seen without tailing container logs.
type LiveStreamStat = {
  mbpsFromTelegram: number;
  mbpsToClient: number;
  servedBytes: number;
  updatedAt: number;
};

@Injectable()
export class TelegramStreamService {
  private readonly logger = new Logger(TelegramStreamService.name);
  private readonly mediaCache = new Map<
    string,
    { media: Api.TypeMessageMedia; fetchedAt: number }
  >();
  // LRU chunk cache: key `${cacheKey}:${alignedOffset}` -> raw 512 KB chunk.
  private readonly chunkCache = new Map<string, Buffer>();
  private chunkCacheBytes = 0;
  // Latest throughput sample per statsKey (archive id), for the panel widget.
  private readonly liveStats = new Map<string, LiveStreamStat>();
  // Concurrency gate for the shared MTProto connection (see the constant).
  private activeStreams = 0;
  private readonly slotWaiters: Array<() => void> = [];

  /** True while at least one HTTP response is pulling data from Telegram. */
  hasActiveStreams() {
    return this.activeStreams > 0;
  }

  /** Current Telegram throughput for an archive, or null when idle. */
  getLiveStats(statsKey: string) {
    const stat = this.liveStats.get(statsKey);
    if (!stat) return null;
    if (Date.now() - stat.updatedAt > LIVE_STATS_TTL_MS) {
      this.liveStats.delete(statsKey);
      return null;
    }
    return {
      mbpsFromTelegram: Number(stat.mbpsFromTelegram.toFixed(2)),
      mbpsToClient: Number(stat.mbpsToClient.toFixed(2)),
      servedMb: Math.round(stat.servedBytes / 1_048_576),
    };
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramClientService: TelegramClientService,
  ) {}

  /**
   * Stream one uploaded video part straight from Telegram into an HTTP
   * response, honouring Range requests so the web player can seek.
   */
  async streamToResponse(
    sessionId: string,
    partIndex: number,
    req: any,
    res: any,
    downloadName: string | null = null,
  ) {
    const part = await this.prisma.telegramUploadPart.findUnique({
      where: {
        streamSessionId_partIndex: { streamSessionId: sessionId, partIndex },
      },
    });

    if (!part) {
      throw new NotFoundException(
        `Telegram copy of archive ${sessionId} (part ${partIndex}) was not found.`,
      );
    }

    const totalSize = Number(part.fileSizeBytes ?? 0);

    if (!Number.isFinite(totalSize) || totalSize <= 0) {
      throw new NotFoundException(
        `Telegram part ${partIndex} of archive ${sessionId} has no recorded size.`,
      );
    }

    await this.streamSourceToResponse(
      {
        cacheKey: part.id,
        statsKey: sessionId,
        chatId: part.chatId,
        messageId: part.messageId,
        totalSize,
        contentType: "video/mp4",
      },
      req,
      res,
      downloadName,
    );
  }

  /**
   * Stream the standalone audio track of a session from Telegram. Used when
   * the local .m4a was already cleaned up but the Telegram copy still exists.
   */
  async streamAudioToResponse(
    sessionId: string,
    req: any,
    res: any,
    downloadName: string | null = null,
  ) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id: sessionId },
    });

    if (
      !session ||
      session.audioDeletedAt ||
      !session.telegramAudioMessageId ||
      !session.telegramAudioChatId
    ) {
      throw new NotFoundException(
        `Telegram copy of the audio track for archive ${sessionId} was not found.`,
      );
    }

    const totalSize = Number(session.audioSizeBytes ?? 0);

    if (!Number.isFinite(totalSize) || totalSize <= 0) {
      throw new NotFoundException(
        `Audio track of archive ${sessionId} has no recorded size.`,
      );
    }

    await this.streamSourceToResponse(
      {
        cacheKey: `audio:${session.id}`,
        statsKey: session.id,
        chatId: session.telegramAudioChatId,
        messageId: session.telegramAudioMessageId,
        totalSize,
        contentType: "audio/mp4",
        cacheSeconds: 86_400,
      },
      req,
      res,
      downloadName,
    );
  }

  private async streamSourceToResponse(
    source: StreamSource,
    req: any,
    res: any,
    downloadName: string | null,
  ) {
    const releaseSlot = await this.acquireStreamSlot();

    try {
      await this.streamSourceWithSlot(source, req, res, downloadName, releaseSlot);
    } catch (error) {
      // On a successful start the slot is released by finalize(); make sure a
      // failure before that point does not leak it (releasing twice is a no-op).
      releaseSlot();
      throw error;
    }
  }

  private async streamSourceWithSlot(
    source: StreamSource,
    req: any,
    res: any,
    downloadName: string | null,
    releaseSlot: () => void,
  ) {
    const totalSize = source.totalSize;

    // Resolve everything that can fail BEFORE writing the response head.
    const client = await this.telegramClientService.getClient();
    let media = await this.resolveMedia(source);

    // The client may have gone away while this request waited for a stream
    // slot or for Telegram; its "close" event has already fired, so the
    // listener below would never run and the slot would leak.
    if (res.destroyed || res.writableEnded) {
      releaseSlot();
      return;
    }

    const range = req.headers.range as string | undefined;
    let start = 0;
    let end = totalSize - 1;
    let statusCode = 200;

    if (range) {
      const parsedRange = parseMediaRange(range, totalSize);
      if (!parsedRange) {
        res.writeHead(416, { "Content-Range": `bytes */${totalSize}` });
        res.end();
        releaseSlot();
        return;
      }
      start = parsedRange.start;
      end = parsedRange.end;
      statusCode = 206;
    }

    if (downloadName) {
      res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    }

    res.writeHead(statusCode, {
      "Content-Length": end - start + 1,
      "Content-Type": source.contentType,
      "Accept-Ranges": "bytes",
      // Let the browser keep fetched ranges (the mp4 index in particular) so
      // repeated seeks don't re-download them through Telegram.
      "Cache-Control": `private, max-age=${source.cacheSeconds ?? 3600}`,
      ...(statusCode === 206
        ? { "Content-Range": `bytes ${start}-${end}/${totalSize}` }
        : {}),
    });

    const resolveMedia = (force: boolean) => this.resolveMedia(source, force);
    const parallelChunks = this.getParallelChunks();
    const cacheGet = (offset: number) => this.cacheGet(`${source.cacheKey}:${offset}`);
    const cachePut = (offset: number, buffer: Buffer) =>
      this.cachePut(`${source.cacheKey}:${offset}`, buffer);

    // Throughput accounting (logged periodically + on close). `downloaded`
    // counts raw bytes pulled from Telegram; `served` counts bytes handed to
    // the client (a re-watched range is served from cache without downloading).
    const logger = this.logger;
    const startedAt = Date.now();
    let downloadedBytes = 0;
    let servedBytes = 0;

    async function* byteRange() {
      let position = start;
      let retries = 0;
      let lastErrorPosition = -1;
      let refRefreshes = 0;

      while (position <= end) {
        // Serve everything we already have in the LRU cache first — typical
        // for the mp4 index, re-watched ranges and timeline previews.
        for (;;) {
          const aligned = Math.floor(position / CHUNK_SIZE) * CHUNK_SIZE;
          const cached = cacheGet(aligned);
          if (!cached) break;

          let buffer = cached.subarray(position - aligned);
          const remaining = end - position + 1;
          if (buffer.length > remaining) {
            buffer = buffer.subarray(0, remaining);
          }
          if (buffer.length === 0) return;

          servedBytes += buffer.length;
          yield buffer;
          position += buffer.length;
          if (position > end) return;
        }

        const alignedStart = Math.floor(position / CHUNK_SIZE) * CHUNK_SIZE;
        let skip = position - alignedStart;
        let chunkOffset = alignedStart;

        // N interleaved iterators: worker j reads chunks j, j+N, j+2N, ...
        // Consuming them round-robin restores sequential order while keeping
        // N requests to Telegram in flight at any moment.
        const iterators = Array.from({ length: parallelChunks }, (_, worker) =>
          client
            .iterDownload({
              file: media as Api.TypeMessageMedia,
              offset: returnBigInt(alignedStart + worker * CHUNK_SIZE),
              requestSize: CHUNK_SIZE,
              stride: parallelChunks * CHUNK_SIZE,
            })
            [Symbol.asyncIterator](),
        );

        const pending = iterators.map((iterator) => iterator.next());
        let worker = 0;

        try {
          for (;;) {
            const result = await pending[worker];

            if (result.done) {
              return;
            }

            // Immediately re-arm this worker so its next chunk downloads
            // while the other workers' chunks are being consumed.
            pending[worker] = iterators[worker].next();

            const raw = Buffer.isBuffer(result.value)
              ? result.value
              : Buffer.from(result.value);
            downloadedBytes += raw.length;
            cachePut(chunkOffset, raw);
            chunkOffset += raw.length;

            let buffer = raw;

            if (skip > 0) {
              if (buffer.length <= skip) {
                skip -= buffer.length;
                worker = (worker + 1) % parallelChunks;
                continue;
              }
              buffer = buffer.subarray(skip);
              skip = 0;
            }

            const remaining = end - position + 1;
            if (buffer.length > remaining) {
              buffer = buffer.subarray(0, remaining);
            }

            servedBytes += buffer.length;
            yield buffer;
            position += buffer.length;

            if (position > end) {
              return;
            }

            worker = (worker + 1) % parallelChunks;
          }
        } catch (error) {
          const message = String(error);

          // The cached file_reference expires periodically on long streams;
          // refresh the message and resume from the current position.
          if (message.includes("FILE_REFERENCE")) {
            refRefreshes += 1;
            if (refRefreshes > 3) throw error;
            media = await resolveMedia(true);
            continue;
          }

          // Any other transient failure (timeout, dropped chunk, brief flood):
          // retry the current position a few times with backoff instead of
          // killing the whole response. Reset the counter whenever we managed
          // to advance since the last error.
          if (position !== lastErrorPosition) {
            retries = 0;
            lastErrorPosition = position;
          }
          retries += 1;
          if (retries <= MAX_CHUNK_RETRIES) {
            logger.warn(
              `Telegram stream ${source.cacheKey}: chunk error at byte ${position} ` +
                `(attempt ${retries}/${MAX_CHUNK_RETRIES}): ${message}`,
            );
            await sleep(RETRY_BASE_DELAY_MS * retries);
            continue;
          }
          throw error;
        } finally {
          // Swallow rejections of requests still in flight and close the
          // iterators; otherwise abandoned promises crash the process.
          for (const request of pending) {
            void Promise.resolve(request).catch(() => undefined);
          }
          for (const iterator of iterators) {
            try {
              void iterator.return?.(undefined);
            } catch {
              // Already closed.
            }
          }
        }
      }
    }

    const readable = Readable.from(byteRange());

    // Log the live throughput so a "слишком медленно" complaint can be checked
    // against actual numbers (MB/s from Telegram vs. delivered to the client).
    let lastLogAt = startedAt;
    let lastDownloaded = 0;
    let lastServed = 0;
    const liveStats = this.liveStats;
    let lastLoggedAt = startedAt;
    const speedTimer = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastLogAt) / 1000;
      if (dt <= 0) return;
      const dlDelta = downloadedBytes - lastDownloaded;
      const servedDelta = servedBytes - lastServed;
      lastLogAt = now;
      lastDownloaded = downloadedBytes;
      lastServed = servedBytes;
      // Stay quiet while the player is paused / fully buffered.
      if (dlDelta === 0 && servedDelta === 0) return;

      const mbpsFromTelegram = dlDelta / 1_048_576 / dt;
      const mbpsToClient = servedDelta / 1_048_576 / dt;

      // Publish for the panel widget every interval...
      liveStats.set(source.statsKey, {
        mbpsFromTelegram,
        mbpsToClient,
        servedBytes,
        updatedAt: now,
      });

      // ...but only write the (noisier) console line every ~6s.
      if (now - lastLoggedAt >= 6_000) {
        lastLoggedAt = now;
        logger.log(
          `Telegram stream ${source.cacheKey}: ${mbpsFromTelegram.toFixed(2)} MB/s ` +
            `from Telegram, ${mbpsToClient.toFixed(2)} MB/s to client ` +
            `(served ${(servedBytes / 1_048_576).toFixed(0)} MB)`,
        );
      }
    }, SPEED_LOG_INTERVAL_MS);
    speedTimer.unref();

    let finalized = false;
    const finalize = () => {
      if (finalized) return;
      finalized = true;
      clearInterval(speedTimer);
      releaseSlot();
      if (servedBytes === 0) return;
      const elapsed = (Date.now() - startedAt) / 1000;
      logger.log(
        `Telegram stream ${source.cacheKey} finished: served ` +
          `${(servedBytes / 1_048_576).toFixed(1)} MB (downloaded ` +
          `${(downloadedBytes / 1_048_576).toFixed(1)} MB from Telegram) in ` +
          `${elapsed.toFixed(1)}s — avg ` +
          `${(downloadedBytes / 1_048_576 / Math.max(0.001, elapsed)).toFixed(2)} MB/s ` +
          `from Telegram, range ${start}-${end}`,
      );
    };

    res.once("close", () => {
      readable.destroy();
      finalize();
    });
    readable.once("end", finalize);
    readable.once("error", (error) => {
      finalize();
      this.logger.warn(
        `Telegram stream ${source.cacheKey} failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      try {
        res.destroy();
      } catch {
        // The socket may already be gone.
      }
    });

    readable.pipe(res);
  }

  private getParallelChunks() {
    const configured = Number.parseInt(process.env.TELEGRAM_STREAM_PARALLELISM ?? "", 10);

    return Number.isFinite(configured) && configured >= 1 && configured <= 32
      ? configured
      : DEFAULT_PARALLEL_CHUNKS;
  }

  private getMaxConcurrentStreams() {
    const configured = Number.parseInt(
      process.env.TELEGRAM_STREAM_MAX_CONCURRENT ?? "",
      10,
    );

    return Number.isFinite(configured) && configured >= 1 && configured <= 16
      ? configured
      : DEFAULT_MAX_CONCURRENT_STREAMS;
  }

  /**
   * Take a slot in the stream-concurrency gate, waiting briefly when all
   * slots are busy (a seek storm). Returns an idempotent release callback.
   */
  private async acquireStreamSlot(): Promise<() => void> {
    // Queue behind existing waiters so slots are handed out in FIFO order.
    if (this.activeStreams >= this.getMaxConcurrentStreams() || this.slotWaiters.length > 0) {
      await new Promise<void>((resolve, reject) => {
        const waiter = () => {
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(() => {
          const index = this.slotWaiters.indexOf(waiter);
          if (index !== -1) this.slotWaiters.splice(index, 1);
          reject(
            new ServiceUnavailableException(
              "Слишком много одновременных потоков из Telegram — повторите чуть позже.",
            ),
          );
        }, STREAM_SLOT_WAIT_MS);
        this.slotWaiters.push(waiter);
      });
    }

    this.activeStreams += 1;
    let released = false;

    return () => {
      if (released) return;
      released = true;
      this.activeStreams -= 1;
      const next = this.slotWaiters.shift();
      if (next) next();
    };
  }

  private getCacheLimitBytes() {
    const configured = Number.parseInt(process.env.TELEGRAM_STREAM_CACHE_MB ?? "", 10);

    return (
      (Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_CACHE_MB) *
      1024 *
      1024
    );
  }

  private cacheGet(key: string): Buffer | null {
    const buffer = this.chunkCache.get(key);
    if (!buffer) return null;

    // Refresh LRU position.
    this.chunkCache.delete(key);
    this.chunkCache.set(key, buffer);
    return buffer;
  }

  private cachePut(key: string, buffer: Buffer) {
    const limit = this.getCacheLimitBytes();
    if (limit <= 0 || buffer.length === 0 || this.chunkCache.has(key)) return;

    this.chunkCache.set(key, buffer);
    this.chunkCacheBytes += buffer.length;

    while (this.chunkCacheBytes > limit) {
      const oldestKey = this.chunkCache.keys().next().value as string | undefined;
      if (oldestKey === undefined) break;

      const oldest = this.chunkCache.get(oldestKey);
      this.chunkCache.delete(oldestKey);
      this.chunkCacheBytes -= oldest?.length ?? 0;
    }
  }

  private async resolveMedia(source: StreamSource, forceRefresh = false) {
    const cached = this.mediaCache.get(source.cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.fetchedAt < MEDIA_CACHE_TTL_MS) {
      return cached.media;
    }

    const client = await this.telegramClientService.getClient();
    const entity = await this.telegramClientService.resolveChat(source.chatId);
    const messages = await client.getMessages(entity, {
      ids: [Number(source.messageId)],
    });
    const media = messages?.[0]?.media;

    if (!media) {
      throw new NotFoundException(
        "The Telegram message with this file no longer exists.",
      );
    }

    this.mediaCache.set(source.cacheKey, { media, fetchedAt: Date.now() });

    while (this.mediaCache.size > MEDIA_CACHE_MAX_ENTRIES) {
      const oldestKey = this.mediaCache.keys().next().value as string | undefined;
      if (oldestKey === undefined) break;
      this.mediaCache.delete(oldestKey);
    }

    return media;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
