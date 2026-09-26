import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const playbackAssetRoot = () => resolve(process.env.DATA_DIR ?? "./data", "playback-cache");
export const timelineAssetRoot = () => resolve(process.env.DATA_DIR ?? "./data", "timeline-previews");
const validId = /^[a-z0-9]{20,32}$/;
const types: Record<string, string> = {
  "index.m3u8": "application/vnd.apple.mpegurl",
  "init.mp4": "video/mp4",
};

export function playbackAssetPath(id: string, filename: string, timeline = false) {
  if (!validId.test(id)) return null;
  if (timeline) return /^(preview-\d{6}\.jpg|sprite-\d{6}\.webp)$/.test(filename)
    ? { path: resolve(timelineAssetRoot(), id, filename), contentType: filename.endsWith(".webp") ? "image/webp" : "image/jpeg" } : null;
  const contentType = Object.hasOwn(types, filename) ? types[filename] : (
    /^segment-\d{6}\.m4s$/.test(filename) ? "video/mp4" :
    /^preview-\d{6}\.jpg$/.test(filename) ? "image/jpeg" : null
  );
  return contentType ? { path: resolve(playbackAssetRoot(), id, filename), contentType } : null;
}

/** Only a completely generated, unexpired bundle is advertised. No rendering
 * is triggered by public requests; the bounded preparation CLI publishes it. */
export async function getTimelineAssets(id: string, allowBroadcast = true) {
  if (!validId.test(id)) return null;
  try {
    const data = JSON.parse(await readFile(resolve(timelineAssetRoot(), id, "ready.json"), "utf8"));
    if (data.version !== 2 || (!allowBroadcast && data.broadcast) ||
        !Number.isFinite(data.durationSec) || data.durationSec <= 0 ||
        !Number.isInteger(data.previewCount) || data.previewCount < 1 || data.previewCount > 20000 ||
        !Number.isFinite(data.previewIntervalSec) || data.previewIntervalSec < 1) return null;
    const s = data.sprites;
    const sprites = s?.version === 1 && s.format === "webp" && s.columns === 10 && s.rows === 10 &&
      s.width === 320 && s.height === 180 && s.count === Math.ceil(data.previewCount / 100)
      ? { sprites: s as { version: number; columns: number; rows: number; width: number; height: number; count: number } } : {};
    return { previewFrames: { baseUrl: `/api/public/streams/${id}/timeline`,
      count: data.previewCount, intervalSec: data.previewIntervalSec, ...sprites } };
  } catch { return null; }
}

export async function getPlaybackAssets(id: string) {
  if (!validId.test(id)) return null;
  try {
    const data = JSON.parse(await readFile(resolve(playbackAssetRoot(), id, "ready.json"), "utf8"));
    if (data.version !== 1 || !Number.isFinite(data.expiresAt) || data.expiresAt <= Date.now() ||
        !Number.isFinite(data.durationSec) || data.durationSec <= 0 ||
        !Number.isInteger(data.previewCount) || data.previewCount < 1 || data.previewCount > 1000 ||
        !Number.isFinite(data.previewIntervalSec) || data.previewIntervalSec < 1) return null;
    const baseUrl = `/api/public/streams/${id}/playback`;
    return {
      hlsUrl: `${baseUrl}/index.m3u8`,
      previewFrames: { baseUrl, count: data.previewCount, intervalSec: data.previewIntervalSec },
    };
  } catch { return null; }
}
