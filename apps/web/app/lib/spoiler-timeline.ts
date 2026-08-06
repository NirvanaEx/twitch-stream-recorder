/**
 * The spoiler-free timeline mapping.
 *
 * An ordinary progress bar answers "how much is left" whether you asked or
 * not: a thumb a quarter of the way along says the broadcast is four times
 * longer than what has been watched. So in spoiler-free mode the bar stops
 * being a picture of the recording and becomes a picture of the viewer's
 * progress through it.
 *
 * Everything seen so far is stretched across the bar, always filling it, and a
 * fixed strip on the right is fog — the part nobody has looked at. The scale
 * shrinks as you watch: after ten minutes the bar is ten minutes wide, after
 * two hours it is two hours wide, and neither says anything about the end.
 * Rewinding is exact, because that ground is known. Dragging into the fog
 * jumps forward blind, and the further in, the bigger the jump — squared, so
 * the near edge is fine control and the far edge is a real skip.
 *
 * Pure functions in their own file so the geometry can be reasoned about (and
 * checked) without a player, a video element or a DOM.
 */

/** Share of the bar's width given over to the fog. */
export const FOG_WIDTH_PCT = 18;

/**
 * Assumed minimum span of the clear zone.
 *
 * Without it the first seconds of playback map a two-second clear zone across
 * 82% of the bar and the thumb shoots to the far end at a walking pace.
 */
export const MIN_REVEALED_SEC = 60;

/** Longest single jump the fog can take you, at its very right edge. */
export const FOG_MAX_JUMP_SEC = 1800;

const CLEAR_WIDTH_PCT = 100 - FOG_WIDTH_PCT;

/** Seconds of recording the clear part of the bar spans. */
export function clearSpanSec(revealedSec: number): number {
  return Math.max(MIN_REVEALED_SEC, Number.isFinite(revealedSec) ? revealedSec : 0);
}

/** A moment in the recording → where it sits along the bar, in percent. */
export function spoilerTimeToPct(timeSec: number, revealedSec: number): number {
  const span = clearSpanSec(revealedSec);

  if (!Number.isFinite(timeSec) || timeSec <= 0) return 0;
  if (timeSec <= span) {
    return Math.min(CLEAR_WIDTH_PCT, (timeSec / span) * CLEAR_WIDTH_PCT);
  }

  // Inverse of the squared mapping in spoilerPctToTime.
  const into = Math.min(1, Math.sqrt((timeSec - span) / FOG_MAX_JUMP_SEC));
  return CLEAR_WIDTH_PCT + into * FOG_WIDTH_PCT;
}

/**
 * A point along the bar (0..1) → the moment it means.
 *
 * `durationSec` only ever clamps, and silently: running out of recording must
 * not be the thing that announces the recording has an end here.
 */
export function spoilerPctToTime(
  pct: number,
  revealedSec: number,
  durationSec: number,
): number {
  const span = clearSpanSec(revealedSec);
  const clamped = Math.max(0, Math.min(1, pct));
  const clear = CLEAR_WIDTH_PCT / 100;

  if (clamped <= clear) return (clamped / clear) * span;

  const into = (clamped - clear) / (FOG_WIDTH_PCT / 100);
  const target = span + into * into * FOG_MAX_JUMP_SEC;

  return durationSec > 0 ? Math.min(target, durationSec) : target;
}

/** Ordinary mode: the bar is the recording, linearly. */
export function plainTimeToPct(timeSec: number, durationSec: number): number {
  if (!(durationSec > 0) || !Number.isFinite(timeSec)) return 0;
  return Math.max(0, Math.min(100, (timeSec / durationSec) * 100));
}
