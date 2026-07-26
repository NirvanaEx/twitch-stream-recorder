import type { EventKind, EventPlatform, EventStatus, StreamEventOutcome } from "./stream-events.utils";

/**
 * Turns stored rows into what a player can replay.
 *
 * The samples are flattened into parallel arrays in outcome order rather than a
 * list of `{id, points, users}` objects: a long prediction carries a few hundred
 * samples and repeating the outcome id in every one of them roughly triples the
 * response for no added meaning.
 *
 * Nothing is hidden here. The winner and the final totals are in the payload
 * from the start, exactly as with the metadata timeline, because the client is
 * the only side that knows where the viewer currently is — and whether they
 * want to be spoiled at all.
 */

export type StoredEvent = {
  id: string;
  platform: string;
  kind: string;
  title: string;
  status: string;
  startedAtSec: number;
  lockedAtSec: number | null;
  endedAtSec: number | null;
  winningOutcomeId: string | null;
  outcomesJson: string;
};

export type StoredEventPoint = {
  streamEventId: string;
  relativeTimeSec: number;
  status: string;
  totalsJson: string;
};

export type EventSample = {
  atSec: number;
  status: EventStatus;
  /** Aligned with `outcomes`: points[i] belongs to outcomes[i]. */
  points: number[];
  users: number[];
};

export type ReplayEvent = {
  id: string;
  platform: EventPlatform;
  kind: EventKind;
  title: string;
  status: EventStatus;
  startedAtSec: number;
  lockedAtSec: number | null;
  endedAtSec: number | null;
  winningOutcomeId: string | null;
  outcomes: StreamEventOutcome[];
  samples: EventSample[];
};

function parseOutcomes(json: string): StreamEventOutcome[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as StreamEventOutcome[]) : [];
  } catch {
    return [];
  }
}

function parseTotals(json: string): Array<{ id: string; points: number; users: number }> {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as Array<{ id: string; points: number; users: number }>) : [];
  } catch {
    return [];
  }
}

export function buildEventReplay(
  events: StoredEvent[],
  points: StoredEventPoint[],
): ReplayEvent[] {
  const byEvent = new Map<string, StoredEventPoint[]>();
  for (const point of points) {
    const bucket = byEvent.get(point.streamEventId);
    if (bucket) bucket.push(point);
    else byEvent.set(point.streamEventId, [point]);
  }

  const replay: ReplayEvent[] = [];

  for (const event of events) {
    const outcomes = parseOutcomes(event.outcomesJson);
    if (outcomes.length === 0) continue;

    const order = new Map(outcomes.map((outcome, index) => [outcome.id, index]));
    const samples: EventSample[] = [];

    const stored = (byEvent.get(event.id) ?? []).sort(
      (a, b) => a.relativeTimeSec - b.relativeTimeSec,
    );

    for (const point of stored) {
      const totals = parseTotals(point.totalsJson);
      const pointsRow = new Array<number>(outcomes.length).fill(0);
      const usersRow = new Array<number>(outcomes.length).fill(0);

      for (const total of totals) {
        const index = order.get(total.id);
        // An outcome that is not in the definition cannot be drawn; skipping it
        // is better than shifting every later outcome onto the wrong bar.
        if (index === undefined) continue;
        pointsRow[index] = total.points;
        usersRow[index] = total.users;
      }

      samples.push({
        atSec: point.relativeTimeSec,
        status: point.status as EventStatus,
        points: pointsRow,
        users: usersRow,
      });
    }

    replay.push({
      id: event.id,
      platform: event.platform as EventPlatform,
      kind: event.kind as EventKind,
      title: event.title,
      status: event.status as EventStatus,
      startedAtSec: event.startedAtSec,
      lockedAtSec: event.lockedAtSec,
      endedAtSec: event.endedAtSec,
      winningOutcomeId: event.winningOutcomeId,
      outcomes,
      samples,
    });
  }

  return replay.sort((a, b) => a.startedAtSec - b.startedAtSec);
}
