import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { KickPublicClient } from "./kick-public.client";

/**
 * Kick.com support, deliberately built on the OFFICIAL public API
 * (https://api.kick.com/public/v1) rather than the kick.com/api/v2 endpoints
 * that browsers and streamlink use.
 *
 * The unofficial ones sit behind Cloudflare's bot check, which streamlink only
 * gets past by tweaking its TLS fingerprint and impersonating Chrome headers —
 * a plain Node fetch is answered with 403. Capture itself is unaffected
 * (streamlink does its own request), but everything this service does — resolve
 * a channel, poll whether it is live — has to go through the documented API.
 *
 * Credentials come from a Kick developer app (KICK_CLIENT_ID / KICK_CLIENT_SECRET),
 * the same shape as the Twitch ones. They are OPTIONAL: without them everything
 * falls back to KickPublicClient, which borrows streamlink's Cloudflare-passing
 * HTTP session. The official API is preferred when configured because it is
 * documented, cheap (no subprocess) and not going to be tightened without
 * notice — but it does not expose the chatroom id, so chat capture always goes
 * through the public client.
 */

const TOKEN_URL = "https://id.kick.com/oauth/token";
const API_BASE = "https://api.kick.com/public/v1";

// Refresh a bit before the real expiry so a poll never races the deadline.
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

const REQUEST_TIMEOUT_MS = 10_000;

type AppToken = {
  accessToken: string;
  expiresAt: number;
};

type KickCategory = {
  id?: number;
  name?: string;
  thumbnail?: string;
};

type KickStream = {
  is_live?: boolean;
  start_time?: string;
  thumbnail?: string;
  viewer_count?: number;
};

type KickChannel = {
  broadcaster_user_id?: number;
  slug?: string;
  stream_title?: string;
  channel_description?: string;
  banner_picture?: string;
  category?: KickCategory;
  stream?: KickStream;
};

type KickUser = {
  user_id?: number;
  name?: string;
  profile_picture?: string;
};

export type KickConfigurationState = {
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  apiReady: boolean;
  missing: string[];
};

@Injectable()
export class KickService {
  private readonly logger = new Logger(KickService.name);
  private cachedToken: AppToken | null = null;
  private tokenPromise: Promise<AppToken> | null = null;

  constructor(private readonly publicClient: KickPublicClient) {}

