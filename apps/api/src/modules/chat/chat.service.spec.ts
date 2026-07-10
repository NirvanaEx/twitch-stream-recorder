import assert from "node:assert/strict";
import test from "node:test";
import { ChatService, parseIrcLine, unescapeIrcTagValue } from "./chat.service";

test("decodes Twitch IRCv3 tag escaping", () => {
  assert.equal(unescapeIrcTagValue("Some\\sName\\:test\\\\ok"), "Some Name;test\\ok");

  const parsed = parseIrcLine(
    "@display-name=Some\\sName;tmi-sent-ts=123 :user!user@host PRIVMSG #channel :hello",
  );
  assert.equal(parsed?.tags["display-name"], "Some Name");
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
