// Real React DOM effects/events with observable media commands; no network.
// NODE_PATH must include jsdom. Run: node --import tsx scripts/test-player-controls.cjs
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('<div id="root"></div>', { url: 'https://stream.neyron.site' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLMediaElement', 'Event', 'MouseEvent', 'KeyboardEvent']) {
  global[key] = key === 'window' ? window : window[key];
}
global.React = require('react');
global.IS_REACT_ACT_ENVIRONMENT = true;
global.fetch = async () => ({ ok: true, json: async () => ({}) });
const { act } = React;
const { createRoot } = require('react-dom/client');
const { AppProviders } = require('../apps/web/app/providers.tsx');
const { VideoPlayer } = require(process.env.PLAYER_UNDER_TEST || '../apps/web/app/components/VideoPlayer.tsx');
const states = new WeakMap();
const state = element => {
  if (!states.has(element)) states.set(element, { paused: true, time: 0 });
  return states.get(element);
};
const commands = [];
Object.defineProperties(window.HTMLMediaElement.prototype, {
  paused: { get() { return state(this).paused; }, configurable: true },
  duration: { get() { return 600; }, configurable: true },
  readyState: { get() { return 4; }, configurable: true },
  currentTime: {
    get() { return state(this).time; }, configurable: true,
    set(time) {
      state(this).time = time;
      commands.push(['seek', time]);
      for (const event of ['seeking', 'timeupdate', 'seeked']) this.dispatchEvent(new Event(event));
    },
  },
});
window.HTMLMediaElement.prototype.play = async function () {
  commands.push(['play']); state(this).paused = false;
  this.dispatchEvent(new Event('play')); this.dispatchEvent(new Event('playing'));
};
window.HTMLMediaElement.prototype.pause = function () {
  commands.push(['pause']); state(this).paused = true; this.dispatchEvent(new Event('pause'));
};
window.HTMLMediaElement.prototype.load = () => {};
const root = createRoot(document.getElementById('root'));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const render = async (src = '/test.mp4') => act(async () => root.render(
  React.createElement(React.StrictMode, null, React.createElement(AppProviders, null,
    React.createElement(VideoPlayer, { src, mode: 'normal', onModeChange: () => {} }))),
));
const click = async element => act(async () => element.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 })));
const key = async (value, repeat = false, target = window) => {
  const event = new KeyboardEvent('keydown', { key: value, repeat, bubbles: true, cancelable: true });
  await act(async () => target.dispatchEvent(event));
  return event;
};
const pointer = async (element, type, x, extras = {}) => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: 20 });
  Object.defineProperties(event, Object.fromEntries(Object.entries({ pointerType: 'touch', pointerId: 1, isPrimary: true, ...extras }).map(([k,v]) => [k,{value:v}])));
  await act(async () => element.dispatchEvent(event));
};
const tap = async (video, x) => {
  await pointer(video, 'pointerdown', x);
  await pointer(video, 'pointerup', x);
  await click(video); // Browser compatibility click must not repeat the action.
};

