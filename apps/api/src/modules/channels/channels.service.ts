import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RecordingService } from "../recording/recording.service";
import { resolveSessionPlaybackState } from "../recording/playback.utils";
import { PlatformsService } from "../platforms/platforms.service";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { UpdateChannelDto } from "./dto/update-channel.dto";

@Injectable()
export class ChannelsService implements OnModuleInit {
  private readonly logger = new Logger(ChannelsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly platformsService: PlatformsService,
    private readonly recordingService: RecordingService,
  ) {}

  /**
   * Channels created before video/audio became separate switches only had
   * `audioOnly`. New columns default to "record everything", which would
   * silently turn video back on for audio-only channels — so translate the old
   * flag once. Self-limiting: after this runs, recordVideo is false for those
   * rows, and any later toggle keeps audioOnly in sync itself.
   */
  async onModuleInit() {
    const migrated = await this.prisma.channel.updateMany({
      where: { audioOnly: true, recordVideo: true },
      data: { recordVideo: false, recordAudio: true },
    });

    if (migrated.count > 0) {
      this.logger.log(
        `Moved ${migrated.count} audio-only channel(s) onto the separate video/audio switches.`,
      );
    }
  }

  async listChannels() {
    const items = await this.prisma.channel.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        streamSessions: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return {
      items: items.map((channel) => {
        const latestSession = channel.streamSessions[0];
        const playback = latestSession ? resolveSessionPlaybackState(latestSession) : null;

        return {
          id: channel.id,
          platform: channel.platform,
          twitchLogin: channel.twitchLogin,
          twitchUserId: channel.twitchUserId,
          displayName: channel.displayName,
          profileImageUrl: channel.profileImageUrl,
          isEnabled: channel.isEnabled,
          autoRecord: channel.autoRecord,
          recordVideo: channel.recordVideo,
          recordAudio: channel.recordAudio,
          audioOnly: channel.audioOnly,
          manualStopUntilOffline: channel.manualStopUntilOffline,
          preferredQuality: channel.preferredQuality,
          isLive: channel.isLive,
          currentTitle: channel.currentTitle,
          currentGameName: channel.currentGameName,
          liveStartedAt: channel.liveStartedAt,
          lastSeenLiveAt: channel.lastSeenLiveAt,
          latestSession: latestSession
            ? {
                id: latestSession.id,
                status: latestSession.status,
                isLive: latestSession.isLive,
                title: latestSession.title,
                startedAt: latestSession.startedAt,
                endedAt: latestSession.endedAt,
                videoReady: playback?.videoReady ?? false,
                videoUrl: playback?.videoUrl ?? null,
              }
            : null,
        };
      }),
    };
  }

  async createChannel(dto: CreateChannelDto) {
    const platform = this.platformsService.assertSupported(dto.platform);
    const user = await this.platformsService.resolveChannel(platform, dto.channel);

    const existing = await this.prisma.channel.findUnique({
      where: {
        platform_twitchLogin: { platform, twitchLogin: user.login },
      },
    });

    if (existing) {
      throw new ConflictException("This channel is already in the list.");
    }

    let liveStream = null;
    let warning: string | null = null;

    try {
      liveStream = await this.platformsService.getLiveStream(platform, {
        userId: user.id,
        login: user.login,
      });
    } catch (error) {
      if (user.source !== "public") {
        throw error;
      }

      warning = error instanceof Error ? error.message : "Live status could not be checked.";
      this.logger.warn(
        `Channel ${user.login} was added in public mode without a live check: ${warning}`,
      );
    }

    const channel = await this.prisma.channel.create({
      data: {
        platform,
        twitchUserId: user.id,
        twitchLogin: user.login,
        displayName: user.displayName ?? user.login,
        profileImageUrl: user.profileImageUrl,
        isEnabled: true,
        autoRecord: true,
        preferredQuality: "best",
        isLive: Boolean(liveStream),
        currentTitle: liveStream?.title ?? null,
        currentGameName: liveStream?.gameName ?? null,
        liveStartedAt: liveStream
          ? liveStream.startedAt
            ? new Date(liveStream.startedAt)
            : new Date()
          : null,
        lastSeenLiveAt: liveStream ? new Date() : null,
        manualStopUntilOffline: false,
      },
    });

    if (liveStream) {
      try {
        await this.recordingService.startRecording(channel.id, "automatic");
      } catch (error) {
        const startWarning =
          error instanceof Error ? error.message : "Recording did not start automatically.";
        warning = warning ? `${warning} ${startWarning}` : startWarning;
        this.logger.warn(
          `Channel ${channel.twitchLogin} was added, but recording did not start automatically: ${startWarning}`,
        );
      }
    }

    const response = await this.getChannel(channel.id);
    return {
      ...response,
      warning,
    };
  }

  async updateChannel(id: string, dto: UpdateChannelDto) {
    const current = await this.ensureChannelExists(id);

    // Video and audio are separate switches now. `audioOnly` is still accepted
    // from older clients and simply means "video off, audio on".
    let recordVideo = dto.recordVideo ?? current.recordVideo;
    let recordAudio = dto.recordAudio ?? current.recordAudio;

    if (dto.recordVideo === undefined && dto.audioOnly !== undefined) {
      recordVideo = !dto.audioOnly;
      if (dto.audioOnly) recordAudio = true;
    }

    if (!recordVideo && !recordAudio) {
      throw new BadRequestException(
        "Нужно оставить включённой хотя бы одну дорожку: видео или звук.",
      );
    }

    const channel = await this.prisma.channel.update({
      where: { id },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName.trim() } : {}),
        ...(dto.isEnabled !== undefined ? { isEnabled: dto.isEnabled } : {}),
        ...(dto.autoRecord !== undefined ? { autoRecord: dto.autoRecord } : {}),
        // Takes effect from the NEXT recording: an active capture keeps the
        // mode it was started with.
        recordVideo,
        recordAudio,
        // Derived mirror the recorder uses to pick the streamlink variant.
        audioOnly: recordAudio && !recordVideo,
        ...(dto.preferredQuality !== undefined
          ? { preferredQuality: dto.preferredQuality }
          : {}),
      },
    });

    if (dto.autoRecord) {
      await this.recordingService.syncChannelState(channel.id);
    }

    return this.getChannel(channel.id);
  }

  async startRecording(id: string) {
    const result = await this.recordingService.startRecording(id, "manual");
    return result;
  }

  async stopRecording(id: string) {
    return this.recordingService.stopRecording(id, true);
  }

  async syncChannel(id: string) {
    await this.recordingService.syncChannelState(id);
    return this.getChannel(id);
  }

  async deleteChannel(id: string) {
    const channel = await this.ensureChannelExists(id);

    const latestRecording = await this.prisma.streamSession.findFirst({
      where: {
        channelId: channel.id,
        status: "recording",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestRecording) {
      await this.recordingService.stopRecording(channel.id, true);
    }

    await this.prisma.channel.delete({
      where: { id },
    });

    return { ok: true };
  }

  private async getChannel(id: string) {
    const response = await this.listChannels();
    const item = response.items.find((channel) => channel.id === id);

    if (!item) {
      throw new NotFoundException(`Channel ${id} was not found.`);
    }

    return { item };
  }

  private async ensureChannelExists(id: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Channel ${id} was not found.`);
    }

    return channel;
  }
}
