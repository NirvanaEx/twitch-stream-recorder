import assert from "node:assert/strict";
import { test } from "node:test";
import { extractEmotes, sortHistoryChronologically } from "./kick-chat.service";
import { normalizeKickTimestamp } from "./kick-public.client";

test("inline emote tokens are unwrapped into readable text", () => {
  // Kick writes emotes into the message body; stored as-is the replay would
  // show raw "[emote:39292:catJAM]" noise instead of words.
  const { text, emotes } = extractEmotes("hello [emote:39292:catJAM] world");

  assert.equal(text, "hello catJAM world");
  assert.deepEqual(emotes, [{ id: "39292", name: "catJAM", start: 6, end: 11 }]);
  // The recorded range must point at the emote inside the STORED text.
  assert.equal(text.slice(emotes[0].start, emotes[0].end + 1), "catJAM");
});

test("leading whitespace does not shift the recorded emote positions", () => {
  // The text used to be trimmed after the positions were recorded, so every
  // index was off by however many spaces the trim removed and the renderer
  // pasted the image a few characters into the wrong word.
  const { text, emotes } = extractEmotes("   hi [emote:5:PogU] there   ");

  assert.equal(text, "hi PogU there");
  assert.equal(text.slice(emotes[0].start, emotes[0].end + 1), "PogU");
});

test("several emotes keep their positions after earlier ones are rewritten", () => {
  const { text, emotes } = extractEmotes("[emote:1:aa] mid [emote:22:bbbb] end");

  assert.equal(text, "aa mid bbbb end");
  assert.equal(text.slice(emotes[0].start, emotes[0].end + 1), "aa");
  assert.equal(text.slice(emotes[1].start, emotes[1].end + 1), "bbbb");
});

test("a message that is nothing but an emote survives", () => {
  const { text, emotes } = extractEmotes("[emote:7:KEKW]");

  assert.equal(text, "KEKW");
  assert.equal(emotes.length, 1);
});

test("plain messages pass through untouched and malformed tokens are left alone", () => {
  assert.deepEqual(extractEmotes("just talking"), { text: "just talking", emotes: [] });
  assert.deepEqual(extractEmotes("[emote:oops]"), { text: "[emote:oops]", emotes: [] });
});

test("chat history is stored oldest-first so equal replay times keep chat order", () => {
  // Kick's messages endpoint returns newest-first, but backfilled rows all
  // share relativeTimeSec 0 and the replay sorts by that column alone — the
  // insertion order IS the order the viewer sees.
  const sorted = sortHistoryChronologically([
    { id: "c", created_at: "2026-07-26T08:20:05Z" },
    { id: "b", created_at: "2026-07-26T08:17:54Z" },
    { id: "a", created_at: "2026-07-26T08:10:43Z" },
  ]);

  assert.deepEqual(
    sorted.map((message) => message.id),
    ["a", "b", "c"],
  );
});

test("history entries without a readable timestamp sort last, in their own order", () => {
  const sorted = sortHistoryChronologically([
    { id: "x", created_at: undefined },
    { id: "b", created_at: "2026-07-26T08:17:54Z" },
    { id: "y", created_at: "not a date" },
    { id: "a", created_at: "2026-07-26T08:10:43Z" },
  ]);

  assert.deepEqual(
    sorted.map((message) => message.id),
    ["a", "b", "x", "y"],
  );
});

test("Kick's space-separated timestamps are read as UTC, not local time", () => {
  // "2026-07-25 21:28:33" parsed by Date() is LOCAL time — on a UTC+5 host that
  // would shift every chat message five hours off the video timeline.
  assert.equal(normalizeKickTimestamp("2026-07-25 21:28:33"), "2026-07-25T21:28:33Z");
  assert.equal(
    new Date(normalizeKickTimestamp("2026-07-25 21:28:33")!).toISOString(),
    "2026-07-25T21:28:33.000Z",
  );

  // Values that already carry a zone are left alone.
  assert.equal(
    normalizeKickTimestamp("2026-07-26T05:29:24+00:00"),
    "2026-07-26T05:29:24+00:00",
  );
  assert.equal(normalizeKickTimestamp(null), null);
});
