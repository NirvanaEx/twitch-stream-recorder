"use client";

import { useEffect, useState } from "react";

export type PreviewFrames = {
  baseUrl: string; intervalSec: number; count: number;
  sprites?: { version: number; columns: number; rows: number; width: number; height: number; count: number };
};
export const spriteUrl = (base: string, index: number) => `${base}/sprite-${String(index + 1).padStart(6, "0")}.webp`;

export function previewPosition(frames: PreviewFrames, time: number) {
  const index = Math.min(frames.count - 1, Math.floor(Math.max(0, time) / frames.intervalSec));
  const columns = frames.sprites?.columns ?? 1;
  const perSheet = columns * (frames.sprites?.rows ?? 1);
  return { index, sheet: Math.floor(index / perSheet), column: index % columns,
    row: Math.floor((index % perSheet) / columns) };
}

/** Two background downloads at a time. Blob URLs keep hover entirely local,
 * even if the HTTP cache evicts a response. Decoded sheets are not held in JS. */
export function useTimelinePreload(frames?: PreviewFrames | null) {
  const base = frames?.baseUrl ?? "";
  const count = frames?.sprites?.count ?? 0;
  const key = `${base}:${count}:${frames?.count ?? 0}`;
  const [cache, setCache] = useState<{ key: string; urls: Record<number, string> }>({ key: "", urls: {} });
  useEffect(() => {
    if (!base || !count) return;
    const controller = new AbortController();
    const urls: Record<number, string> = {};
    let next = 0;
    async function worker() {
      while (!controller.signal.aborted && next < count) {
        const index = next++;
        for (let attempt = 0; attempt < 2 && !controller.signal.aborted; attempt++) {
          try {
            const response = await fetch(spriteUrl(base, index), { priority: "low", cache: attempt ? "reload" : "default",
              signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) });
            if (!response.ok) throw new Error("Preview unavailable");
            const blob = await response.blob();
            if (controller.signal.aborted) break;
            urls[index] = URL.createObjectURL(blob);
            setCache({ key, urls: { ...urls } });
            break;
          } catch { /* Retry once, then let hover use the normal image URL. */ }
        }
      }
    }
    void worker(); void worker();
    return () => {
      controller.abort();
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [base, count, key]);
  return cache.key === key ? cache.urls : {};
}
