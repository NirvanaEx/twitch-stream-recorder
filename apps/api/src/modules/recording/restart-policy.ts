/**
 * When may the auto-recorder start a capture for a broadcast it has already
 * captured once?
 *
 * The question exists because a capture ending is not the same event as a
 * broadcast ending. streamlink exits both when the stream is over and when it
 * lost the stream, and the poller cannot tell those apart from the exit alone
 * — so it asks Twitch, and Twitch lies for a while: Helix kept reporting
 * skywhywalker as live 72 seconds after the broadcast had actually finished
 * (03.08.2026). Restart on that answer and the recorder captures nothing,
 * writes a zero-byte session, and calls it an error.
 *
 * The rule that follows from this: what the previous attempt *produced* decides
 * how long to wait before trying again.
 *
 * - It produced a recording -> pause briefly and try again. Either the
 *   broadcast really is over, in which case the attempt captures nothing and
 *   is discarded, or it is still running and the capture resumes having lost
 *   seconds rather than minutes.
 * - It produced nothing -> the stream was not there to capture (the playlist is
 *   not published yet at the top of a broadcast, or it is already gone).
 *   Retry quickly, then back off, so the first minute of a broadcast is not
 *   lost waiting out a cooldown meant for a different situation, and a channel
 *   Twitch wrongly reports as live cannot spin the recorder.
 *
 * The cooldown is measured from when the previous attempt ENDED. Measuring it
 * from when the attempt started — as this did until 20.08.2026 — means any
 * capture that ran longer than the cooldown has already served it, so the
 * restart fires on the very next poll: on 05.08.2026 one strogo broadcast was
 * restarted 0.6 s after the previous piece closed, four times over, and the
 * archive ended up with four entries and ~15 minutes of the broadcast missing.
 */

/** What one previous capture attempt of the same broadcast looks like here. */
export type PreviousAttempt = {
  status: string;
  createdAt: Date;
  endedAt: Date | null;
  stoppedByUser: boolean;
  /** Bytes the capture wrote. "0" — and a zero-length capture — mean nothing. */
  fileSizeBytes: string | null;
};

export type RestartVerdict =
  | { restart: true }
  | { restart: false; reason: string; retryInMs: number };

/**
 * How long a finished capture keeps the recorder quiet.
 *
 * Deliberately short — one poll interval and a little. Waiting out Helix's
 * stale "live" entirely would take three minutes, and that is the wrong trade:
 * the two outcomes it decides between are not equally expensive.
 *
 * - Wait too long and a capture that ended mid-broadcast (streamlink gave up
 *   despite its retries) resumes minutes late, and those minutes of the
 *   broadcast are gone for good.
 * - Wait too little and the recorder starts a capture for a broadcast that is
 *   already over. That capture finds nothing, ends in about a minute, and
 *   `finalize` drops the fruitless session — it costs a minute of an idle
 *   streamlink and leaves nothing behind.
 *
 * The attempt is also the better test: whether Twitch still serves a playlist
 * is the actual question, and no amount of waiting on Helix answers it.
 */
export const SETTLED_CAPTURE_QUIET_MS = 20_000;

/**
 * How long to wait after a capture that produced nothing, by how many empty
 * attempts came in a row. The first retry is quick because the usual cause is
 * a broadcast whose playlist is seconds away from being published; the later
 * ones back off so a channel Twitch wrongly reports as live cannot spin the
 * recorder in a create-session/fail loop.
 */
export const EMPTY_ATTEMPT_BACKOFF_MS = [15_000, 45_000, 120_000, 600_000];

/**
 * Did this attempt capture anything at all? Sessions written before
 * fileSizeBytes existed have none, so a completed session without a size is
 * taken at its word.
 */
function producedData(attempt: PreviousAttempt): boolean {
  if (attempt.fileSizeBytes === null || attempt.fileSizeBytes === "") {
    return attempt.status === "completed";
  }

  const bytes = Number.parseInt(attempt.fileSizeBytes, 10);

  return Number.isFinite(bytes) && bytes > 0;
}

/** When an attempt stopped occupying the channel. */
function attemptEndedAt(attempt: PreviousAttempt): number {
  return (attempt.endedAt ?? attempt.createdAt).getTime();
}

function waitVerdict(reason: string, sinceMs: number, quietMs: number, now: number): RestartVerdict {
  return {
    restart: false,
    reason,
    retryInMs: Math.max(0, sinceMs + quietMs - now),
  };
}

/**
 * @param attempts Previous sessions for this broadcast, NEWEST FIRST. Only
 *   sessions of the same twitchStreamId belong here — a different broadcast
 *   says nothing about this one.
 */
export function decideCaptureRestart(input: {
  now: number;
  attempts: PreviousAttempt[];
}): RestartVerdict {
  const [latest, ...older] = input.attempts;

  // Never recorded, or a stream Twitch gives no id for: nothing to hold back.
  if (!latest) {
    return { restart: true };
  }

  if (latest.status === "recording") {
    return {
      restart: false,
      reason: "the previous capture of this broadcast is still running",
      retryInMs: 0,
    };
  }

  // Manual stop is really enforced by channel.manualStopUntilOffline; this is
  // the guard for the case where that flag was cleared while the stream ran on.
  if (latest.stoppedByUser) {
    return {
      restart: false,
      reason: "the previous capture of this broadcast was stopped by hand",
      retryInMs: 0,
    };
  }

  const endedAt = attemptEndedAt(latest);

  if (producedData(latest)) {
    if (input.now - endedAt < SETTLED_CAPTURE_QUIET_MS) {
      return waitVerdict(
        "the previous capture ended moments ago and Twitch reports a finished " +
          "broadcast as live for a minute or two",
        endedAt,
        SETTLED_CAPTURE_QUIET_MS,
        input.now,
      );
    }

    return { restart: true };
  }

  // Count how many attempts in a row came back empty, this one included: each
  // one buys the next a longer wait.
  let emptyStreak = 1;

  for (const attempt of older) {
    if (producedData(attempt)) {
      break;
    }

    emptyStreak += 1;
  }

  const backoffMs =
    EMPTY_ATTEMPT_BACKOFF_MS[Math.min(emptyStreak, EMPTY_ATTEMPT_BACKOFF_MS.length) - 1];

  if (input.now - endedAt < backoffMs) {
    return waitVerdict(
      `the last ${emptyStreak} attempt(s) captured nothing`,
      endedAt,
      backoffMs,
      input.now,
    );
  }

  return { restart: true };
}
