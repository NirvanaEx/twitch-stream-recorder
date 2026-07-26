import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { KickRecentMessage } from "./kick-public.client";
import { KickService } from "./kick.service";

/**
 * Kick chat capture.
 *
 * Kick does not run an IRC bridge: chat is broadcast over Pusher, and a public
 * chatroom needs no auth token — only the numeric chatroom id, which
 * KickService reads through the credential-free client.
 *
 * The stored rows are the same ChatMessage shape Twitch capture produces, so
 * replay, the .tsr.json bundle and the archive player work unchanged. Two
 * fields deliberately differ: Kick badges carry image URLs and Kick emotes are
 * inline `[emote:ID:name]` tokens rather than index ranges, so neither maps
 * onto the Twitch representation. They are stored as tagged JSON objects, which
 * the existing renderer ignores (parseStoredJsonString only accepts strings)
 * instead of mis-rendering. The emote tokens are unwrapped in textRaw so the
 * text reads naturally in the meantime.
 */

const PUSHER_APP_KEY = "32cbd69e4b950bf97679";
const PUSHER_URL =
  `wss://ws-us2.pusher.com/app/${PUSHER_APP_KEY}` +
  "?protocol=7&client=js&version=8.4.0&flash=false";

// Pusher announces an activity timeout on connect (120 s at the time of
// writing); ping well before it so a silent chat is not mistaken for a dead
// socket by the server.
const DEFAULT_ACTIVITY_TIMEOUT_SEC = 120;
const PING_MARGIN_MS = 30_000;

const RECONNECT_BASE_MS = 2_000;
const RECONNECT_MAX_MS = 60_000;

// Verified against the live socket: the event name is the PHP class name with
// single backslash separators (27 characters, two 0x5C). Getting this wrong
// does not throw — it silently matches nothing and records an empty chat — so
// the handlers also accept a suffix match in case Kick changes the escaping.
const EVENT_MESSAGE = "App\\Events\\ChatMessageEvent";
const EVENT_DELETED = "App\\Events\\MessageDeletedEvent";

type KickSender = {
  id?: number;
  username?: string;
  slug?: string;
  identity?: {
    color?: string;
    badges?: { type?: string; text?: string; count?: number }[];
    badges_v2?: { name?: string; image_url?: string; metadata?: unknown }[];
  };
};

type KickChatPayload = {
  id?: string;
  chatroom_id?: number;
  content?: string;
  type?: string;
  created_at?: string;
  sender?: KickSender;
};

// The history backfill and the live socket overlap around capture start, so
// the same message can arrive twice; provider ids seen so far close that
// window. The cap only bounds memory on very long streams — by the time it is
// reached the backfill is long finished and dedup has nothing left to catch.
const SEEN_IDS_MAX = 5_000;

type ActiveCapture = {
  channelId: string;
  sessionId: string;
  channelLogin: string;
  chatroomId: number;
  /** Chat time zero: when streamlink actually started writing video. */
  startedAt: number;
  socket: WebSocket | null;
  pingTimer: NodeJS.Timeout | null;
  reconnectTimer: NodeJS.Timeout | null;
  reconnectAttempts: number;
  stopped: boolean;
  joined: boolean;
  messageCount: number;
  seenProviderIds: Set<string>;
};

