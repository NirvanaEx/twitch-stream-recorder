import assert from "node:assert/strict";
import test from "node:test";
import { loadReplayChat } from "./replay-loader";

test("all pages are loaded and the first page's emotes are retained", async () => {
  const urls: string[] = [];
  const emotes = { provider: "test", fetchedAt: "now", emotes: [] };
  const result = await loadReplayChat("public/streams/id/chat", () => false, async (url) => {
    urls.push(url);
    return urls.length === 1
      ? { messages: [{ id: "1", authorLogin: "a", textRaw: "during", relativeTimeSec: 10 }], emotes, nextCursor: "1" }
      : { messages: [{ id: "2", authorLogin: "b", textRaw: "after stream", relativeTimeSec: 10000 }], emotes: null, nextCursor: null };
  });
  assert.equal(result?.messages.length, 2);
  assert.equal(result?.messages[1].relativeTimeSec, 10000);
  assert.equal(result?.emotes, emotes);
  assert.match(urls[1], /page=1&cursor=1$/);
});

test("changing recordings cancels further page requests", async () => {
  let cancelled = false;
  const result = await loadReplayChat("archives/id/chat", () => cancelled, async () => {
    cancelled = true;
    return { messages: [], emotes: null, nextCursor: "next" };
  });
  assert.equal(result, null);
});
