import type { Prisma, StreamSession, RecordingSegment, TelegramUploadPart, Channel } from "@prisma/client";
import type { PrismaService } from "../prisma/prisma.service";
import { resolveRecordingSources } from "./playback-sources";
import { computeSessionChatOffsetSec, sessionMediaStartedAt } from "./playback.utils";

type DirectoryRow = Pick<StreamSession, "id" | "channelId" | "twitchStreamId" | "audioOnly" | "title" | "startedAt" | "createdAt">;
export type BroadcastSession = StreamSession & { channel: Channel; segments: RecordingSegment[]; telegramParts: TelegramUploadPart[] };
export const broadcastInclude = { channel: true, segments: { orderBy: { index: "asc" as const } }, telegramParts: { orderBy: { partIndex: "asc" as const } } };

/** IDs are platform-specific; channelId also separates platforms and users.
 * Unknown IDs and audio tools keep their original, individual identity. */
export function broadcastKey(row: DirectoryRow) {
  return row.twitchStreamId?.trim() && !row.audioOnly
    ? JSON.stringify([row.channelId, row.twitchStreamId]) : JSON.stringify([row.id]);
}

export function groupBroadcasts<T extends DirectoryRow>(rows: T[], search = "") {
  const groups = new Map<string, T[]>();
  for (const row of [...rows].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id))) {
    const key = broadcastKey(row);
    const group = groups.get(key) ?? [];
    group.push(row); groups.set(key, group);
  }
  const needle = search.trim().toLocaleLowerCase();
  return [...groups.values()]
    .filter((group) => !needle || group.some((row) => row.title?.toLocaleLowerCase().includes(needle)))
    .sort((a, b) => (b[0].startedAt ?? b[0].createdAt).getTime() - (a[0].startedAt ?? a[0].createdAt).getTime() || b[0].id.localeCompare(a[0].id));
}

/** Group before pagination: a restart cannot put the same broadcast on two pages.
 * Only the small directory is scanned; large segment/message relations are
 * fetched for the requested page alone. */
export async function listBroadcastPage(prisma: PrismaService, where: Prisma.StreamSessionWhereInput, page: number, pageSize: number, search = "") {
  const directory = await prisma.streamSession.findMany({ where, select: {
    id: true, channelId: true, twitchStreamId: true, audioOnly: true, title: true, startedAt: true, createdAt: true,
  } });
  const groups = groupBroadcasts(directory, search);
  const selected = groups.slice((page - 1) * pageSize, page * pageSize);
  const sessions = selected.length ? await prisma.streamSession.findMany({
    where: { AND: [where, { id: { in: selected.flat().map((row) => row.id) } }] }, include: broadcastInclude,
  }) : [];
  const byId = new Map(sessions.map((session) => [session.id, session]));
  return { total: groups.length, groups: selected.map((group) => group.flatMap((row) => {
    const session = byId.get(row.id); return session ? [session] : [];
  })).filter((group) => group.length) };
}

