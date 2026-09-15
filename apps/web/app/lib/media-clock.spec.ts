import { test } from "node:test";
import assert from "node:assert/strict";
import { partMediaTime, partMediaTarget, partMediaDuration } from "./media-clock";
import { mediaParts, partAt } from "./seamless-media";

test("continuous media keeps chat, resume and source switches in part-local time", () => {
  const media = { currentTime: 610, duration: 1800, dataset: { continuousTimeline: "1" } } as unknown as HTMLMediaElement;
  assert.equal(partMediaTime(media, 600), 10);
  assert.equal(partMediaTarget(media, 25, 600), 625);
  assert.equal(partMediaDuration(media, 600), 1200);
  delete media.dataset.continuousTimeline;
  media.currentTime = 10; Object.defineProperty(media, "duration", { value: 300 });
  assert.equal(partMediaTime(media, 600), 10);
  assert.equal(partMediaTarget(media, 25, 600), 25);
  assert.equal(partMediaDuration(media, 600), 300);
});

test("part lookup handles boundaries, final position and continuation gaps", () => {
  const parts = mediaParts([{src:"1", durationSec:300},{src:"2", durationSec:300},{src:"3",durationSec:200,startOffsetSec:620}]);
  assert.deepEqual(parts.map(p=>[p.start,p.end]),[[0,300],[300,600],[620,820]]);
  assert.equal(partAt(parts,299.5),0);
  assert.equal(partAt(parts,300),1);
  assert.equal(partAt(parts,610),2);
  assert.equal(partAt(parts,820),2);
});
