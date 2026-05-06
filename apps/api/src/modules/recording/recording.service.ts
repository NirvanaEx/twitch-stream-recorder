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
import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { TwitchService } from "../twitch/twitch.service";
import { resolveSessionPlaybackState } from "./playback.utils";
import { resolveStreamlinkCommand } from "../twitch/streamlink.utils";

type ActiveRecording = {
  channelId: string;
  sessionId: string;
  streamlinkProcess: ChildProcess;
  ffmpegProcess: ChildProcess;
  outputPath: string;
  stopRequested: boolean;
};

@Injectable()
export class RecordingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RecordingService.name);
  private readonly activeRecordings = new Map<string, ActiveRecording>();
  private monitorTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly twitchService: TwitchService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async onModuleInit() {
    this.ensureDataLayout();
    await this.markStaleRecordingsAsStopped();
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

    if (liveStream && channel.autoRecord && !channel.manualStopUntilOffline && !isRecording) {
      await this.startRecording(channel.id, "automatic");
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

    const recordingStartedAt = liveStream.startedAt ?? new Date().toISOString();
    const outputPath = this.buildRecordingPath(channel.twitchLogin, recordingStartedAt);
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

    const streamlinkCommand = await this.resolveStreamlinkCommand();
    const ffmpegCommand = this.resolveFfmpegCommand();
    const quality = channel.preferredQuality || "best";
    const channelUrl = `https://www.twitch.tv/${channel.twitchLogin}`;

    const streamlinkProcess = spawn(
      streamlinkCommand.command,
      [...streamlinkCommand.args, "--stdout", channelUrl, quality],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    const ffmpegProcess = spawn(
      ffmpegCommand.command,
      [
        ...ffmpegCommand.args,
        "-y",
        "-i",
        "pipe:0",
        "-c",
        "copy",
        "-movflags",
        "+frag_keyframe+empty_moov+default_base_moof",
        outputPath,
      ],
      {
        stdio: ["pipe", "ignore", "pipe"],
      },
    );

    if (!streamlinkProcess.stdout || !ffmpegProcess.stdin) {
      throw new BadRequestException("Unable to attach recording pipeline.");
    }

    streamlinkProcess.stdout.pipe(ffmpegProcess.stdin);

    const activeRecording: ActiveRecording = {
      channelId: channel.id,
      sessionId: session.id,
      streamlinkProcess,
      ffmpegProcess,
      outputPath,
      stopRequested: false,
    };

    this.activeRecordings.set(channel.id, activeRecording);
    this.bindRecordingLifecycle(channel, session, activeRecording);

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

    try {
      activeRecording.ffmpegProcess.kill("SIGTERM");
    } catch {
      // Ignore already exited process.
    }

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
      this.logger.debug(`${logPrefix} streamlink: ${chunk.toString().trim()}`);
    });

    activeRecording.ffmpegProcess.stderr?.on("data", (chunk) => {
      this.logger.debug(`${logPrefix} ffmpeg: ${chunk.toString().trim()}`);
    });

    const finalize = async (status: "completed" | "error") => {
      if (!this.activeRecordings.has(channel.id)) {
        return;
      }

      this.activeRecordings.delete(channel.id);

      const fileExists = existsSync(activeRecording.outputPath);
      const fileSizeBytes = fileExists ? statSync(activeRecording.outputPath).size : 0;

      await this.prisma.streamSession.update({
        where: { id: session.id },
        data: {
          endedAt: new Date(),
          status,
          videoStatus: status === "completed" ? "ready" : "error",
          replayStatus: status === "completed" ? "ready" : "error",
          isLive: false,
          fileSizeBytes: String(fileSizeBytes),
          errorMessage: status === "error" ? "Recording process exited unexpectedly." : null,
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

    activeRecording.ffmpegProcess.once("exit", (code) => {
      void finalize(activeRecording.stopRequested || code === 0 ? "completed" : "error");
    });

    activeRecording.ffmpegProcess.once("error", () => {
      void finalize("error");
    });

    activeRecording.streamlinkProcess.once("error", () => {
      try {
        activeRecording.ffmpegProcess.kill("SIGTERM");
      } catch {
        // Ignore.
      }
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
