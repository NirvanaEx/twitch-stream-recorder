// Run with NODE_PATH pointing to jsdom and node --import tsx.
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('<div id="root"></div>', { url: 'https://stream.neyron.site' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLMediaElement', 'Event', 'MouseEvent', 'MediaError']) global[key] = key === 'window' ? window : window[key];
global.React = require('react');
global.IS_REACT_ACT_ENVIRONMENT = true;
const { act, useRef } = React;
const { createRoot } = require('react-dom/client');
const { TimelinePreview } = require('../apps/web/app/components/TimelinePreview.tsx');
const { useHlsPlayback } = require('../apps/web/app/lib/use-hls-playback.ts');
const { trackPlaybackMetrics } = require('../apps/web/app/lib/playback-metrics.ts');
const { createRefreshQueue } = require('../apps/web/app/lib/refresh-queue.ts');
const { AppProviders } = require('../apps/web/app/providers.tsx');
const { VideoPlayer } = require('../apps/web/app/components/VideoPlayer.tsx');
const root = createRoot(document.getElementById('root'));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let playCalls = 0;
window.HTMLMediaElement.prototype.play = async function () { playCalls++; };
window.HTMLMediaElement.prototype.pause = () => {};
window.HTMLMediaElement.prototype.load = () => {};
window.HTMLMediaElement.prototype.canPlayType = () => 'probably';
const render = element => act(async () => root.render(element));
function Harness() {
  const ref = useRef(null);
  const { mediaSrc } = useHlsPlayback(ref, '/original.mp4', '/pilot/index.m3u8');
  return React.createElement('video', { ref, src: mediaSrc });
}
(async () => {
  await render(React.createElement(TimelinePreview, { src: '/large.mp4', time: 10 }));
  assert.equal(document.querySelectorAll('video').length, 0, 'no eager preview video');
  await render(null);
  await act(async () => wait(280));
  assert.equal(document.querySelectorAll('video').length, 0, 'quick hover cancels loading');
  await render(React.createElement(TimelinePreview, { src: '/large.mp4', time: 10 }));
  await act(async () => wait(280));
  const preview = document.querySelector('video');
  assert.equal(preview.getAttribute('src'), '/large.mp4');
  Object.defineProperties(preview, { readyState: { value: 1 }, duration: { value: 60 } });
  await act(async () => preview.dispatchEvent(new Event('loadedmetadata')));
  assert.equal(preview.currentTime, 10, 'initial hover seek waits for metadata');
  await render(React.createElement(TimelinePreview, { src: '/large.mp4', time: 999,
    frames: { baseUrl: '/frames', intervalSec: 10, count: 52 } }));
  assert.equal(document.querySelectorAll('video').length, 0);
  assert.ok(document.querySelector('img').src.endsWith('/preview-000052.jpg'));
  await render(React.createElement(AppProviders, null, React.createElement(VideoPlayer, {
    src: '/main.mp4', mode: 'normal', onModeChange: () => {}, spoilerFree: true,
    initialRevealedSec: 30, previewFrames: { baseUrl: '/frames', intervalSec: 10, count: 52 },
  })));
  assert.equal(document.querySelectorAll('video').length, 1, 'player mounts one media element');
  const mainVideo = document.querySelector('video');
  Object.defineProperties(mainVideo, { readyState: { value: 1 }, duration: { value: 520 } });
  await act(async () => mainVideo.dispatchEvent(new Event('loadedmetadata')));
  const progress = document.querySelector('.vp__progress');
  progress.getBoundingClientRect = () => ({ left: 0, width: 1000 });
  await act(async () => progress.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientX: 950 })));
  assert.ok(document.querySelector('.vp__scrub-preview--fog'), 'hover is in unseen region');
  assert.equal(document.querySelectorAll('.vp__scrub-video').length, 0, 'spoiler fog never fetches previews');
  await render(React.createElement(Harness));
  const video = document.querySelector('video');
  assert.ok(video.src.endsWith('/pilot/index.m3u8'));
  await act(async () => { video.currentTime = 123; video.dispatchEvent(new Event('play')); video.dispatchEvent(new Event('error')); });
  assert.ok(video.src.endsWith('/original.mp4'), 'fatal HLS switches to original');
  video.currentTime = 0;
  await act(async () => video.dispatchEvent(new Event('loadedmetadata')));
  assert.equal(video.currentTime, 123, 'fallback retains timeline position');
  assert.equal(playCalls, 1, 'fallback resumes requested playback');
  await render(null);

  const media = document.createElement('video');
  Object.defineProperties(media, { paused: { value: false }, seeking: { value: false } });
  let time = 0;
  const cleanup = trackPlaybackMetrics(media, () => time);
  const event = name => media.dispatchEvent(new Event(name));
  event('play'); time = 150; event('playing');
  assert.equal(media.dataset.startupMs, '150');
  time = 1000; event('seeking'); time = 1200; event('seeked');
  assert.equal(media.dataset.seekMs, '200');
  event('waiting'); time = 1300; event('playing');
  assert.equal(media.dataset.stallCount, '1'); assert.equal(media.dataset.stallMs, '100');
  cleanup();

  let calls = 0, release, visible = true;
  const queue = createRefreshQueue(() => { calls++; return new Promise(resolve => { release = resolve; }); }, () => visible);
  for (let i = 0; i < 20; i++) queue.request();
  await wait(230); assert.equal(calls, 1, 'burst makes one refresh');
  queue.request(); queue.request(); await wait(230); assert.equal(calls, 1, 'in-flight refresh never overlaps');
  release(); await wait(230); assert.equal(calls, 2, 'changes during refresh trigger one followup');
  release(); await wait(0); visible = false; queue.request(); await wait(230); assert.equal(calls, 2);
  visible = true; queue.request(); await wait(230); assert.equal(calls, 3);
  queue.dispose(); release(); queue.request(); await wait(230); assert.equal(calls, 3);
  console.log('PASS: lazy preview, JPEGs, metadata seek, HLS fallback/resume, playback metrics, refresh coalescing');
  await act(async () => root.unmount());
})().catch(error => { console.error(error); process.exitCode = 1; });
