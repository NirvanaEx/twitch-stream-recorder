import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Channel, StreamSession } from "@prisma/client";
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

type ActiveRecording = {
  channelId: string;
  sessionId: string;
  streamlinkProcess: ChildProcess;
  remuxProcess: ChildProcess | null;
  tsPath: string;
  outputPath: string;
  stopRequested: boolean;
};

@Injectable()
export class RecordingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RecordingService.name);
  private readonly activeRecordings = new Map<string, ActiveRecording>();
  private monitorTimer: NodeJS.Timeout | null = null;
  private dependenciesReady = false;
  private dependenciesError: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly twitchService: TwitchService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly chatService: ChatService,
    private readonly sevenTvService: SevenTvService,
  ) {}

  async onModuleInit() {
    this.ensureDataLayout();
    await this.markStaleRecordingsAsStopped();
    await this.checkRecordingDependencies();
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

    if (
      liveStream &&
      channel.autoRecord &&
      !channel.manualStopUntilOffline &&
      !isRecording &&
      this.dependenciesReady
    ) {
      const alreadyHandled = liveStream.id
        ? await this.prisma.streamSession.findFirst({
            where: { channelId: channel.id, twitchStreamId: liveStream.id },
            select: { id: true },
          })
        : null;

      if (!alreadyHandled) {
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
      await this.stopRecording(channel.id, false);
    }

    return liveStream;
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

      if (duplicateSession) {
        if (trigger === "automatic") {
          return {
            item: this.serializeSession(duplicateSession, duplicateSession.channel),
          };
        }

        if (duplicateSession.status === "recording") {
          return {
            item: this.serializeSession(duplicateSession, duplicateSession.channel),
          };
        }
      }
    }

    const streamlinkCommand = await this.resolveStreamlinkCommand();
    this.resolveFfmpegCommand();

    const recordingStartedAt = liveStream.startedAt ?? new Date().toISOString();
    const outputPath = this.buildRecordingPath(channel.twitchLogin, recordingStartedAt);
    const tsPath = outputPath.replace(/\.mp4$/i, ".ts");
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
        previewImageUrl: liveStream.previewImageUrl,
        chatAvailable: false,
      },
    });

    const quality = channel.preferredQuality || "best";
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
      stopRequested: false,
    };

    this.activeRecordings.set(channel.id, activeRecording);
    this.bindRecordingLifecycle(channel, session, activeRecording);

    // Start chat capture in parallel. The anchor is "now" (when streamlink
    // actually started writing video), NOT session.startedAt — Twitch reports
    // the original go-live time, which can be hours before we joined the stream.
    // We need chat relativeTime to align with the recorded video timeline.
    this.chatService.startCapture({
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

  async getArchiveList() {
    const items = await this.prisma.streamSession.findMany({
      where: {
        playbackPath: {
          not: null,
        },
      },
      include: {
        channel: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return {
      items: items.map((session) => this.serializeSession(session, session.channel)),
    };
  }

  async getArchiveById(id: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      include: {
        channel: true,
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

    await this.prisma.streamSession.delete({
      where: { id },
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

  private buildRecordingPath(login: string, startedAt: string) {
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
      `${login}_${safeTimestamp}.mp4`,
    );
  }

  private ensureDataLayout() {
    const dataRoot = resolve(process.env.DATA_DIR ?? "./data");

    for (const dir of ["records", "hls", "chat", "logs", "tmp"]) {
      mkdirSync(join(dataRoot, dir), { recursive: true });
    }
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
      this.logger.error(
        `Recording disabled: ${this.dependenciesError} Install streamlink and ffmpeg, then restart the API.`,
      );
      return;
    }

    this.dependenciesReady = true;
    this.dependenciesError = null;
    this.logger.log("Recording dependencies are available (streamlink + ffmpeg).");
  }

  private serializeSession(session: StreamSession, channel: Pick<Channel, "displayName" | "twitchLogin">) {
    const playback = resolveSessionPlaybackState(session);

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
      videoReady: playback.videoReady,
      chatAvailable: session.chatAvailable,
      stoppedByUser: session.stoppedByUser,
      recordingSource: session.recordingSource,
      errorMessage: session.errorMessage,
      previewImageUrl: session.previewImageUrl,
      videoUrl: playback.videoUrl,
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
