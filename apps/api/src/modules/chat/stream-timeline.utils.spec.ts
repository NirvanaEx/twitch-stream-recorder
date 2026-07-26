import assert from "node:assert/strict";
import test from "node:test";
import { buildStreamTimeline, type MetaPoint } from "./stream-timeline.utils";

function point(
  relativeTimeSec: number,
  categoryName: string | null,
  title: string | null,
  viewerCount: number | null = null,
): MetaPoint {
  return { relativeTimeSec, categoryName, title, viewerCount };
}

test("consecutive samples of one category collapse into a single segment", () => {
  const timeline = buildStreamTimeline([
    point(0, "Just Chatting", "start"),
    point(60, "Just Chatting", "start"),
    point(120, "Just Chatting", "start"),
    point(180, "GTA V", "start"),
    point(240, "GTA V", "start"),
  ]);

  assert.deepEqual(timeline.segments, [
    { categoryName: "Just Chatting", startSec: 0, endSec: 180 },
    // Still in this category when the recording stopped — the end is unknown,
    // and the strip stretches it to the end rather than inventing a boundary.
    { categoryName: "GTA V", startSec: 180, endSec: null },
  ]);
});

test("a category switched away from and back gets two separate segments", () => {
  const timeline = buildStreamTimeline([
    point(0, "Just Chatting", "t"),
    point(60, "GTA V", "t"),
    point(120, "Just Chatting", "t"),
  ]);

  assert.equal(timeline.segments.length, 3);
  assert.deepEqual(
    timeline.segments.map((s) => s.categoryName),
    ["Just Chatting", "GTA V", "Just Chatting"],
  );
});

test("titles are recorded only where they actually change", () => {
  const timeline = buildStreamTimeline([
    point(0, "Just Chatting", "first title"),
    point(60, "Just Chatting", "first title"),
    point(120, "Just Chatting", "renamed"),
    point(180, "Just Chatting", "renamed"),
  ]);

  assert.deepEqual(timeline.titles, [
    { atSec: 0, title: "first title" },
    { atSec: 120, title: "renamed" },
  ]);
});

test("viewer stats ignore samples that carry no count", () => {
  const timeline = buildStreamTimeline([
    point(0, "A", "t", 100),
    point(60, "A", "t", null),
    point(120, "A", "t", 300),
    point(180, "A", "t", 200),
  ]);

  assert.equal(timeline.peakViewers, 300);
  // (100 + 300 + 200) / 3 — the null sample must not drag the mean down.
  assert.equal(timeline.averageViewers, 200);
});

test("out-of-order input is sorted before anything is derived", () => {
  const timeline = buildStreamTimeline([
    point(120, "GTA V", "t"),
    point(0, "Just Chatting", "t"),
    point(60, "Just Chatting", "t"),
  ]);

  assert.deepEqual(
    timeline.segments.map((s) => [s.categoryName, s.startSec]),
    [
      ["Just Chatting", 0],
      ["GTA V", 120],
    ],
  );
});

test("an empty series produces an empty timeline, not a crash", () => {
  const timeline = buildStreamTimeline([]);

  assert.deepEqual(timeline.segments, []);
  assert.deepEqual(timeline.titles, []);
  assert.equal(timeline.peakViewers, null);
  assert.equal(timeline.averageViewers, null);
});
