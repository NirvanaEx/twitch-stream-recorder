import { existsSync, statSync, type Stats } from "node:fs";
import { resolve } from "node:path";

/**
 * Cache headers for a local media file. Recordings are immutable once written,
 * so the browser may keep fetched ranges and revalidate with the ETag instead
 * of re-downloading the whole file on every page visit — without these headers
 * every refresh of the player (or of the Twitch userscript overlay) pulled the
 * full audio track again.
 */
export function buildMediaCacheHeaders(stat: Stats, maxAgeSec: number) {
  const etag = `"${stat.size.toString(16)}-${Math.round(stat.mtimeMs).toString(16)}"`;

  return {
    etag,
    headers: {
      "Cache-Control": `private, max-age=${maxAgeSec}`,
      ETag: etag,
      "Last-Modified": new Date(stat.mtimeMs).toUTCString(),
    } as Record<string, string>,
  };
}

type SessionPlaybackFields = {
  id: string;
  playbackPath: string | null;
  fileSizeBytes: string | null;
};

export function resolveSessionPlaybackState(session: SessionPlaybackFields) {
  if (!session.playbackPath) {
    return {
      absolutePath: null,
      fileExists: false,
      fileSizeBytes: session.fileSizeBytes,
      videoReady: false,
      videoUrl: null,
    };
  }

  const absolutePath = resolve(session.playbackPath);

  if (!existsSync(absolutePath)) {
    return {
      absolutePath,
      fileExists: false,
      fileSizeBytes: session.fileSizeBytes,
      videoReady: false,
      videoUrl: null,
    };
  }

  try {
    const stat = statSync(absolutePath);
    const fileSizeBytes = String(stat.size);
    const videoReady = stat.size > 0;

    return {
      absolutePath,
      fileExists: true,
      fileSizeBytes,
      videoReady,
      videoUrl: videoReady ? `/api/archives/${session.id}/video` : null,
    };
  } catch {
    return {
      absolutePath,
      fileExists: false,
      fileSizeBytes: session.fileSizeBytes,
      videoReady: false,
      videoUrl: null,
    };
  }
}
