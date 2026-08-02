import assert from "node:assert/strict";
import test from "node:test";
import {
  computeSessionChatOffsetSec,
  parseMediaRange,
  resolvePlaybackParts,
} from "./playback.utils";

function segment(index: number, overrides: Record<string, unknown> = {}) {
  return {
    index,
    localPath: null,
    archivePath: `/mnt/gdrive/twitch-recorder/session/part${index}.mp4`,
    telegramStatus: "uploaded",
    startOffsetSec: (index - 1) * 900,
    durationSec: 900,
    ...overrides,
  };
}

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

test("plays chunks off the archive drive even when Telegram also has them", () => {
  const parts = resolvePlaybackParts({
    hasSingleFile: false,
    audioOnly: false,
    telegramStatus: "uploaded",
    segments: [segment(1), segment(2), segment(3)],
    telegramParts: [
      { partIndex: 1, partCount: 3, startOffsetSec: 0, durationSec: 900 },
      { partIndex: 2, partCount: 3, startOffsetSec: 900, durationSec: 900 },
      { partIndex: 3, partCount: 3, startOffsetSec: 1800, durationSec: 900 },
    ],
  });

  assert.deepEqual(
    parts.map((part) => part.source),
    ["drive", "drive", "drive"],
  );
});

test("falls back to Telegram only for the chunks the drive no longer holds", () => {
  const parts = resolvePlaybackParts({
    hasSingleFile: false,
    audioOnly: false,
    telegramStatus: "uploaded",
    segments: [
      // Still being captured: the chunk is on the server's own disk.
      segment(1, { localPath: "/data/records/x/part1.mp4", archivePath: null }),
      segment(2),
      // Expired off the drive — the Telegram copy is what is left.
      segment(3, { archivePath: null }),
    ],
    telegramParts: [],
  });

  assert.deepEqual(
    parts.map((part) => part.source),
    ["local", "drive", "telegram"],
  );
});

test("leaves out a chunk that reached no tier at all", () => {
  const parts = resolvePlaybackParts({
    hasSingleFile: false,
    audioOnly: false,
    telegramStatus: "pending",
    segments: [segment(1), segment(2, { archivePath: null, telegramStatus: "pending" })],
    telegramParts: [],
  });

  assert.deepEqual(
    parts.map((part) => part.partIndex),
    [1],
  );
});

test("a stored single file is played whole, never as parts", () => {
  const parts = resolvePlaybackParts({
    hasSingleFile: true,
    audioOnly: false,
    telegramStatus: "uploaded",
    segments: [],
    telegramParts: [{ partIndex: 1, partCount: 2, startOffsetSec: 0, durationSec: 900 }],
  });

  assert.deepEqual(parts, []);
});

test("a recording whose file is gone is played from its Telegram parts", () => {
  const parts = resolvePlaybackParts({
    hasSingleFile: false,
    audioOnly: false,
    telegramStatus: "uploaded",
    segments: [],
    telegramParts: [
      { partIndex: 1, partCount: 2, startOffsetSec: 0, durationSec: 900 },
      { partIndex: 2, partCount: 2, startOffsetSec: 900, durationSec: 600 },
    ],
  });

  assert.deepEqual(
    parts.map((part) => `${part.partIndex}:${part.source}`),
    ["1:telegram", "2:telegram"],
  );
});

test("an upload still in flight is not offered as a source", () => {
  const parts = resolvePlaybackParts({
    hasSingleFile: false,
    audioOnly: false,
    telegramStatus: "uploading",
    segments: [],
    telegramParts: [{ partIndex: 1, partCount: 1, startOffsetSec: 0, durationSec: 900 }],
  });

  assert.deepEqual(parts, []);
});
