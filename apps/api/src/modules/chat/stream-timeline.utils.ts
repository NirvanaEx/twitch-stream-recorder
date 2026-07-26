export type MetaPoint = {
  relativeTimeSec: number;
  viewerCount: number | null;
  title: string | null;
  categoryName: string | null;
};

export type CategorySegment = {
  categoryName: string | null;
  startSec: number;
  /** Null while the stream was still in this category when recording ended. */
  endSec: number | null;
};

export type StreamTimeline = {
  points: MetaPoint[];
  segments: CategorySegment[];
  titles: Array<{ atSec: number; title: string | null }>;
  peakViewers: number | null;
  averageViewers: number | null;
};

/**
 * Collapse the raw metadata samples into something a player can show.
 *
 * The points are stored once a minute plus on every change, so they are
 * already sparse; what the UI actually wants is the runs — "Just Chatting from
 * 0:00 to 1:12, then GTA" — and the title changes, which are far rarer than
 * the samples that carry them.
 *
 * Nothing here hides the future: that is the caller's job, because whether a
 * viewer wants to be spoiled is a viewing preference, not a property of the
 * recording.
 */
export function buildStreamTimeline(points: MetaPoint[]): StreamTimeline {
  const sorted = [...points].sort((a, b) => a.relativeTimeSec - b.relativeTimeSec);

  const segments: CategorySegment[] = [];
  const titles: Array<{ atSec: number; title: string | null }> = [];

  let viewerSum = 0;
  let viewerCount = 0;
  let peakViewers: number | null = null;

  for (const point of sorted) {
    const previousSegment = segments[segments.length - 1];

    if (!previousSegment || previousSegment.categoryName !== point.categoryName) {
      if (previousSegment) {
        previousSegment.endSec = point.relativeTimeSec;
      }
      segments.push({
        categoryName: point.categoryName,
        startSec: point.relativeTimeSec,
        endSec: null,
      });
    }

    const previousTitle = titles[titles.length - 1];
    if (!previousTitle || previousTitle.title !== point.title) {
      titles.push({ atSec: point.relativeTimeSec, title: point.title });
    }

    if (typeof point.viewerCount === "number") {
      viewerSum += point.viewerCount;
      viewerCount += 1;
      if (peakViewers === null || point.viewerCount > peakViewers) {
        peakViewers = point.viewerCount;
      }
    }
  }

  return {
    points: sorted,
    segments,
    titles,
    peakViewers,
    averageViewers: viewerCount > 0 ? Math.round(viewerSum / viewerCount) : null,
  };
}