(async () => {
  await render();
  const video = document.querySelector('video');
  video.getBoundingClientRect = () => ({ left: 0, width: 900 });
  const button = prefix => document.querySelector(`button[title^="${prefix}"]`);

  // This reproduced the reported double flash on the deployed version:
  // Date.now() in the React key replaced the icon at every timeupdate.
  await click(button('Воспроизвести'));
  assert.deepEqual(commands.splice(0), [['play']]);
  const firstHint = document.querySelector('.vp__center-hint');
  assert.ok(firstHint);
  await act(async () => {
    await wait(15);
    state(video).time = 10;
    for (const event of ['timeupdate', 'progress', 'durationchange', 'volumechange']) video.dispatchEvent(new Event(event));
  });
  assert.ok(document.querySelector('.vp__center-hint') === firstHint, 'one command keeps one animation across media updates');
  assert.deepEqual(commands.splice(0), [], 'media events do not issue another command');

  await pointer(video, 'pointerup', 450, { pointerType: 'mouse' });
  await click(video);
  assert.deepEqual(commands.splice(0), [['pause']], 'mouse surface pauses exactly once');
  assert.equal(document.querySelector('.vp__center-hint').dataset.action, 'pause');
  await click(video);
  assert.deepEqual(commands.splice(0), [['play']], 'mouse surface resumes exactly once');

  await click(button('Назад 5'));
  assert.deepEqual(commands.splice(0), [['seek', 5]], 'toolbar seek does not bubble into surface playback');
  await key('ArrowRight');
  assert.deepEqual(commands.splice(0), [['seek', 10]], 'single key seeks once');
  await key('ArrowRight', true);
  assert.deepEqual(commands.splice(0), [['seek', 15]], 'held seek keys remain usable');
  await key('k');
  await key('k', true); await key('k', true);
  assert.deepEqual(commands.splice(0), [['pause']], 'holding K never oscillates playback');
  const space = await key(' ', false, button('Воспроизвести'));
  assert.equal(space.defaultPrevented, true, 'suppress the focused button native Space click');
  await key(' ', true);
  assert.deepEqual(commands.splice(0), [['play']]);
  const input = document.createElement('input'); document.body.append(input);
  await key('k', false, input);
  assert.deepEqual(commands.splice(0), [], 'typing does not control playback');
  input.remove();

  const hint = document.querySelector('.vp__center-hint');
  await act(async () => {
    await wait(30); video.dispatchEvent(new Event('timeupdate'));
  });
  assert.ok(document.querySelector('.vp__center-hint') === hint, 'the active feedback node stays mounted');
  await act(async () => wait(460));
  assert.equal(document.querySelector('.vp__center-hint'), null, 'feedback disappears without another action');

  await tap(video, 450);
  assert.deepEqual(commands.splice(0), [], 'touch waits for double-tap detection, compatibility click is ignored');
  await act(async () => wait(370));
  assert.deepEqual(commands.splice(0), [['pause']], 'single tap pauses once');
  await tap(video, 450); await tap(video, 450);
  assert.deepEqual(commands.splice(0), [['play']], 'double tap in center toggles once');
  await act(async () => wait(370));
  assert.deepEqual(commands.splice(0), [], 'no leftover single-tap timer');

  await tap(video, 100); await tap(video, 100);
  assert.deepEqual(commands.splice(0), [['seek', 10]], 'left double tap seeks without pausing first');
  await tap(video, 800); await tap(video, 800);
  assert.deepEqual(commands.splice(0), [['seek', 15]], 'right double tap seeks once');

  await pointer(video, 'pointerdown', 450);
  await pointer(video, 'pointermove', 500);
  await pointer(video, 'pointermove', 450);
  await pointer(video, 'pointerup', 450); await click(video);
  await act(async () => wait(370));
  assert.deepEqual(commands.splice(0), [], 'swipe returning to its origin is not a tap');
  await pointer(video, 'pointerdown', 450);
  await pointer(video, 'pointerup', 500); await click(video);
  await act(async () => wait(370));
  assert.deepEqual(commands.splice(0), [], 'movement is rejected even without an intermediate pointermove');
  await pointer(video, 'pointerdown', 450);
  await pointer(video, 'pointercancel', 450);
  await pointer(video, 'pointerup', 450); await click(video);
  await act(async () => wait(370));
  assert.deepEqual(commands.splice(0), [], 'cancelled gestures never pause');

  await tap(video, 450);
  await render('/another.mp4');
  await act(async () => wait(370));
  assert.deepEqual(commands.splice(0), [], 'a tap cannot affect the next recording');
  await act(async () => root.unmount());
  console.log('PASS: stable one-shot animation, mouse play/pause, exact seek counts, keyboard repeat/Space, touch compatibility events, double-taps, swipe/cancel, source cleanup');
})().catch(error => { console.error(error); process.exit(1); });
