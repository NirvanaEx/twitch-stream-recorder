import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Readable } from "node:stream";
import { Api, type TelegramClient } from "telegram";
import { returnBigInt } from "telegram/Helpers";
import { PrismaService } from "../prisma/prisma.service";
import { parseMediaRange } from "../recording/playback.utils";
import { TelegramClientService } from "./telegram-client.service";
import { abortableDelay, DownloadAbortedError, TelegramChunkScheduler } from "./telegram-chunk-scheduler";

// MTProto upload.getFile requires the offset to be 4 KB aligned and the chunk
// size to divide 1 MB; 512 KB satisfies both and is the maximum allowed.
const CHUNK_SIZE = 512 * 1024;

// Global budget of actual 512 KB downloads, including those whose HTTP
// consumer disconnected. Each response reads ahead up to this many blocks,
// but multiple viewers no longer multiply the budget.
const DEFAULT_PARALLEL_CHUNKS = 6;

// In-memory LRU of downloaded chunks. Seeks usually re-read the same areas
// (the mp4 index, recently watched ranges, timeline previews), so serving
// them from RAM removes the multi-second round-trip to Telegram. Buffers live
// OUTSIDE the V8 heap, so this must stay well below the container's memory
// limit — 64 MB covers the mp4 index and the recent window without pushing a
// small VPS into swap/OOM (192 MB did exactly that).
const DEFAULT_CACHE_MB = 64;

// Bound HTTP consumers and their read-ahead memory independently of the
// global download budget. Disconnects also cancel their queued work.
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
// Includes GramJS's automatic FLOOD_WAIT (up to 60 s). This is a deadline for
// one block, not for the entire response or for a deliberately paused player.
const CHUNK_TIMEOUT_MS = 75_000;

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
  kind: "video" | "audio";
  // 1-based part number for split recordings; null for audio tracks.
  partIndex: number | null;
  // How long the browser may keep fetched ranges (Cache-Control max-age).
  // Audio tracks get a full day — the Twitch overlay reloads them on every
  // VOD visit; video defaults to an hour.
  cacheSeconds?: number;
};

// Live throughput of ONE HTTP response pulling from Telegram, surfaced in the
// admin panel so speed can be seen without tailing container logs. Keyed per
// response rather than per archive: a viewer scrubbing the timeline has
// several responses open at once, and they used to overwrite each other's
// numbers, so the panel showed whichever sample landed last instead of the sum.
type LiveStreamStat = {
  id: number;
  statsKey: string;
  cacheKey: string;
  kind: "video" | "audio";
  partIndex: number | null;
  rangeStart: number;
  rangeEnd: number;
  totalSize: number;
  startedAt: number;
  // Bytes pulled from Telegram and actually handed to the response...
  downloadedBytes: number;
  // Kept for response-schema compatibility. Downloads that outlive their
  // consumer are attributed to the global scheduler, not to a closed HTTP
  // response; global waste counts bytes that could not be retained in cache.
  wastedBytes: number;
  servedBytes: number;
  mbpsFromTelegram: number;
  mbpsToClient: number;
  updatedAt: number;
};

@Injectable()
export class TelegramStreamService {
  private readonly logger = new Logger(TelegramStreamService.name);
  private readonly mediaCache = new Map<
    string,
    { media: Api.TypeMessageMedia; fetchedAt: number }
  >();
  private readonly mediaRequests = new Map<string, Promise<Api.TypeMessageMedia>>();
  private downloadBlockedUntil = 0;
  // LRU chunk cache: key `${cacheKey}:${alignedOffset}` -> raw 512 KB chunk.
  private readonly chunkCache = new Map<string, Buffer>();
  private chunkCacheBytes = 0;
  // One entry per in-flight HTTP response, for the panel widget.
  private readonly liveStreams = new Map<number, LiveStreamStat>();
  private streamSeq = 0;
  // Every byte pulled from Telegram by any stream, discarded read-ahead
  // included — the honest load on the single MTProto connection.
  private totalBytesFromTelegram = 0;
  // Subset downloaded without a consumer and not retained in the cache.
  // Tracked globally because the HTTP response may already have closed.
  private totalWastedBytes = 0;
  private globalMbps = 0;
  private globalWastedMbps = 0;
  private globalSampleBytes = 0;
  private globalSampleWasted = 0;
  private globalSampleAt = 0;
  private globalTimer: NodeJS.Timeout | null = null;
  // Concurrency gate for the shared MTProto connection (see the constant).
  private activeStreams = 0;
  private readonly slotWaiters: Array<() => void> = [];
  private readonly chunks = new TelegramChunkScheduler({
    parallelism: () => this.getParallelChunks(),
    timeoutMs: () => CHUNK_TIMEOUT_MS,
    cacheGet: (key) => this.cacheGet(key),
    cachePut: (key, value) => this.cachePut(key, value),
    downloaded: (bytes, wasted) => {
      this.totalBytesFromTelegram += bytes;
      if (wasted) this.totalWastedBytes += bytes;
    },
    recoveryFailed: (error) => this.logger.warn(`Telegram recovery failed: ${String(error)}`),
  });

