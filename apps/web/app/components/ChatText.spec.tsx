import assert from "node:assert/strict";
import { after, test } from "node:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderTokens, type EmoteEntry, type Token } from "../lib/chat-render";
import { ChatText } from "./ChatText";
import { parseTwitchGifRanges, resolveArchivedGif } from "../lib/chat-gifs";

const empty = new Map<string, EmoteEntry>();
const links = (text: string) => renderTokens(text, empty).filter((token) => token.type === "link");
const originalText = (tokens: Token[]) => tokens.map((token) =>
  token.type === "mention" ? `@${token.name}` : token.type === "emote" || token.type === "gif" ? token.name : token.value).join("");

test("web addresses with or without a protocol keep their text and use HTTPS by default", () => {
  const text = "http://example.com https://example.com/a www.example.com t.me/channel youtube.com/watch?v=1 stream.neyron.site //example.com/a";
  assert.deepEqual(links(text).map((token) => token.href), [
    "http://example.com/", "https://example.com/a", "https://www.example.com/",
    "https://t.me/channel", "https://youtube.com/watch?v=1", "https://stream.neyron.site/", "https://example.com/a",
  ]);
  assert.equal(originalText(renderTokens(text, empty)), text);
});

test("surrounding punctuation stays outside links while balanced path brackets and query strings survive", () => {
  const text = "Смотри (https://en.wikipedia.org/wiki/Function_(mathematics)), «t.me/channel»! https://example.com/@alice/Kappa?a=1&b=2#part.";
  assert.deepEqual(links(text).map((token) => token.value), [
    "https://en.wikipedia.org/wiki/Function_(mathematics)", "t.me/channel",
    "https://example.com/@alice/Kappa?a=1&b=2#part",
  ]);
  assert.equal(originalText(renderTokens(text, empty)), text);
});

test("international domains remain readable and navigate to the corresponding encoded URL", () => {
  const link = links("https://пример.рф/страница")[0];
  assert.equal(link.value, "https://пример.рф/страница");
  assert.equal(link.href, new URL(link.value).href);
});

test("non-web schemes, email addresses and mentions stay out of web links", () => {
  const text = "javascript:alert(1) data:text/html,<script>alert(1)</script> file:///tmp/a mailto:user@example.com ftp://example.com user@example.com @alice.dev";
  assert.deepEqual(links(text), []);
  assert.equal(originalText(renderTokens(text, empty)), text);
});

test("links coexist with Twitch code-point emotes, 7TV names and mentions", () => {
  const map = new Map([["catJAM", { id: "cat", name: "catJAM", url: "https://example.com/cat.webp", animated: true }]]);
  const text = "😀 Kappa catJAM @viewer https://example.com/Kappa";
  const tokens = renderTokens(text, map, "25:2-6");
  assert.deepEqual(tokens.filter((token) => token.type === "emote").map((token) => token.name), ["Kappa", "catJAM"]);
  assert.deepEqual(tokens.filter((token) => token.type === "mention"), [{ type: "mention", name: "viewer" }]);
  assert.equal(tokens.filter((token) => token.type === "link").length, 1);
  assert.equal(originalText(tokens), text);
});

test("inline platform emotes keep their positions next to links", () => {
  const text = "t.me/channel catJAM https://example.com";
  const start = text.indexOf("catJAM");
  const tokens = renderTokens(text, empty, null, [{ id: "123", name: "catJAM", start, end: start + 6 }]);
  assert.equal(tokens.filter((token) => token.type === "emote").length, 1);
  assert.equal(tokens.filter((token) => token.type === "link").length, 2);
  assert.equal(originalText(tokens), text);
});

const dom = new JSDOM("<!doctype html><body></body>", { url: "http://localhost/" });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
after(() => dom.window.close());

const gifUrl = "https://media4.giphy.com/media/joSNxeswxuc74Juo8X/giphy.gif?cid=original&ep=v1_gifs_trending&rid=giphy.gif&ct=g";

test("Twitch's documented GIF placement replaces its full label and preserves the exact URL", () => {
  const text = "[Y A Y Yes GIF by Djemilah Birnie]";
  const tokens = renderTokens(text, empty, null, null, `0-33|joSNxeswxuc74Juo8X|${gifUrl}`);
  assert.deepEqual(tokens, [{ type: "gif", name: text, id: "joSNxeswxuc74Juo8X", url: gifUrl }]);
});

test("multiple GIFs use code-point positions without swallowing neighbouring text, emotes or links", () => {
  const label = "[Cat Scuba GIF by Respective]";
  const text = `😀 Kappa ${label}, ${label} t.me/channel @viewer`;
  const start = Array.from("😀 Kappa ").length;
  const end = start + label.length - 1;
  const second = end + 3;
  const tag = `${start}-${end}|first|${gifUrl},${second}-${second + label.length - 1}|second|${gifUrl}`;
  const tokens = renderTokens(text, empty, "25:2-6", null, tag);
  assert.deepEqual(tokens.filter((token) => token.type === "gif").map((token) => token.name), [label, label]);
  assert.equal(tokens.filter((token) => token.type === "emote").length, 1);
  assert.equal(tokens.filter((token) => token.type === "link").length, 1);
  assert.equal(tokens.filter((token) => token.type === "mention").length, 1);
  assert.equal(originalText(tokens), text);
});

