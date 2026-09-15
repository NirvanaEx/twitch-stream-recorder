import assert from "node:assert/strict";
import { after, test } from "node:test";
import { JSDOM } from "jsdom";
import { attachMediaRecovery } from "./media-recovery";

const dom = new JSDOM("<!doctype html><body></body>");
after(() => dom.window.close());
function fakeClock() {
  let now = 0, sequence = 0;
  const tasks = new Map<number, { at: number; period: number; callback: () => void }>();
  const add = (callback: () => void, ms: number, period = 0) => {
    const id = ++sequence;
    tasks.set(id, { at: now + ms, period, callback });
    return id;
  };
  return {
    now: () => now,
    setTimeout: (fn: () => void, ms: number) => add(fn, ms),
    clearTimeout: (id: number) => { tasks.delete(id); },
    setInterval: (fn: () => void, ms: number) => add(fn, ms, ms),
    clearInterval: (id: number) => { tasks.delete(id); },
    advance(ms: number) {
      const end = now + ms;
      for (;;) {
        const next = [...tasks.entries()].filter(([, task]) => task.at <= end)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        const [id, task] = next;
        now = task.at;
        if (task.period) task.at += task.period;
        else tasks.delete(id);
        task.callback();
      }
      now = end;
    },
    count: () => tasks.size,
  };
}
function setup(paused = false) {
  const clock = fakeClock();
  const media = dom.window.document.createElement("video");
  const state = { paused, seeking: false, end: 123, loads: 0, plays: 0, failures: 0, immediate: false };
  const event = (name: string) => media.dispatchEvent(new dom.window.Event(name));
  media.currentTime = 123;
  media.playbackRate = 1.5;
  Object.defineProperties(media, {
    paused: { get: () => state.paused }, seeking: { get: () => state.seeking },
    buffered: { get: () => ({ length: 1, start: () => 0, end: () => state.end }) },
  });
  media.load = () => {
    state.loads++;
    media.currentTime = 0;
    media.playbackRate = 1;
    state.paused = true;
    event("pause"); // native load may pause the media internally
    if (state.immediate) event("loadedmetadata");
  };
  media.play = async () => { state.plays++; state.paused = false; event("play"); };
  const recovery = attachMediaRecovery(media, { clock,
    onRecovering: () => {}, onFailure: () => { state.failures++; },
  });
  return { clock, media, state, event, recovery };
}

test("no-data stall without MediaError reloads and preserves position and speed", () => {
  const s = setup();
  s.event("waiting");
  s.clock.advance(17_500);
  assert.equal(s.state.loads, 1);
  s.event("loadedmetadata");
  assert.equal(s.media.currentTime, 123);
  assert.equal(s.media.playbackRate, 1.5);
  assert.equal(s.state.plays, 1);
  s.recovery.dispose();
});

test("paused playback and a full media buffer do not trigger network reloads", () => {
  const paused = setup(true);
  paused.event("waiting");
  paused.clock.advance(120_000);
  assert.equal(paused.state.loads, 0);
  paused.recovery.dispose();
  const buffered = setup();
  buffered.state.end = 150;
  buffered.event("waiting");
  buffered.clock.advance(120_000);
  assert.equal(buffered.state.loads, 0);
  buffered.recovery.dispose();
});

test("new bytes or playback progress postpone recovery", () => {
  const s = setup();
  for (let i = 0; i < 40; i++) {
    s.media.currentTime += 0.5;
    s.state.end = s.media.currentTime + 0.5;
    s.clock.advance(1000);
  }
  assert.equal(s.state.loads, 0);
  s.recovery.dispose();
});

test("a user pause during backoff prevents an automatic restart", () => {
  const s = setup();
  s.clock.advance(16_000);
  s.recovery.pauseRequested();
  s.state.paused = true;
  s.event("pause");
  s.clock.advance(60_000);
  assert.equal(s.state.loads, 0);
  assert.equal(s.state.plays, 0);
  s.recovery.dispose();
});

test("pause during metadata recovery restores position without resuming playback", () => {
  const s = setup();
  s.clock.advance(17_500);
  assert.equal(s.state.loads, 1);
  s.recovery.pauseRequested();
  s.event("loadedmetadata");
  assert.equal(s.media.currentTime, 123);
  assert.equal(s.state.plays, 0);
  s.recovery.dispose();
});

test("source change/unmount removes pending timers and metadata callbacks", () => {
  const s = setup();
  s.clock.advance(17_500);
  s.recovery.dispose();
  s.media.currentTime = 7; // another recording on the same element
  s.event("loadedmetadata");
  s.clock.advance(120_000);
  assert.equal(s.media.currentTime, 7);
  assert.equal(s.state.plays, 0);
  assert.equal(s.clock.count(), 0);
});

test("repeated stalls stop after four reloads even if metadata keeps failing", () => {
  const s = setup();
  s.clock.advance(150_000);
  assert.equal(s.state.loads, 4);
  assert.equal(s.state.failures, 1);
  s.recovery.retry();
  s.clock.advance(2000);
  s.event("loadedmetadata");
  assert.equal(s.media.currentTime, 123, "manual retry must retain the position across failed loads");
  assert.equal(s.media.playbackRate, 1.5);
  s.recovery.dispose();
});

test("metadata listener is installed before load, including immediate cached metadata", () => {
  const s = setup();
  s.state.immediate = true;
  s.clock.advance(17_500);
  assert.equal(s.media.currentTime, 123);
  assert.equal(s.state.plays, 1);
  s.recovery.dispose();
});
