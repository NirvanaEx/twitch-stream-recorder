/** Source clocks verified against audio packets in the finished media.
 * Slopes stay 1:1. A missing interval is a jump, never stretched chat time.
 */
export type MediaTimeline = {
  version: 1;
  captureAnchorMs: number;
  points: Array<{ mediaSec: number; wallClockMs: number }>;
};

export function validatedMediaTimeline(value: unknown): MediaTimeline | null {
  const map = value as MediaTimeline | null;
  if (!map || map.version !== 1 || !Number.isFinite(map.captureAnchorMs) ||
      !Array.isArray(map.points) || !map.points.length || map.points.length > 10000) return null;
  for (let i = 0; i < map.points.length; i++) {
    const p = map.points[i];
    const previous = map.points[i - 1];
    if (!p || !Number.isFinite(p.mediaSec) || !Number.isFinite(p.wallClockMs) ||
        (previous && (p.mediaSec <= previous.mediaSec || p.wallClockMs <= previous.wallClockMs))) return null;
  }
  return map;
}

export function chatTimeAtMedia(mediaSec: number, timeline?: MediaTimeline | null): number {
  if (!timeline?.points.length) return mediaSec;
  const index = preceding(timeline.points, mediaSec, (p) => p.mediaSec);
  const point = timeline.points[index];
  return (point.wallClockMs - timeline.captureAnchorMs) / 1000 + mediaSec - point.mediaSec;
}

export function mediaTimeAtChat(chatSec: number, timeline?: MediaTimeline | null): number {
  if (!timeline?.points.length) return chatSec;
  const wallMs = timeline.captureAnchorMs + chatSec * 1000;
  const index = preceding(timeline.points, wallMs, (p) => p.wallClockMs);
  const point = timeline.points[index];
  const next = timeline.points[index + 1];
  const mediaSec = point.mediaSec + (wallMs - point.wallClockMs) / 1000;
  // Messages during missing video remain in the log and become visible at
  // the next available frame. Nothing is deleted to fit the video's length.
  return next ? Math.min(mediaSec, next.mediaSec) : mediaSec;
}

function preceding<T>(items: T[], time: number, value: (item: T) => number) {
  let lo = 0;
  let hi = items.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (value(items[mid]) <= time) lo = mid + 1;
    else hi = mid;
  }
  return Math.max(0, lo - 1);
}

export function advanceChatTail(current: number, elapsed: number, end: number, rate: number) {
  return Math.min(end, current + Math.max(0, elapsed) * Math.max(0, rate));
}
