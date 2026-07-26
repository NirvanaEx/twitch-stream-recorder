import assert from "node:assert/strict";
import { Writable } from "node:stream";
import { test } from "node:test";
import { TelegramStreamService } from "./telegram-stream.service";

// The download loop interleaves N strided iterators over ONE MTProto
// connection, caches 512 KB chunks and retries transient failures. It is easy
// to break subtly (an off-by-one chunk offset silently corrupts playback), so
// these tests drive the real service against a fake gramjs client.

const CHUNK = 512 * 1024;

function makePattern(size: number) {
  const buffer = Buffer.allocUnsafe(size);
  for (let i = 0; i < size; i += 1) buffer[i] = i % 251;
  return buffer;
}

type Harness = {
  requests: number;
  bytes: number;
  failAt?: number;
  delayMs?: number;
};

function makeService(file: Buffer, harness: Harness) {
  const client = {
    getMessages: async () => [{ media: { fake: true } }],
    iterDownload({ offset, requestSize, stride }: any) {
      let cursor = Number(offset.toString());
      let finished = false;
      return {
        [Symbol.asyncIterator]() {
          return {
            async next() {
              if (finished || cursor >= file.length) return { value: undefined, done: true };
              if (harness.delayMs) await new Promise((r) => setTimeout(r, harness.delayMs));
              harness.requests += 1;
              if (harness.failAt !== undefined && harness.requests === harness.failAt) {
                throw new Error("TIMEOUT (simulated transient failure)");
              }
              const chunk = file.subarray(cursor, Math.min(cursor + requestSize, file.length));
              harness.bytes += chunk.length;
              if (chunk.length < requestSize) finished = true;
              cursor += stride;
              return { value: chunk, done: false };
            },
          };
        },
      };
    },
  };

  const prisma = {
    telegramUploadPart: {
      findUnique: async ({ where }: any) => ({
        id: `part-${where.streamSessionId_partIndex.partIndex}`,
        chatId: "-1001234567890",
        messageId: "42",
        fileSizeBytes: String(file.length),
      }),
    },
  };

  return new TelegramStreamService(prisma as any, {
    getClient: async () => client,
    resolveChat: async () => ({ id: 1 }),
  } as any);
}

class MockRes extends Writable {
  chunks: Buffer[] = [];
  status = 0;
  headers: Record<string, unknown> = {};
  _write(chunk: Buffer, _encoding: string, done: () => void) {
    this.chunks.push(Buffer.from(chunk));
    done();
  }
  setHeader(name: string, value: unknown) {
    this.headers[name.toLowerCase()] = value;
  }
  writeHead(status: number, headers: Record<string, unknown> = {}) {
    this.status = status;
    for (const [name, value] of Object.entries(headers)) {
      this.headers[name.toLowerCase()] = value;
    }
  }
  body() {
    return Buffer.concat(this.chunks);
  }
}

function begin(service: TelegramStreamService, archive: string, part: number, range?: string) {
  const res = new MockRes();
  const done = service
    .streamToResponse(archive, part, { headers: range ? { range } : {} } as any, res as any)
    .then(() => new Promise<void>((resolve) => res.once("finish", () => resolve())))
    .then(() => {
      res.emit("close");
    });
  return { res, done };
}

async function read(service: TelegramStreamService, range?: string) {
  const { res, done } = begin(service, "session-1", 1, range);
  await done;
  return res;
}

const FILE = makePattern(Math.floor(5.4 * 1024 * 1024)); // ~10.8 chunks: partial tail

test("full read returns the whole file byte-for-byte", async () => {
  const res = await read(makeService(FILE, { requests: 0, bytes: 0 }));
  assert.equal(res.status, 200);
  assert.equal(res.headers["content-length"], FILE.length);
  assert.ok(res.body().equals(FILE));
});

test("unaligned range returns exactly the requested slice", async () => {
  const start = 700_123;
  const end = 2_345_678;
  const res = await read(makeService(FILE, { requests: 0, bytes: 0 }), `bytes=${start}-${end}`);
  assert.equal(res.status, 206);
  assert.equal(res.headers["content-range"], `bytes ${start}-${end}/${FILE.length}`);
  assert.ok(res.body().equals(FILE.subarray(start, end + 1)));
});

test("range ending exactly on a chunk boundary", async () => {
  const res = await read(makeService(FILE, { requests: 0, bytes: 0 }), `bytes=0-${3 * CHUNK - 1}`);
  assert.ok(res.body().equals(FILE.subarray(0, 3 * CHUNK)));
});

test("open-ended tail range reaches the last byte", async () => {
  const start = FILE.length - 300_000;
  const res = await read(makeService(FILE, { requests: 0, bytes: 0 }), `bytes=${start}-`);
  assert.ok(res.body().equals(FILE.subarray(start)));
});

