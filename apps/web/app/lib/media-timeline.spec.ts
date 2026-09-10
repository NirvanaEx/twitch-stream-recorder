import assert from "node:assert/strict";
import test from "node:test";
import { advanceChatTail, chatTimeAtMedia, mediaTimeAtChat, validatedMediaTimeline, type MediaTimeline } from "./media-timeline";

const timeline: MediaTimeline = {
  version: 1, captureAnchorMs: 100000,
  points: [{ mediaSec: 0, wallClockMs: 80000 }, { mediaSec: 60, wallClockMs: 160000 }],
};

test("HLS rewind and source gaps use the video clock without stretching chat", () => {
  assert.equal(chatTimeAtMedia(30, timeline), 10);
  assert.equal(chatTimeAtMedia(59, timeline), 39);
  assert.equal(chatTimeAtMedia(60, timeline), 60);
  assert.equal(chatTimeAtMedia(61, timeline), 61);
  assert.equal(mediaTimeAtChat(50, timeline), 60); // message during missing video
  assert.equal(mediaTimeAtChat(61, timeline), 61);
});

test("chat extends beyond media and supports negative pre-roll positions", () => {
  assert.equal(mediaTimeAtChat(-30, timeline), -10);
  assert.equal(mediaTimeAtChat(180, timeline), 180);
  assert.equal(chatTimeAtMedia(180, timeline), 180);
});

test("legacy recordings and part-relative offsets remain compatible", () => {
  assert.equal(chatTimeAtMedia(600 + 30 - 21), 609);
  assert.equal(mediaTimeAtChat(609) - 600 + 21, 30);
});

test("post-stream clock follows playback rate and stops at the last message", () => {
  assert.equal(advanceChatTail(120, 2, 125, 2), 124);
  assert.equal(advanceChatTail(124, 30, 125, 2), 125);
  assert.equal(advanceChatTail(120, -5, 125, 1), 120);
});

test("malformed clocks in an imported bundle fall back without crashing playback", () => {
  assert.equal(validatedMediaTimeline({ version: 1, points: [null] }), null);
  assert.equal(validatedMediaTimeline({ ...timeline, points: [...timeline.points].reverse() }), null);
  assert.equal(validatedMediaTimeline(timeline), timeline);
});
