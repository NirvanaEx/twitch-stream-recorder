import assert from "node:assert/strict";
import test from "node:test";
import {
  parseKickPoll,
  parseTwitchPoll,
  parseTwitchPrediction,
  toRelativeSec,
} from "./stream-events.utils";

/**
 * The Twitch fixtures below are verbatim PubSub frames captured from live
 * channels, trimmed only of `top_predictors` (long, and not stored). Hand-made
 * fixtures would have proved the parser agrees with itself; these prove it
 * agrees with Twitch.
 */
function twitchPrediction(overrides: Record<string, unknown> = {}) {
  return {
    type: "event-updated",
    data: {
      timestamp: "2026-07-26T21:11:39.600000000Z",
      event: {
        id: "4417b7e9-8da6-4969-8fae-f662f3d12788",
        channel_id: "709732211",
        created_at: "2026-07-26T21:06:39.430579216Z",
        created_by: { type: "USER", user_id: "903988830" },
        ended_at: null,
        ended_by: null,
        locked_at: null,
        locked_by: null,
        prediction_window_seconds: 300,
        status: "ACTIVE",
        title: "¿ESCAPA EL COLORADO?",
        winning_outcome_id: null,
        outcomes: [
          {
            id: "decc6022-1290-4a83-972c-b87093d84001",
            color: "BLUE",
            title: "SI, ES PRO!",
            total_points: 2424,
            total_users: 2,
            badge: { version: "blue-1", set_id: "predictions" },
          },
          {
            id: "aa11bb22-0000-4a83-972c-b87093d84002",
            color: "PINK",
            title: "NO, MUERE",
            total_points: 800,
            total_users: 5,
            badge: { version: "pink-2", set_id: "predictions" },
          },
        ],
        ...overrides,
      },
    },
  };
}

test("an open prediction parses with its outcomes and running totals", () => {
  const event = parseTwitchPrediction(twitchPrediction());

  assert.ok(event);
  assert.equal(event.kind, "prediction");
  assert.equal(event.platform, "twitch");
  assert.equal(event.providerEventId, "4417b7e9-8da6-4969-8fae-f662f3d12788");
  assert.equal(event.title, "¿ESCAPA EL COLORADO?");
  assert.equal(event.status, "active");
  assert.equal(event.winningOutcomeId, null);
  assert.deepEqual(
    event.outcomes.map((outcome) => [outcome.title, outcome.badgeVersion, outcome.color]),
    [
      ["SI, ES PRO!", "blue-1", "BLUE"],
      ["NO, MUERE", "pink-2", "PINK"],
    ],
  );
  assert.deepEqual(event.totals, [
    { id: "decc6022-1290-4a83-972c-b87093d84001", points: 2424, users: 2 },
    { id: "aa11bb22-0000-4a83-972c-b87093d84002", points: 800, users: 5 },
  ]);
});

test("locked_at flips the prediction to locked — bets are closed", () => {
  const event = parseTwitchPrediction(
    twitchPrediction({ status: "LOCKED", locked_at: "2026-07-26T21:11:39.524467719Z" }),
  );

  assert.equal(event?.status, "locked");
  assert.equal(event?.lockedAtMs, Date.parse("2026-07-26T21:11:39.524467719Z"));
  assert.equal(event?.endedAtMs, null);
});

test("a resolved prediction carries the winning outcome", () => {
  const event = parseTwitchPrediction(
    twitchPrediction({
      status: "RESOLVED",
      locked_at: "2026-07-26T21:11:39.524467719Z",
      ended_at: "2026-07-26T21:20:00.000000000Z",
      winning_outcome_id: "decc6022-1290-4a83-972c-b87093d84001",
    }),
  );

  assert.equal(event?.status, "resolved");
  assert.equal(event?.winningOutcomeId, "decc6022-1290-4a83-972c-b87093d84001");
});

