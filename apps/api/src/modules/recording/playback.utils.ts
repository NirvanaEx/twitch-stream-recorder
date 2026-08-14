import { existsSync, statSync, type ReadStream, type Stats } from "node:fs";
import { type ServerResponse } from "node:http";
import { resolve } from "node:path";
import { isUnderArchiveRoot } from "../archive-storage/archive-paths";

/**
 * Where a piece of a recording is read from, in the order playback prefers:
 * the server's own disk (nothing is faster), then the archive drive, then the
 * Telegram copy — the only one left once the drive copy has expired.
 */
export type MediaTier = "local" | "drive" | "telegram";

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
      tier: null as MediaTier | null,
    };
  }

  const absolutePath = resolve(session.playbackPath);
  const tier: MediaTier = isUnderArchiveRoot(absolutePath) ? "drive" : "local";

  if (!existsSync(absolutePath)) {
    return {
      absolutePath,
      fileExists: false,
      fileSizeBytes: session.fileSizeBytes,
      videoReady: false,
      videoUrl: null,
      tier: null as MediaTier | null,
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
      tier: videoReady ? tier : (null as MediaTier | null),
    };
  } catch {
    return {
      absolutePath,
      fileExists: false,
      fileSizeBytes: session.fileSizeBytes,
      videoReady: false,
      videoUrl: null,
      tier: null as MediaTier | null,
    };
  }
}

type PlaybackSegmentFields = {
  index: number;
  localPath: string | null;
  archivePath: string | null;
  telegramStatus: string;
  startOffsetSec: number;
  durationSec: number | null;
};

type PlaybackTelegramPartFields = {
  partIndex: number;
  partCount: number;
  startOffsetSec: number;
  durationSec: number | null;
};

export type PlaybackPart = {
  partIndex: number;
  partCount: number;
  startOffsetSec: number;
  durationSec: number | null;
  source: MediaTier;
};

/**
 * The ordered pieces a recording plays back in, and where each piece is read
 * from. Empty when the recording is one file that is still there — that file
 * IS the whole thing, and the player must not chop it into parts.
 *
 * The tier of a piece follows the same order the video endpoint resolves it
 * in: the chunk on the server disk while the broadcast runs, its copy on the
 * archive drive after the move, and the Telegram message only for chunks
 * neither holds — one whose drive copy expired, or a recording from before
 * the drive existed.
 */
export function resolvePlaybackParts(session: {
  hasSingleFile: boolean;
  audioOnly: boolean;
  telegramStatus: string;
  segments?: PlaybackSegmentFields[];
  telegramParts?: PlaybackTelegramPartFields[];
}): PlaybackPart[] {
  if (session.hasSingleFile || session.audioOnly) {
    return [];
  }

  const segments = [...(session.segments ?? [])].sort((a, b) => a.index - b.index);

  if (segments.length > 0) {
    const parts: PlaybackPart[] = [];

    for (const segment of segments) {
      const source: MediaTier | null = segment.localPath
        ? "local"
        : segment.archivePath
          ? "drive"
          : segment.telegramStatus === "uploaded"
            ? "telegram"
            : null;

      // A chunk that reached none of the three tiers yet (still recording, or
      // its upload failed) would be a hole in the timeline — leaving it out
      // keeps the parts the player is given all playable.
      if (source) {
        parts.push({
          partIndex: segment.index,
          partCount: segments.length,
          startOffsetSec: segment.startOffsetSec,
          durationSec: segment.durationSec,
          source,
        });
      }
    }

    return parts;
  }

  if (session.telegramStatus !== "uploaded") {
    return [];
  }

  return (session.telegramParts ?? []).map((part) => ({
    partIndex: part.partIndex,
    partCount: part.partCount,
    startOffsetSec: part.startOffsetSec,
    durationSec: part.durationSec,
    source: "telegram" as const,
  }));
}

/**
 * Send a file to the client and hang up cleanly when the client does.
 *
 * `createReadStream(...).pipe(res)` looks complete and is not: pipe carries
 * data forwards, never the client's disappearance backwards. A player that
 * opens a range request and cancels it — which every browser does constantly
 * while seeking — leaves the read stream open on a file nobody is reading.
 * Deleting that file then frees no space at all: the kernel keeps its blocks
 * until the last descriptor closes, so `df` stays full while `du` says the
 * recording is gone. On 13.08.2026 five such descriptors held 26 GB hostage.
 */
export function pipeFileToResponse(stream: ReadStream, res: ServerResponse) {
  const close = () => {
    if (!stream.destroyed) {
      stream.destroy();
    }
  };

  res.once("close", close);
  stream.once("end", () => res.off("close", close));

  stream.pipe(res);
}
