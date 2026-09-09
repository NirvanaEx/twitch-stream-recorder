"use client";

import { useEffect, useRef, useState } from "react";

export type PreviewFrames = { baseUrl: string; intervalSec: number; count: number };

/** Dwell before network I/O. Prepared JPEGs bypass video decode entirely. */
export function TimelinePreview({ src, time, frames }: {
  src: string; time: number; frames?: PreviewFrames | null;
}) {
  const [target, setTarget] = useState<{ src: string; time: number } | null>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setTarget({ src, time }), 250);
    return () => window.clearTimeout(timer);
  }, [src, time]);
  useEffect(() => {
    const video = ref.current;
    if (!video || !target) return;
    const seek = () => {
      if (video.readyState >= 1 && Math.abs(video.currentTime - target.time) >= 1) {
        video.currentTime = Math.max(0, Math.min(target.time, video.duration - 0.1));
      }
    };
    seek();
    video.addEventListener("loadedmetadata", seek);
    return () => video.removeEventListener("loadedmetadata", seek);
  }, [target, imageFailed]);
  if (frames && !imageFailed) {
    const index = Math.min(frames.count - 1, Math.floor(Math.max(0, time) / frames.intervalSec));
    return <img className="vp__scrub-video" alt="" decoding="async"
      src={`${frames.baseUrl}/preview-${String(index + 1).padStart(6, "0")}.jpg`}
      onError={() => setImageFailed(true)} />;
  }
  return target ? <video ref={ref} className="vp__scrub-video" src={target.src}
    muted playsInline preload="metadata" tabIndex={-1} /> : <span className="vp__scrub-video" />;
}
