import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { resolveSessionPlaybackState } from "../recording/playback.utils";
import { SettingsService } from "../settings/settings.service";

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async getOverview() {
    const [trackedChannels, liveChannels, activeRecordings, latestArchivesRaw, channelsRaw, settings] =
      await Promise.all([
      this.prisma.channel.count(),
      this.prisma.channel.count({
        where: {
          isLive: true,
        },
      }),
      this.prisma.streamSession.count({
        where: {
          status: "recording",
        },
      }),
      this.prisma.streamSession.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          playbackPath: {
            not: null,
          },
          status: {
            not: "recording",
          },
        },
        include: {
          channel: true,
        },
      }),
      this.prisma.channel.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 12,
        include: {
          streamSessions: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),
      this.settingsService.getSettings(),
    ]);

    const latestArchives = latestArchivesRaw as Array<{
      id: string;
      title: string | null;
      status: string;
      isLive: boolean;
      playbackPath: string | null;
      fileSizeBytes: string | null;
      createdAt: Date;
      channel: {
        twitchLogin: string;
        displayName: string | null;
      };
    }>;

    return {
      trackedChannels,
      liveChannels,
      activeRecordings,
      channels: channelsRaw.map((channel) => {
        const latestSession = channel.streamSessions[0];
        const playback = latestSession ? resolveSessionPlaybackState(latestSession) : null;

        return {
          id: channel.id,
          twitchLogin: channel.twitchLogin,
          displayName: channel.displayName ?? channel.twitchLogin,
          profileImageUrl: channel.profileImageUrl,
          isLive: channel.isLive,
          manualStopUntilOffline: channel.manualStopUntilOffline,
          currentTitle: channel.currentTitle,
          currentGameName: channel.currentGameName,
          latestSession: latestSession
            ? {
                id: latestSession.id,
                status: latestSession.status,
                videoReady: playback?.videoReady ?? false,
                videoUrl: playback?.videoUrl ?? null,
              }
            : null,
        };
      }),
      latestArchives: latestArchives.map((session) => {
        const playback = resolveSessionPlaybackState(session);

        return {
          id: session.id,
          channelLogin: session.channel.twitchLogin,
          channelDisplayName: session.channel.displayName ?? session.channel.twitchLogin,
          title: session.title,
          status: session.status,
          isLive: session.isLive,
          videoReady: playback.videoReady,
          videoUrl: playback.videoUrl,
          createdAt: session.createdAt,
        };
      }),
      settings,
    };
  }
}
