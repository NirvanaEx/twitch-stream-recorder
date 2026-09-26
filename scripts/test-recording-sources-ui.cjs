const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('<div id="root"></div>', { url: 'https://stream.neyron.site' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLMediaElement', 'Event', 'MouseEvent', 'MediaError']) global[key] = key === 'window' ? window : window[key];
global.React = require('react');
global.IS_REACT_ACT_ENVIRONMENT = true;
const { act } = React;
const { createRoot } = require('react-dom/client');
const { useRecordingPlayback } = require('../apps/web/app/lib/use-recording-playback.ts');
const { locatePlaybackTime } = require('../apps/web/app/lib/playback-sources.ts');
const { readResume } = require('../apps/web/app/lib/resume.ts');
const { VideoPlayer } = require('../apps/web/app/components/VideoPlayer.tsx');
const { StorageBadges, PlaybackSourceSelect } = require('../apps/web/app/components/RecordingSources.tsx');
const { AppProviders } = require('../apps/web/app/providers.tsx');
let playCalls = 0;
const proto = window.HTMLMediaElement.prototype;
Object.defineProperties(proto, {
  readyState: { get() { return this._ready ?? 0; } },
  currentSrc: { get() { return this.src; } },
  duration: { get() { return this.src.includes('telegram') ? 900 : 1800; } },
  paused: { get() { return this._paused ?? true; } },
});
proto.play = async function () { this._paused = false; playCalls++; this.dispatchEvent(new Event('play')); };
proto.pause = function () { this._paused = true; this.dispatchEvent(new Event('pause')); };
proto.load = function () {};
proto.canPlayType = () => 'probably';
const complete = { state: 'saved', available: true, savedParts: 1, totalParts: 1 };
const data = { id: 'recording', videoSource: 'drive', videoUrl: '/video?source=drive', parts: [],
  storage: { drive: complete, telegram: complete }, playbackSources: [
    { source: 'drive', videoUrl: '/video?source=drive', parts: [] },
    { source: 'telegram', videoUrl: '/video?source=telegram&part=1', parts: [1, 2].map(partIndex => ({
      partIndex, partCount: 2, streamUrl: `/video?source=telegram&part=${partIndex}`, startOffsetSec: (partIndex - 1) * 900, durationSec: 900, source: 'telegram',
    })) },
  ] };
const root = createRoot(document.getElementById('root'));
const url = path => path ?? '';
let playback;
function Harness({ record = data }) {
  playback = useRecordingPlayback(record.id, record, url);
  return React.createElement(React.Fragment, null,
    React.createElement(StorageBadges, { storage: record.storage }),
    // The page renders source selection in its toolbar, outside VideoPlayer.
    React.createElement(PlaybackSourceSelect, { storage: record.storage, choices: record.playbackSources,
      value: playback.selectedSource, onChange: playback.changeSource }),
    React.createElement(VideoPlayer, {
      src: playback.videoSrc, playlist: playback.playlist ?? undefined,
      playbackKey: playback.playbackKey, initialPlayback: playback.initialPlayback,
      initialSegment: playback.initialSegment, onSegmentChange: playback.setCurrentPart,
      mode: 'normal', onModeChange() {}, onVideoElement: playback.setVideoElement,
    }));
}
const render = record => act(async () => root.render(React.createElement(AppProviders, null, React.createElement(Harness, { record }))));
const loaded = media => act(async () => { media._ready = 1; media.dispatchEvent(new Event('loadedmetadata')); });
const choose = source => act(async () => {
  document.querySelector('video')._ready = 0;
  const select = document.querySelector('select[aria-label="Источник видео"]');
  select.value = source; select.dispatchEvent(new Event('change', { bubbles: true }));
});
(async () => {
  assert.deepEqual(locatePlaybackTime(data.playbackSources[1].parts, 900), { part: 2, time: 0 });
  assert.deepEqual(locatePlaybackTime(data.playbackSources[1].parts, 1042), { part: 2, time: 142 });
  await render(data);
  const media = document.querySelector('video');
  await loaded(media);
  assert.equal(playback.selectedSource, 'drive');
  assert.equal(document.querySelectorAll('.storage-copy--saved').length, 2);
  await act(async () => { media.currentTime = 1042; media.playbackRate = 1.5; media.volume = 0.4; });
  await choose('telegram');
  assert.equal(document.querySelector('video'), media, 'switch preserves fullscreen/media DOM and audio graph');
  assert.match(media.src, /source=telegram&part=2/);
  media.currentTime = 0;
  await loaded(media);
  assert.equal(media.currentTime, 142);
  assert.equal(media.playbackRate, 1.5);
  assert.equal(media.volume, 0.4);
  assert.equal(media.paused, true, 'a paused recording stays paused');
  assert.equal(playCalls, 0);
  assert.equal(readResume('recording').absoluteTime, 1042);
  await choose('drive'); media.currentTime = 0;
  await choose('telegram'); media.currentTime = 0;
  await loaded(media);
  assert.equal(media.currentTime, 142, 'rapid switching before metadata retains the original recording position');
  await act(async () => media.play());
  await choose('drive'); media.currentTime = 0;
  await loaded(media);
  assert.equal(media.currentTime, 1042);
  assert.equal(media.paused, false, 'a playing recording resumes after metadata');
  assert.equal(playCalls, 2);
  await choose('telegram'); media.currentTime = 0; await loaded(media);
  await render({ ...data, storage: { ...data.storage } });
  assert.equal(playback.selectedSource, 'telegram', 'background refresh preserves manual choice');
  await act(async () => { media.pause(); });
  await act(async () => root.render(null));
  await render(data); await loaded(document.querySelector('video'));
  assert.equal(playback.selectedSource, 'drive', 'new visit defaults to Drive');
  assert.equal(document.querySelector('video').currentTime, 1042, 'resume converts Telegram time back to Drive');
  await act(async () => root.render(null));
  const partial = { ...data, id: 'partial', playbackSources: data.playbackSources.slice(0, 1), storage: { drive: complete, telegram: { state: 'saving', available: false, savedParts: 1, totalParts: 2 } } };
  await render(partial);
  assert.equal(document.querySelector('option[value="telegram"]').disabled, true);
  assert.match(document.querySelector('.storage-copy--saving').textContent, /1\/2/);
  await act(async () => root.render(null));
  const members = ['first', 'second'].map((id, i) => ({ id, startOffsetSec: i * 1800, durationSec: 1800, available: true }));
  const groupSource = (source, count) => ({ source, videoUrl: `/first/video?source=${source}&part=1`,
    parts: members.flatMap((member, i) => Array.from({ length: count }, (_, n) => ({
      partIndex: i * count + n + 1, partCount: 2 * count, sessionId: member.id,
      sessionOffsetSec: n * (1800 / count), sessionChatOffsetSec: i ? -3 : 7,
      startOffsetSec: i * 1800 + n * (1800 / count), durationSec: 1800 / count,
      source, streamUrl: `/${member.id}/video?source=${source}&part=${n + 1}`,
    }))) });
  const group = { ...data, id: 'first', broadcast: { id: 'first', memberCount: 2, members },
    playbackSources: [groupSource('drive', 1), groupSource('telegram', 2)] };
  await render(group);
  const groupMedia = document.querySelector('video'); await loaded(groupMedia);
  await act(async () => { groupMedia.currentTime = 1800; groupMedia.dispatchEvent(new Event('ended')); });
  await loaded(groupMedia);
  assert.equal(playback.activePart.sessionId, 'second', 'automatic continuation changes the chat session');
  assert.equal(playback.activePart.sessionChatOffsetSec, -3, 'continuation uses its own chat correction');
  await act(async () => { groupMedia.currentTime = 1042; });
  await choose('telegram'); groupMedia.currentTime = 0; await loaded(groupMedia);
  assert.equal(playback.currentPart, 4); assert.equal(groupMedia.currentTime, 142);
  assert.equal(playback.activePart.sessionOffsetSec, 900, 'chat uses the local session offset');
  assert.equal(readResume('broadcast:first').absoluteTime, 2842, 'resume is shared across old member links');
  const expanded = { ...group, playbackSources: group.playbackSources.map(source => ({ ...source, parts: [...source.parts, {
    partIndex: source.parts.length + 1, partCount: source.parts.length + 1, sessionId: 'third',
    sessionOffsetSec: 0, startOffsetSec: 3600, durationSec: 1800, source: source.source,
    streamUrl: `/third/video?source=${source.source}&part=1`,
  }] })) };
  await render(expanded); await loaded(groupMedia);
  assert.equal(playback.selectedSource, 'telegram'); assert.equal(playback.activePart.sessionId, 'second');
  assert.equal(groupMedia.currentTime, 142, 'appending a continuation preserves playback position');
  await act(async () => root.render(null));
  await render({ ...group, id: 'second' }); await loaded(document.querySelector('video'));
  assert.equal(playback.activePart.sessionId, 'second');
  assert.equal(document.querySelector('video').currentTime, 1042, 'opening another member link resumes the same broadcast in Drive');
  await act(async () => root.render(null));
  window.localStorage.removeItem('tsr-resume-broadcast:first');
  window.localStorage.setItem('tsr-resume-second', JSON.stringify({ part: 2, time: 142, source: 'telegram' }));
  await render({ ...group, id: 'second' }); await loaded(document.querySelector('video'));
  assert.equal(document.querySelector('video').currentTime, 1042, 'legacy member bookmarks migrate to broadcast offsets');
  console.log('PASS: broadcast autoplay, session/chat offsets, unequal source partitions, live append and shared/legacy resume');
  await act(async () => root.unmount());
  console.log('PASS: Drive default, both copy indicators, partial-copy indicator, forced switching, timeline mapping, pause/play/rate/volume, stable DOM, refresh and cross-source resume');
})().catch(error => { console.error(error); process.exit(1); });
