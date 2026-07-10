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

/** Parse one RFC 7233 byte range, including suffix ranges used by browsers. */
export function parseMediaRange(range: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
  if (!match || size <= 0 || (!match[1] && !match[2])) return null;

  let start: number;
  let end: number;

  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null;
    end = Math.min(end, size - 1);
  }

  if (start < 0 || start >= size || end < start) return null;
  return { start, end };
}

type SessionPlaybackFields = {
  id: string;
  playbackPath: string | null;
  fileSizeBytes: string | null;
};

type SessionChatTimingFields = {
  savedChatOffsetSec: number | null;
  createdAt: Date;
  captureEndedAt: Date | null;
  durationSec: number | null;
};

/**
 * Difference between the chat capture anchor (approximately session.createdAt)
 * and the first frame in the media file. Streamlink may rewind the live HLS
 * window, so chat time zero can sit several seconds after video time zero.
 */
export function computeSessionChatOffsetSec(session: SessionChatTimingFields) {
  if (session.savedChatOffsetSec !== null) return session.savedChatOffsetSec;
  if (!session.captureEndedAt || !session.durationSec || session.durationSec <= 0) return 0;

  const mediaStartMs = session.captureEndedAt.getTime() - session.durationSec * 1000;
  const offset = Math.round((session.createdAt.getTime() - mediaStartMs) / 1000);

  // Reject obviously unrelated/broken timestamps rather than shifting the
  // whole replay by hours. Manual saved offsets are intentionally not clamped.
  return Math.abs(offset) <= 60 * 60 ? offset : 0;
}

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
