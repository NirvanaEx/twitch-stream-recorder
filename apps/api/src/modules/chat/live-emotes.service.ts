import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmoteMirrorService } from "./emote-mirror.service";
import { SevenTvService, type EmotePlatform, type EmoteSnapshotPayload } from "./seventv.service";

/**
 * The channel's 7TV set *as it is right now*, for the "current emotes" mode of
 * the chat replay.
 *
 * The stored snapshot is the honest default: it shows the stream the way it
 * looked, with the names the chat was actually typing. But it only exists for
 * recordings made after the capture was wired up — every Kick recording made
 * before that has none at all — and a set that grew since the stream will not
 * render newer emotes. Switching to this source fixes both, at the cost of
 * being a reconstruction rather than a record.
 *
 * Fetches are cached per channel and collapsed while in flight: these
 * endpoints are reachable anonymously from the public archive page, and one
 * uncached call means a 7TV round-trip plus, on a cold mirror, several hundred
 * image downloads.
 */

const CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry = { value: EmoteSnapshotPayload | null; at: number };

@Injectable()
export class LiveEmotesService {
  private readonly logger = new Logger(LiveEmotesService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<EmoteSnapshotPayload | null>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly sevenTvService: SevenTvService,
    private readonly emoteMirrorService: EmoteMirrorService,
  ) {}

  async forSession(sessionId: string): Promise<EmoteSnapshotPayload | null> {
    const settings = await this.prisma.appSettings.findUnique({ where: { id: "default" } });

    if (settings?.support7tv === false) {
      return null;
    }

    const session = await this.prisma.streamSession.findUnique({
      where: { id: sessionId },
      select: { channel: { select: { platform: true, twitchUserId: true } } },
    });

    const channel = session?.channel;

    if (!channel?.twitchUserId) {
      return null;
    }

    // VK Play Live is not on 7TV, and its channel id would be looked up as if
    // it were a Twitch one — a request that can only come back empty. Its
    // smiles travel inside each message anyway.
    if (channel.platform === "vkplay") {
      return null;
    }

    const platform: EmotePlatform = channel.platform === "kick" ? "kick" : "twitch";
    const key = `${platform}:${channel.twitchUserId}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.value;
    }

    const existing = this.inFlight.get(key);

    if (existing) {
      return existing;
    }

    const request = this.load(platform, channel.twitchUserId)
      .then((value) => {
        this.cache.set(key, { value, at: Date.now() });
        return value;
      })
      .catch((error) => {
        this.logger.warn(
          `Live 7TV lookup failed for ${key}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        return null;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, request);
    return request;
  }

  private async load(platform: EmotePlatform, platformUserId: string) {
    const snapshot = await this.sevenTvService.fetchSnapshot(platform, platformUserId);

    if (!snapshot) {
      return null;
    }

    // Mirror here too: the images this mode shows should outlive 7TV exactly
    // like the recorded ones, and a warm mirror makes the next fetch free.
    const { entries } = await this.emoteMirrorService.mirror(snapshot.emotes);

    return { ...snapshot, emotes: entries };
  }
}
