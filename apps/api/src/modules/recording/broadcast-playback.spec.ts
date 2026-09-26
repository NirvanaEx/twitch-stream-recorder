import assert from "node:assert/strict";
import test, { after } from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { groupBroadcasts, listBroadcastPage, getBroadcastSessions, resolveBroadcastPlayback, type BroadcastSession } from "./broadcast-playback";

const root = mkdtempSync(join(tmpdir(), "broadcast-test-"));
process.env.ARCHIVE_DIR = root;
after(() => rmSync(root, { recursive: true, force: true }));
function session(id: string, start = 0, overrides: Record<string, unknown> = {}): BroadcastSession {
  const path = join(root, id + ".mp4");
  writeFileSync(path, "fixture");
  return { id, channelId: "channel", twitchStreamId: "broadcast", audioOnly: false, title: "First title",
    createdAt: new Date(start * 1000), startedAt: new Date(0), captureEndedAt: new Date((start + 100) * 1000),
    endedAt: new Date((start + 100) * 1000), durationSec: 100, savedChatOffsetSec: 7, mediaTimelineJson: null,
    playbackPath: path, fileSizeBytes: "7", archiveStatus: "stored", archiveDir: null, segmented: false,
    telegramStatus: "uploaded", segments: [], telegramParts: [1, 2].map(partIndex => ({
      partIndex, partCount: 2, startOffsetSec: (partIndex - 1) * 50, durationSec: 50,
    })), ...overrides } as unknown as BroadcastSession;
}
test("groups exact broadcast/channel IDs, keeps unknown IDs and audio captures separate", () => {
  const rows = [session("a"), session("b", 110), session("c", 0, { channelId: "other" }),
    session("d", 0, { twitchStreamId: "another" }), session("e", 0, { audioOnly: true }),
    session("f", 0, { twitchStreamId: null }), session("g", 0, { twitchStreamId: null })];
  const groups = groupBroadcasts(rows.reverse());
  assert.equal(groups.length, 6);
  assert.deepEqual(groups.find(g => g.length === 2)!.map(s => s.id), ["a", "b"]);
});
test("title search includes the whole broadcast and pagination happens after grouping", async () => {
  const rows = [session("p1"), session("p2", 110, { title: "Changed title" }), session("q", 0, { twitchStreamId: "q" })];
  assert.deepEqual(groupBroadcasts(rows, "CHANGED").flat().map(s => s.id), ["p1", "p2"]);
  let reads = 0;
  const prisma = { streamSession: { findMany: async (args: any) => {
    reads++;
    return args.select ? rows : rows.filter(row => args.where.AND[1].id.in.includes(row.id));
  } } };
  const result = await listBroadcastPage(prisma as any, { videoStatus: "ready" }, 1, 1, "changed");
  assert.equal(result.total, 1); assert.equal(result.groups[0].length, 2); assert.equal(reads, 2);
});
test("single links bypass grouping; public members require ready video", async () => {
  const anchor = session("link"); let query: any;
  const prisma = { streamSession: { findMany: async (args: any) => { query = args; return [anchor]; } } };
  assert.deepEqual(await getBroadcastSessions(prisma as any, anchor, true, true), [anchor]);
  assert.equal(query, undefined);
  await getBroadcastSessions(prisma as any, anchor, false, true);
  assert.equal((query as any).where.videoStatus, "ready"); assert.equal((query as any).where.channelId, anchor.channelId);
});
test("whole Drive files and Telegram partitions share one timeline, preserve file URLs and per-session chat", async () => {
  const a = session("video1"), b = session("video2", 115, { savedChatOffsetSec: -3 });
  const result = await resolveBroadcastPlayback([b, a], id => `/video/${id}`, 2);
  assert.equal(result.broadcast!.id, a.id);
  assert.equal(result.broadcast!.durationSec, 200); assert.equal(result.broadcast!.gapSec, 15);
  assert.equal(result.broadcast!.fileSizeBytes, "14");
  assert.equal(result.videoSource, "drive");
  const [drive, tg] = result.playbackSources;
  assert.equal(drive.parts.length, 2); assert.equal(tg.parts.length, 4);
  assert.deepEqual(tg.parts.map(p => p.startOffsetSec), [0, 50, 100, 150]);
  const part = result.parts[1] as any;
  assert.equal(part.sessionId, b.id); assert.equal(part.sessionOffsetSec, 0);
  assert.equal(part.sessionChatOffsetSec, -1); assert.equal(part.gapBeforeSec, 15);
  assert.equal(tg.parts[2].streamUrl, "/video/video2?source=telegram&part=1");
  assert.equal(tg.parts[2].partIndex, 3);
});
test("partial copies are indicated and cannot masquerade as a complete selectable source", async () => {
  const a = session("full"), b = session("partial", 110, { telegramStatus: "uploading", telegramParts: [] });
  const result = await resolveBroadcastPlayback([a, b], id => `/video/${id}`);
  assert.deepEqual(result.playbackSources.map(s => s.source), ["drive"]);
  assert.equal(result.storage.telegram.available, false); assert.equal(result.storage.telegram.state, "saving");
  assert.equal(result.storage.telegram.savedParts, 2);
});
test("a mixed-store broadcast remains playable and unavailable members are explicit", async () => {
  const a = session("drive-only", 0, { telegramStatus: "none", telegramParts: [] });
  const b = session("telegram-only", 115, { playbackPath: null });
  const c = session("missing", 230, { playbackPath: null, telegramStatus: "none", telegramParts: [] });
  const result = await resolveBroadcastPlayback([a, b, c], id => `/video/${id}`);
  assert.equal(result.playbackSources.length, 0); assert.equal(result.videoReady, true);
  assert.deepEqual(result.parts.map(p => p.source), ["drive", "telegram", "telegram"]);
  assert.equal(result.broadcast!.incomplete, true); assert.equal(result.broadcast!.durationSec, 200);
});
