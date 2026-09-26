"use client";

import { useEffect, useRef, useState } from "react";
import { previewPosition, spriteUrl, type PreviewFrames } from "../lib/timeline-preload";
export type { PreviewFrames } from "../lib/timeline-preload";

/** Dwell before network I/O. Prepared JPEGs bypass video decode entirely. */
export function TimelinePreview({ src, time, frames, preloaded = {} }: {
  src: string; time: number; frames?: PreviewFrames | null; preloaded?: Record<number, string>;
}) {
  const [target, setTarget] = useState<{ src: string; time: number } | null>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [failedSprite, setFailedSprite] = useState("");
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
    const { index, sheet, column, row } = previewPosition(frames, time);
    const sheetUrl = spriteUrl(frames.baseUrl, sheet);
    if (frames.sprites && (failedSprite !== sheetUrl || preloaded[sheet])) {
      const { columns, rows } = frames.sprites;
      return <span className="vp__scrub-video" style={{ display: "block", position: "relative", overflow: "hidden" }}>
        <img alt="" decoding="sync" src={preloaded[sheet] ?? sheetUrl}
          data-preview-sheet={sheet} onError={() => setFailedSprite(sheetUrl)}
          style={{ position: "absolute", width: `${columns * 100}%`, height: `${rows * 100}%`,
            maxWidth: "none", left: `${-column * 100}%`, top: `${-row * 100}%` }} />
      </span>;
    }
    return <img className="vp__scrub-video" alt="" decoding="async"
      src={`${frames.baseUrl}/preview-${String(index + 1).padStart(6, "0")}.jpg`}
      onError={() => setImageFailed(true)} />;
  }
  return target ? <video ref={ref} className="vp__scrub-video" src={target.src}
    muted playsInline preload="metadata" tabIndex={-1} /> : <span className="vp__scrub-video" />;
}
