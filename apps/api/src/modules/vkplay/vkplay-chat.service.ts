import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { VkPlayService } from "./vkplay.service";
import { VKPLAY_ORIGIN, VkPlayPublicClient } from "./vkplay-public.client";
import {
  collectBadges,
  renderChatMessage,
  resolveNickColor,
  type VkPlayBadge,
  type VkPlayMessagePart,
} from "./vkplay-chat.utils";

/**
 * Chat capture for VK Play Live.
 *
 * The site runs an old Centrifuge pubsub: frames are JSON with NUMBERED
 * methods (0 = connect, 1 = subscribe, 7 = ping) — the modern named-command
 * protocol is answered with an immediate disconnect, code 3501. Access is
 * anonymous: /ws/connect hands out a token tied to nothing but the caller's
 * IP.
 *
 * The one thing the handshake insists on is an Origin header. Node's built-in
 * WebSocket takes it through a non-standard options argument, which is why the
 * constructor below is cast rather than called plainly.
 */

const PUBSUB_URL = "wss://pubsub.live.vkvideo.ru/connection/websocket";

// Centrifuge method numbers, the only three this capture needs.
const METHOD_CONNECT = 0;
const METHOD_SUBSCRIBE = 1;
const METHOD_PING = 7;

const FRAME_ID_CONNECT = 1;
const FRAME_ID_SUBSCRIBE = 2;
const FRAME_ID_PING = 3;

const PING_INTERVAL_MS = 25_000;

const RECONNECT_BASE_MS = 2_000;
const RECONNECT_MAX_MS = 60_000;

// Around a reconnect the same message can arrive twice; the set is capped so a
// twelve-hour broadcast cannot grow it without bound.
const SEEN_IDS_MAX = 5_000;

type ActiveCapture = {
  channelId: string;
  sessionId: string;
  channelLogin: string;
  chatChannel: string;
  startedAt: number;
  socket: WebSocket | null;
  pingTimer: NodeJS.Timeout | null;
  reconnectTimer: NodeJS.Timeout | null;
  reconnectAttempts: number;
  stopped: boolean;
  joined: boolean;
  messageCount: number;
  seenProviderIds: Set<string>;
  unknownFrames: Set<string>;
};

type ChatEnvelope = {
  type?: string;
  data?: {
    id?: number | string;
    createdAt?: number;
    isDeleted?: boolean;
    data?: VkPlayMessagePart[];
    author?: {
      id?: number | string;
      nick?: string;
      displayName?: string;
      nickColor?: number | string;
      badges?: VkPlayBadge[];
      roles?: VkPlayBadge[];
      isVerifiedStreamer?: boolean;
    };
  };
};

