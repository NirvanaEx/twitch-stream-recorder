import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { AppSettings, Channel, StreamSession, TelegramUploadPart } from "@prisma/client";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { Api } from "telegram";
import { isArchiveAvailable, isUnderDataRoot } from "../archive-storage/archive-paths";
import { ArchiveBundleService } from "../chat/archive-bundle.service";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { TelegramClientService } from "./telegram-client.service";
import { TelegramStreamService } from "./telegram-stream.service";

const SCAN_INTERVAL_MS = 60_000;

// Uploads and player streaming share ONE MTProto connection: a running
// 1.9 GB part upload starves every viewer (and vice versa), which is what
// made the site "hang" right after a recording finished. While someone is
// watching, new uploads politely wait — but only this long, so uploads can
// never be starved forever by a paused player that keeps its socket open.
const UPLOAD_YIELD_TO_PLAYBACK_MS = 5 * 60_000;
const UPLOAD_YIELD_POLL_MS = 10_000;

// Telegram bots can upload files up to 2000 MB via MTProto. Keep a margin
// below it because ffmpeg segments are cut on keyframes and can overshoot
// the average part size.
const DEFAULT_MAX_PART_MB = 1900;

type SendVideoResult = {
  messageId: string;
  fileId: string | null;
};

type VideoMeta = {
  durationSec: number;
  width: number;
  height: number;
};

type SessionWithChannel = StreamSession & { channel: Channel };

