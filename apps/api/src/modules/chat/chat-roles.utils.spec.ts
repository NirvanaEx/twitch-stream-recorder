import assert from "node:assert/strict";
import test from "node:test";
import {
  deletionOffsetSec,
  extractChatRoles,
  extractInlineEmotes,
  extractPredictionBet,
  resolveCaptureAnchorMs,
} from "./chat-roles.utils";

test("Twitch badge tags are flattened onto the shared roles", () => {
  const stored = JSON.stringify("moderator/1,subscriber/12");
  assert.deepEqual(extractChatRoles(stored), ["moderator", "subscriber"]);

  // founder is an early subscriber — it has to count as one, or a "highlight
  // subscribers" switch silently skips the oldest supporters. The more
  // specific badge is listed first.
  assert.deepEqual(extractChatRoles(JSON.stringify("founder/0")), ["founder", "subscriber"]);

  // partner is the closest Twitch has to "this is another streamer".
  assert.deepEqual(extractChatRoles(JSON.stringify("partner/1")), ["verified"]);

  // Rank order, not tag order: the broadcaster must not read as a plain sub.
  assert.deepEqual(extractChatRoles(JSON.stringify("subscriber/1,broadcaster/1")), [
    "broadcaster",
    "subscriber",
  ]);
});

test("Kick badges are read too — they used to be dropped entirely", () => {
  // The string parser returns null for this shape, which is exactly why the
  // web chat showed no Kick badges at all.
  const stored = JSON.stringify({
    provider: "kick",
    badges: [
      { type: "moderator", text: "Moderator", count: null, image: null },
      { type: "subscriber", text: "Subscriber", count: 12, image: null },
      { type: null, text: "OG", count: null, image: "https://kick.com/og.svg" },
    ],
  });

  assert.deepEqual(extractChatRoles(stored), ["moderator", "og", "subscriber"]);
});

test("unknown or missing badges are simply no roles", () => {
  assert.deepEqual(extractChatRoles(null), []);
  assert.deepEqual(extractChatRoles(""), []);
  assert.deepEqual(extractChatRoles("{not json"), []);
  assert.deepEqual(extractChatRoles(JSON.stringify("nonsense/1")), []);
  assert.deepEqual(extractChatRoles(JSON.stringify({ provider: "kick" })), []);
});

test("the capture anchor is recovered from the messages themselves", () => {
  const anchor = Date.UTC(2026, 6, 27, 12, 0, 0);

  const messages = [
    { messageTimestamp: new Date(anchor + 10_000), relativeTimeSec: 10 },
    { messageTimestamp: new Date(anchor + 90_000), relativeTimeSec: 90 },
  ];

  assert.equal(resolveCaptureAnchorMs(messages), anchor);

  // Kick backfills chat history from before capture started, and those rows
  // clamp to relativeTimeSec 0. Taking the first message would drag the
  // anchor minutes into the past and misplace every deletion.
  const withBackfill = [
    { messageTimestamp: new Date(anchor - 120_000), relativeTimeSec: 0 },
    ...messages,
  ];
  assert.equal(resolveCaptureAnchorMs(withBackfill), anchor);

  assert.equal(resolveCaptureAnchorMs([]), null);
});

test("a deletion is placed on the same timeline as the messages", () => {
  const anchor = Date.UTC(2026, 6, 27, 12, 0, 0);

  // Banned 5 minutes in: messages sent before that must not read as deleted
  // until the replay reaches this point.
  assert.equal(deletionOffsetSec(new Date(anchor + 300_000), anchor), 300);

  // A moderator cleaning up after the stream lands past the end — the replay
  // simply never strikes it, which is what viewers saw at the time.
  assert.equal(deletionOffsetSec(new Date(anchor + 7_200_000), anchor), 7200);

  assert.equal(deletionOffsetSec(null, anchor), null);
  assert.equal(deletionOffsetSec(new Date(anchor), null), null);
});

test("Kick inline emotes are exposed; the Twitch tag is left to its own path", () => {
  const stored = JSON.stringify({
    provider: "kick",
    emotes: [{ id: "39292", name: "catJAM", start: 6, end: 11 }],
  });

  assert.deepEqual(extractInlineEmotes(stored), [
    { id: "39292", name: "catJAM", start: 6, end: 11 },
  ]);

  // A Twitch tag is a plain string in the same column — it must not be
  // mistaken for inline emotes, it renders through the range parser instead.
  assert.deepEqual(extractInlineEmotes(JSON.stringify("25:0-4")), []);
  assert.deepEqual(extractInlineEmotes(null), []);

  // Malformed entries are dropped rather than reaching the renderer.
  const broken = JSON.stringify({
    provider: "kick",
    emotes: [
      { id: "1", name: "ok", start: 0, end: 1 },
      { id: 2, name: "bad id", start: 0, end: 1 },
      { id: "3", name: "no pos" },
    ],
  });
  assert.deepEqual(extractInlineEmotes(broken), [{ id: "1", name: "ok", start: 0, end: 1 }]);
});

/**
 * The badge pairs below are verbatim from a live channel that had a
 * ten-outcome prediction running, captured off Twitch IRC.
 */
test("the outcome someone bet on is read from the two badge tags together", () => {
  const bet = extractPredictionBet(
    JSON.stringify("predictions/blue-1,subscriber/0,bits/100"),
    JSON.stringify("predictions/PETERBOT POLLO,subscriber/1"),
  );

  assert.deepEqual(bet, { badgeVersion: "blue-1", outcomeTitle: "PETERBOT POLLO" });
});

test("an outcome title containing a slash is not truncated at it", () => {
  // Only the first slash separates the badge from its value; titles like
  // "HIGGS/CURVE" are common and splitting on every slash would eat them.
  const bet = extractPredictionBet(
    JSON.stringify("predictions/blue-7,subscriber/0"),
    JSON.stringify("predictions/HIGGS/CURVE,subscriber/1"),
  );

  assert.equal(bet?.outcomeTitle, "HIGGS/CURVE");
});

test("a bet with no stored badge-info keeps its colour but loses its label", () => {
  // Messages recorded before badge-info was captured — the chip still shows,
  // it just cannot say what the outcome was called.
  const bet = extractPredictionBet(JSON.stringify("predictions/pink-2,moments/1"), null);

  assert.deepEqual(bet, { badgeVersion: "pink-2", outcomeTitle: null });
});

test("messages from someone who did not bet carry no chip", () => {
  assert.equal(extractPredictionBet(JSON.stringify("subscriber/12,vip/1"), null), null);
  assert.equal(extractPredictionBet(null, null), null);
  // Kick badges parse to an object and have no predictions at all.
  assert.equal(
    extractPredictionBet(JSON.stringify({ provider: "kick", badges: [{ type: "moderator" }] }), null),
    null,
  );
});
