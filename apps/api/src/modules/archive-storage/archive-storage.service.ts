import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { AppSettings, Channel, StreamSession } from "@prisma/client";
import * as fs from "node:fs";
import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { copyFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { ArchiveBundleService } from "../chat/archive-bundle.service";
import { PrismaService } from "../prisma/prisma.service";
import { computeSessionChatOffsetSec } from "../recording/playback.utils";
import { ThumbnailService } from "../recording/thumbnail.service";
import {
  ARCHIVE_FILES,
  ARCHIVE_SENTINEL,
  archiveRoot,
  buildSessionDir,
  isArchiveAvailable,
  isUnderDataRoot,
} from "./archive-paths";

const SWEEP_INTERVAL_MS = 60_000;

// A move that failed usually failed for a reason that outlives one minute — a
// full Drive, an expired token, a mount hiccup. Retrying hourly keeps the log
// readable and still drains the backlog unattended.
const RETRY_FAILED_AFTER_MS = 60 * 60_000;

type SessionWithChannel = StreamSession & { channel: Channel };

/**
 * The archive tier: a 5 TB Google Drive mounted at ARCHIVE_DIR, where finished
 * recordings live for `archiveKeepDays` before Telegram becomes their only
 * home.
 *
 * Why a move and not a direct write. The mount is a network filesystem: it is
 * fine for whole-file reads and writes and hopeless for the thousands of small
 * appends streamlink and ffmpeg produce while capturing. So a recording is
 * always captured onto the server's own disk, and only the finished artefacts
 * are moved across — after Telegram has taken its copy from the fast local
 * file, so the offload never has to pull gigabytes back down through rclone.
 *
 * The tiers in order, and what each one guarantees:
 *
 *   capture   server disk   fast, small writes, always
 *   telegram  channel       permanent, off-site, never deleted here
 *   archive   Drive         primary copy for archiveKeepDays, browsable
 *
 * Nothing here can lose a recording. The local original is deleted only after
 * the copy on the Drive has been verified byte-count-for-byte, and the Drive
 * copy expires only once Telegram is confirmed to hold it. When the mount is
 * gone the whole tier reports itself unavailable and the app behaves exactly
 * as it did before it existed: disk, then Telegram.
 */
@Injectable()
export class ArchiveStorageService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ArchiveStorageService.name);
  private sweepTimer: NodeJS.Timeout | null = null;
  private sweeping = false;
  // Logged transitions only: a mount that is down for a day should not write
  // 1440 identical warnings into the log.
  private lastAvailability: boolean | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly archiveBundleService: ArchiveBundleService,
    private readonly thumbnailService: ThumbnailService,
  ) {}

  async onModuleInit() {
    if (!archiveRoot()) {
      this.logger.log("Archive tier disabled: ARCHIVE_DIR is not set.");
      return;
    }

    // A restart during a copy leaves a half-written folder on the Drive. The
    // source file was not touched yet (it is deleted last), so re-queueing is
    // safe: the copy simply runs again and overwrites.
    await this.prisma.streamSession.updateMany({
      where: { archiveStatus: "copying" },
      data: { archiveStatus: "pending" },
    });

    this.sweepTimer = setInterval(() => {
      void this.sweep();
    }, SWEEP_INTERVAL_MS);

    void this.sweep();
  }

  onModuleDestroy() {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
  }

  /** Ask for a sweep soon — used right after a recording finished uploading. */
  kick() {
    void this.sweep();
  }

  async sweep() {
    if (this.sweeping || !archiveRoot()) {
      return;
    }

    this.sweeping = true;

    try {
      if (!this.checkAvailability()) {
        return;
      }

      const settings = await this.prisma.appSettings.upsert({
        where: { id: "default" },
        create: { id: "default" },
        update: {},
      });

      await this.requeueFailed();
      await this.archivePending(settings);
      await this.expireOld(settings);
    } catch (error) {
      this.logger.warn(`Archive sweep failed: ${this.describe(error)}`);
    } finally {
      this.sweeping = false;
    }
  }

  /**
   * Live mount check, logged only when the answer changes. An unavailable tier
   * is not an error: recordings keep piling up on the server disk and going to
   * Telegram, and the backlog drains on its own once the mount is back.
   */
  private checkAvailability(): boolean {
    const available = isArchiveAvailable();

    if (available !== this.lastAvailability) {
      this.lastAvailability = available;

      if (available) {
        this.logger.log(`Archive tier is available at ${archiveRoot()}.`);
      } else {
        this.logger.warn(
          `Archive tier is NOT available: ${join(
            archiveRoot() ?? "",
            ARCHIVE_SENTINEL,
          )} is unreadable. Recordings stay on the server disk and in Telegram until the mount is back.`,
        );
      }
    }

    return available;
  }

  /**
   * Move finished recordings onto the Drive, oldest first, one at a time so a
   * backlog cannot saturate the uplink or the rclone cache.
   *
   * Telegram goes first on purpose: a session is only picked up once its
   * Telegram copy exists (or has definitively failed), because the uploader
   * reads `playbackPath` and that path points at the Drive the moment this
   * runs. Uploading from the local file costs a disk read; uploading from the
   * Drive costs the same gigabytes back over the network.
   */
  private async archivePending(settings: AppSettings) {
    // With Telegram switched off nothing is ever going to claim the local
    // copy, so waiting for it would strand every recording on the disk.
    const telegramInPlay = settings.telegramEnabled && Boolean(settings.telegramChatId);

    for (;;) {
      const session = await this.prisma.streamSession.findFirst({
        where: {
          status: "completed",
          playbackPath: { not: null },
          localFileDeletedAt: null,
          archiveStatus: { in: ["none", "pending"] },
          // "error" counts as done with the local file: the uploader keeps
          // retrying on its own schedule, and a recording should not be
          // stranded on the server disk because the channel rejected it once.
          ...(telegramInPlay ? { telegramStatus: { in: ["uploaded", "error"] } } : {}),
        },
        include: { channel: true },
        orderBy: { createdAt: "asc" },
      });

      if (!session) {
        return;
      }

      // The mount can drop mid-backlog; re-check before every session so a
      // failure costs one attempt and not the whole queue.
      if (!this.checkAvailability()) {
        return;
      }

      await this.archiveSession(session);
    }
  }

  /**
   * Give failed moves another go, but no more often than hourly. The retry
   * clock is `updatedAt`, which markError has just bumped, so a session that
   * keeps failing backs itself off instead of retrying every minute forever.
   */
  private async requeueFailed() {
    const retryAfter = new Date(Date.now() - RETRY_FAILED_AFTER_MS);

    const { count } = await this.prisma.streamSession.updateMany({
      where: {
        archiveStatus: "error",
        localFileDeletedAt: null,
        updatedAt: { lte: retryAfter },
      },
      data: { archiveStatus: "pending" },
    });

    if (count > 0) {
      this.logger.log(`Re-queued ${count} session(s) that failed to reach the archive.`);
    }
  }

  private async archiveSession(session: SessionWithChannel) {
    const logPrefix = `[archive/${session.channel.twitchLogin}/${session.id}]`;
    const root = archiveRoot();

    if (!root) {
      return;
    }

    // Reuse the folder a previous attempt created: the name carries the stream
    // title, and a title edited between two attempts would otherwise leave the
    // half-copied first folder behind with nothing pointing at it.
    const targetDir =
      session.archiveDir ??
      buildSessionDir(root, {
        platform: session.channel.platform,
        channelLogin: session.channel.twitchLogin,
        startedAt: session.startedAt ?? session.createdAt,
        title: session.title,
        sessionId: session.id,
      });

    await this.prisma.streamSession.update({
      where: { id: session.id },
      data: { archiveStatus: "copying", archiveError: null, archiveDir: targetDir },
    });

    try {
      mkdirSync(targetDir, { recursive: true });

      // Sidecars first: they are kilobytes, and writing them before the
      // gigabytes means a broken mount is discovered cheaply.
      await this.writeSidecars(session, targetDir, logPrefix);

      // Each file's new location is persisted the moment it lands, not once at
      // the end. A failure between the two moves used to leave the video on the
      // Drive while the database still pointed at the local path it had just
      // deleted — the retry then found nothing on disk and parked the session in
      // "error" forever, with the file sitting in the archive all along.
      const localVideo = resolve(session.playbackPath!);

      if (isUnderDataRoot(localVideo)) {
        if (!existsSync(localVideo)) {
          await this.markError(session.id, "Local recording is missing on disk.");
          return;
        }

        const videoName = session.audioOnly ? ARCHIVE_FILES.audio : ARCHIVE_FILES.video;
        const archived = await this.moveFile(localVideo, join(targetDir, videoName), logPrefix);

        // Playback follows the file. Everything downstream — the player, the
        // cover renderer, a Telegram retry — resolves these columns, so
        // repointing them is the whole of "the archive is now primary".
        await this.prisma.streamSession.update({
          where: { id: session.id },
          data: { playbackPath: archived, recordingPath: archived },
        });
      }

      const localAudio =
        session.audioPath && !session.audioOnly ? resolve(session.audioPath) : null;

      if (localAudio && isUnderDataRoot(localAudio) && existsSync(localAudio)) {
        const archived = await this.moveFile(
          localAudio,
          join(targetDir, ARCHIVE_FILES.audio),
          logPrefix,
        );

        await this.prisma.streamSession.update({
          where: { id: session.id },
          data: { audioPath: archived },
        });
      }

      await this.prisma.streamSession.update({
        where: { id: session.id },
        data: {
          archiveStatus: "stored",
          archivedAt: new Date(),
          archiveDeletedAt: null,
          archiveError: null,
        },
      });

      this.logger.log(`${logPrefix} archived to ${targetDir}`);
    } catch (error) {
      await this.markError(session.id, this.describe(error));
      this.logger.warn(`${logPrefix} archiving failed: ${this.describe(error)}`);
    }
  }

  /**
   * Copy across, verify, then delete the original. Never a rename: source and
   * target are different filesystems, and a verified copy is the only form of
   * "move" that cannot lose the file if the mount drops halfway.
   */
  private async moveFile(source: string, target: string, logPrefix: string): Promise<string> {
    const expected = statSync(source).size;

    await copyFile(source, target);

    const actual = statSync(target).size;

    if (actual !== expected) {
      // Leave the original alone; the next sweep overwrites the short copy.
      throw new Error(
        `Copy of ${source} is truncated: ${actual} of ${expected} bytes reached the archive.`,
      );
    }

    rmSync(source, { force: true });
    this.logger.debug(`${logPrefix} moved ${source} -> ${target} (${expected} bytes)`);

    return target;
  }

  /**
   * The chat replay, the cover and the metadata, so a downloaded folder is a
   * complete archive on its own and not a video that needs this app's database
   * to mean anything. All three are best-effort: a session with no chat, or a
   * cover ffmpeg cannot render, must not block the move.
   */
  private async writeSidecars(session: SessionWithChannel, targetDir: string, logPrefix: string) {
    await writeFile(
      join(targetDir, ARCHIVE_FILES.meta),
      JSON.stringify(this.buildMeta(session), null, 2),
      "utf8",
    );

    try {
      const bundle = await this.archiveBundleService.build(session.id);

      if (bundle.messages.length > 0) {
        await writeFile(join(targetDir, ARCHIVE_FILES.chat), JSON.stringify(bundle), "utf8");
      }
    } catch (error) {
      this.logger.warn(`${logPrefix} chat bundle skipped: ${this.describe(error)}`);
    }

    try {
      const cover = await this.thumbnailService.getCover(session.id);
      await writeFile(join(targetDir, ARCHIVE_FILES.cover), cover.buffer);
    } catch (error) {
      this.logger.warn(`${logPrefix} cover skipped: ${this.describe(error)}`);
    }
  }

  private buildMeta(session: SessionWithChannel) {
    return {
      version: 1,
      kind: "tsr-archive-session",
      id: session.id,
      platform: session.channel.platform,
      channelLogin: session.channel.twitchLogin,
      channelDisplayName: session.channel.displayName ?? session.channel.twitchLogin,
      title: session.title,
      categoryName: session.categoryName,
      startedAt: session.startedAt?.toISOString() ?? null,
      endedAt: session.endedAt?.toISOString() ?? null,
      durationSec: session.durationSec,
      fileSizeBytes: session.fileSizeBytes,
      audioOnly: session.audioOnly,
      chatOffsetSec: computeSessionChatOffsetSec(session),
      telegram: {
        uploadedAt: session.telegramUploadedAt?.toISOString() ?? null,
        chatMessageId: session.telegramChatMessageId,
        audioMessageId: session.telegramAudioMessageId,
      },
      archivedAt: new Date().toISOString(),
      files: ARCHIVE_FILES,
    };
  }

  /**
   * Drop folders older than the retention window. This is the one place in the
   * app that deletes a real archive rather than a cache, so it refuses to act
   * unless Telegram demonstrably holds the same recording: the last copy of a
   * broadcast is never the one that expires.
   */
  private async expireOld(settings: AppSettings) {
    if (settings.archiveKeepDays < 0) {
      return;
    }

    const cutoff = new Date(Date.now() - settings.archiveKeepDays * 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.streamSession.findMany({
      where: {
        archiveStatus: "stored",
        archiveDir: { not: null },
        archiveDeletedAt: null,
        OR: [{ startedAt: { lte: cutoff } }, { startedAt: null, createdAt: { lte: cutoff } }],
      },
      include: { channel: true },
      orderBy: { startedAt: "asc" },
    });

    for (const session of sessions) {
      const logPrefix = `[archive/${session.channel.twitchLogin}/${session.id}]`;
      const blocker = this.expiryBlocker(session);

      if (blocker) {
        // Kept past its date on purpose. Surfaced through archiveError so the
        // panel can explain why the Drive is not shrinking — written once, not
        // on every sweep, so the row's updatedAt stays meaningful.
        if (session.archiveError !== blocker) {
          await this.prisma.streamSession.update({
            where: { id: session.id },
            data: { archiveError: blocker },
          });
          this.logger.warn(`${logPrefix} kept past retention: ${blocker}`);
        }

        continue;
      }

      try {
        rmSync(session.archiveDir!, { recursive: true, force: true });

        await this.prisma.streamSession.update({
          where: { id: session.id },
          data: {
            archiveStatus: "expired",
            archiveDeletedAt: new Date(),
            archiveError: null,
            // The same flags the local cleanup sets: playback falls back to
            // Telegram, and the disk audit stops calling the path a loss.
            localFileDeletedAt: session.localFileDeletedAt ?? new Date(),
            ...(session.audioPath && !session.audioOnly && !session.audioLocalDeletedAt
              ? { audioLocalDeletedAt: new Date() }
              : {}),
          },
        });

        this.logger.log(
          `${logPrefix} expired from the archive after ${settings.archiveKeepDays} day(s); the Telegram copy remains.`,
        );
      } catch (error) {
        this.logger.warn(`${logPrefix} expiry failed: ${this.describe(error)}`);
      }
    }
  }

  /** Human-readable reason this session must not be expired yet, or null. */
  private expiryBlocker(session: SessionWithChannel): string | null {
    if (session.telegramStatus !== "uploaded") {
      return "Kept past the retention window: Telegram has no copy of this recording yet.";
    }

    if (session.audioPath && !session.audioOnly && !session.telegramAudioMessageId) {
      return "Kept past the retention window: Telegram has no copy of the audio track yet.";
    }

    return null;
  }

  /** Archive-tier summary for the admin storage page. */
  async getOverview() {
    const root = archiveRoot();
    // fileSizeBytes is a string column (the values overflow a 32-bit int), so
    // the total is summed here rather than in SQL.
    const [storedSessions, expiredCount, queuedCount, errorCount, settings] = await Promise.all([
      this.prisma.streamSession.findMany({
        where: { archiveStatus: "stored" },
        select: { fileSizeBytes: true, audioSizeBytes: true },
      }),
      this.prisma.streamSession.count({ where: { archiveStatus: "expired" } }),
      this.prisma.streamSession.count({
        where: {
          status: "completed",
          localFileDeletedAt: null,
          archiveStatus: { in: ["none", "pending", "copying"] },
        },
      }),
      this.prisma.streamSession.count({ where: { archiveStatus: "error" } }),
      this.prisma.appSettings.upsert({
        where: { id: "default" },
        create: { id: "default" },
        update: {},
      }),
    ]);

    let storedBytes = 0n;

    for (const session of storedSessions) {
      storedBytes += this.toBigInt(session.fileSizeBytes) + this.toBigInt(session.audioSizeBytes);
    }

    return {
      configured: Boolean(root),
      available: isArchiveAvailable(),
      root,
      // Capacity of the mounted drive itself. The "Files and disk" page
      // measures DATA_DIR and therefore reports the server's own disk; without
      // this the panel never shows how much room the archive actually has.
      disk: root ? this.getDiskSpace(root) : null,
      keepDays: settings.archiveKeepDays,
      storedCount: storedSessions.length,
      storedBytes: String(storedBytes),
      expiredCount,
      queuedCount,
      errorCount,
    };
  }

  /**
   * Size and free space of the filesystem holding the archive. Null when the
   * mount is unreachable — on a dead FUSE mount statfs throws rather than
   * reporting zeroes, and a card showing "0 B free" would be a lie.
   */
  private getDiskSpace(path: string) {
    // statfsSync landed in Node 18.15 — on an older runtime just omit the card.
    const statfsSync = (fs as unknown as {
      statfsSync?: (path: string) => { bsize: number; blocks: number; bavail: number };
    }).statfsSync;

    if (typeof statfsSync !== "function") {
      return null;
    }

    try {
      const stat = statfsSync(path);
      return {
        totalBytes: String(stat.bsize * stat.blocks),
        freeBytes: String(stat.bsize * stat.bavail),
      };
    } catch {
      return null;
    }
  }

  private toBigInt(value: string | null): bigint {
    if (!value) {
      return 0n;
    }

    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }

  private async markError(sessionId: string, message: string) {
    await this.prisma.streamSession.update({
      where: { id: sessionId },
      data: { archiveStatus: "error", archiveError: message.slice(0, 500) },
    });
  }

  private describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