export function buildTelegramMessageUrl(chatId: string, messageId: string): string | null {
  if (chatId.startsWith("@")) {
    return `https://t.me/${chatId.slice(1)}/${messageId}`;
  }

  if (chatId.startsWith("-100")) {
    return `https://t.me/c/${chatId.slice(4)}/${messageId}`;
  }

  return null;
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private scanTimer: NodeJS.Timeout | null = null;
  private ticking = false;
  // sessionId -> overall upload progress (0..100) across all parts.
  private readonly uploadProgress = new Map<string, number>();
  private readonly lastEmittedProgress = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly telegramClientService: TelegramClientService,
    private readonly telegramStreamService: TelegramStreamService,
    private readonly archiveBundleService: ArchiveBundleService,
  ) {}

  async onModuleInit() {
    // Uploads interrupted by a restart should be retried, not stuck forever.
    await this.prisma.streamSession.updateMany({
      where: { telegramStatus: "uploading" },
      data: { telegramStatus: "pending" },
    });

    this.scanTimer = setInterval(() => {
      void this.tick();
    }, SCAN_INTERVAL_MS);

    void this.tick();
  }

  onModuleDestroy() {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }

  /** Ask the service to re-scan for pending work soon (e.g. right after a recording finished). */
  kick() {
    void this.tick();
  }

  /** Overall upload progress for a session in percent, or null when not uploading. */
  getUploadProgress(sessionId: string): number | null {
    return this.uploadProgress.get(sessionId) ?? null;
  }

  /** Aggregated view of the Telegram storage for the admin "Storage" page. */
  async getStorageOverview() {
    const [settings, configured, uploadedCount, parts, freedSessions, awaitingCleanupCount, queueSessions] =
      await Promise.all([
        this.getSettings(),
        this.telegramClientService.isConfigured(),
        this.prisma.streamSession.count({ where: { telegramStatus: "uploaded" } }),
        this.prisma.telegramUploadPart.findMany({ select: { fileSizeBytes: true } }),
        this.prisma.streamSession.findMany({
          where: { localFileDeletedAt: { not: null } },
          select: { fileSizeBytes: true },
        }),
        this.prisma.streamSession.count({
          where: { telegramStatus: "uploaded", localFileDeletedAt: null },
        }),
        this.prisma.streamSession.findMany({
          where: { telegramStatus: { in: ["pending", "uploading", "error"] } },
          include: { channel: true },
          orderBy: { createdAt: "asc" },
          take: 50,
        }),
      ]);

    const sumBytes = (rows: { fileSizeBytes: string | null }[]) =>
      rows.reduce((acc, row) => acc + (Number(row.fileSizeBytes) || 0), 0);

    return {
      enabled: settings.telegramEnabled,
      configured,
      chatId: settings.telegramChatId,
      videoKeepLocalDays: settings.videoKeepLocalDays,
      audioKeepLocalDays: settings.audioKeepLocalDays,
      uploadedCount,
      telegramBytes: String(sumBytes(parts)),
      freedBytes: String(sumBytes(freedSessions)),
      // Uploaded to Telegram but the local copy is still kept (within N days).
      awaitingCleanupCount,
      queue: queueSessions.map((session) => ({
        id: session.id,
        channelLogin: session.channel.twitchLogin,
        channelDisplayName: session.channel.displayName ?? session.channel.twitchLogin,
        title: session.title,
        telegramStatus: session.telegramStatus,
        telegramProgress:
          session.telegramStatus === "uploading"
            ? this.getUploadProgress(session.id)
            : null,
        telegramError: session.telegramError,
        fileSizeBytes: session.fileSizeBytes,
        startedAt: session.startedAt,
      })),
    };
  }

  async getStatus() {
    const settings = await this.getSettings();
    const configured = await this.telegramClientService.isConfigured();

    const status: {
      enabled: boolean;
      chatId: string;
      videoKeepLocalDays: number;
      tokenConfigured: boolean;
      botUsername: string | null;
      chatTitle: string | null;
      error: string | null;
    } = {
      enabled: settings.telegramEnabled,
      chatId: settings.telegramChatId,
      videoKeepLocalDays: settings.videoKeepLocalDays,
      tokenConfigured: configured,
      botUsername: null,
      chatTitle: null,
      error: null,
    };

    if (!configured) {
      status.error = "api_id, api_hash and the bot token are not configured.";
      return status;
    }

    try {
      const client = await this.telegramClientService.getClient();
      const me = await client.getMe();
      status.botUsername = me.username ?? null;

      if (settings.telegramChatId) {
        const chat = await this.telegramClientService.resolveChat(settings.telegramChatId);
        status.chatTitle =
          (chat as { title?: string }).title ??
          (chat as { username?: string }).username ??
          null;
      }
    } catch (error) {
      status.error = error instanceof Error ? error.message : String(error);
    }

    return status;
  }

  async requestUpload(sessionId: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Archive ${sessionId} was not found.`);
    }

    if (session.status === "recording") {
      throw new BadRequestException("Recording is still in progress.");
    }

    if (session.telegramStatus === "uploading") {
      throw new BadRequestException("Telegram upload is already in progress.");
    }

    if (!session.playbackPath || !existsSync(resolve(session.playbackPath))) {
      throw new BadRequestException("Local video file is missing on disk.");
    }

    const settings = await this.getSettings();
    const configured = await this.telegramClientService.isConfigured();

    if (!configured || !settings.telegramChatId) {
      throw new BadRequestException(
        "Telegram is not configured: set api_id, api_hash, the bot token and the chat id in settings.",
      );
    }

    await this.prisma.streamSession.update({
      where: { id: sessionId },
      data: { telegramStatus: "pending", telegramError: null },
    });

    this.emitTelegramUpdate(sessionId, "pending");
    void this.tick();

    return { ok: true };
  }

  private async tick() {
    if (this.ticking) {
      return;
    }

    this.ticking = true;

    try {
      const settings = await this.getSettings();
      const configured = await this.telegramClientService.isConfigured();

      // Local copies expire on their own schedule — the offload does not have
      // to be enabled for the disk cache of already uploaded files to shrink.
      await this.cleanupLocalCopies(settings);

      if (!configured || !settings.telegramChatId) {
        return;
      }

      // Chunks of live broadcasts go first: they are the ones sitting on the
      // disk of a server that is still recording onto it.
      await this.processSegments(settings);
      await this.finishSegmentedSessions(settings);
      await this.processUploads(settings);
    } catch (error) {
      this.logger.warn(
        `Telegram tick failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.ticking = false;
    }
  }

  /**
   * Ship the chunks of segmented captures, including those of broadcasts that
   * are still running.
   *
   * This is the difference between "the recording is safe once the stream ends"
   * and "the recording is safe fifteen minutes in". A chunk closed at 20:15
   * reaches the channel while the streamer is still talking, so a crash, a full
   * disk or a power cut at 23:00 costs the last chunk instead of the evening.
   *
   * Chunks are uploaded oldest-first across all sessions: the ones that have
   * been on the disk longest are the ones worth getting rid of first.
   */
  private async processSegments(settings: AppSettings) {
    for (;;) {
      const segment = await this.prisma.recordingSegment.findFirst({
        where: {
          localPath: { not: null },
          telegramStatus: { in: ["pending", "error"] },
        },
        orderBy: { createdAt: "asc" },
        include: { session: { include: { channel: true } } },
      });

      if (!segment || !segment.localPath) {
        return;
      }

      const logPrefix = `[telegram/${segment.session.channel.twitchLogin}/${segment.session.id}]`;

      if (!existsSync(segment.localPath)) {
        await this.prisma.recordingSegment.update({
          where: { id: segment.id },
          data: {
            telegramStatus: "error",
            telegramError: "The chunk is missing from the local disk.",
          },
        });
        continue;
      }

      await this.yieldToPlayback();

      try {
        let meta: VideoMeta | null = null;
        try {
          meta = await this.probeVideoMeta(segment.localPath);
        } catch {
          // Metadata is best-effort; the upload itself must not fail.
        }

        // The chunk count is unknown while the broadcast is running, so the
        // caption says "chunk N" without a total; the panel and the player
        // read the part rows, not the caption.
        const caption = this.buildCaption(segment.session, segment.index, 0);
        const sent = await this.sendVideo(
          segment.localPath,
          settings.telegramChatId,
          caption,
          meta,
        );

        // The player resolves archives through TelegramUploadPart, so a shipped
        // chunk becomes a part exactly like a chunk of the old split path did —
        // which is why multi-part playback needed no changes.
        await this.prisma.telegramUploadPart.upsert({
          where: {
            streamSessionId_partIndex: {
              streamSessionId: segment.streamSessionId,
              partIndex: segment.index,
            },
          },
          create: {
            streamSessionId: segment.streamSessionId,
            partIndex: segment.index,
            // Filled in when the capture ends and the count is known.
            partCount: 0,
            chatId: settings.telegramChatId,
            messageId: sent.messageId,
            fileId: sent.fileId,
            fileSizeBytes: segment.sizeBytes,
            startOffsetSec: segment.startOffsetSec,
            durationSec: segment.durationSec,
          },
          update: {
            chatId: settings.telegramChatId,
            messageId: sent.messageId,
            fileId: sent.fileId,
          },
        });

        await this.prisma.recordingSegment.update({
          where: { id: segment.id },
          data: { telegramStatus: "uploaded", telegramError: null },
        });

        this.logger.log(`${logPrefix} chunk ${segment.index} is in Telegram.`);
        this.emitTelegramUpdate(segment.session.id, "uploading");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await this.prisma.recordingSegment.update({
          where: { id: segment.id },
          data: { telegramStatus: "error", telegramError: message.slice(0, 500) },
        });
        this.logger.warn(`${logPrefix} chunk ${segment.index} upload failed: ${message}`);
        return; // Stop the pass: the next tick retries from the oldest chunk.
      }
    }
  }

  /**
   * Once a segmented capture is finished and every chunk is in Telegram, stamp
   * the session as uploaded and backfill partCount — the player uses it to know
   * how many parts an archive has.
   */
  private async finishSegmentedSessions(settings: AppSettings) {
    const sessions = await this.prisma.streamSession.findMany({
      where: {
        segmented: true,
        status: "completed",
        telegramStatus: { in: ["none", "pending", "uploading", "error"] },
      },
      include: { channel: true, segments: true },
    });

    for (const session of sessions) {
      if (session.segments.length === 0) {
        continue;
      }

      if (session.segments.some((segment) => segment.telegramStatus !== "uploaded")) {
        continue;
      }

      const partCount = session.segments.length;

      await this.prisma.telegramUploadPart.updateMany({
        where: { streamSessionId: session.id },
        data: { partCount },
      });

      let telegramChatMessageId = session.telegramChatMessageId;

      if (!telegramChatMessageId) {
        try {
          telegramChatMessageId = await this.uploadChatBundle(session, settings.telegramChatId);
        } catch (error) {
          this.logger.warn(
            `[telegram/${session.channel.twitchLogin}/${session.id}] chat bundle upload failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      await this.prisma.streamSession.update({
        where: { id: session.id },
        data: {
          telegramStatus: "uploaded",
          telegramUploadedAt: new Date(),
          telegramError: null,
          telegramChatMessageId,
        },
      });

      this.emitTelegramUpdate(session.id, "uploaded");
      this.logger.log(
        `[telegram/${session.channel.twitchLogin}/${session.id}] all ${partCount} chunk(s) are in Telegram.`,
      );
    }
  }

  private async processUploads(settings: AppSettings) {
    // Manually requested uploads ("pending") run even while auto-upload is
    // disabled; the automatic backfill of untouched sessions ("none") only
    // happens when the feature is enabled.
    const statuses = settings.telegramEnabled ? ["none", "pending"] : ["pending"];

    // Process one session at a time, oldest first, re-querying after each so a
    // long upload doesn't act on stale data.
    for (;;) {
      const session = await this.prisma.streamSession.findFirst({
        where: {
          status: "completed",
          playbackPath: { not: null },
          localFileDeletedAt: null,
          telegramStatus: { in: statuses },
        },
        include: { channel: true },
        orderBy: { createdAt: "asc" },
      });

      if (!session) {
        return;
      }

      await this.yieldToPlayback();
      await this.uploadSession(session, settings.telegramChatId);
      // Free the disk between sessions: with a zero-day local retention a
      // queue of finished recordings would otherwise pile up in full before
      // the first byte is released.
      await this.cleanupLocalCopies(settings);
    }
  }

  /**
   * Wait (bounded) while a viewer is streaming from Telegram, so an upload
   * does not fight the playback for the shared MTProto connection.
   */
  private async yieldToPlayback() {
    if (!this.telegramStreamService.hasActiveStreams()) {
      return;
    }

    this.logger.log(
      "Telegram playback is active — postponing the upload to keep the player smooth.",
    );

    const waitStart = Date.now();

    while (
      this.telegramStreamService.hasActiveStreams() &&
      Date.now() - waitStart < UPLOAD_YIELD_TO_PLAYBACK_MS
    ) {
      await sleep(UPLOAD_YIELD_POLL_MS);
    }
  }

  private async uploadSession(session: SessionWithChannel, chatId: string) {
    const logPrefix = `[telegram/${session.channel.twitchLogin}/${session.id}]`;
    const filePath = resolve(session.playbackPath!);

    if (!existsSync(filePath) || statSync(filePath).size === 0) {
      await this.markUploadError(session.id, "Local video file is missing on disk.");
      return;
    }

    await this.prisma.streamSession.update({
      where: { id: session.id },
      data: { telegramStatus: "uploading", telegramError: null },
    });
    this.uploadProgress.set(session.id, 0);
    this.emitTelegramUpdate(session.id, "uploading");

    // Parts that made it to Telegram during a previous interrupted attempt
    // are reused: a retry resumes from the first missing part instead of
    // re-sending everything (ffmpeg splits the same file into identical
    // segments, so part boundaries are stable across attempts).
    const previousParts = await this.prisma.telegramUploadPart.findMany({
      where: { streamSessionId: session.id },
    });

    let tempDir: string | null = null;

    try {
      // Audio-only session: the recording is a single .m4a — one audio
      // message instead of video parts.
      if (session.audioOnly) {
        if (!session.telegramAudioMessageId) {
          const messageId = await this.uploadAudioTrack(session, chatId, (fraction) => {
            this.reportUploadProgress(session.id, Math.floor(fraction * 100));
          });

          if (!messageId) {
            throw new Error("Audio file is missing on disk or exceeds the Telegram size limit.");
          }
        }

        let audioChatMessageId = session.telegramChatMessageId;

        if (!audioChatMessageId) {
          try {
            audioChatMessageId = await this.uploadChatBundle(session, chatId);
          } catch (error) {
            this.logger.warn(
              `${logPrefix} chat bundle upload failed: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }

        await this.prisma.streamSession.update({
          where: { id: session.id },
          data: {
            telegramStatus: "uploaded",
            telegramUploadedAt: new Date(),
            telegramError: null,
            telegramChatMessageId: audioChatMessageId,
          },
        });

        this.emitTelegramUpdate(session.id, "uploaded");
        this.logger.log(`${logPrefix} audio-only upload finished.`);
        return;
      }

      const fileSize = statSync(filePath).size;
      const maxPartBytes = this.getMaxPartBytes();
      let partPaths = [filePath];

      if (fileSize > maxPartBytes) {
        tempDir = resolve(
          process.env.DATA_DIR ?? "./data",
          "tmp",
          "telegram",
          session.id,
        );
        partPaths = await this.splitIntoParts(filePath, tempDir, maxPartBytes);
        this.logger.log(
          `${logPrefix} split ${Math.round(fileSize / 1024 / 1024)} MB into ${partPaths.length} part(s).`,
        );
      }

      // Leftover parts are only reusable when they belong to the same chat
      // and the same split layout; otherwise drop them and start over.
      const reusableParts = new Map<number, TelegramUploadPart>();
      const previousCompatible =
        previousParts.length > 0 &&
        previousParts.every(
          (part) => part.chatId === chatId && part.partCount === partPaths.length,
        );

      if (previousCompatible) {
        for (const part of previousParts) {
          reusableParts.set(part.partIndex, part);
        }
      } else if (previousParts.length > 0) {
        await this.prisma.telegramUploadPart.deleteMany({
          where: { streamSessionId: session.id },
        });
      }

      let startOffsetSec = 0;

      for (let index = 0; index < partPaths.length; index += 1) {
        const partPath = partPaths[index];
        const existingPart = reusableParts.get(index + 1);

        // Per-part duration keeps chat replay aligned when the web player
        // switches between parts; width/height make Telegram render the
        // upload as a playable video instead of a generic document.
        let meta: VideoMeta | null = null;
        try {
          meta = await this.probeVideoMeta(partPath);
        } catch {
          // Metadata is best-effort; the upload itself must not fail.
        }

        const partDurationSec =
          existingPart?.durationSec ?? (meta ? Math.round(meta.durationSec) : 0);

        if (existingPart) {
          this.logger.log(
            `${logPrefix} part ${index + 1}/${partPaths.length} is already in Telegram, skipping.`,
          );
          this.reportUploadProgress(
            session.id,
            Math.floor(((index + 1) / partPaths.length) * 100),
          );
          startOffsetSec += partDurationSec;
          continue;
        }

        const caption = this.buildCaption(session, index + 1, partPaths.length);

        // Re-check between parts too: a multi-part upload runs for a long
        // time and a viewer may have started watching meanwhile.
        await this.yieldToPlayback();

        this.logger.log(
          `${logPrefix} uploading part ${index + 1}/${partPaths.length} (${Math.round(
            statSync(partPath).size / 1024 / 1024,
          )} MB)...`,
        );

        const sent = await this.sendVideo(partPath, chatId, caption, meta, (fraction) => {
          this.reportUploadProgress(
            session.id,
            Math.floor(((index + fraction) / partPaths.length) * 100),
          );
        });

        await this.prisma.telegramUploadPart.create({
          data: {
            streamSessionId: session.id,
            partIndex: index + 1,
            partCount: partPaths.length,
            chatId,
            messageId: sent.messageId,
            fileId: sent.fileId,
            fileSizeBytes: String(statSync(partPath).size),
            startOffsetSec,
            durationSec: meta ? Math.round(meta.durationSec) : null,
          },
        });

        startOffsetSec += partDurationSec;

        // Drop the segment the moment Telegram has it. Splitting used to hold
        // every part on disk until the whole upload finished, so uploading an
        // 8 GB recording needed 16 GB free — the .mp4 plus a second copy of it
        // chopped up. With two or three broadcasts finishing at once that is
        // what filled the disk and killed the next capture. The .mp4 itself is
        // untouched, so a retry can always re-split from it.
        if (tempDir && partPath !== filePath) {
          try {
            rmSync(partPath, { force: true });
          } catch {
            // The finally block sweeps the whole temp dir anyway.
          }
        }
      }

      // Standalone audio track for the Twitch userscript: posted as one audio
      // message. Best-effort — the video upload must not fail because of it.
      if (session.audioPath && !session.telegramAudioMessageId && !session.audioDeletedAt) {
        try {
          await this.uploadAudioTrack(session, chatId);
        } catch (error) {
          this.logger.warn(
            `${logPrefix} audio track upload failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      // Chat backup: the messages live in the database, not in the video, so
      // a .tsr.json bundle is posted alongside the video. Best-effort — a
      // chat hiccup must not fail the video upload.
      let telegramChatMessageId = session.telegramChatMessageId;

      if (!telegramChatMessageId) {
        try {
          telegramChatMessageId = await this.uploadChatBundle(session, chatId);
        } catch (error) {
          this.logger.warn(
            `${logPrefix} chat bundle upload failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      await this.prisma.streamSession.update({
        where: { id: session.id },
        data: {
          telegramStatus: "uploaded",
          telegramUploadedAt: new Date(),
          telegramError: null,
          telegramChatMessageId,
        },
      });

      this.emitTelegramUpdate(session.id, "uploaded");
      this.logger.log(`${logPrefix} upload finished (${partPaths.length} part(s)).`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`${logPrefix} upload failed: ${message}`);
      await this.markUploadError(session.id, message);
    } finally {
      this.uploadProgress.delete(session.id);
      this.lastEmittedProgress.delete(session.id);
      if (tempDir) {
        try {
          rmSync(tempDir, { recursive: true, force: true });
        } catch {
          // Best-effort temp cleanup; ignore filesystem errors.
        }
      }
    }
  }

  private async sendVideo(
    filePath: string,
    chatId: string,
    caption: string,
    meta: VideoMeta | null,
    onProgress?: (fraction: number) => void,
  ): Promise<SendVideoResult> {
    const client = await this.telegramClientService.getClient();
    const entity = await this.telegramClientService.resolveChat(chatId);

    const message = await client.sendFile(entity, {
      file: filePath,
      caption,
      supportsStreaming: true,
      progressCallback: onProgress
        ? (progress: number) => onProgress(Math.max(0, Math.min(1, progress)))
        : undefined,
      attributes: meta
        ? [
            new Api.DocumentAttributeVideo({
              duration: Math.round(meta.durationSec),
              w: meta.width,
              h: meta.height,
              supportsStreaming: true,
            }),
          ]
        : undefined,
    });

    const media = message.media;
    const fileId =
      media instanceof Api.MessageMediaDocument && media.document instanceof Api.Document
        ? String(media.document.id)
        : null;

    return { messageId: String(message.id), fileId };
  }

  /**
   * Build the same .tsr.json bundle the admin UI offers for download and post
   * it to the channel as a document. Returns the message id, or null when the
   * session has no chat messages.
   */
  private async uploadChatBundle(session: SessionWithChannel, chatId: string) {
    const bundle = await this.archiveBundleService.build(session.id);

    if (bundle.messages.length === 0) {
      return null;
    }

    const tempDir = resolve(process.env.DATA_DIR ?? "./data", "tmp", "telegram");
    mkdirSync(tempDir, { recursive: true });

    const bundlePath = join(
      tempDir,
      this.archiveBundleService.fileNameFor(session.channel.twitchLogin, session.id),
    );

    try {
      writeFileSync(bundlePath, JSON.stringify(bundle), "utf8");

      const client = await this.telegramClientService.getClient();
      const entity = await this.telegramClientService.resolveChat(chatId);

      const message = await client.sendFile(entity, {
        file: bundlePath,
        caption: `💬 Чат: ${session.channel.displayName ?? session.channel.twitchLogin} — ${
          session.title ?? ""
        }`.slice(0, 1024),
        forceDocument: true,
      });

      return String(message.id);
    } finally {
      try {
        rmSync(bundlePath, { force: true });
      } catch {
        // Best-effort temp cleanup.
      }
    }
  }

  /**
   * Post the extracted .m4a to the channel and remember the message.
   * Returns the message id, or null when there is nothing to upload.
   */
  private async uploadAudioTrack(
    session: SessionWithChannel,
    chatId: string,
    onProgress?: (fraction: number) => void,
  ) {
    const audioPath = resolve(session.audioPath!);

    if (!existsSync(audioPath) || statSync(audioPath).size === 0) {
      return null;
    }

    if (statSync(audioPath).size > this.getMaxPartBytes()) {
      this.logger.warn(
        `[telegram/${session.channel.twitchLogin}/${session.id}] audio track exceeds the Telegram size limit, keeping it local only.`,
      );
      return null;
    }

    // probeVideoMeta only needs format.duration, which works for audio files
    // too (the video stream entries just come back empty).
    let durationSec = 0;
    try {
      durationSec = Math.round((await this.probeVideoMeta(audioPath)).durationSec);
    } catch {
      // Metadata is best-effort.
    }

    const client = await this.telegramClientService.getClient();
    const entity = await this.telegramClientService.resolveChat(chatId);

    const caption = [
      `🎧 Звук: ${session.channel.displayName ?? session.channel.twitchLogin}`,
      session.title ?? "",
      session.startedAt
        ? `📅 ${session.startedAt.toISOString().slice(0, 16).replace("T", " ")} UTC`
        : "",
    ]
      .filter(Boolean)
      .join("\n")
      .slice(0, 1024);

    const message = await client.sendFile(entity, {
      file: audioPath,
      caption,
      progressCallback: onProgress
        ? (progress: number) => onProgress(Math.max(0, Math.min(1, progress)))
        : undefined,
      attributes: [
        new Api.DocumentAttributeAudio({
          duration: durationSec,
          title: session.title ?? session.channel.twitchLogin,
          performer: session.channel.displayName ?? session.channel.twitchLogin,
        }),
      ],
    });

    const media = message.media;
    const fileId =
      media instanceof Api.MessageMediaDocument && media.document instanceof Api.Document
        ? String(media.document.id)
        : null;

    await this.prisma.streamSession.update({
      where: { id: session.id },
      data: {
        telegramAudioChatId: chatId,
        telegramAudioMessageId: String(message.id),
        telegramAudioFileId: fileId,
        telegramAudioUploadedAt: new Date(),
      },
    });

    this.logger.log(
      `[telegram/${session.channel.twitchLogin}/${session.id}] audio track uploaded.`,
    );

    return String(message.id);
  }

  /**
   * Revoke the Telegram audio message of a session (best-effort). Used both by
   * the expiry sweep and by manual audio deletion from the panel.
   */
  async deleteAudioMessage(session: {
    id: string;
    telegramAudioChatId: string | null;
    telegramAudioMessageId: string | null;
  }) {
    if (!session.telegramAudioMessageId || !session.telegramAudioChatId) {
      return;
    }

    try {
      const configured = await this.telegramClientService.isConfigured();
      if (!configured) {
        return;
      }

      const client = await this.telegramClientService.getClient();
      const entity = await this.telegramClientService.resolveChat(session.telegramAudioChatId);
      await client.deleteMessages(entity, [Number(session.telegramAudioMessageId)], {
        revoke: true,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to delete Telegram audio message for session ${session.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Local storage is only a cache in front of Telegram: the channel keeps the
   * recording forever, the disk keeps it for as long as the retention setting
   * says. Nothing is ever deleted from Telegram here, and nothing is deleted
   * locally before Telegram confirmed a copy — so the setting can cost disk
   * cache, never a recording.
   */
  private async cleanupLocalCopies(settings: AppSettings) {
    await this.cleanupLocalVideo(settings.videoKeepLocalDays);
    await this.cleanupLocalAudio(settings.audioKeepLocalDays);
  }

  /**
   * May this path be deleted as "local cache"? Two ways the answer is no, and
   * both would otherwise destroy an archive rather than free a cache:
   *
   * - the file already lives on the archive tier, where it is the primary copy
   *   and not a cache of anything;
   * - it is still queued to be moved there, and the archive tier is up. The
   *   move is what frees this disk; deleting the source first would leave the
   *   recording in Telegram only, which is the opposite of what the archive is
   *   for. When the tier is down there is nothing to wait for and the file is
   *   dropped exactly as it was before the archive existed.
   */
  private isDeletableLocalCopy(
    path: string,
    archiveStatus: string,
  ): { ok: true } | { ok: false; reason: string } {
    if (!isUnderDataRoot(path)) {
      return { ok: false, reason: "the file lives on the archive tier, not on the local disk" };
    }

    if (["none", "pending", "copying"].includes(archiveStatus) && isArchiveAvailable()) {
      return { ok: false, reason: "it is still queued for the archive tier" };
    }

    return { ok: true };
  }

  /**
   * "Uploaded at least keepDays ago" boundary. A negative value means "keep
   * the local copy forever" and is reported as null.
   */
  private keepLocalCutoff(keepDays: number): Date | null {
    if (keepDays < 0) {
      return null;
    }

    return new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
  }

  private async cleanupLocalVideo(keepDays: number) {
    const cutoff = this.keepLocalCutoff(keepDays);

    if (!cutoff) {
      return;
    }

    const sessions = await this.prisma.streamSession.findMany({
      where: {
        telegramStatus: "uploaded",
        localFileDeletedAt: null,
        telegramUploadedAt: { lte: cutoff },
        playbackPath: { not: null },
      },
    });

    for (const session of sessions) {
      try {
        const filePath = resolve(session.playbackPath!);
        const verdict = this.isDeletableLocalCopy(filePath, session.archiveStatus);

        if (!verdict.ok) {
          this.logger.debug(
            `Keeping the video of session ${session.id}: ${verdict.reason}.`,
          );
          continue;
        }

        if (existsSync(filePath)) {
          rmSync(filePath, { force: true });
        }

        await this.prisma.streamSession.update({
          where: { id: session.id },
          data: { localFileDeletedAt: new Date() },
        });

        this.emitTelegramUpdate(session.id, "uploaded");
        this.logger.log(
          `Deleted the local video of session ${session.id}: the Telegram copy is ${keepDays} day(s) old.`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to delete the local video of session ${session.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  /**
   * Same rule for the standalone .m4a track. The Telegram audio message stays
   * put — playback (and the Twitch userscript) falls back to it once the local
   * file is gone.
   */
  private async cleanupLocalAudio(keepDays: number) {
    const cutoff = this.keepLocalCutoff(keepDays);

    if (!cutoff) {
      return;
    }

    const sessions = await this.prisma.streamSession.findMany({
      where: {
        // An audio-only session's .m4a IS the recording, so it follows the
        // video rule above (it is the playbackPath) — not this one.
        audioOnly: false,
        audioPath: { not: null },
        audioDeletedAt: null,
        audioLocalDeletedAt: null,
        // Never drop a local track Telegram does not hold yet.
        telegramAudioMessageId: { not: null },
        telegramAudioUploadedAt: { lte: cutoff },
      },
      take: 50,
    });

    for (const session of sessions) {
      try {
        const audioPath = resolve(session.audioPath!);
        const verdict = this.isDeletableLocalCopy(audioPath, session.archiveStatus);

        if (!verdict.ok) {
          this.logger.debug(`Keeping the audio of session ${session.id}: ${verdict.reason}.`);
          continue;
        }

        if (existsSync(audioPath)) {
          rmSync(audioPath, { force: true });
        }

        await this.prisma.streamSession.update({
          where: { id: session.id },
          data: { audioLocalDeletedAt: new Date() },
        });

        this.logger.log(
          `Deleted the local audio track of session ${session.id}: the Telegram copy is ${keepDays} day(s) old.`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to delete the local audio track of session ${session.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  private buildCaption(session: SessionWithChannel, part: number, totalParts: number) {
    const lines = [
      `📺 ${session.channel.displayName ?? session.channel.twitchLogin}`,
    ];

    if (session.title) {
      lines.push(session.title);
    }

    if (session.categoryName) {
      lines.push(`🎮 ${session.categoryName}`);
    }

    if (session.startedAt) {
      lines.push(`📅 ${session.startedAt.toISOString().slice(0, 16).replace("T", " ")} UTC`);
    }

    if (totalParts > 1) {
      lines.push(`Часть ${part}/${totalParts}`);
    }

    // Telegram captions are limited to 1024 characters.
    return lines.join("\n").slice(0, 1024);
  }

  private async splitIntoParts(filePath: string, tempDir: string, maxPartBytes: number) {
    mkdirSync(tempDir, { recursive: true });

    const { durationSec } = await this.probeVideoMeta(filePath);
    const fileSize = statSync(filePath).size;
    const bytesPerSec = fileSize / Math.max(durationSec, 1);
    const segmentSec = Math.max(60, Math.floor((maxPartBytes * 0.95) / bytesPerSec));

    const pattern = join(tempDir, `${basename(filePath, ".mp4")}_part%03d.mp4`);

    await this.runProcess("ffmpeg", [
      "-y",
      "-i",
      filePath,
      "-c",
      "copy",
      "-map",
      "0",
      "-f",
      "segment",
      "-segment_time",
      String(segmentSec),
      "-reset_timestamps",
      "1",
      // moov up front in every part: without it the web player has to fetch
      // the tail of a 1.9 GB file from Telegram before playback can start.
      "-segment_format_options",
      "movflags=+faststart",
      pattern,
    ]);

    const parts = readdirSync(tempDir)
      .filter((name) => name.toLowerCase().endsWith(".mp4"))
      .sort()
      .map((name) => join(tempDir, name));

    if (parts.length === 0) {
      throw new Error("ffmpeg did not produce any segments.");
    }

    return parts;
  }

  private probeVideoMeta(filePath: string) {
    return new Promise<VideoMeta>((resolvePromise, rejectPromise) => {
      const probe = spawn("ffprobe", [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        filePath,
      ]);

      let output = "";
      probe.stdout?.on("data", (chunk) => {
        output += chunk.toString();
      });

      probe.once("error", (error) => rejectPromise(error));
      probe.once("exit", (code) => {
        try {
          const parsed = JSON.parse(output) as {
            streams?: { width?: number; height?: number }[];
            format?: { duration?: string };
          };
          const durationSec = Number.parseFloat(parsed.format?.duration ?? "");

          if (code !== 0 || !Number.isFinite(durationSec) || durationSec <= 0) {
            throw new Error(`ffprobe failed to read duration (exit code ${String(code)}).`);
          }

          resolvePromise({
            durationSec,
            width: parsed.streams?.[0]?.width ?? 1920,
            height: parsed.streams?.[0]?.height ?? 1080,
          });
        } catch (error) {
          rejectPromise(error instanceof Error ? error : new Error(String(error)));
        }
      });
    });
  }

  private runProcess(command: string, args: string[]) {
    return new Promise<void>((resolvePromise, rejectPromise) => {
      const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });

      let stderrTail = "";
      child.stderr?.on("data", (chunk) => {
        stderrTail = `${stderrTail}${chunk.toString()}`.slice(-2000);
      });

      child.once("error", (error) => rejectPromise(error));
      child.once("exit", (code) => {
        if (code === 0) {
          resolvePromise();
        } else {
          rejectPromise(
            new Error(`${command} exited with code ${String(code)}: ${stderrTail.trim()}`),
          );
        }
      });
    });
  }

  private async markUploadError(sessionId: string, message: string) {
    await this.prisma.streamSession.update({
      where: { id: sessionId },
      data: { telegramStatus: "error", telegramError: message },
    });

    this.emitTelegramUpdate(sessionId, "error");
  }

  private async getSettings() {
    return this.prisma.appSettings.upsert({
      where: { id: "default" },
      create: { id: "default" },
      update: {},
    });
  }

  private getMaxPartBytes() {
    const maxPartMb = Number.parseInt(process.env.TELEGRAM_MAX_PART_MB ?? "", 10);

    return (
      (Number.isFinite(maxPartMb) && maxPartMb > 0 ? maxPartMb : DEFAULT_MAX_PART_MB) *
      1024 *
      1024
    );
  }

  private reportUploadProgress(sessionId: string, percent: number) {
    const clamped = Math.max(0, Math.min(100, percent));
    this.uploadProgress.set(sessionId, clamped);

    // Emit at most every 2 percentage points: each event makes the admin UI
    // re-fetch the archive list.
    const lastEmitted = this.lastEmittedProgress.get(sessionId);

    if (lastEmitted === undefined || clamped - lastEmitted >= 2 || (clamped === 100 && lastEmitted !== 100)) {
      this.lastEmittedProgress.set(sessionId, clamped);
      this.emitTelegramUpdate(sessionId, "uploading", clamped);
    }
  }

  private emitTelegramUpdate(sessionId: string, telegramStatus: string, progress?: number) {
    this.realtimeGateway.server?.emit("telegram:updated", {
      sessionId,
      telegramStatus,
      ...(progress !== undefined ? { progress } : {}),
      timestamp: new Date().toISOString(),
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
