import { stat } from "node:fs/promises";
import type { Stats } from "node:fs";

/** Async filesystem metadata, with short-lived, bounded listing cache.
 * A slow Drive/FUSE stat must never block the Node event loop. Serving media
 * always bypasses this cache so growing files and moved recordings stay correct.
 */
export function createMediaStatCache(read: (path: string) => Promise<Stats> = stat, now = Date.now) {
  const cache = new Map<string, { until: number; result: Promise<Stats | null> }>();
  return async (path: string, cached = false): Promise<Stats | null> => {
    const previous = cache.get(path);
    if (cached && previous && previous.until > now()) return previous.result;
    const result = read(path).then((value) => value.isFile() ? value : null).catch(() => null);
    if (cached) {
      cache.delete(path);
      const entry = { until: Infinity, result };
      cache.set(path, entry);
      void result.then(() => { entry.until = now() + 3000; });
      while (cache.size > 256) cache.delete(cache.keys().next().value!);
    }
    return result;
  };
}

export const mediaStat = createMediaStatCache();
