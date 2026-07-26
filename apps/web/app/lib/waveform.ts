/**
 * Deterministic pseudo-waveform for audio covers: the same recording always
 * draws the same bars, so cards and the player stay stable between refreshes
 * (we never decode the actual .m4a just to paint a decoration).
 */
export function waveformHeights(seed: string, count: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return Array.from({ length: count }, (_, index) => {
    hash = (hash * 1103515245 + 12345) >>> 0;
    const wave = Math.sin((index / count) * Math.PI);
    return Math.round(6 + ((hash % 100) / 100) * 16 * (0.45 + wave * 0.55));
  });
}