@Injectable()
export class VkPlayChatService {
  private readonly logger = new Logger(VkPlayChatService.name);
  private readonly captures = new Map<string, ActiveCapture>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly vkPlayService: VkPlayService,
    private readonly publicClient: VkPlayPublicClient,
  ) {}

  async startCapture(input: {
    channelId: string;
    sessionId: string;
    channelLogin: string;
    captureAnchor: Date;
  }) {
    const { channelId, sessionId, channelLogin, captureAnchor } = input;

    if (typeof WebSocket === "undefined") {
      this.logger.error(
        `[vkplay-chat:${channelLogin}] disabled: this Node.js runtime (${process.version}) has no global WebSocket. Use Node 22+.`,
      );
      await this.markSession(sessionId, { chatStatus: "error", chatAvailable: false });
      return;
    }

    let chatChannel: string | null = null;

    try {
      chatChannel = await this.vkPlayService.getChatChannel(channelLogin);
    } catch (error) {
      this.logger.warn(
        `[vkplay-chat:${channelLogin}] could not read the chat channel: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (!chatChannel) {
      // The recording itself is fine — only the chat replay is missing.
      await this.markSession(sessionId, { chatStatus: "not_configured", chatAvailable: false });
      return;
    }

    this.stopCapture(channelId);

    const capture: ActiveCapture = {
      channelId,
      sessionId,
      channelLogin,
      chatChannel,
      startedAt: captureAnchor.getTime(),
      socket: null,
      pingTimer: null,
      reconnectTimer: null,
      reconnectAttempts: 0,
      stopped: false,
      joined: false,
      messageCount: 0,
      seenProviderIds: new Set(),
      unknownFrames: new Set(),
    };

    this.captures.set(channelId, capture);
    void this.connect(capture);
  }

  stopCapture(channelId: string) {
    const capture = this.captures.get(channelId);

    if (!capture) {
      return;
    }

    capture.stopped = true;
    this.clearTimers(capture);

    try {
      capture.socket?.close();
    } catch {
      // Already gone.
    }

    this.captures.delete(channelId);

    if (capture.joined || capture.messageCount > 0) {
      void this.markSession(capture.sessionId, { chatStatus: "ready" });
      this.logger.log(
        `[vkplay-chat:${capture.channelLogin}] capture stopped after ${capture.messageCount} message(s).`,
      );
    }
  }

  private async connect(capture: ActiveCapture) {
    if (capture.stopped) {
      return;
    }

    const token = await this.publicClient.getWebsocketToken();

    if (capture.stopped) {
      return;
    }

    if (!token) {
      this.scheduleReconnect(capture, new Error("no websocket token"));
      return;
    }

    let socket: WebSocket;

    try {
      socket = openSocket();
    } catch (error) {
      this.scheduleReconnect(capture, error);
      return;
    }

    capture.socket = socket;

    socket.onopen = () => {
      capture.reconnectAttempts = 0;
      this.send(capture, {
        id: FRAME_ID_CONNECT,
        method: METHOD_CONNECT,
        params: { token, name: "js" },
      });
    };

    socket.onmessage = (event: MessageEvent) => {
      void this.handleFrames(capture, String(event.data));
    };

    socket.onerror = () => {
      // onclose always follows; reconnect is handled there so it happens once.
    };

    socket.onclose = () => {
      this.clearTimers(capture);
      this.scheduleReconnect(capture);
    };
  }

  /** One websocket message can carry several newline-separated frames. */
  private async handleFrames(capture: ActiveCapture, raw: string) {
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let frame: {
        id?: number;
        error?: { message?: string };
        result?: { channel?: string; data?: { data?: ChatEnvelope } };
      };

      try {
        frame = JSON.parse(trimmed);
      } catch {
        continue;
      }

      if (frame.id === FRAME_ID_CONNECT) {
        if (frame.error) {
          this.logger.warn(
            `[vkplay-chat:${capture.channelLogin}] connect refused: ${frame.error.message ?? "unknown"}`,
          );
          continue;
        }

        this.send(capture, {
          id: FRAME_ID_SUBSCRIBE,
          method: METHOD_SUBSCRIBE,
          params: { channel: capture.chatChannel },
        });
        this.startPing(capture);
        continue;
      }

      if (frame.id === FRAME_ID_SUBSCRIBE) {
        if (frame.error) {
          this.logger.warn(
            `[vkplay-chat:${capture.channelLogin}] subscription to ${capture.chatChannel} refused: ${
              frame.error.message ?? "unknown"
            }`,
          );
          continue;
        }

        capture.joined = true;
        await this.markSession(capture.sessionId, {
          chatStatus: "recording",
          chatAvailable: true,
        });
        this.logger.log(
          `[vkplay-chat:${capture.channelLogin}] subscribed to ${capture.chatChannel}.`,
        );
        continue;
      }

      const envelope = frame.result?.data?.data;

      if (!envelope) {
        continue;
      }

      if (envelope.type === "message") {
        await this.persistMessage(capture, envelope);
        continue;
      }

      // Reactions, pinned messages, moderation — the shapes are undocumented
      // and only the ones seen in production are worth writing code for. Each
      // unknown kind is logged once per capture so they can be added later.
      if (envelope.type && !capture.unknownFrames.has(envelope.type)) {
        capture.unknownFrames.add(envelope.type);
        this.logger.debug(
          `[vkplay-chat:${capture.channelLogin}] ignoring chat frame of type "${envelope.type}".`,
        );
      }
    }
  }

  private async persistMessage(capture: ActiveCapture, envelope: ChatEnvelope) {
    const payload = envelope.data;

    if (!payload) {
      return;
    }

    const providerMessageId = payload.id === undefined ? null : String(payload.id);

    if (providerMessageId) {
      if (capture.seenProviderIds.has(providerMessageId)) {
        return;
      }
      if (capture.seenProviderIds.size < SEEN_IDS_MAX) {
        capture.seenProviderIds.add(providerMessageId);
      }
    }

    const { text, emotes } = renderChatMessage(payload.data);

    if (!text) {
      return;
    }

    // createdAt is unix seconds; a message without one is happening now.
    const timestamp = payload.createdAt ? new Date(payload.createdAt * 1000) : new Date();
    const messageTimestamp = Number.isNaN(timestamp.getTime()) ? new Date() : timestamp;
    const relativeTimeSec = Math.max(
      0,
      Math.floor((messageTimestamp.getTime() - capture.startedAt) / 1000),
    );

    const author = payload.author ?? {};
    const badges = collectBadges(author);

    try {
      const saved = await this.prisma.chatMessage.create({
        data: {
          streamSessionId: capture.sessionId,
          providerMessageId,
          authorLogin: author.nick ?? author.displayName ?? "anonymous",
          authorDisplayName: author.displayName ?? author.nick ?? null,
          authorColor: resolveNickColor(author.nickColor),
          badgesJson: badges.length ? JSON.stringify({ provider: "vkplay", badges }) : null,
          textRaw: text,
          emotesJson: emotes.length ? JSON.stringify({ provider: "vkplay", emotes }) : null,
          messageTimestamp,
          relativeTimeSec,
          isDeleted: payload.isDeleted === true,
        },
      });

      capture.messageCount += 1;

      this.realtimeGateway.server?.emit("chat:message", {
        sessionId: capture.sessionId,
        message: {
          id: saved.id,
          authorLogin: saved.authorLogin,
          authorDisplayName: saved.authorDisplayName,
          authorColor: saved.authorColor,
          textRaw: saved.textRaw,
          relativeTimeSec: saved.relativeTimeSec,
          messageTimestamp: saved.messageTimestamp.toISOString(),
        },
      });
    } catch (error) {
      this.logger.warn(
        `[vkplay-chat:${capture.channelLogin}] failed to persist message: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private startPing(capture: ActiveCapture) {
    if (capture.pingTimer) {
      clearInterval(capture.pingTimer);
    }

    capture.pingTimer = setInterval(() => {
      this.send(capture, { id: FRAME_ID_PING, method: METHOD_PING, params: {} });
    }, PING_INTERVAL_MS);
    capture.pingTimer.unref();
  }

  private send(capture: ActiveCapture, frame: Record<string, unknown>) {
    try {
      capture.socket?.send(JSON.stringify(frame));
    } catch {
      // The close handler reconnects.
    }
  }

  private scheduleReconnect(capture: ActiveCapture, error?: unknown) {
    if (capture.stopped || capture.reconnectTimer) {
      return;
    }

    if (error) {
      this.logger.warn(
        `[vkplay-chat:${capture.channelLogin}] connection failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const delay = Math.min(
      RECONNECT_MAX_MS,
      RECONNECT_BASE_MS * 2 ** Math.min(capture.reconnectAttempts, 5),
    );
    capture.reconnectAttempts += 1;

    capture.reconnectTimer = setTimeout(() => {
      capture.reconnectTimer = null;
      void this.connect(capture);
    }, delay);
    capture.reconnectTimer.unref();
  }

  private clearTimers(capture: ActiveCapture) {
    if (capture.pingTimer) {
      clearInterval(capture.pingTimer);
      capture.pingTimer = null;
    }

    if (capture.reconnectTimer) {
      clearTimeout(capture.reconnectTimer);
      capture.reconnectTimer = null;
    }
  }

  private async markSession(
    sessionId: string,
    data: { chatStatus: string; chatAvailable?: boolean },
  ) {
    try {
      await this.prisma.streamSession.update({ where: { id: sessionId }, data });
    } catch (error) {
      this.logger.warn(
        `Failed to set ${data.chatStatus} on session ${sessionId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

/**
 * The pubsub rejects a handshake without an Origin header. Node's WebSocket
 * takes one through an options argument that the DOM typings — the ones this
 * global is declared with — know nothing about, hence the cast.
 */
function openSocket(): WebSocket {
  const Ctor = WebSocket as unknown as new (url: string, options: unknown) => WebSocket;

  return new Ctor(PUBSUB_URL, { headers: { Origin: VKPLAY_ORIGIN } });
}
