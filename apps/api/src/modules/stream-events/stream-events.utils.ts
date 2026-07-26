/**
 * Predictions and polls, normalized to one shape.
 *
 * Three sources feed this, and none of them agree on anything: Twitch sends
 * predictions and polls over PubSub as two unrelated payloads, and Kick sends
 * polls over the same Pusher socket chat already uses, in a third shape with no
 * event id at all. The replay only wants "a card with a title, some outcomes
 * and running totals", so the differences are flattened here — once — and the
 * rest of the codebase never sees them.
 */

export type EventPlatform = "twitch" | "kick";
export type EventKind = "prediction" | "poll";
export type EventStatus = "active" | "locked" | "resolved" | "cancelled";

export type StreamEventOutcome = {
  id: string;
  title: string;
  /** Twitch prediction colour ("BLUE"/"PINK"); polls have none. */
  color: string | null;
  /**
   * The chat badge version this outcome maps to ("blue-1"). This is the join
   * key that puts "what they bet on" next to a nick: a Twitch message carries
   * `badges=predictions/blue-1` and nothing else about the bet.
   */
  badgeVersion: string | null;
};

export type StreamEventTotals = {
  id: string;
  /** Channel points staked; for polls, the vote count. */
  points: number;
  /** How many distinct people backed this outcome. */
  users: number;
};

export type NormalizedStreamEvent = {
  platform: EventPlatform;
  kind: EventKind;
  providerEventId: string;
  title: string;
  status: EventStatus;
  createdAtMs: number;
  lockedAtMs: number | null;
  endedAtMs: number | null;
  outcomes: StreamEventOutcome[];
  totals: StreamEventTotals[];
  winningOutcomeId: string | null;
};

