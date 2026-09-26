export class DownloadAbortedError extends Error {
  constructor() { super("Telegram download consumer disconnected."); }
}

export class ChunkTimeoutError extends Error {
  constructor() { super("Telegram chunk made no progress before its deadline."); }
}

type ChunkResult = { buffer: Buffer; downloadedBytes: number };
type Consumer = {
  resolve: (result: ChunkResult) => void;
  reject: (error: unknown) => void;
  cleanup: () => void;
};
type Entry = {
  key: string;
  started: boolean;
  failure?: unknown;
  consumers: Set<Consumer>;
  controller: AbortController;
  load: (signal: AbortSignal, hasConsumers: () => boolean) => Promise<Buffer>;
  recover: () => Promise<unknown>;
};

/** A global budget of real downloads, shared by HTTP responses and seeks. */
export class TelegramChunkScheduler {
  private readonly entries = new Map<string, Entry>();
  private readonly queue: Entry[] = [];
  private running = 0;

  constructor(private readonly options: {
    parallelism: () => number;
    timeoutMs: () => number;
    cacheGet: (key: string) => Buffer | null;
    cachePut: (key: string, value: Buffer) => boolean;
    downloaded: (bytes: number, wasted: boolean) => void;
    recoveryFailed: (error: unknown) => void;
  }) {}

  get activeDownloads() { return this.running; }
  get queuedDownloads() { return this.queue.length; }

  read(
    key: string,
    signal: AbortSignal,
    load: Entry["load"],
    recover: Entry["recover"],
  ): Promise<ChunkResult> {
    if (signal.aborted) return Promise.reject(new DownloadAbortedError());
    const cached = this.options.cacheGet(key);
    if (cached) return Promise.resolve({ buffer: cached, downloadedBytes: 0 });

    let entry = this.entries.get(key);
    if (entry?.failure) return Promise.reject(entry.failure);
    if (!entry) {
      entry = { key, started: false, consumers: new Set(), load, recover,
        controller: new AbortController() };
      this.entries.set(key, entry);
      this.queue.push(entry);
    }
    const job = entry;
    const result = new Promise<ChunkResult>((resolve, reject) => {
      const consumer: Consumer = {
        resolve, reject, cleanup: () => signal.removeEventListener("abort", onAbort),
      };
      const onAbort = () => {
        job.consumers.delete(consumer);
        consumer.cleanup();
        reject(new DownloadAbortedError());
        if (job.consumers.size === 0 && !job.started) {
          const index = this.queue.indexOf(job);
          if (index !== -1) this.queue.splice(index, 1);
          this.entries.delete(job.key);
        }
        // Active RPCs cannot be cancelled in GramJS. They keep their budget
        // slot and shared entry until they actually settle, then warm cache.
      };
      job.consumers.add(consumer);
      signal.addEventListener("abort", onAbort, { once: true });
    });
    this.pump();
    return result;
  }

  private pump() {
    while (this.running < this.options.parallelism() && this.queue.length) {
      const entry = this.queue.shift()!;
      if (!entry.consumers.size) continue;
      entry.started = true;
      this.running++;
      void this.run(entry);
    }
  }

  private fail(entry: Entry, error: unknown) {
    entry.failure = error;
    for (const consumer of entry.consumers) {
      consumer.cleanup();
      consumer.reject(error);
    }
    entry.consumers.clear();
  }

  private async run(entry: Entry) {
    const timer = setTimeout(() => {
      this.fail(entry, new ChunkTimeoutError());
      entry.controller.abort();
      // Releasing the slot here would allow unbounded abandoned RPCs. Retire
      // the stuck transport; only its real completion releases this slot.
      void Promise.resolve().then(entry.recover).catch(this.options.recoveryFailed);
    }, this.options.timeoutMs());
    timer.unref();
    try {
      const buffer = await entry.load(entry.controller.signal, () => entry.consumers.size > 0);
      const kept = this.options.cachePut(entry.key, buffer);
      this.options.downloaded(buffer.length, !kept && entry.consumers.size === 0);
      let first = true;
      for (const consumer of entry.consumers) {
        consumer.cleanup();
        // A shared download costs bandwidth once, not once per viewer.
        consumer.resolve({ buffer, downloadedBytes: first ? buffer.length : 0 });
        first = false;
      }
      entry.consumers.clear();
    } catch (error) {
      this.fail(entry, error);
    } finally {
      clearTimeout(timer);
      this.entries.delete(entry.key);
      this.running--;
      this.pump();
    }
  }
}

export function abortableDelay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(new DownloadAbortedError()); return; }
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(new DownloadAbortedError());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
