// Generates the Tampermonkey userscript that overlays the recorder's audio
// track on a Twitch VOD (restores DMCA-muted sections). The server origin is
// baked in at copy time, so the script works from any machine that can reach
// the panel's public address.

export function buildTwitchAudioUserscript(origin: string): string {
  const trimmedOrigin = origin.replace(/\/+$/, "");
  let hostname = trimmedOrigin;
  try {
    hostname = new URL(trimmedOrigin).hostname;
  } catch {
    // Keep the raw value; Tampermonkey will still match it.
  }

  // The script body intentionally avoids template literals and "${" so it can
  // live inside this template literal without escaping.
  return `// ==UserScript==
// @name         TSR: звук записи для Twitch VOD
// @namespace    tsr-twitch-audio
// @version      1.0
// @description  Накладывает звук, записанный twitch-stream-recorder, на VOD Twitch: оригинал, запись или оба сразу.
// @match        https://www.twitch.tv/*
// @grant        GM_xmlhttpRequest
// @connect      ${hostname}
// ==/UserScript==

(function () {
  'use strict';

  var SERVER = '${trimmedOrigin}';
  var SYNC_MS = 800;
  var MAX_DRIFT = 0.35;

  var audio = document.createElement('audio');
  audio.preload = 'auto';

  var tracks = [];
  var currentTrackId = null;
  var mode = 'twitch'; // twitch | record | both
  var offset = 0;
  var boundVideo = null;
  var lastUrl = '';

  var panel = null;
  var bodyEl = null;
  var selectEl = null;
  var statusEl = null;
  var offsetInput = null;
  var modeButtons = {};

  function getVodId() {
    var m = location.pathname.match(/^\\/videos\\/(\\d+)/);
    return m ? m[1] : null;
  }

  function getVideo() {
    return document.querySelector('video');
  }

  function storeKey() {
    return 'tsr-audio-' + (getVodId() || 'none');
  }

  function saveState() {
    try {
      localStorage.setItem(storeKey(), JSON.stringify({ trackId: currentTrackId, offset: offset, mode: mode }));
    } catch (e) {}
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(storeKey());
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function findTrack(id) {
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].id === id) return tracks[i];
    }
    return null;
  }

  function fmtDuration(sec) {
    if (!sec || sec <= 0) return '';
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    return ' · ' + (h > 0 ? h + 'ч ' : '') + m + 'м';
  }

  function trackLabel(track) {
    var date = track.startedAt ? new Date(track.startedAt) : null;
    var dateText = date
      ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
      : '';
    return (track.channelDisplayName || track.channelLogin) + ' — ' + dateText +
      fmtDuration(track.durationSec) + (track.title ? ' — ' + track.title : '');
  }

  function renderOptions() {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = tracks.length ? '— выберите дорожку —' : 'нет дорожек';
    selectEl.appendChild(placeholder);
    for (var i = 0; i < tracks.length; i++) {
      var option = document.createElement('option');
      option.value = tracks[i].id;
      option.textContent = trackLabel(tracks[i]);
      selectEl.appendChild(option);
    }
    selectEl.value = currentTrackId || '';
  }

  function fetchTracks() {
    setStatus('Загружаю список дорожек...');
    GM_xmlhttpRequest({
      method: 'GET',
      url: SERVER + '/api/public/streams/audio-tracks',
      onload: function (res) {
        try {
          tracks = (JSON.parse(res.responseText).items) || [];
        } catch (e) {
          tracks = [];
        }
        renderOptions();
        var saved = loadState();
        if (saved && saved.trackId && findTrack(saved.trackId)) {
          offset = typeof saved.offset === 'number' ? saved.offset : 0;
          if (offsetInput) offsetInput.value = offset.toFixed(1);
          selectTrack(saved.trackId);
          applyMode(saved.mode === 'record' || saved.mode === 'both' ? saved.mode : 'twitch');
        } else {
          setStatus(tracks.length ? 'Выберите дорожку записи' : 'На сервере нет аудиодорожек');
        }
      },
      onerror: function () {
        setStatus('Сервер недоступен: ' + SERVER);
      },
    });
  }

  function selectTrack(id) {
    currentTrackId = id || null;
    if (selectEl) selectEl.value = currentTrackId || '';
    if (currentTrackId) {
      var track = findTrack(currentTrackId);
      audio.src = track ? SERVER + track.audioUrl : '';
      audio.load();
      setStatus('Дорожка выбрана');
    } else {
      audio.pause();
      audio.removeAttribute('src');
    }
    saveState();
    syncNow(true);
  }

  function applyMode(next) {
    mode = next;
    var v = getVideo();
    if (mode === 'twitch') {
      audio.pause();
      if (v) v.muted = false;
    } else {
      if (v) v.muted = (mode === 'record');
      syncNow(true);
    }
    for (var key in modeButtons) {
      modeButtons[key].style.background = key === mode ? '#9147ff' : '#2f2f35';
    }
    saveState();
  }

  function bindVideo(v) {
    if (boundVideo === v) return;
    boundVideo = v;
    v.addEventListener('seeked', function () { syncNow(true); });
    v.addEventListener('ratechange', function () { audio.playbackRate = v.playbackRate; });
    v.addEventListener('play', function () { syncNow(true); });
    v.addEventListener('pause', function () { audio.pause(); });
  }

  function syncNow(force) {
    var v = getVideo();
    if (!v || mode === 'twitch' || !currentTrackId) return;
    bindVideo(v);
    if (audio.playbackRate !== v.playbackRate) audio.playbackRate = v.playbackRate;
    var target = v.currentTime + offset;
    if ((force || Math.abs(audio.currentTime - target) > MAX_DRIFT) && isFinite(target) && target >= 0) {
      audio.currentTime = target;
    }
    if (v.paused || v.ended) {
      if (!audio.paused) audio.pause();
    } else if (audio.paused) {
      var played = audio.play();
      if (played && played.catch) {
        played.catch(function () {
          setStatus('Браузер заблокировал звук — кликните по странице и нажмите play.');
        });
      }
    }
  }

  function setOffset(value) {
    offset = Math.round(value * 10) / 10;
    if (offsetInput) offsetInput.value = offset.toFixed(1);
    saveState();
    syncNow(true);
  }

  function el(tag, styles, text) {
    var node = document.createElement(tag);
    if (styles) {
      for (var key in styles) node.style[key] = styles[key];
    }
    if (text) node.textContent = text;
    return node;
  }

  function makeButton(label, onClick) {
    var button = el('button', {
      background: '#2f2f35', color: '#fff', border: 'none', borderRadius: '4px',
      padding: '4px 8px', cursor: 'pointer', fontSize: '12px',
    }, label);
    button.addEventListener('click', onClick);
    return button;
  }

  function createPanel() {
    panel = el('div', {
      position: 'fixed', right: '16px', bottom: '16px', zIndex: '99999',
      background: '#18181b', color: '#efeff1', borderRadius: '8px',
      border: '1px solid #2f2f35', font: '12px/1.4 Inter, sans-serif',
      width: '300px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    });

    var header = el('div', {
      padding: '8px 10px', cursor: 'pointer', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center', fontWeight: '600',
    });
    header.appendChild(el('span', null, '🎧 Звук записи (TSR)'));
    var toggleHint = el('span', { opacity: '0.6' }, '−');
    header.appendChild(toggleHint);
    header.addEventListener('click', function () {
      var hidden = bodyEl.style.display === 'none';
      bodyEl.style.display = hidden ? 'block' : 'none';
      toggleHint.textContent = hidden ? '−' : '+';
    });
    panel.appendChild(header);

    bodyEl = el('div', { padding: '0 10px 10px 10px' });

    selectEl = el('select', {
      width: '100%', background: '#0e0e10', color: '#efeff1',
      border: '1px solid #2f2f35', borderRadius: '4px', padding: '4px', marginBottom: '8px',
    });
    selectEl.addEventListener('change', function () { selectTrack(selectEl.value); });
    bodyEl.appendChild(selectEl);

    var modeRow = el('div', { display: 'flex', gap: '6px', marginBottom: '8px' });
    var modes = [['twitch', 'Twitch'], ['record', 'Запись'], ['both', 'Оба']];
    for (var i = 0; i < modes.length; i++) {
      (function (key, label) {
        var button = makeButton(label, function () { applyMode(key); });
        button.style.flex = '1';
        modeButtons[key] = button;
        modeRow.appendChild(button);
      })(modes[i][0], modes[i][1]);
    }
    bodyEl.appendChild(modeRow);

    var offsetRow = el('div', { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' });
    offsetRow.appendChild(el('span', { opacity: '0.7' }, 'Сдвиг, c'));
    offsetRow.appendChild(makeButton('−0.5', function () { setOffset(offset - 0.5); }));
    offsetInput = el('input', {
      width: '56px', background: '#0e0e10', color: '#efeff1',
      border: '1px solid #2f2f35', borderRadius: '4px', padding: '3px 4px', textAlign: 'center',
    });
    offsetInput.type = 'number';
    offsetInput.step = '0.1';
    offsetInput.value = '0.0';
    offsetInput.addEventListener('change', function () { setOffset(parseFloat(offsetInput.value) || 0); });
    offsetRow.appendChild(offsetInput);
    offsetRow.appendChild(makeButton('+0.5', function () { setOffset(offset + 0.5); }));
    bodyEl.appendChild(offsetRow);

    var volumeRow = el('div', { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' });
    volumeRow.appendChild(el('span', { opacity: '0.7' }, 'Громк.'));
    var volume = el('input', { flex: '1' });
    volume.type = 'range';
    volume.min = '0';
    volume.max = '1';
    volume.step = '0.05';
    volume.value = '1';
    volume.addEventListener('input', function () { audio.volume = parseFloat(volume.value); });
    volumeRow.appendChild(volume);
    bodyEl.appendChild(volumeRow);

    statusEl = el('div', { opacity: '0.7', minHeight: '16px' }, '');
    bodyEl.appendChild(statusEl);

    panel.appendChild(bodyEl);
    document.body.appendChild(panel);

    renderOptions();
    fetchTracks();
  }

  function removePanel() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
    bodyEl = null;
    selectEl = null;
    statusEl = null;
    offsetInput = null;
    modeButtons = {};
  }

  function tick() {
    // Twitch is a SPA: react to URL changes without page reloads.
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      audio.pause();
      currentTrackId = null;
      boundVideo = null;
      removePanel();
    }

    if (!getVodId()) {
      if (panel) removePanel();
      if (!audio.paused) audio.pause();
      return;
    }

    if (!panel || !document.body.contains(panel)) {
      createPanel();
    }

    syncNow(false);

    if (mode !== 'twitch' && currentTrackId && !audio.error) {
      var v = getVideo();
      if (v && !v.paused) {
        setStatus('Синхронизировано · сдвиг ' + offset.toFixed(1) + ' c');
      }
    } else if (audio.error) {
      setStatus('Ошибка загрузки аудио — проверьте доступность сервера.');
    }
  }

  setInterval(tick, SYNC_MS);
})();
`;
}
