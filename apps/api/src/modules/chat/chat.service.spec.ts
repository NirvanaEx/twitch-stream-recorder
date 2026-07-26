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