test("malformed, overlapping and out-of-bounds GIF metadata cannot remove or duplicate chat text", () => {
  const text = "[GIF by DAZN USA]";
  for (const tag of [null, "bad", `0-999|id|${gifUrl}`, `999-1000|id|${gifUrl}`]) {
    const tokens = renderTokens(text, empty, null, null, tag);
    assert.equal(tokens.some((token) => token.type === "gif"), false);
    assert.equal(originalText(tokens), text);
  }
  const tokens = renderTokens(text, empty, null, null, `0-${text.length - 1}|id|${gifUrl},0-2|overlap|${gifUrl}`);
  assert.equal(tokens.length, 1);
  assert.equal(originalText(tokens), text);
});

test("GIF metadata only loads GIPHY HTTPS assets and leaves their URL bytes untouched", () => {
  for (const url of ["javascript:alert(1)", "data:image/gif;base64,AAAA", "http://media.giphy.com/a.gif",
    "https://example.com/a.gif", "https://media.giphy.com.example.com/a.gif", "https://media.giphy.com@localhost/a.gif",
    "https://media.giphy.com:1234/a.gif", "https://media.giphy.com/a\nb.gif"]) {
    assert.deepEqual(parseTwitchGifRanges(`0-5|id|${url}`), []);
  }
  for (const tag of [undefined, [], {}, 1, "0-9999999999999999999|id|" + gifUrl]) {
    assert.deepEqual(parseTwitchGifRanges(tag), []);
  }
  const url = gifUrl + "&q=a,b%2Fc+word";
  assert.equal(parseTwitchGifRanges(`0-5|id|${url}`)[0].url, url);
});

test("GIF images load lazily, open separately and fall back to the original label after a load error", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const label = "[GIF by DAZN USA]";
  let parentActions = 0;
  const render = async (url: string) => act(async () => root.render(<div onClick={() => parentActions++}>
    <ChatText text={label} twitchGifs={`0-${label.length - 1}|id|${url}`} emoteMap={empty} emotePx={28} />
  </div>));
  try {
    await render(gifUrl);
    const image = host.querySelector("img")!;
    assert.equal(image.getAttribute("src"), gifUrl);
    assert.equal(image.alt, label);
    assert.equal(image.getAttribute("loading"), "lazy");
    const link = host.querySelector("a")!;
    assert.equal(link.getAttribute("href"), gifUrl);
    assert.equal(link.target, "_blank");
    assert.equal(link.rel, "noopener noreferrer");
    const click = new dom.window.MouseEvent("click", { bubbles: true, cancelable: true });
    await act(async () => { link.dispatchEvent(click); });
    assert.equal(parentActions, 0);
    assert.equal(click.defaultPrevented, false);
    await act(async () => { image.dispatchEvent(new dom.window.Event("error")); });
    assert.equal(host.querySelector("img"), null);
    assert.equal(host.textContent, label);
    await render(gifUrl + "&next=1");
    assert.ok(host.querySelector("img"), "A failed asset must not hide the next GIF");
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

test("rendered links use native new-tab navigation without triggering message actions or executing HTML", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  let parentActions = 0;
  const text = 't.me/channel <img src=x onerror="alert(1)"> @viewer';
  try {
    await act(async () => root.render(<div onClick={() => parentActions++} onAuxClick={() => parentActions++} onKeyDown={() => parentActions++}>
      <ChatText text={text} emoteMap={empty} emotePx={28} />
    </div>));
    const link = host.querySelector("a")!;
    assert.ok(link);
    assert.equal(link.href, "https://t.me/channel");
    assert.equal(link.target, "_blank");
    assert.equal(link.rel, "noopener noreferrer");
    assert.equal(host.textContent, text);
    assert.equal(host.querySelector("img"), null);
    for (const event of [
      new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }),
      new dom.window.MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }),
      new dom.window.MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }),
      new dom.window.KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" }),
    ]) {
      await act(async () => { link.dispatchEvent(event); });
      assert.equal(event.defaultPrevented, false, "Browser navigation must remain enabled");
    }
    assert.equal(parentActions, 0);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

test("a server GIF copy is preferred, then the original URL, then its caption without a retry loop", async () => {
  const host = document.createElement("div");
  const root = createRoot(host);
  const label = "[GIF by DAZN USA]";
  const reference = `public/chat-gifs/${"a".repeat(64)}`;
  try {
    await act(async () => root.render(<ChatText text={label} emoteMap={empty} emotePx={28}
      twitchGifs={`0-${label.length - 1}|id|${gifUrl}`} gifUrls={{ [gifUrl]: reference }} />));
    assert.equal(host.querySelector("img")?.getAttribute("src"), `/api/${reference}`);
    await act(async () => { host.querySelector("img")!.dispatchEvent(new dom.window.Event("error")); });
    assert.equal(host.querySelector("img")?.getAttribute("src"), gifUrl);
    await act(async () => { host.querySelector("img")!.dispatchEvent(new dom.window.Event("error")); });
    assert.equal(host.querySelector("img"), null);
    assert.equal(host.textContent, label);
  } finally { await act(async () => root.unmount()); }
});

test("an imported archive cannot replace GIF media with executable data or arbitrary routes", () => {
  const key = "a".repeat(64);
  for (const value of ["data:text/html;base64,AAAA", "data:image/svg+xml;base64,AAAA", "javascript:alert(1)", "https://example.com/a.gif"]) {
    assert.equal(resolveArchivedGif(`asset:${key}`, { [key]: value }), null);
    assert.equal(resolveArchivedGif(value), null);
  }
  for (const path of ["public/chat-gifs/../../auth", `public/chat-gifs/${key}?other=1`, `//evil.com/${key}`]) {
    assert.equal(resolveArchivedGif(path), null);
  }
  assert.equal(resolveArchivedGif(`asset:${key}`, { [key]: "data:image/gif;base64,AAAA" }), "data:image/gif;base64,AAAA");
});
