// React DOM regression harness. Synthetic layout metrics stand in for layout,
// while state/effects, event handling, portals and rendering use real React.
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('<div id="root"></div>', { url: 'https://stream.neyron.site' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Event', 'MouseEvent']) global[key] = key === 'window' ? window : window[key];
global.React = require('react');
global.IS_REACT_ACT_ENVIRONMENT = true;
const { act } = React;
const { createRoot } = require('react-dom/client');
const callbacks = [];
global.ResizeObserver = class {
  constructor(callback) { this.callback = callback; callbacks.push(callback); }
  observe() {} disconnect() { callbacks.splice(callbacks.indexOf(this.callback), 1); }
};
let historyCalls = [];
global.fetch = async (url) => {
  if (url.includes('/history')) {
    historyCalls.push(url);
    return { ok: true, json: async () => ({ sessions: 2, truncated: false, messages: [
      { id: 'past', historySessionId: 'yesterday', authorLogin: 'viewer', textRaw: 'past broadcast message', relativeTimeSec: 90, messageTimestamp: '2026-09-07T10:00:00Z' },
    ] }) };
  }
  return { ok: true, json: async () => ({}) };
};
const { AppProviders } = require('../apps/web/app/providers.tsx');
const { ChatReplay } = require('../apps/web/app/components/ChatReplay.tsx');
const root = createRoot(document.getElementById('root'));
const messages = Array.from({ length: 240 }, (_, i) => ({ id: String(i), authorLogin: i % 2 ? 'VIEWER' : 'viewer', relativeTimeSec: i, textRaw: `message ${i}` }));
const video = document.createElement('video');
Object.defineProperty(video, 'duration', { value: 1000 });
video.currentTime = 210;
const render = async () => act(async () => {
  root.render(React.createElement(AppProviders, null, React.createElement(ChatReplay, {
    staticData: { messages, emotes: null }, videoElement: video, isLive: false, historySessionId: 'current',
  })));
});
(async () => {
  await render();
  const list = document.querySelector('.chat-list');
  let height = 4000, top = 0;
  Object.defineProperties(list, {
    scrollHeight: { get: () => height }, clientHeight: { get: () => 400 },
    scrollTop: { get: () => top, set: value => { top = Math.max(0, Math.min(value, height - 400)); } },
  });
  const resize = () => callbacks.forEach(callback => callback());
  const scroll = () => list.dispatchEvent(new Event('scroll', { bubbles: true }));
  const pill = () => document.querySelector('.chat-jump-pill');
  await act(async () => resize());
  assert.equal(top, 3600);
  // Late emote increases content height and fires scroll before resize.
  height += 150;
  await act(async () => scroll());
  assert.equal(pill(), null, 'content growth must not show the paused pill');
  await act(async () => resize());
  assert.equal(top, 3750);
  // Real user scrolling up pauses, and resize/new messages respect the reader.
  top -= 300;
  await act(async () => scroll());
  assert.ok(pill(), 'manual scroll must pause');
  const pausedTop = top;
  height += 100;
  await act(async () => { resize(); video.currentTime = 220; video.dispatchEvent(new Event('timeupdate')); });
  assert.equal(top, pausedTop);
  assert.ok(pill());
  await act(async () => pill().click());
  assert.equal(pill(), null);
  assert.equal(top, height - 400);
  // Rolling 200-message window and a height decrease remain pinned.
  height -= 500;
  await act(async () => { video.currentTime = 235; video.dispatchEvent(new Event('timeupdate')); });
  await act(async () => scroll());
  assert.equal(pill(), null);
  assert.equal(document.querySelectorAll('.chat-author').length, 200);
  await act(async () => document.querySelector('.chat-author').click());
  assert.ok(document.querySelector('[role="dialog"]'));
  assert.ok(document.querySelector('[role="dialog"]').textContent.includes('past broadcast message') === false, 'history is paginated after current messages');
  assert.equal(document.querySelectorAll('.chat-user-card__row').length, 100);
  const search = document.querySelector('.chat-user-card__search');
  // React's native setter path emulates an input edit without bypassing state.
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(search, 'past broadcast');
    search.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.ok(document.querySelector('[role="dialog"]').textContent.includes('past broadcast message'));
  assert.equal(document.querySelectorAll('.chat-user-card__row').length, 1);
  assert.equal(document.querySelectorAll('.chat-user-card__row button').length, 0, 'past messages cannot seek current video');
  assert.ok(historyCalls[0].includes('/chat/users/'));
  // A body portal disappears behind the browser fullscreen top layer.
  // Move the existing card into/out of that layer without losing its search.
  const fullscreenRoot = document.createElement('div');
  document.body.append(fullscreenRoot);
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: fullscreenRoot });
  await act(async () => document.dispatchEvent(new Event('fullscreenchange')));
  assert.ok(fullscreenRoot.contains(document.querySelector('.chat-user-card')), 'history must be inside the fullscreen element');
  assert.equal(document.querySelector('.chat-user-card__search').value, 'past broadcast');
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
  await act(async () => document.dispatchEvent(new Event('fullscreenchange')));
  assert.ok(document.querySelector('.chat-user-card').parentElement === document.body, 'restore the portal on fullscreen exit');
  fullscreenRoot.remove();
  await act(async () => document.querySelector('.chat-user-card__close').click());
  await act(async () => root.render(React.createElement(AppProviders, null, React.createElement(ChatReplay, {
    staticData: { messages, emotes: null }, videoElement: video, isLive: false, archiveId: 'admin-archive',
  }))));
  await act(async () => document.querySelector('.chat-author').click());
  assert.ok(historyCalls.some(url => url.includes('/streams/admin-archive/chat/users/')), 'admin archives must load earlier broadcasts too');
  await act(async () => root.unmount());
  assert.equal(callbacks.length, 0, 'resize observer is cleaned up');
  console.log('PASS: chat scrolling, history/search, fullscreen portal transitions and admin archive history');
})().catch(error => { console.error(error); process.exitCode = 1; });
