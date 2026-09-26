const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('<div id="root"></div>');
global.window = window; global.document = window.document;
global.React = require('react'); global.IS_REACT_ACT_ENVIRONMENT = true;
const { act } = React;
const { createRoot } = require('react-dom/client');
const { useTimelinePreload, previewPosition } = require('../apps/web/app/lib/timeline-preload.ts');
const { TimelinePreview } = require('../apps/web/app/components/TimelinePreview.tsx');
const frames = { baseUrl: '/test', count: 1540, intervalSec: 10,
  sprites: { version: 1, columns: 10, rows: 10, width: 320, height: 180, count: 16 } };
assert.deepEqual(previewPosition(frames, 990), { index: 99, sheet: 0, column: 9, row: 9 });
assert.deepEqual(previewPosition(frames, 1000), { index: 100, sheet: 1, column: 0, row: 0 });
assert.deepEqual(previewPosition(frames, 15400), { index: 1539, sheet: 15, column: 9, row: 3 });
const requests = [], created = [], revoked = [];
let active = 0, maxActive = 0, loaded;
global.fetch = (url, options) => new Promise((resolve, reject) => {
  active++; maxActive = Math.max(maxActive, active);
  const request = { url, signal: options.signal, priority: options.priority, cache: options.cache,
    finish(status = 200) { if (request.done) return; request.done = true; active--; resolve(new Response(new Blob(['jpeg']), { status })); } };
  options.signal.addEventListener('abort', () => {
    if (!request.done) { request.done = true; active--; reject(new Error('aborted')); }
  }, { once: true });
  requests.push(request);
});
URL.createObjectURL = () => { const url = `blob:test-${created.length}`; created.push(url); return url; };
URL.revokeObjectURL = url => revoked.push(url);
function Harness({ data }) { loaded = useTimelinePreload(data); return null; }
const root = createRoot(document.getElementById('root'));
const flush = () => new Promise(resolve => setTimeout(resolve, 10));
(async () => {
  await act(async () => root.render(React.createElement(Harness, { data: frames })));
  assert.equal(requests.length, 2, 'starts without hover');
  assert.ok(requests.every(r => r.priority === 'low'));
  await act(async () => root.render(React.createElement(Harness, { data: { ...frames } })));
  assert.equal(requests.length, 2, 'unchanged props do not restart downloads');
  // One server error retries without cancelling the other downloads.
  await act(async () => { requests[0].finish(503); await flush(); });
  assert.equal(requests[2].cache, 'reload', 'retry bypasses cached errors');
  while (Object.keys(loaded).length < 16) {
    await act(async () => { requests.filter(r => !r.done).forEach(r => r.finish()); await flush(); });
  }
  assert.equal(maxActive, 2);
  assert.equal(requests.length, 17, '16 sheets plus one retry');
  assert.ok(requests.every(r => /sprite-\d{6}\.webp$/.test(r.url)));
  const local = loaded;
  await act(async () => root.render(React.createElement(TimelinePreview, { src: '/video', time: 1000, frames, preloaded: local })));
  const img = document.querySelector('img');
  assert.equal(img.getAttribute('src'), local[1]);
  assert.equal(img.style.left, '0%'); assert.equal(img.style.width, '1000%');
  assert.equal(document.querySelectorAll('video').length, 0);
  assert.equal(revoked.length, 16, 'unmount releases all blob URLs');
  await act(async () => root.render(React.createElement(Harness, { data: { ...frames, baseUrl: '/other' } })));
  const pending = requests.slice(-2);
  await act(async () => root.unmount());
  assert.ok(pending.every(r => r.signal.aborted), 'navigation cancels outstanding requests');
  console.log('PASS: eager preload, two-request limit, retry, stable rerender, sheet boundaries, local hover, cleanup and cancellation');
})().catch(error => { console.error(error); process.exitCode = 1; });