  /** Accepts a kick.com URL, "@slug" or a bare slug. */
  normalizeChannelInput(input: string) {
    const trimmed = input.trim();

    if (!trimmed) {
      throw new BadRequestException("Channel input is empty.");
    }

    const urlMatch = trimmed.match(/^https?:\/\/(?:www\.)?kick\.com\/([^/?#]+)/i);
    const rawSlug = (urlMatch?.[1] ?? trimmed).replace(/^@/, "").trim().toLowerCase();

    // Kick slugs allow hyphens, which Twitch logins do not.
    if (!/^[a-z0-9_-]{3,25}$/.test(rawSlug)) {
      throw new BadRequestException("Invalid Kick channel format.");
    }

    return rawSlug;
  }

  isApiConfigured() {
    return this.getConfigurationState().apiReady;
  }

  getConfigurationState(): KickConfigurationState {
    const clientIdConfigured = Boolean(process.env.KICK_CLIENT_ID?.trim());
    const clientSecretConfigured = Boolean(process.env.KICK_CLIENT_SECRET?.trim());
    const missing: string[] = [];

    if (!clientIdConfigured) missing.push("KICK_CLIENT_ID");
    if (!clientSecretConfigured) missing.push("KICK_CLIENT_SECRET");

    return {
      clientIdConfigured,
      clientSecretConfigured,
      apiReady: clientIdConfigured && clientSecretConfigured,
      missing,
    };
  }

  async resolveChannel(input: string) {
    const slug = this.normalizeChannelInput(input);

    if (!this.isApiConfigured()) {
      const publicChannel = await this.publicClient.getChannel(slug);

      if (!publicChannel) {
        throw new BadRequestException("Kick channel was not found.");
      }

      return {
        id: publicChannel.userId ? String(publicChannel.userId) : null,
        login: publicChannel.slug,
        displayName: publicChannel.displayName ?? publicChannel.slug,
        profileImageUrl: publicChannel.avatar,
        source: "public" as const,
      };
    }

    const channel = await this.getChannelBySlug(slug);

    if (!channel) {
      throw new BadRequestException("Kick channel was not found.");
    }

    const userId = channel.broadcaster_user_id ? String(channel.broadcaster_user_id) : null;
    const user = userId ? await this.getUserById(userId) : null;

    return {
      id: userId,
      login: channel.slug ?? slug,
      displayName: user?.name ?? channel.slug ?? slug,
      profileImageUrl: user?.profile_picture ?? null,
      source: "api" as const,
    };
  }

  /**
   * Same contract as TwitchService.getLiveStream: a snapshot when the channel
   * is live, null when it is not.
   */
  async getLiveStream(input: { userId?: string | null; login?: string | null }) {
    if (!this.isApiConfigured()) {
      return this.getLiveStreamWithoutCredentials(input.login);
    }

    const channel = input.login
      ? await this.getChannelBySlug(this.normalizeChannelInput(input.login))
      : input.userId
        ? await this.getChannelByUserId(input.userId)
        : null;

    if (!channel?.stream?.is_live) {
      return null;
    }

    const userId = channel.broadcaster_user_id ? String(channel.broadcaster_user_id) : null;

    return {
      // Kick has no per-broadcast id in this payload; the start time is what
      // distinguishes one broadcast from the next, and the recorder only uses
      // this value to avoid re-recording the same stream.
      id: channel.stream.start_time
        ? `${userId ?? channel.slug}:${channel.stream.start_time}`
        : null,
      userId,
      userLogin: channel.slug ?? input.login ?? "",
      userName: channel.slug ?? null,
      gameName: channel.category?.name ?? null,
      title: channel.stream_title ?? null,
      startedAt: channel.stream.start_time ?? null,
      previewImageUrl: channel.stream.thumbnail ?? null,
      source: "api" as const,
    };
  }

  /** Live snapshot built from the public client (no credentials involved). */
  private async getLiveStreamWithoutCredentials(login: string | null | undefined) {
    if (!login) {
      return null;
    }

    const channel = await this.publicClient.getChannel(this.normalizeChannelInput(login));

    if (!channel?.isLive) {
      return null;
    }

    return {
      id: channel.livestreamId ? String(channel.livestreamId) : null,
      userId: channel.userId ? String(channel.userId) : null,
      userLogin: channel.slug,
      userName: channel.displayName,
      gameName: channel.category,
      title: channel.title,
      startedAt: channel.startedAt,
      previewImageUrl: channel.thumbnail,
      source: "public" as const,
    };
  }

  /**
   * Pusher channel id for chat capture. Only the public client can answer this:
   * the documented API has no equivalent field.
   */
  async getChatroomId(login: string) {
    const channel = await this.publicClient.getChannel(this.normalizeChannelInput(login));
    return channel?.chatroomId ?? null;
  }

  /**
   * Chat history for the backfill at capture start — like the chatroom id,
   * something only the public client can answer. Needs the channel's numeric
   * id first; that lookup is cached, and at capture start the live poll has
   * usually just primed it.
   */
  async getRecentChatMessages(login: string) {
    const channel = await this.publicClient.getChannel(this.normalizeChannelInput(login));

    if (!channel?.id) {
      return [];
    }

    return this.publicClient.getRecentMessages(channel.id);
  }

  private async getChannelBySlug(slug: string) {
    const channels = await this.request<KickChannel[]>(
      `${API_BASE}/channels?slug=${encodeURIComponent(slug)}`,
    );
    return channels?.[0] ?? null;
  }

  private async getChannelByUserId(userId: string) {
    const channels = await this.request<KickChannel[]>(
      `${API_BASE}/channels?broadcaster_user_id=${encodeURIComponent(userId)}`,
    );
    return channels?.[0] ?? null;
  }

  private async getUserById(userId: string) {
    try {
      const users = await this.request<KickUser[]>(
        `${API_BASE}/users?id=${encodeURIComponent(userId)}`,
      );
      return users?.[0] ?? null;
    } catch (error) {
      // Only used for the avatar and display name — never worth failing over.
      this.logger.warn(
        `Could not read the Kick profile of user ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private async request<T>(url: string, retryOnUnauthorized = true): Promise<T | null> {
    const token = await this.getAppToken();
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    // A revoked or rotated token: drop it and try once with a fresh one.
    if (response.status === 401 && retryOnUnauthorized) {
      this.cachedToken = null;
      return this.request<T>(url, false);
    }

    if (!response.ok) {
      throw new BadRequestException(
        `Kick API responded with ${response.status}: ${(await response.text()).slice(0, 300)}`,
      );
    }

    const payload = (await response.json()) as { data?: T };
    return payload.data ?? null;
  }

  private async getAppToken(): Promise<AppToken> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken;
    }

    // Collapse concurrent polls onto one token request.
    if (!this.tokenPromise) {
      this.tokenPromise = this.fetchAppToken().finally(() => {
        this.tokenPromise = null;
      });
    }

    return this.tokenPromise;
  }

  private async fetchAppToken(): Promise<AppToken> {
    const state = this.getConfigurationState();

    if (!state.apiReady) {
      throw new BadRequestException(
        `Kick is not configured: set ${state.missing.join(" and ")}.`,
      );
    }

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.KICK_CLIENT_ID!.trim(),
        client_secret: process.env.KICK_CLIENT_SECRET!.trim(),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new BadRequestException(
        `Could not get a Kick app token (${response.status}). Check KICK_CLIENT_ID / KICK_CLIENT_SECRET.`,
      );
    }

    const payload = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
    };

    if (!payload.access_token) {
      throw new BadRequestException("Kick returned a token response without an access_token.");
    }

    this.cachedToken = {
      accessToken: payload.access_token,
      expiresAt:
        Date.now() + Math.max(0, (payload.expires_in ?? 3600) * 1000 - TOKEN_EXPIRY_MARGIN_MS),
    };

    return this.cachedToken;
  }
}
