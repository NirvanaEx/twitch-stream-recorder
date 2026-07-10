export type VodMatchSession = {
  startedAt: Date | null;
  createdAt: Date;
  captureEndedAt: Date | null;
  endedAt: Date | null;
  durationSec: number | null;
};

// A VOD timestamp can be imperfect (publishedAt is used as a fallback), but
// anything farther away is much more likely to be another broadcast.
const MATCH_WINDOW_MS = 12 * 60 * 60 * 1000;
export const SAME_BROADCAST_TOLERANCE_MS = 5 * 60 * 1000;
const MEDIA_WINDOW_PADDING_MS = 30 * 60 * 1000;

/**
 * Actual media coverage of a recorder session.
 *
 * `startedAt` is Twitch's go-live time and is intentionally not used here:
 * every recorder restart within one broadcast receives the same value. The
 * most reliable start is capture end minus the probed media duration.
 */
export function getSessionMediaWindow(session: VodMatchSession) {
  const durationMs =
    session.durationSec && session.durationSec > 0 ? session.durationSec * 1000 : 0;
  const captureEndMs = session.captureEndedAt?.getTime() ?? 0;
  const createdMs = session.createdAt.getTime();

  const startMs = captureEndMs && durationMs ? captureEndMs - durationMs : createdMs;
  const endMs =
    captureEndMs ||
    (durationMs ? startMs + durationMs : session.endedAt?.getTime() ?? startMs + 1);

  return {
    startMs: Math.min(startMs, endMs),
    endMs: Math.max(startMs, endMs),
  };
}

/**
 * Return all recorder fragments that belong to one Twitch VOD, in their real
 * media order. `best` is the earliest fragment of the best-matching broadcast
 * so the userscript initially loads the piece most likely to cover VOD time 0.
 */
export type BroadcastPart = { partIndex: number; partCount: number };

/**
 * Label restart fragments of one broadcast as "part N of M". Recorder
 * restarts (deploys, crashes) split a stream into several sessions that all
 * share the channel and the Twitch go-live time — indistinguishable in every
 * list UI until numbered. Parts are ordered by their real media coverage,
 * not by row creation. Lone sessions get no annotation.
 */
export function annotateBroadcastParts<T extends VodMatchSession & { id: string }>(
  sessions: T[],
  keyOf: (session: T) => string,
): Map<string, BroadcastPart> {
  const clusters = new Map<string, { anchorMs: number; members: T[] }[]>();

  for (const session of sessions) {
    if (!session.startedAt) continue;
    const startedMs = session.startedAt.getTime();
    const groups = clusters.get(keyOf(session)) ?? [];
    const cluster = groups.find(
      (candidate) => Math.abs(candidate.anchorMs - startedMs) <= SAME_BROADCAST_TOLERANCE_MS,
    );
    if (cluster) {
      cluster.members.push(session);
    } else {
      groups.push({ anchorMs: startedMs, members: [session] });
    }
    clusters.set(keyOf(session), groups);
  }

  const parts = new Map<string, BroadcastPart>();

  for (const groups of clusters.values()) {
    for (const cluster of groups) {
      if (cluster.members.length < 2) continue;
      const ordered = cluster.members
        .map((session) => ({ session, media: getSessionMediaWindow(session) }))
        .sort((a, b) => a.media.startMs - b.media.startMs);
      ordered.forEach(({ session }, index) => {
        parts.set(session.id, { partIndex: index + 1, partCount: ordered.length });
      });
    }
  }

  return parts;
}

export function matchSessionsToVod<T extends VodMatchSession>(
  available: T[],
  date?: string,
  length?: string,
): { best: T | null; group: T[] } {
  if (available.length === 0) {
    return { best: null, group: [] };
  }

  const target = date ? new Date(date) : null;

  if (!target || Number.isNaN(target.getTime())) {
    return { best: available[0], group: [available[0]] };
  }

  const targetMs = target.getTime();
  const ranked = available
    .map((session) => ({
      session,
      delta: session.startedAt
        ? Math.abs(session.startedAt.getTime() - targetMs)
        : Number.POSITIVE_INFINITY,
      media: getSessionMediaWindow(session),
    }))
    .sort((a, b) => a.delta - b.delta || a.media.startMs - b.media.startMs);

  const closest = ranked[0];
  if (!closest || closest.delta > MATCH_WINDOW_MS) {
    return { best: null, group: [] };
  }

  const lengthSec = Number.parseInt(length ?? "", 10);
  const vodEndMs =
    targetMs +
    (Number.isFinite(lengthSec) && lengthSec > 0 ? lengthSec * 1000 : MATCH_WINDOW_MS);
  const broadcastStartMs = closest.session.startedAt?.getTime() ?? null;

  const group = ranked
    .filter(({ session, media }) => {
      const sameBroadcast =
        broadcastStartMs === null || session.startedAt === null
          ? true
          : Math.abs(session.startedAt.getTime() - broadcastStartMs) <=
            SAME_BROADCAST_TOLERANCE_MS;
      const overlapsVod =
        media.endMs >= targetMs - MEDIA_WINDOW_PADDING_MS &&
        media.startMs <= vodEndMs + MEDIA_WINDOW_PADDING_MS;
      return sameBroadcast && overlapsVod;
    })
    .sort((a, b) => a.media.startMs - b.media.startMs)
    .map(({ session }) => session);

  return {
    best: group[0] ?? closest.session,
    group: group.length ? group : [closest.session],
  };
}
