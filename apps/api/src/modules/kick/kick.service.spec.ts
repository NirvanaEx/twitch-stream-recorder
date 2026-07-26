import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { KickPublicClient } from "./kick-public.client";
import { KickService } from "./kick.service";
import { PlatformsService } from "../platforms/platforms.service";
import { TwitchService } from "../twitch/twitch.service";

// Every test here exercises the credentialled path; the public fallback has a
// stub so an accidental call is obvious instead of spawning Python.
function makeService(publicChannel: unknown = null) {
  const publicClient = {
    getChannel: async () => publicChannel,
  } as unknown as KickPublicClient;
  return new KickService(publicClient);
}

const originalFetch = globalThis.fetch;
const originalEnv = { id: process.env.KICK_CLIENT_ID, secret: process.env.KICK_CLIENT_SECRET };

type Call = { url: string; init?: RequestInit };

function stubFetch(handler: (url: string, init?: RequestInit) => unknown) {
  const calls: Call[] = [];
  globalThis.fetch = (async (input: any, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    const body = handler(url, init);
    return {
      ok: true,
      status: 200,
      json: async () => body,
      text: async () => JSON.stringify(body),
    } as Response;
  }) as typeof fetch;
  return calls;
}

beforeEach(() => {
  process.env.KICK_CLIENT_ID = "test-id";
  process.env.KICK_CLIENT_SECRET = "test-secret";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.KICK_CLIENT_ID = originalEnv.id;
  process.env.KICK_CLIENT_SECRET = originalEnv.secret;
});

test("accepts kick URLs, @slugs and bare slugs, including hyphens", () => {
  const service = makeService();

  assert.equal(service.normalizeChannelInput("https://kick.com/xQc"), "xqc");
  assert.equal(service.normalizeChannelInput("https://www.kick.com/xqc?foo=1"), "xqc");
  assert.equal(service.normalizeChannelInput("@some-streamer"), "some-streamer");
  // Hyphens are legal on Kick but not on Twitch — the two normalisers differ.
  assert.equal(service.normalizeChannelInput("some-streamer"), "some-streamer");
  assert.throws(() => service.normalizeChannelInput("ab"), /Invalid Kick channel/);
  assert.throws(() => service.normalizeChannelInput("bad slug!"), /Invalid Kick channel/);
});

test("works without app credentials by falling back to the public client", async () => {
  delete process.env.KICK_CLIENT_ID;
  delete process.env.KICK_CLIENT_SECRET;

  // Any HTTP call would mean the credentialled path was taken by mistake.
  stubFetch(() => {
    throw new Error("the official API must not be called without credentials");
  });

  const service = makeService({
    id: 668,
    userId: 676,
    slug: "xqc",
    chatroomId: 668,
    displayName: "xQc",
    avatar: "https://files.kick.com/avatar.webp",
    isLive: true,
    livestreamId: 119125610,
    title: "Live now",
    category: "Just Chatting",
    startedAt: "2026-07-25T21:28:33Z",
    thumbnail: "https://kick.com/thumb.jpg",
  });

  assert.equal(service.isApiConfigured(), false);
  assert.deepEqual(service.getConfigurationState().missing, [
    "KICK_CLIENT_ID",
    "KICK_CLIENT_SECRET",
  ]);

  const resolved = await service.resolveChannel("https://kick.com/xqc");
  assert.equal(resolved.login, "xqc");
  assert.equal(resolved.displayName, "xQc");
  assert.equal(resolved.profileImageUrl, "https://files.kick.com/avatar.webp");
  assert.equal(resolved.source, "public");

  const live = await service.getLiveStream({ login: "xqc" });
  assert.ok(live);
  // The public payload carries a real broadcast id, unlike the official one.
  assert.equal(live!.id, "119125610");
  assert.equal(live!.gameName, "Just Chatting");

  // Chat capture needs this and only the public client can supply it.
  assert.equal(await service.getChatroomId("xqc"), 668);
});

test("a missing channel is reported as such, not as a crash", async () => {
  delete process.env.KICK_CLIENT_ID;
  delete process.env.KICK_CLIENT_SECRET;

  await assert.rejects(() => makeService(null).resolveChannel("nobody-here"), /not found/);
});

