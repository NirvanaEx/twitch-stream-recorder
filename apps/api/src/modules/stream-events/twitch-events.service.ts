import { Injectable, Logger } from "@nestjs/common";
import { StreamEventsService } from "./stream-events.service";
import { parseTwitchPoll, parseTwitchPrediction } from "./stream-events.utils";

/**
 * Twitch predictions and polls, over PubSub.
 *
 * Helix will not give these up: `channel:read:predictions` and
 * `channel:read:polls` are broadcaster scopes, so reading them through the
 * documented API would require every recorded streamer to authorize this app.
 * PubSub, which is what twitch.tv's own player listens on, accepts an anonymous
 * LISTEN for `predictions-channel-v1.<id>` and `polls.<id>` — verified against
 * live channels, including the lock transition.
 *
 * The trade-off is stated plainly: PubSub is undocumented-for-third-parties and
 * Twitch has signalled it wants EventSub to replace it. If it goes away, this
 * capture goes quiet and the rest of the recording is unaffected — which is why
 * a failed LISTEN is logged loudly and never touches the session state.
 */

const PUBSUB_URL = "wss://pubsub-edge.twitch.tv/v1";

// Twitch drops clients that go quiet for 5 minutes. Ping well inside that, and
// treat a missing PONG as a dead socket rather than waiting to be disconnected.
const PING_INTERVAL_MS = 4 * 60_000;
const PONG_TIMEOUT_MS = 15_000;

const MAX_RECONNECT_DELAY_MS = 120_000;

type ActiveCapture = {
  channelId: string;
  sessionId: string;
  channelLogin: string;
  twitchUserId: string;
  anchorMs: number;
  socket: WebSocket | null;
  pingTimer: NodeJS.Timeout | null;
  pongTimer: NodeJS.Timeout | null;
  reconnectTimer: NodeJS.Timeout | null;
  reconnectAttempts: number;
  stopped: boolean;
  listening: boolean;
  eventCount: number;
};

@Injectable()
export class TwitchEventsService {
  private readonly logger = new Logger(TwitchEventsService.name);
  private readonly captures = new Map<string, ActiveCapture>();

  constructor(private readonly streamEvents: StreamEventsService) {}

  startCapture(input: {
    channelId: string;
    sessionId: string;
    channelLogin: string;
    twitchUserId: string | null;
    captureAnchor: Date;
  }) {
    const { channelId, sessionId, channelLogin, twitchUserId, captureAnchor } = input;

    if (typeof WebSocket === "undefined") {
      this.logger.warn(
        `[events:${channelLogin}] disabled: this Node.js runtime (${process.version}) has no global WebSocket.`,
      );
      return;
    }

    // Topics are keyed by the numeric channel id, not the login.
    if (!twitchUserId) {
      this.logger.warn(
        `[events:${channelLogin}] no Twitch user id on the channel — predictions and polls will not be recorded.`,
      );
      return;
    }

    this.stopCapture(channelId);

    const capture: ActiveCapture = {
      channelId,
      sessionId,
      channelLogin,
      twitchUserId,
      anchorMs: captureAnchor.getTime(),
      socket: null,
      pingTimer: null,
      pongTimer: null,
      reconnectTimer: null,
      reconnectAttempts: 0,
      stopped: false,
      listening: false,
      eventCount: 0,
    };

    this.captures.set(channelId, capture);
    this.connect(capture);
  }

  stopCapture(channelId: string) {
    const capture = this.captures.get(channelId);
    if (!capture) return;

    capture.stopped = true;
    this.clearTimers(capture);

    try {
      capture.socket?.close();
    } catch {
      // Already gone.
    }

    this.captures.delete(channelId);
    this.streamEvents.forget(capture.sessionId);

    if (capture.eventCount > 0) {
      this.logger.log(
        `[events:${capture.channelLogin}] capture stopped after ${capture.eventCount} update(s).`,
      );
    }
  }

