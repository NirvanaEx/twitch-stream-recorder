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
// @version      1.6
// @description  Накладывает звук, записанный twitch-stream-recorder, на VOD Twitch: оригинал, запись или оба сразу. Сам находит дорожку, подсвечивает покрытие и заглушённые участки, панель перетаскивается.
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
  audio.style.display = 'none';

  var tracks = [];
  var currentTrackId = null;
  var trackDurationSec = 0;
  // Epoch ms of when the capture started; 0 = unknown (very old tracks).
  var trackRecordStartMs = 0;
  // Epoch ms of when the capture process exited; 0 = unknown. The preferred
  // anchor: end minus duration gives the true start even when the recorder
  // rewound the live playlist on startup.
  var trackRecordEndMs = 0;
  var mode = 'twitch'; // twitch | record | both
  var offset = 0;
  var boundVideo = null;
  var lastUrl = '';

  // An http server cannot be loaded into an <audio> element on the https
  // Twitch page (mixed content), so in that case we pull the file through the
  // privileged GM_xmlhttpRequest and play it from a blob instead. The file is
  // downloaded in Range chunks (playback starts after the first megabytes —
  // .m4a is written with faststart, so a prefix is already playable) and the
  // finished blob is kept in IndexedDB for a day, so refreshing the page or
  // reopening the VOD does not download it again.
  var mixedContent = location.protocol === 'https:' && SERVER.slice(0, 7).toLowerCase() === 'http://';
  var audioObjectUrl = null;
  var blobLoadingForId = null;
  var blobTriedForId = null;

  // VOD metadata fetched from Twitch GQL for the current /videos/<id> page.
  var metaVodId = null;
  var vodLengthSeconds = 0;
  // Epoch ms of the broadcast start — the zero point of the VOD timeline.
  var vodCreatedAtMs = 0;
  var mutedSegments = []; // [{ offset, duration }]
  var autoMatchedTrack = null;
  var matchPending = false;

  var legendEl = null;
  var nowPlayingEl = null;
  var collapsed = false;
  try {
    collapsed = localStorage.getItem('tsr-audio-collapsed') === '1';
  } catch (e) {}

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
  // The muteInfo part of the schema has changed before; when the full query
  // fails, retry once without it so at least the auto-match keeps working.
  function fetchVodMeta() {
    var vodId = getVodId();
    if (!vodId || metaVodId === vodId) return;
    metaVodId = vodId;
    matchPending = true;
    requestVodMeta(vodId, true);
  }

  function requestVodMeta(vodId, withMuteInfo) {
    var query = withMuteInfo
      ? 'query($id: ID!){ video(id:$id){ lengthSeconds createdAt publishedAt owner{ login } ' +
        'muteInfo{ mutedSegmentConnection{ nodes{ offset duration } } } } }'
      : 'query($id: ID!){ video(id:$id){ lengthSeconds createdAt publishedAt owner{ login } } }';

    GM_xmlhttpRequest({
      method: 'POST',
      url: GQL_URL,
      headers: { 'Client-ID': GQL_CLIENT_ID, 'Content-Type': 'application/json' },
      data: JSON.stringify({ query: query, variables: { id: vodId } }),
      onload: function (res) {
        var login = null;
        var date = null;
        var video = null;
        try {
          var payload = JSON.parse(res.responseText);
          video = payload && payload.data && payload.data.video;
        } catch (e) {}

        // A schema error kills the whole query — retry the reduced one.
        if (!video && withMuteInfo) {
          requestVodMeta(vodId, false);
          return;
        }

        try {
          if (video) {
            login = video.owner && video.owner.login;
            date = video.createdAt || video.publishedAt || null;
            vodCreatedAtMs = date ? (new Date(date).getTime() || 0) : 0;
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

  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return (h > 0 ? h + ':' : '') + (m < 10 && h > 0 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateLegend() {
    if (!legendEl) return;
    var lines = [];
    if (currentTrackId && trackDurationSec) {
      var recStart = getRecStartInVod();
      lines.push('🟢 Запись на шкале: ' + fmtTime(recStart) + ' — ' + fmtTime(recStart + trackDurationSec));
    }
    if (mutedSegments && mutedSegments.length) {
      lines.push('🔴 Красным — заглушённые участки оригинала: ' + mutedSegments.length);
    }
    if (lines.length) {
      legendEl.style.display = 'block';
      legendEl.textContent = lines.join('\\n');
      legendEl.style.whiteSpace = 'pre-line';
    } else {
      legendEl.style.display = 'none';
    }
  }

  // Draw two things on the Twitch seekbar: a green band where the recording's
  // audio covers the VOD, and red marks where Twitch muted the original.
  function renderTimelineOverlay() {
    var bar = document.querySelector('[data-a-target="player-seekbar"]');
    if (!bar) return;

    var total =
      boundVideo && isFinite(boundVideo.duration) && boundVideo.duration > 0
        ? boundVideo.duration
        : vodLengthSeconds;
    if (!total) return;

    var recStart = getRecStartInVod();
    var hasCoverage = Boolean(currentTrackId && trackDurationSec);
    var key = [
      Math.round(total),
      mutedSegments.length,
      Math.round(recStart),
      Math.round(trackDurationSec || 0),
      hasCoverage ? 1 : 0,
    ].join('|');

    var overlay = bar.querySelector('.tsr-timeline-overlay');
    if (overlay && overlay.getAttribute('data-key') === key) {
      return;
    }

    if (!overlay) {
      if (getComputedStyle(bar).position === 'static') bar.style.position = 'relative';
      overlay = document.createElement('div');
      overlay.className = 'tsr-timeline-overlay';
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

    if (hasCoverage) {
      var leftPct = Math.max(0, (recStart / total) * 100);
      var widthPct = Math.min(100 - leftPct, (trackDurationSec / total) * 100);
      var cov = document.createElement('div');
      cov.style.position = 'absolute';
      cov.style.top = '0';
      cov.style.bottom = '0';
      cov.style.left = leftPct + '%';
      cov.style.width = Math.max(0.3, widthPct) + '%';
      cov.style.background = 'rgba(63,213,109,0.35)';
      cov.style.borderLeft = '2px solid rgba(63,213,109,0.9)';
      cov.title = 'Здесь есть звук записи';
      overlay.appendChild(cov);
    }

    for (var i = 0; i < mutedSegments.length; i++) {
      var seg = mutedSegments[i];
      var mLeft = (seg.offset / total) * 100;
      var mWidth = (seg.duration / total) * 100;
      if (!isFinite(mLeft)) continue;
      var mark = document.createElement('div');
      mark.style.position = 'absolute';
      mark.style.top = '0';
      mark.style.bottom = '0';
      mark.style.left = Math.max(0, mLeft) + '%';
      mark.style.width = Math.max(0.15, mWidth) + '%';
      mark.style.background = 'rgba(229,72,77,0.7)';
      mark.title = 'Оригинал заглушён здесь';
      overlay.appendChild(mark);
    }

    overlay.setAttribute('data-key', key);
  }

  function clearAudioObjectUrl() {
    if (audioObjectUrl) {
      try {
        URL.revokeObjectURL(audioObjectUrl);
      } catch (e) {}
      audioObjectUrl = null;
    }
  }

  // ---- Кэш скачанного аудио в IndexedDB --------------------------------
  // Полностью скачанные дорожки хранятся сутки: обновление страницы или
  // возврат к тому же VOD берут файл из кэша вместо повторной закачки.
  var CACHE_DB = 'tsr-audio-cache';
  var CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  var CACHE_MAX_TRACKS = 3;

  function openCacheDb(cb) {
    var request;
    try {
      request = indexedDB.open(CACHE_DB, 1);
    } catch (e) {
      cb(null);
      return;
    }
    request.onupgradeneeded = function () {
      var db = request.result;
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files');
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
    };
    request.onsuccess = function () { cb(request.result); };
    request.onerror = function () { cb(null); };
  }

  function cacheGetAudio(trackId, cb) {
    openCacheDb(function (db) {
      if (!db) { cb(null); return; }
      try {
        var tx = db.transaction(['files', 'meta'], 'readonly');
        var metaReq = tx.objectStore('meta').get(trackId);
        var fileReq = tx.objectStore('files').get(trackId);
        tx.oncomplete = function () {
          db.close();
          var meta = metaReq.result;
          var blob = fileReq.result;
          var fresh = meta && Date.now() - meta.savedAt < CACHE_TTL_MS;
          cb(blob && fresh ? blob : null);
        };
        tx.onerror = function () { db.close(); cb(null); };
        tx.onabort = function () { db.close(); cb(null); };
      } catch (e) {
        try { db.close(); } catch (e2) {}
        cb(null);
      }
    });
  }

  function cachePutAudio(trackId, blob) {
    openCacheDb(function (db) {
      if (!db) return;
      try {
        var tx = db.transaction(['files', 'meta'], 'readwrite');
        var files = tx.objectStore('files');
        var meta = tx.objectStore('meta');
        files.put(blob, trackId);
        meta.put({ savedAt: Date.now() }, trackId);
        // Выкидываем протухшие записи и всё сверх лимита (старые — первыми).
        var metaRows = meta.getAll();
        var metaKeys = meta.getAllKeys();
        metaKeys.onsuccess = function () {
          var rows = metaRows.result || [];
          var keys = metaKeys.result || [];
          var entries = [];
          for (var i = 0; i < keys.length; i++) {
            entries.push({ key: keys[i], savedAt: (rows[i] && rows[i].savedAt) || 0 });
          }
          entries.sort(function (a, b) { return b.savedAt - a.savedAt; });
          for (var j = 0; j < entries.length; j++) {
            var expired = Date.now() - entries[j].savedAt >= CACHE_TTL_MS;
            if ((j >= CACHE_MAX_TRACKS || expired) && entries[j].key !== trackId) {
              files.delete(entries[j].key);
              meta.delete(entries[j].key);
            }
          }
        };
        tx.oncomplete = function () { db.close(); };
        tx.onerror = function () { db.close(); };
        tx.onabort = function () { db.close(); };
      } catch (e) {
        try { db.close(); } catch (e2) {}
      }
    });
  }

  // ---- Прогрессивная загрузка по частям (Range) --------------------------
  // Сервер отдаёт диапазоны, а .m4a записан с faststart (метаданные в начале
  // файла), поэтому скачанный префикс уже можно играть: звук включается после
  // первого куска, остальное докачивается в фоне. Подмена blob по мере
  // роста происходит редко (каждый раз объём утраивается), позицию после
  // подмены восстанавливает syncNow.
  var PROGRESSIVE_CHUNK_BYTES = 8 * 1024 * 1024;
  var progressiveState = null;

  function abortProgressive() {
    progressiveState = null;
  }

  function applyAudioBlob(blob) {
    clearAudioObjectUrl();
    audioObjectUrl = URL.createObjectURL(blob);
    audio.src = audioObjectUrl;
    audio.load();
  }

  // Загрузка с кэшем: сперва IndexedDB, иначе — скачивание по частям.
  function loadAudioBlob(track) {
    if (blobLoadingForId === track.id) return;
    blobLoadingForId = track.id;
    blobTriedForId = track.id;
    setStatus('Проверяю кэш аудио...');
    cacheGetAudio(track.id, function (cached) {
      if (currentTrackId !== track.id) {
        blobLoadingForId = null;
        return;
      }
      if (cached) {
        try {
          applyAudioBlob(cached);
          blobLoadingForId = null;
          setStatus('Аудио взято из кэша');
          syncNow(true);
          return;
        } catch (e) {}
      }
      startProgressiveDownload(track);
    });
  }

  function startProgressiveDownload(track) {
    var state = {
      trackId: track.id,
      chunks: [],
      loaded: 0,
      total: 0,
      // Сколько байт уже отдано в <audio> (граница проигрываемой части).
      playableBytes: 0,
      nextSwapAt: PROGRESSIVE_CHUNK_BYTES,
      retries: 0,
    };
    progressiveState = state;
    setStatus('Загружаю аудио...');
    fetchNextChunk(track, state);
  }

  function finishProgressive(track, state) {
    if (progressiveState === state) progressiveState = null;
    blobLoadingForId = null;
    var blob = new Blob(state.chunks, { type: 'audio/mp4' });
    if (currentTrackId === track.id) {
      try {
        applyAudioBlob(blob);
        setStatus('Аудио загружено');
        syncNow(true);
      } catch (e) {
        setStatus('Не удалось загрузить аудио');
        return;
      }
    }
    cachePutAudio(track.id, blob);
  }

  function retryChunk(track, state) {
    state.retries += 1;
    if (state.retries > 3) {
      if (progressiveState === state) progressiveState = null;
      blobLoadingForId = null;
      setStatus('Сервер недоступен — аудио не загружено');
      return;
    }
    setTimeout(function () { fetchNextChunk(track, state); }, 1000 * state.retries);
  }

  function fetchNextChunk(track, state) {
    if (progressiveState !== state || currentTrackId !== track.id) return;
    var start = state.loaded;
    GM_xmlhttpRequest({
      method: 'GET',
      url: SERVER + track.audioUrl,
      responseType: 'arraybuffer',
      headers: { Range: 'bytes=' + start + '-' + (start + PROGRESSIVE_CHUNK_BYTES - 1) },
      onload: function (res) {
        if (progressiveState !== state || currentTrackId !== track.id) return;
        if ((res.status !== 206 && res.status !== 200) || !res.response) {
          retryChunk(track, state);
          return;
        }
        state.retries = 0;
        state.chunks.push(res.response);
        state.loaded += res.response.byteLength;

        // Сервер не понял Range и прислал файл целиком — он уже полон.
        if (res.status === 200) {
          state.total = state.loaded;
          finishProgressive(track, state);
          return;
        }

        if (!state.total) {
          var match = /bytes\\s+\\d+-\\d+\\/(\\d+)/i.exec(res.responseHeaders || '');
          if (match) state.total = parseInt(match[1], 10) || 0;
        }

        var isLastChunk =
          (state.total && state.loaded >= state.total) ||
          res.response.byteLength < PROGRESSIVE_CHUNK_BYTES;
        if (isLastChunk) {
          finishProgressive(track, state);
          return;
        }

        if (state.loaded >= state.nextSwapAt) {
          state.playableBytes = state.loaded;
          try {
            applyAudioBlob(new Blob(state.chunks, { type: 'audio/mp4' }));
            syncNow(true);
          } catch (e) {}
          state.nextSwapAt = state.loaded * 3;
        }

        if (state.total) {
          var pct = Math.min(99, Math.round((state.loaded / state.total) * 100));
          setStatus(
            'Загружаю аудио ' + pct + '%' +
            (state.playableBytes ? ' — уже можно слушать' : '...'),
          );
        }

        fetchNextChunk(track, state);
      },
      onerror: function () {
        if (progressiveState !== state || currentTrackId !== track.id) return;
        retryChunk(track, state);
      },
    });
  }

  function loadAudioSource(track) {
    abortProgressive();
    clearAudioObjectUrl();
    if (mixedContent) {
      loadAudioBlob(track);
    } else {
      audio.src = SERVER + track.audioUrl;
      audio.load();
      setStatus('Дорожка выбрана');
    }
  }

  function selectTrack(id) {
    currentTrackId = id || null;
    if (selectEl) selectEl.value = currentTrackId || '';
    if (currentTrackId) {
      var track = findTrack(currentTrackId);
      trackDurationSec = (track && track.durationSec) || 0;
      trackRecordStartMs =
        track && track.recordingStartedAt
          ? (new Date(track.recordingStartedAt).getTime() || 0)
          : 0;
      trackRecordEndMs =
        track && track.recordingEndedAt
          ? (new Date(track.recordingEndedAt).getTime() || 0)
          : 0;
      blobTriedForId = null;
      if (track) loadAudioSource(track);
      // Picking a track with the original still playing is confusing — switch
      // straight to record-only so the selection is actually heard.
      if (mode === 'twitch') {
        applyMode('record');
      }
    } else {
      trackDurationSec = 0;
      trackRecordStartMs = 0;
      trackRecordEndMs = 0;
      audio.pause();
      audio.removeAttribute('src');
      abortProgressive();
      blobLoadingForId = null;
      clearAudioObjectUrl();
      var vv = getVideo();
      if (vv) vv.muted = false;
    }
    saveState();
    updateNowPlaying();
    updateLegend();
    syncNow(true);
  }

  function getVodTotal() {
    return boundVideo && isFinite(boundVideo.duration) && boundVideo.duration > 0
      ? boundVideo.duration
      : vodLengthSeconds;
  }

  // Where in the VOD the recording begins.
  // Most precise: capture END minus the real duration — the start computed
  // this way is immune to the recorder's startup delay and to the live
  // playlist rewind, both of which skew the capture-start timestamp.
  // Next: capture start minus broadcast start. Fallback (no dates): assume
  // the recording ran until the stream end and align it to the tail.
  function getRecStartInVod() {
    var total = getVodTotal();

    if (trackRecordEndMs && trackDurationSec && vodCreatedAtMs) {
      var fromEnd = (trackRecordEndMs - vodCreatedAtMs) / 1000 - trackDurationSec;
      // Sanity check: a start outside the VOD means the dates do not belong
      // to this broadcast (manually picked foreign track) — fall through.
      if (isFinite(fromEnd) && fromEnd > -600 && (!total || fromEnd < total)) {
        return Math.max(0, fromEnd);
      }
    }

    if (trackRecordStartMs && vodCreatedAtMs) {
      var start = (trackRecordStartMs - vodCreatedAtMs) / 1000;
      if (isFinite(start) && start > -600 && (!total || start < total)) {
        return Math.max(0, start);
      }
    }

    if (!trackDurationSec || !total) return 0;
    var tail = total - trackDurationSec;
    return tail > 1 ? tail : 0;
  }

  function applyMode(next) {
    mode = next;
    var v = getVideo();
    if (mode === 'twitch' || !currentTrackId) {
      audio.pause();
      if (v) v.muted = false;
    } else {
      // record => original muted; both => original audible alongside the audio.
      if (v) v.muted = (mode === 'record');
      syncNow(true);
    }
    for (var key in modeButtons) {
      modeButtons[key].style.background = key === mode ? '#9147ff' : '#2f2f35';
    }
    saveState();
    updateNowPlaying();
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
    // Twitch's player keeps resetting video.muted on its own events, which is
    // why the original audio leaks back in record mode — re-assert it here.
    if (mode === 'record' && !v.muted) v.muted = true;
    if (mode === 'both' && v.muted) v.muted = false;
    if (audio.playbackRate !== v.playbackRate) audio.playbackRate = v.playbackRate;
    var target = v.currentTime - getRecStartInVod() + offset;
    if (target < 0 || (trackDurationSec && target > trackDurationSec + 1)) {
      // Outside the recorded range — nothing to play here.
      if (!audio.paused) audio.pause();
      return;
    }
    if (progressiveState) {
      // Файл ещё докачивается: до первого куска играть нечего, а позицию за
      // границей скачанного держим на паузе — браузер видит усечённый файл
      // и на попытке играть дальше конца упал бы с ошибкой.
      if (!progressiveState.playableBytes) return;
      if (trackDurationSec && progressiveState.total) {
        var bytesNeeded =
          ((target + 5) / trackDurationSec) * progressiveState.total + 1048576;
        if (bytesNeeded > progressiveState.playableBytes) {
          if (!audio.paused) audio.pause();
          return;
        }
      }
    }
    if ((force || Math.abs(audio.currentTime - target) > MAX_DRIFT) && isFinite(target) && target >= 0) {
      audio.currentTime = target;
    }
    if (v.paused || v.ended) {
      if (!audio.paused) audio.pause();
    } else if (audio.paused) {
      var played = audio.play();
      if (played && played.catch) {
        played.catch(function () {
          setStatus('Браузер заблокировал звук — кликните по плееру, затем по «Запись».');
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

  function applyCollapsed() {
    if (!panel || !bodyEl || !headerTitleEl || !toggleHintEl) return;
    if (collapsed) {
      bodyEl.style.display = 'none';
      panel.style.width = 'auto';
      panel.style.opacity = '0.85';
      headerTitleEl.textContent = '🎧';
      toggleHintEl.textContent = '▲';
    } else {
      bodyEl.style.display = 'block';
      panel.style.width = '290px';
      panel.style.opacity = '1';
      headerTitleEl.textContent = '🎧 Звук записи (TSR)';
      toggleHintEl.textContent = '▾';
    }
  }

  var headerTitleEl = null;
  var toggleHintEl = null;

  function applySavedPosition() {
    if (!panel) return;
    var pos = null;
    try {
      pos = JSON.parse(localStorage.getItem('tsr-audio-pos') || 'null');
    } catch (e) {}
    if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
      var maxLeft = Math.max(0, window.innerWidth - 60);
      var maxTop = Math.max(0, window.innerHeight - 40);
      panel.style.left = Math.min(Math.max(0, pos.left), maxLeft) + 'px';
      panel.style.top = Math.min(Math.max(0, pos.top), maxTop) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }
  }

  // Let the user drag the panel by its header. A real drag suppresses the
  // collapse-toggle click that would otherwise fire on pointer release.
  function enableDrag(header) {
    var startX = 0;
    var startY = 0;
    var baseLeft = 0;
    var baseTop = 0;
    var dragging = false;
    var moved = false;

    header.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      var rect = panel.getBoundingClientRect();
      baseLeft = rect.left;
      baseTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      try {
        header.setPointerCapture(e.pointerId);
      } catch (err) {}
    });

    header.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      moved = true;
      var maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
      var maxTop = Math.max(0, window.innerHeight - 40);
      panel.style.left = Math.min(Math.max(0, baseLeft + dx), maxLeft) + 'px';
      panel.style.top = Math.min(Math.max(0, baseTop + dy), maxTop) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    });

    header.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      try {
        header.releasePointerCapture(e.pointerId);
      } catch (err) {}
      if (moved) {
        suppressClick = true;
        var rect = panel.getBoundingClientRect();
        try {
          localStorage.setItem(
            'tsr-audio-pos',
            JSON.stringify({ left: Math.round(rect.left), top: Math.round(rect.top) }),
          );
        } catch (err) {}
      }
    });
  }

  var suppressClick = false;

  function createPanel() {
    // Bottom-LEFT, away from the VOD chat which sits on the right.
    panel = el('div', {
      position: 'fixed', left: '16px', bottom: '16px', zIndex: '99999',
      background: '#18181b', color: '#efeff1', borderRadius: '8px',
      border: '1px solid #2f2f35', font: '12px/1.4 Inter, sans-serif',
      width: '290px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      transition: 'opacity 0.15s',
    });

    var header = el('div', {
      padding: '8px 10px', cursor: 'move', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', gap: '10px',
      userSelect: 'none', touchAction: 'none',
    });
    headerTitleEl = el('span', null, '🎧 Звук записи (TSR)');
    header.appendChild(headerTitleEl);
    toggleHintEl = el('span', { opacity: '0.6' }, '▾');
    header.appendChild(toggleHintEl);
    header.addEventListener('click', function () {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      collapsed = !collapsed;
      try {
        localStorage.setItem('tsr-audio-collapsed', collapsed ? '1' : '0');
      } catch (e) {}
      applyCollapsed();
    });
    enableDrag(header);
    panel.appendChild(header);

    bodyEl = el('div', { padding: '0 10px 10px 10px' });

    nowPlayingEl = el('div', {
      fontWeight: '600', padding: '6px 8px', borderRadius: '4px',
      marginBottom: '8px', background: '#2f2f35', textAlign: 'center',
    }, '');
    bodyEl.appendChild(nowPlayingEl);

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

    var offsetRow = el('div', { display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '8px' });
    offsetRow.appendChild(el('span', { opacity: '0.7' }, 'Сдвиг, c'));
    offsetRow.appendChild(makeButton('−5', function () { setOffset(offset - 5); }));
    offsetRow.appendChild(makeButton('−0.5', function () { setOffset(offset - 0.5); }));
    offsetInput = el('input', {
      width: '52px', background: '#0e0e10', color: '#efeff1',
      border: '1px solid #2f2f35', borderRadius: '4px', padding: '3px 4px', textAlign: 'center',
    });
    offsetInput.type = 'number';
    offsetInput.step = '0.1';
    offsetInput.value = '0.0';
    offsetInput.addEventListener('change', function () { setOffset(parseFloat(offsetInput.value) || 0); });
    offsetRow.appendChild(offsetInput);
    offsetRow.appendChild(makeButton('+0.5', function () { setOffset(offset + 0.5); }));
    offsetRow.appendChild(makeButton('+5', function () { setOffset(offset + 5); }));
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
    updateNowPlaying();
    applyCollapsed();
    applySavedPosition();
    fetchTracks();
    fetchVodMeta();
  }

  // Big, unambiguous indicator of what is actually coming out of the speakers.
  function updateNowPlaying() {
    if (!nowPlayingEl) return;

    if (!currentTrackId || mode === 'twitch') {
      nowPlayingEl.textContent = '▶ Twitch (оригинал)';
      nowPlayingEl.style.background = '#2f2f35';
      nowPlayingEl.style.color = '#efeff1';
      return;
    }

    if (mode === 'record') {
      nowPlayingEl.textContent = '▶ Запись (звук Twitch выключен)';
      nowPlayingEl.style.background = '#1f7a3d';
      nowPlayingEl.style.color = '#fff';
      return;
    }

    nowPlayingEl.textContent = '▶ Оба (Twitch + запись)';
    nowPlayingEl.style.background = '#5a3d9c';
    nowPlayingEl.style.color = '#fff';
  }

  function removePanel() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
    bodyEl = null;
    headerTitleEl = null;
    toggleHintEl = null;
    nowPlayingEl = null;
    selectEl = null;
    statusEl = null;
    offsetInput = null;
    legendEl = null;
    modeButtons = {};
  }

  // A direct <audio src> load can fail on the https Twitch page when the
  // server is http (mixed content). Retry once through the blob loader.
  audio.addEventListener('error', function () {
    if (!currentTrackId || mixedContent) return;
    if (blobTriedForId === currentTrackId) return;
    var track = findTrack(currentTrackId);
    if (track) {
      setStatus('Прямая загрузка не удалась — пробую через прокси...');
      loadAudioBlob(track);
    }
  });

  try {
    if (document.body) document.body.appendChild(audio);
  } catch (e) {}

  function tick() {
    // Twitch is a SPA: react to URL changes without page reloads.
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      audio.pause();
      currentTrackId = null;
      trackDurationSec = 0;
      trackRecordStartMs = 0;
      trackRecordEndMs = 0;
      boundVideo = null;
      metaVodId = null;
      autoMatchedTrack = null;
      mutedSegments = [];
      vodLengthSeconds = 0;
      vodCreatedAtMs = 0;
      abortProgressive();
      blobLoadingForId = null;
      clearAudioObjectUrl();
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
    renderTimelineOverlay();

    if (mode !== 'twitch' && currentTrackId && !audio.error) {
      var v = getVideo();
      // Пока идёт докачка, строку статуса занимает прогресс загрузки.
      if (v && !v.paused && !progressiveState) {
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
