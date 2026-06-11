import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { AppSettings, Channel, StreamSession } from "@prisma/client";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { Api } from "telegram";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { TelegramClientService } from "./telegram-client.service";

const SCAN_INTERVAL_MS = 60_000;

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
      keepLocalDays: settings.telegramKeepLocalDays,
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
      keepLocalDays: number;
      tokenConfigured: boolean;
      botUsername: string | null;
      chatTitle: string | null;
      error: string | null;
    } = {
      enabled: settings.telegramEnabled,
      chatId: settings.telegramChatId,
      keepLocalDays: settings.telegramKeepLocalDays,
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

      if (!configured || !settings.telegramChatId) {
        return;
      }

      await this.processUploads(settings);

      if (settings.telegramEnabled) {
        await this.cleanupUploadedLocalFiles(settings.telegramKeepLocalDays);
      }
    } catch (error) {
      this.logger.warn(
        `Telegram tick failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.ticking = false;
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

      await this.uploadSession(session, settings.telegramChatId);
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

    // A retry should not leave parts from a previous failed attempt behind.
    await this.prisma.telegramUploadPart.deleteMany({
      where: { streamSessionId: session.id },
    });

    let tempDir: string | null = null;

    try {
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

      let startOffsetSec = 0;

      for (let index = 0; index < partPaths.length; index += 1) {
        const partPath = partPaths[index];
        const caption = this.buildCaption(session, index + 1, partPaths.length);

        // Per-part duration keeps chat replay aligned when the web player
        // switches between parts; width/height make Telegram render the
        // upload as a playable video instead of a generic document.
        let meta: VideoMeta | null = null;
        try {
          meta = await this.probeVideoMeta(partPath);
        } catch {
          // Metadata is best-effort; the upload itself must not fail.
        }

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

        startOffsetSec += meta ? Math.round(meta.durationSec) : 0;
      }

      await this.prisma.streamSession.update({
        where: { id: session.id },
        data: {
          telegramStatus: "uploaded",
          telegramUploadedAt: new Date(),
          telegramError: null,
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

  private async cleanupUploadedLocalFiles(keepLocalDays: number) {
    const cutoff = new Date(Date.now() - keepLocalDays * 24 * 60 * 60 * 1000);

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

        if (existsSync(filePath)) {
          rmSync(filePath, { force: true });
        }

        await this.prisma.streamSession.update({
          where: { id: session.id },
          data: { localFileDeletedAt: new Date() },
        });

        this.emitTelegramUpdate(session.id, "uploaded");
        this.logger.log(
          `Deleted local file for session ${session.id}: it has been in Telegram for over ${keepLocalDays} day(s).`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to delete local file for session ${session.id}: ${
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
