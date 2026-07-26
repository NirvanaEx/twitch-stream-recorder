import assert from "node:assert/strict";
import test from "node:test";
import { StreamEventsService } from "./stream-events.service";
import type { NormalizedStreamEvent } from "./stream-events.utils";

/**
 * The write rate is the point of these tests.
 *
 * An open prediction pushes a fresh payload roughly once a second for as long
 * as it runs. Persisting each one would cost thousands of writes to describe a
 * single card, on a box where Postgres shares a small VPS with the recorder —
 * so what is asserted here is mostly what does NOT get written.
 */

type Counts = { upserts: number; points: number };

function build() {
  const counts: Counts = { upserts: 0, points: 0 };
  const pointRows: Array<{ relativeTimeSec: number; status: string; totalsJson: string }> = [];

  const prisma = {
    streamEvent: {
      upsert: async () => {
        counts.upserts += 1;
        return { id: "row1" };
      },
    },
    streamEventPoint: {
      create: async ({ data }: { data: any }) => {
        counts.points += 1;
        pointRows.push(data);
        return data;
      },
    },
  };

  const service = new StreamEventsService(prisma as never);
  return { service, counts, pointRows };
}

function event(overrides: Partial<NormalizedStreamEvent> = {}): NormalizedStreamEvent {
  return {
    platform: "twitch",
    kind: "prediction",
    providerEventId: "evt-1",
    title: "Who wins?",
    status: "active",
    createdAtMs: 1_000_000,
    lockedAtMs: null,
    endedAtMs: null,
    outcomes: [
      { id: "a", title: "Yes", color: "BLUE", badgeVersion: "blue-1" },
      { id: "b", title: "No", color: "PINK", badgeVersion: "pink-2" },
    ],
    totals: [
      { id: "a", points: 100, users: 1 },
      { id: "b", points: 50, users: 1 },
    ],
    winningOutcomeId: null,
    ...overrides,
  };
}

test("a repeated frame that changes nothing costs no database write at all", async () => {
  const { service, counts } = build();
  const input = { sessionId: "s1", anchorMs: Date.now() };

  await service.record({ ...input, event: event() });
  const afterFirst = { ...counts };

  // Twitch re-sends the same payload constantly while a prediction is open.
  for (let i = 0; i < 20; i += 1) {
    await service.record({ ...input, event: event() });
  }

  assert.equal(afterFirst.upserts, 1);
  assert.equal(afterFirst.points, 1);
  assert.equal(counts.upserts, 1, "the definition never changed — no further upserts");
  assert.equal(counts.points, 1, "the totals never moved — no further samples");
});

test("a status change is always recorded, however soon after the last sample", async () => {
  const { service, counts, pointRows } = build();
  const input = { sessionId: "s1", anchorMs: Date.now() };

  await service.record({ ...input, event: event() });
  // Immediately after — far inside the sampling interval. This is the frame the
  // replay uses to say "bets closed" at the right second, so it cannot wait.
  await service.record({
    ...input,
    event: event({ status: "locked", lockedAtMs: Date.now() }),
  });

  assert.equal(counts.points, 2);
  assert.deepEqual(
    pointRows.map((row) => row.status),
    ["active", "locked"],
  );
});

test("moving totals inside the sampling interval do not add a row", async () => {
  const { service, counts } = build();
  const input = { sessionId: "s1", anchorMs: Date.now() };

  await service.record({ ...input, event: event() });
  for (let i = 1; i <= 10; i += 1) {
    await service.record({
      ...input,
      event: event({
        totals: [
          { id: "a", points: 100 + i, users: 1 },
          { id: "b", points: 50, users: 1 },
        ],
      }),
    });
  }

  // The definition is unchanged and under five seconds have passed, so the
  // ticking numbers are dropped rather than written ten times.
  assert.equal(counts.points, 1);
  assert.equal(counts.upserts, 1);
});

test("a definition change is written even when no sample is due", async () => {
  const { service, counts } = build();
  const input = { sessionId: "s1", anchorMs: Date.now() };

  await service.record({ ...input, event: event() });
  // Same status and same totals, but the streamer renamed the prediction.
  await service.record({ ...input, event: event({ title: "Who wins THIS one?" }) });

  assert.equal(counts.upserts, 2);
  assert.equal(counts.points, 1, "nothing about the totals changed");
});

test("a failing write is swallowed — bookkeeping never kills a recording", async () => {
  const prisma = {
    streamEvent: {
      upsert: async () => {
        throw new Error("database is down");
      },
    },
    streamEventPoint: { create: async () => ({}) },
  };
  const service = new StreamEventsService(prisma as never);

  await service.record({ sessionId: "s1", anchorMs: Date.now(), event: event() });
});

test("forgetting one session leaves another session's throttling intact", async () => {
  const { service, counts } = build();
  const anchorMs = Date.now();

  await service.record({ sessionId: "s1", anchorMs, event: event() });
  await service.record({ sessionId: "s2", anchorMs, event: event() });
  assert.equal(counts.upserts, 2);

  service.forget("s1");

  // s1 lost its state and re-upserts; s2 still remembers and stays quiet.
  await service.record({ sessionId: "s1", anchorMs, event: event() });
  await service.record({ sessionId: "s2", anchorMs, event: event() });

  assert.equal(counts.upserts, 3);
});
