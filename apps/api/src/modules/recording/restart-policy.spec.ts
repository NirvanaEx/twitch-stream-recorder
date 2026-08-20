import assert from "node:assert/strict";
import test from "node:test";
import {
  decideCaptureRestart,
  EMPTY_ATTEMPT_BACKOFF_MS,
  SETTLED_CAPTURE_QUIET_MS,
  type PreviousAttempt,
} from "./restart-policy";

function attempt(overrides: Partial<PreviousAttempt> = {}): PreviousAttempt {
  return {
    status: "completed",
    createdAt: new Date("2026-08-05T10:48:17.000Z"),
    endedAt: new Date("2026-08-05T12:43:42.000Z"),
    stoppedByUser: false,
    fileSizeBytes: "143654912",
    ...overrides,
  };
}

const CAPTURE_ENDED = new Date("2026-08-05T12:43:42.000Z").getTime();

test("a broadcast never captured before is recorded", () => {
  assert.deepEqual(decideCaptureRestart({ now: CAPTURE_ENDED, attempts: [] }), { restart: true });
});

test("a capture still running is not restarted", () => {
  const verdict = decideCaptureRestart({
    now: CAPTURE_ENDED,
    attempts: [attempt({ status: "recording", endedAt: null })],
  });

  assert.equal(verdict.restart, false);
});

test("a capture stopped by hand is not resumed behind the operator's back", () => {
  const verdict = decideCaptureRestart({
    now: CAPTURE_ENDED + SETTLED_CAPTURE_QUIET_MS * 10,
    attempts: [attempt({ stoppedByUser: true })],
  });

  assert.equal(verdict.restart, false);
});

/**
 * 05.08.2026, strogo: four captures of one broadcast, each restarted under a
 * second after the previous one closed, ~15 minutes of the stream lost in the
 * seams. The cooldown was measured from the capture's START, so a capture that
 * ran for two hours had always already served it.
 */
test("a capture that just ended does not restart on the next poll", () => {
  const verdict = decideCaptureRestart({
    now: CAPTURE_ENDED + 600,
    attempts: [attempt()],
  });

  assert.equal(verdict.restart, false);
  assert.match(verdict.restart === false ? verdict.reason : "", /reports a finished broadcast/);
});

test("the wait after a finished capture is measured from its end, not its start", () => {
  // Two hours into the capture — under the old rule this alone let it restart.
  const verdict = decideCaptureRestart({
    now: CAPTURE_ENDED + SETTLED_CAPTURE_QUIET_MS - 1_000,
    attempts: [attempt()],
  });

  assert.equal(verdict.restart, false);
  assert.equal(verdict.restart === false ? verdict.retryInMs : -1, 1_000);
});

test("a channel still live once the stale-live window has passed is captured again", () => {
  const verdict = decideCaptureRestart({
    now: CAPTURE_ENDED + SETTLED_CAPTURE_QUIET_MS + 1,
    attempts: [attempt()],
  });

  assert.deepEqual(verdict, { restart: true });
});

/**
 * Helix still said "live" 72 s after skywhywalker's broadcast ended on
 * 03.08.2026, so this window does NOT try to outlast it — sitting out three
 * minutes would cost a mid-broadcast capture far more than a discarded attempt
 * costs. It only has to clear a poll interval so the recorder does not relaunch
 * a capture in the same second the previous one closed.
 */
test("the quiet window clears a poll interval without waiting out Helix", () => {
  assert.ok(SETTLED_CAPTURE_QUIET_MS > 15_000);
  assert.ok(SETTLED_CAPTURE_QUIET_MS < 72_000);
});

/**
 * 15.08.2026, strogo: the first attempt died 1.5 s in because the playlist was
 * not published yet, the 60 s cooldown then blocked the retry, and the real
 * recording only started 94 s after the broadcast did.
 */
test("an empty attempt is retried quickly rather than sitting out a full cooldown", () => {
  const failedAt = new Date("2026-08-15T21:11:34.000Z");
  const empty = attempt({
    status: "error",
    createdAt: new Date("2026-08-15T21:11:33.000Z"),
    endedAt: failedAt,
    fileSizeBytes: "0",
  });

  assert.equal(
    decideCaptureRestart({ now: failedAt.getTime() + 5_000, attempts: [empty] }).restart,
    false,
  );
  assert.deepEqual(
    decideCaptureRestart({
      now: failedAt.getTime() + EMPTY_ATTEMPT_BACKOFF_MS[0] + 1,
      attempts: [empty],
    }),
    { restart: true },
  );
});

test("empty attempts in a row back off instead of spinning", () => {
  const endedAt = new Date("2026-08-15T21:11:34.000Z");
  const empty = attempt({ status: "error", endedAt, fileSizeBytes: "0" });
  const now = endedAt.getTime() + EMPTY_ATTEMPT_BACKOFF_MS[0] + 1;

  // One empty attempt: the quick retry above is already due.
  assert.equal(decideCaptureRestart({ now, attempts: [empty] }).restart, true);

  // Three in a row: the third waits considerably longer.
  const verdict = decideCaptureRestart({ now, attempts: [empty, empty, empty] });

  assert.equal(verdict.restart, false);
  assert.match(verdict.restart === false ? verdict.reason : "", /captured nothing/);
});

test("the backoff never runs off the end of the table", () => {
  const endedAt = new Date("2026-08-15T21:11:34.000Z");
  const empty = attempt({ status: "error", endedAt, fileSizeBytes: "0" });
  const verdict = decideCaptureRestart({
    now: endedAt.getTime() + 1_000,
    attempts: Array.from({ length: 40 }, () => empty),
  });

  assert.equal(verdict.restart, false);
  assert.equal(
    verdict.restart === false ? verdict.retryInMs : -1,
    EMPTY_ATTEMPT_BACKOFF_MS[EMPTY_ATTEMPT_BACKOFF_MS.length - 1] - 1_000,
  );
});

test("a streak is only counted back to the last attempt that captured something", () => {
  const endedAt = new Date("2026-08-15T21:11:34.000Z");
  const empty = attempt({ status: "error", endedAt, fileSizeBytes: "0" });
  const good = attempt({ endedAt: new Date("2026-08-15T21:00:00.000Z") });
  const now = endedAt.getTime() + EMPTY_ATTEMPT_BACKOFF_MS[0] + 1;

  // One empty attempt after a good one is still the FIRST of its streak, so it
  // gets the quick retry — not the backoff earned by the older failures.
  assert.deepEqual(
    decideCaptureRestart({ now, attempts: [empty, good, empty, empty, empty] }),
    { restart: true },
  );
});

test("a completed session written before fileSizeBytes existed counts as a recording", () => {
  const verdict = decideCaptureRestart({
    now: CAPTURE_ENDED + 1_000,
    attempts: [attempt({ fileSizeBytes: null })],
  });

  assert.equal(verdict.restart, false);
  assert.match(verdict.restart === false ? verdict.reason : "", /reports a finished broadcast/);
});

test("an interrupted capture that never recorded its end still serves its wait", () => {
  const startedAt = new Date("2026-08-05T12:43:42.000Z");
  const verdict = decideCaptureRestart({
    now: startedAt.getTime() + 1_000,
    attempts: [attempt({ createdAt: startedAt, endedAt: null, status: "error" })],
  });

  assert.equal(verdict.restart, false);
});
