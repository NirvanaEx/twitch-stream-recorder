export type MediaRange = { data: ArrayBuffer & { fileStart: number }; total: number };
export const MEDIA_RANGE_BYTES = 4 * 1024 * 1024;

export async function fetchMediaRange(src: string, offset: number, bytes: number,
  signal: AbortSignal, fetcher: typeof fetch = fetch): Promise<MediaRange> {
  const res = await fetcher(src, { headers: { Range: `bytes=${offset}-${offset + bytes - 1}` }, signal });
  if (res.status !== 206) { await res.body?.cancel(); throw new Error(`Range playback returned ${res.status}`); }
  const match = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(res.headers.get("Content-Range") ?? "");
  if (!match || Number(match[1]) !== offset || Number(match[2]) >= Number(match[3])) {
    await res.body?.cancel(); throw new Error("Invalid media range");
  }
  const data = await res.arrayBuffer() as MediaRange["data"];
  if (data.byteLength !== Number(match[2]) - offset + 1) throw new Error("Truncated media range");
  data.fileStart = offset;
  return { data, total: Number(match[3]) };
}

/** Keep the next block in flight while consuming the current block. Only two
 * requests / eight MiB are retained; a seek or disposal cancels stale work. */
export function createMediaRangeReader(src: string, total: number, signal: AbortSignal,
  fetcher: typeof fetch = fetch) {
  type Outcome = { value: MediaRange; error?: never } | { value?: never; error: unknown };
  const pending = new Map<number, { controller: AbortController; result: Promise<Outcome> }>();
  let disposed = false;
  const abort = () => { for (const item of pending.values()) item.controller.abort(); pending.clear(); };
  signal.addEventListener("abort", abort, { once: true });
  const enqueue = (offset: number) => {
    if (offset >= total || pending.has(offset)) return;
    const controller = new AbortController();
    const result = fetchMediaRange(src, offset, Math.min(MEDIA_RANGE_BYTES, total - offset), controller.signal, fetcher)
      .then<Outcome, Outcome>(value => ({ value }), error => ({ error }));
    pending.set(offset, { controller, result });
  };
  return {
    async read(offset: number) {
      if (disposed || signal.aborted) throw new DOMException("Cancelled", "AbortError");
      const next = offset + MEDIA_RANGE_BYTES;
      for (const [position, item] of pending) {
        if (position !== offset && position !== next) { item.controller.abort(); pending.delete(position); }
      }
      enqueue(offset); enqueue(next);
      const entry = pending.get(offset);
      if (!entry) throw new Error("Media range is past end of file");
      const result = await entry.result;
      pending.delete(offset);
      if (disposed || signal.aborted) throw new DOMException("Cancelled", "AbortError");
      if ("error" in result) throw result.error;
      return result.value;
    },
    dispose() { disposed = true; signal.removeEventListener("abort", abort); abort(); },
  };
}

/** Forty-five seconds of wall-clock playback, including at faster speeds. */
export function mediaBufferAhead(playbackRate: number) {
  return 45 * Math.max(1, Math.min(2, Number.isFinite(playbackRate) ? playbackRate : 1));
}
