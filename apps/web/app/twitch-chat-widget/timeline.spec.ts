import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeChats, onVodTimeline, sessionShift, shiftMetadata } from "./timeline";

test("Twitch uses wall-clock alignment instead of the recorder's missing-packet map", () => {
  const data = {messages:[{id:"m",authorLogin:"a",textRaw:"gif",relativeTimeSec:80,deletedAtSec:90,gifs:"raw"}],emotes:null,
    mediaTimeline:{version:1 as const,captureAnchorMs:1000000,points:[{mediaSec:0,wallClockMs:1010000},{mediaSec:60,wallClockMs:1090000}]}};
  const shift = sessionShift({id:"s",recordingStartedAt:new Date(900000).toISOString()},500000,data);
  const actual = onVodTimeline(data,shift,500000);
  assert.equal(actual.mediaTimeline,null);
  assert.equal(actual.messages[0].relativeTimeSec,580);
  assert.equal(actual.messages[0].deletedAtSec,590);
  assert.equal(actual.messages[0].gifs,"raw");
});

test("metadata offsets move poll samples and results together without leaking a winner early", () => {
  const actual = shiftMetadata("public/streams/s/events", {events:[{startedAtSec:20,lockedAtSec:null,endedAtSec:60,samples:[{atSec:30,status:"active"}]}]},100);
  assert.deepEqual(actual.events[0],{startedAtSec:120,lockedAtSec:null,endedAtSec:160,samples:[{atSec:130,status:"active"}]});
});

test("merged sessions preserve distinct repeated messages and deduplicate identical stored rows", () => {
  const m = {id:"a",authorLogin:"viewer",textRaw:"same",relativeTimeSec:20};
  const merged = mergeChats([{messages:[m],emotes:null},{messages:[m,{...m,id:"b"}],emotes:null}]);
  assert.deepEqual(merged.messages.map(m=>m.id),["a","b"]);
});

test("legacy timestamps take priority over the session's estimated start", () => {
  const actual = onVodTimeline({messages:[{id:"m",authorLogin:"a",textRaw:"hi",relativeTimeSec:10,messageTimestamp:new Date(123000).toISOString()}],emotes:null},40,100000);
  assert.equal(actual.messages[0].relativeTimeSec,23);
});
