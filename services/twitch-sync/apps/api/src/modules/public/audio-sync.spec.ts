import test from 'node:test';
import assert from 'node:assert/strict';
import { fingerprint, matchFingerprints, SAMPLE_RATE, HOP } from './audio-fingerprint';
import { parseVodPlaylist, selectVodWindow, twitchMediaUrl } from './twitch-sync-source';
import { BackgroundAudioSync, recordingChatClock } from './background-audio-sync';

function sound(seconds: number, seed = 1) {
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const frequencies = [150, 260, 440, 710, 1100, 1700, 2650];
  const envelopes = frequencies.map(() => Array.from({ length: Math.ceil(seconds * 12) + 2 }, random));
  return Float32Array.from({ length: seconds * SAMPLE_RATE }, (_, sample) => {
    const t = sample / SAMPLE_RATE, frame = Math.floor(t * 12), part = t * 12 - frame;
    return frequencies.reduce((sum, hz, band) => sum + Math.sin(2 * Math.PI * hz * t) *
      (envelopes[band][frame] * (1 - part) + envelopes[band][frame + 1] * part) ** 2 / 15, 0);
  });
}
test('spectral match locates content despite gain and nonlinear compression', () => {
  const source = sound(36);
  const start = 175 * HOP;
  const query = source.slice(start, start + 12 * SAMPLE_RATE).map(v => Math.tanh(v * 2) * 0.2);
  const match = matchFingerprints(fingerprint(query), fingerprint(source));
  assert.ok(match?.matched, JSON.stringify(match));
  assert.ok(Math.abs(match.offsetSec - start / SAMPLE_RATE) <= HOP / SAMPLE_RATE);
});
test('unrelated sound and silence are rejected', () => {
  assert.equal(matchFingerprints(fingerprint(new Float32Array(12 * SAMPLE_RATE)), fingerprint(sound(24))), null);
  assert.equal(matchFingerprints(fingerprint(sound(12, 3)), fingerprint(sound(24, 9)))?.matched, false);
});
test('a repeated musical passage has no unique match and must be rejected', () => {
  const part = sound(12, 7), repeated = new Float32Array(36 * SAMPLE_RATE);
  repeated.set(part, 0); repeated.set(part, 24 * SAMPLE_RATE);
  assert.equal(matchFingerprints(fingerprint(part), fingerprint(repeated))?.matched, false);
});
test('a delay change inside the sample cannot pass as a single constant offset', () => {
  const source = sound(40, 8), query = new Float32Array(12 * SAMPLE_RATE);
  query.set(source.slice(160 * HOP, 160 * HOP + 6 * SAMPLE_RATE));
  query.set(source.slice(320 * HOP + 6 * SAMPLE_RATE, 320 * HOP + 12 * SAMPLE_RATE), 6 * SAMPLE_RATE);
  assert.equal(matchFingerprints(fingerprint(query), fingerprint(source))?.matched, false);
});

const baseUrl = 'https://example.cloudfront.net/path/audio_only/index.m3u8';
const playlist = '#EXTM3U\n#EXT-X-PROGRAM-DATE-TIME:2026-09-23T00:00:00Z\n#EXTINF:10,\n0.ts\n#EXTINF:10,\n1.ts\n#EXTINF:10,\n2.ts\n';
test('VOD segment wall clock stays attached to actual media position', () => {
  const segments = parseVodPlaylist(playlist, baseUrl);
  const window = selectVodWindow(segments, 8, 12);
  assert.equal(window.segments.length, 2);
  assert.equal(window.skipSec, 8);
  assert.equal(window.wallAtStartMs, Date.parse('2026-09-23T00:00:08Z'));
});
test('clock jumps, discontinuities, encrypted content and incomplete samples are rejected', () => {
  const jump = playlist.replace('#EXTINF:10,\n1.ts', '#EXT-X-PROGRAM-DATE-TIME:2026-09-23T00:01:00Z\n#EXTINF:10,\n1.ts');
  assert.throws(() => selectVodWindow(parseVodPlaylist(jump, baseUrl), 8, 12));
  const discontinuity = playlist.replace('#EXTINF:10,\n1.ts', '#EXT-X-DISCONTINUITY\n#EXTINF:10,\n1.ts');
  assert.throws(() => selectVodWindow(parseVodPlaylist(discontinuity, baseUrl), 8, 12));
  assert.throws(() => selectVodWindow(parseVodPlaylist(playlist, baseUrl), 25, 12));
  assert.throws(() => parseVodPlaylist(playlist + '#EXT-X-KEY:METHOD=AES-128,URI="key"', baseUrl));
});
test('media downloads accept only HTTPS Twitch CDN hosts', () => {
  assert.equal(twitchMediaUrl('1.ts', baseUrl), 'https://example.cloudfront.net/path/audio_only/1.ts');
  for (const url of ['http://example.cloudfront.net/a', 'https://127.0.0.1/a',
    'https://host.ttvnw.net.evil.test/a', 'https://user@host.ttvnw.net/a', 'file:///etc/passwd']) {
    assert.throws(() => twitchMediaUrl(url));
  }
});
test('recorded chat follows verified recording timestamps, not the numerical audio offset', () => {
  const start = Date.parse('2026-09-23T00:00:00Z');
  const map = JSON.stringify({ version: 1, captureAnchorMs: start,
    points: [{ mediaSec: 0, wallClockMs: start + 5000 }, { mediaSec: 200, wallClockMs: start + 235000 }] });
  assert.equal(recordingChatClock(map, 110, 12, start, 100), 15);
  assert.equal(recordingChatClock(map, 210, 12, start, 230), 15);
  assert.equal(recordingChatClock(map, 195, 12, start, 190), null, 'sample crosses missing media');
  assert.equal(recordingChatClock(null, 110, 12, start, 100), null);
});
test('concurrent equal jobs are deduplicated; another job is bounded by one worker', async () => {
  const engine = new BackgroundAudioSync();
  let complete!: (result: unknown) => void, calls = 0;
  (engine as any).run = () => { calls++; return new Promise(resolve => { complete = resolve; }); };
  const session = { id: 'one', durationSec: 1000, mediaTimelineJson: null,
    createdAt: new Date(), startedAt: null, endedAt: null, channel: { twitchLogin: 'test' } };
  const a = engine.measure(session, '123', 100, 100);
  const b = engine.measure(session, '123', 100, 100);
  assert.equal((await engine.measure(session, '123', 200, 200)).status, 'busy');
  complete({ status: 'matched', vodTimeSec: 100, recordTimeSec: 102 });
  assert.deepEqual(await a, await b); assert.equal(calls, 1);
  await engine.measure(session, '123', 100, 100); assert.equal(calls, 1, 'cached result');
});
