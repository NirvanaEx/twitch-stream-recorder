import { Injectable, Logger } from "@nestjs/common";

/**
 * VK Play Live (live.vkvideo.ru, formerly vkplay.live) through the API its own
 * web player uses.
 *
 * Unlike Kick, nothing here needs credentials, a developer app or streamlink's
 * TLS trickery: one GET answers whether a channel is live and with what, and a
 * second one hands out an anonymous websocket token for chat. The endpoints are
 * undocumented but they are what the site itself runs on, so they change about
 * as often as the site does.
 *
 * VK Video proper (vkvideo.ru, vk.com) is a different platform and is NOT
 * covered here: its listings redirect to login.vk.ru, so watching a channel
 * there needs a VK API token.
 */

const API_BASE = "https://api.live.vkvideo.ru/v1";

// The pubsub and the API both refuse a request that does not look like it came
// from the site. Origin is the one header that matters; the handshake fails
// without it.
export const VKPLAY_ORIGIN = "https://live.vkvideo.ru";

const REQUEST_TIMEOUT_MS = 10_000;

// The recorder polls every channel on a 15s timer and more than one call site
// wants the same answer within a pass.
const CACHE_TTL_MS = 10_000;

export type VkPlayStream = {
  /** Per-broadcast id: changes when the streamer starts a new stream. */
  streamId: string | null;
  /** The channel's numeric id on the platform, as used by every ws channel. */
  blogId: string | null;
  channelName: string;
  displayName: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  title: string | null;
  category: string | null;
  viewers: number | null;
  /** ISO timestamp of when the broadcast went live. */
  startedAt: string | null;
  previewUrl: string | null;
  hasChat: boolean;
  /** Pubsub channel carrying chat messages, e.g. "channel-chat:12270079". */
  chatChannel: string | null;
};

type RawStream = {
  id?: string;
  isOnline?: boolean;
  title?: string;
  startTime?: number;
  previewUrl?: string;
  hasChat?: boolean;
  wsChatChannel?: string;
  wsStreamChannel?: string;
  category?: { title?: string } | null;
  count?: { viewers?: number } | null;
  user?: { displayName?: string; nick?: string; avatarUrl?: string } | null;
};

@Injectable()
export class VkPlayPublicClient {
  private readonly logger = new Logger(VkPlayPublicClient.name);
  private readonly cache = new Map<string, { value: VkPlayStream | null; at: number }>();
  private readonly inFlight = new Map<string, Promise<VkPlayStream | null>>();

  /**
   * The channel's current state. Answers for an offline channel too — that is
   * how "is it live" is polled — and null only when there is no such channel.
   */
  async getStream(channelName: string, forceRefresh = false): Promise<VkPlayStream | null> {
    const key = channelName.toLowerCase();
    const cached = this.cache.get(key);

    if (!forceRefresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.value;
    }

    const existing = this.inFlight.get(key);
    if (existing) {
      return existing;
    }

    const request = this.fetchStream(key)
      .then((value) => {
        this.cache.set(key, { value, at: Date.now() });
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, request);

    return request;
  }

  /**
   * Anonymous token for the chat pubsub. It is issued against the caller's IP
   * and lasts a month, but it is cheap enough to take a fresh one per
   * connection rather than nurse an expiry.
   */
  async getWebsocketToken(): Promise<string | null> {
    const payload = await this.request<{ token?: string }>("/ws/connect");

    return payload?.token ?? null;
  }

  private async fetchStream(channelName: string): Promise<VkPlayStream | null> {
    const raw = await this.request<RawStream>(
      `/blog/${encodeURIComponent(channelName)}/public_video_stream`,
    );

    if (!raw) {
      return null;
    }

    return {
      streamId: raw.id ?? null,
      blogId: parseBlogId(raw.wsChatChannel ?? raw.wsStreamChannel),
      channelName,
      displayName: raw.user?.displayName ?? raw.user?.nick ?? null,
      avatarUrl: raw.user?.avatarUrl ?? null,
      isOnline: raw.isOnline === true,
      title: raw.title?.trim() || null,
      category: raw.category?.title ?? null,
      viewers: typeof raw.count?.viewers === "number" ? raw.count.viewers : null,
      // startTime is unix seconds; the recorder speaks ISO everywhere else.
      startedAt: raw.startTime ? new Date(raw.startTime * 1000).toISOString() : null,
      previewUrl: raw.previewUrl ?? null,
      hasChat: raw.hasChat !== false,
      chatChannel: raw.wsChatChannel ?? null,
    };
  }

  private async request<T>(path: string): Promise<T | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        headers: { Origin: VKPLAY_ORIGIN, Accept: "application/json" },
        signal: controller.signal,
      });

      // A channel that does not exist is an answer, not a failure.
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`VK Play API answered ${response.status} for ${path}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      this.logger.warn(
        `VK Play request ${path} failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

/** "channel-chat:12270079" → "12270079". */
export function parseBlogId(wsChannel: string | null | undefined) {
  const matched = /:(\d+)/.exec(wsChannel ?? "");

  return matched ? matched[1] : null;
}
