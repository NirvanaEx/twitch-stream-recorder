import assert from "node:assert/strict";
import test from "node:test";
import { buildEventReplay, type StoredEvent, type StoredEventPoint } from "./event-replay.utils";

function event(overrides: Partial<StoredEvent> = {}): StoredEvent {
  return {
    id: "evt1",
    platform: "twitch",
    kind: "prediction",
    title: "Who wins?",
    status: "resolved",
    startedAtSec: 100,
    lockedAtSec: 400,
    endedAtSec: 900,
    winningOutcomeId: "a",
    outcomesJson: JSON.stringify([
      { id: "a", title: "Yes", color: "BLUE", badgeVersion: "blue-1" },
      { id: "b", title: "No", color: "PINK", badgeVersion: "pink-2" },
    ]),
    ...overrides,
  };
}

function point(atSec: number, totals: Array<[string, number, number]>): StoredEventPoint {
  return {
    streamEventId: "evt1",
    relativeTimeSec: atSec,
    status: "active",
    totalsJson: JSON.stringify(
      totals.map(([id, points, users]) => ({ id, points, users })),
    ),
  };
}

test("samples are flattened into arrays aligned with the outcomes", () => {
  const [replay] = buildEventReplay(
    [event()],
    [
      point(120, [
        ["a", 500, 3],
        ["b", 100, 1],
      ]),
      point(200, [
        ["a", 900, 6],
        ["b", 400, 4],
      ]),
    ],
  );

  assert.equal(replay.outcomes.length, 2);
  assert.deepEqual(
    replay.samples.map((sample) => [sample.atSec, sample.points, sample.users]),
    [
      [120, [500, 100], [3, 1]],
      [200, [900, 400], [6, 4]],
    ],
  );
});

test("totals are placed by outcome id, not by the order they arrive in", () => {
  // Providers do not promise a stable outcome order between frames; indexing
  // positionally would silently swap the bars.
  const [replay] = buildEventReplay(
    [event()],
    [
      point(120, [
        ["b", 100, 1],
        ["a", 500, 3],
      ]),
    ],
  );

  assert.deepEqual(replay.samples[0].points, [500, 100]);
});

test("an unknown outcome in a sample is dropped, not shifted onto a real bar", () => {
  const [replay] = buildEventReplay(
    [event()],
    [
      point(120, [
        ["a", 500, 3],
        ["ghost", 999, 9],
      ]),
    ],
  );

  assert.deepEqual(replay.samples[0].points, [500, 0]);
});

test("samples are sorted by time even if the rows came back unordered", () => {
  const [replay] = buildEventReplay(
    [event()],
    [point(300, [["a", 3, 1]]), point(100, [["a", 1, 1]]), point(200, [["a", 2, 1]])],
  );

  assert.deepEqual(
    replay.samples.map((sample) => sample.atSec),
    [100, 200, 300],
  );
});

test("an event whose outcomes failed to parse is skipped entirely", () => {
  // Half a card is worse than none: bars with no labels tell the viewer
  // nothing and would still occupy the panel.
  assert.deepEqual(buildEventReplay([event({ outcomesJson: "not json" })], []), []);
  assert.deepEqual(buildEventReplay([event({ outcomesJson: "[]" })], []), []);
});

test("events come back in the order they appeared on the broadcast", () => {
  const replay = buildEventReplay(
    [
      event({ id: "late", startedAtSec: 900 }),
      event({ id: "early", startedAtSec: 100 }),
    ],
    [],
  );

  assert.deepEqual(
    replay.map((entry) => entry.id),
    ["early", "late"],
  );
});

test("an event with no samples still carries its definition", () => {
  // The card has to appear even if the recording stopped before the first
  // sample landed — an empty prediction is still something that happened.
  const [replay] = buildEventReplay([event()], []);

  assert.equal(replay.title, "Who wins?");
  assert.equal(replay.lockedAtSec, 400);
  assert.equal(replay.winningOutcomeId, "a");
  assert.deepEqual(replay.samples, []);
});
