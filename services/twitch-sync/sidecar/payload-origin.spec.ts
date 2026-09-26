import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CANONICAL_ORIGIN, LEGACY_ORIGIN, resolvePayloadOrigin } from './payload-origin';

test('legacy loader preserves its @connect origin even behind a rewriting proxy', () => {
  assert.equal(resolvePayloadOrigin('/twitch-audio.payload.js?origin=' + encodeURIComponent(LEGACY_ORIGIN), 'web:3000'), LEGACY_ORIGIN);
});
test('domain loader preserves its origin even when called via the legacy host', () => {
  assert.equal(resolvePayloadOrigin('/twitch-audio.payload.js?origin=' + encodeURIComponent(CANONICAL_ORIGIN), '193.160.119.15:9000'), CANONICAL_ORIGIN);
});
test('requests without origin use the known host or the canonical default', () => {
  assert.equal(resolvePayloadOrigin('/twitch-audio.payload.js', '193.160.119.15:9000'), LEGACY_ORIGIN);
  assert.equal(resolvePayloadOrigin('/twitch-audio.payload.js', 'stream.neyron.site'), CANONICAL_ORIGIN);
});
test('untrusted origin parameters never become executable payload or remote destinations', () => {
  for (const origin of ['https://example.com', "https://stream.neyron.site';alert(1);//", 'javascript:alert(1)', 'https://stream.neyron.site@evil.test']) {
    assert.equal(resolvePayloadOrigin('/twitch-audio.payload.js?origin=' + encodeURIComponent(origin)), CANONICAL_ORIGIN);
  }
});
