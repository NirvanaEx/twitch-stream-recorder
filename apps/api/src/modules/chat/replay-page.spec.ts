import assert from "node:assert/strict";
import test from "node:test";
import { readReplayPage, REPLAY_PAGE_SIZE } from "./replay-page";
import type { PrismaService } from "../prisma/prisma.service";

test("cursor pages include chats beyond 50k without losing equal-second messages", async () => {
  const all = Array.from({ length: 50003 }, (_, i) => ({ id: String(i).padStart(8, "0"), relativeTimeSec: Math.floor(i / 20) }));
  const prisma = { chatMessage: { findMany: async (query: any) => {
    assert.deepEqual(query.where, { streamSessionId: "stream" });
    assert.deepEqual(query.orderBy, [{ relativeTimeSec: "asc" }, { id: "asc" }]);
    const start = query.cursor ? all.findIndex((m) => m.id === query.cursor.id) + query.skip : 0;
    return all.slice(start, start + query.take);
  } } } as unknown as Pick<PrismaService, "chatMessage">;
  let cursor: string | undefined;
  const received: string[] = [];
  do {
    const page = await readReplayPage(prisma, "stream", true, cursor);
    assert.ok(page.messages.length <= REPLAY_PAGE_SIZE);
    received.push(...page.messages.map((message) => message.id));
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  assert.deepEqual(received, all.map((message) => message.id));
});
