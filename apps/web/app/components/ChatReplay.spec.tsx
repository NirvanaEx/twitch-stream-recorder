import assert from "node:assert/strict";
import { after, test } from "node:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "../providers";
import { ChatReplay } from "./ChatReplay";
import type { ChatResponse } from "../lib/chat-render";

const dom = new JSDOM("<!doctype html><body></body>", { url: "http://localhost/" });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
  ResizeObserver: class { observe() {} disconnect() {} },
  fetch: async () => new Response(JSON.stringify({ spoilerFreeDefault: true })),
});
after(() => dom.window.close());

const chat: ChatResponse = {
  messages: [
    { id: "a", authorLogin: "alice", textRaw: "Before the gap", relativeTimeSec: 10 },
    { id: "b", authorLogin: "bob", textRaw: "During the missing video", relativeTimeSec: 50 },
    { id: "c", authorLogin: "carol", textRaw: "After the final frame", relativeTimeSec: 60.1 },
    { id: "d", authorLogin: "dave", textRaw: "Last saved message", relativeTimeSec: 70 },
  ], emotes: null,
  mediaTimeline: { version: 1, captureAnchorMs: 100000,
    points: [{ mediaSec: 0, wallClockMs: 80000 }, { mediaSec: 60, wallClockMs: 160000 }] },
};

async function mount(isLastPart = true, duration = 60, data: ChatResponse = chat) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const video = document.createElement("video");
  Object.defineProperty(video, "duration", { value: duration, configurable: true });
  video.currentTime = 30;
  const root = createRoot(host);
  await act(async () => root.render(<AppProviders><ChatReplay staticData={data}
    videoElement={video} isLive={false} isLastPart={isLastPart} /></AppProviders>));
  const event = async (name: string) => act(async () => { video.dispatchEvent(new dom.window.Event(name)); });
  const click = async (text: string) => {
    const button = [...host.querySelectorAll("button")].find((item) => item.textContent === text);
    assert.ok(button, `Missing button: ${text}`);
    await act(async () => button.click());
  };
  return { host, video, event, click, close: async () => { await act(async () => root.unmount()); host.remove(); } };
}

test("actual replay uses measured source time and reveals gap messages at the next frame", async () => {
  const ui = await mount();
  try {
    assert.match(ui.host.textContent!, /Before the gap/);
    assert.doesNotMatch(ui.host.textContent!, /During the missing video/);
    ui.video.currentTime = 60;
    await ui.event("timeupdate");
    assert.match(ui.host.textContent!, /During the missing video/);
    assert.doesNotMatch(ui.host.textContent!, /After the final frame/);
  } finally { await ui.close(); }
});

test("an imported GIF renders in replay and in the author's history card", async () => {
  const label = "[GIF by DAZN USA]";
  const url = "https://media.giphy.com/media/id/giphy.gif?cid=original";
  const data: ChatResponse = { emotes: null, messages: [{ id: "gif", authorLogin: "alice",
    textRaw: label, relativeTimeSec: 10, gifs: `0-${label.length - 1}|id|${url}` }] };
  const ui = await mount(true, 60, JSON.parse(JSON.stringify(data)));
  try {
    assert.equal(ui.host.querySelector(".chat-gif img")?.getAttribute("src"), url);
    await act(async () => { (ui.host.querySelector(".chat-author") as HTMLButtonElement).click(); });
    const image = document.querySelector(".chat-user-card__row .chat-gif img");
    assert.equal(image?.getAttribute("src"), url);
    assert.equal(image?.closest("button"), null, "GIF links must not be nested in the seek button");
  } finally { await ui.close(); }
});

test("post-stream chat plays, pauses, reaches its end, and resets on seeking", async () => {
  const ui = await mount();
  try {
    ui.video.currentTime = 60;
    await ui.event("timeupdate");
    await ui.event("ended");
    await ui.click("Продолжить чат");
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 300)); });
    assert.match(ui.host.textContent!, /After the final frame/);
    await ui.click("Пауза");
    const paused = ui.host.textContent;
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 300)); });
    assert.equal(ui.host.textContent, paused);
    assert.doesNotMatch(paused!, /Last saved message/);
    await ui.click("К концу чата");
    assert.match(ui.host.textContent!, /Last saved message/);
    ui.video.currentTime = 30;
    await ui.event("seeking");
    await ui.event("seeked");
    assert.doesNotMatch(ui.host.textContent!, /Last saved message|После эфира/);
  } finally { await ui.close(); }
});

test("embedded GIF bytes survive JSON export/import and are used in replay and user history", async () => {
  const label = "[GIF by DAZN USA]";
  const url = "https://media.giphy.com/media/deleted/giphy.gif?cid=original";
  const key = "b".repeat(64);
  const embedded = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const data: ChatResponse = { emotes: null, gifAssets: { [key]: embedded }, messages: [{
    id: "gif", authorLogin: "alice", textRaw: label, relativeTimeSec: 10,
    gifs: `0-${label.length - 1}|id|${url}`, gifUrls: { [url]: `asset:${key}` },
  }] };
  const ui = await mount(true, 60, JSON.parse(JSON.stringify(data)));
  try {
    assert.equal(ui.host.querySelector(".chat-gif img")?.getAttribute("src"), embedded);
    await act(async () => { (ui.host.querySelector(".chat-author") as HTMLButtonElement).click(); });
    assert.equal(document.querySelector(".chat-user-card__row .chat-gif img")?.getAttribute("src"), embedded);
  } finally { await ui.close(); }
});

test("an incomplete imported GIF archive visibly explains the dependency on original images", async () => {
  const ui = await mount(true, 60, { ...chat, missingGifAssets: [{ url: "https://media.giphy.com/deleted.gif", reason: "HTTP 404" }] });
  try { assert.match(ui.host.textContent!, /нет копий некоторых GIF/); }
  finally { await ui.close(); }
});

test("an intermediate Telegram part cannot enter post-stream chat", async () => {
  const ui = await mount(false);
  try {
    ui.video.currentTime = 60;
    await ui.event("timeupdate");
    await ui.event("ended");
    assert.doesNotMatch(ui.host.textContent!, /После эфира|Продолжить чат/);
  } finally { await ui.close(); }
});

test("the last fractional second of media is included before post-stream playback", async () => {
  const ui = await mount(true, 60.2);
  try {
    ui.video.currentTime = 60.2;
    await ui.event("timeupdate");
    await ui.event("ended");
    assert.match(ui.host.textContent!, /After the final frame/);
    assert.doesNotMatch(ui.host.textContent!, /Last saved message/);
  } finally { await ui.close(); }
});
