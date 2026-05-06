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
  closed: boolean;
  buffer: string;
};

const TWITCH_IRC_WS_URL = "wss://irc-ws.chat.twitch.tv:443";

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly captures = new Map<string, ActiveCapture>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  startCapture(input: {
    channelId: string;
    sessionId: string;
    channelLogin: string;
    captureAnchor: Date;
  }) {
    const { channelId, sessionId, channelLogin, captureAnchor } = input;

    if (this.captures.has(channelId)) {
      return;
    }

    const capture: ActiveCapture = {
      channelId,
      sessionId,
      channelLogin: channelLogin.toLowerCase(),
      startedAt: captureAnchor.getTime(),
      socket: null as unknown as WebSocket,
      reconnectTimer: null,
      closed: false,
      buffer: "",
    };

    this.captures.set(channelId, capture);
    this.connect(capture);

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
    const socket = new WebSocket(TWITCH_IRC_WS_URL);
    capture.socket = socket;

    socket.addEventListener("open", () => {
      this.logger.log(`[chat:${capture.channelLogin}] connected as ${nick}`);
      socket.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
      socket.send(`NICK ${nick}`);
      socket.send(`JOIN #${capture.channelLogin}`);
    });

    socket.addEventListener("message", (event) => {
      const chunk = typeof event.data === "string" ? event.data : event.data.toString();

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
      const message =
        event && typeof event === "object" && "message" in event
          ? String((event as { message?: unknown }).message ?? "unknown")
          : "unknown";
      this.logger.warn(`[chat:${capture.channelLogin}] socket error: ${message}`);
    });

    socket.addEventListener("close", (event) => {
      if (capture.closed) {
        return;
      }

      this.logger.warn(
        `[chat:${capture.channelLogin}] socket closed (code=${event.code}). Reconnecting in 5s.`,
      );

      capture.reconnectTimer = setTimeout(() => {
        capture.reconnectTimer = null;
        this.connect(capture);
      }, 5000);
    });
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
      void this.persistMessage(capture, parsed);
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
      this.logger.debug(
        `Failed to persist chat message: ${
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
