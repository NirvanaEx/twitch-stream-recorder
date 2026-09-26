const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { test } = require('node:test');
const ts = require(process.env.TSR_TYPESCRIPT_PATH || 'typescript');

function compile(filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
    reportDiagnostics: true,
  });
  assert.deepEqual(compiled.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error), []);
  const module = { exports: {} };
  const localRequire = name => compile(path.resolve(path.dirname(filename), name + '.ts'));
  new Function('require', 'module', 'exports', compiled.outputText)(localRequire, module, module.exports);
  return module.exports;
}
const built = compile(path.resolve(__dirname, '../app/lib/twitch-audio-script.ts'));
const payload = built.buildTwitchAudioPayload('https://stream.neyron.site');
new vm.Script(payload);
new vm.Script(built.buildTwitchAudioUserscript('https://stream.neyron.site'));

function media() {
  const listeners = new Map();
  return {
    style: {}, currentTime: 100, duration: 3600, playbackRate: 1, readyState: 4,
    paused: false, ended: false, seeking: false, muted: false, volume: 1,
    addEventListener(name, cb) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(cb); },
    removeEventListener(name, cb) { listeners.get(name)?.delete(cb); },
    emit(name) { for (const cb of [...(listeners.get(name) || [])]) cb(); },
    pause() { this.paused = true; }, play() { this.paused = false; return Promise.resolve(); },
    load() {}, removeAttribute() {},
    captureStream() { return { getAudioTracks: () => [{}], getTracks: () => [{ stop() {} }] }; },
    listeners,
  };
}

function harness(initial = {}) {
  let now = 100000;
  const video = media(), audio = media(), requests = [];
  const storage = new Map(Object.entries(initial));
  const document = {
    hidden: false,
    documentElement: { hasAttribute: () => false, setAttribute() {}, appendChild() {} },
    getElementById: () => null,
    createElement: tag => tag === 'audio' ? audio : { style: {} },
    querySelector: () => video,
  };
  const context = {
    document, window: {}, location: { protocol: 'https:', pathname: '/videos/123', href: 'https://www.twitch.tv/videos/123' },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) },
    Date: { now: () => now }, setTimeout: () => 1, clearTimeout() {},
    GM_xmlhttpRequest(options) { const request = { options, aborted: false, abort() { this.aborted = true; } }; requests.push(request); return request; },
  };
  const expose = `
    globalThis.testApi = {
      maybeAutoCalibrate, startOffsetCalibration, resetAutoCalibration, deferAutoCalibration,
      bindVideo, setOffset, toggleAutoCal, abortCalibration, resolveSelection,
      applyKnownSyncPoint, recordChatOffset, syncNow,
      configure() {
        tracks = [{ id: 'track', durationSec: 3600, audioUrl: '/audio', channelLogin: 'channel' }];
        currentTrackId = 'track'; trackDurationSec = 3600; mode = 'record'; boost = 1;
        boundVideo = null; bindVideo(getVideo());
        chatOffset = 3; nativeChatOffset = 9;
      },
      chatOnly() { mode = 'twitch'; chatMode = 'record'; },
      restore(saved) {
        currentTrackId = null; savedStateSnapshot = saved;
        loadAudioSource = function () {}; updateNowPlaying = function () {}; updateLegend = function () {};
        resolveSelection();
      },
      match() {
        currentTrackId = null; savedStateSnapshot = null; autoMatchedTrack = tracks[0];
        loadAudioSource = function () {}; updateNowPlaying = function () {}; updateLegend = function () {};
        resolveSelection();
      },
      get state() { return { calibrating, offset, mode, autoCalState, autoCalEnabled,
        autoRecordChatOffset, chatOffset, nativeChatOffset }; }
    }; return;
  `;
  vm.runInNewContext(payload.replace("  audio.addEventListener('error', function () {", expose + "  audio.addEventListener('error', function () {"), context);
  const api = context.testApi; api.configure();
  return { api, video, audio, document, storage, requests, advance(ms) { now += ms; },
    respond(result, index = requests.length - 1) { requests[index].options.onload({ status: 200, responseText: JSON.stringify(result) }); } };
}
function matched(vodTimeSec = 100, recordTimeSec = 102, chatOffsetSec = -4) {
  return { status: 'matched', vodTimeSec, recordTimeSec, sampleDurationSec: 12,
    score: 0.9, margin: 0.4, chatOffsetSec, chatClock: 'twitch-pdt' };
}

