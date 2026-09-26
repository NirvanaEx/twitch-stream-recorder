import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TelegramService } from "./telegram.service";
import { PartSplitter } from "./part-splitter";
import { ArchiveStorageService } from "../archive-storage/archive-storage.service";

const logger = { log() {}, warn() {}, debug() {} };

test("large archive yields to live uploads after releasing each part", async () => {
  const service: any = Object.create(TelegramService.prototype);
  const events: string[] = [];
  const proto: any = PartSplitter.prototype;
  const names = ["start", "next", "release", "dispose"];
  const saved = names.map((key) => proto[key]);
  let index = 0;
  proto.start = () => undefined;
  proto.next = async () => ++index <= 2 ? { index, path: "part.mp4", sizeBytes: 10, startOffsetSec: (index - 1) * 10, durationSec: 10 } : null;
  proto.release = async (part: any) => { events.push(`release:${part.index}`); };
  proto.dispose = async () => undefined;
  Object.assign(service, {
    logger,
    planSplit: async () => ({ segmentSec: 10, expectedParts: 2 }),
    uploadOnePart: async (_s: any, _c: any, part: any) => { events.push(`old:${part.index}`); },
    uploadWaitingSegments: async () => { events.push("live"); },
    backfillPartCount: async () => undefined,
  });
  try {
    const count = await service.uploadInParts({ id: "session" }, "chat", { filePath: "/test.mp4", fileSize: 20, maxPartBytes: 10, tempDir: "/tmp/test", reusableParts: new Map(), logPrefix: "test" });
    assert.equal(count, 2);
    assert.deepEqual(events, ["old:1", "release:1", "live", "old:2", "release:2", "live"]);
  } finally { names.forEach((key, i) => { proto[key] = saved[i]; }); }
});

test("interleaved live upload respects disabled Telegram setting", async () => {
  const service: any = Object.create(TelegramService.prototype);
  let calls = 0;
  service.getSettings = async () => ({ telegramEnabled: false, telegramChatId: "chat" });
  service.processSegments = async () => { calls++; };
  service.finishSegmentedSessions = async () => undefined;
  await service.uploadWaitingSegments();
  assert.equal(calls, 0);
  service.getSettings = async () => ({ telegramEnabled: true, telegramChatId: "chat" });
  await service.uploadWaitingSegments();
  assert.equal(calls, 1);
});

test("missing chunk ends the pass instead of repeatedly selecting the same row", async () => {
  const service: any = Object.create(TelegramService.prototype);
  let reads = 0;
  let writes = 0;
  service.prisma = { recordingSegment: {
    findFirst: async () => { if (++reads > 1) throw Error("busy retry"); return { id: "part", localPath: "/definitely-missing-live-part.mp4", archivePath: null, session: { id: "session", channel: { twitchLogin: "channel" } } }; },
    update: async () => { writes++; },
  } };
  await service.processSegments({});
  assert.equal(reads, 1);
  assert.equal(writes, 1);
});

test("audio-only Telegram upload uses archived playback when old audio path is gone", async () => {
  const dir = mkdtempSync(join(tmpdir(), "live-offload-audio-"));
  const path = join(dir, "audio.m4a");
  writeFileSync(path, Buffer.alloc(16));
  const service: any = Object.create(TelegramService.prototype);
  let uploadedPath: string | undefined;
  Object.assign(service, {
    logger,
    getMaxPartBytes: () => 1024,
    probeVideoMeta: async () => ({ durationSec: 1 }),
    telegramClientService: {
      getClient: async () => ({ sendFile: async (_entity: any, args: any) => { uploadedPath = args.file; return { id: 123 }; } }),
      resolveChat: async () => "chat",
    },
    prisma: { streamSession: { update: async () => undefined } },
  });
  try {
    const id = await service.uploadAudioTrack({ id: "session", audioOnly: true, playbackPath: path, audioPath: join(dir, "gone.m4a"), channel: { twitchLogin: "channel" } }, "chat");
    assert.equal(id, "123");
    assert.equal(uploadedPath, path);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("moving an audio-only recording updates all media paths together", async () => {
  const dir = mkdtempSync(join(tmpdir(), "live-offload-archive-"));
  const oldData = process.env.DATA_DIR;
  const oldArchive = process.env.ARCHIVE_DIR;
  process.env.DATA_DIR = join(dir, "local");
  process.env.ARCHIVE_DIR = join(dir, "archive");
  mkdirSync(process.env.DATA_DIR);
  const path = join(process.env.DATA_DIR, "audio.m4a");
  writeFileSync(path, Buffer.alloc(16));
  const updates: any[] = [];
  const service: any = Object.create(ArchiveStorageService.prototype);
  Object.assign(service, {
    logger,
    prisma: { streamSession: { update: async (args: any) => { updates.push(args.data); } } },
    writeSidecars: async () => undefined,
    moveFile: async (_source: string, target: string) => target,
  });
  try {
    await service.archiveSession({ id: "session", audioOnly: true, playbackPath: path, audioPath: path, archiveDir: process.env.ARCHIVE_DIR, channel: { twitchLogin: "channel" } });
    const moved = updates.find((data) => data.playbackPath);
    assert.ok(moved);
    assert.equal(moved.audioPath, moved.playbackPath);
    assert.equal(moved.recordingPath, moved.playbackPath);
  } finally {
    if (oldData === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = oldData;
    if (oldArchive === undefined) delete process.env.ARCHIVE_DIR; else process.env.ARCHIVE_DIR = oldArchive;
    rmSync(dir, { recursive: true, force: true });
  }
});
