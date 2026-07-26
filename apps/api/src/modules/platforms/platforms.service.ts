import { BadRequestException, Injectable } from "@nestjs/common";
import { KickService } from "../kick/kick.service";
import { TwitchService } from "../twitch/twitch.service";

/**
 * One entry point for "which site is this channel on".
 *
 * TwitchService and KickService expose the same three methods, so callers
 * (channel creation, the recorder's live polling) dispatch here instead of
 * branching on the platform themselves.
 */

export const PLATFORMS = ["twitch", "kick"] as const;
export type Platform = (typeof PLATFORMS)[number];

export function isPlatform(value: unknown): value is Platform {
  return typeof value === "string" && (PLATFORMS as readonly string[]).includes(value);
}

@Injectable()
export class PlatformsService {
  constructor(
    private readonly twitchService: TwitchService,
    private readonly kickService: KickService,
  ) {}

  /** Normalise whatever is stored on a channel row into a known platform. */
  resolvePlatform(value: string | null | undefined): Platform {
    return isPlatform(value) ? value : "twitch";
  }

  private provider(platform: string | null | undefined) {
    return this.resolvePlatform(platform) === "kick" ? this.kickService : this.twitchService;
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
    return this.resolvePlatform(platform) === "kick"
      ? `https://kick.com/${login}`
      : `https://www.twitch.tv/${login}`;
  }

  /**
   * Quality string for streamlink.
   *
   * Twitch publishes a real `audio_only` HLS variant, so an audio-only capture
   * downloads no video at all. Kick (Amazon IVS) only offers 160p…1080p60 —
   * there is nothing to select but the smallest video rendition, which the
   * remux then strips with -vn. The result is the same .m4a, it just costs the
   * bandwidth of a 160p stream to get there.
   */
  captureQuality(
    platform: string | null | undefined,
    options: { audioOnly: boolean; preferredQuality: string | null | undefined },
  ) {
    if (!options.audioOnly) {
      return options.preferredQuality || "best";
    }

    return this.resolvePlatform(platform) === "kick" ? "worst" : "audio_only";
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
