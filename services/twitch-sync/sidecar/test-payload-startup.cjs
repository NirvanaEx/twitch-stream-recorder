const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { JSDOM } = require('jsdom');

for (const [host, filename] of [
  ['stream.neyron.site', 'twitch-audio.payload.js'],
  ['193.160.119.15', 'twitch-audio.legacy.payload.js'],
]) {
  test(`complete generated payload starts and requests tracks with installed @connect ${host}`, () => {
    const dom = new JSDOM('<html><head></head><body><video></video></body></html>', {
      url: 'https://www.twitch.tv/videos/2881486306', runScripts: 'outside-only',
    });
    const { window } = dom;
    const intervals = [], requests = [];
    window.setInterval = fn => (intervals.push(fn), intervals.length);
    window.HTMLMediaElement.prototype.pause = function () {};
    window.HTMLMediaElement.prototype.load = function () {};
    window.GM_getValue = (_key, fallback) => fallback;
    window.GM_setValue = () => {};
    window.GM_xmlhttpRequest = options => {
      assert.ok([host, 'gql.twitch.tv'].includes(new URL(options.url).hostname), `Tampermonkey would block ${options.url}`);
      requests.push(options);
      return { abort() {} };
    };
    try {
      window.eval(fs.readFileSync(path.join(__dirname, 'dist', filename), 'utf8'));
      for (const tick of [...intervals]) tick();
      assert.ok(window.document.body.textContent.includes('Звук записи (TSR)'), 'panel is attached');
      assert.ok(requests.some(r => r.url.endsWith('/api/public/streams/audio-tracks')), 'track list is requested');
    } finally {
      window.close();
    }
  });
}
