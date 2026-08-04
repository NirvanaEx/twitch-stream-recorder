import { BadRequestException, Injectable } from "@nestjs/common";
import { KickService } from "../kick/kick.service";
import { TwitchService } from "../twitch/twitch.service";
import { VkPlayService } from "../vkplay/vkplay.service";

/**
 * One entry point for "which site is this channel on".
 *
 * TwitchService, KickService and VkPlayService expose the same three methods,
 * so callers (channel creation, the recorder's live polling) dispatch here
 * instead of branching on the platform themselves.
 */

export const PLATFORMS = ["twitch", "kick", "vkplay"] as const;
export type Platform = (typeof PLATFORMS)[number];

export function isPlatform(value: unknown): value is Platform {
  return typeof value === "string" && (PLATFORMS as readonly string[]).includes(value);
}

@Injectable()
export class PlatformsService {
  constructor(
    private readonly twitchService: TwitchService,
    private readonly kickService: KickService,
    private readonly vkPlayService: VkPlayService,
  ) {}

  /** Normalise whatever is stored on a channel row into a known platform. */
  resolvePlatform(value: string | null | undefined): Platform {
    return isPlatform(value) ? value : "twitch";
  }

  private provider(platform: string | null | undefined) {
    switch (this.resolvePlatform(platform)) {
      case "kick":
        return this.kickService;
      case "vkplay":
        return this.vkPlayService;
      default:
        return this.twitchService;
    }
  }

  normalizeChannelInput(platform: string | null | undefined, input: string) {
    return this.provider(platform).normalizeChannelInput(input);
  }

  resolveChannel(platform: string | null | undefined, input: string) {
    return this.provider(platform).resolveChannel(input);
  }

  getLiveStream(
    platform: string | null | undefined,
    input: { userId?: string | null; login?: string | null },
  ) {
    return this.provider(platform).getLiveStream(input);
  }

  /** Public page URL streamlink is pointed at. */
  channelUrl(platform: string | null | undefined, login: string) {
    switch (this.resolvePlatform(platform)) {
      case "kick":
        return `https://kick.com/${login}`;
      // streamlink's vkvideolive plugin matches this host, live.vkplay.ru and
      // vkplay.live alike; the current one is the one to hand it.
      case "vkplay":
        return `https://live.vkvideo.ru/${login}`;
      default:
        return `https://www.twitch.tv/${login}`;
    }
  }

  /**
   * Quality string for streamlink.
   *
   * Twitch publishes a real `audio_only` HLS variant, so an audio-only capture
   * downloads no video at all. Kick (Amazon IVS) only offers 160p…1080p60 and
   * VK Play Live 240p60…1440p60 — on both there is nothing to select but the
   * smallest video rendition, which the remux then strips with -vn. The result
   * is the same .m4a, it just costs the bandwidth of a small video stream to
   * get there.
   */
  captureQuality(
    platform: string | null | undefined,
    options: { audioOnly: boolean; preferredQuality: string | null | undefined },
  ) {
    if (!options.audioOnly) {
      return options.preferredQuality || "best";
    }

    return this.resolvePlatform(platform) === "twitch" ? "audio_only" : "worst";
  }

  /** Rejects a platform the app does not support before anything is stored. */
  assertSupported(platform: string | null | undefined) {
    if (platform !== undefined && platform !== null && !isPlatform(platform)) {
      throw new BadRequestException(`Unsupported platform: ${String(platform)}.`);
    }

    return this.resolvePlatform(platform);
  }

  getConfigurationState() {
    return {
      twitch: this.twitchService.getConfigurationState(),
      kick: this.kickService.getConfigurationState(),
    };
  }
}
