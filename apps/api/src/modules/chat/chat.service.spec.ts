import assert from "node:assert/strict";
import test from "node:test";
import { ChatService, parseIrcLine, unescapeIrcTagValue } from "./chat.service";
import { buildReplayMessage } from "./replay-message.utils";
import { ArchiveBundleService } from "./archive-bundle.service";

test("decodes Twitch IRCv3 tag escaping", () => {
  assert.equal(unescapeIrcTagValue("Some\\sName\\:test\\\\ok"), "Some Name;test\\ok");

  const parsed = parseIrcLine(
    "@display-name=Some\\sName;tmi-sent-ts=123 :user!user@host PRIVMSG #channel :hello",
  );
  assert.equal(parsed?.tags["display-name"], "Some Name");
});

test("CLEARCHAT carries the banned login in trailing, not in params", () => {
  // The old handler read params[1] — for a real CLEARCHAT line that is
  // undefined, so timeouts and bans never marked any messages as deleted.
  const parsed = parseIrcLine(
    "@ban-duration=600;room-id=1;tmi-sent-ts=123 :tmi.twitch.tv CLEARCHAT #channel :baduser",
  );

  assert.equal(parsed?.command, "CLEARCHAT");
  assert.deepEqual(parsed?.params, ["#channel"]);
  assert.equal(parsed?.trailing, "baduser");
  assert.equal(parsed?.tags["ban-duration"], "600");

  // A permanent ban is the same line without ban-duration.
  const permanent = parseIrcLine(":tmi.twitch.tv CLEARCHAT #channel :baduser");
  assert.equal(permanent?.trailing, "baduser");
  assert.equal(permanent?.tags["ban-duration"], undefined);
});

test("ROOMSTATE confirms a successful chat join", () => {
  const service = new ChatService({} as never, {} as never);
  const capture = {
    channelLogin: "channel",
    joined: false,
  };

  (service as unknown as { handleLine: (value: typeof capture, line: string) => void }).handleLine(
    capture,
    "@room-id=1 :tmi.twitch.tv ROOMSTATE #channel",
  );

  assert.equal(capture.joined, true);
});

test("GIF metadata survives IRC capture, realtime delivery, replay serialization and archive export", async () => {
  const label = "[GIF by DAZN USA]";
  const url = "https://media4.giphy.com/media/example/giphy.gif?cid=original&ep=v1_gifs_search&rid=giphy.gif&ct=g";
  const tag = `0-${label.length - 1}|example|${url}`;
  let saved: any;
  let emitted: any;
  const prisma = {
    chatMessage: {
      create: async ({ data }: any) => saved = { id: "message", ...data },
      findMany: async () => [saved],
    },
    streamSession: { findUnique: async () => ({
      id: "session", channel: { twitchLogin: "channel" },
      startedAt: new Date(1000), endedAt: new Date(5000),
    }) },
    emoteSnapshot: { findUnique: async () => null },
  };
  const service = new ChatService(prisma as never, {
    server: { emit: (_event: string, payload: unknown) => { emitted = payload; } },
  } as never);
  const parsed = parseIrcLine(`@id=provider-id;tmi-sent-ts=2000;emotes=;gifs=${tag} :viewer!user@host PRIVMSG #channel :${label}`)!;
  await (service as any).persistMessage({ sessionId: "session", startedAt: 1000 }, parsed);
  assert.equal(saved.textRaw, label);
  assert.equal(saved.gifsJson, JSON.stringify(tag));
  assert.equal(emitted.message.gifs, tag);
  assert.equal(buildReplayMessage(saved, 1000).gifs, tag);
  const bundles = new ArchiveBundleService(prisma as never, { buildBundleSnapshot: () => null } as never);
  const bundle = await bundles.build("session");
  assert.equal(bundle.messages[0].gifs, tag);
  assert.equal(bundle.messages[0].textRaw, label);
});

test("old and malformed stored GIF metadata keep the original message readable", () => {
  for (const gifsJson of [undefined, null, "broken", "{}", "[]"]) {
    const message = { id: "old", textRaw: "[GIF by DAZN USA]", gifsJson } as any;
    const replay = buildReplayMessage(message, null);
    assert.equal(replay.gifs, undefined);
    assert.equal(replay.textRaw, message.textRaw);
  }
});
