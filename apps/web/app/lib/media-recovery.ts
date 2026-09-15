type Clock = {
  now: () => number;
  setTimeout: (callback: () => void, ms: number) => number;
  clearTimeout: (id: number) => void;
  setInterval: (callback: () => void, ms: number) => number;
  clearInterval: (id: number) => void;
};

/** Recovery for progressive MP4/audio. HLS retains its own recovery policy. */
export function attachMediaRecovery(media: HTMLMediaElement, options: {
  onRecovering: () => void;
  onFailure: (error: MediaError | null) => void;
  watchdog?: boolean;
  clock?: Clock;
  stallMs?: number;
}) {
  const clock: Clock = options.clock ?? {
    now: () => performance.now(),
    setTimeout: (fn, ms) => window.setTimeout(fn, ms),
    clearTimeout: (id) => window.clearTimeout(id),
    setInterval: (fn, ms) => window.setInterval(fn, ms),
    clearInterval: (id) => window.clearInterval(id),
  };
  let wanted = media.autoplay || !media.paused;
  let disposed = false;
  let attempt = 0;
  let retryTimer: number | null = null;
  let loaded: (() => void) | null = null;
  let restoring = false;
  let positionSaved = false;
  let resumeAt = media.currentTime || 0;
  let resumeRate = media.playbackRate;
  let lastTime = resumeAt;
  let lastBuffer = 0;
  let lastProgress = clock.now();
  let healthySeconds = 0;
  let exhausted = false;

  const clearPending = () => {
    if (retryTimer !== null) clock.clearTimeout(retryTimer);
    retryTimer = null;
    if (loaded) media.removeEventListener("loadedmetadata", loaded);
    loaded = null;
    restoring = false;
  };
  const pauseRequested = () => {
    wanted = false;
    if (retryTimer !== null) clock.clearTimeout(retryTimer);
    retryTimer = null;
    // If load() already ran, still restore the position when its metadata
    // arrives. A user pause cancels playback, not the saved seek position.
    if (!loaded) restoring = false;
    lastProgress = clock.now();
  };
  const playRequested = () => {
    wanted = true;
    lastProgress = clock.now();
  };
  const schedule = () => {
    if (disposed || retryTimer !== null || exhausted) return;
    if (!wanted || attempt >= 4) {
      exhausted = true;
      clearPending();
      options.onFailure(media.error);
      return;
    }
    // A second retry during metadata loading must keep the original position,
    // not the zero assigned by load(). No URL/cache-busting is necessary.
    if (!positionSaved) { resumeAt = media.currentTime || 0; resumeRate = media.playbackRate; }
    clearPending();
    attempt++;
    healthySeconds = 0;
    restoring = true;
    positionSaved = true;
    options.onRecovering();
    retryTimer = clock.setTimeout(() => {
      retryTimer = null;
      if (disposed || !wanted) { clearPending(); return; }
      lastProgress = clock.now();
      loaded = () => {
        if (disposed) return;
        if (loaded) media.removeEventListener("loadedmetadata", loaded);
        loaded = null;
        restoring = false;
        if (Number.isFinite(resumeAt) && resumeAt > 0) media.currentTime = resumeAt;
        media.playbackRate = resumeRate;
        positionSaved = false;
        lastTime = media.currentTime;
        lastProgress = clock.now();
        if (wanted) void media.play().catch(() => undefined);
      };
      // Install first: cached media may deliver metadata immediately.
      media.addEventListener("loadedmetadata", loaded);
      media.load();
    }, 1500 * attempt);
  };
  const onPlay = () => playRequested();
  const onPause = () => {
    // load() pauses internally. The player's pause action calls
    // pauseRequested explicitly, even during an outstanding restoration.
    if (!restoring) pauseRequested();
  };
  const onSeek = () => {
    lastProgress = clock.now();
    lastTime = media.currentTime;
    lastBuffer = 0;
    healthySeconds = 0;
  };
  const onError = () => {
    if (media.error?.code === 2 || media.error?.code === 4) schedule();
    else { clearPending(); options.onFailure(media.error); }
  };
  const bufferedAhead = () => {
    for (let i = 0; i < media.buffered.length; i++) {
      if (media.buffered.start(i) <= media.currentTime + 0.1 &&
          media.buffered.end(i) > media.currentTime) return media.buffered.end(i);
    }
    return media.currentTime;
  };
  const tick = () => {
    if (disposed || exhausted || !wanted || media.ended || retryTimer !== null) return;
    const now = clock.now();
    if (media.paused && !restoring) { lastProgress = now; return; }
    const time = media.currentTime;
    const buffer = bufferedAhead();
    const delta = time - lastTime;
    if (!restoring && Math.abs(delta) > 0.05) {
      lastProgress = now;
      if (!media.seeking && delta > 0 && delta < 5) healthySeconds += delta;
      if (healthySeconds >= 10) attempt = 0;
    }
    if (!restoring && buffer > lastBuffer + 0.05) lastProgress = now;
    lastTime = time;
    lastBuffer = buffer;
    // A decoded-frame stall with plenty of buffered media is not an HTTP
    // download stall. Reloading it would only add Telegram traffic.
    if (!restoring && buffer - time > 1) { lastProgress = now; return; }
    if (options.watchdog !== false && now - lastProgress >= (options.stallMs ?? 15_000)) schedule();
  };
  const listeners = { play: onPlay, pause: onPause, seeking: onSeek, error: onError, ended: pauseRequested };
  for (const [event, listener] of Object.entries(listeners)) media.addEventListener(event, listener);
  const interval = clock.setInterval(tick, 1000);
  return {
    get wantsPlay() { return wanted; },
    pauseRequested,
    playRequested,
    retry() { exhausted = false; attempt = 0; wanted = true; schedule(); },
    dispose() {
      disposed = true;
      clearPending();
      clock.clearInterval(interval);
      for (const [event, listener] of Object.entries(listeners)) media.removeEventListener(event, listener);
    },
  };
}
