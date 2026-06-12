import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Channel, StreamSession, TelegramUploadPart } from "@prisma/client";
import { ChildProcess, spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { TwitchService } from "../twitch/twitch.service";
import { ChatService } from "../chat/chat.service";
import { SevenTvService } from "../chat/seventv.service";
import { resolveSessionPlaybackState } from "./playback.utils";
import { resolveStreamlinkCommand } from "../twitch/streamlink.utils";
import { buildTelegramMessageUrl, TelegramService } from "../telegram/telegram.service";

type ActiveRecording = {
  channelId: string;
  sessionId: string;
  streamlinkProcess: ChildProcess;
  remuxProcess: ChildProcess | null;
  tsPath: string;
  outputPath: string;
  // Audio-only capture: streamlink grabs the audio_only variant and the remux
  // produces an .m4a instead of an .mp4.
  audioOnly: boolean;
  stopRequested: boolean;
};

// How many consecutive "offline" polls we tolerate before stopping an active
// recording. Twitch Helix occasionally returns an empty result for a stream
// that is actually live; stopping on the first miss truncates recordings.
const OFFLINE_MISS_THRESHOLD = 3;

// Cooldown before re-recording the same twitchStreamId after the previous
// session ended. Prevents a tight create-session/error loop when streamlink
// keeps failing instantly, while still allowing the recorder to resume the
// stream after a crash, restart, or transient failure.
const RESTART_COOLDOWN_MS = 60_000;

@Injectable()
export class RecordingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RecordingService.name);
  private readonly activeRecordings = new Map<string, ActiveRecording>();
  private readonly offlineMisses = new Map<string, number>();
  private monitorTimer: NodeJS.Timeout | null = null;
  private dependenciesReady = false;
  private dependenciesError: string | null = null;
  private lastDependencyCheckAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly twitchService: TwitchService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly chatService: ChatService,
    private readonly sevenTvService: SevenTvService,
    private readonly telegramService: TelegramService,
  ) {}

  async onModuleInit() {
    this.ensureDataLayout();
    await this.markStaleRecordingsAsStopped();
    await this.checkRecordingDependencies();
    void this.recoverInterruptedRemuxes();
    await this.syncAllChannels();

    this.monitorTimer = setInterval(() => {
      void this.syncAllChannels();
    }, 15_000);
  }

  onModuleDestroy() {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
  }

  async syncAllChannels() {
    // If dependencies were missing at boot (e.g. streamlink installed after
    // the API started), re-probe periodically instead of staying disabled
    // until a manual restart.
    if (!this.dependenciesReady && Date.now() - this.lastDependencyCheckAt > RESTART_COOLDOWN_MS) {
      await this.checkRecordingDependencies();
    }

    const channels = await this.prisma.channel.findMany({
      where: {
        isEnabled: true,
      },
    });

    const results = await Promise.allSettled(
      channels.map((channel) => this.syncChannelState(channel.id)),
    );

    results.forEach((result) => {
      if (result.status === "rejected") {
        this.logger.warn(result.reason instanceof Error ? result.reason.message : String(result.reason));
      }
    });
  }

  async syncChannelState(channelId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} was not found.`);
    }

    const liveStream = await this.twitchService.getLiveStream({
      userId: channel.twitchUserId,
      login: channel.twitchLogin,
    });
    const isRecording = this.activeRecordings.has(channel.id);

    const nextManualStopUntilOffline = liveStream ? channel.manualStopUntilOffline : false;
    const liveStartedAt = liveStream
      ? liveStream.startedAt
        ? new Date(liveStream.startedAt)
        : channel.liveStartedAt ?? new Date()
      : null;

    await this.prisma.channel.update({
      where: { id: channel.id },
      data: {
        isLive: Boolean(liveStream),
        currentTitle: liveStream?.title ?? null,
        currentGameName: liveStream?.gameName ?? null,
        liveStartedAt,
        lastSeenLiveAt: liveStream ? new Date() : channel.lastSeenLiveAt,
        manualStopUntilOffline: nextManualStopUntilOffline,
      },
    });

    this.emitRealtime("channel:updated", {
      channelId: channel.id,
      isLive: Boolean(liveStream),
      isRecording,
      manualStopUntilOffline: nextManualStopUntilOffline,
    });

    if (liveStream) {
      this.offlineMisses.delete(channel.id);
    }

    if (
      liveStream &&
      channel.autoRecord &&
      !channel.manualStopUntilOffline &&
      !isRecording &&
      this.dependenciesReady
    ) {
      if (await this.shouldAutoRecordStream(channel.id, liveStream.id)) {
        try {
          await this.startRecording(channel.id, "automatic");
        } catch (error) {
          this.logger.warn(
            `Auto-record failed for ${channel.twitchLogin}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    if (!liveStream && isRecording) {
      // Tolerate a few consecutive misses before stopping: Twitch sometimes
      // reports a live stream as offline for a single poll, and stopping
      // immediately truncates the recording (and the chat capture with it).
      const misses = (this.offlineMisses.get(channel.id) ?? 0) + 1;
      this.offlineMisses.set(channel.id, misses);

      if (misses >= OFFLINE_MISS_THRESHOLD) {
        this.offlineMisses.delete(channel.id);
        await this.stopRecording(channel.id, false);
      } else {
        this.logger.warn(
          `${channel.twitchLogin} reported offline while recording (${misses}/${OFFLINE_MISS_THRESHOLD}); keeping the recording alive for now.`,
        );
      }
    }

    return liveStream;
  }

  /**
   * Decide whether the auto-recorder should (re)start a recording for the
   * given live stream. Previously any session with the same twitchStreamId
   * blocked auto-record permanently — so a crashed/interrupted recording was
   * never resumed for the rest of the stream. Now only an in-progress
   * session (or a very recent attempt) blocks it.
   */
  private async shouldAutoRecordStream(channelId: string, twitchStreamId: string | null) {
    if (!twitchStreamId) {
      return true;
    }

    const lastSession = await this.prisma.streamSession.findFirst({
      where: { channelId, twitchStreamId },
      orderBy: { createdAt: "desc" },
      select: { status: true, createdAt: true, stoppedByUser: true },
    });

    if (!lastSession) {
      return true;
    }

    if (lastSession.status === "recording") {
      return false;
    }

    // Manual stop is handled separately via manualStopUntilOffline, but keep
    // a guard here in case that flag was reset while the stream stayed live.
    if (lastSession.stoppedByUser) {
      return false;
    }

    return Date.now() - lastSession.createdAt.getTime() > RESTART_COOLDOWN_MS;
  }

  async startRecording(channelId: string, trigger: "automatic" | "manual" = "manual") {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} was not found.`);
    }

    if (this.activeRecordings.has(channel.id)) {
      return this.getSessionById(this.activeRecordings.get(channel.id)!.sessionId);
    }

    const existingSession = await this.prisma.streamSession.findFirst({
      where: {
        channelId: channel.id,
        status: "recording",
      },
      include: {
        channel: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingSession) {
      return {
        item: this.serializeSession(existingSession, existingSession.channel),
      };
    }

    const liveStream = await this.twitchService.getLiveStream({
      userId: channel.twitchUserId,
      login: channel.twitchLogin,
    });

    if (!liveStream) {
      throw new BadRequestException("Channel is currently offline.");
    }

    if (liveStream.id) {
      const duplicateSession = await this.prisma.streamSession.findFirst({
        where: {
          channelId: channel.id,
          twitchStreamId: liveStream.id,
        },
        include: { channel: true },
        orderBy: { createdAt: "desc" },
      });

      // Only an in-progress session blocks a new recording. A completed or
      // failed session for the same stream must NOT block: that is exactly
      // the resume-after-crash case, and it creates a new "part" session.
      if (duplicateSession?.status === "recording") {
        return {
          item: this.serializeSession(duplicateSession, duplicateSession.channel),
        };
      }
    }

    const streamlinkCommand = await this.resolveStreamlinkCommand();
    this.resolveFfmpegCommand();

    const recordingStartedAt = liveStream.startedAt ?? new Date().toISOString();
    // The file path is derived from the actual capture start ("now"), not the
    // Twitch go-live timestamp: when a recording is resumed after a crash the
    // go-live time is identical, and the second part would overwrite the
    // first part's file.
    const outputPath = this.buildRecordingPath(
      channel.twitchLogin,
      new Date().toISOString(),
      channel.audioOnly ? "m4a" : "mp4",
    );
    const tsPath = outputPath.replace(/\.(mp4|m4a)$/i, ".ts");
    mkdirSync(dirname(outputPath), { recursive: true });

    const session = await this.prisma.streamSession.create({
      data: {
        channelId: channel.id,
        twitchStreamId: liveStream.id,
        title: liveStream.title,
        categoryName: liveStream.gameName,
        startedAt: new Date(recordingStartedAt),
        status: "recording",
        videoStatus: "recording",
        chatStatus: "not_configured",
        replayStatus: "pending",
        isLive: true,
        recordingSource: trigger,
        recordingPath: outputPath,
        playbackPath: outputPath,
        audioOnly: channel.audioOnly,
        previewImageUrl: liveStream.previewImageUrl,
        chatAvailable: false,
      },
    });

    // Twitch always exposes an audio_only HLS variant; recording it skips the
    // video download entirely.
    const quality = channel.audioOnly ? "audio_only" : channel.preferredQuality || "best";
    const channelUrl = `https://www.twitch.tv/${channel.twitchLogin}`;

    // Streamlink writes the live MPEG-TS directly to disk. We avoid stdin/stdout
    // pipes entirely (which are the typical source of EPIPE crashes on Windows)
    // and run an ffmpeg remux to .mp4 only after streamlink finishes.
    const streamlinkProcess = spawn(
      streamlinkCommand.command,
      [
        ...streamlinkCommand.args,
        "--force",
        "--hls-live-restart",
        "--stream-segment-threads",
        "2",
        "--loglevel",
        "info",
        "-o",
        tsPath,
        channelUrl,
        quality,
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    streamlinkProcess.on("error", (error) => {
      this.logger.warn(
        `streamlink process error for ${channel.twitchLogin}: ${error.message}`,
      );
    });

    const activeRecording: ActiveRecording = {
      channelId: channel.id,
      sessionId: session.id,
      streamlinkProcess,
      remuxProcess: null,
      tsPath,
      outputPath,
      audioOnly: channel.audioOnly,
      stopRequested: false,
    };

    this.activeRecordings.set(channel.id, activeRecording);
    this.bindRecordingLifecycle(channel, session, activeRecording);

    // Start chat capture in parallel. The anchor is "now" (when streamlink
    // actually started writing video), NOT session.startedAt — Twitch reports
    // the original go-live time, which can be hours before we joined the stream.
    // We need chat relativeTime to align with the recorded video timeline.
    void this.chatService.startCapture({
      channelId: channel.id,
      sessionId: session.id,
      channelLogin: channel.twitchLogin,
      captureAnchor: new Date(),
    });

    // Fetch a 7TV emote snapshot best-effort, in the background.
    void this.captureEmoteSnapshot(session.id, channel.twitchUserId);

    await this.prisma.channel.update({
      where: { id: channel.id },
      data: {
        isLive: true,
        currentTitle: liveStream.title,
        currentGameName: liveStream.gameName,
        liveStartedAt: channel.liveStartedAt ?? new Date(recordingStartedAt),
        lastSeenLiveAt: new Date(),
        manualStopUntilOffline: false,
      },
    });

    this.emitRealtime("channel:updated", {
      channelId: channel.id,
      isLive: true,
      isRecording: true,
      manualStopUntilOffline: false,
    });
    this.emitRealtime("recording:started", {
      channelId: channel.id,
      sessionId: session.id,
    });

    return this.getSessionById(session.id);
  }

  async stopRecording(channelId: string, stoppedByUser = true) {
    const activeRecording = this.activeRecordings.get(channelId);

    if (!activeRecording) {
      throw new BadRequestException("Recording is not active.");
    }

    activeRecording.stopRequested = true;
    this.offlineMisses.delete(channelId);

    try {
      activeRecording.streamlinkProcess.kill("SIGTERM");
    } catch {
      // Ignore already exited process.
    }

    this.chatService.stopCapture(channelId);

    await this.prisma.streamSession.update({
      where: { id: activeRecording.sessionId },
      data: {
        stoppedByUser,
      },
    });

    if (stoppedByUser) {
      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          manualStopUntilOffline: true,
        },
      });

      this.emitRealtime("channel:updated", {
        channelId,
        manualStopUntilOffline: true,
        isRecording: false,
      });
    }

    return { ok: true };
  }

  async getArchiveList(page = 1, pageSize = 15) {
    const safePage = Math.max(1, page);
    const safePageSize = Math.min(100, Math.max(1, pageSize));

    const where = {
      playbackPath: {
        not: null,
      },
      status: {
        not: "recording",
      },
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.streamSession.count({ where }),
      this.prisma.streamSession.findMany({
        where,
        include: {
          channel: true,
          telegramParts: {
            orderBy: { partIndex: "asc" },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
    ]);

    return {
      items: items.map((session) => this.serializeSession(session, session.channel)),
      total,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  async getArchiveById(id: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      include: {
        channel: true,
        telegramParts: {
          orderBy: { partIndex: "asc" },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Archive ${id} was not found.`);
    }

    const item = this.serializeSession(session, session.channel);

    return {
      item,
      videoUrl: item.videoUrl,
      videoReady: item.videoReady,
      chatAvailable: item.chatAvailable,
    };
  }

  async getActiveRecordings() {
    const items = await this.prisma.streamSession.findMany({
      where: {
        status: "recording",
      },
      include: {
        channel: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      items: items.map((session) => this.serializeSession(session, session.channel)),
    };
  }

  async deleteArchive(id: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Archive ${id} was not found.`);
    }

    if (session.status === "recording" || this.activeRecordings.has(session.channelId)) {
      throw new BadRequestException("Active recording cannot be deleted.");
    }

    if (session.playbackPath) {
      const playbackPath = resolve(session.playbackPath);

      if (existsSync(playbackPath)) {
        rmSync(playbackPath, { force: true });
      }
    }

    if (session.chatPath) {
      const chatPath = resolve(session.chatPath);

      if (existsSync(chatPath)) {
        rmSync(chatPath, { force: true });
      }
    }

    if (session.audioPath) {
      const audioPath = resolve(session.audioPath);

      if (existsSync(audioPath)) {
        rmSync(audioPath, { force: true });
      }
    }

    // Chat messages and emote snapshots reference the session without a
    // foreign key, so they must be removed explicitly or they leak.
    await this.prisma.chatMessage.deleteMany({
      where: { streamSessionId: id },
    });
    await this.prisma.emoteSnapshot.deleteMany({
      where: { streamSessionId: id },
    });

    await this.prisma.streamSession.delete({
      where: { id },
    });

    return { ok: true };
  }

  /**
   * Remove the standalone audio track of a recording: the local .m4a and the
   * Telegram audio message. For an audio-only session the track IS the whole
   * recording, so this deletes the archive entirely.
   */
  async deleteAudioTrack(id: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Archive ${id} was not found.`);
    }

    // Revoke the Telegram copy first (best-effort) for both cases.
    await this.telegramService.deleteAudioMessage(session);

    if (session.audioOnly) {
      // The audio is the recording — fall back to a full archive deletion.
      return this.deleteArchive(id);
    }

    if (session.audioPath) {
      const audioPath = resolve(session.audioPath);
      if (existsSync(audioPath)) {
        rmSync(audioPath, { force: true });
      }
    }

    await this.prisma.streamSession.update({
      where: { id },
      data: {
        audioPath: null,
        audioSizeBytes: null,
        telegramAudioChatId: null,
        telegramAudioMessageId: null,
        telegramAudioFileId: null,
        telegramAudioUploadedAt: null,
        audioDeletedAt: new Date(),
      },
    });

    this.emitRealtime("telegram:updated", {
      sessionId: id,
      telegramStatus: session.telegramStatus,
    });

    return { ok: true };
  }

  async getPlayableFile(id: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
    });

    if (!session?.playbackPath) {
      throw new NotFoundException(`Playback file for archive ${id} was not found.`);
    }

    const playback = resolveSessionPlaybackState(session);

    if (!playback.absolutePath || !playback.fileExists || !playback.videoReady) {
      throw new NotFoundException(`Playback file for archive ${id} is missing on disk.`);
    }

    return {
      absolutePath: playback.absolutePath,
      stat: statSync(playback.absolutePath),
    };
  }

  async getSessionById(id: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      include: {
        channel: true,
        telegramParts: {
          orderBy: { partIndex: "asc" },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${id} was not found.`);
    }

    return {
      item: this.serializeSession(session, session.channel),
    };
  }

  private bindRecordingLifecycle(
    channel: Channel,
    session: StreamSession,
    activeRecording: ActiveRecording,
  ) {
    const logPrefix = `[${channel.twitchLogin}/${session.id}]`;

    activeRecording.streamlinkProcess.stderr?.on("data", (chunk) => {
      this.logger.log(`${logPrefix} streamlink: ${chunk.toString().trim()}`);
    });
    activeRecording.streamlinkProcess.stdout?.on("data", (chunk) => {
      this.logger.debug(`${logPrefix} streamlink: ${chunk.toString().trim()}`);
    });

    const finalize = async (status: "completed" | "error") => {
      if (!this.activeRecordings.has(channel.id)) {
        return;
      }

      this.activeRecordings.delete(channel.id);
      this.chatService.stopCapture(channel.id);

      const fileExists = existsSync(activeRecording.outputPath);
      const fileSizeBytes = fileExists ? statSync(activeRecording.outputPath).size : 0;

      // Best-effort: also clean up the intermediate .ts file if it lingered.
      if (existsSync(activeRecording.tsPath)) {
        try {
          unlinkSync(activeRecording.tsPath);
        } catch {
          // Ignore filesystem errors.
        }
      }
      let finalStatus: "completed" | "error" = status;
      let errorMessage: string | null =
        status === "error" ? "Recording process exited unexpectedly." : null;

      if (fileSizeBytes === 0) {
        finalStatus = "error";
        errorMessage =
          "Recording produced no data. Check that streamlink and ffmpeg are installed and that the channel is live.";

        if (fileExists) {
          try {
            unlinkSync(activeRecording.outputPath);
          } catch {
            // Best-effort cleanup; ignore filesystem errors.
          }
        }
      }

      // The standalone audio track is extracted before the session flips to
      // completed so the Telegram offloader picks it up together with the
      // video. An audio-only capture already IS the audio track.
      const audio =
        finalStatus === "completed" && fileSizeBytes > 0
          ? activeRecording.audioOnly
            ? { path: activeRecording.outputPath, sizeBytes: fileSizeBytes }
            : await this.extractAudioTrack(activeRecording.outputPath, logPrefix)
          : null;

      await this.prisma.streamSession.update({
        where: { id: session.id },
        data: {
          endedAt: new Date(),
          status: finalStatus,
          videoStatus: finalStatus === "completed" ? "ready" : "error",
          replayStatus: finalStatus === "completed" ? "ready" : "error",
          isLive: false,
          fileSizeBytes: String(fileSizeBytes),
          errorMessage,
          ...(fileSizeBytes === 0
            ? { recordingPath: null, playbackPath: null }
            : {}),
          ...(audio
            ? { audioPath: audio.path, audioSizeBytes: String(audio.sizeBytes) }
            : {}),
        },
      });

      try {
        await this.prisma.channel.update({
          where: { id: channel.id },
          data: {
            isLive: false,
            currentTitle: null,
            currentGameName: null,
            liveStartedAt: null,
          },
        });

        this.emitRealtime("channel:updated", {
          channelId: channel.id,
          isLive: false,
          isRecording: false,
        });
      } catch {
        // Channel may have been deleted while the recorder was shutting down.
      }

      this.emitRealtime("recording:stopped", {
        channelId: channel.id,
        sessionId: session.id,
        status,
      });

      if (finalStatus === "completed") {
        // Let the Telegram offloader pick up the finished recording right away
        // instead of waiting for its next periodic scan.
        this.telegramService.kick();
      }

      try {
        await this.syncChannelState(channel.id);
      } catch {
        // Ignore follow-up sync failures during shutdown.
      }
    };

    activeRecording.streamlinkProcess.once("exit", (code) => {
      this.logger.log(`${logPrefix} streamlink exited with code ${String(code)}`);
      void this.runRemuxAndFinalize(channel, session, activeRecording, finalize);
    });

    activeRecording.streamlinkProcess.once("error", (error) => {
      this.logger.warn(`${logPrefix} streamlink failed: ${error.message}`);
    });
  }

  private async runRemuxAndFinalize(
    channel: Channel,
    session: StreamSession,
    activeRecording: ActiveRecording,
    finalize: (status: "completed" | "error") => Promise<void>,
  ) {
    const logPrefix = `[${channel.twitchLogin}/${session.id}]`;
    const tsPath = activeRecording.tsPath;
    const outputPath = activeRecording.outputPath;
    const tsExists = existsSync(tsPath);
    const tsSize = tsExists ? statSync(tsPath).size : 0;

    if (!tsExists || tsSize === 0) {
      this.logger.warn(
        `${logPrefix} streamlink produced no data (${tsSize} bytes). Marking session as error.`,
      );

      if (tsExists) {
        try {
          unlinkSync(tsPath);
        } catch {
          // Ignore.
        }
      }

      await finalize("error");
      return;
    }

    const ffmpegCommand = this.resolveFfmpegCommand();
    const remuxProcess = spawn(
      ffmpegCommand.command,
      [
        ...ffmpegCommand.args,
        "-y",
        "-i",
        tsPath,
        ...(activeRecording.audioOnly ? ["-vn"] : []),
        "-c",
        "copy",
        "-bsf:a",
        "aac_adtstoasc",
        "-movflags",
        "+faststart",
        outputPath,
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    activeRecording.remuxProcess = remuxProcess;

    remuxProcess.stderr?.on("data", (chunk) => {
      this.logger.debug(`${logPrefix} ffmpeg: ${chunk.toString().trim()}`);
    });

    remuxProcess.on("error", (error) => {
      this.logger.warn(`${logPrefix} ffmpeg remux failed to start: ${error.message}`);
    });

    remuxProcess.once("exit", async (code) => {
      this.logger.log(`${logPrefix} ffmpeg remux exited with code ${String(code)}`);

      const success =
        code === 0 && existsSync(outputPath) && statSync(outputPath).size > 0;

      await finalize(success ? "completed" : "error");
    });
  }

  private buildRecordingPath(login: string, startedAt: string, ext: "mp4" | "m4a" = "mp4") {
    const start = new Date(startedAt);
    const safeTimestamp = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(
      2,
      "0",
    )}-${String(start.getUTCDate()).padStart(2, "0")}_${String(start.getUTCHours()).padStart(
      2,
      "0",
    )}-${String(start.getUTCMinutes()).padStart(2, "0")}-${String(
      start.getUTCSeconds(),
    ).padStart(2, "0")}`;

    return resolve(
      process.env.DATA_DIR ?? "./data",
      "records",
      login,
      `${login}_${safeTimestamp}.${ext}`,
    );
  }

  private ensureDataLayout() {
    const dataRoot = resolve(process.env.DATA_DIR ?? "./data");

    for (const dir of ["records", "hls", "chat", "logs", "tmp"]) {
      mkdirSync(join(dataRoot, dir), { recursive: true });
    }
  }

  /**
   * A restart that lands during the post-capture remux (or before it started)
   * kills ffmpeg halfway: the session is marked as error, the .mp4 on disk is
   * unplayable (no moov index), but the source .ts survives — finalize, which
   * would have deleted it, never ran. Re-run the remux for those sessions and
   * promote them back to completed so playback and the Telegram offload work.
   */
  private async recoverInterruptedRemuxes() {
    if (!this.dependenciesReady) {
      return;
    }

    const candidates = await this.prisma.streamSession.findMany({
      where: {
        status: "error",
        recordingPath: { not: null },
      },
      include: { channel: true },
    });

    for (const session of candidates) {
      const outputPath = resolve(session.recordingPath!);
      const tsPath = outputPath.replace(/\.(mp4|m4a)$/i, ".ts");

      if (!existsSync(tsPath) || statSync(tsPath).size === 0) {
        continue;
      }

      if (this.activeRecordings.has(session.channelId)) {
        continue;
      }

      const logPrefix = `[${session.channel.twitchLogin}/${session.id}]`;
      this.logger.log(
        `${logPrefix} found a leftover .ts from an interrupted remux; recovering the recording.`,
      );

      try {
        await this.runFfmpegRemux(tsPath, outputPath, session.audioOnly);

        const fileSizeBytes = existsSync(outputPath) ? statSync(outputPath).size : 0;

        if (fileSizeBytes === 0) {
          throw new Error("Recovered .mp4 is empty.");
        }

        try {
          unlinkSync(tsPath);
        } catch {
          // Best-effort cleanup; ignore filesystem errors.
        }

        const audio = session.audioOnly
          ? { path: outputPath, sizeBytes: fileSizeBytes }
          : session.audioPath
            ? null
            : await this.extractAudioTrack(outputPath, logPrefix);

        await this.prisma.streamSession.update({
          where: { id: session.id },
          data: {
            status: "completed",
            videoStatus: "ready",
            replayStatus: "ready",
            errorMessage: null,
            fileSizeBytes: String(fileSizeBytes),
            ...(audio
              ? { audioPath: audio.path, audioSizeBytes: String(audio.sizeBytes) }
              : {}),
          },
        });

        this.logger.log(
          `${logPrefix} recording recovered (${Math.round(fileSizeBytes / 1024 / 1024)} MB).`,
        );
        this.emitRealtime("recording:stopped", {
          channelId: session.channelId,
          sessionId: session.id,
          status: "completed",
        });
        this.telegramService.kick();
      } catch (error) {
        this.logger.warn(
          `${logPrefix} recovery failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  /**
   * Pull the AAC track out of a finished recording into a standalone .m4a
   * (stream copy, no re-encode). The Twitch userscript overlays it on the VOD
   * to restore DMCA-muted sound. Best-effort: a failure here must never fail
   * the recording itself.
   */
  private async extractAudioTrack(videoPath: string, logPrefix: string) {
    const settings = await this.prisma.appSettings.upsert({
      where: { id: "default" },
      create: { id: "default" },
      update: {},
    });

    if (!settings.audioTrackEnabled) {
      return null;
    }

    const audioPath = videoPath.replace(/\.mp4$/i, ".m4a");

    try {
      const ffmpegCommand = this.resolveFfmpegCommand();

      await new Promise<void>((resolvePromise, rejectPromise) => {
        const child = spawn(
          ffmpegCommand.command,
          [
            ...ffmpegCommand.args,
            "-y",
            "-i",
            videoPath,
            "-vn",
            "-acodec",
            "copy",
            "-movflags",
            "+faststart",
            audioPath,
          ],
          { stdio: ["ignore", "ignore", "pipe"] },
        );

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
              new Error(`ffmpeg exited with code ${String(code)}: ${stderrTail.trim()}`),
            );
          }
        });
      });

      const sizeBytes = existsSync(audioPath) ? statSync(audioPath).size : 0;

      if (sizeBytes === 0) {
        throw new Error("ffmpeg produced an empty audio file.");
      }

      this.logger.log(
        `${logPrefix} audio track extracted (${Math.round(sizeBytes / 1024 / 1024)} MB).`,
      );

      return { path: audioPath, sizeBytes };
    } catch (error) {
      this.logger.warn(
        `${logPrefix} audio extraction failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      try {
        rmSync(audioPath, { force: true });
      } catch {
        // Best-effort cleanup; ignore filesystem errors.
      }
      return null;
    }
  }

  private runFfmpegRemux(tsPath: string, outputPath: string, audioOnly = false) {
    return new Promise<void>((resolvePromise, rejectPromise) => {
      const ffmpegCommand = this.resolveFfmpegCommand();
      const child = spawn(
        ffmpegCommand.command,
        [
          ...ffmpegCommand.args,
          "-y",
          "-i",
          tsPath,
          ...(audioOnly ? ["-vn"] : []),
          "-c",
          "copy",
          "-bsf:a",
          "aac_adtstoasc",
          "-movflags",
          "+faststart",
          outputPath,
        ],
        {
          stdio: ["ignore", "ignore", "pipe"],
        },
      );

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
            new Error(`ffmpeg exited with code ${String(code)}: ${stderrTail.trim()}`),
          );
        }
      });
    });
  }

  private async markStaleRecordingsAsStopped() {
    await this.prisma.streamSession.updateMany({
      where: {
        status: "recording",
      },
      data: {
        status: "error",
        videoStatus: "error",
        replayStatus: "error",
        isLive: false,
        endedAt: new Date(),
        errorMessage: "Recording was interrupted by service restart.",
      },
    });
  }

  private async resolveStreamlinkCommand() {
    return resolveStreamlinkCommand();
  }

  private resolveFfmpegCommand() {
    return { command: "ffmpeg", args: [] };
  }

  private async captureEmoteSnapshot(sessionId: string, twitchUserId: string | null) {
    try {
      const snapshot = await this.sevenTvService.fetchSnapshot(twitchUserId);

      if (!snapshot) {
        return;
      }

      await this.prisma.emoteSnapshot.upsert({
        where: { streamSessionId: sessionId },
        create: {
          streamSessionId: sessionId,
          provider: snapshot.provider,
          payloadJson: JSON.stringify(snapshot),
        },
        update: {
          provider: snapshot.provider,
          payloadJson: JSON.stringify(snapshot),
        },
      });

      this.logger.log(
        `Saved 7TV snapshot for session ${sessionId} (${snapshot.emotes.length} emotes).`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to save 7TV snapshot for session ${sessionId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async checkRecordingDependencies() {
    this.lastDependencyCheckAt = Date.now();
    const wasReady = this.dependenciesReady;
    const previousError = this.dependenciesError;
    const errors: string[] = [];

    try {
      await resolveStreamlinkCommand();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    const ffmpegOk = await new Promise<boolean>((resolvePromise) => {
      try {
        const probe = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
        probe.once("exit", (code) => resolvePromise(code === 0));
        probe.once("error", () => resolvePromise(false));
      } catch {
        resolvePromise(false);
      }
    });

    if (!ffmpegOk) {
      errors.push("ffmpeg is not installed or not in PATH.");
    }

    if (errors.length > 0) {
      this.dependenciesReady = false;
      this.dependenciesError = errors.join(" ");

      if (this.dependenciesError !== previousError) {
        this.logger.error(
          `Recording disabled: ${this.dependenciesError} Install streamlink and ffmpeg; the recorder re-checks automatically.`,
        );
      }
      return;
    }

    this.dependenciesReady = true;
    this.dependenciesError = null;

    if (!wasReady) {
      this.logger.log("Recording dependencies are available (streamlink + ffmpeg).");
    }
  }

  private serializeSession(
    session: StreamSession & { telegramParts?: TelegramUploadPart[] },
    channel: Pick<Channel, "displayName" | "twitchLogin">,
  ) {
    const playback = resolveSessionPlaybackState(session);

    const telegramParts = (session.telegramParts ?? []).map((part) => ({
      partIndex: part.partIndex,
      partCount: part.partCount,
      url: buildTelegramMessageUrl(part.chatId, part.messageId),
      streamUrl: `/api/archives/${session.id}/video?part=${part.partIndex}`,
      startOffsetSec: part.startOffsetSec,
      durationSec: part.durationSec,
    }));

    // A recording whose local file is gone is still watchable when its parts
    // live in Telegram: the video endpoint streams them back via MTProto.
    // Audio-only sessions have no parts — their Telegram copy is one audio
    // message, served by the same video endpoint.
    const telegramPlayable =
      !playback.videoReady &&
      session.telegramStatus === "uploaded" &&
      (telegramParts.length > 0 ||
        (session.audioOnly && Boolean(session.telegramAudioMessageId)));

    return {
      id: session.id,
      channelId: session.channelId,
      channelLogin: channel.twitchLogin,
      channelDisplayName: channel.displayName ?? channel.twitchLogin,
      title: session.title,
      categoryName: session.categoryName,
      status: session.status,
      videoStatus: session.videoStatus,
      chatStatus: session.chatStatus,
      replayStatus: session.replayStatus,
      isLive: session.isLive,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      fileSizeBytes: playback.fileSizeBytes,
      videoReady: playback.videoReady || telegramPlayable,
      videoSource: playback.videoReady ? "local" : telegramPlayable ? "telegram" : null,
      chatAvailable: session.chatAvailable,
      stoppedByUser: session.stoppedByUser,
      recordingSource: session.recordingSource,
      errorMessage: session.errorMessage,
      previewImageUrl: session.previewImageUrl,
      videoUrl:
        playback.videoUrl ??
        (telegramPlayable
          ? telegramParts[0]?.streamUrl ?? `/api/archives/${session.id}/video`
          : null),
      telegramStatus: session.telegramStatus,
      telegramProgress:
        session.telegramStatus === "uploading"
          ? this.telegramService.getUploadProgress(session.id)
          : null,
      telegramError: session.telegramError,
      telegramUploadedAt: session.telegramUploadedAt,
      telegramChatUrl:
        session.telegramChatMessageId && (session.telegramParts ?? [])[0]
          ? buildTelegramMessageUrl(
              (session.telegramParts ?? [])[0].chatId,
              session.telegramChatMessageId,
            )
          : null,
      localFileDeletedAt: session.localFileDeletedAt,
      telegramParts,
      audioOnly: session.audioOnly,
      // The standalone audio track for the Twitch userscript: available while
      // it exists locally or in Telegram and was not auto-expired.
      audioAvailable:
        !session.audioDeletedAt &&
        Boolean(session.audioPath || session.telegramAudioMessageId),
      createdAt: session.createdAt,
    };
  }

  private emitRealtime(event: string, payload: Record<string, unknown>) {
    this.realtimeGateway.server?.emit(event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
