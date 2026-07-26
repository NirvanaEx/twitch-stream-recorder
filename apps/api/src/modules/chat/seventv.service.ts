import { Injectable, Logger } from "@nestjs/common";

type SevenTvHost = {
  url: string;
  files: Array<{
    name: string;
    format: string;
    width?: number;
    height?: number;
  }>;
};

type SevenTvEmote = {
  id: string;
  name: string;
  data?: {
    host?: SevenTvHost;
    animated?: boolean;
  };
};

type SevenTvUserResponse = {
  emote_set?: {
    id: string;
    emotes?: SevenTvEmote[];
  };
};

/**
 * 7TV keys a connection by the *platform's own user id*. For Kick that is the
 * user id (`user_id`), NOT the channel id — they differ (xQc: channel 668,
 * user 676, and only 676 resolves). Channel.twitchUserId already holds the
 * user id for both platforms, so no extra lookup is needed.
 */
export type EmotePlatform = "twitch" | "kick";

export type EmoteEntry = {
  id: string;
  name: string;
  /** Original 7TV CDN url. Kept verbatim: the userscript and old snapshots use it. */
  url: string;
  /**
   * API-relative path of our own copy, set once the image has been mirrored to
   * disk. Absent when mirroring is off or the download failed.
   */
  localUrl?: string;
  animated: boolean;
};

export type EmoteSnapshotPayload = {
  provider: "7tv";
  /** Absent in snapshots taken before Kick support — read as "twitch". */
  platform?: EmotePlatform;
  fetchedAt: string;
  emotes: EmoteEntry[];
};

@Injectable()
export class SevenTvService {
  private readonly logger = new Logger(SevenTvService.name);

  async fetchSnapshot(
    platform: EmotePlatform,
    platformUserId: string | null | undefined,
  ): Promise<EmoteSnapshotPayload | null> {
    if (!platformUserId) {
      return null;
    }

    try {
      const response = await fetch(
        `https://7tv.io/v3/users/${platform}/${encodeURIComponent(platformUserId)}`,
        { headers: { Accept: "application/json" } },
      );

      if (!response.ok) {
        // 404 is the normal answer for a streamer who never linked 7TV —
        // common on Kick, so it is not worth a warning.
        if (response.status !== 404) {
          this.logger.warn(
            `7TV lookup failed for ${platform} user ${platformUserId}: ${response.status}`,
          );
        }
        return null;
      }

      const payload = (await response.json()) as SevenTvUserResponse;
      const rawEmotes = payload.emote_set?.emotes ?? [];

      const emotes: EmoteEntry[] = rawEmotes
        .map((emote) => this.toEntry(emote))
        .filter((entry): entry is EmoteEntry => entry !== null);

      return {
        provider: "7tv",
        platform,
        fetchedAt: new Date().toISOString(),
        emotes,
      };
    } catch (error) {
      this.logger.warn(
        `7TV snapshot fetch error for ${platform} user ${platformUserId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private toEntry(emote: SevenTvEmote): EmoteEntry | null {
    const host = emote.data?.host;

    if (!host?.url || !host.files?.length) {
      return null;
    }

    // Prefer 2x webp, then 1x webp, then any webp, then first available file.
    const webpFiles = host.files.filter((file) => file.format === "WEBP");
    const preferred =
      webpFiles.find((file) => file.name === "2x.webp") ??
      webpFiles.find((file) => file.name === "1x.webp") ??
      webpFiles[0] ??
      host.files[0];

    if (!preferred) {
      return null;
    }

    const baseUrl = host.url.startsWith("http") ? host.url : `https:${host.url}`;

    return {
      id: emote.id,
      name: emote.name,
      url: `${baseUrl}/${preferred.name}`,
      animated: Boolean(emote.data?.animated),
    };
  }
}
