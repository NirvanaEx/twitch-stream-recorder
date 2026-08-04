import assert from "node:assert/strict";
import test from "node:test";
import { PlatformsService } from "../platforms/platforms.service";
import { TwitchService } from "../twitch/twitch.service";
import { KickService } from "../kick/kick.service";
import { KickPublicClient } from "../kick/kick-public.client";
import { VkPlayPublicClient, parseBlogId, type VkPlayStream } from "./vkplay-public.client";
import { VkPlayService } from "./vkplay.service";

function makeService(stream: Partial<VkPlayStream> | null) {
  const client = {
    getStream: async () =>
      stream === null
        ? null
        : ({
            streamId: "10d2bffb-f8e2-4c78-828f-f79ae4a0b1bb",
            blogId: "12270079",
            channelName: "iserveri",
            displayName: "ISERVERI",
            avatarUrl: "https://images.live.vkvideo.ru/user/12270079/avatar",
            isOnline: true,
            title: "Mausekonig",
            category: "МИР ТАНКОВ",
            viewers: 11836,
            startedAt: "2026-08-04T16:38:25.000Z",
            previewUrl: "https://images.live.vkvideo.ru/preview",
            hasChat: true,
            chatChannel: "channel-chat:12270079",
            ...stream,
          } satisfies VkPlayStream),
  } as unknown as VkPlayPublicClient;

  return new VkPlayService(client);
}

test("takes a channel out of any address the platform has been called", async () => {
  const service = makeService({});

  for (const input of [
    "https://live.vkvideo.ru/iserveri",
    "https://live.vkplay.ru/iserveri",
    "https://vkplay.live/iserveri/",
    "https://live.vkvideo.ru/iserveri?utm_source=share",
    "@iserveri",
    "  ISERVERI  ",
  ]) {
    assert.equal(service.normalizeChannelInput(input), "iserveri", input);
  }
});

test("rejects what is not a channel name before anything is stored", () => {
  const service = makeService({});

  assert.throws(() => service.normalizeChannelInput(""), /empty/i);
  assert.throws(() => service.normalizeChannelInput("https://twitch.tv/xqc"), /Invalid/);
  assert.throws(() => service.normalizeChannelInput("канал"), /Invalid/);
});

test("an offline channel is not a live stream", async () => {
  const service = makeService({ isOnline: false });

  assert.equal(await service.getLiveStream({ login: "iserveri" }), null);
});

test("a live channel comes back in the shape every platform reports", async () => {
  const service = makeService({});

  assert.deepEqual(await service.getLiveStream({ login: "https://live.vkvideo.ru/iserveri" }), {
    id: "10d2bffb-f8e2-4c78-828f-f79ae4a0b1bb",
    userId: "12270079",
    userLogin: "iserveri",
    userName: "ISERVERI",
    gameName: "МИР ТАНКОВ",
    title: "Mausekonig",
    startedAt: "2026-08-04T16:38:25.000Z",
    previewImageUrl: "https://images.live.vkvideo.ru/preview",
    viewerCount: 11836,
    source: "public",
  });
});

test("a channel with chat switched off yields no chat channel to subscribe to", async () => {
  assert.equal(await makeService({ hasChat: false }).getChatChannel("iserveri"), null);
  assert.equal(
    await makeService({}).getChatChannel("iserveri"),
    "channel-chat:12270079",
  );
});

test("reads the numeric channel id out of a pubsub channel name", () => {
  assert.equal(parseBlogId("channel-chat:12270079"), "12270079");
  assert.equal(parseBlogId("stream-slot:12270079@0"), "12270079");
  assert.equal(parseBlogId(null), null);
});

test("streamlink is pointed at VK Play Live, and audio-only takes its smallest video", () => {
  const platforms = new PlatformsService(
    new TwitchService(),
    new KickService(new KickPublicClient()),
    makeService({}),
  );

  assert.equal(platforms.channelUrl("vkplay", "iserveri"), "https://live.vkvideo.ru/iserveri");
  assert.equal(platforms.resolvePlatform("vkplay"), "vkplay");
  // VK Play has no audio_only rendition, so the audio path takes the smallest
  // video stream and the remux throws the picture away — same as Kick.
  assert.equal(
    platforms.captureQuality("vkplay", { audioOnly: true, preferredQuality: "best" }),
    "worst",
  );
  assert.equal(
    platforms.captureQuality("vkplay", { audioOnly: false, preferredQuality: "720p60" }),
    "720p60",
  );
});
