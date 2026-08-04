import { BadRequestException, Injectable } from "@nestjs/common";
import { VkPlayPublicClient } from "./vkplay-public.client";

/**
 * VK Play Live as a recordable platform, with the same three methods
 * TwitchService and KickService expose so PlatformsService can dispatch to it
 * without knowing anything about VK.
 *
 * The platform is stored as "vkplay" and the channel as its bare name — the
 * last path segment of live.vkvideo.ru/<name>, which is what every endpoint
 * and streamlink's own plugin key off.
 */

// live.vkvideo.ru is the current home; the two older hosts still resolve and
// people still paste them.
const CHANNEL_URL_PATTERN =
  /^https?:\/\/(?:live\.vkvideo\.ru|live\.vkplay\.ru|vkplay\.live)\/([^/?#]+)/i;

// Channel names are latin, digits and underscore — auto-generated ones look
// like "channel33565006".
const CHANNEL_NAME_PATTERN = /^[a-z0-9_]{2,64}$/;

@Injectable()
export class VkPlayService {
  constructor(private readonly publicClient: VkPlayPublicClient) {}

  /** Accepts a VK Play Live URL, "@name" or a bare channel name. */
  normalizeChannelInput(input: string) {
    const trimmed = input.trim();

    if (!trimmed) {
      throw new BadRequestException("Channel input is empty.");
    }

    const urlMatch = trimmed.match(CHANNEL_URL_PATTERN);
    const name = (urlMatch?.[1] ?? trimmed).replace(/^@/, "").trim().toLowerCase();

    if (!CHANNEL_NAME_PATTERN.test(name)) {
      throw new BadRequestException("Invalid VK Play Live channel format.");
    }

    return name;
  }

  async resolveChannel(input: string) {
    const name = this.normalizeChannelInput(input);
    const stream = await this.publicClient.getStream(name);

    if (!stream) {
      throw new BadRequestException("VK Play Live channel was not found.");
    }

    return {
      id: stream.blogId,
      login: name,
      displayName: stream.displayName ?? name,
      profileImageUrl: stream.avatarUrl,
      source: "public" as const,
    };
  }

  /**
   * Same contract as the other platforms: a snapshot while the channel is
   * live, null when it is not.
   */
  async getLiveStream(input: { userId?: string | null; login?: string | null }) {
    if (!input.login) {
      return null;
    }

    const stream = await this.publicClient.getStream(this.normalizeChannelInput(input.login));

    if (!stream?.isOnline) {
      return null;
    }

    return {
      // A real per-broadcast id, so restarting the recorder mid-stream is
      // recognised as the same broadcast rather than a new one.
      id: stream.streamId,
      userId: stream.blogId,
      userLogin: stream.channelName,
      userName: stream.displayName,
      gameName: stream.category,
      title: stream.title,
      startedAt: stream.startedAt,
      previewImageUrl: stream.previewUrl,
      viewerCount: stream.viewers,
      source: "public" as const,
    };
  }

  /** Pubsub channel chat capture subscribes to, e.g. "channel-chat:12270079". */
  async getChatChannel(login: string) {
    const stream = await this.publicClient.getStream(this.normalizeChannelInput(login));

    if (!stream?.hasChat) {
      return null;
    }

    return stream.chatChannel;
  }
}