  /** Includes real downloads still finishing after their HTTP response closed. */
  hasActiveStreams() {
    return this.activeStreams > 0 || this.chunks.activeDownloads > 0;
  }

  /**
   * Telegram throughput for one archive: the sum over its open responses, a
   * per-response breakdown for the hover panel, and the server-wide totals.
   * Null when nothing is streaming that archive.
   */
  getLiveStats(statsKey: string) {
    const all = this.listLiveStreams();
    const mine = all.filter((stat) => stat.statsKey === statsKey);

    if (mine.length === 0) {
      return null;
    }

    const sum = (stats: LiveStreamStat[], pick: (stat: LiveStreamStat) => number) =>
      stats.reduce((acc, stat) => acc + pick(stat), 0);

    return {
      // Kept flat for the existing chip: this archive's combined speed.
      mbpsFromTelegram: round2(sum(mine, (stat) => stat.mbpsFromTelegram)),
      mbpsToClient: round2(sum(mine, (stat) => stat.mbpsToClient)),
      servedMb: Math.round(sum(mine, (stat) => stat.servedBytes) / 1_048_576),
      streams: mine.map((stat) => this.toPublicStream(stat)),
      global: {
        // Includes the discarded read-ahead, so it can exceed the sum of the
        // per-stream numbers — that gap IS the waste.
        mbpsFromTelegram: round2(this.globalMbps),
        mbpsWasted: round2(this.globalWastedMbps),
        mbpsToClient: round2(sum(all, (stat) => stat.mbpsToClient)),
        activeStreams: all.length,
        activeDownloads: this.chunks.activeDownloads,
        queuedDownloads: this.chunks.queuedDownloads,
      },
    };
  }

  /** Every stream currently reading from Telegram, plus the server totals. */
  getGlobalStats() {
    const all = this.listLiveStreams();

    return {
      mbpsFromTelegram: round2(this.globalMbps),
      mbpsWasted: round2(this.globalWastedMbps),
      mbpsToClient: round2(all.reduce((acc, stat) => acc + stat.mbpsToClient, 0)),
      activeStreams: all.length,
      activeDownloads: this.chunks.activeDownloads,
      queuedDownloads: this.chunks.queuedDownloads,
      streams: all.map((stat) => this.toPublicStream(stat)),
    };
  }

  /** Live entries, dropping any that a missed finalize() left behind. */
  private listLiveStreams() {
    const now = Date.now();
    const alive: LiveStreamStat[] = [];

    for (const [id, stat] of this.liveStreams) {
      if (now - stat.updatedAt > LIVE_STATS_TTL_MS) {
        this.liveStreams.delete(id);
        continue;
      }
      alive.push(stat);
    }

    return alive;
  }

  private toPublicStream(stat: LiveStreamStat) {
    return {
      id: stat.id,
      archiveId: stat.statsKey,
      kind: stat.kind,
      partIndex: stat.partIndex,
      mbpsFromTelegram: round2(stat.mbpsFromTelegram),
      mbpsToClient: round2(stat.mbpsToClient),
      servedMb: round1(stat.servedBytes / 1_048_576),
      downloadedMb: round1(stat.downloadedBytes / 1_048_576),
      wastedMb: round1(stat.wastedBytes / 1_048_576),
      elapsedSec: Math.round((Date.now() - stat.startedAt) / 1000),
      // Where in the file this response is reading, as a 0..1 fraction.
      rangeFrom: stat.totalSize > 0 ? round2(stat.rangeStart / stat.totalSize) : 0,
      rangeTo: stat.totalSize > 0 ? round2((stat.rangeEnd + 1) / stat.totalSize) : 0,
    };
  }