function toMs(value: unknown): number | null {
  if (typeof value !== "string" || !value) return null;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function toInt(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 0;
}

/**
 * Twitch prediction, from the `predictions-channel-v1.<id>` PubSub topic.
 *
 * `status` is used when present but never trusted alone: the timestamps say the
 * same thing and survive Twitch renaming a status string, which has happened
 * before. An event that ended without a winner was cancelled — Twitch refunds
 * those, and calling it "resolved" would invent a result the viewers never saw.
 */
export function parseTwitchPrediction(message: unknown): NormalizedStreamEvent | null {
  const event = (message as { data?: { event?: Record<string, unknown> } })?.data?.event;
  if (!event || typeof event.id !== "string" || !event.id) return null;

  const createdAtMs = toMs(event.created_at);
  if (createdAtMs === null) return null;

  const lockedAtMs = toMs(event.locked_at);
  const endedAtMs = toMs(event.ended_at);
  const winningOutcomeId =
    typeof event.winning_outcome_id === "string" && event.winning_outcome_id
      ? event.winning_outcome_id
      : null;

  const rawOutcomes = Array.isArray(event.outcomes) ? event.outcomes : [];
  const outcomes: StreamEventOutcome[] = [];
  const totals: StreamEventTotals[] = [];

  for (const raw of rawOutcomes as Array<Record<string, unknown>>) {
    const id = typeof raw.id === "string" ? raw.id : null;
    if (!id) continue;

    const badge = raw.badge as { version?: unknown } | undefined;
    outcomes.push({
      id,
      title: typeof raw.title === "string" ? raw.title : "",
      color: typeof raw.color === "string" ? raw.color : null,
      badgeVersion: typeof badge?.version === "string" ? badge.version : null,
    });
    totals.push({ id, points: toInt(raw.total_points), users: toInt(raw.total_users) });
  }

  if (outcomes.length === 0) return null;

  const rawStatus = typeof event.status === "string" ? event.status.toUpperCase() : "";
  let status: EventStatus;
  if (endedAtMs !== null || rawStatus === "RESOLVED" || rawStatus.startsWith("CANCEL")) {
    status = winningOutcomeId ? "resolved" : "cancelled";
  } else if (lockedAtMs !== null || rawStatus === "LOCKED") {
    status = "locked";
  } else {
    status = "active";
  }

  return {
    platform: "twitch",
    kind: "prediction",
    providerEventId: event.id,
    title: typeof event.title === "string" ? event.title : "",
    status,
    createdAtMs,
    lockedAtMs,
    endedAtMs,
    outcomes,
    totals,
    winningOutcomeId,
  };
}

/**
 * Twitch poll, from the `polls.<id>` PubSub topic.
 *
 * A poll has no winner to declare — the bars simply stop moving — so the card
 * closes on the totals it ended with and `winningOutcomeId` stays null.
 */
export function parseTwitchPoll(message: unknown): NormalizedStreamEvent | null {
  const poll = (message as { data?: { poll?: Record<string, unknown> } })?.data?.poll;
  if (!poll) return null;

  const id = typeof poll.poll_id === "string" ? poll.poll_id : null;
  if (!id) return null;

  const createdAtMs = toMs(poll.started_at) ?? toMs(poll.created_at);
  if (createdAtMs === null) return null;

  // A poll runs for a fixed `duration_seconds`, so when it closes is known the
  // moment it opens. Falling back to that means the card still closes on time
  // if the final frame never reaches us — a reconnect, or the recording simply
  // ending first. Predictions get no such fallback: they close when the
  // streamer says so, and guessing would invent a result.
  const durationSec = toInt(poll.duration_seconds);
  const scheduledEndMs = durationSec > 0 ? createdAtMs + durationSec * 1000 : null;
  const endedAtMs = toMs(poll.ended_at) ?? scheduledEndMs;

  const rawChoices = Array.isArray(poll.choices) ? poll.choices : [];
  const outcomes: StreamEventOutcome[] = [];
  const totals: StreamEventTotals[] = [];

  for (const raw of rawChoices as Array<Record<string, unknown>>) {
    const choiceId = typeof raw.choice_id === "string" ? raw.choice_id : null;
    if (!choiceId) continue;

    outcomes.push({
      id: choiceId,
      title: typeof raw.title === "string" ? raw.title : "",
      color: null,
      badgeVersion: null,
    });

    // Votes arrive split by how they were cast (base / bits / channel points);
    // the total is what the viewer saw on the bar.
    const votes = raw.votes as { total?: unknown } | undefined;
    totals.push({
      id: choiceId,
      points: toInt(votes?.total),
      users: toInt(raw.total_voters),
    });
  }

  if (outcomes.length === 0) return null;

  // Only a real `ended_at` closes the poll — `scheduledEndMs` is where the
  // card will close during replay, not a claim that it has closed already.
  const rawStatus = typeof poll.status === "string" ? poll.status.toUpperCase() : "";
  let status: EventStatus;
  if (rawStatus === "ARCHIVED" || rawStatus === "MODERATED" || rawStatus === "INVALID") {
    status = "cancelled";
  } else if (
    rawStatus === "COMPLETED" ||
    rawStatus === "TERMINATED" ||
    toMs(poll.ended_at) !== null
  ) {
    status = "resolved";
  } else {
    status = "active";
  }

  return {
    platform: "twitch",
    kind: "poll",
    providerEventId: id,
    title: typeof poll.title === "string" ? poll.title : "",
    status,
    createdAtMs,
    lockedAtMs: null,
    endedAtMs,
    outcomes,
    totals,
    winningOutcomeId: null,
  };
}

/**
 * Kick poll, from `App\Events\PollUpdateEvent` on the chatroom socket.
 *
 * Kick sends no event id and no start time — only the poll as it stands, with
 * `remaining` counting down. So identity has to be synthesized, and the caller
 * supplies it: as long as one poll is open, every update belongs to it. The
 * caller also supplies `nowMs`, because "when did this start" is only knowable
 * as now minus how much of the duration is already gone.
 */
export function parseKickPoll(
  payload: unknown,
  context: { providerEventId: string; nowMs: number },
): NormalizedStreamEvent | null {
  const poll = (payload as { poll?: Record<string, unknown> })?.poll;
  if (!poll) return null;

  const rawOptions = Array.isArray(poll.options) ? poll.options : [];
  const outcomes: StreamEventOutcome[] = [];
  const totals: StreamEventTotals[] = [];

  for (const [index, raw] of (rawOptions as Array<Record<string, unknown>>).entries()) {
    const id = raw.id === undefined || raw.id === null ? String(index) : String(raw.id);
    outcomes.push({
      id,
      title: typeof raw.label === "string" ? raw.label : "",
      color: null,
      badgeVersion: null,
    });
    // Kick reports votes only — nobody stakes anything on a poll, so the
    // number of voters IS the number of votes.
    const votes = toInt(raw.votes);
    totals.push({ id, points: votes, users: votes });
  }

  if (outcomes.length === 0) return null;

  const duration = toInt(poll.duration);
  const remaining = toInt(poll.remaining);
  // `duration` and `remaining` are seconds; how far in we are is the difference.
  const elapsedSec = Math.max(0, duration - remaining);
  const createdAtMs = context.nowMs - elapsedSec * 1000;

  // Verified against a live poll: Kick counts 30…1 and then simply stops. There
  // is no `remaining: 0` frame and no guarantee of a delete event, so waiting
  // for one would leave every poll marked open forever. A poll has a fixed
  // duration, so its end is arithmetic — and the replay closes the card at the
  // right second whether or not another frame ever arrives.
  const endedAtMs = duration > 0 ? createdAtMs + duration * 1000 : null;

  return {
    platform: "kick",
    kind: "poll",
    providerEventId: context.providerEventId,
    title: typeof poll.title === "string" ? poll.title : "",
    status: endedAtMs !== null && context.nowMs >= endedAtMs ? "resolved" : "active",
    createdAtMs,
    lockedAtMs: null,
    endedAtMs,
    outcomes,
    totals,
    winningOutcomeId: null,
  };
}

/**
 * Where an absolute instant lands on the recording's timeline.
 *
 * Events routinely start before the recorder attaches — someone opens a
 * prediction and only then does the stream get picked up — so a negative
 * result is meaningful and is kept. The player reads it as "already running
 * when this recording begins" rather than pretending it started at 0:00.
 */
export function toRelativeSec(atMs: number, anchorMs: number): number {
  return Math.round((atMs - anchorMs) / 1000);
}
