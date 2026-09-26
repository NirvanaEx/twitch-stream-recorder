type Part = { start: number; end: number };
type Range = readonly [number, number];

/** MP4 segment durations are rounded in metadata. Only bridge a small,
 * already-buffered hole at a known part boundary, never missing downloads. */
export function bufferedBoundaryTarget(parts: readonly Part[], ranges: readonly Range[], time: number) {
  for (let i = 1; i < ranges.length; i++) {
    const end = ranges[i - 1][1];
    const [start, nextEnd] = ranges[i];
    if (start - end <= 0 || start - end > 1 || nextEnd - start < 0.15) continue;
    if (time < end - 0.15 || time >= start) continue;
    const boundary = parts.findIndex((part, index) => index > 0 &&
      Math.abs(part.start - start) <= 0.15 &&
      Math.abs(parts[index - 1].end - part.start) <= 0.05 &&
      end >= part.start - 1);
    if (boundary >= 0) return start + 0.001;
  }
  return null;
}
