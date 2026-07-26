import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { buildEventReplay, type ReplayEvent } from "./event-replay.utils";
import {
  toRelativeSec,
  type NormalizedStreamEvent,
  type StreamEventTotals,
} from "./stream-events.utils";

/**
 * Stores predictions and polls against the recording's timeline.
 *
 * The write rate is the whole problem here. An open prediction pushes an
 * updated payload every second or two, and a busy one runs for half an hour —
 * persisting each frame would cost a thousand rows to describe one card. So the
 * definition is upserted onto a single row and only the totals are sampled,
 * every SAMPLE_INTERVAL_SEC and on every status change. The bars still grow
 * during replay; they just grow in steps nobody can see.
 */

// Fine enough that a card visibly fills up, coarse enough that a 30-minute
// prediction costs ~360 small rows instead of ~1200 large ones.
const SAMPLE_INTERVAL_SEC = 5;

type EventState = {
  streamEventId: string;
  lastPointSec: number;
  lastStatus: string;
  lastTotalsKey: string;
  /** Everything on the parent row, so an unchanged definition skips the write. */
  definitionKey: string;
};

@Injectable()
export class StreamEventsService {
  private readonly logger = new Logger(StreamEventsService.name);
  /** Keyed `${sessionId}:${providerEventId}`; dropped when capture stops. */
  private readonly states = new Map<string, EventState>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record one update. Safe to call at the provider's full push rate — the
   * throttling lives here rather than in each caller, so Twitch PubSub and
   * Kick's Pusher socket can both just forward everything they receive.
   */
  async record(input: {
    sessionId: string;
    anchorMs: number;
    event: NormalizedStreamEvent;
  }): Promise<void> {
    const { sessionId, anchorMs, event } = input;
    const key = `${sessionId}:${event.providerEventId}`;

    try {
      const startedAtSec = toRelativeSec(event.createdAtMs, anchorMs);
      const lockedAtSec =
        event.lockedAtMs === null ? null : toRelativeSec(event.lockedAtMs, anchorMs);
      const endedAtSec =
        event.endedAtMs === null ? null : toRelativeSec(event.endedAtMs, anchorMs);

      const definition = {
        streamSessionId: sessionId,
        platform: event.platform,
        kind: event.kind,
        providerEventId: event.providerEventId,
        title: event.title,
        status: event.status,
        startedAtSec,
        lockedAtSec,
        endedAtSec,
        outcomesJson: JSON.stringify(event.outcomes),
        winningOutcomeId: event.winningOutcomeId,
      };

      const state = this.states.get(key);
      // Where this sample sits on the timeline. "Now" rather than any field in
      // the payload: the totals describe the moment the frame arrived.
      const atSec = toRelativeSec(Date.now(), anchorMs);
      const totalsKey = totalsSignature(event.totals);
      const definitionKey = [
        definition.title,
        definition.status,
        definition.lockedAtSec,
        definition.endedAtSec,
        definition.winningOutcomeId,
        definition.outcomesJson,
      ].join("|");

      const statusChanged = !state || state.lastStatus !== event.status;
      const due = !state || atSec - state.lastPointSec >= SAMPLE_INTERVAL_SEC;
      const moved = !state || state.lastTotalsKey !== totalsKey;

      // A status change is always worth a row — that is the frame the replay
      // uses to say "bets closed" at the right second. Otherwise only write
      // when the numbers actually moved and enough time has passed.
      const writePoint = statusChanged || (due && moved);

      // The common frame changes nothing but the running totals, and arrives
      // about once a second. Without this it would still cost an upsert every
      // time — thousands of pointless writes per prediction on a box where the
      // database shares a small VPS with everything else.
      if (!writePoint && state && state.definitionKey === definitionKey) {
        return;
      }

      let streamEventId = state?.streamEventId;

      if (!state || state.definitionKey !== definitionKey) {
        const row = await this.prisma.streamEvent.upsert({
          where: {
            streamSessionId_providerEventId: {
              streamSessionId: sessionId,
              providerEventId: event.providerEventId,
            },
          },
          create: definition,
          update: {
            title: definition.title,
            status: definition.status,
            lockedAtSec: definition.lockedAtSec,
            endedAtSec: definition.endedAtSec,
            outcomesJson: definition.outcomesJson,
            winningOutcomeId: definition.winningOutcomeId,
          },
        });
        streamEventId = row.id;
      }

      if (!streamEventId) return;

      if (writePoint) {
        await this.prisma.streamEventPoint.create({
          data: {
            streamEventId,
            relativeTimeSec: atSec,
            status: event.status,
            totalsJson: JSON.stringify(event.totals),
          },
        });
      }

      this.states.set(key, {
        streamEventId,
        lastPointSec: writePoint ? atSec : state?.lastPointSec ?? atSec,
        lastStatus: event.status,
        lastTotalsKey: writePoint ? totalsKey : state?.lastTotalsKey ?? totalsKey,
        definitionKey,
      });

      if (statusChanged) {
        this.logger.log(
          `[${event.platform}] ${event.kind} "${event.title}" -> ${event.status} ` +
            `at ${atSec}s of session ${sessionId}.`,
        );
      }
    } catch (error) {
      // Bookkeeping must never take the recording down with it.
      this.logger.warn(
        `Failed to store a ${event.kind} for session ${sessionId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** Everything that ran during one recording, ready for the player. */
  async forSession(sessionId: string): Promise<ReplayEvent[]> {
    const events = await this.prisma.streamEvent.findMany({
      where: { streamSessionId: sessionId },
      orderBy: { startedAtSec: "asc" },
    });

    if (events.length === 0) {
      return [];
    }

    const points = await this.prisma.streamEventPoint.findMany({
      where: { streamEventId: { in: events.map((event) => event.id) } },
      orderBy: { relativeTimeSec: "asc" },
    });

    return buildEventReplay(events, points);
  }

  /** Drop the throttling state for a finished session. */
  forget(sessionId: string) {
    for (const key of this.states.keys()) {
      if (key.startsWith(`${sessionId}:`)) {
        this.states.delete(key);
      }
    }
  }
}

function totalsSignature(totals: StreamEventTotals[]) {
  return totals.map((entry) => `${entry.id}:${entry.points}:${entry.users}`).join("|");
}
