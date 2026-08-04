import assert from "node:assert/strict";
import test from "node:test";
import { collectBadges, renderChatMessage, resolveNickColor } from "./vkplay-chat.utils";

// Real parts, copied off the live pubsub of live.vkvideo.ru: the text of a
// message is a JSON string in the editor's own format, not a plain string.
const TEXT_PART = {
  type: "text",
  modificator: "",
  content: '["камри тебя ревнует","unstyled",[]]',
};

const MENTION_PART = {
  type: "mention",
  id: 29614047,
  nick: "Chipchilinka",
  displayName: "Chipchilinka",
  nickColor: "8",
  blogUrl: null,
};

const SMILE_PART = {
  type: "smile",
  id: "f3a80b3c-4abb-4a4c-9d1b-b50929e1a8d0",
  name: "kekw",
  imageFormat: "png",
  largeUrl: "https://images.live.vkvideo.ru/smile/f3a80b3c/icon/size/large",
  smallUrl: "https://images.live.vkvideo.ru/smile/f3a80b3c/icon/size/small",
};

test("unwraps the editor format instead of storing its brackets and quotes", () => {
  const { text } = renderChatMessage([TEXT_PART]);

  assert.equal(text, "камри тебя ревнует");
});

test("keeps a mention readable as the @nick a viewer typed", () => {
  // The platform sends the mention and the text as separate parts and puts no
  // space between them: the space the viewer typed lives inside the text part.
  const { text } = renderChatMessage([
    MENTION_PART,
    { type: "text", content: '[" камри тебя ревнует","unstyled",[]]' },
  ]);

  assert.equal(text, "@Chipchilinka камри тебя ревнует");
});

test("flattens a smile to its name and records where the picture goes", () => {
  const { text, emotes } = renderChatMessage([
    { type: "text", content: '["привет ","unstyled",[]]' },
    SMILE_PART,
  ]);

  assert.equal(text, "привет kekw");
  assert.deepEqual(emotes, [
    {
      id: "f3a80b3c-4abb-4a4c-9d1b-b50929e1a8d0",
      name: "kekw",
      // The name starts right after "привет ", and the recorded span is what
      // the replay swaps back for the image.
      start: 7,
      end: 10,
      url: "https://images.live.vkvideo.ru/smile/f3a80b3c/icon/size/large",
    },
  ]);
  assert.equal(text.slice(emotes[0].start, emotes[0].end + 1), "kekw");
});

test("skips part types nobody has taught it yet rather than printing objects", () => {
  const { text } = renderChatMessage([
    { type: "text", content: '["до ","unstyled",[]]' },
    { type: "sticker-of-the-future", id: 1 },
    { type: "text", content: '["после","unstyled",[]]' },
  ]);

  assert.equal(text, "до после");
});

test("a message of nothing but whitespace is not a message", () => {
  assert.equal(renderChatMessage([{ type: "text", content: '["   ","unstyled",[]]' }]).text, "");
  assert.equal(renderChatMessage(undefined).text, "");
});

test("turns the palette index into a colour, and an unknown one into none", () => {
  assert.equal(resolveNickColor(1), "#e64646");
  assert.equal(resolveNickColor("8"), "#e65fa4");
  assert.equal(resolveNickColor(42), null);
  assert.equal(resolveNickColor(null), null);
});

test("badges and roles end up in one list, pictures included", () => {
  const badges = collectBadges({
    isVerifiedStreamer: true,
    roles: [{ name: "Модератор", mediumUrl: "https://images.live.vkvideo.ru/role/mod/medium" }],
    badges: [
      {
        name: "Подписчик 3 месяца",
        smallUrl: "https://images.live.vkvideo.ru/badge/sub/small",
        achievement: { type: "subscription", name: "subscription_03" },
      },
    ],
  });

  assert.deepEqual(badges, [
    { type: "verified", text: "Verified", count: null, image: null },
    {
      type: "Модератор",
      text: "Модератор",
      count: null,
      image: "https://images.live.vkvideo.ru/role/mod/medium",
    },
    {
      type: "subscription",
      text: "Подписчик 3 месяца",
      count: null,
      image: "https://images.live.vkvideo.ru/badge/sub/small",
    },
  ]);
});
