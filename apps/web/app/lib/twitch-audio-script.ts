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
// @version      1.1
// @description  Накладывает звук, записанный twitch-stream-recorder, на VOD Twitch: оригинал, запись или оба сразу. Сам находит дорожку для VOD и подсвечивает заглушённые участки.
// @match        https://www.twitch.tv/*
// @grant        GM_xmlhttpRequest
// @connect      ${hostname}
// @connect      gql.twitch.tv
// ==/UserScript==

(function () {
  'use strict';

  var SERVER = '${trimmedOrigin}';
  var GQL_URL = 'https://gql.twitch.tv/gql';
  var GQL_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
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

  // VOD metadata fetched from Twitch GQL for the current /videos/<id> page.
  var metaVodId = null;
  var vodLengthSeconds = 0;
  var mutedSegments = []; // [{ offset, duration }]
  var autoMatchedTrack = null;
  var matchPending = false;

  var legendEl = null;

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
        resolveSelection();
      },
      onerror: function () {
        setStatus('Сервер недоступен: ' + SERVER);
      },
    });
  }

  // Ask Twitch (public GQL) who owns this VOD, when it was recorded and which
  // segments are muted, then look up the matching recording on our server.
  function fetchVodMeta() {
    var vodId = getVodId();
    if (!vodId || metaVodId === vodId) return;
    metaVodId = vodId;
    matchPending = true;

    var body = JSON.stringify({
      query:
        'query($id: ID!){ video(id:$id){ lengthSeconds createdAt publishedAt owner{ login } ' +
        'muteInfo{ mutedSegmentConnection{ nodes{ offset duration } } } } }',
      variables: { id: vodId },
    });

    GM_xmlhttpRequest({
      method: 'POST',
      url: GQL_URL,
      headers: { 'Client-ID': GQL_CLIENT_ID, 'Content-Type': 'application/json' },
      data: body,
      onload: function (res) {
        var login = null;
        var date = null;
        try {
          var video = JSON.parse(res.responseText).data.video;
          if (video) {
            login = video.owner && video.owner.login;
            date = video.createdAt || video.publishedAt || null;
            vodLengthSeconds = Number(video.lengthSeconds) || 0;
            var nodes =
              video.muteInfo &&
              video.muteInfo.mutedSegmentConnection &&
              video.muteInfo.mutedSegmentConnection.nodes;
            mutedSegments = Array.isArray(nodes)
              ? nodes.map(function (n) {
                  return { offset: Number(n.offset) || 0, duration: Number(n.duration) || 0 };
                })
              : [];
          }
        } catch (e) {}
        updateLegend();
        if (login) {
          matchTrack(login, date);
        } else {
          matchPending = false;
          resolveSelection();
        }
      },
      onerror: function () {
        matchPending = false;
        resolveSelection();
      },
    });
  }

  function matchTrack(login, date) {
    var url =
      SERVER + '/api/public/streams/audio-tracks/match?channel=' + encodeURIComponent(login) +
      (date ? '&date=' + encodeURIComponent(date) : '');
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function (res) {
        try {
          autoMatchedTrack = (JSON.parse(res.responseText).item) || null;
        } catch (e) {
          autoMatchedTrack = null;
        }
        matchPending = false;
        resolveSelection();
      },
      onerror: function () {
        matchPending = false;
        resolveSelection();
      },
    });
  }

  function ensureTrackInList(track) {
    if (!findTrack(track.id)) {
      tracks.unshift(track);
      renderOptions();
    }
  }

  // Decide which track to play: a previous manual choice for this VOD wins,
  // then the server's automatic match, otherwise wait or ask for a manual pick.
  function resolveSelection() {
    if (currentTrackId) return;

    var saved = loadState();
    if (saved && saved.trackId && findTrack(saved.trackId)) {
      offset = typeof saved.offset === 'number' ? saved.offset : 0;
      if (offsetInput) offsetInput.value = offset.toFixed(1);
      selectTrack(saved.trackId);
      applyMode(saved.mode === 'record' || saved.mode === 'both' ? saved.mode : 'twitch');
      return;
    }

    if (autoMatchedTrack) {
      ensureTrackInList(autoMatchedTrack);
      selectTrack(autoMatchedTrack.id);
      setStatus('Дорожка найдена автоматически');
      return;
    }

    if (matchPending) {
      setStatus('Ищу дорожку для этого VOD...');
    } else if (!tracks.length) {
      setStatus('На сервере нет аудиодорожек');
    } else {
      setStatus('Дорожка для этого VOD не найдена — выберите вручную');
    }
  }

  function updateLegend() {
    if (!legendEl) return;
    if (mutedSegments && mutedSegments.length) {
      legendEl.style.display = 'block';
      legendEl.textContent = '🔴 На таймлайне отмечены заглушённые участки: ' + mutedSegments.length;
    } else {
      legendEl.style.display = 'none';
    }
  }

  function renderMutedOverlay() {
    if (!mutedSegments || !mutedSegments.length) return;
    var bar = document.querySelector('[data-a-target="player-seekbar"]');
    if (!bar) return;

    var total =
      boundVideo && isFinite(boundVideo.duration) && boundVideo.duration > 0
        ? boundVideo.duration
        : vodLengthSeconds;
    if (!total) return;

    var overlay = bar.querySelector('.tsr-muted-overlay');
    if (
      overlay &&
      overlay.getAttribute('data-total') === String(Math.round(total)) &&
      overlay.getAttribute('data-count') === String(mutedSegments.length)
    ) {
      return; // already drawn for this duration and segment set
    }

    if (!overlay) {
      if (getComputedStyle(bar).position === 'static') bar.style.position = 'relative';
      overlay = document.createElement('div');
      overlay.className = 'tsr-muted-overlay';
      overlay.style.position = 'absolute';
      overlay.style.left = '0';
      overlay.style.top = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '15';
      bar.appendChild(overlay);
    }

    overlay.innerHTML = '';
    for (var i = 0; i < mutedSegments.length; i++) {
      var seg = mutedSegments[i];
      var leftPct = (seg.offset / total) * 100;
      var widthPct = (seg.duration / total) * 100;
      if (!isFinite(leftPct)) continue;
      var mark = document.createElement('div');
      mark.style.position = 'absolute';
      mark.style.top = '0';
      mark.style.bottom = '0';
      mark.style.left = Math.max(0, leftPct) + '%';
      mark.style.width = Math.max(0.15, widthPct) + '%';
      mark.style.background = 'rgba(229,72,77,0.65)';
      mark.title = 'Оригинал заглушён здесь';
      overlay.appendChild(mark);
    }
    overlay.setAttribute('data-total', String(Math.round(total)));
    overlay.setAttribute('data-count', String(mutedSegments.length));
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

    legendEl = el('div', { opacity: '0.7', marginTop: '4px', display: 'none' }, '');
    bodyEl.appendChild(legendEl);

    panel.appendChild(bodyEl);
    document.body.appendChild(panel);

    renderOptions();
    updateLegend();
    fetchTracks();
    fetchVodMeta();
  }

  function removePanel() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
    bodyEl = null;
    selectEl = null;
    statusEl = null;
    offsetInput = null;
    legendEl = null;
    modeButtons = {};
  }

  function tick() {
    // Twitch is a SPA: react to URL changes without page reloads.
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      audio.pause();
      currentTrackId = null;
      boundVideo = null;
      metaVodId = null;
      autoMatchedTrack = null;
      mutedSegments = [];
      vodLengthSeconds = 0;
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
    renderMutedOverlay();

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
