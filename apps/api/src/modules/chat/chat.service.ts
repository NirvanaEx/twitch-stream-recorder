import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";

type ActiveCapture = {
  channelId: string;
  sessionId: string;
  channelLogin: string;
  startedAt: number;
  socket: WebSocket;
  reconnectTimer: NodeJS.Timeout | null;
  reconnectAttempts: number;
  closed: boolean;
  buffer: string;
  joined: boolean;
  privmsgCount: number;
  loggedFirstMessage: boolean;
  watchdogTimer: NodeJS.Timeout | null;
  connectedAt: number;
  lastActivityAt: number;
};

const TWITCH_IRC_WS_URL = "wss://irc-ws.chat.twitch.tv:443";
const MAX_RECONNECT_DELAY_MS = 30_000;
// Twitch IRC pings roughly every 5 minutes; a socket with no traffic for
// longer than this is considered dead even if it never emitted close/error.
const ACTIVITY_TIMEOUT_MS = 6 * 60_000;
// If JOIN is not confirmed shortly after connecting, the join was silently
// dropped — reconnect instead of sitting on an idle connection forever.
const JOIN_TIMEOUT_MS = 30_000;
const WATCHDOG_INTERVAL_MS = 15_000;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly captures = new Map<string, ActiveCapture>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async startCapture(input: {
    channelId: string;
    sessionId: string;
    channelLogin: string;
    captureAnchor: Date;
  }) {
    const { channelId, sessionId, channelLogin, captureAnchor } = input;

    // The global WebSocket API exists only in Node >= 22. On older runtimes
    // every connect attempt throws and the capture retries forever, silently
    // recording nothing — surface this as a session error instead.
    if (typeof WebSocket === "undefined") {
      this.logger.error(
        `[chat:${channelLogin}] chat capture disabled: this Node.js runtime (${process.version}) has no global WebSocket. Use Node 22+.`,
      );
      void this.prisma.streamSession
        .update({
          where: { id: sessionId },
          data: { chatStatus: "error", chatAvailable: false },
        })
        .catch(() => undefined);
      return;
    }

    // Honor the user's "record chat" toggle. We still flip the session
    // state to "not_configured" so the UI tells the user why the chat is
    // empty.
    const settings = await this.prisma.appSettings
      .findUnique({ where: { id: "default" } })
      .catch(() => null);
    if (settings && settings.recordChat === false) {
      this.logger.log(
        `[chat:${channelLogin}] capture skipped — recordChat is disabled in settings.`,
      );
      void this.prisma.streamSession
        .update({
          where: { id: sessionId },
          data: { chatStatus: "not_configured", chatAvailable: false },
        })
        .catch(() => undefined);
      return;
    }

    // If a previous capture is still bound to this channel (e.g. the
    // recorder restarted without firing finalize), tear it down before
    // we register the new one. Otherwise the duplicate-check below would
    // silently skip the new auto-recording's chat.
    const existing = this.captures.get(channelId);
    if (existing) {
      this.logger.warn(
        `[chat:${channelLogin}] tearing down stale capture before starting a new one (sessionId=${existing.sessionId}).`,
      );
      this.stopCapture(channelId);
    }

    const capture: ActiveCapture = {
      channelId,
      sessionId,
      channelLogin: channelLogin.toLowerCase(),
      startedAt: captureAnchor.getTime(),
      socket: null as unknown as WebSocket,
      reconnectTimer: null,
      reconnectAttempts: 0,
      closed: false,
      buffer: "",
      joined: false,
      privmsgCount: 0,
      loggedFirstMessage: false,
      watchdogTimer: null,
      connectedAt: 0,
      lastActivityAt: Date.now(),
    };

    this.captures.set(channelId, capture);
    this.connect(capture);
    this.startWatchdog(capture);

    void this.prisma.streamSession
      .update({
        where: { id: sessionId },
        data: { chatStatus: "recording", chatAvailable: true },
      })
      .catch((error) => {
        this.logger.warn(
          `Failed to set chatStatus=recording for ${sessionId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });
  }

  stopCapture(channelId: string) {
    const capture = this.captures.get(channelId);

    if (!capture) {
      return;
    }

    capture.closed = true;

    if (capture.reconnectTimer) {
      clearTimeout(capture.reconnectTimer);
      capture.reconnectTimer = null;
    }

    if (capture.watchdogTimer) {
      clearInterval(capture.watchdogTimer);
      capture.watchdogTimer = null;
    }

    try {
      capture.socket?.close();
    } catch {
      // Ignore.
    }

    this.captures.delete(channelId);

    void this.prisma.streamSession
      .update({
        where: { id: capture.sessionId },
        data: { chatStatus: "ready" },
      })
      .catch(() => undefined);
  }

  private connect(capture: ActiveCapture) {
    if (capture.closed) {
      return;
    }

    const nick = `justinfan${Math.floor(Math.random() * 80000) + 1000}`;
    let socket: WebSocket;
    try {
      socket = new WebSocket(TWITCH_IRC_WS_URL);
    } catch (error) {
      this.logger.warn(
        `[chat:${capture.channelLogin}] failed to open socket: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.scheduleReconnect(capture);
      return;
    }
    capture.socket = socket;
    capture.connectedAt = Date.now();
    capture.lastActivityAt = Date.now();

    socket.addEventListener("open", () => {
      if (capture.closed || capture.socket !== socket) return;
      this.logger.log(`[chat:${capture.channelLogin}] connected as ${nick}`);
      capture.reconnectAttempts = 0;
      capture.joined = false;
      capture.buffer = "";
      capture.connectedAt = Date.now();
      capture.lastActivityAt = Date.now();
      // Twitch IRC expects NICK before CAP REQ for read-only justinfan
      // sessions. Sending CAP first works in spec, but the server has been
      // observed to silently drop the join when the order is reversed.
      socket.send(`NICK ${nick}`);
      socket.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
      socket.send(`JOIN #${capture.channelLogin}`);
    });

    socket.addEventListener("message", (event) => {
      if (capture.closed || capture.socket !== socket) return;
      const chunk = typeof event.data === "string" ? event.data : event.data.toString();

      capture.lastActivityAt = Date.now();

      // IRC frames may not align with CRLF boundaries; buffer leftovers.
      capture.buffer += chunk;
      const parts = capture.buffer.split("\r\n");
      capture.buffer = parts.pop() ?? "";

      for (const line of parts) {
        if (!line) continue;
        this.handleLine(capture, line);
      }
    });

    socket.addEventListener("error", (event) => {
      // Ignore events from a socket we already replaced during a reconnect.
      if (capture.socket !== socket) return;
      const message =
        event && typeof event === "object" && "message" in event
          ? String((event as { message?: unknown }).message ?? "unknown")
          : "unknown";
      this.logger.warn(`[chat:${capture.channelLogin}] socket error: ${message}`);
      // Per the WebSocket spec an "error" is always followed by a "close",
      // but some implementations fire "error" alone. Schedule the reconnect
      // here too — scheduleReconnect is idempotent on the timer.
      try {
        socket.close();
      } catch {
        // Ignore — some implementations can throw on closing twice.
      }
      this.scheduleReconnect(capture);
    });

    socket.addEventListener("close", (event) => {
      if (capture.closed || capture.socket !== socket) {
        return;
      }
      this.logger.warn(
        `[chat:${capture.channelLogin}] socket closed (code=${event.code}, joined=${capture.joined}, msgs=${capture.privmsgCount}). Reconnecting…`,
      );
      this.scheduleReconnect(capture);
    });
  }

  /**
   * Detects connections that died without emitting close/error: no traffic
   * for too long (Twitch pings every ~5 min) or a JOIN that was silently
   * dropped. Either way the capture would otherwise run forever recording
   * nothing — this was a common cause of "chat was not recorded".
   */
  private startWatchdog(capture: ActiveCapture) {
    capture.watchdogTimer = setInterval(() => {
      if (capture.closed) return;
      // A reconnect is already pending; nothing to watch.
      if (capture.reconnectTimer) return;

      const now = Date.now();
      const stuckWithoutJoin =
        !capture.joined && capture.connectedAt > 0 && now - capture.connectedAt > JOIN_TIMEOUT_MS;
      const silent = now - capture.lastActivityAt > ACTIVITY_TIMEOUT_MS;

      if (!stuckWithoutJoin && !silent) {
        return;
      }

      this.logger.warn(
        `[chat:${capture.channelLogin}] watchdog: ${
          silent ? "no traffic" : "JOIN not confirmed"
        } — forcing reconnect.`,
      );

      const staleSocket = capture.socket;
      try {
        staleSocket?.close();
      } catch {
        // Ignore.
      }
      this.scheduleReconnect(capture);
    }, WATCHDOG_INTERVAL_MS);
  }

  private scheduleReconnect(capture: ActiveCapture) {
    if (capture.closed) return;
    if (capture.reconnectTimer) return; // already scheduled

    capture.reconnectAttempts += 1;
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, capped at 30s.
    const delay = Math.min(
      MAX_RECONNECT_DELAY_MS,
      1000 * 2 ** Math.min(capture.reconnectAttempts - 1, 5),
    );

    capture.reconnectTimer = setTimeout(() => {
      capture.reconnectTimer = null;
      this.connect(capture);
    }, delay);
  }

  private handleLine(capture: ActiveCapture, line: string) {
    if (line.startsWith("PING")) {
      try {
        capture.socket.send(line.replace("PING", "PONG"));
      } catch {
        // Ignore send failure; close handler will reconnect.
      }
      return;
    }

    const parsed = parseIrcLine(line);

    if (!parsed) {
      return;
    }

    if (parsed.command === "PRIVMSG") {
      capture.privmsgCount += 1;
      if (!capture.loggedFirstMessage) {
        capture.loggedFirstMessage = true;
        this.logger.log(
          `[chat:${capture.channelLogin}] receiving messages (first PRIVMSG ok).`,
        );
      }
      void this.persistMessage(capture, parsed);
    } else if (parsed.command === "JOIN") {
      // Confirm we actually joined the channel — once per connection,
      // when the JOIN is for our own nick.
      if (!capture.joined && parsed.prefixNick && parsed.prefixNick.startsWith("justinfan")) {
        capture.joined = true;
        this.logger.log(
          `[chat:${capture.channelLogin}] joined #${capture.channelLogin}.`,
        );
      }
    } else if (parsed.command === "NOTICE") {
      // Twitch sends NOTICE for auth failures, host bans, etc. Surface
      // them — silent NOTICEs are why a capture can run for hours and
      // record nothing.
      const text = parsed.trailing ?? parsed.params.join(" ");
      this.logger.warn(`[chat:${capture.channelLogin}] NOTICE: ${text}`);
    } else if (parsed.command === "CLEARMSG") {
      void this.markDeletedByMessageId(capture, parsed.tags["target-msg-id"] ?? null);
    } else if (parsed.command === "CLEARCHAT") {
      void this.markDeletedByUser(capture, parsed.params[1] ?? null);
    }
  }

  private async persistMessage(capture: ActiveCapture, parsed: ParsedIrcLine) {
    const text = parsed.trailing ?? "";

    if (!text) {
      return;
    }

    const messageTimestamp = parsed.tags["tmi-sent-ts"]
      ? new Date(Number(parsed.tags["tmi-sent-ts"]))
      : new Date();
    const relativeTimeSec = Math.max(
      0,
      Math.floor((messageTimestamp.getTime() - capture.startedAt) / 1000),
    );

    try {
      const saved = await this.prisma.chatMessage.create({
        data: {
          streamSessionId: capture.sessionId,
          providerMessageId: parsed.tags["id"] ?? null,
          authorLogin: parsed.prefixNick ?? "anonymous",
          authorDisplayName: parsed.tags["display-name"] ?? parsed.prefixNick ?? null,
          authorColor: parsed.tags["color"] || null,
          badgesJson: parsed.tags["badges"] ? JSON.stringify(parsed.tags["badges"]) : null,
          textRaw: text,
          emotesJson: parsed.tags["emotes"] ? JSON.stringify(parsed.tags["emotes"]) : null,
          messageTimestamp,
          relativeTimeSec,
        },
      });

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
      // Bumped from debug → warn: a constraint or type error here would
      // otherwise vanish in production logs and leave the archive with
      // an empty messages array.
      this.logger.warn(
        `[chat:${capture.channelLogin}] failed to persist message: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async markDeletedByMessageId(capture: ActiveCapture, messageId: string | null) {
    if (!messageId) {
      return;
    }

    try {
      await this.prisma.chatMessage.updateMany({
        where: {
          streamSessionId: capture.sessionId,
          providerMessageId: messageId,
        },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch {
      // Ignore.
    }
  }

  private async markDeletedByUser(capture: ActiveCapture, login: string | null) {
    if (!login) {
      return;
    }

    try {
      await this.prisma.chatMessage.updateMany({
        where: {
          streamSessionId: capture.sessionId,
          authorLogin: login.toLowerCase(),
          isDeleted: false,
        },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch {
      // Ignore.
    }
  }
}

type ParsedIrcLine = {
  tags: Record<string, string>;
  prefixNick: string | null;
  command: string;
  params: string[];
  trailing: string | null;
};

function parseIrcLine(line: string): ParsedIrcLine | null {
  let rest = line;
  const tags: Record<string, string> = {};

  if (rest.startsWith("@")) {
    const space = rest.indexOf(" ");
    if (space === -1) return null;
    const tagPart = rest.slice(1, space);
    rest = rest.slice(space + 1);

    for (const pair of tagPart.split(";")) {
      const eq = pair.indexOf("=");
      if (eq === -1) {
        tags[pair] = "";
      } else {
        tags[pair.slice(0, eq)] = pair.slice(eq + 1);
      }
    }
  }

  let prefixNick: string | null = null;

  if (rest.startsWith(":")) {
    const space = rest.indexOf(" ");
    if (space === -1) return null;
    const prefix = rest.slice(1, space);
    rest = rest.slice(space + 1);
    const bang = prefix.indexOf("!");
    prefixNick = bang === -1 ? prefix : prefix.slice(0, bang);
  }

  let trailing: string | null = null;
  const trailingIndex = rest.indexOf(" :");
  if (trailingIndex !== -1) {
    trailing = rest.slice(trailingIndex + 2);
    rest = rest.slice(0, trailingIndex);
  }

  const parts = rest.split(" ").filter(Boolean);
  const command = parts.shift();

  if (!command) return null;

  return {
    tags,
    prefixNick,
    command,
    params: parts,
    trailing,
  };
}
