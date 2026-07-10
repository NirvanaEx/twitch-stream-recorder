import assert from "node:assert/strict";
import test from "node:test";
import { getSessionMediaWindow, matchSessionsToVod, type VodMatchSession } from "./vod-session-match";

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
