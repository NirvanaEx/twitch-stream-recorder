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

export type EmoteEntry = {
  id: string;
  name: string;
  url: string;
  animated: boolean;
};

export type EmoteSnapshotPayload = {
  provider: "7tv";
  fetchedAt: string;
  emotes: EmoteEntry[];
};

@Injectable()
export class SevenTvService {
  private readonly logger = new Logger(SevenTvService.name);

  async fetchSnapshot(twitchUserId: string | null | undefined): Promise<EmoteSnapshotPayload | null> {
    if (!twitchUserId) {
      return null;
    }

    try {
      const response = await fetch(`https://7tv.io/v3/users/twitch/${encodeURIComponent(twitchUserId)}`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        this.logger.warn(`7TV lookup failed for user ${twitchUserId}: ${response.status}`);
        return null;
      }

      const payload = (await response.json()) as SevenTvUserResponse;
      const rawEmotes = payload.emote_set?.emotes ?? [];

      const emotes: EmoteEntry[] = rawEmotes
        .map((emote) => this.toEntry(emote))
        .filter((entry): entry is EmoteEntry => entry !== null);

      return {
        provider: "7tv",
        fetchedAt: new Date().toISOString(),
        emotes,
      };
    } catch (error) {
      this.logger.warn(
        `7TV snapshot fetch error for ${twitchUserId}: ${
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
