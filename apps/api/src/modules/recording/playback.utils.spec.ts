import assert from "node:assert/strict";
import test from "node:test";
import { computeSessionChatOffsetSec, parseMediaRange } from "./playback.utils";

test("aligns chat zero with media rewound before capture startup", () => {
  const createdAt = new Date("2026-07-10T10:01:00.000Z");
  const offset = computeSessionChatOffsetSec({
    savedChatOffsetSec: null,
    createdAt,
    captureEndedAt: new Date("2026-07-10T10:10:00.000Z"),
    durationSec: 570,
  });

  assert.equal(offset, 30);
});

test("prefers an explicitly saved chat offset", () => {
  const offset = computeSessionChatOffsetSec({
    savedChatOffsetSec: -12,
    createdAt: new Date(0),
    captureEndedAt: null,
    durationSec: null,
  });

  assert.equal(offset, -12);
});

test("parses normal, open-ended and suffix media ranges safely", () => {
  assert.deepEqual(parseMediaRange("bytes=10-19", 100), { start: 10, end: 19 });
  assert.deepEqual(parseMediaRange("bytes=90-", 100), { start: 90, end: 99 });
  assert.deepEqual(parseMediaRange("bytes=-10", 100), { start: 90, end: 99 });
  assert.equal(parseMediaRange("bytes=200-300", 100), null);
  assert.equal(parseMediaRange("bytes=nope", 100), null);
});