export async function getBroadcastSessions(prisma: PrismaService, anchor: BroadcastSession, single = false, publicOnly = false) {
  if (single || anchor.audioOnly || !anchor.twitchStreamId?.trim()) return [anchor];
  const members = await prisma.streamSession.findMany({ where: {
    channelId: anchor.channelId, twitchStreamId: anchor.twitchStreamId, audioOnly: false,
    ...(publicOnly ? { videoStatus: "ready" } : { status: { not: "recording" } }),
    OR: [{ playbackPath: { not: null } }, { segmented: true }],
  }, include: broadcastInclude, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
  return members.length ? members : [anchor];
}

type Resolved = Awaited<ReturnType<typeof resolveRecordingSources>>;
type GroupPart = Resolved["parts"][number] & {
  sessionId: string; sessionOffsetSec: number; sessionChatOffsetSec: number;
  sessionMediaStartedAt: string; continuationIndex: number; gapBeforeSec: number;
};

export async function resolveBroadcastPlayback(sessions: BroadcastSession[], videoUrl: (id: string) => string, defaultChatOffset = 0) {
  const ordered = [...sessions].sort((a, b) => sessionMediaStartedAt(a).getTime() - sessionMediaStartedAt(b).getTime() || a.createdAt.getTime() - b.createdAt.getTime());
  const resolved = await Promise.all(ordered.map((session) => resolveRecordingSources(session, videoUrl(session.id))));
  const canonical = [...sessions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id))[0];
  if (ordered.length === 1) return { ...resolved[0], broadcast: null };

  let offset = 0, previousEnd: number | null = null;
  const members = ordered.map((session, index) => {
    const start = sessionMediaStartedAt(session).getTime();
    const duration = session.durationSec ?? session.segments.reduce((sum, part) => sum + (part.durationSec ?? 0), 0);
    const gap = previousEnd === null ? 0 : Math.max(0, (start - previousEnd) / 1000);
    const overlap = previousEnd === null ? 0 : Math.max(0, (previousEnd - start) / 1000);
    const member = { id: session.id, startOffsetSec: offset, durationSec: duration, mediaStartedAt: new Date(start).toISOString(),
      gapBeforeSec: gap, overlapBeforeSec: overlap, available: resolved[index].videoReady, storage: resolved[index].storage };
    if (member.available) offset += duration;
    previousEnd = start + duration * 1000;
    return member;
  });
  const collect = (source?: "drive" | "telegram" | "local"): GroupPart[] => {
    const parts: GroupPart[] = [];
    ordered.forEach((session, index) => {
      const playback = source ? resolved[index].playbackSources.find((item) => item.source === source) : resolved[index];
      if (!playback?.videoUrl) return;
      const member = members[index];
      const pieces = playback.parts.length ? playback.parts : [{ partIndex: 1, partCount: 1, startOffsetSec: 0,
        durationSec: member.durationSec, streamUrl: playback.videoUrl, source: source ?? resolved[index].videoSource! }];
      for (const part of pieces) parts.push({ ...part, sessionId: session.id, sessionOffsetSec: part.startOffsetSec,
        sessionChatOffsetSec: computeSessionChatOffsetSec(session) + defaultChatOffset,
        sessionMediaStartedAt: member.mediaStartedAt, continuationIndex: index + 1,
        gapBeforeSec: part.startOffsetSec === 0 ? member.gapBeforeSec : 0,
        startOffsetSec: member.startOffsetSec + part.startOffsetSec,
      });
    });
    return parts.map((part, index) => ({ ...part, partIndex: index + 1, partCount: parts.length }));
  };
  const playbackSources = (["drive", "telegram", "local"] as const).flatMap((source) => {
    if (!resolved.every((item) => item.playbackSources.some((choice) => choice.source === source))) return [];
    const parts = collect(source);
    return [{ source, videoUrl: parts[0].streamUrl, parts }];
  });
  const storage = Object.fromEntries((["drive", "telegram"] as const).map((source) => {
    const copies = resolved.map((item) => item.storage[source]);
    const available = copies.every((copy) => copy.available);
    const savedParts = copies.reduce((sum, copy) => sum + copy.savedParts, 0);
    const state = available ? "saved" : copies.some((copy) => copy.state === "saving") ? "saving"
      : copies.some((copy) => copy.state === "error") ? "error" : savedParts ? "partial"
      : copies.every((copy) => copy.state === "missing") ? "missing" : "unavailable";
    return [source, { state, available, savedParts, totalParts: copies.reduce((sum, copy) => sum + copy.totalParts, 0) }];
  })) as Resolved["storage"];
  const parts = playbackSources[0]?.parts ?? collect();
  return { storage, playbackSources, parts, videoReady: parts.length > 0, videoUrl: parts[0]?.streamUrl ?? null,
    videoSource: playbackSources[0]?.source ?? parts[0]?.source ?? null,
    broadcast: { id: canonical.id, memberCount: members.length, durationSec: offset, members,
      endedAt: new Date(Math.max(...ordered.map((session) => (session.captureEndedAt ?? session.endedAt ?? session.createdAt).getTime()))).toISOString(),
      fileSizeBytes: ordered.every((session) => session.fileSizeBytes && /^\d+$/.test(session.fileSizeBytes))
        ? ordered.reduce((sum, session) => sum + BigInt(session.fileSizeBytes!), 0n).toString() : null,
      gapSec: members.reduce((sum, member) => sum + member.gapBeforeSec, 0),
      incomplete: members.some((member) => !member.available) },
  };
}
