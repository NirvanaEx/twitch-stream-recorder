"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CloseIcon,
  FullscreenExitIcon,
  FullscreenIcon,
  MessageIcon,
  PauseIcon,
  PlayIcon,
  SkipBack5Icon,
  SkipForward5Icon,
  SpinnerIcon,
  TheaterIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeMutedIcon,
} from "./icons";

export type PlayerMode = "normal" | "theater" | "fullscreen";

type VideoPlayerProps = {
  src: string;
  autoPlay?: boolean;
  poster?: string;
  mode: PlayerMode;
  onModeChange: (mode: PlayerMode) => void;
  onChatToggle?: () => void;
  chatVisible?: boolean;
  showChatButton?: boolean;
  onVideoElement?: (element: HTMLVideoElement | null) => void;
  isLive?: boolean;
  emptyText?: string;
  /** Optional title shown in the top-left when in theater / fullscreen modes. */
  title?: string;
  /** When set, overrides the in-page back behaviour for the X icon in theater / fullscreen. */
  onClose?: () => void;
  className?: string;
};

const SKIP_SECONDS = 5;
const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const HIDE_DELAY_MS = 2500;
const DOUBLE_TAP_MS = 350;

/**
 * YouTube-style video player. Handles its own controls + global keyboard
 * shortcuts (space / k, j / l, arrows, m, f, t, c, 0-9, < / >, Home / End).
 *
 * Modes are owned by the parent — the player only requests changes via
 * `onModeChange`. The `mode === "fullscreen"` handling additionally calls
 * the native Fullscreen API on its own container element.
 */