  /**
   * The server-wide rate is sampled on one shared ticker instead of being
   * derived from the per-stream samples: those are taken at different moments
   * and miss the discarded read-ahead entirely.
   */
  private startGlobalTicker() {
    if (this.globalTimer) return;

    this.globalSampleAt = Date.now();
    this.globalSampleBytes = this.totalBytesFromTelegram;
    this.globalSampleWasted = this.totalWastedBytes;

    this.globalTimer = setInterval(() => {
      const now = Date.now();
      const dt = (now - this.globalSampleAt) / 1000;

      if (dt > 0) {
        this.globalMbps =
          (this.totalBytesFromTelegram - this.globalSampleBytes) / 1_048_576 / dt;
        this.globalWastedMbps =
          (this.totalWastedBytes - this.globalSampleWasted) / 1_048_576 / dt;
        this.globalSampleAt = now;
        this.globalSampleBytes = this.totalBytesFromTelegram;
        this.globalSampleWasted = this.totalWastedBytes;
      }

      // Nothing left to measure: stop the ticker and settle back to zero.
      if (this.liveStreams.size === 0 && this.chunks.activeDownloads === 0 && this.globalMbps === 0) {
        clearInterval(this.globalTimer!);
        this.globalTimer = null;
      }
    }, SPEED_LOG_INTERVAL_MS);

    this.globalTimer.unref();
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
        kind: "video",
        partIndex,
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
        kind: "audio",
        partIndex: null,
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
    const controller = new AbortController();
    let releaseSlot: (() => void) | undefined;
    const onClose = () => { controller.abort(); releaseSlot?.(); };
    res.once("close", onClose);
    if (res.destroyed || res.writableEnded) controller.abort();

    try {
      releaseSlot = await this.acquireStreamSlot(controller.signal);
      await this.streamSourceWithSlot(source, req, res, downloadName, releaseSlot, controller);
    } catch (error) {
      // On a successful start the slot is released by finalize(); make sure a
      // failure before that point does not leak it (releasing twice is a no-op).
      releaseSlot?.();
      res.removeListener("close", onClose);
      if (controller.signal.aborted) return;
      throw error;
    }
  }

