/** Small, dependency-free spectral fingerprints. No playback or real-time sampling. */
export const SAMPLE_RATE = 8000;
export const FRAME = 512;
export const HOP = 256;
const BANDS = 16;
export type Fingerprint = { frames: Float32Array[]; hopSec: number; active: number };

function fft(re: Float64Array, im: Float64Array) {
  for (let i = 1, j = 0; i < re.length; i++) {
    let bit = re.length >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; }
  }
  for (let size = 2; size <= re.length; size <<= 1) {
    const angle = -2 * Math.PI / size;
    for (let base = 0; base < re.length; base += size) {
      for (let j = 0; j < size / 2; j++) {
        const c = Math.cos(angle * j), s = Math.sin(angle * j);
        const a = base + j, b = a + size / 2;
        const real = re[b] * c - im[b] * s, imaginary = re[b] * s + im[b] * c;
        re[b] = re[a] - real; im[b] = im[a] - imaginary;
        re[a] += real; im[a] += imaginary;
      }
    }
  }
}

export function fingerprint(pcm: Float32Array): Fingerprint {
  const raw: Float32Array[] = [], energies: number[] = [];
  const bins = Array.from({ length: FRAME / 2 }, (_, i) => {
    const hz = i * SAMPLE_RATE / FRAME;
    return hz < 100 || hz >= 3800 ? -1 : Math.min(BANDS - 1,
      Math.floor(Math.log(hz / 100) / Math.log(38) * BANDS));
  });
  const window = Float64Array.from({ length: FRAME }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (FRAME - 1)));
  for (let start = 0; start + FRAME <= pcm.length; start += HOP) {
    const re = new Float64Array(FRAME), im = new Float64Array(FRAME);
    let energy = 0;
    for (let i = 0; i < FRAME; i++) { re[i] = pcm[start + i] * window[i]; energy += pcm[start + i] ** 2; }
    fft(re, im);
    const bands = new Float32Array(BANDS);
    for (let i = 0; i < bins.length; i++) if (bins[i] >= 0) bands[bins[i]] += re[i] ** 2 + im[i] ** 2;
    for (let b = 0; b < BANDS; b++) bands[b] = Math.log(1e-8 + bands[b]);
    raw.push(bands); energies.push(energy / FRAME);
  }
  const meanEnergy = energies.reduce((a, b) => a + b, 0) / Math.max(1, energies.length);
  let active = 0;
  const frames = raw.map((row, i) => {
    const out = new Float32Array(BANDS);
    if (energies[i] < Math.max(1e-8, meanEnergy * 0.002)) return out;
    const lo = Math.max(0, i - 8), hi = Math.min(raw.length, i + 9);
    let norm = 0;
    for (let b = 0; b < BANDS; b++) {
      let average = 0;
      for (let j = lo; j < hi; j++) average += raw[j][b];
      out[b] = row[b] - average / (hi - lo);
      norm += out[b] ** 2;
    }
    // Stationary tones cannot identify a unique position in a recording.
    if (norm < 0.05) return new Float32Array(BANDS);
    norm = Math.sqrt(norm);
    for (let b = 0; b < BANDS; b++) out[b] /= norm;
    active++;
    return out;
  });
  return { frames, hopSec: HOP / SAMPLE_RATE, active };
}

export type AudioMatch = { matched: boolean; offsetSec: number; score: number; margin: number; halves: number[] };
export function matchFingerprints(reference: Fingerprint, recording: Fingerprint): AudioMatch | null {
  const q = reference.frames, data = recording.frames;
  if (q.length < 200 || data.length < q.length || reference.active < q.length * 0.35) return null;
  const trim = 10, middle = Math.floor(q.length / 2);
  function score(at: number, from = trim, to = q.length - trim) {
    let sum = 0, count = 0;
    for (let i = from; i < to; i++) {
      let value = 0, norm = 0;
      for (let b = 0; b < BANDS; b++) { value += q[i][b] * data[at + i][b]; norm += q[i][b] ** 2; }
      if (norm > 0.5) { sum += value; count++; }
    }
    return count >= (to - from) * 0.35 ? sum / count : 0;
  }
  // Full frame search: no dependence on the current guessed offset. A short
  // query makes this cheaper than decoding hundreds of seconds in real time.
  const scores: number[] = [];
  let bestAt = 0, best = -1;
  for (let at = 0; at + q.length <= data.length; at++) {
    const value = score(at); scores.push(value);
    if (value > best) { best = value; bestAt = at; }
  }
  let second = -1;
  const guard = Math.ceil(0.7 / reference.hopSec);
  for (let i = 0; i < scores.length; i++) if (Math.abs(i - bestAt) > guard) second = Math.max(second, scores[i]);
  const halves = [score(bestAt, trim, middle), score(bestAt, middle, q.length - trim)];
  // Each half must independently choose the same location. This rejects a
  // delay toggle in the sample and accidental/repeated music matches.
  let consistent = true;
  for (const [from, to] of [[trim, middle], [middle, q.length - trim]]) {
    let halfBest = -1, halfAt = 0;
    for (let at = 0; at < scores.length; at++) {
      const value = score(at, from, to);
      if (value > halfBest) { halfBest = value; halfAt = at; }
    }
    if (Math.abs(halfAt - bestAt) > 3) consistent = false;
  }
  return { matched: best >= 0.62 && best - second >= 0.10 && halves.every(v => v >= 0.55) && consistent,
    offsetSec: bestAt * reference.hopSec, score: best, margin: best - second, halves };
}
