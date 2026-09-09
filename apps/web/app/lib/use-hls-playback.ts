"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type Hls from "hls.js";

/** Only prepared recordings load the HLS chunk. MP4 remains the recovery source. */
export function useHlsPlayback(
  ref: RefObject<HTMLMediaElement | null>, src: string, hlsUrl?: string,
) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const resume = useRef<{ time: number; play: boolean } | null>(null);
  const active = Boolean(hlsUrl && failedUrl !== hlsUrl);

  useEffect(() => {
    const video = ref.current;
    if (!video || !active || !hlsUrl) return;
    let disposed = false;
    let player: Hls | undefined;
    let wantsPlay = video.autoplay;
    const onPlay = () => { wantsPlay = true; };
    const onPause = () => { wantsPlay = false; };
    const fallback = () => {
      if (disposed) return;
      resume.current = { time: video.currentTime || 0, play: wantsPlay };
      setFailedUrl(hlsUrl);
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", fallback);
    video.dataset.delivery = "hls";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else {
      void import("hls.js").then(({ default: HlsPlayer }) => {
        if (disposed) return;
        if (!HlsPlayer.isSupported()) { fallback(); return; }
        player = new HlsPlayer({
          enableWorker: true,
          maxBufferLength: 20,
          maxMaxBufferLength: 40,
          maxBufferSize: 32 * 1024 * 1024,
          backBufferLength: 20,
        });
        player.on(HlsPlayer.Events.ERROR, (_, data) => { if (data.fatal) fallback(); });
        player.loadSource(hlsUrl);
        player.attachMedia(video as HTMLVideoElement);
      }).catch(fallback);
    }
    return () => {
      disposed = true;
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", fallback);
      player?.destroy();
    };
  }, [ref, src, hlsUrl, active]);

  useEffect(() => {
    const video = ref.current;
    if (!video || active) return;
    video.dataset.delivery = "mp4";
    const restore = () => {
      const position = resume.current;
      if (!position) return;
      resume.current = null;
      if (position.time > 0) video.currentTime = position.time;
      if (position.play) void video.play().catch(() => undefined);
    };
    video.addEventListener("loadedmetadata", restore);
    // Hls.destroy() removes src during effect cleanup; set it after cleanup.
    if (video.getAttribute("src") !== src) video.src = src;
    if (video.readyState >= 1) restore();
    return () => video.removeEventListener("loadedmetadata", restore);
  }, [ref, src, active]);

  return { mediaSrc: active ? undefined : src, handlesErrors: active };
}