  private async streamSourceWithSlot(
    source: StreamSource,
    req: any,
    res: any,
    downloadName: string | null,
    releaseSlot: () => void,
    controller: AbortController,
  ) {
    const totalSize = source.totalSize;

    // Resolve Telegram lazily inside the bounded chunk jobs. A fully cached
    // range (or an invalid range) must not wait for a Telegram reconnection.
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

    const parallelChunks = this.getParallelChunks();

    // Throughput accounting (logged periodically + on close). `downloaded`
    // counts raw bytes pulled from Telegram; `served` counts bytes handed to
    // the client (a re-watched range is served from cache without downloading).
    const logger = this.logger;
    const startedAt = Date.now();
    let downloadedBytes = 0;
    let servedBytes = 0;

    // Registered here, once the response is committed, and removed by
    // finalize(); the panel reads these entries.
    this.streamSeq += 1;
    const stat: LiveStreamStat = {
      id: this.streamSeq,
      statsKey: source.statsKey,
      cacheKey: source.cacheKey,
      kind: source.kind,
      partIndex: source.partIndex,
      rangeStart: start,
      rangeEnd: end,
      totalSize,
      startedAt,
      downloadedBytes: 0,
      wastedBytes: 0,
      servedBytes: 0,
      mbpsFromTelegram: 0,
      mbpsToClient: 0,
      updatedAt: startedAt,
    };
    this.liveStreams.set(stat.id, stat);
    this.startGlobalTicker();

    const scheduler = this.chunks;
    const service = this;
    const signal = controller.signal;
    type SettledChunk = { buffer: Buffer } | { error: unknown };

    async function* byteRange() {
      let position = start;
      let nextOffset = Math.floor(start / CHUNK_SIZE) * CHUNK_SIZE;
      const pending = new Map<number, Promise<SettledChunk>>();
      const fill = () => {
        while (!signal.aborted && pending.size < parallelChunks && nextOffset <= end) {
          const offset = nextOffset;
          nextOffset += CHUNK_SIZE;
          let transport: TelegramClient | undefined;
          // Observe EVERY rejection immediately, including read-ahead that
          // never becomes the next block after a seek or an earlier error.
          const request = scheduler.read(
            `${source.cacheKey}:${offset}`, signal,
            (operationSignal, hasConsumers) => service.downloadChunk(source, offset, operationSignal,
              (next) => { transport = next; }, hasConsumers),
            () => transport ? service.telegramClientService.recoverClient(transport) : Promise.resolve(),
          ).then((result): SettledChunk => {
            downloadedBytes += result.downloadedBytes;
            return { buffer: result.buffer };
          }, (error): SettledChunk => ({ error }));
          pending.set(offset, request);
        }
      };
      try {
        fill();
        while (position <= end && !signal.aborted) {
          const aligned = Math.floor(position / CHUNK_SIZE) * CHUNK_SIZE;
          const result = await pending.get(aligned)!;
          pending.delete(aligned);
          if (signal.aborted) return;
          if ("error" in result) throw result.error;
          const skip = position - aligned;
          const buffer = result.buffer.subarray(skip, skip + Math.min(
            result.buffer.length - skip, end - position + 1,
          ));
          if (!buffer.length) throw new Error(`Telegram returned an empty block at ${position}.`);
          // Retain a bounded window; the scheduler checks RAM and shared
          // in-flight downloads on EVERY offset, not only before a cache miss.
          fill();
          servedBytes += buffer.length;
          yield buffer;
          position += buffer.length;
        }
      } finally {
        controller.abort();
        // Active RPCs finish in the shared scheduler and warm the cache;
        // queued blocks with no remaining consumer are removed immediately.
        pending.clear();
      }
    }

    const readable = Readable.from(byteRange());

    // Log the live throughput so a "слишком медленно" complaint can be checked
    // against actual numbers (MB/s from Telegram vs. delivered to the client).
    let lastLogAt = startedAt;
    let lastDownloaded = 0;
    let lastServed = 0;
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

      const mbpsFromTelegram = dlDelta / 1_048_576 / dt;
      const mbpsToClient = servedDelta / 1_048_576 / dt;

      // Publish for the panel widget every interval — including the zeroes of
      // a paused player, so the entry stays visible (and honest) instead of
      // ageing out and making the stream look finished.
      stat.mbpsFromTelegram = mbpsFromTelegram;
      stat.mbpsToClient = mbpsToClient;
      stat.downloadedBytes = downloadedBytes;
      stat.servedBytes = servedBytes;
      stat.updatedAt = now;

      // Stay quiet in the log while the player is paused / fully buffered.
      if (dlDelta === 0 && servedDelta === 0) return;

      // ...and only write the (noisier) console line every ~6s.
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
      this.liveStreams.delete(stat.id);
      controller.abort();
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

  private async downloadChunk(
    source: StreamSource,
    offset: number,
    signal: AbortSignal,
    onClient: (client: TelegramClient) => void,
    hasConsumers: () => boolean,
  ): Promise<Buffer> {
    let client: TelegramClient | undefined;
    let media: Api.TypeMessageMedia | undefined;
    let forceRefresh = false;
    for (let attempt = 0; ; attempt++) {
      if (signal.aborted) throw new DownloadAbortedError();
      this.assertDownloadAllowed();
      try {
        client ??= await this.telegramClientService.getClient();
        onClient(client);
        media ??= await this.resolveMedia(source, forceRefresh);
        if (signal.aborted) throw new DownloadAbortedError();
        const iterator = client.iterDownload({
          file: media, offset: returnBigInt(offset), requestSize: CHUNK_SIZE, limit: 1,
        })[Symbol.asyncIterator]();
        const result = await iterator.next();
        const buffer = result.done ? Buffer.alloc(0) : Buffer.from(result.value);
        const expected = Math.min(CHUNK_SIZE, source.totalSize - offset);
        if (buffer.length !== expected) throw new Error(`Incomplete Telegram block at ${offset}.`);
        return buffer;
      } catch (error) {
        const seconds = Number((error as { seconds?: number })?.seconds);
        if (Number.isFinite(seconds) && seconds > 0) {
          // Long FLOOD_WAITs escape GramJS's automatic sleep. Remember the
          // deadline across responses/seeks and fail this request, instead of
          // letting the chunk timeout recycle a healthy, rate-limited client.
          this.downloadBlockedUntil = Math.max(this.downloadBlockedUntil, Date.now() + seconds * 1000);
          throw error;
        }
        if (signal.aborted || !hasConsumers()) throw new DownloadAbortedError();
        if (attempt >= MAX_CHUNK_RETRIES) throw error;
        const message = String(error);
        if (message.includes("FILE_REFERENCE") || message.includes("FILEREF_UPGRADE")) {
          media = undefined;
          forceRefresh = true;
        } else {
          this.logger.warn(`Telegram chunk ${source.cacheKey}:${offset} retry ${attempt + 1}: ${message}`);
          await abortableDelay(RETRY_BASE_DELAY_MS * (attempt + 1), signal);
        }
        client = undefined;
      }
    }
  }

  private assertDownloadAllowed() {
    const remaining = this.downloadBlockedUntil - Date.now();
    if (remaining > 0) throw new ServiceUnavailableException(`Telegram FLOOD_WAIT: retry in ${Math.ceil(remaining / 1000)} seconds.`);
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
  private async acquireStreamSlot(signal: AbortSignal): Promise<() => void> {
    if (signal.aborted) throw new DownloadAbortedError();
    // Queue behind existing waiters so slots are handed out in FIFO order.
    if (this.activeStreams >= this.getMaxConcurrentStreams() || this.slotWaiters.length > 0) {
      await new Promise<void>((resolve, reject) => {
        const waiter = () => {
          clearTimeout(timer);
          signal.removeEventListener("abort", onAbort);
          // Reserve synchronously, before resolving the next waiter. A new
          // request cannot steal this slot between promise microtasks.
          this.activeStreams += 1;
          resolve();
        };
        const remove = () => {
          const index = this.slotWaiters.indexOf(waiter);
          if (index !== -1) this.slotWaiters.splice(index, 1);
          clearTimeout(timer);
          signal.removeEventListener("abort", onAbort);
        };
        const onAbort = () => { remove(); reject(new DownloadAbortedError()); };
        const timer = setTimeout(() => {
          remove();
          reject(
            new ServiceUnavailableException(
              "Слишком много одновременных потоков из Telegram — повторите чуть позже.",
            ),
          );
        }, STREAM_SLOT_WAIT_MS);
        signal.addEventListener("abort", onAbort, { once: true });
        this.slotWaiters.push(waiter);
      });
    } else {
      this.activeStreams += 1;
    }

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

  /** Returns true when the chunk was stored (false when it was not worth it). */
  private cachePut(key: string, buffer: Buffer) {
    const limit = this.getCacheLimitBytes();
    if (limit <= 0 || buffer.length === 0 || this.chunkCache.has(key)) return false;

    this.chunkCache.set(key, buffer);
    this.chunkCacheBytes += buffer.length;

    while (this.chunkCacheBytes > limit) {
      const oldestKey = this.chunkCache.keys().next().value as string | undefined;
      if (oldestKey === undefined) break;

      const oldest = this.chunkCache.get(oldestKey);
      this.chunkCache.delete(oldestKey);
      this.chunkCacheBytes -= oldest?.length ?? 0;
    }

    return true;
  }

  private async resolveMedia(source: StreamSource, forceRefresh = false) {
    const cached = this.mediaCache.get(source.cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.fetchedAt < MEDIA_CACHE_TTL_MS) {
      return cached.media;
    }

    const pending = this.mediaRequests.get(source.cacheKey);
    if (pending) return pending;
    const request = this.fetchMedia(source).finally(() => this.mediaRequests.delete(source.cacheKey));
    this.mediaRequests.set(source.cacheKey, request);
    return request;
  }

  private async fetchMedia(source: StreamSource) {
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

function round1(value: number) {
  return Number(value.toFixed(1));
}

function round2(value: number) {
  return Number(value.toFixed(2));
}