test("maps a live channel payload onto the shared snapshot shape", async () => {
  const calls = stubFetch((url) => {
    if (url.includes("id.kick.com")) {
      return { access_token: "token-1", expires_in: 3600 };
    }
    return {
      data: [
        {
          broadcaster_user_id: 123,
          slug: "xqc",
          stream_title: "Just chatting today",
          category: { id: 15, name: "Just Chatting" },
          stream: {
            is_live: true,
            start_time: "2026-07-26T09:00:00Z",
            thumbnail: "https://kick.com/thumb.jpg",
            viewer_count: 4200,
          },
        },
      ],
    };
  });

  const snapshot = await makeService().getLiveStream({ login: "xqc" });

  assert.ok(snapshot);
  assert.equal(snapshot!.userId, "123");
  assert.equal(snapshot!.userLogin, "xqc");
  assert.equal(snapshot!.title, "Just chatting today");
  assert.equal(snapshot!.gameName, "Just Chatting");
  assert.equal(snapshot!.startedAt, "2026-07-26T09:00:00Z");
  assert.equal(snapshot!.previewImageUrl, "https://kick.com/thumb.jpg");
  // Kick has no broadcast id, so one is derived — the recorder uses it to avoid
  // starting a second recording of the same stream.
  assert.equal(snapshot!.id, "123:2026-07-26T09:00:00Z");

  const token = calls.find((call) => call.url.includes("id.kick.com"));
  assert.ok(token, "an app token must be requested");
  assert.match(String(token!.init?.body), /grant_type=client_credentials/);
  assert.ok(
    calls.some((call) => call.url === "https://api.kick.com/public/v1/channels?slug=xqc"),
    "the official channels endpoint must be used, not kick.com/api/v2",
  );
});

test("an offline channel reports null, not an empty snapshot", async () => {
  stubFetch((url) =>
    url.includes("id.kick.com")
      ? { access_token: "token-1", expires_in: 3600 }
      : { data: [{ broadcaster_user_id: 1, slug: "xqc", stream: { is_live: false } }] },
  );

  assert.equal(await makeService().getLiveStream({ login: "xqc" }), null);
});

test("the app token is fetched once and reused across polls", async () => {
  const calls = stubFetch((url) =>
    url.includes("id.kick.com")
      ? { access_token: "token-1", expires_in: 3600 }
      : { data: [{ broadcaster_user_id: 1, slug: "xqc", stream: { is_live: false } }] },
  );

  const service = makeService();
  await service.getLiveStream({ login: "xqc" });
  await service.getLiveStream({ login: "xqc" });
  await service.getLiveStream({ login: "xqc" });

  assert.equal(calls.filter((call) => call.url.includes("id.kick.com")).length, 1);
});

test("capture quality differs per platform because Kick has no audio_only variant", () => {
  const platforms = new PlatformsService(new TwitchService(), makeService());

  // Twitch publishes a real audio-only rendition: no video is downloaded.
  assert.equal(
    platforms.captureQuality("twitch", { audioOnly: true, preferredQuality: "best" }),
    "audio_only",
  );
  // Kick (Amazon IVS) offers 160p…1080p60 only, so the smallest video stream is
  // captured and the remux strips the picture with -vn.
  assert.equal(
    platforms.captureQuality("kick", { audioOnly: true, preferredQuality: "best" }),
    "worst",
  );

  assert.equal(
    platforms.captureQuality("kick", { audioOnly: false, preferredQuality: "720p60" }),
    "720p60",
  );
  assert.equal(
    platforms.captureQuality("twitch", { audioOnly: false, preferredQuality: null }),
    "best",
  );
});

test("streamlink is pointed at the right site, and unknown platforms fall back to Twitch", () => {
  const platforms = new PlatformsService(new TwitchService(), makeService());

  assert.equal(platforms.channelUrl("kick", "xqc"), "https://kick.com/xqc");
  assert.equal(platforms.channelUrl("twitch", "xqc"), "https://www.twitch.tv/xqc");
  // Rows written before the column existed carry null.
  assert.equal(platforms.resolvePlatform(null), "twitch");
  assert.equal(platforms.channelUrl(null, "xqc"), "https://www.twitch.tv/xqc");
  assert.throws(() => platforms.assertSupported("youtube"), /Unsupported platform/);
});
