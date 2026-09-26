import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PublicStreamsController } from "../public/public.controller";
import { ArchivesController } from "../archives/archives.controller";
import { RecordingService } from "./recording.service";

test("public and admin video routes honor explicit Telegram and refuse silent Drive fallback", async () => {
  for (const [controller, method] of [[PublicStreamsController, "streamVideo"], [ArchivesController, "streamArchiveVideo"]] as const) {
    let diskCalls = 0, telegramCalls = 0;
    const context = {
      prisma: { streamSession: { findUnique: async () => ({ id: "a", videoStatus: "ready", playbackPath: "/drive/video", audioOnly: false, channel: { twitchLogin: "test" } }) } },
      recordingService: { getPlayableFile: async () => { diskCalls++; throw new Error("Drive missing"); } },
      telegramStreamService: { streamToResponse: async (_id: string, part: number) => { telegramCalls++; assert.equal(part, 2); } },
    };
    const headers: Record<string, string> = {};
    const response = { setHeader: (name: string, value: string) => { headers[name] = value; } };
    const call = (query: object) => (controller.prototype as any)[method].call(context, "a", { query, headers: {} }, response);
    await call({ source: "telegram", part: "2" });
    assert.equal(diskCalls, 0);
    assert.equal(telegramCalls, 1);
    assert.equal(headers["X-Playback-Source"], "telegram");
    await assert.rejects(call({ source: "drive", part: "2" }), /Drive missing/);
    assert.equal(telegramCalls, 1, "explicit Drive failure does not stream unrelated Telegram bytes");
    await call({ part: "2" });
    assert.equal(telegramCalls, 2, "legacy auto URLs retain fallback");
    await assert.rejects(call({ source: "bogus" }), /Unknown playback source/);
  }
});

test("file resolver prefers Drive and limits forced queries to that store", async () => {
  const dir = await mkdtemp(join(tmpdir(), "playback-routing-"));
  const previous = process.env.ARCHIVE_DIR;
  try {
    const drive = join(dir, "drive-root", "session"), local = join(dir, "local.mp4");
    process.env.ARCHIVE_DIR = join(dir, "drive-root");
    await mkdir(drive, { recursive: true }); await writeFile(local, "local"); await writeFile(join(drive, "video.mp4"), "drive");
    const session = { playbackPath: local, archiveDir: drive, audioOnly: false, segmented: false };
    const context = { prisma: { streamSession: { findUnique: async () => session }, recordingSegment: { findUnique: async () => ({ localPath: local, archivePath: join(drive, "video.mp4") }) } } };
    const get = (source?: "drive" | "local") => RecordingService.prototype.getPlayableFile.call(context as any, "a", 1, source);
    assert.equal((await get()).source, "drive");
    assert.equal((await get("local")).absolutePath, local);
    session.segmented = true;
    assert.equal((await get()).source, "drive");
    await rm(join(drive, "video.mp4"));
    await assert.rejects(get("drive"));
    assert.equal((await get()).source, "local");
  } finally {
    if (previous === undefined) delete process.env.ARCHIVE_DIR; else process.env.ARCHIVE_DIR = previous;
    await rm(dir, { recursive: true, force: true });
  }
});
