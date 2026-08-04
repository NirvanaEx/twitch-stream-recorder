export type SegmentManifestRow = {
  name: string;
  /** ffmpeg's own numbering, zero-based. */
  index: number;
  /** Where this chunk starts on the whole-broadcast timeline. */
  startOffsetSec: number;
  durationSec: number;
};

// "part0000.mp4", "part0000.ts", and the "<recording>_part001.mp4" the
// Telegram split writes — anchored on the extension so the "4" of ".mp4" can
// never be read as part of the number.
const CHUNK_NAME = /(?:^|[_-])part(\d+)\.(?:mp4|ts)$/i;

/**
 * Parse the manifest ffmpeg appends a line to every time it closes a chunk
 * ("name,start,end" with `-segment_list_type csv`).
 *
 * It is read while ffmpeg is still writing to it, so the final line may be
 * half-written — anything that is not a complete record is skipped and picked
 * up on the next pass.
 */
export function parseSegmentManifest(raw: string): SegmentManifestRow[] {
  const lines = raw.split("\n");

  // Without a trailing newline the last line is still being written.
  if (!raw.endsWith("\n")) {
    lines.pop();
  }

  const rows: SegmentManifestRow[] = [];

  for (const line of lines) {
    const [name, start, end] = line.trim().split(",");

    if (!name || !start || !end) {
      continue;
    }

    const matched = CHUNK_NAME.exec(name);
    const startSec = Number(start);
    const endSec = Number(end);

    if (!matched || !Number.isFinite(startSec) || !Number.isFinite(endSec)) {
      continue;
    }

    rows.push({
      name,
      index: Number.parseInt(matched[1], 10),
      startOffsetSec: Math.max(0, Math.round(startSec)),
      durationSec: Math.max(0, Math.round(endSec - startSec)),
    });
  }

  return rows;
}