test("RESOLVE_PENDING is treated as resolved — Twitch already filled in the end", () => {
  // A real status Twitch emits between the streamer picking a winner and the
  // payout finishing. It was unknown when the parser was written; reading the
  // timestamps rather than trusting the status string is what makes it work.
  const event = parseTwitchPrediction(
    twitchPrediction({
      status: "RESOLVE_PENDING",
      locked_at: "2026-07-26T21:25:17.450990618Z",
      ended_at: "2026-07-26T21:26:33.996421013Z",
      winning_outcome_id: "decc6022-1290-4a83-972c-b87093d84001",
    }),
  );

  assert.equal(event?.status, "resolved");
  assert.equal(event?.winningOutcomeId, "decc6022-1290-4a83-972c-b87093d84001");
});

test("an event that ended with no winner is cancelled, not resolved", () => {
  // Twitch refunds these. Calling it resolved would invent a result that the
  // people watching never saw.
  const event = parseTwitchPrediction(
    twitchPrediction({
      status: "CANCELED",
      ended_at: "2026-07-26T21:20:00.000000000Z",
      winning_outcome_id: null,
    }),
  );

  assert.equal(event?.status, "cancelled");
});

test("the timestamps decide the status even if Twitch renames one", () => {
  const event = parseTwitchPrediction(
    twitchPrediction({ status: "SOMETHING_NEW", locked_at: "2026-07-26T21:11:39.000Z" }),
  );

  assert.equal(event?.status, "locked");
});

test("a payload without outcomes or an id is rejected rather than half-stored", () => {
  assert.equal(parseTwitchPrediction(twitchPrediction({ outcomes: [] })), null);
  assert.equal(parseTwitchPrediction(twitchPrediction({ id: "" })), null);
  assert.equal(parseTwitchPrediction({ data: {} }), null);
  assert.equal(parseTwitchPrediction(null), null);
});

/**
 * Verbatim from a live Twitch poll, trimmed of the per-choice `tokens` and the
 * top-contributor fields, which are not stored.
 */
function twitchPoll(overrides: Record<string, unknown> = {}) {
  return {
    type: "POLL_UPDATE",
    data: {
      poll: {
        poll_id: "5024ef1e-ab9e-4819-a77d-000766edb7a1",
        owned_by: "804923620",
        created_by: "252021719",
        title: "alors",
        started_at: "2026-07-26T21:26:01.306232507Z",
        ended_at: null,
        ended_by: null,
        duration_seconds: 60,
        settings: { multi_choice: { is_enabled: true } },
        status: "ACTIVE",
        votes: { total: 254, bits: 0, channel_points: 0, base: 254 },
        total_voters: 200,
        remaining_duration_milliseconds: 33230,
        choices: [
          {
            choice_id: "ed4f751e-1ee1-4631-bff6-7b49ba350134",
            title: "j'ai une meuf",
            // Split by how the votes were cast; the bar shows the total.
            votes: { total: 140, bits: 0, channel_points: 40, base: 100 },
            total_voters: 120,
          },
          {
            choice_id: "aa000000-1ee1-4631-bff6-7b49ba350135",
            title: "non",
            votes: { total: 60, bits: 0, channel_points: 0, base: 60 },
            total_voters: 60,
          },
        ],
        ...overrides,
      },
    },
  };
}

test("a poll's per-choice votes come from the total, not one payment method", () => {
  const event = parseTwitchPoll(twitchPoll());

  assert.ok(event);
  assert.equal(event.kind, "poll");
  assert.equal(event.title, "alors");
  assert.equal(event.status, "active");
  assert.equal(event.winningOutcomeId, null);
  assert.deepEqual(event.totals, [
    { id: "ed4f751e-1ee1-4631-bff6-7b49ba350134", points: 140, users: 120 },
    { id: "aa000000-1ee1-4631-bff6-7b49ba350135", points: 60, users: 60 },
  ]);
});

