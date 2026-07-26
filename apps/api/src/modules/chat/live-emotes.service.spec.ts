import assert from "node:assert/strict";
import test from "node:test";
import { LiveEmotesService } from "./live-emotes.service";
import type { EmoteSnapshotPayload } from "./seventv.service";

type Channel = { platform: string; twitchUserId: string | null } | null;

function build(options: { channel?: Channel; support7tv?: boolean } = {}) {
  const channel =
    options.channel === undefined ? { platform: "kick", twitchUserId: "365351" } : options.channel;

  const calls: Array<[string, string]> = [];

  const prisma = {
    appSettings: {
      findUnique: async () => ({ support7tv: options.support7tv ?? true }),
    },
    streamSession: {
      findUnique: async () => (channel ? { channel } : null),
    },
  };

  const sevenTv = {
    fetchSnapshot: async (platform: string, userId: string) => {
      calls.push([platform, userId]);
      return {
        provider: "7tv",
        platform,
        fetchedAt: "2026-07-27T00:00:00.000Z",
        emotes: [
          {
            id: "01LIVELIVELIVELIVELIVELIVE",
            name: "catJAM",
            url: "https://cdn.7tv.app/emote/01LIVELIVELIVELIVELIVELIVE/2x.webp",
            animated: true,
          },
        ],
      } as EmoteSnapshotPayload;
    },
  };

  const mirror = {
    mirror: async (emotes: EmoteSnapshotPayload["emotes"]) => ({
      entries: emotes.map((emote) => ({
        ...emote,
        localUrl: `public/emotes/${emote.id}.webp`,
      })),
      downloaded: 0,
    }),
  };

  const service = new LiveEmotesService(prisma as never, sevenTv as never, mirror as never);

  return { service, calls };
}

test("the live set is fetched once per channel, not once per viewer", async () => {
  const { service, calls } = build();

  const first = await service.forSession("session-a");
  // A second session of the same channel must reuse the cached answer: this
  // endpoint is anonymous, and a cold mirror means hundreds of downloads.
  const second = await service.forSession("session-b");

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], ["kick", "365351"]);
  assert.equal(first?.emotes[0].name, "catJAM");
  assert.equal(second?.emotes[0].name, "catJAM");

  // Mirrored images are preferred here too, so this mode also survives 7TV.
  assert.equal(first?.emotes[0].localUrl, "public/emotes/01LIVELIVELIVELIVELIVELIVE.webp");
});

test("concurrent requests for one channel collapse onto a single fetch", async () => {
  const { service, calls } = build();

  const results = await Promise.all([
    service.forSession("session-a"),
    service.forSession("session-b"),
    service.forSession("session-c"),
  ]);

  assert.equal(calls.length, 1);
  for (const result of results) {
    assert.equal(result?.emotes.length, 1);
  }
});

test("a Twitch channel is looked up on the twitch platform", async () => {
  const { service, calls } = build({ channel: { platform: "twitch", twitchUserId: "71092938" } });

  await service.forSession("session-a");
  assert.deepEqual(calls[0], ["twitch", "71092938"]);
});

test("nothing is fetched when 7TV support is switched off", async () => {
  const { service, calls } = build({ support7tv: false });

  assert.equal(await service.forSession("session-a"), null);
  assert.equal(calls.length, 0);
});

test("a channel without a platform user id is a miss, not a bad request to 7TV", async () => {
  const { service, calls } = build({ channel: { platform: "kick", twitchUserId: null } });

  assert.equal(await service.forSession("session-a"), null);
  assert.equal(calls.length, 0);

  const missing = build({ channel: null });
  assert.equal(await missing.service.forSession("nope"), null);
  assert.equal(missing.calls.length, 0);
});
