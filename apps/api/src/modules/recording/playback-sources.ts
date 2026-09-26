import { BadRequestException } from "@nestjs/common";
import { join } from "node:path";
import { ARCHIVE_FILES, isUnderArchiveRoot } from "../archive-storage/archive-paths";
import { mediaStat } from "./media-stat";
import { resolvePlaybackParts, type MediaTier, type PlaybackPart } from "./playback.utils";

type Segment = {
  index: number; localPath: string | null; archivePath: string | null;
  telegramStatus: string; startOffsetSec: number; durationSec: number | null;
};
type TelegramPart = {
  partIndex: number; partCount: number; startOffsetSec: number; durationSec: number | null;
};
type SourceSession = {
  id: string; playbackPath: string | null; audioOnly: boolean;
  archiveDir?: string | null; archiveStatus?: string; archiveDeletedAt?: Date | null;
  telegramStatus: string; telegramAudioMessageId?: string | null;
  segmented?: boolean; segments?: Segment[]; telegramParts?: TelegramPart[];
};
export type StorageState = "saved" | "partial" | "saving" | "missing" | "unavailable" | "error";

/** A forced source never silently changes to a different store. */
export function parsePlaybackSource(value: unknown): MediaTier | undefined {
  if (value === undefined || value === "auto") return undefined;
  if (value === "drive" || value === "telegram" || value === "local") return value;
  throw new BadRequestException("Unknown playback source.");
}

export function singleFileCandidates(session: Pick<SourceSession, "playbackPath" | "archiveDir" | "archiveDeletedAt" | "audioOnly">) {
  const candidates: { path: string; source: "drive" | "local" }[] = [];
  if (session.playbackPath) candidates.push({ path: session.playbackPath, source: isUnderArchiveRoot(session.playbackPath) ? "drive" : "local" });
  if (session.archiveDir && !session.archiveDeletedAt && isUnderArchiveRoot(session.archiveDir)) {
    const path = join(session.archiveDir, session.audioOnly ? ARCHIVE_FILES.audio : ARCHIVE_FILES.video);
    if (!candidates.some((item) => item.path === path)) candidates.push({ path, source: "drive" });
  }
  return candidates.sort((a, b) => Number(b.source === "drive") - Number(a.source === "drive"));
}

/** Metadata for both stored copies and source-specific, correctly partitioned URLs.
 * Drive paths are checked asynchronously using the bounded listing cache. No
 * Telegram downloads/RPCs are needed to render a recording card.
 */
export async function resolveRecordingSources(
  session: SourceSession,
  baseUrl: string,
  exists: (path: string) => Promise<boolean> = async (path) => ((await mediaStat(path, true))?.size ?? 0) > 0,
) {
  const segments = [...(session.segments ?? [])].sort((a, b) => a.index - b.index);
  const telegramParts = [...(session.telegramParts ?? [])].sort((a, b) => a.partIndex - b.partIndex);
  const checked = await Promise.all(segments.map(async (segment) => ({
    ...segment,
    archivePath: segment.archivePath && await exists(segment.archivePath) ? segment.archivePath : null,
    localPath: segment.localPath && await exists(segment.localPath) ? segment.localPath : null,
  })));
  const files = await Promise.all((session.segmented ? [] : singleFileCandidates(session)).map(async (item) => ({ ...item, exists: await exists(item.path) })));
  const toUrl = (source: MediaTier, part = 1) => `${baseUrl}?source=${source}&part=${part}`;
  const withUrls = (parts: PlaybackPart[]) => parts.map((part) => ({ ...part, streamUrl: toUrl(part.source, part.partIndex) }));
  const segmentParts = (source: MediaTier) => withUrls(checked.map((part) => ({
    partIndex: part.index, partCount: checked.length, startOffsetSec: part.startOffsetSec, durationSec: part.durationSec, source,
  })));
  const contiguousSegments = segments.length > 0 && segments.every((part, i) => part.index === i + 1);
  const driveCount = checked.filter((part) => part.archivePath).length;
  const localCount = checked.filter((part) => part.localPath).length;
  const tgIndices = new Set(telegramParts.map((part) => part.partIndex));
  const tgCount = session.segmented ? segments.filter((part) => part.telegramStatus === "uploaded" && tgIndices.has(part.index)).length : telegramParts.length;
  const tgExpected = session.segmented ? segments.length : Math.max(1, ...telegramParts.map((part) => part.partCount));
  const driveReady = session.segmented ? contiguousSegments && driveCount === segments.length : files.some((item) => item.source === "drive" && item.exists);
  const localReady = session.segmented ? contiguousSegments && localCount === segments.length : files.some((item) => item.source === "local" && item.exists);
  const telegramReady = session.audioOnly
    ? session.telegramStatus === "uploaded" && Boolean(session.telegramAudioMessageId)
    : session.segmented
      ? contiguousSegments && tgCount === segments.length
      : session.telegramStatus === "uploaded" && telegramParts.length === tgExpected && telegramParts.every((part, i) => part.partIndex === i + 1 && part.partCount === tgExpected);
  const storageState = (ready: boolean, count: number, status: string | undefined, recorded: boolean): StorageState => {
    if (ready) return "saved";
    if (status === "error") return "error";
    if (status === "pending" || status === "copying" || status === "uploading") return "saving";
    if (count > 0) return "partial";
    return recorded ? "unavailable" : "missing";
  };
  const storage = {
    drive: {
      state: storageState(driveReady, driveCount, session.archiveStatus, segments.some((part) => part.archivePath) || files.some((item) => item.source === "drive") || session.archiveStatus === "stored"),
      available: driveReady, savedParts: session.segmented ? driveCount : Number(driveReady), totalParts: session.segmented ? segments.length : 1,
    },
    telegram: {
      state: storageState(telegramReady, tgCount, session.telegramStatus, session.telegramStatus === "uploaded"),
      available: telegramReady, savedParts: session.audioOnly ? Number(telegramReady) : tgCount, totalParts: session.audioOnly ? 1 : tgExpected,
    },
  };
  const playbackSources = (["drive", "telegram", "local"] as const).flatMap((source) => {
    if (!(source === "drive" ? driveReady : source === "telegram" ? telegramReady : localReady)) return [];
    const parts = session.segmented ? segmentParts(source) : source === "telegram" && !session.audioOnly
      ? withUrls(telegramParts.map((part) => ({ ...part, source }))) : [];
    return [{ source, videoUrl: parts[0]?.streamUrl ?? toUrl(source), parts }];
  });
  const preferred = playbackSources[0];
  // A capture in progress can span stores. Preserve that playable prefix but
  // don't advertise a partial store as a complete, selectable recording.
  const fallback = session.segmented ? withUrls(resolvePlaybackParts({ hasSingleFile: false, audioOnly: session.audioOnly, telegramStatus: session.telegramStatus, segments: checked, telegramParts })) : [];
  return {
    storage, playbackSources,
    videoReady: Boolean(preferred || fallback.length),
    videoSource: preferred?.source ?? fallback[0]?.source ?? null,
    videoUrl: preferred?.videoUrl ?? fallback[0]?.streamUrl ?? null,
    parts: preferred?.parts ?? fallback,
  };
}
