import assert from "node:assert/strict";
import test from "node:test";
import { measuredMediaStart, parseMediaTimeline } from "./media-timeline";
import { computeSessionChatOffsetSec } from "./playback.utils";

const clock = { version: 1, captureAnchorMs: 100000, points: [{ mediaSec: 2, wallClockMs: 82000 }] };

test("a measured clock replaces the process-exit estimate, preserving manual corrections", () => {
  const session = { createdAt: new Date(100000), captureEndedAt: new Date(200000),
    durationSec: 110, savedChatOffsetSec: null, mediaTimelineJson: JSON.stringify(clock) };
  assert.equal(computeSessionChatOffsetSec(session), 0);
  assert.equal(computeSessionChatOffsetSec({ ...session, savedChatOffsetSec: 7 }), 7);
  assert.equal(measuredMediaStart(parseMediaTimeline(session.mediaTimelineJson)!).getTime(), 80000);
});

test("invalid or non-monotonic persisted clocks never override legacy timing", () => {
  assert.equal(parseMediaTimeline("bad json"), null);
  assert.equal(parseMediaTimeline(JSON.stringify({ ...clock, points: [] })), null);
  assert.equal(parseMediaTimeline(JSON.stringify({ ...clock,
    points: [...clock.points, { mediaSec: 1, wallClockMs: 90000 }] })), null);
});
