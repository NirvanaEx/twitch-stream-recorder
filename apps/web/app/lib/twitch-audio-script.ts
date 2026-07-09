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
// @version      2.0
// @description  Накладывает звук, записанный twitch-stream-recorder, на VOD Twitch, и заменяет чат VOD на записанный: видны удалённые и самые первые сообщения, сдвиг чата подстраивается отдельно. Чат работает и без аудиодорожки — с оригинальным звуком. Громкость до 300% с компрессором.
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
  // Нужен для WebAudio-усиления при прямой https-загрузке: без CORS-режима
  // MediaElementSource отдаёт тишину. Сервер шлёт Access-Control-Allow-Origin
  // на аудио-эндпоинте; blob-путь от этого атрибута не зависит.
  audio.crossOrigin = 'anonymous';
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

  // ---- Чат записи (замена чата VOD) --------------------------------------
  // Записанный чат содержит и удалённые сообщения, и самые первые (VOD-чат
  // Twitch их часто теряет). Свой сдвиг лечит рассинхрон после смены задержки
  // или лагов стрима.
  var chatMode = 'twitch'; // twitch | record
  var chatOffset = 0;
  // Сессии с чатом этого эфира — отдельный матч, НЕ привязанный к аудио:
  // чат работает и с оригинальным звуком Twitch, и когда аудио уже удалено.
  var chatSessions = [];
  var chatMatchPending = false;
  var chatSelectionResolved = false;
  var vodChannelLogin = '';
  var chatMessages = []; // merged from all sessions of the broadcast, sorted
  var chatEmoteMap = {}; // 7tv name -> url (из снапшота записи)
  var chatDeletedCount = 0;
  var chatLoadedKey = '';
  var chatLoading = false;
  var chatRetryAt = 0;
  var chatLoadToken = 0;
  var chatOverlay = null;
  var chatListEl = null;
  var chatJumpEl = null;
  var chatHeaderInfoEl = null;
  var chatPinned = true;
  var chatRenderedTo = 0;
  var chatForceRebuild = false;
  var chatModeButtons = {};
  var chatOffsetRow = null;
  var chatOffsetInput = null;
  var CHAT_MAX_VISIBLE = 150;
  // Кандидаты на контейнер чата VOD (Twitch периодически меняет разметку).
  var CHAT_HOST_SELECTORS = [
    '.video-chat',
    '[data-test-selector="video-chat"]',
    '.video-chat__message-list-wrapper',
    'section[data-test-selector="chat-room-component-layout"]',
    '[data-a-target="right-column-chat-bar"]',
  ];

  // ---- Усиление громкости и компрессор ----------------------------------
  // До 100% работает обычная громкость <audio>; выше подключается WebAudio:
  // source -> [компрессор] -> gain -> выход. Настройки общие для всех VOD.
  var audioCtx = null;
  var audioSourceNode = null;
  var gainNode = null;
  var compressorNode = null;
  var boost = 1; // 0..3 => 0..300%
  var compressorOn = false;
  try {
    var fxSaved = JSON.parse(localStorage.getItem('tsr-audio-fx') || 'null');
    if (fxSaved && typeof fxSaved.boost === 'number') {
      boost = Math.min(3, Math.max(0, fxSaved.boost));
    }
    if (fxSaved && typeof fxSaved.comp === 'boolean') compressorOn = fxSaved.comp;
  } catch (e) {}

  function saveFx() {
    try {
      localStorage.setItem('tsr-audio-fx', JSON.stringify({ boost: boost, comp: compressorOn }));
    } catch (e) {}
  }

  function resumeAudioCtx() {
    if (audioCtx && audioCtx.state === 'suspended') {
      try {
        var resumed = audioCtx.resume();
        if (resumed && resumed.catch) resumed.catch(function () {});
      } catch (e) {}
    }
  }

  function ensureAudioGraph() {
    if (audioCtx) return true;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    try {
      audioCtx = new Ctx();
      audioSourceNode = audioCtx.createMediaElementSource(audio);
      gainNode = audioCtx.createGain();
      compressorNode = audioCtx.createDynamicsCompressor();
      // Мягкое «радийное» сжатие: тихая речь подтягивается (Chrome добавляет
      // компенсирующее усиление сам), а пики не режут уши при >100%.
      compressorNode.threshold.value = -28;
      compressorNode.knee.value = 30;
      compressorNode.ratio.value = 6;
      compressorNode.attack.value = 0.003;
      compressorNode.release.value = 0.25;
      rewireAudioGraph();
      return true;
    } catch (e) {
      audioCtx = null;
      audioSourceNode = null;
      gainNode = null;
      compressorNode = null;
      return false;
    }
  }

  function rewireAudioGraph() {
    if (!audioCtx) return;
    try { audioSourceNode.disconnect(); } catch (e) {}
    try { compressorNode.disconnect(); } catch (e) {}
    try { gainNode.disconnect(); } catch (e) {}
    if (compressorOn) {
      audioSourceNode.connect(compressorNode);
      compressorNode.connect(gainNode);
    } else {
      audioSourceNode.connect(gainNode);
    }
    gainNode.connect(audioCtx.destination);
  }

  function applyFx() {
    var needGraph = boost > 1 || compressorOn;
    if (needGraph && !ensureAudioGraph()) {
      // WebAudio недоступен — усиление ограничено обычными 100%.
      audio.volume = Math.min(1, boost);
      return;
    }
    audio.volume = Math.min(1, boost);
    if (gainNode) gainNode.gain.value = Math.max(1, boost);
    resumeAudioCtx();
  }

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
  // Все дорожки этого же эфира (рекордер перезапускался — сессий несколько):
  // скрипт переключается между ними сам, по позиции на шкале VOD.
  var groupTracks = [];
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
  var volumeLabelEl = null;
  var compressorBtnEl = null;

  // Панель полупрозрачна, чтобы не мешать смотреть; под курсором — яркая.
  var PANEL_OPACITY_IDLE = '0.6';
  var PANEL_OPACITY_COLLAPSED = '0.45';
  var panelHovered = false;

  function syncPanelOpacity() {
    if (!panel) return;
    panel.style.opacity = panelHovered
      ? '1'
      : collapsed
        ? PANEL_OPACITY_COLLAPSED
        : PANEL_OPACITY_IDLE;
  }

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
      localStorage.setItem(storeKey(), JSON.stringify({
        trackId: currentTrackId, offset: offset, mode: mode,
        chatMode: chatMode, chatOffset: chatOffset,
      }));
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
        // Дата начала эфира — точка отсчёта шкалы VOD; с ней позиции
        // сообщений чата пересчитываются на точные абсолютные метки.
        computeChatVodTimes();
        if (login) {
          vodChannelLogin = String(login).toLowerCase();
          matchTrack(login, date);
          fetchChatSessions(login, date);
        } else {
          matchPending = false;
          resolveSelection();
          resolveChatSelection();
        }
      },
      onerror: function () {
        matchPending = false;
        resolveSelection();
        resolveChatSelection();
      },
    });
  }

  // Отдельный от аудио поиск сессий с чатом: канал и дата эфира те же, но на
  // сервере не требуется живая аудиодорожка.
  function fetchChatSessions(login, date) {
    chatMatchPending = true;
    var url =
      SERVER + '/api/public/streams/chat-replay/match?channel=' + encodeURIComponent(login) +
      (date ? '&date=' + encodeURIComponent(date) : '') +
      (vodLengthSeconds ? '&length=' + Math.round(vodLengthSeconds) : '');
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function (res) {
        try {
          chatSessions = (JSON.parse(res.responseText).items) || [];
        } catch (e) {
          chatSessions = [];
        }
        chatMatchPending = false;
        resolveChatSelection();
      },
      onerror: function () {
        chatMatchPending = false;
        resolveChatSelection();
      },
    });
  }

  function matchTrack(login, date) {
    var url =
      SERVER + '/api/public/streams/audio-tracks/match?channel=' + encodeURIComponent(login) +
      (date ? '&date=' + encodeURIComponent(date) : '') +
      (vodLengthSeconds ? '&length=' + Math.round(vodLengthSeconds) : '');
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function (res) {
        try {
          var payload = JSON.parse(res.responseText);
          autoMatchedTrack = payload.item || null;
          groupTracks = payload.items && payload.items.length
            ? payload.items
            : autoMatchedTrack ? [autoMatchedTrack] : [];
        } catch (e) {
          autoMatchedTrack = null;
          groupTracks = [];
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
      for (var g = 0; g < groupTracks.length; g++) {
        ensureTrackInList(groupTracks[g]);
      }
      ensureTrackInList(autoMatchedTrack);
      var channelOffset = loadChannelOffset(autoMatchedTrack.channelLogin);
      if (channelOffset !== null) {
        offset = channelOffset;
        if (offsetInput) offsetInput.value = offset.toFixed(1);
      }
      selectTrack(autoMatchedTrack.id);
      var groupNote = groupTracks.length > 1 ? ' · дорожек: ' + groupTracks.length : '';
      setStatus(
        (channelOffset !== null
          ? 'Дорожка найдена · сдвиг канала ' + channelOffset.toFixed(1) + ' c'
          : 'Дорожка найдена автоматически') + groupNote,
      );
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
    if (groupTracks.length > 1) {
      lines.push('🎧 Дорожек этого стрима: ' + groupTracks.length + ' — переключаются сами');
    }
    if (currentTrackId && trackDurationSec) {
      var recStart = getRecStartInVod();
      lines.push('🟢 Запись на шкале: ' + fmtTime(recStart) + ' — ' + fmtTime(recStart + trackDurationSec));
    }
    if (mutedSegments && mutedSegments.length) {
      lines.push('🔴 В режиме «Twitch» полоска сверху — заглушённые места: ' + mutedSegments.length);
    }
    if (lines.length) {
      legendEl.style.display = 'block';
      legendEl.textContent = lines.join('\\n');
      legendEl.style.whiteSpace = 'pre-line';
    } else {
      legendEl.style.display = 'none';
    }
  }

  // Тонкая полоска НАД сикбаром Twitch (сам сикбар не трогаем): в режиме
  // «Twitch» красным показаны заглушённые места оригинала, в режимах с
  // записью зелёным — покрытие наших дорожек (всех сегментов группы).
  function renderTimelineOverlay() {
    var bar = document.querySelector('[data-a-target="player-seekbar"]');
    if (!bar) return;

    var total =
      boundVideo && isFinite(boundVideo.duration) && boundVideo.duration > 0
        ? boundVideo.duration
        : vodLengthSeconds;
    if (!total) return;

    var showRecord = mode !== 'twitch' && Boolean(currentTrackId);
    var bands = [];
    if (showRecord) {
      var list = groupTracks.length ? groupTracks : [findTrack(currentTrackId)];
      for (var t = 0; t < list.length; t++) {
        if (!list[t] || !(list[t].durationSec > 0)) continue;
        bands.push({ start: getRecStartForTrack(list[t]), duration: list[t].durationSec });
      }
    }

    var key = [
      Math.round(total),
      mode,
      mutedSegments.length,
      bands
        .map(function (band) {
          return Math.round(band.start) + ':' + Math.round(band.duration);
        })
        .join(','),
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
      overlay.style.right = '0';
      overlay.style.top = '-7px';
      overlay.style.height = '3px';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '15';
      bar.appendChild(overlay);
    }

    overlay.innerHTML = '';

    function addBand(startSec, durationSec, color) {
      var leftPct = (startSec / total) * 100;
      var widthPct = (durationSec / total) * 100;
      if (!isFinite(leftPct) || !isFinite(widthPct)) return;
      leftPct = Math.max(0, leftPct);
      var node = document.createElement('div');
      node.style.position = 'absolute';
      node.style.top = '0';
      node.style.bottom = '0';
      node.style.left = leftPct + '%';
      node.style.width = Math.max(0.15, Math.min(100 - leftPct, widthPct)) + '%';
      node.style.background = color;
      node.style.borderRadius = '2px';
      overlay.appendChild(node);
    }

    if (showRecord) {
      for (var b = 0; b < bands.length; b++) {
        addBand(bands[b].start, bands[b].duration, 'rgba(63,213,109,0.95)');
      }
    } else {
      for (var m = 0; m < mutedSegments.length; m++) {
        addBand(mutedSegments[m].offset, mutedSegments[m].duration, 'rgba(229,72,77,0.95)');
      }
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
  // Файл качается кусками по 8 МБ и НЕ подряд: сначала голова (там благодаря
  // faststart лежит mp4-индекс), затем куски вокруг места, которое сейчас
  // смотрят, потом всё остальное. В blob дыры заполняются нулями — индекс
  // настоящий, поэтому перемотка в любую уже скачанную область работает
  // сразу, не дожидаясь конца загрузки. Куда качать в первую очередь,
  // загрузчику сообщает syncNow (поле targetByte).
  var PROGRESSIVE_CHUNK_BYTES = 8 * 1024 * 1024;
  // Сколько байт до/после текущей позиции должно быть скачано, чтобы играть.
  var PLAYBACK_BACK_MARGIN_BYTES = 512 * 1024;
  var PLAYBACK_LOOKAHEAD_BYTES = 2 * 1024 * 1024;
  var progressiveState = null;
  // Один общий буфер нулей для всех дыр, чтобы не плодить копии.
  var zeroChunkBuffer = null;

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
      track: track,
      chunks: {}, // индекс куска -> ArrayBuffer
      haveCount: 0,
      totalChunks: 0,
      total: 0,
      // Какие куски вошли в текущий blob (null — blob ещё не создавался).
      blobHave: null,
      // Байтовая позиция, которую сейчас смотрят; обновляет syncNow.
      targetByte: 0,
      retries: 0,
      lastErrorSwapAt: 0,
    };
    progressiveState = state;
    setStatus('Загружаю аудио...');
    fetchNextChunk(state);
  }

  function chunkIndexAt(byte) {
    return Math.floor(byte / PROGRESSIVE_CHUNK_BYTES);
  }

  // Порядок закачки: голова файла (mp4-индекс), затем от текущей позиции
  // зрителя до конца, затем оставшиеся дыры с начала.
  function nextChunkIndex(state) {
    if (!(0 in state.chunks)) return 0;
    if (state.totalChunks > 1 && !(1 in state.chunks)) return 1;
    var priority = Math.min(
      state.totalChunks - 1,
      Math.max(0, chunkIndexAt(state.targetByte)),
    );
    for (var i = priority; i < state.totalChunks; i++) {
      if (!(i in state.chunks)) return i;
    }
    for (var j = 0; j < priority; j++) {
      if (!(j in state.chunks)) return j;
    }
    return -1;
  }

  // Есть ли данные вокруг текущей позиции: в скачанном (inBlob=false) или в
  // уже отданном плееру blob (inBlob=true).
  function progressiveWindowReady(state, inBlob) {
    if (!state.totalChunks) return false;
    var from = Math.max(
      0,
      chunkIndexAt(Math.max(0, state.targetByte - PLAYBACK_BACK_MARGIN_BYTES)),
    );
    var to = Math.min(
      state.totalChunks - 1,
      chunkIndexAt(state.targetByte + PLAYBACK_LOOKAHEAD_BYTES),
    );
    for (var i = from; i <= to; i++) {
      var present = inBlob ? Boolean(state.blobHave && state.blobHave[i]) : i in state.chunks;
      if (!present) return false;
    }
    return true;
  }

  // Собирает blob из скачанных кусков (дыры — нулями) и отдаёт его в <audio>.
  // Подмена не бесплатна (короткий рестарт элемента), поэтому вызывается
  // только когда открывает зрителю новую область.
  function swapProgressiveBlob(state) {
    if (!state.total || !state.totalChunks) return;
    if (!zeroChunkBuffer) zeroChunkBuffer = new ArrayBuffer(PROGRESSIVE_CHUNK_BYTES);
    var parts = [];
    var have = new Array(state.totalChunks);
    for (var i = 0; i < state.totalChunks; i++) {
      var expected = Math.min(
        PROGRESSIVE_CHUNK_BYTES,
        state.total - i * PROGRESSIVE_CHUNK_BYTES,
      );
      if (i in state.chunks) {
        parts.push(state.chunks[i]);
        have[i] = true;
      } else {
        parts.push(
          expected === PROGRESSIVE_CHUNK_BYTES ? zeroChunkBuffer : new ArrayBuffer(expected),
        );
        have[i] = false;
      }
    }
    state.blobHave = have;
    try {
      applyAudioBlob(new Blob(parts, { type: 'audio/mp4' }));
      syncNow(true);
    } catch (e) {}
  }

  function maybeSwapProgressive(state) {
    // Голова обязательна: без неё элемент не распарсит файл вообще.
    if (!(0 in state.chunks)) return;
    if (state.totalChunks > 1 && !(1 in state.chunks)) return;
    if (!progressiveWindowReady(state, false)) return; // вокруг зрителя пусто
    if (state.blobHave && progressiveWindowReady(state, true)) return; // уже играется
    swapProgressiveBlob(state);
  }

  function finishProgressive(state) {
    var track = state.track;
    if (progressiveState === state) progressiveState = null;
    blobLoadingForId = null;
    var parts = [];
    for (var i = 0; i < state.totalChunks; i++) parts.push(state.chunks[i]);
    var blob = new Blob(parts, { type: 'audio/mp4' });
    if (currentTrackId === track.id) {
      try {
        applyAudioBlob(blob);
        setStatus('Аудио загружено полностью');
        syncNow(true);
      } catch (e) {
        setStatus('Не удалось загрузить аудио');
        return;
      }
    }
    cachePutAudio(track.id, blob);
  }

  function retryChunk(state) {
    state.retries += 1;
    if (state.retries > 3) {
      if (progressiveState === state) progressiveState = null;
      blobLoadingForId = null;
      setStatus('Сервер недоступен — аудио не загружено');
      return;
    }
    setTimeout(function () { fetchNextChunk(state); }, 1000 * state.retries);
  }

  function fetchNextChunk(state) {
    if (progressiveState !== state || currentTrackId !== state.track.id) return;
    // Пока total неизвестен (до первого ответа), качаем нулевой кусок.
    var index = state.total ? nextChunkIndex(state) : 0;
    if (index === -1) {
      finishProgressive(state);
      return;
    }
    var start = index * PROGRESSIVE_CHUNK_BYTES;
    var end = state.total
      ? Math.min(state.total, start + PROGRESSIVE_CHUNK_BYTES) - 1
      : start + PROGRESSIVE_CHUNK_BYTES - 1;
    GM_xmlhttpRequest({
      method: 'GET',
      url: SERVER + state.track.audioUrl,
      responseType: 'arraybuffer',
      headers: { Range: 'bytes=' + start + '-' + end },
      onload: function (res) {
        if (progressiveState !== state || currentTrackId !== state.track.id) return;
        if ((res.status !== 206 && res.status !== 200) || !res.response) {
          retryChunk(state);
          return;
        }
        state.retries = 0;

        // Сервер не понял Range и прислал файл целиком — он уже полон.
        if (res.status === 200) {
          if (index !== 0) {
            // Полный файл в ответ на неголовной кусок — что-то не так,
            // записывать его как кусок нельзя.
            retryChunk(state);
            return;
          }
          state.total = res.response.byteLength;
          state.totalChunks = 1;
          state.chunks = { 0: res.response };
          state.haveCount = 1;
          finishProgressive(state);
          return;
        }

        if (!state.total) {
          var match = /bytes\\s+\\d+-\\d+\\/(\\d+)/i.exec(res.responseHeaders || '');
          var parsedTotal = match ? parseInt(match[1], 10) || 0 : 0;
          if (!parsedTotal) {
            retryChunk(state);
            return;
          }
          state.total = parsedTotal;
          state.totalChunks = Math.max(1, Math.ceil(parsedTotal / PROGRESSIVE_CHUNK_BYTES));
        }

        if (!(index in state.chunks)) {
          state.chunks[index] = res.response;
          state.haveCount += 1;
        }

        if (state.haveCount >= state.totalChunks) {
          finishProgressive(state);
          return;
        }

        maybeSwapProgressive(state);

        var pct = Math.min(99, Math.round((state.haveCount / state.totalChunks) * 100));
        setStatus(
          'Загружаю аудио ' + pct + '%' +
          (state.blobHave ? ' — можно слушать и перематывать' : '...'),
        );

        fetchNextChunk(state);
      },
      onerror: function () {
        if (progressiveState !== state || currentTrackId !== state.track.id) return;
        retryChunk(state);
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
  function getRecStartForTrack(track) {
    var total = getVodTotal();
    var durationSec = (track && track.durationSec) || 0;
    var recordEndMs =
      track && track.recordingEndedAt ? (new Date(track.recordingEndedAt).getTime() || 0) : 0;
    var recordStartMs =
      track && track.recordingStartedAt ? (new Date(track.recordingStartedAt).getTime() || 0) : 0;

    if (recordEndMs && durationSec && vodCreatedAtMs) {
      var fromEnd = (recordEndMs - vodCreatedAtMs) / 1000 - durationSec;
      // Sanity check: a start outside the VOD means the dates do not belong
      // to this broadcast (manually picked foreign track) — fall through.
      if (isFinite(fromEnd) && fromEnd > -600 && (!total || fromEnd < total)) {
        return Math.max(0, fromEnd);
      }
    }

    if (recordStartMs && vodCreatedAtMs) {
      var start = (recordStartMs - vodCreatedAtMs) / 1000;
      if (isFinite(start) && start > -600 && (!total || start < total)) {
        return Math.max(0, start);
      }
    }

    if (!durationSec || !total) return 0;
    var tail = total - durationSec;
    return tail > 1 ? tail : 0;
  }

  function getRecStartInVod() {
    return getRecStartForTrack(findTrack(currentTrackId));
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

    // Несколько дорожек одного стрима: играем ту, которая покрывает текущее
    // место VOD, и переключаемся на границах автоматически.
    if (groupTracks.length > 1) {
      var covering = null;
      for (var gi = 0; gi < groupTracks.length; gi++) {
        var groupStart = getRecStartForTrack(groupTracks[gi]);
        var groupDur = groupTracks[gi].durationSec || 0;
        if (v.currentTime >= groupStart && v.currentTime < groupStart + groupDur) {
          covering = groupTracks[gi];
          break;
        }
      }
      if (covering && covering.id !== currentTrackId) {
        ensureTrackInList(covering);
        selectTrack(covering.id); // сам вызовет syncNow после загрузки
        return;
      }
    }

    var target = v.currentTime - getRecStartInVod() + offset;
    if (target < 0 || (trackDurationSec && target > trackDurationSec + 1)) {
      // Outside the recorded range — nothing to play here.
      if (!audio.paused) audio.pause();
      return;
    }
    if (progressiveState) {
      var st = progressiveState;
      // Сообщаем загрузчику, где сейчас смотрят: он качает в первую очередь
      // отсюда, поэтому старт с любого места не ждёт весь файл.
      if (trackDurationSec && st.total) {
        st.targetByte = Math.max(
          0,
          Math.min(st.total - 1, Math.floor((target / trackDurationSec) * st.total)),
        );
      }
      if (!st.blobHave) return; // первые куски ещё в пути
      if (!progressiveWindowReady(st, true)) {
        if (progressiveWindowReady(st, false)) {
          // Нужная область уже скачана, но плеер держит старый blob — меняем.
          swapProgressiveBlob(st);
        } else {
          // Ещё не скачано: держим на паузе, загрузчик уже переключился сюда.
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

  // Подобранный вручную сдвиг запоминается и для канала: систематическая
  // часть рассинхрона (задержка HLS у Twitch, округление меток) у одного
  // канала обычно одинакова, так что новый VOD стартует с прошлого сдвига,
  // а не с нуля.
  function channelOffsetKey(login) {
    return 'tsr-audio-choffset-' + (login || '').toLowerCase();
  }

  function loadChannelOffset(login) {
    if (!login) return null;
    try {
      var raw = localStorage.getItem(channelOffsetKey(login));
      if (raw === null) return null;
      var num = parseFloat(raw);
      return isFinite(num) ? num : null;
    } catch (e) {
      return null;
    }
  }

  function saveChannelOffset() {
    var track = findTrack(currentTrackId);
    if (!track) return;
    try {
      localStorage.setItem(channelOffsetKey(track.channelLogin), String(offset));
    } catch (e) {}
  }

  function setOffset(value) {
    offset = Math.round(value * 10) / 10;
    if (offsetInput) offsetInput.value = offset.toFixed(1);
    saveState();
    saveChannelOffset();
    syncNow(true);
  }

  // ---- Чат записи: загрузка, синхронизация и оверлей ---------------------

  function channelChatKey(login) {
    return 'tsr-chat-pref-' + (login || '').toLowerCase();
  }

  function loadChannelChatPrefs(login) {
    if (!login) return null;
    try {
      return JSON.parse(localStorage.getItem(channelChatKey(login)) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveChannelChatPrefs() {
    var track = findTrack(currentTrackId) || autoMatchedTrack;
    var login = vodChannelLogin || (track && track.channelLogin) || '';
    if (!login) return;
    try {
      localStorage.setItem(
        channelChatKey(login),
        JSON.stringify({ mode: chatMode, offset: chatOffset }),
      );
    } catch (e) {}
  }

  // Включение чата на этом VOD: явный выбор на этом VOD (в т.ч. выключение)
  // важнее общей настройки канала. Вызывается, когда завершился поиск сессий
  // чата — независимо от того, нашлась ли аудиодорожка.
  function resolveChatSelection() {
    if (chatSelectionResolved) return;
    chatSelectionResolved = true;
    var saved = loadState();
    var prefs = loadChannelChatPrefs(vodChannelLogin);
    if (saved && typeof saved.chatOffset === 'number') {
      chatOffset = saved.chatOffset;
    } else if (prefs && typeof prefs.offset === 'number') {
      chatOffset = prefs.offset;
    }
    var wanted = saved && saved.chatMode ? saved.chatMode : prefs && prefs.mode;
    applyChatMode(wanted === 'record' ? 'record' : 'twitch');
  }

  // Сессия-источник сообщения: сперва среди сессий чата, затем среди
  // аудиодорожек (ручной выбор без совпадения по каналу/дате).
  function findChatSession(id) {
    for (var i = 0; i < chatSessions.length; i++) {
      if (chatSessions[i].id === id) return chatSessions[i];
    }
    return findTrack(id);
  }

  function applyChatMode(next) {
    chatMode = next === 'record' ? 'record' : 'twitch';
    updateChatUi();
    if (chatMode === 'record') {
      ensureChatLoaded();
    } else {
      removeChatOverlay();
    }
    saveState();
    saveChannelChatPrefs();
  }

  function updateChatUi() {
    for (var key in chatModeButtons) {
      chatModeButtons[key].style.background = key === chatMode ? '#9147ff' : '#2f2f35';
    }
    if (chatOffsetRow) chatOffsetRow.style.display = chatMode === 'record' ? 'flex' : 'none';
    if (chatOffsetInput) chatOffsetInput.value = String(chatOffset);
  }

  function setChatOffset(value) {
    chatOffset = Math.round((isFinite(value) ? value : 0) * 10) / 10;
    if (chatOffsetInput) chatOffsetInput.value = String(chatOffset);
    chatForceRebuild = true;
    saveState();
    saveChannelChatPrefs();
  }

  function resetChatState() {
    chatLoadToken += 1; // ответы незавершённых запросов будут отброшены
    chatSessions = [];
    chatMatchPending = false;
    chatSelectionResolved = false;
    vodChannelLogin = '';
    chatMessages = [];
    chatEmoteMap = {};
    chatDeletedCount = 0;
    chatLoadedKey = '';
    chatLoading = false;
    chatRetryAt = 0;
    chatRenderedTo = 0;
    chatForceRebuild = false;
    removeChatOverlay();
  }

  // Чат собирается со всех сессий этого эфира (рекордер мог перезапускаться).
  // Основной источник — отдельный чат-матч; аудиодорожки остаются запасным
  // путём (например, дорожка выбрана вручную, а GQL не дал канал/дату).
  // При изменении набора сессий ключ меняется и чат перечитывается.
  function ensureChatLoaded() {
    if (chatMode !== 'record') return;
    if (chatLoading || chatMatchPending) return;
    if (chatRetryAt && Date.now() < chatRetryAt) return;

    var list = chatSessions.length ? chatSessions : [];
    if (!list.length) list = groupTracks.length ? groupTracks : [];
    if (!list.length && currentTrackId && findTrack(currentTrackId)) {
      list = [findTrack(currentTrackId)];
    }
    if (!list.length && autoMatchedTrack) list = [autoMatchedTrack];
    if (!list.length) return;

    var ids = [];
    for (var i = 0; i < list.length; i++) ids.push(list[i].id);
    ids.sort();
    var key = ids.join(',');
    if (chatLoadedKey === key) return;

    chatLoading = true;
    var token = chatLoadToken;
    var pending = ids.length;
    var buckets = [];
    var failures = 0;

    function done() {
      pending -= 1;
      if (pending > 0) return;
      if (token !== chatLoadToken) return; // ушли на другой VOD
      chatLoading = false;
      buildChatTimeline(buckets);
      if (failures && !chatMessages.length) {
        // Все запросы упали — попробуем ещё раз, но не чаще раза в 15 секунд.
        chatLoadedKey = '';
        chatRetryAt = Date.now() + 15000;
      } else {
        chatLoadedKey = key;
        chatRetryAt = 0;
      }
    }

    for (var k = 0; k < ids.length; k++) {
      (function (sessionId) {
        GM_xmlhttpRequest({
          method: 'GET',
          url: SERVER + '/api/public/streams/' + sessionId + '/chat-replay',
          onload: function (res) {
            if (token !== chatLoadToken) return;
            try {
              buckets.push({ sessionId: sessionId, payload: JSON.parse(res.responseText) });
            } catch (e) {
              failures += 1;
            }
            done();
          },
          onerror: function () {
            if (token !== chatLoadToken) return;
            failures += 1;
            done();
          },
        });
      })(ids[k]);
    }
  }

  function buildChatTimeline(buckets) {
    var seen = {};
    var merged = [];
    chatEmoteMap = {};
    chatDeletedCount = 0;

    for (var i = 0; i < buckets.length; i++) {
      var payload = buckets[i].payload || {};
      var snap = payload.emotes && payload.emotes.emotes;
      if (snap && snap.length) {
        for (var e = 0; e < snap.length; e++) {
          if (snap[e] && snap[e].name && snap[e].url) chatEmoteMap[snap[e].name] = snap[e].url;
        }
      }
      var msgs = payload.messages || [];
      for (var m = 0; m < msgs.length; m++) {
        var msg = msgs[m];
        // Сессии одного эфира могут перекрываться по времени — сообщение с
        // одним и тем же twitch-id берём один раз.
        var dedupeKey = msg.providerMessageId || (buckets[i].sessionId + ':' + msg.id);
        if (seen[dedupeKey]) continue;
        seen[dedupeKey] = true;
        merged.push({
          sessionId: buckets[i].sessionId,
          tsMs: msg.messageTimestamp ? (new Date(msg.messageTimestamp).getTime() || 0) : 0,
          relativeTimeSec: msg.relativeTimeSec || 0,
          authorLogin: msg.authorLogin || '',
          authorDisplayName: msg.authorDisplayName || null,
          authorColor: msg.authorColor || null,
          textRaw: msg.textRaw || '',
          emotes: msg.emotes || null,
          isDeleted: Boolean(msg.isDeleted),
          vodTime: 0,
        });
        if (msg.isDeleted) chatDeletedCount += 1;
      }
    }

    chatMessages = merged;
    computeChatVodTimes();
  }

  // Позиция сообщения на шкале VOD. Основной путь — абсолютные метки: чат
  // писался с tmi-sent-ts, а ноль шкалы VOD — это createdAt эфира из GQL.
  // Запасной путь (нет даты VOD) — якорь аудиодорожки той же сессии.
  function computeChatVodTimes() {
    if (!chatMessages.length) return;
    for (var i = 0; i < chatMessages.length; i++) {
      var m = chatMessages[i];
      if (vodCreatedAtMs && m.tsMs) {
        m.vodTime = (m.tsMs - vodCreatedAtMs) / 1000;
      } else {
        m.vodTime = getRecStartForTrack(findChatSession(m.sessionId)) + m.relativeTimeSec;
      }
    }
    chatMessages.sort(function (a, b) { return a.vodTime - b.vodTime; });
    chatForceRebuild = true;
  }

  function findChatHost() {
    for (var i = 0; i < CHAT_HOST_SELECTORS.length; i++) {
      var host = document.querySelector(CHAT_HOST_SELECTORS[i]);
      if (host) return host;
    }
    return null;
  }

  function ensureChatOverlay() {
    if (chatOverlay && chatOverlay.isConnected) return true;
    chatOverlay = null;
    chatListEl = null;
    chatJumpEl = null;
    chatHeaderInfoEl = null;

    var host = findChatHost();
    if (!host) return false; // чат скрыт (fullscreen и т.п.) — попробуем позже
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    chatOverlay = el('div', {
      position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
      zIndex: '100', background: '#0e0e10', display: 'flex', flexDirection: 'column',
      font: '13px/1.45 Inter, sans-serif', color: '#efeff1',
    });

    var head = el('div', {
      padding: '6px 10px', borderBottom: '1px solid #2f2f35', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', flexShrink: '0',
    });
    head.appendChild(el('span', { fontWeight: '600' }, '💬 Чат записи (TSR)'));
    chatHeaderInfoEl = el('span', { opacity: '0.6' }, '');
    head.appendChild(chatHeaderInfoEl);
    chatOverlay.appendChild(head);

    var wrap = el('div', { flex: '1', position: 'relative', minHeight: '0' });
    chatListEl = el('div', {
      position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
      overflowY: 'auto', padding: '4px 0',
    });
    chatListEl.addEventListener('scroll', function () {
      if (!chatListEl) return;
      var dist = chatListEl.scrollHeight - chatListEl.scrollTop - chatListEl.clientHeight;
      chatPinned = dist < 30;
      if (chatJumpEl) chatJumpEl.style.display = chatPinned ? 'none' : 'block';
    });
    wrap.appendChild(chatListEl);

    chatJumpEl = el('button', {
      position: 'absolute', left: '50%', bottom: '10px', transform: 'translateX(-50%)',
      display: 'none', background: '#9147ff', color: '#fff', border: 'none',
      borderRadius: '12px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px',
    }, 'К новым ↓');
    chatJumpEl.addEventListener('click', function () {
      if (!chatListEl) return;
      chatListEl.scrollTop = chatListEl.scrollHeight;
      chatPinned = true;
      chatJumpEl.style.display = 'none';
    });
    wrap.appendChild(chatJumpEl);
    chatOverlay.appendChild(wrap);

    host.appendChild(chatOverlay);
    chatRenderedTo = 0;
    chatForceRebuild = true;
    chatPinned = true;
    return true;
  }

  function removeChatOverlay() {
    if (chatOverlay && chatOverlay.parentNode) chatOverlay.parentNode.removeChild(chatOverlay);
    chatOverlay = null;
    chatListEl = null;
    chatJumpEl = null;
    chatHeaderInfoEl = null;
    chatPinned = true;
  }

  // Twitch-эмоуты приходят диапазонами кодовых точек в теге "emotes".
  function parseTwitchEmoteRanges(tag) {
    var ranges = [];
    if (!tag) return ranges;
    var groups = String(tag).split('/');
    for (var i = 0; i < groups.length; i++) {
      var colon = groups[i].indexOf(':');
      if (colon <= 0) continue;
      var id = groups[i].slice(0, colon);
      var pairs = groups[i].slice(colon + 1).split(',');
      for (var p = 0; p < pairs.length; p++) {
        var dash = pairs[p].indexOf('-');
        if (dash <= 0) continue;
        var start = parseInt(pairs[p].slice(0, dash), 10);
        var end = parseInt(pairs[p].slice(dash + 1), 10);
        if (isFinite(start) && isFinite(end) && end >= start) {
          ranges.push({ id: id, start: start, end: end });
        }
      }
    }
    ranges.sort(function (a, b) { return a.start - b.start; });
    return ranges;
  }

  function appendChatEmote(parent, url, name) {
    var img = document.createElement('img');
    img.src = url;
    img.alt = name;
    img.title = name;
    img.loading = 'lazy';
    img.style.height = '20px';
    img.style.verticalAlign = 'middle';
    img.style.margin = '-3px 1px';
    parent.appendChild(img);
  }

  // Кусок обычного текста: слова, совпадающие с 7tv-эмоутами из снапшота
  // записи, заменяются картинками. Только текстовые узлы — без innerHTML.
  function appendChatText(parent, str) {
    if (!str) return;
    var parts = str.split(/(\\s+)/);
    var buf = '';
    for (var i = 0; i < parts.length; i++) {
      var hit = parts[i] && Object.prototype.hasOwnProperty.call(chatEmoteMap, parts[i])
        ? chatEmoteMap[parts[i]]
        : null;
      if (hit) {
        if (buf) {
          parent.appendChild(document.createTextNode(buf));
          buf = '';
        }
        appendChatEmote(parent, hit, parts[i]);
      } else {
        buf += parts[i];
      }
    }
    if (buf) parent.appendChild(document.createTextNode(buf));
  }

  function appendChatBody(parent, m) {
    var ranges = parseTwitchEmoteRanges(m.emotes);
    if (!ranges.length) {
      appendChatText(parent, m.textRaw);
      return;
    }
    // Индексы Twitch считают по кодовым точкам, не по UTF-16 юнитам.
    var cps = Array.from(m.textRaw);
    var cursor = 0;
    for (var i = 0; i < ranges.length; i++) {
      var r = ranges[i];
      if (r.start < cursor || r.end >= cps.length) continue;
      appendChatText(parent, cps.slice(cursor, r.start).join(''));
      appendChatEmote(
        parent,
        'https://static-cdn.jtvnw.net/emoticons/v2/' + r.id + '/default/dark/1.0',
        cps.slice(r.start, r.end + 1).join(''),
      );
      cursor = r.end + 1;
    }
    appendChatText(parent, cps.slice(cursor).join(''));
  }

  function buildChatRow(m) {
    var row = el('div', {
      padding: '3px 10px', overflowWrap: 'anywhere', wordBreak: 'break-word',
    });
    row.title = 'Место на VOD: ' + fmtTime(Math.max(0, m.vodTime)) +
      (m.isDeleted ? ' · сообщение удалено модератором' : '');
    if (m.isDeleted) {
      row.style.background = 'rgba(229,72,77,0.10)';
      row.style.borderLeft = '2px solid rgba(229,72,77,0.85)';
    }
    var author = el('span', { fontWeight: '700' }, m.authorDisplayName || m.authorLogin);
    author.style.color = m.authorColor || '#adadb8';
    row.appendChild(author);
    row.appendChild(document.createTextNode(': '));
    appendChatBody(row, m);
    if (m.isDeleted) {
      row.appendChild(el('span', {
        marginLeft: '6px', fontSize: '10px', color: '#ff8085', opacity: '0.9',
      }, 'удалено'));
    }
    return row;
  }

  function chatCutoffCount(cutoff) {
    var lo = 0;
    var hi = chatMessages.length;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (chatMessages[mid].vodTime <= cutoff) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  // Показ сообщений, чьё время на шкале VOD уже наступило (+ сдвиг чата).
  // Добавления — точечные; перемотка назад или большой скачок — пересборка
  // последних CHAT_MAX_VISIBLE сообщений.
  function renderChatWindow(v) {
    if (!chatListEl) return;
    var count = chatCutoffCount(v.currentTime + chatOffset);
    if (!chatForceRebuild && count === chatRenderedTo) return;

    var rebuild = chatForceRebuild || count < chatRenderedTo ||
      count - chatRenderedTo > CHAT_MAX_VISIBLE || chatRenderedTo === 0;
    chatForceRebuild = false;

    if (rebuild) {
      chatListEl.innerHTML = '';
      for (var i = Math.max(0, count - CHAT_MAX_VISIBLE); i < count; i++) {
        chatListEl.appendChild(buildChatRow(chatMessages[i]));
      }
      chatRenderedTo = count;
      chatListEl.scrollTop = chatListEl.scrollHeight;
      chatPinned = true;
      if (chatJumpEl) chatJumpEl.style.display = 'none';
      return;
    }

    for (var j = chatRenderedTo; j < count; j++) {
      chatListEl.appendChild(buildChatRow(chatMessages[j]));
    }
    chatRenderedTo = count;
    while (chatListEl.childNodes.length > CHAT_MAX_VISIBLE) {
      chatListEl.removeChild(chatListEl.firstChild);
    }
    if (chatPinned) chatListEl.scrollTop = chatListEl.scrollHeight;
  }

  function updateChatHeaderInfo() {
    if (!chatHeaderInfoEl) return;
    var text;
    if (chatLoading || chatMatchPending) {
      text = 'загружаю…';
    } else if (chatMessages.length) {
      text = chatMessages.length + ' сообщ.' +
        (chatDeletedCount ? ' · удалённых: ' + chatDeletedCount : '');
    } else if (chatLoadedKey) {
      text = 'сообщений нет';
    } else {
      text = 'чат этого эфира не найден';
    }
    if (chatHeaderInfoEl.textContent !== text) chatHeaderInfoEl.textContent = text;
  }

  function updateChatReplay() {
    if (chatMode !== 'record') return;
    if (!ensureChatOverlay()) return;
    ensureChatLoaded();
    updateChatHeaderInfo();
    var v = getVideo();
    if (!v) return;
    renderChatWindow(v);
    // Эмоуты-картинки дозагружаются и меняют высоту списка после автоскролла;
    // пока зритель «прилип» к низу, каждый тик возвращаем его на самый низ.
    if (chatPinned && chatListEl) {
      var dist = chatListEl.scrollHeight - chatListEl.scrollTop - chatListEl.clientHeight;
      if (dist > 1) chatListEl.scrollTop = chatListEl.scrollHeight;
    }
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
      headerTitleEl.textContent = '🎧';
      toggleHintEl.textContent = '▲';
    } else {
      bodyEl.style.display = 'block';
      panel.style.width = '290px';
      headerTitleEl.textContent = '🎧 Звук записи (TSR)';
      toggleHintEl.textContent = '▾';
    }
    syncPanelOpacity();
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
      transition: 'opacity 0.2s',
    });
    panel.addEventListener('mouseenter', function () {
      panelHovered = true;
      syncPanelOpacity();
    });
    panel.addEventListener('mouseleave', function () {
      panelHovered = false;
      syncPanelOpacity();
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
    selectEl.addEventListener('change', function () {
      var picked = findTrack(selectEl.value);
      // Ручной выбор дорожки НЕ из группы отключает автопереключение —
      // пользователь явно закрепил конкретную запись.
      if (picked) {
        var inGroup = false;
        for (var g = 0; g < groupTracks.length; g++) {
          if (groupTracks[g].id === picked.id) {
            inGroup = true;
            break;
          }
        }
        if (!inGroup) groupTracks = [];
      }
      var channelOffset = picked ? loadChannelOffset(picked.channelLogin) : null;
      if (channelOffset !== null) {
        offset = channelOffset;
        if (offsetInput) offsetInput.value = offset.toFixed(1);
      }
      selectTrack(selectEl.value);
    });
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
    offsetRow.appendChild(el('span', { opacity: '0.7' }, 'Звук, c'));
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

    // Чат: оригинальный VOD-чат Twitch или записанный (с удалёнными и самыми
    // первыми сообщениями). У чата свой сдвиг — рассинхрон чата и звука
    // бывает разным.
    var chatRow = el('div', { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' });
    chatRow.appendChild(el('span', { opacity: '0.7', minWidth: '32px' }, 'Чат'));
    var chatModes = [['twitch', 'Twitch'], ['record', 'Запись']];
    for (var c = 0; c < chatModes.length; c++) {
      (function (key, label) {
        var button = makeButton(label, function () { applyChatMode(key); });
        button.style.flex = '1';
        chatModeButtons[key] = button;
        chatRow.appendChild(button);
      })(chatModes[c][0], chatModes[c][1]);
    }
    bodyEl.appendChild(chatRow);

    chatOffsetRow = el('div', { display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '8px' });
    chatOffsetRow.appendChild(el('span', { opacity: '0.7' }, 'Чат, c'));
    chatOffsetRow.appendChild(makeButton('−5', function () { setChatOffset(chatOffset - 5); }));
    chatOffsetRow.appendChild(makeButton('−1', function () { setChatOffset(chatOffset - 1); }));
    chatOffsetInput = el('input', {
      width: '52px', background: '#0e0e10', color: '#efeff1',
      border: '1px solid #2f2f35', borderRadius: '4px', padding: '3px 4px', textAlign: 'center',
    });
    chatOffsetInput.type = 'number';
    chatOffsetInput.step = '1';
    chatOffsetInput.value = '0';
    chatOffsetInput.addEventListener('change', function () {
      setChatOffset(parseFloat(chatOffsetInput.value) || 0);
    });
    chatOffsetRow.appendChild(chatOffsetInput);
    chatOffsetRow.appendChild(makeButton('+1', function () { setChatOffset(chatOffset + 1); }));
    chatOffsetRow.appendChild(makeButton('+5', function () { setChatOffset(chatOffset + 5); }));
    bodyEl.appendChild(chatOffsetRow);

    var volumeRow = el('div', { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' });
    volumeLabelEl = el('span', { opacity: '0.7', minWidth: '78px' }, '');
    volumeRow.appendChild(volumeLabelEl);
    var volume = el('input', { flex: '1', minWidth: '0' });
    volume.type = 'range';
    volume.min = '0';
    volume.max = '3';
    volume.step = '0.05';
    volume.value = String(boost);
    volume.addEventListener('input', function () {
      boost = parseFloat(volume.value) || 0;
      applyFx();
      saveFx();
      updateVolumeLabel();
    });
    volumeRow.appendChild(volume);
    compressorBtnEl = makeButton('Комп.', function () {
      compressorOn = !compressorOn;
      if (compressorOn && !ensureAudioGraph()) {
        compressorOn = false;
        setStatus('WebAudio недоступен — компрессор не включить');
      }
      rewireAudioGraph();
      applyFx();
      saveFx();
      updateFxButtons();
    });
    compressorBtnEl.title = 'Компрессор: приглушает пики и делает тихую речь громче';
    volumeRow.appendChild(compressorBtnEl);
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
    updateVolumeLabel();
    updateFxButtons();
    updateChatUi();
    applyFx();
    applyCollapsed();
    applySavedPosition();
    fetchTracks();
    fetchVodMeta();
  }

  function updateVolumeLabel() {
    if (!volumeLabelEl) return;
    volumeLabelEl.textContent = 'Громк. ' + Math.round(boost * 100) + '%';
    volumeLabelEl.style.color = boost > 1 ? '#3fd56d' : '';
    volumeLabelEl.style.opacity = boost > 1 ? '1' : '0.7';
  }

  function updateFxButtons() {
    if (!compressorBtnEl) return;
    compressorBtnEl.style.background = compressorOn ? '#9147ff' : '#2f2f35';
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
    volumeLabelEl = null;
    compressorBtnEl = null;
    chatModeButtons = {};
    chatOffsetRow = null;
    chatOffsetInput = null;
    panelHovered = false;
  }

  // A direct <audio src> load can fail on the https Twitch page when the
  // server is http (mixed content). Retry once through the blob loader.
  audio.addEventListener('error', function () {
    // Во время прогрессивной загрузки декодер мог упереться в ещё не
    // скачанную (нулевую) область — пересобираем blob и продолжаем, но не
    // чаще раза в 3 секунды, чтобы не зациклиться.
    if (progressiveState && progressiveState.blobHave) {
      var now = Date.now();
      if (now - progressiveState.lastErrorSwapAt > 3000) {
        progressiveState.lastErrorSwapAt = now;
        swapProgressiveBlob(progressiveState);
      }
      return;
    }
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

  // Контекст WebAudio засыпает до первого жеста пользователя (политика
  // автоплея): будим его при старте воспроизведения и на любом клике, иначе
  // усиление >100% после перезагрузки страницы молчало бы.
  audio.addEventListener('play', resumeAudioCtx);
  document.addEventListener('pointerdown', resumeAudioCtx, true);

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
      groupTracks = [];
      mutedSegments = [];
      vodLengthSeconds = 0;
      vodCreatedAtMs = 0;
      abortProgressive();
      blobLoadingForId = null;
      clearAudioObjectUrl();
      chatMode = 'twitch';
      chatOffset = 0;
      resetChatState();
      removePanel();
    }

    if (!getVodId()) {
      if (panel) removePanel();
      if (chatOverlay) removeChatOverlay();
      if (!audio.paused) audio.pause();
      return;
    }

    if (!panel || !document.body.contains(panel)) {
      createPanel();
    }

    syncNow(false);
    renderTimelineOverlay();
    updateChatReplay();

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
