import assert from "node:assert/strict";
import test from "node:test";
import {
  annotateBroadcastParts,
  getSessionMediaWindow,
  matchSessionsToVod,
  type VodMatchSession,
} from "./vod-session-match";

type Fixture = VodMatchSession & { id: string };

const vodStart = new Date("2026-07-10T10:00:00.000Z");

function session(
  id: string,
  captureStartSec: number,
  durationSec: number,
  broadcastStart = vodStart,
): Fixture {
  return {
    id,
    startedAt: broadcastStart,
    createdAt: new Date(vodStart.getTime() + captureStartSec * 1000 + 5_000),
    captureEndedAt: new Date(vodStart.getTime() + (captureStartSec + durationSec) * 1000),
    endedAt: new Date(vodStart.getTime() + (captureStartSec + durationSec + 90) * 1000),
    durationSec,
  };
}

test("orders restart fragments by actual media coverage, not shared Twitch startedAt", () => {
  const later = session("later", 150, 100);
  const earlier = session("earlier", 0, 120);

  const result = matchSessionsToVod([later, earlier], vodStart.toISOString(), "300");

  assert.equal(result.best?.id, "earlier");
  assert.deepEqual(result.group.map((item) => item.id), ["earlier", "later"]);
});

test("does not merge a different broadcast that happens inside a long VOD window", () => {
  const first = session("first", 0, 120);
  const differentBroadcastStart = new Date(vodStart.getTime() + 3 * 60 * 60 * 1000);
  const other = session("other", 3 * 60 * 60, 120, differentBroadcastStart);

  const result = matchSessionsToVod([other, first], vodStart.toISOString(), "21600");

  assert.deepEqual(result.group.map((item) => item.id), ["first"]);
});

test("uses capture end minus probed duration as the media start", () => {
  const item = session("rewound", 300, 90);
  item.createdAt = new Date(vodStart.getTime() + 330_000);

  const window = getSessionMediaWindow(item);

  assert.equal(window.startMs, vodStart.getTime() + 300_000);
  assert.equal(window.endMs, vodStart.getTime() + 390_000);
});

test("keeps the caller's newest fallback when Twitch metadata has no date", () => {
  const newest = session("newest", 200, 30);
  const older = session("older", 0, 30);

  const result = matchSessionsToVod([newest, older]);

  assert.equal(result.best?.id, "newest");
  assert.deepEqual(result.group.map((item) => item.id), ["newest"]);
});

test("numbers restart fragments by media order and leaves lone sessions unlabeled", () => {
  // Listing endpoints return newest-first — part numbers must not follow it.
  const third = session("third", 300, 60);
  const second = session("second", 150, 100);
  const first = session("first", 0, 120);
  const otherBroadcast = session(
    "lone",
    0,
    60,
    new Date(vodStart.getTime() + 8 * 60 * 60 * 1000),
  );

  const parts = annotateBroadcastParts([third, second, first, otherBroadcast], () => "chan");

  assert.deepEqual(parts.get("first"), { partIndex: 1, partCount: 3 });
  assert.deepEqual(parts.get("second"), { partIndex: 2, partCount: 3 });
  assert.deepEqual(parts.get("third"), { partIndex: 3, partCount: 3 });
  assert.equal(parts.get("lone"), undefined);
});

test("does not group same-time broadcasts from different channels", () => {
  const a = session("a", 0, 60);
  const b = session("b", 100, 60);

  const parts = annotateBroadcastParts([a, b], (item) => (item.id === "a" ? "one" : "two"));

  assert.equal(parts.size, 0);
});