@Injectable()
export class KickChatService {
  private readonly logger = new Logger(KickChatService.name);
  private readonly captures = new Map<string, ActiveCapture>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly kickService: KickService,
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
        `[kick-chat:${channelLogin}] disabled: this Node.js runtime (${process.version}) has no global WebSocket. Use Node 22+.`,
      );
      await this.markSession(sessionId, { chatStatus: "error", chatAvailable: false });
      return;
    }

    let chatroomId: number | null = null;

    try {
      chatroomId = await this.kickService.getChatroomId(channelLogin);
    } catch (error) {
      this.logger.warn(
        `[kick-chat:${channelLogin}] could not read the chatroom id: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (!chatroomId) {
      // The recording itself is fine — only the chat replay is missing.
      await this.markSession(sessionId, { chatStatus: "not_configured", chatAvailable: false });
      return;
    }

    this.stopCapture(channelId);

    const capture: ActiveCapture = {
      channelId,
      sessionId,
      channelLogin,
      chatroomId,
      startedAt: captureAnchor.getTime(),
      socket: null,
      pingTimer: null,
      reconnectTimer: null,
      reconnectAttempts: 0,
      stopped: false,
      joined: false,
      messageCount: 0,
      seenProviderIds: new Set(),
    };

    this.captures.set(channelId, capture);
    this.connect(capture);
    void this.backfillHistory(capture);
  }

  /**
   * Kick, unlike Twitch IRC, can hand back the messages written just before
   * the capture began, so a recording that starts mid-stream opens with a
   * living chat instead of silence until the first new message. They all
   * land at second 0 of the timeline — they predate the video. Best-effort:
   * a failure only costs this prelude, never the capture itself.
   */
  private async backfillHistory(capture: ActiveCapture) {
    let history: KickRecentMessage[];

    try {
      history = await this.kickService.getRecentChatMessages(capture.channelLogin);
    } catch (error) {
      this.logger.warn(
        `[kick-chat:${capture.channelLogin}] history backfill failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return;
    }

    if (capture.stopped || history.length === 0) {
      return;
    }

    let stored = 0;

    for (const message of sortHistoryChronologically(history)) {
      if (capture.stopped) break;
      if (await this.persistMessage(capture, message, { history: true })) stored += 1;
    }

    if (stored === 0) {
      return;
    }

    this.logger.log(
      `[kick-chat:${capture.channelLogin}] backfilled ${stored} pre-capture message(s).`,
    );

    // The subscription handler normally flips these; do it here too so the
    // prelude is visible even while the socket is still connecting.
    if (!capture.stopped && !capture.joined) {
      await this.markSession(capture.sessionId, {
        chatStatus: "recording",
        chatAvailable: true,
      });
    }
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

    // Backfilled-only sessions (socket never joined) still hold messages and
    // must finalize the same way, or they would stay "recording" forever.
    if (capture.joined || capture.messageCount > 0) {
      void this.markSession(capture.sessionId, { chatStatus: "ready" });
      this.logger.log(
        `[kick-chat:${capture.channelLogin}] capture stopped after ${capture.messageCount} message(s).`,
      );
    }
  }

  private connect(capture: ActiveCapture) {
    if (capture.stopped) {
      return;
    }

    let socket: WebSocket;

    try {
      socket = new WebSocket(PUSHER_URL);
    } catch (error) {
      this.scheduleReconnect(capture, error);
      return;
    }

    capture.socket = socket;

    socket.onopen = () => {
      capture.reconnectAttempts = 0;
    };

    socket.onmessage = (event: MessageEvent) => {
      void this.handleFrame(capture, String(event.data));
    };

    socket.onerror = () => {
      // onclose always follows; reconnect is handled there so it happens once.
    };

    socket.onclose = () => {
      this.clearTimers(capture);
      this.scheduleReconnect(capture);
    };
  }

  private async handleFrame(capture: ActiveCapture, raw: string) {
    let frame: { event?: string; data?: unknown; channel?: string };

    try {
      frame = JSON.parse(raw);
    } catch {
      return;
    }

    const name = String(frame.event ?? "");

    if (name === "pusher:connection_established") {
      const data = this.parseNested<{ activity_timeout?: number }>(frame.data) ?? {};
      this.subscribe(capture, data.activity_timeout ?? DEFAULT_ACTIVITY_TIMEOUT_SEC);
      return;
    }

    if (name === "pusher:ping") {
      capture.socket?.send(JSON.stringify({ event: "pusher:pong", data: {} }));
      return;
    }

    if (name === "pusher_internal:subscription_succeeded") {
      capture.joined = true;
      await this.markSession(capture.sessionId, {
        chatStatus: "recording",
        chatAvailable: true,
      });
      this.logger.log(
        `[kick-chat:${capture.channelLogin}] subscribed to chatrooms.${capture.chatroomId}.v2.`,
      );
      return;
    }

    if (name === "pusher:error") {
      this.logger.warn(
        `[kick-chat:${capture.channelLogin}] pusher error: ${JSON.stringify(frame.data)}`,
      );
      return;
    }

    if (name === EVENT_MESSAGE || name.endsWith("ChatMessageEvent")) {
      const payload = this.parseNested<KickChatPayload>(frame.data);
      if (payload) await this.persistMessage(capture, payload);
      return;
    }

    if (name === EVENT_DELETED || name.endsWith("MessageDeletedEvent")) {
      const payload = this.parseNested<{ id?: string; message?: { id?: string } }>(frame.data);
      const messageId = payload?.message?.id ?? payload?.id ?? null;
      if (messageId) await this.markDeleted(capture, messageId);
    }
  }

  private subscribe(capture: ActiveCapture, activityTimeoutSec: number) {
    capture.socket?.send(
      JSON.stringify({
        event: "pusher:subscribe",
        // Public chatrooms take an empty auth — no credentials anywhere here.
        data: { auth: "", channel: `chatrooms.${capture.chatroomId}.v2` },
      }),
    );

    const interval = Math.max(15_000, activityTimeoutSec * 1000 - PING_MARGIN_MS);
    capture.pingTimer = setInterval(() => {
      try {
        capture.socket?.send(JSON.stringify({ event: "pusher:ping", data: {} }));
      } catch {
        // The close handler will reconnect.
      }
    }, interval);
    capture.pingTimer.unref();
  }

  private async persistMessage(
    capture: ActiveCapture,
    payload: KickChatPayload,
    options: { history?: boolean } = {},
  ): Promise<boolean> {
    // Kick also sends subscription/host events through the same channel.
    if (payload.type && payload.type !== "message") {
      return false;
    }

    // Around capture start the same message can come in twice: once from the
    // history backfill and once from the live socket.
    if (payload.id) {
      if (capture.seenProviderIds.has(payload.id)) {
        return false;
      }
      if (capture.seenProviderIds.size < SEEN_IDS_MAX) {
        capture.seenProviderIds.add(payload.id);
      }
    }

    const { text, emotes } = extractEmotes(payload.content ?? "");

    if (!text) {
      return false;
    }

    const messageTimestamp = payload.created_at ? new Date(payload.created_at) : new Date();
    const timestamp = Number.isNaN(messageTimestamp.getTime()) ? new Date() : messageTimestamp;
    const relativeTimeSec = Math.max(
      0,
      Math.floor((timestamp.getTime() - capture.startedAt) / 1000),
    );

    const identity = payload.sender?.identity;
    const badges = [
      ...(identity?.badges ?? []).map((badge) => ({
        type: badge.type ?? null,
        text: badge.text ?? null,
        count: badge.count ?? null,
        image: null as string | null,
      })),
      ...(identity?.badges_v2 ?? []).map((badge) => ({
        type: badge.name ?? null,
        text: badge.name ?? null,
        count: null,
        image: badge.image_url ?? null,
      })),
    ];

    try {
      const saved = await this.prisma.chatMessage.create({
        data: {
          streamSessionId: capture.sessionId,
          providerMessageId: payload.id ?? null,
          authorLogin: payload.sender?.slug ?? payload.sender?.username ?? "anonymous",
          authorDisplayName: payload.sender?.username ?? payload.sender?.slug ?? null,
          authorColor: identity?.color || null,
          badgesJson: badges.length
            ? JSON.stringify({ provider: "kick", badges })
            : null,
          textRaw: text,
          emotesJson: emotes.length ? JSON.stringify({ provider: "kick", emotes }) : null,
          messageTimestamp: timestamp,
          relativeTimeSec,
        },
      });

      capture.messageCount += 1;

      // Backfilled history is not "a message just arrived" — only live
      // messages are announced to realtime listeners.
      if (!options.history) {
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
      }

      return true;
    } catch (error) {
      this.logger.warn(
        `[kick-chat:${capture.channelLogin}] failed to persist message: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  private async markDeleted(capture: ActiveCapture, providerMessageId: string) {
    try {
      await this.prisma.chatMessage.updateMany({
        where: { streamSessionId: capture.sessionId, providerMessageId },
        data: { isDeleted: true },
      });
    } catch (error) {
      this.logger.warn(
        `[kick-chat:${capture.channelLogin}] failed to mark a message deleted: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** Pusher wraps event payloads in a JSON string, so they parse twice. */
  private parseNested<T>(data: unknown): T | null {
    if (data === null || data === undefined) return null;
    if (typeof data === "object") return data as T;

    try {
      return JSON.parse(String(data)) as T;
    } catch {
      return null;
    }
  }

  private scheduleReconnect(capture: ActiveCapture, error?: unknown) {
    if (capture.stopped || capture.reconnectTimer) {
      return;
    }

    capture.reconnectAttempts += 1;
    const delay = Math.min(
      RECONNECT_MAX_MS,
      RECONNECT_BASE_MS * 2 ** (capture.reconnectAttempts - 1),
    );

    if (error) {
      this.logger.warn(
        `[kick-chat:${capture.channelLogin}] connection failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    capture.reconnectTimer = setTimeout(() => {
      capture.reconnectTimer = null;
      this.connect(capture);
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
 * Kick returns chat history newest-first. Stored rows must go in oldest-first:
 * backfilled messages share relativeTimeSec 0 (they predate the video), the
 * replay orders by that column alone, and Postgres returns equal keys in
 * insertion order — so insertion order IS the chat order the viewer sees.
 * Messages without a parseable timestamp sort last, keeping their own order.
 */
export function sortHistoryChronologically(history: KickRecentMessage[]) {
  const at = (message: KickRecentMessage) => {
    const time = message.created_at ? new Date(message.created_at).getTime() : NaN;
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
  };

  return [...history].sort((a, b) => at(a) - at(b));
}

/**
 * Kick writes emotes inline as `[emote:39292:catJAM]`. Replace each token with
 * its name so the stored text is readable, and record where it landed so a
 * renderer can put the image back later.
 */
export function extractEmotes(content: string) {
  const emotes: { id: string; name: string; start: number; end: number }[] = [];
  let text = "";
  let cursor = 0;

  const pattern = /\[emote:(\d+):([^\]]*)\]/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    text += content.slice(cursor, match.index);
    const name = match[2] || `emote${match[1]}`;
    emotes.push({
      id: match[1],
      name,
      start: text.length,
      end: text.length + name.length - 1,
    });
    text += name;
    cursor = match.index + match[0].length;
  }

  text += content.slice(cursor);

  return { text: text.trim(), emotes };
}
