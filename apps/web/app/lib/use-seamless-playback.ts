"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { PlaybackStart } from "./playback-sources";
import type { MediaPart } from "./seamless-media";

export function useSeamlessPlayback(ref: RefObject<HTMLMediaElement | null>, parts: MediaPart[] | null, key: string | undefined, initialSegment: number, initial?: PlaybackStart) {
  const [supported, setSupported] = useState(false);
  const [failedKey, setFailedKey] = useState<string>();
  const identity = key ?? parts?.map(p => p.src).join("|") ?? "";
  const enabled = supported && (parts?.length ?? 0) > 1 && failedKey !== identity;
  const settings = useRef({ parts, initial, initialSegment });
  settings.current = { parts, initial, initialSegment };
  useEffect(() => { setSupported(typeof MediaSource !== "undefined"); }, []);
  useEffect(() => {
    const video = ref.current;
    if (!enabled || !video) return;
    let disposed = false;
    let player: { dispose(): void } | undefined;
    const snapshot = settings.current;
    const startIndex = Math.max(0, snapshot.initialSegment - 1);
    const startPart = snapshot.parts![startIndex];
    const base = startPart?.startOffsetSec ?? snapshot.parts!.slice(0, startIndex).reduce((n,p) => n + p.durationSec, 0);
    const time = base + (snapshot.initial?.time ?? 0);
    const restore = () => {
      if (snapshot.initial) {
        video.playbackRate = snapshot.initial.rate;
        if (snapshot.initial.volume !== undefined) video.volume = snapshot.initial.volume;
        if (snapshot.initial.muted !== undefined) video.muted = snapshot.initial.muted;
      }
      if (snapshot.initial?.play || video.autoplay) void video.play().catch(() => {});
    };
    video.addEventListener("loadedmetadata", restore, { once: true });
    void import("./seamless-media").then(({ attachSeamlessMedia }) => {
      if (disposed) return;
      player = attachSeamlessMedia(video, snapshot.parts!, time, error => {
        console.warn("Continuous recording playback unavailable", error);
        if (!disposed) {
          video.dataset.seamlessFallback = JSON.stringify({ time: video.currentTime || time, play: !video.paused });
          setFailedKey(identity);
        }
      });
    }).catch(() => { if (!disposed) setFailedKey(identity); });
    return () => { disposed = true; video.removeEventListener("loadedmetadata", restore); player?.dispose(); };
  }, [enabled, identity, ref]);
  return enabled;
}