test("suffix range (bytes=-N) works", async () => {
  const res = await read(makeService(FILE, { requests: 0, bytes: 0 }), "bytes=-100000");
  assert.ok(res.body().equals(FILE.subarray(FILE.length - 100_000)));
});

test("an unsatisfiable range is answered with 416", async () => {
  const res = await read(makeService(FILE, { requests: 0, bytes: 0 }), "bytes=999999999-");
  assert.equal(res.status, 416);
});

test("a transient failure mid-stream is retried instead of killing the response", async () => {
  const res = await read(makeService(FILE, { requests: 0, bytes: 0, failAt: 4 }), "bytes=0-3145727");
  assert.ok(res.body().equals(FILE.subarray(0, 3_145_728)));
});

test("re-reading a range is served from the chunk cache", async () => {
  const harness: Harness = { requests: 0, bytes: 0 };
  const service = makeService(FILE, harness);

  await read(service, "bytes=0-1048575");
  const afterFirst = harness.requests;
  const res = await read(service, "bytes=0-1048575");

  assert.ok(res.body().equals(FILE.subarray(0, 1_048_576)));
  assert.equal(harness.requests - afterFirst, 0, "the second read must not touch Telegram");
});

test("a small range costs one chunk, not a full read-ahead window", async () => {
  const harness: Harness = { requests: 0, bytes: 0 };
  const res = await read(makeService(FILE, harness), "bytes=1000-1001");

  assert.equal(res.body().length, 2);
  await new Promise((resolve) => setTimeout(resolve, 50));
  // Browsers probe the mp4 index with ranges this small on every open and
  // every seek; six unconditional workers used to turn each into ~3.5 MB.
  assert.equal(harness.requests, 1);
});

test("chunks in flight when the viewer aborts are cached at the right offset", async () => {
  const harness: Harness = { requests: 0, bytes: 0, delayMs: 40 };
  const service = makeService(FILE, harness);

  const aborted = new MockRes();
  await service.streamToResponse("session-1", 1, { headers: {} } as any, aborted as any);
  await new Promise((resolve) => setTimeout(resolve, 120));
  aborted.destroy();
  aborted.emit("close");
  await new Promise((resolve) => setTimeout(resolve, 300));

  const afterAbort = harness.requests;
  const res = await read(service, `bytes=0-${FILE.length - 1}`);

  // A wrong cache offset here would corrupt playback silently.
  assert.ok(res.body().equals(FILE), "the cache must not be poisoned by the aborted read");
  assert.ok(
    harness.requests - afterAbort < 11,
    "chunks already paid for before the abort should have been kept",
  );
});

test("a disconnect releases the concurrency slot", async () => {
  const harness: Harness = { requests: 0, bytes: 0, delayMs: 30 };
  const service = makeService(FILE, harness);

  const res = new MockRes();
  await service.streamToResponse(
    "session-1",
    1,
    { headers: { range: `bytes=0-${FILE.length - 1}` } } as any,
    res as any,
  );

  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(service.hasActiveStreams(), true);
  res.destroy();
  res.emit("close");
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(service.hasActiveStreams(), false);
});

test("concurrent streams of one archive are summed, not overwritten", async () => {
  process.env.TELEGRAM_STREAM_MAX_CONCURRENT = "4";

  const big = Buffer.alloc(60 * 1024 * 1024, 7);
  // Slow enough that all three are still running when the sample is taken.
  const service = makeService(big, { requests: 0, bytes: 0, delayMs: 350 });
  const range = `bytes=0-${118 * CHUNK - 1}`;

  const first = begin(service, "archive-1", 1, range);
  const second = begin(service, "archive-1", 2, range);
  const third = begin(service, "archive-2", 1, range);

  await new Promise((resolve) => setTimeout(resolve, 3000)); // let the 2 s samplers fire

  const archive = service.getLiveStats("archive-1");
  const global = service.getGlobalStats();

  assert.ok(archive, "archive-1 must report stats");
  assert.equal(archive!.streams.length, 2, "both of its streams must be listed separately");
  const sumOfStreams = archive!.streams.reduce((acc, one) => acc + one.mbpsFromTelegram, 0);
  assert.ok(
    Math.abs(archive!.mbpsFromTelegram - sumOfStreams) < 0.05,
    "the archive total must equal the sum of its streams",
  );
  assert.equal(global.activeStreams, 3);
  assert.ok(global.mbpsFromTelegram > 0);

  await Promise.all([first.done, second.done, third.done]);
  assert.equal(service.getLiveStats("archive-1"), null, "entries must be dropped once done");
  assert.equal(service.getGlobalStats().activeStreams, 0);

  delete process.env.TELEGRAM_STREAM_MAX_CONCURRENT;
});