test("an open poll already knows the second it will close", () => {
  // duration_seconds is fixed at creation, so the card can close on time even
  // if the final frame never arrives — a reconnect, or the recording ending.
  const event = parseTwitchPoll(twitchPoll());

  assert.equal(event?.endedAtMs, Date.parse("2026-07-26T21:26:01.306232507Z") + 60_000);
  // Still open: the scheduled end is where the card closes, not a claim that
  // it has closed.
  assert.equal(event?.status, "active");
});

test("a completed poll closes on its real end time and invents no winner", () => {
  const event = parseTwitchPoll(
    twitchPoll({ status: "COMPLETED", ended_at: "2026-07-26T21:26:45.000Z" }),
  );

  assert.equal(event?.status, "resolved");
  assert.equal(event?.winningOutcomeId, null);
  // The real end wins over the scheduled one — the streamer closed it early.
  assert.equal(event?.endedAtMs, Date.parse("2026-07-26T21:26:45.000Z"));
});

test("a poll pulled by moderation is cancelled, not completed", () => {
  assert.equal(parseTwitchPoll(twitchPoll({ status: "MODERATED" }))?.status, "cancelled");
  assert.equal(parseTwitchPoll(twitchPoll({ status: "ARCHIVED" }))?.status, "cancelled");
});

/**
 * Verbatim from a live Kick poll on the chatroom socket. Note the absence of
 * any id, start time or status — everything below is reconstructed from these
 * five fields.
 */
function kickPoll(remaining: number, votes: [number, number] = [12, 7]) {
  return {
    poll: {
      title: "Let's all agree that weapon durability is dog shit",
      options: [
        { id: 0, label: "Yes", votes: votes[0] },
        { id: 1, label: "No", votes: votes[1] },
      ],
      duration: 30,
      remaining,
      result_display_duration: 15,
    },
  };
}

test("a Kick poll's start is reconstructed from the countdown", () => {
  const nowMs = Date.parse("2026-07-26T21:00:30.000Z");
  const event = parseKickPoll(kickPoll(20), { providerEventId: "kick-poll:120", nowMs });

  assert.ok(event);
  assert.equal(event.platform, "kick");
  assert.equal(event.status, "active");
  // 30s long with 20s left means it opened 10s ago.
  assert.equal(event.createdAtMs, nowMs - 10_000);
  assert.deepEqual(event.totals, [
    { id: "0", points: 12, users: 12 },
    { id: "1", points: 7, users: 7 },
  ]);
});

test("a Kick poll knows when it ends even though Kick never says so", () => {
  // Verified against a live poll: the countdown runs 30…1 and simply stops.
  // There is no `remaining: 0` frame, so an end derived from one would never
  // arrive and the card would hang open for the rest of the recording.
  const nowMs = Date.parse("2026-07-26T21:00:59.000Z");
  const event = parseKickPoll(kickPoll(1, [220, 24]), {
    providerEventId: "kick-poll:120",
    nowMs,
  });

  assert.ok(event);
  assert.equal(event.createdAtMs, nowMs - 29_000);
  assert.equal(event.endedAtMs, event.createdAtMs + 30_000);
  // One second still to run at the moment of this frame.
  assert.equal(event.status, "active");
});

test("a Kick poll with no duration gets no invented end time", () => {
  const nowMs = Date.parse("2026-07-26T21:00:00.000Z");
  const event = parseKickPoll(
    { poll: { title: "?", duration: 0, remaining: 0, options: [{ id: 0, label: "A", votes: 1 }] } },
    { providerEventId: "kick-poll:0", nowMs },
  );

  assert.equal(event?.endedAtMs, null);
  assert.equal(event?.status, "active");
});

test("an event already running before the recorder attached keeps a negative offset", () => {
  // Clamping to zero would claim it started exactly when we did.
  const anchorMs = Date.parse("2026-07-26T21:10:00.000Z");
  assert.equal(toRelativeSec(Date.parse("2026-07-26T21:08:30.000Z"), anchorMs), -90);
  assert.equal(toRelativeSec(Date.parse("2026-07-26T21:12:00.000Z"), anchorMs), 120);
});
