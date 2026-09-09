import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const playbackAssetRoot = () => resolve(process.env.DATA_DIR ?? "./data", "playback-cache");
const validId = /^[a-z0-9]{20,32}$/;
const types: Record<string, string> = {
  "index.m3u8": "application/vnd.apple.mpegurl",
  "init.mp4": "video/mp4",
};

export function playbackAssetPath(id: string, filename: string) {
  if (!validId.test(id)) return null;
  const contentType = Object.hasOwn(types, filename) ? types[filename] : (
    /^segment-\d{6}\.m4s$/.test(filename) ? "video/mp4" :
    /^preview-\d{6}\.jpg$/.test(filename) ? "image/jpeg" : null
  );
  return contentType ? { path: resolve(playbackAssetRoot(), id, filename), contentType } : null;
}

/** Only a completely generated, unexpired bundle is advertised. No rendering
 * is triggered by public requests; the bounded preparation CLI publishes it. */
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
