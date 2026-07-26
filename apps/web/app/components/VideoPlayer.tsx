"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { waveformHeights } from "../lib/waveform";
import {
  CloseIcon,
  CompressorIcon,
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

export type PlaylistSegment = {
  src: string;
  durationSec: number;
};

type VideoPlayerProps = {
  src: string;
  autoPlay?: boolean;
  poster?: string;
  mode: PlayerMode;
  onModeChange: (mode: PlayerMode) => void;
  onChatToggle?: () => void;
  chatVisible?: boolean;
  showChatButton?: boolean;
  onVideoElement?: (element: HTMLMediaElement | null) => void;
  isLive?: boolean;
  /**
   * Audio-only recording: there is no picture to show, so the media element is
   * an <audio> behind a cover strip instead of a 16:9 video stage, and every
   * control that only means something for video (theater, fullscreen, frame
   * previews on the timeline) is dropped.
   */
  audioOnly?: boolean;
  /** Cover image for audio mode — the channel avatar. */
  artworkUrl?: string | null;
  emptyText?: string;
  /** Optional title shown in the top-left when in theater / fullscreen modes. */
  title?: string;
  /** When set, overrides the in-page back behaviour for the X icon in theater / fullscreen. */
  onClose?: () => void;
  className?: string;
  /**
   * Seamless multi-part playback: when set (and every segment has a known
   * duration), the player presents ONE continuous timeline over all segments,
   * switching the underlying <video> src transparently on seek/end.
   * Overrides `src`.
   */
  playlist?: PlaylistSegment[];
  /** 1-based segment to start from (e.g. restored "continue watching" state). */
  initialSegment?: number;
  /** Notified with the 1-based segment index whenever the active segment changes. */
  onSegmentChange?: (segment: number) => void;
  /**
   * Wall-clock moment (epoch ms) of the timeline's zero second. When set, the
   * scrub tooltip and the control bar also show the real-world time of the
   * hovered / current position — "this part of the video happened at 21:03".
   */
  timelineStartAt?: number | null;
};

const SKIP_SECONDS = 5;
const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const HIDE_DELAY_MS = 2500;
const DOUBLE_TAP_MS = 350;
// The volume slider goes past 100%: values above 1 are applied as Web Audio
// gain on top of the element's full volume (quiet recordings happen).
const MAX_VOLUME_BOOST = 3;
// Where the 100% tick sits on the extended slider track.
const VOLUME_TICK_PCT = 100 / MAX_VOLUME_BOOST;
// Transient network errors (a dropped Telegram-backed range, a proxy timeout)
// shouldn't dump the viewer onto a manual "retry" button. Silently reload and
// resume from the same spot a few times first; only fall back to the manual
// overlay once those are exhausted.
const MAX_AUTO_RETRIES = 4;
const AUTO_RETRY_DELAY_MS = 1500;

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
  audioOnly = false,
  artworkUrl,
  emptyText,
  title,
  onClose,
  className,
  playlist,
  initialSegment,
  onSegmentChange,
  timelineStartAt,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLMediaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const centerIconTimerRef = useRef<number | null>(null);
  const autoRetryRef = useRef<{ count: number; timer: number | null }>({
    count: 0,
    timer: null,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  // Gain above the element's 100% (1..MAX_VOLUME_BOOST) and the loudness
  // compressor toggle — both realized through a Web Audio chain that is only
  // materialized once either is actually used.
  const [boost, setBoost] = useState(1);
  const [compressorOn, setCompressorOn] = useState(false);
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

  // Bubble the media element up so external code (chat replay, etc.) can
  // listen to it. We send the element on mount and null on unmount.
  const setVideoNode = useCallback(
    (node: HTMLMediaElement | null) => {
      videoRef.current = node;
      onVideoElement?.(node);
    },
    [onVideoElement],
  );

  // ---- Virtual playlist (seamless multi-part playback) -------------------

  const segments = useMemo(
    () =>
      playlist && playlist.length > 0 && playlist.every((item) => item.src && item.durationSec > 0)
        ? playlist
        : null,
    [playlist],
  );
  const playlistKey = segments?.map((item) => item.src).join("|") ?? null;
  const [segmentIndex, setSegmentIndex] = useState(0);

  const segmentOffsets = useMemo(() => {
    let acc = 0;
    return (segments ?? []).map((item) => {
      const offset = acc;
      acc += item.durationSec;
      return offset;
    });
  }, [segments]);

  const totalDuration = useMemo(
    () => (segments ?? []).reduce((acc, item) => acc + item.durationSec, 0),
    [segments],
  );

  const effectiveSrc = segments
    ? segments[Math.min(segmentIndex, segments.length - 1)].src
    : src;

  // Media event handlers and seek callbacks must not capture stale state.
  const virtualRef = useRef({
    segments,
    offsets: segmentOffsets,
    total: totalDuration,
    index: segmentIndex,
  });
  virtualRef.current = {
    segments,
    offsets: segmentOffsets,
    total: totalDuration,
    index: segmentIndex,
  };

  // Seek/play to apply after the next segment's <video> src swap.
  const pendingSeekRef = useRef<{ time: number; play: boolean } | null>(null);

  useEffect(() => {
    if (!playlistKey) return;
    const upper = Math.max(0, (virtualRef.current.segments?.length ?? 1) - 1);
    setSegmentIndex(Math.min(Math.max((initialSegment ?? 1) - 1, 0), upper));
    // The initial segment matters only when the playlist itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistKey]);

  useEffect(() => {
    if (segments) onSegmentChange?.(segmentIndex + 1);
  }, [segments, segmentIndex, onSegmentChange]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;

    const pending = pendingSeekRef.current;
    if (!pending) return undefined;

    const apply = () => {
      pendingSeekRef.current = null;
      if (pending.time > 0.1) v.currentTime = pending.time;
      if (pending.play) void v.play().catch(() => undefined);
    };

    if (v.readyState >= 1) {
      apply();
      return undefined;
    }

    v.addEventListener("loadedmetadata", apply, { once: true });
    return () => v.removeEventListener("loadedmetadata", apply);
  }, [effectiveSrc, segmentIndex]);

  // Wire video → state.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;

    const globalBase = () => {
      const vr = virtualRef.current;
      return vr.segments ? vr.offsets[vr.index] ?? 0 : 0;
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(globalBase() + v.currentTime);
    const onDuration = () => {
      const vr = virtualRef.current;
      setDuration(vr.segments ? vr.total : Number.isFinite(v.duration) ? v.duration : 0);
    };
    const onProgress = () => {
      if (v.buffered.length > 0) {
        setBufferedEnd(globalBase() + v.buffered.end(v.buffered.length - 1));
      }
    };
    const onEnded = () => {
      // Virtual playlist: roll into the next segment without user input.
      const vr = virtualRef.current;
      if (!vr.segments || vr.index >= vr.segments.length - 1) return;
      pendingSeekRef.current = { time: 0, play: true };
      setSegmentIndex(vr.index + 1);
    };
    const onWaiting = () => setWaiting(true);
    const onPlaying = () => {
      setWaiting(false);
      setMediaError(null);
      // Playback recovered — forget earlier transient failures.
      autoRetryRef.current.count = 0;
      if (autoRetryRef.current.timer) {
        window.clearTimeout(autoRetryRef.current.timer);
        autoRetryRef.current.timer = null;
      }
    };
    const onVolume = () => {
      setVolume(v.volume);
      setMuted(v.muted);
    };
    const onRate = () => setPlaybackRate(v.playbackRate);
    const onError = () => {
      const code = v.error?.code;
      // NETWORK is a playing stream that broke; SRC_NOT_SUPPORTED is the same
      // server hiccup at load time — a 502 during the deploy window, a 500
      // while the Telegram connection reconnects, or a 503 from the stream
      // slot gate. The file itself is fine in all of those, so both codes
      // deserve silent retries instead of the manual overlay.
      const isTransient =
        code === MediaError.MEDIA_ERR_NETWORK ||
        code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;

      // Auto-recover without bothering the user: reload and resume from the
      // same spot, with a growing delay; reset happens on the next "playing".
      if (isTransient && autoRetryRef.current.count < MAX_AUTO_RETRIES) {
        autoRetryRef.current.count += 1;
        const attempt = autoRetryRef.current.count;
        const resumeAt = v.currentTime;
        setMediaError(null);
        setWaiting(true);
        if (autoRetryRef.current.timer) window.clearTimeout(autoRetryRef.current.timer);
        autoRetryRef.current.timer = window.setTimeout(() => {
          autoRetryRef.current.timer = null;
          v.load();
          const onLoaded = () => {
            v.removeEventListener("loadedmetadata", onLoaded);
            if (Number.isFinite(resumeAt) && resumeAt > 0) v.currentTime = resumeAt;
            void v.play().catch(() => undefined);
          };
          v.addEventListener("loadedmetadata", onLoaded);
        }, AUTO_RETRY_DELAY_MS * attempt);
        return;
      }

      setWaiting(false);
      setMediaError(describeMediaError(v.error, audioOnly));
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
    v.addEventListener("ended", onEnded);

    onDuration();
    onVolume();
    onRate();

    return () => {
      v.removeEventListener("ended", onEnded);
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
  }, [effectiveSrc, audioOnly]);

  // Restore stored volume / muted / boost / compressor across visits.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      const stored = window.localStorage.getItem("tsr-player-vol");
      if (!stored) return;
      const parsed = JSON.parse(stored) as {
        volume?: number;
        muted?: boolean;
        boost?: number;
        compressor?: boolean;
      };
      if (typeof parsed.volume === "number") v.volume = Math.max(0, Math.min(1, parsed.volume));
      if (typeof parsed.muted === "boolean") v.muted = parsed.muted;
      if (typeof parsed.boost === "number") {
        setBoost(Math.max(1, Math.min(MAX_VOLUME_BOOST, parsed.boost)));
      }
      if (typeof parsed.compressor === "boolean") setCompressorOn(parsed.compressor);
    } catch {
      // Ignore broken localStorage.
    }
  }, [effectiveSrc]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "tsr-player-vol",
        JSON.stringify({ volume, muted, boost, compressor: compressorOn }),
      );
    } catch {
      // Ignore storage errors (e.g. private mode).
    }
  }, [volume, muted, boost, compressorOn]);

  // ---- Web Audio: volume boost above 100% + loudness compressor ----------

  const audioGraphRef = useRef<{
    ctx: AudioContext;
    element: HTMLMediaElement;
    source: MediaElementAudioSourceNode;
    compressor: DynamicsCompressorNode;
    gain: GainNode;
  } | null>(null);
  const boostRef = useRef(1);
  boostRef.current = boost;

  // Once a media element is routed through a MediaElementSource its audio
  // only ever flows through the graph, so the graph is created lazily (first
  // actual use of boost/compressor) and then kept for the element's lifetime.
  const ensureAudioGraph = useCallback(() => {
    const v = videoRef.current;
    if (!v) return null;

    const current = audioGraphRef.current;
    if (current && current.element === v && current.ctx.state !== "closed") return current;

    try {
      const ctx = current && current.ctx.state !== "closed" ? current.ctx : new AudioContext();

      // The element changed under the same player (audio <-> video variants):
      // silence the old chain, the old element is not coming back.
      if (current) {
        try {
          current.source.disconnect();
          current.gain.disconnect();
          current.compressor.disconnect();
        } catch {
          // Already disconnected.
        }
      }

      const source = ctx.createMediaElementSource(v);

      // "Night mode": tame the loud parts so speech stays audible without
      // riding the volume. Values are the usual broadcast-ish preset.
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -28;
      compressor.knee.value = 24;
      compressor.ratio.value = 8;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      const gain = ctx.createGain();

      // Safety limiter so a 300% boost saturates softly instead of clipping.
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -1;
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.001;
      limiter.release.value = 0.1;

      compressor.connect(gain);
      gain.connect(limiter);
      limiter.connect(ctx.destination);
      source.connect(gain);

      const graph = { ctx, element: v, source, compressor, gain };
      audioGraphRef.current = graph;
      return graph;
    } catch {
      // No Web Audio (or the element is already claimed) — boost silently
      // degrades to plain 100% volume.
      return null;
    }
  }, []);

  useEffect(() => {
    const graph = audioGraphRef.current;

    if (boost <= 1 && !compressorOn) {
      // Nothing special requested. If the graph already exists it cannot be
      // detached again, so it keeps running as a transparent pass-through.
      if (graph) {
        graph.gain.gain.value = 1;
        try {
          graph.source.disconnect();
        } catch {
          // Ignore.
        }
        graph.source.connect(graph.gain);
      }
      return;
    }

    // Creating an AudioContext needs a user gesture to start unmuted; the
    // settings arrive either from a click on our controls or restored from
    // storage — in the latter case wait until playback actually starts.
    if (!graph && !isPlaying) return;

    const active = ensureAudioGraph();
    if (!active) return;

    void active.ctx.resume().catch(() => undefined);
    active.gain.gain.value = boost;
    try {
      active.source.disconnect();
    } catch {
      // Ignore.
    }
    active.source.connect(compressorOn ? active.compressor : active.gain);
  }, [boost, compressorOn, isPlaying, ensureAudioGraph, effectiveSrc]);

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

  // Seeks operate on the GLOBAL timeline. In virtual-playlist mode the target
  // may live in another segment: swap the src and defer the local seek.
  const seekTo = useCallback((time: number) => {
    const v = videoRef.current;
    if (!v) return;

    const vr = virtualRef.current;

    if (!vr.segments) {
      const cap = Number.isFinite(v.duration) ? v.duration : Infinity;
      v.currentTime = Math.max(0, Math.min(cap, time));
      return;
    }

    const target = Math.max(0, Math.min(vr.total > 0 ? vr.total - 0.5 : 0, time));
    let index = vr.segments.length - 1;

    for (let i = 0; i < vr.segments.length; i += 1) {
      if (target < vr.offsets[i] + vr.segments[i].durationSec) {
        index = i;
        break;
      }
    }

    const local = Math.max(0, target - vr.offsets[index]);

    if (index === vr.index) {
      v.currentTime = local;
    } else {
      pendingSeekRef.current = { time: local, play: !v.paused };
      setSegmentIndex(index);
    }
  }, []);

  const seekBy = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v) return;
      const vr = virtualRef.current;
      const globalNow = vr.segments ? (vr.offsets[vr.index] ?? 0) + v.currentTime : v.currentTime;
      seekTo(globalNow + delta);
    },
    [seekTo],
  );

  // One continuous scale for the keyboard too: 0..100% element volume, then
  // 100%..300% boost gain.
  const adjustVolume = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;

    if (delta > 0) {
      if (v.volume >= 1 - 1e-6) {
        setBoost(
          Math.min(MAX_VOLUME_BOOST, Math.round((boostRef.current + delta) * 100) / 100),
        );
      } else {
        v.volume = Math.min(1, v.volume + delta);
      }
      return;
    }

    if (boostRef.current > 1) {
      setBoost(Math.max(1, Math.round((boostRef.current + delta) * 100) / 100));
      return;
    }

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
    // Audio mode has nothing behind the controls to uncover — hiding them
    // would just leave an empty strip.
    if (audioOnly) return;
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused) setControlsVisible(false);
    }, HIDE_DELAY_MS);
  }, [audioOnly]);

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
    if (autoRetryRef.current.timer) window.clearTimeout(autoRetryRef.current.timer);
    // Free the audio rendering thread; a remount builds a fresh graph.
    void audioGraphRef.current?.ctx.close().catch(() => undefined);
    audioGraphRef.current = null;
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
    } else if (isPlaying && !audioOnly) {
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
          if (audioOnly) break;
          event.preventDefault();
          toggleFullscreen();
          break;
        case "t":
        case "T":
          if (audioOnly) break;
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
        case "End": {
          event.preventDefault();
          const vr = virtualRef.current;
          seekTo(vr.segments ? vr.total : v.duration || 0);
          break;
        }
        default:
          if (event.key >= "0" && event.key <= "9") {
            event.preventDefault();
            const pct = Number(event.key) / 10;
            const vr = virtualRef.current;
            seekTo(pct * (vr.segments ? vr.total : v.duration || 0));
          }
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    adjustVolume,
    audioOnly,
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
  // In virtual-playlist mode the hovered global time maps to a segment-local
  // one (the preview element's src is switched in render).
  useEffect(() => {
    const preview = previewVideoRef.current;
    if (!preview || !scrubPreview) return;

    const vr = virtualRef.current;
    let local = scrubPreview.time;

    if (vr.segments) {
      let index = vr.segments.length - 1;
      for (let i = 0; i < vr.segments.length; i += 1) {
        if (scrubPreview.time < vr.offsets[i] + vr.segments[i].durationSec) {
          index = i;
          break;
        }
      }
      local = Math.max(0, scrubPreview.time - vr.offsets[index]);
    }

    const target = Math.max(0, Math.floor(local));

    if (Math.abs((preview.currentTime || 0) - target) >= 1) {
      try {
        preview.currentTime = target;
      } catch {
        // Metadata not loaded yet; the next hover move will retry.
      }
    }
  }, [scrubPreview]);

  // Src for the hover-preview element: the hovered segment in playlist mode.
  let previewSrc = effectiveSrc;
  if (segments && scrubPreview) {
    let index = segments.length - 1;
    for (let i = 0; i < segments.length; i += 1) {
      if (scrubPreview.time < segmentOffsets[i] + segments[i].durationSec) {
        index = i;
        break;
      }
    }
    previewSrc = segments[index].src;
  }

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

  // The slider models one continuous loudness scale: element volume up to
  // 100%, Web Audio gain past it.
  const volumeLevel = muted ? 0 : boost > 1 ? boost : volume;
  const volumeLevelPct = (volumeLevel / MAX_VOLUME_BOOST) * 100;

  const VolumeIcon = useMemo(() => {
    if (muted || volume === 0) return VolumeMutedIcon;
    if (volume < 0.5) return VolumeLowIcon;
    return VolumeHighIcon;
  }, [muted, volume]);

  const containerClassName = [
    "vp",
    `vp--${mode}`,
    audioOnly ? "vp--audio" : "",
    controlsVisible ? "vp--show" : "vp--hide",
    isPlaying ? "vp--playing" : "vp--paused",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  // Audio has no frames to show: the stage is a cover strip with a
  // deterministic waveform, the same decoration the archive card uses.
  const waveBars = useMemo(
    () => (audioOnly ? waveformHeights(effectiveSrc || "audio", 64) : []),
    [audioOnly, effectiveSrc],
  );

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying && !audioOnly) setControlsVisible(false);
      }}
    >
      {effectiveSrc && audioOnly ? (
        <div className="vp__audio-stage" onPointerUp={handleVideoPointerUp}>
          <audio
            ref={setVideoNode}
            className="vp__audio-media"
            src={effectiveSrc}
            autoPlay={autoPlay}
            preload="metadata"
          />
          {artworkUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="vp__audio-avatar" src={artworkUrl} alt="" />
          ) : (
            <span className="vp__audio-glyph" aria-hidden>
              🎧
            </span>
          )}
          <span className="vp__audio-wave" aria-hidden>
            {waveBars.map((height, index) => (
              <i
                key={index}
                style={{ height: 8 + height * 2, animationDelay: `${(index % 12) * 70}ms` }}
              />
            ))}
          </span>
        </div>
      ) : effectiveSrc ? (
        <video
          ref={setVideoNode}
          className="vp__video"
          src={effectiveSrc}
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

      {mediaError && effectiveSrc ? (
        <div className="vp__error" role="alert">
          <div className="vp__error-text">{mediaError}</div>
          <button type="button" className="vp__error-retry" onClick={retryPlayback}>
            Повторить
          </button>
        </div>
      ) : null}

      {waiting && !mediaError && effectiveSrc ? (
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

      {!isPlaying && currentTime === 0 && effectiveSrc && !mediaError && !audioOnly ? (
        <button type="button" className="vp__big-play" onClick={togglePlay} aria-label="Play">
          <PlayIcon size={44} />
        </button>
      ) : null}

      {effectiveSrc ? (
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
            {/* Kept mounted so the preview video's metadata loads only once.
                Audio has no frames — only the hovered timestamp is shown. */}
            <div
              className={`vp__scrub-preview${audioOnly ? " vp__scrub-preview--time" : ""}`}
              style={{
                left: `clamp(86px, ${scrubPreview?.left ?? 0}%, calc(100% - 86px))`,
                visibility: scrubPreview ? "visible" : "hidden",
              }}
              aria-hidden
            >
              {audioOnly ? null : (
                <video
                  ref={previewVideoRef}
                  className="vp__scrub-video"
                  src={previewSrc || undefined}
                  muted
                  playsInline
                  preload="metadata"
                  tabIndex={-1}
                />
              )}
              <span className="vp__scrub-time">
                {scrubPreview ? formatTime(scrubPreview.time) : ""}
                {scrubPreview && timelineStartAt ? (
                  <span className="vp__scrub-clock">
                    {formatClock(timelineStartAt + scrubPreview.time * 1000)}
                  </span>
                ) : null}
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
                max={MAX_VOLUME_BOOST}
                step={0.01}
                value={volumeLevel}
                onChange={(event) => {
                  const v = videoRef.current;
                  if (!v) return;
                  const next = Number(event.target.value);
                  v.muted = next === 0;
                  if (next <= 1) {
                    v.volume = Math.max(0, Math.min(1, next));
                    setBoost(1);
                  } else {
                    v.volume = 1;
                    setBoost(Math.min(MAX_VOLUME_BOOST, Math.round(next * 100) / 100));
                  }
                }}
                className="vp__volume-slider"
                aria-label="Громкость (до 300%)"
                style={{
                  // Marker layer first (drawn on top): a tick at the 100%
                  // point so the boost zone reads as "past normal".
                  background: `linear-gradient(to right, transparent calc(${VOLUME_TICK_PCT}% - 1px), rgba(255,255,255,0.95) calc(${VOLUME_TICK_PCT}% - 1px), rgba(255,255,255,0.95) calc(${VOLUME_TICK_PCT}% + 1px), transparent calc(${VOLUME_TICK_PCT}% + 1px)), linear-gradient(to right, var(--text) 0%, var(--text) ${volumeLevelPct}%, rgba(255,255,255,0.3) ${volumeLevelPct}%, rgba(255,255,255,0.3) 100%)`,
                }}
              />
              <span
                className={`vp__volume-pct${boost > 1 ? " vp__volume-pct--boost" : ""}`}
                title="Громкость: выше 100% — программное усиление"
              >
                {Math.round(volumeLevel * 100)}%
              </span>
            </div>

            <button
              type="button"
              className={`vp__btn ${compressorOn ? "vp__btn--active" : ""}`}
              onClick={() => setCompressorOn((value) => !value)}
              title="Компрессор: выравнивает громкость (тихую речь слышно, крики не орут)"
            >
              <CompressorIcon size={18} />
            </button>

            <div className="vp__time">
              {isLive ? <span className="vp__live-dot" /> : null}
              <span>{formatTime(currentTime)}</span>
              {!isLive ? (
                <>
                  <span className="vp__time-sep">/</span>
                  <span>{formatTime(duration)}</span>
                </>
              ) : null}
              {timelineStartAt ? (
                <span
                  className="vp__time-clock"
                  title="Реальное время этого момента записи"
                >
                  {formatClock(timelineStartAt + currentTime * 1000)}
                </span>
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

            {/* Theater and fullscreen exist to enlarge a picture — an audio
                track has none, so the audio player stays compact. */}
            {audioOnly ? null : (
              <>
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
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function describeMediaError(error: MediaError | null, audioOnly = false) {
  const what = audioOnly ? "аудио" : "видео";
  switch (error?.code) {
    case MediaError.MEDIA_ERR_NETWORK:
      return `Ошибка сети при загрузке ${what}. Проверьте подключение и попробуйте снова.`;
    case MediaError.MEDIA_ERR_DECODE:
      return `Не удалось декодировать ${what} — файл может быть повреждён.`;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return audioOnly
        ? "Аудио недоступно: файл не найден или формат не поддерживается браузером."
        : "Видео недоступно: файл не найден или формат не поддерживается браузером.";
    case MediaError.MEDIA_ERR_ABORTED:
      return `Загрузка ${what} была прервана.`;
    default:
      return `Не удалось воспроизвести ${what}.`;
  }
}

/** Wall-clock HH:MM:SS in the viewer's local time zone. */
function formatClock(epochMs: number) {
  const date = new Date(epochMs);
  if (!Number.isFinite(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(
    2,
    "0",
  )}:${String(date.getSeconds()).padStart(2, "0")}`;
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