test('background request needs no playback, visible tab, audio graph, volume or seek changes', () => {
  const h = harness(); h.video.paused = true; h.document.hidden = true; h.audio.readyState = 0;
  const before = [h.video.currentTime, h.audio.currentTime, h.video.muted, h.audio.volume, h.audio.paused, h.api.state.mode];
  assert.equal(h.api.startOffsetCalibration(), true);
  assert.deepEqual([h.video.currentTime, h.audio.currentTime, h.video.muted, h.audio.volume, h.audio.paused, h.api.state.mode], before);
  assert.match(h.requests[0].options.url, /audio-sync\?vod=123/);
});
test('audio and recorded chat use separate clocks and native Twitch chat remains unchanged', () => {
  const h = harness(); h.api.startOffsetCalibration(); h.respond(matched());
  assert.equal(h.api.state.offset, 2);
  assert.equal(h.api.recordChatOffset(), -1, 'automatic -4 plus manual +3');
  assert.equal(h.api.state.nativeChatOffset, 9);
  assert.equal(h.api.state.chatOffset, 3);
});
test('2x speed does not multiply an already decoded media-time match', () => {
  const h = harness(); h.video.playbackRate = 2; h.api.startOffsetCalibration(); h.respond(matched());
  assert.equal(h.api.state.offset, 2);
});
test('a low-confidence or repeated match never overwrites the audio offset', () => {
  const h = harness(); h.api.setOffset(7); h.api.startOffsetCalibration();
  h.respond({ ...matched(), score: 0.4, chatClock: null });
  assert.equal(h.api.state.offset, 7); assert.equal(h.api.recordChatOffset(), 3);
});
test('verified segment clocks can align recorded chat even with muted original audio', () => {
  const h = harness(); h.api.startOffsetCalibration();
  h.respond({ status: 'unmatched', vodTimeSec: 100, chatOffsetSec: -8, chatClock: 'twitch-pdt' });
  assert.equal(h.api.state.offset, 0); assert.equal(h.api.recordChatOffset(), -5);
});
test('seeking cancels an in-flight request and discards its late response', () => {
  const h = harness(); h.api.startOffsetCalibration(); h.video.currentTime = 250; h.video.emit('seeked');
  assert.equal(h.requests[0].aborted, true); h.respond(matched());
  assert.equal(h.api.state.offset, 0); assert.equal(h.api.recordChatOffset(), 3);
  h.api.maybeAutoCalibrate(); assert.equal(h.requests.length, 2);
});
test('different parts retain different offsets when seeking backward across a delay change', () => {
  const h = harness(); h.api.startOffsetCalibration(); h.respond(matched());
  h.video.currentTime = 200; h.video.emit('seeked'); h.api.startOffsetCalibration(); h.respond(matched(200, 193, 6));
  assert.equal(h.api.state.offset, -7); assert.equal(h.api.recordChatOffset(), 9);
  h.video.currentTime = 100; h.video.emit('seeked'); h.api.applyKnownSyncPoint();
  assert.equal(h.api.state.offset, 2); assert.equal(h.api.recordChatOffset(), -1);
  h.video.currentTime = 1000; h.api.applyKnownSyncPoint(); assert.equal(h.api.recordChatOffset(), 3);
});
test('automatic checks repeat after success without stopping existing playback sync', () => {
  const h = harness(); h.api.maybeAutoCalibrate(); h.api.syncNow(false);
  assert.equal(h.api.state.calibrating, true); h.respond(matched());
  h.advance(16000); h.video.currentTime = 116; h.api.maybeAutoCalibrate();
  assert.equal(h.requests.length, 2);
});
test('turning auto off cancels work and removes only automatic recorded-chat correction', () => {
  const h = harness(); h.api.startOffsetCalibration(); h.respond(matched());
  h.api.startOffsetCalibration(); h.api.toggleAutoCal();
  assert.equal(h.requests[1].aborted, true); assert.equal(h.api.recordChatOffset(), 3);
  assert.equal(h.api.state.nativeChatOffset, 9);
});
test('manual audio correction invalidates the old local match and cannot be overwritten by a late result', () => {
  const h = harness(); h.api.startOffsetCalibration(); h.api.setOffset(8); h.respond(matched());
  h.api.applyKnownSyncPoint(); assert.equal(h.api.state.offset, 8);
});
test('saved offset is a seed, not a reason to disable background checks', () => {
  const h = harness({ 'tsr-audio-choffset-channel': '28' });
  h.api.restore({ trackId: 'track', offset: 8, mode: 'record' }); h.api.maybeAutoCalibrate();
  assert.equal(h.api.state.calibrating, true); h.api.abortCalibration(); h.api.match();
  assert.equal(h.api.state.offset, 0);
});
test('recorded-chat auto sync also works when listening to original Twitch audio', () => {
  const h = harness(); h.api.chatOnly(); h.api.maybeAutoCalibrate(); h.respond(matched());
  assert.equal(h.api.recordChatOffset(), -1); assert.equal(h.api.state.mode, 'twitch');
});
test('errors back off and do not permanently disable auto sync', () => {
  const h = harness();
  for (let i = 0; i < 3; i++) h.api.deferAutoCalibration(false);
  h.api.maybeAutoCalibrate(); assert.equal(h.requests.length, 0);
  h.advance(61000); h.api.maybeAutoCalibrate(); assert.equal(h.requests.length, 1);
});
