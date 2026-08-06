"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import type { ChatCopy } from "../lib/chat-copy";
import { formatRenderTime } from "../lib/chat-render";

/**
 * Viewers, title and category as they were at the point the recording has
 * reached.
 *
 * Everything here is deliberately clipped to "so far". A recording is watched
 * to find out what happened; a category strip that already shows the switch to
 * something else two hours in, or a peak that hints at a moment yet to come,
 * spoils exactly that. The full picture is one click away for people who don't
 * mind — the server sends the whole series either way, because whether to be
 * spoiled is the viewer's call.
 */

type MetaPoint = {
  relativeTimeSec: number;
  viewerCount: number | null;
  title: string | null;
  categoryName: string | null;
};

type CategorySegment = {
  categoryName: string | null;
  startSec: number;
  endSec: number | null;
};

type Timeline = {
  points: MetaPoint[];
  segments: CategorySegment[];
  titles: Array<{ atSec: number; title: string | null }>;
  peakViewers: number | null;
  averageViewers: number | null;
};

type Props = {
  /** API path for the timeline; omit to render nothing (offline bundle). */
  timelineUrl?: string;
  /** Point the player has reached, on the broadcast timeline. */
  chatTimeSec: number;
  reveal: boolean;
  onToggleReveal: () => void;
  /**
   * Drop the category bar and the reveal switch entirely (spoiler-free mode).
   *
   * Clipping the bar is not enough there: it is drawn against the full length
   * of the broadcast, so the point where the colour stops is a read-out of how
   * far in the viewer is — the exact thing the mode exists to hide. What is
   * happening *now* stays: viewers, title, category are all "so far" already.
   */
  hideScale?: boolean;
  copy: ChatCopy;
  locale: "ru" | "en";
};

// Distinct enough to tell apart at 4px tall, stable per category name so the
// same game keeps its colour across the strip.
const SEGMENT_COLORS = [
  "#a78bfa",
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#ef4444",
  "#eab308",
];

function colorFor(name: string | null) {
  if (!name) return "#4b5563";
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return SEGMENT_COLORS[Math.abs(hash) % SEGMENT_COLORS.length];
}

function formatCount(value: number, locale: "ru" | "en") {
  return value.toLocaleString(locale === "ru" ? "ru-RU" : "en-US");
}

export function StreamMetaStrip({
  timelineUrl,
  chatTimeSec,
  reveal,
  onToggleReveal,
  hideScale = false,
  copy,
  locale,
}: Props) {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!timelineUrl) return undefined;

    let cancelled = false;
    setTimeline(null);
    setFailed(false);

    void (async () => {
      try {
        const response = await apiGet<Timeline>(timelineUrl);
        if (!cancelled) setTimeline(response);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [timelineUrl]);

  const totalSec = useMemo(() => {
    if (!timeline?.points.length) return 0;
    const last = timeline.points[timeline.points.length - 1];
    // The strip spans the whole broadcast even while clipped, so segments do
    // not jump around as playback advances.
    return Math.max(last.relativeTimeSec, 1);
  }, [timeline]);

  // The latest sample at or before the current position — the state of the
  // stream as the viewer sees it right now.
  const current = useMemo(() => {
    if (!timeline?.points.length) return null;

    let found: MetaPoint | null = null;
    for (const point of timeline.points) {
      if (point.relativeTimeSec > chatTimeSec) break;
      found = point;
    }
    // Before the first sample there is nothing to show but the opening state.
    return found ?? timeline.points[0];
  }, [timeline, chatTimeSec]);

  // Peak among what has already played. The overall peak would announce that
  // something bigger is still coming.
  const peakSoFar = useMemo(() => {
    if (!timeline?.points.length) return null;
    if (reveal) return timeline.peakViewers;

    let peak: number | null = null;
    for (const point of timeline.points) {
      if (point.relativeTimeSec > chatTimeSec) break;
      if (typeof point.viewerCount === "number" && (peak === null || point.viewerCount > peak)) {
        peak = point.viewerCount;
      }
    }
    return peak;
  }, [timeline, chatTimeSec, reveal]);

  if (!timelineUrl || failed) return null;
  if (!timeline) return null;

  if (timeline.points.length === 0) {
    return null;
  }

  const visibleUntil = reveal ? totalSec : Math.min(chatTimeSec, totalSec);

  return (
    <div className="stream-meta">
      <div className="stream-meta__row">
        {current?.viewerCount != null ? (
          <span className="stream-meta__viewers" title={copy.metaViewers}>
            ● {formatCount(current.viewerCount, locale)}
          </span>
        ) : null}
        {peakSoFar != null ? (
          <span className="stream-meta__peak">
            {copy.metaPeak} {formatCount(peakSoFar, locale)}
          </span>
        ) : null}
        {hideScale ? null : (
          <button
            type="button"
            className={`stream-meta__reveal${reveal ? " is-active" : ""}`}
            onClick={onToggleReveal}
            title={copy.metaRevealHint}
            aria-pressed={reveal}
          >
            {reveal ? "👁" : "🙈"}
          </button>
        )}
      </div>

      {current?.categoryName || current?.title ? (
        <div className="stream-meta__now">
          {current.categoryName ? (
            <span
              className="stream-meta__category"
              style={{ borderColor: colorFor(current.categoryName) }}
            >
              {current.categoryName}
            </span>
          ) : null}
          {current.title ? <span className="stream-meta__title">{current.title}</span> : null}
        </div>
      ) : null}

      {hideScale ? null : (
      <div
        className="stream-meta__bar"
        role="img"
        aria-label={copy.metaCategory}
        title={reveal ? undefined : copy.metaRevealHint}
      >
        {timeline.segments.map((segment) => {
          const end = segment.endSec ?? totalSec;
          const clippedEnd = Math.min(end, visibleUntil);

          if (clippedEnd <= segment.startSec) return null;

          const left = (segment.startSec / totalSec) * 100;
          const width = ((clippedEnd - segment.startSec) / totalSec) * 100;

          return (
            <span
              key={`${segment.startSec}-${segment.categoryName ?? "none"}`}
              className="stream-meta__segment"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                background: colorFor(segment.categoryName),
              }}
              title={`${segment.categoryName ?? "—"} · ${formatRenderTime(segment.startSec)}`}
            />
          );
        })}
        {!reveal && visibleUntil < totalSec ? (
          <span
            className="stream-meta__unknown"
            style={{
              left: `${(visibleUntil / totalSec) * 100}%`,
              width: `${((totalSec - visibleUntil) / totalSec) * 100}%`,
            }}
            title={copy.metaRevealHint}
          />
        ) : null}
      </div>
      )}
    </div>
  );
}
