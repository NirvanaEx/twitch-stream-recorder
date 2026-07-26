/**
 * Shared shapes and colours for predictions and polls.
 *
 * Kept out of the card component so the chat row can colour a "bet on X" chip
 * with the exact same palette without importing the card.
 */

export type EventKind = "prediction" | "poll";
export type EventStatus = "active" | "locked" | "resolved" | "cancelled";

export type ReplayOutcome = {
  id: string;
  title: string;
  color: string | null;
  /** "blue-1" — Twitch's chat badge for people who backed this outcome. */
  badgeVersion: string | null;
};

export type ReplayEvent = {
  id: string;
  platform: "twitch" | "kick";
  kind: EventKind;
  title: string;
  status: EventStatus;
  startedAtSec: number;
  lockedAtSec: number | null;
  endedAtSec: number | null;
  winningOutcomeId: string | null;
  outcomes: ReplayOutcome[];
  samples: Array<{
    atSec: number;
    status: EventStatus;
    /** Aligned with `outcomes` by index. */
    points: number[];
    users: number[];
  }>;
};

/** What this author bet on, read off their chat badges. */
export type PredictionBet = {
  badgeVersion: string;
  outcomeTitle: string | null;
};

// Twitch's own two-outcome palette. A prediction with more than two outcomes
// numbers them all "blue-N", which is why the slot number cannot decide the
// colour on its own.
const TWITCH_BLUE = "#387aff";
const TWITCH_PINK = "#ff3f97";

// Used when an outcome has no colour of its own — Kick polls, and Twitch
// predictions with many outcomes where every badge says "blue".
const FALLBACK = ["#387aff", "#ff3f97", "#22c55e", "#f59e0b", "#a78bfa", "#14b8a6", "#ef4444", "#eab308", "#3b82f6", "#ec4899"];

/** The colour of one bar, matching what chat saw next to the nicks. */
export function outcomeColor(outcome: ReplayOutcome, index: number) {
  const slot = badgeSlot(outcome.badgeVersion);
  if (slot === "pink") return TWITCH_PINK;
  // A two-outcome prediction is blue vs pink; anything wider is all-blue on
  // Twitch's side, so the bars are spread across the fallback palette to stay
  // tellable apart.
  if (slot === "blue" && index === 0) return TWITCH_BLUE;
  return FALLBACK[index % FALLBACK.length];
}

/** The colour of the chip next to a nick, from the badge alone. */
export function betColor(badgeVersion: string) {
  const slot = badgeSlot(badgeVersion);
  if (slot === "pink") return TWITCH_PINK;
  if (slot === "blue") {
    const n = badgeNumber(badgeVersion);
    // blue-1 is the first outcome; the rest get distinct colours so ten
    // simultaneous outcomes do not all read as the same bet.
    return n <= 1 ? TWITCH_BLUE : FALLBACK[(n - 1) % FALLBACK.length];
  }
  return "#9ca3af";
}

function badgeSlot(version: string | null) {
  if (!version) return null;
  const dash = version.indexOf("-");
  return (dash === -1 ? version : version.slice(0, dash)).toLowerCase();
}

function badgeNumber(version: string) {
  const dash = version.indexOf("-");
  if (dash === -1) return 1;
  const parsed = Number.parseInt(version.slice(dash + 1), 10);
  return Number.isFinite(parsed) ? parsed : 1;
}