  private connect(capture: ActiveCapture) {
    if (capture.stopped) return;

    let socket: WebSocket;
    try {
      socket = new WebSocket(PUBSUB_URL);
    } catch (error) {
      this.scheduleReconnect(capture, error);
      return;
    }

    capture.socket = socket;
    capture.listening = false;

    socket.addEventListener("open", () => {
      if (capture.stopped || capture.socket !== socket) return;
      capture.reconnectAttempts = 0;

      socket.send(
        JSON.stringify({
          type: "LISTEN",
          nonce: `tsr-${capture.sessionId}`,
          data: {
            topics: [
              `predictions-channel-v1.${capture.twitchUserId}`,
              `polls.${capture.twitchUserId}`,
            ],
          },
        }),
      );

      capture.pingTimer = setInterval(() => this.ping(capture), PING_INTERVAL_MS);
      capture.pingTimer.unref();
    });

    socket.addEventListener("message", (event) => {
      if (capture.stopped || capture.socket !== socket) return;
      void this.handleFrame(capture, String(event.data));
    });

    socket.addEventListener("error", () => {
      // "close" always follows and handles the reconnect exactly once.
    });

    socket.addEventListener("close", () => {
      if (capture.stopped || capture.socket !== socket) return;
      this.clearTimers(capture);
      this.scheduleReconnect(capture);
    });
  }

  private async handleFrame(capture: ActiveCapture, raw: string) {
    let frame: { type?: string; nonce?: string; error?: string; data?: unknown };

    try {
      frame = JSON.parse(raw);
    } catch {
      return;
    }

    if (frame.type === "PONG") {
      if (capture.pongTimer) {
        clearTimeout(capture.pongTimer);
        capture.pongTimer = null;
      }
      return;
    }

    if (frame.type === "RECONNECT") {
      // Twitch asks clients to move off a node before it goes down.
      this.logger.log(`[events:${capture.channelLogin}] server asked for a reconnect.`);
      try {
        capture.socket?.close();
      } catch {
        // The close handler reconnects either way.
      }
      return;
    }

    if (frame.type === "RESPONSE") {
      if (frame.error) {
        // The recording is fine; only this extra is missing. Loud, because a
        // silent failure here looks identical to "the streamer ran no polls".
        this.logger.warn(
          `[events:${capture.channelLogin}] LISTEN rejected: ${frame.error}. ` +
            "Predictions and polls will not be recorded for this session.",
        );
      } else {
        capture.listening = true;
        this.logger.log(
          `[events:${capture.channelLogin}] listening for predictions and polls.`,
        );
      }
      return;
    }

    if (frame.type !== "MESSAGE") return;

    const data = frame.data as { topic?: string; message?: string } | undefined;
    const topic = data?.topic ?? "";
    if (!data?.message) return;

    let payload: unknown;
    try {
      payload = JSON.parse(data.message);
    } catch {
      return;
    }

    const event = topic.startsWith("polls.")
      ? parseTwitchPoll(payload)
      : parseTwitchPrediction(payload);

    if (!event) return;

    capture.eventCount += 1;
    await this.streamEvents.record({
      sessionId: capture.sessionId,
      anchorMs: capture.anchorMs,
      event,
    });
  }

  private ping(capture: ActiveCapture) {
    try {
      capture.socket?.send(JSON.stringify({ type: "PING" }));
    } catch {
      return;
    }

    if (capture.pongTimer) clearTimeout(capture.pongTimer);
    capture.pongTimer = setTimeout(() => {
      if (capture.stopped) return;
      this.logger.warn(`[events:${capture.channelLogin}] no PONG — reconnecting.`);
      try {
        capture.socket?.close();
      } catch {
        // The close handler takes it from here.
      }
    }, PONG_TIMEOUT_MS);
    capture.pongTimer.unref();
  }

  private scheduleReconnect(capture: ActiveCapture, error?: unknown) {
    if (capture.stopped || capture.reconnectTimer) return;

    capture.reconnectAttempts += 1;
    // Twitch's own guidance: exponential backoff with jitter, so a node coming
    // back does not get hit by every client it dropped at the same instant.
    const base = Math.min(MAX_RECONNECT_DELAY_MS, 1000 * 2 ** Math.min(capture.reconnectAttempts - 1, 7));
    const delay = base / 2 + Math.random() * (base / 2);

    if (error) {
      this.logger.warn(
        `[events:${capture.channelLogin}] connection failed: ${
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
    for (const timer of ["pingTimer", "pongTimer", "reconnectTimer"] as const) {
      const handle = capture[timer];
      if (handle) {
        clearTimeout(handle);
        clearInterval(handle);
        capture[timer] = null;
      }
    }
  }
}
