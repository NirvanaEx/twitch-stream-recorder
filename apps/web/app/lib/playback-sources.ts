export type PlaybackSource = "drive" | "telegram" | "local";
export type StorageCopy = {
  state: "saved" | "partial" | "saving" | "missing" | "unavailable" | "error";
  available: boolean; savedParts: number; totalParts: number;
};
export type RecordingStorage = { drive: StorageCopy; telegram: StorageCopy };
export type SourcePart = {
  partIndex: number; partCount: number; streamUrl: string;
  startOffsetSec: number; durationSec: number | null; source: PlaybackSource;
  sessionId?: string;
  sessionOffsetSec?: number;
  sessionChatOffsetSec?: number;
  sessionMediaStartedAt?: string;
  continuationIndex?: number;
  gapBeforeSec?: number;
};
export type BroadcastInfo = {
  id: string; memberCount: number; durationSec: number; gapSec: number; incomplete: boolean;
  members: Array<{ id: string; startOffsetSec: number; durationSec: number; mediaStartedAt: string;
    gapBeforeSec: number; overlapBeforeSec: number; available: boolean; storage: RecordingStorage }>;
};
export type PlaybackChoice = { source: PlaybackSource; videoUrl: string; parts: SourcePart[] };
export type RecordingPlayback = {
  id: string; videoUrl?: string | null; videoSource: PlaybackSource | null;
  parts: SourcePart[]; playbackSources?: PlaybackChoice[]; storage?: RecordingStorage;
  broadcast?: BroadcastInfo | null;
};
export type PlaybackStart = { time: number; play: boolean; rate: number; volume?: number; muted?: boolean };

/** Store boundaries can differ (Drive: one file; Telegram: many files). */
export function locatePlaybackTime(parts: Pick<SourcePart, "startOffsetSec" | "durationSec">[], absoluteTime: number) {
  const time = Number.isFinite(absoluteTime) ? Math.max(0, absoluteTime) : 0;
  if (!parts.length) return { part: 1, time };
  let index = 0;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startOffsetSec <= time) index = i;
  }
  const duration = parts[index].durationSec;
  return { part: index + 1, time: Math.max(0, Math.min(time - parts[index].startOffsetSec, duration && duration > 0 ? duration - 0.05 : Infinity)) };
}