export function VideoPlayer({
  src,
  autoPlay = false,
  poster,
  mode,
  onModeChange,
  onChatToggle,
  chatVisible = false,
  showChatButton = false,
  onVideoElement,
  isLive = false,
  emptyText,
  title,
  onClose,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const centerIconTimerRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [scrubPreview, setScrubPreview] = useState<{ time: number; left: number } | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [centerHint, setCenterHint] = useState<"play" | "pause" | "back" | "forward" | null>(
    null,
  );
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Touch handling: taps are processed in onPointerUp, and the synthetic
  // click/dblclick events the browser fires afterwards must be ignored.
  const lastTouchAtRef = useRef(0);
  const lastTapRef = useRef<{ time: number; zone: "left" | "mid" | "right" } | null>(null);

  // Bubble video element up so external code (chat replay, etc.) can listen
  // to it. We send the element on mount and null on unmount.
  const setVideoNode = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      onVideoElement?.(node);
    },
    [onVideoElement],
  );

  // Wire video → state.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(v.currentTime);
    const onDuration = () => setDuration(Number.isFinite(v.duration) ? v.duration : 0);
    const onProgress = () => {
      if (v.buffered.length > 0) {
        setBufferedEnd(v.buffered.end(v.buffered.length - 1));
      }
    };
    const onWaiting = () => setWaiting(true);
    const onPlaying = () => {
      setWaiting(false);
      setMediaError(null);
    };
    const onVolume = () => {
      setVolume(v.volume);
      setMuted(v.muted);
    };
    const onRate = () => setPlaybackRate(v.playbackRate);
    const onError = () => {
      setWaiting(false);
      setMediaError(describeMediaError(v.error));
    };

    setMediaError(null);

    v.addEventListener("error", onError);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("durationchange", onDuration);
    v.addEventListener("loadedmetadata", onDuration);
    v.addEventListener("progress", onProgress);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("seeking", onWaiting);
    v.addEventListener("seeked", onPlaying);
    v.addEventListener("volumechange", onVolume);
    v.addEventListener("ratechange", onRate);

    onDuration();
    onVolume();
    onRate();

    return () => {
      v.removeEventListener("error", onError);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("durationchange", onDuration);
      v.removeEventListener("loadedmetadata", onDuration);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("seeking", onWaiting);
      v.removeEventListener("seeked", onPlaying);
      v.removeEventListener("volumechange", onVolume);
      v.removeEventListener("ratechange", onRate);
    };
  }, [src]);

  // Restore stored volume / muted across visits.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      const stored = window.localStorage.getItem("tsr-player-vol");
      if (!stored) return;
      const parsed = JSON.parse(stored) as { volume?: number; muted?: boolean };
      if (typeof parsed.volume === "number") v.volume = Math.max(0, Math.min(1, parsed.volume));
      if (typeof parsed.muted === "boolean") v.muted = parsed.muted;
    } catch {
      // Ignore broken localStorage.
    }
  }, [src]);

  useEffect(() => {
    try {
      window.localStorage.setItem("tsr-player-vol", JSON.stringify({ volume, muted }));
    } catch {
      // Ignore storage errors (e.g. private mode).
    }
  }, [volume, muted]);

  // ---- Player actions ---------------------------------------------------

  // Reload the media after a playback error, resuming from where it broke.
  const retryPlayback = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const resumeAt = v.currentTime;
    setMediaError(null);
    setWaiting(true);
    v.load();
    const onLoaded = () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      if (Number.isFinite(resumeAt) && resumeAt > 0) {
        v.currentTime = resumeAt;
      }
      void v.play().catch(() => undefined);
    };
    v.addEventListener("loadedmetadata", onLoaded);
  }, []);

  const flashCenterHint = useCallback((kind: "play" | "pause" | "back" | "forward") => {
    setCenterHint(kind);
    if (centerIconTimerRef.current) window.clearTimeout(centerIconTimerRef.current);
    centerIconTimerRef.current = window.setTimeout(() => setCenterHint(null), 600);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      void v.play().catch(() => undefined);
      flashCenterHint("play");
    } else {
      v.pause();
      flashCenterHint("pause");
    }
  }, [flashCenterHint]);

  const seekBy = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v) return;
      const cap = Number.isFinite(v.duration) ? v.duration : Infinity;
      v.currentTime = Math.max(0, Math.min(cap, v.currentTime + delta));
    },
    [],
  );

  const seekTo = useCallback((time: number) => {
    const v = videoRef.current;
    if (!v) return;
    const cap = Number.isFinite(v.duration) ? v.duration : Infinity;
    v.currentTime = Math.max(0, Math.min(cap, time));
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = Math.max(0, Math.min(1, v.volume + delta));
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  }, []);

  const setRate = useCallback((rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setShowRateMenu(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void node.requestFullscreen?.().catch(() => undefined);
    }
  }, []);

  const toggleTheater = useCallback(() => {
    if (mode === "fullscreen") {
      void document.exitFullscreen().catch(() => undefined);
      onModeChange("theater");
      return;
    }
    onModeChange(mode === "theater" ? "normal" : "theater");
  }, [mode, onModeChange]);

  // Remember the mode the user was in before they entered fullscreen so
  // we can restore it (theater → fullscreen → theater) instead of always
  // dumping them back to normal.
  const previousNonFsModeRef = useRef<PlayerMode>(mode === "fullscreen" ? "normal" : mode);
  useEffect(() => {
    if (mode !== "fullscreen") previousNonFsModeRef.current = mode;
  }, [mode]);

  // Keep parent state in sync when the user enters/exits fullscreen via
  // ESC, F11, or the browser's native UI.
  useEffect(() => {
    const onChange = () => {
      const isFs = document.fullscreenElement === containerRef.current;
      if (isFs && mode !== "fullscreen") onModeChange("fullscreen");
      if (!isFs && mode === "fullscreen") {
        onModeChange(previousNonFsModeRef.current);
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [mode, onModeChange]);

  // ---- Auto-hide controls during playback -------------------------------

  const armHide = useCallback(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused) setControlsVisible(false);
    }, HIDE_DELAY_MS);
  }, []);

  const handleMouseMove = useCallback(() => {
    // Touch taps fire synthetic mouse events afterwards; if we react to
    // them, a tap meant to HIDE the controls instantly re-shows them.
    if (Date.now() - lastTouchAtRef.current < 700) return;
    setControlsVisible(true);
    armHide();
  }, [armHide]);

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    } else {
      armHide();
    }
  }, [isPlaying, armHide]);

  useEffect(() => () => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (centerIconTimerRef.current) window.clearTimeout(centerIconTimerRef.current);
  }, []);

  // ---- Touch gestures -----------------------------------------------------

  // Mobile UX mirrors YouTube: a single tap toggles the controls overlay
  // (it must NOT pause), pausing is done with the pause button, and a
  // double-tap on the left/right third of the video seeks -/+5 seconds.
  const handleVideoPointerUp = (event: React.PointerEvent) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

    lastTouchAtRef.current = Date.now();

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(1, rect.width);
    const zone: "left" | "mid" | "right" = x < 1 / 3 ? "left" : x > 2 / 3 ? "right" : "mid";
    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (lastTap && now - lastTap.time < DOUBLE_TAP_MS && lastTap.zone === zone) {
      lastTapRef.current = null;

      if (zone === "left") {
        seekBy(-SKIP_SECONDS);
        flashCenterHint("back");
      } else if (zone === "right") {
        seekBy(SKIP_SECONDS);
        flashCenterHint("forward");
      } else {
        togglePlay();
      }
      return;
    }

    lastTapRef.current = { time: now, zone };

    if (!controlsVisible) {
      setControlsVisible(true);
      armHide();
    } else if (isPlaying) {
      setControlsVisible(false);
    }
  };

  // ---- Keyboard shortcuts ----------------------------------------------

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (target.isContentEditable) return true;
      return false;
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const v = videoRef.current;
      if (!v) return;

      switch (event.key) {
        case " ":
        case "k":
        case "K":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
        case "j":
        case "J":
          event.preventDefault();
          seekBy(-SKIP_SECONDS);
          flashCenterHint("back");
          break;
        case "ArrowRight":
        case "l":
        case "L":
          event.preventDefault();
          seekBy(SKIP_SECONDS);
          flashCenterHint("forward");
          break;
        case "ArrowUp":
          event.preventDefault();
          adjustVolume(0.05);
          break;
        case "ArrowDown":
          event.preventDefault();
          adjustVolume(-0.05);
          break;
        case "m":
        case "M":
          event.preventDefault();
          toggleMute();
          break;
        case "f":
        case "F":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "t":
        case "T":
          event.preventDefault();
          toggleTheater();
          break;
        case "c":
        case "C":
          if (onChatToggle) {
            event.preventDefault();
            onChatToggle();
          }
          break;
        case "Escape":
          if (mode === "theater") {
            event.preventDefault();
            onModeChange("normal");
          }
          break;
        case ">":
        case ".":
          event.preventDefault();
          v.playbackRate = Math.min(2, Math.round((v.playbackRate + 0.25) * 100) / 100);
          break;
        case "<":
        case ",":
          event.preventDefault();
          v.playbackRate = Math.max(0.25, Math.round((v.playbackRate - 0.25) * 100) / 100);
          break;
        case "Home":
          event.preventDefault();
          seekTo(0);
          break;
        case "End":
          event.preventDefault();
          seekTo(v.duration || 0);
          break;
        default:
          if (event.key >= "0" && event.key <= "9") {
            event.preventDefault();
            const pct = Number(event.key) / 10;
            seekTo(pct * (v.duration || 0));
          }
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    adjustVolume,
    flashCenterHint,
    mode,
    onChatToggle,
    onModeChange,
    seekBy,
    seekTo,
    toggleFullscreen,
    toggleMute,
    togglePlay,
    toggleTheater,
  ]);

  // ---- Progress bar -----------------------------------------------------

  const progressRef = useRef<HTMLDivElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Hovering the timeline seeks a second, muted <video> to the hovered
  // position so the tooltip shows an actual frame (YouTube-style preview).
  useEffect(() => {
    const preview = previewVideoRef.current;
    if (!preview || !scrubPreview) return;

    const target = Math.max(0, Math.floor(scrubPreview.time));

    if (Math.abs((preview.currentTime || 0) - target) >= 1) {
      try {
        preview.currentTime = target;
      } catch {
        // Metadata not loaded yet; the next hover move will retry.
      }
    }
  }, [scrubPreview]);

  const computePctFromEvent = (clientX: number) => {
    const bar = progressRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, pct));
  };

  const onProgressMove = (event: React.PointerEvent) => {
    if (!duration) return;
    const pct = computePctFromEvent(event.clientX);
    setScrubPreview({ time: pct * duration, left: pct * 100 });
  };

  const onProgressLeave = () => setScrubPreview(null);

  // Pointer events instead of mouse events so scrubbing also works on
  // touch screens (mouse-only handlers made mobile seeking impossible).
  const onProgressDown = (event: React.PointerEvent) => {
    if (!duration) return;
    event.preventDefault();
    const pct = computePctFromEvent(event.clientX);
    seekTo(pct * duration);

    const onMove = (e: PointerEvent) => {
      const m = computePctFromEvent(e.clientX);
      seekTo(m * duration);
      setScrubPreview({ time: m * duration, left: m * 100 });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setScrubPreview(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const bufferedPct = duration > 0 ? Math.min(100, (bufferedEnd / duration) * 100) : 0;

  const VolumeIcon = useMemo(() => {
    if (muted || volume === 0) return VolumeMutedIcon;
    if (volume < 0.5) return VolumeLowIcon;
    return VolumeHighIcon;
  }, [muted, volume]);

  const containerClassName = [
    "vp",
    `vp--${mode}`,
    controlsVisible ? "vp--show" : "vp--hide",
    isPlaying ? "vp--playing" : "vp--paused",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) setControlsVisible(false);
      }}
      onDoubleClick={(event) => {
        // Avoid double-click toggling when clicking on controls. Touch
        // double-taps are handled in onPointerUp (they seek, not fullscreen).
        if ((event.target as HTMLElement).closest(".vp__controls")) return;
        if (Date.now() - lastTouchAtRef.current < 700) return;
        toggleFullscreen();
      }}
    >
      {src ? (
        <video
          ref={setVideoNode}
          className="vp__video"
          src={src}
          autoPlay={autoPlay}
          poster={poster}
          preload="metadata"
          playsInline
          onPointerUp={handleVideoPointerUp}
        />
      ) : (
        <div className="vp__empty">{emptyText ?? "—"}</div>
      )}

      {(mode === "theater" || mode === "fullscreen") && (title || onClose) ? (
        <div className="vp__top-bar">
          <button
            type="button"
            className="vp__top-btn"
            onClick={() => {
              if (onClose) {
                onClose();
              } else if (mode === "fullscreen") {
                void document.exitFullscreen().catch(() => undefined);
              } else {
                onModeChange("normal");
              }
            }}
            title="Закрыть (Esc)"
          >
            <CloseIcon size={18} />
          </button>
          {title ? <div className="vp__top-title">{title}</div> : null}
        </div>
      ) : null}

      {mediaError && src ? (
        <div className="vp__error" role="alert">
          <div className="vp__error-text">{mediaError}</div>
          <button type="button" className="vp__error-retry" onClick={retryPlayback}>
            Повторить
          </button>
        </div>
      ) : null}

      {waiting && !mediaError && src ? (
        <div className="vp__buffering" aria-hidden>
          <SpinnerIcon size={36} />
        </div>
      ) : null}

      {centerHint ? (
        <div className="vp__center-hint" key={`${centerHint}-${Date.now()}`} aria-hidden>
          {centerHint === "play" ? <PlayIcon size={36} /> : null}
          {centerHint === "pause" ? <PauseIcon size={36} /> : null}
          {centerHint === "back" ? <SkipBack5Icon size={36} /> : null}
          {centerHint === "forward" ? <SkipForward5Icon size={36} /> : null}
        </div>
      ) : null}

      {!isPlaying && currentTime === 0 && src && !mediaError ? (
        <button type="button" className="vp__big-play" onClick={togglePlay} aria-label="Play">
          <PlayIcon size={44} />
        </button>
      ) : null}

      {src ? (
        <div className="vp__controls">
          <div
            ref={progressRef}
            className="vp__progress"
            onPointerMove={onProgressMove}
            onPointerLeave={onProgressLeave}
            onPointerDown={onProgressDown}
          >
            <div className="vp__progress-track" />
            <div className="vp__progress-buffered" style={{ width: `${bufferedPct}%` }} />
            <div className="vp__progress-played" style={{ width: `${progressPct}%` }} />
            {/* Kept mounted so the preview video's metadata loads only once. */}
            <div
              className="vp__scrub-preview"
              style={{
                left: `clamp(86px, ${scrubPreview?.left ?? 0}%, calc(100% - 86px))`,
                visibility: scrubPreview ? "visible" : "hidden",
              }}
              aria-hidden
            >
              <video
                ref={previewVideoRef}
                className="vp__scrub-video"
                src={src || undefined}
                muted
                playsInline
                preload="metadata"
                tabIndex={-1}
              />
              <span className="vp__scrub-time">
                {scrubPreview ? formatTime(scrubPreview.time) : ""}
              </span>
            </div>
            <div className="vp__progress-thumb" style={{ left: `${progressPct}%` }} />
          </div>

          <div className="vp__bar">
            <button
              type="button"
              className="vp__btn"
              onClick={togglePlay}
              title={isPlaying ? "Пауза (k)" : "Воспроизвести (k)"}
            >
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>

            <button
              type="button"
              className="vp__btn"
              onClick={() => seekBy(-SKIP_SECONDS)}
              title="Назад 5 сек (← / J)"
            >
              <SkipBack5Icon size={20} />
            </button>

            <button
              type="button"
              className="vp__btn"
              onClick={() => seekBy(SKIP_SECONDS)}
              title="Вперёд 5 сек (→ / L)"
            >
              <SkipForward5Icon size={20} />
            </button>

            <div className="vp__volume">
              <button
                type="button"
                className="vp__btn"
                onClick={toggleMute}
                title="Звук (M)"
              >
                <VolumeIcon size={20} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(event) => {
                  const v = videoRef.current;
                  if (!v) return;
                  const next = Number(event.target.value);
                  v.volume = Math.max(0, Math.min(1, next));
                  v.muted = next === 0;
                }}
                className="vp__volume-slider"
                aria-label="Громкость"
                style={{
                  background: `linear-gradient(to right, var(--text) 0%, var(--text) ${
                    (muted ? 0 : volume) * 100
                  }%, rgba(255,255,255,0.3) ${
                    (muted ? 0 : volume) * 100
                  }%, rgba(255,255,255,0.3) 100%)`,
                }}
              />
            </div>

            <div className="vp__time">
              {isLive ? <span className="vp__live-dot" /> : null}
              <span>{formatTime(currentTime)}</span>
              {!isLive ? (
                <>
                  <span className="vp__time-sep">/</span>
                  <span>{formatTime(duration)}</span>
                </>
              ) : null}
            </div>

            <div className="vp__spacer" />

            <div className="vp__rate-wrap">
              <button
                type="button"
                className="vp__btn vp__btn--text"
                onClick={() => setShowRateMenu((value) => !value)}
                title="Скорость воспроизведения"
              >
                {playbackRate}x
              </button>
              {showRateMenu ? (
                <div className="vp__menu" onMouseLeave={() => setShowRateMenu(false)}>
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      className={`vp__menu-item ${rate === playbackRate ? "is-active" : ""}`}
                      onClick={() => setRate(rate)}
                    >
                      {rate === 1 ? "Обычная" : `${rate}x`}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {showChatButton && onChatToggle ? (
              <button
                type="button"
                className={`vp__btn ${chatVisible ? "vp__btn--active" : ""}`}
                onClick={onChatToggle}
                title="Чат (C)"
              >
                <MessageIcon size={20} />
              </button>
            ) : null}

            <button
              type="button"
              className={`vp__btn ${mode === "theater" ? "vp__btn--active" : ""}`}
              onClick={toggleTheater}
              title="Режим кинотеатра (T)"
            >
              <TheaterIcon size={20} />
            </button>

            <button
              type="button"
              className="vp__btn"
              onClick={toggleFullscreen}
              title="Полный экран (F)"
            >
              {mode === "fullscreen" ? (
                <FullscreenExitIcon size={20} />
              ) : (
                <FullscreenIcon size={20} />
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function describeMediaError(error: MediaError | null) {
  switch (error?.code) {
    case MediaError.MEDIA_ERR_NETWORK:
      return "Ошибка сети при загрузке видео. Проверьте подключение и попробуйте снова.";
    case MediaError.MEDIA_ERR_DECODE:
      return "Не удалось декодировать видео — файл может быть повреждён.";
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return "Видео недоступно: файл не найден или формат не поддерживается браузером.";
    case MediaError.MEDIA_ERR_ABORTED:
      return "Загрузка видео была прервана.";
    default:
      return "Не удалось воспроизвести видео.";
  }
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
