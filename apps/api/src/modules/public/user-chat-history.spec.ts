import assert from "node:assert/strict";
import test from "node:test";
import { getUserChatHistory } from "./user-chat-history";

const start = new Date("2026-09-08T10:00:00Z");
const sessions = [
  { id: "past", channelId: "channel", chatAvailable: true, startedAt: new Date("2026-09-07T10:00:00Z") },
  { id: "restart", channelId: "channel", chatAvailable: true, startedAt: start },
  { id: "newer", channelId: "channel", chatAvailable: true, startedAt: new Date("2026-09-09T10:00:00Z") },
  { id: "other", channelId: "other", chatAvailable: true, startedAt: new Date("2026-09-07T10:00:00Z") },
];
function message(id: string, session: string, author = "Viewer", timestamp = "2026-09-07T11:00:00Z") {
  return { id, streamSessionId: session, authorLogin: author, textRaw: id,
    relativeTimeSec: 3600, messageTimestamp: new Date(timestamp), isDeleted: false,
    badgesJson: null, badgeInfoJson: null, emotesJson: null, deletedAt: null };
}
function database(rows: any[], current: any = { channelId: "channel", startedAt: start }) {
  return {
    streamSession: {
      findUnique: async () => current,
      findMany: async ({ where, take }: any) => sessions.filter(s =>
        s.channelId === where.channelId && s.startedAt < where.startedAt.lt).slice(0, take),
    },
    chatMessage: {
      findMany: async ({ where, take }: any) => rows.filter(m =>
        where.streamSessionId.in.includes(m.streamSessionId) &&
        (where.authorLogin.mode === "insensitive" ? m.authorLogin.toLowerCase() : m.authorLogin) === where.authorLogin.equals &&
        m.messageTimestamp < where.messageTimestamp.lt).slice(0, take),
    },
  } as any;
}
test("history excludes other users/channels, this broadcast, later VODs and overlapping future messages", async () => {
  const result = await getUserChatHistory(database([
    message("old", "past"), message("wrong-user", "past", "SomeoneElse"),
    message("same-vod", "restart"), message("new", "newer"), message("other-channel", "other"),
    message("overlap", "past", "Viewer", "2026-09-08T10:01:00Z"),
  ]), "current", " VIEWER ");
  assert.deepEqual(result.messages.map(m => m.id), ["old"]);
  assert.equal(result.messages[0].messageTimestamp, "2026-09-07T11:00:00.000Z");
  assert.equal(result.messages[0].historySessionId, "past");
});
test("no broadcast date fails closed and a missing archive is reported", async () => {
  assert.deepEqual((await getUserChatHistory(database([], { channelId: "channel", startedAt: null }), "current", "viewer")).messages, []);
  await assert.rejects(getUserChatHistory(database([], null), "missing", "viewer"), /Запись не найдена/);
});
test("bounded history reports truncation and does not reveal a future ban", async () => {
  const rows = Array.from({ length: 1002 }, (_, i) => message(String(i), "past"));
  Object.assign(rows[0], { isDeleted: true, deletedAt: new Date("2026-09-09T12:00:00Z") });
  Object.assign(rows[1], { isDeleted: true, deletedAt: new Date("2026-09-07T12:00:00Z") });
  const result = await getUserChatHistory(database(rows), "current", "viewer");
  assert.equal(result.messages.length, 1000);
  assert.equal(result.truncated, true);
  assert.equal(result.messages[0].isDeleted, false);
  assert.equal(result.messages[1].isDeleted, true);
});

test("history includes the original GIF attachment alongside the fallback text", async () => {
  const tag = "0-16|id|https://media.giphy.com/media/id/giphy.gif?cid=keep";
  const row = { ...message("gif", "past"), textRaw: "[GIF by Example]", gifsJson: JSON.stringify(tag) };
  const result = await getUserChatHistory(database([row]), "current", "viewer");
  assert.equal(result.messages[0].gifs, tag);
  assert.equal(result.messages[0].textRaw, row.textRaw);
});
