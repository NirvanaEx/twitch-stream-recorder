import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { computeSessionChatOffsetSec } from "../recording/playback.utils";
import { resolveCaptureAnchorMs } from "./chat-roles.utils";
import { EmoteMirrorService } from "./emote-mirror.service";
import { buildReplayMessage } from "./replay-message.utils";
import type { EmoteSnapshotPayload } from "./seventv.service";
import { parseStoredJson } from "./stored-chat.utils";
import { parseMediaTimeline } from "../recording/media-timeline";
import { GifMirrorService } from "./gif-mirror.service";
import { gifSourceUrls } from "./chat-gifs.utils";
import { parseStoredJsonString } from "./stored-chat.utils";

/**
 * The `.tsr.json` archive bundle: a session's chat with every emote it uses
 * inlined as a data URI, so the replay works offline, forever, and after 7TV
 * has dropped the emote.
 *
 * Shared on purpose — the same bytes are served by the "download bundle"
 * endpoint, posted to Telegram next to the video, and written into the
 * session's folder on the archive tier. Three producers of one format would
 * drift apart within a release.
 */
@Injectable()
export class ArchiveBundleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emoteMirrorService: EmoteMirrorService,
    private readonly gifMirror: GifMirrorService,
  ) {}

  /** Throws NotFoundException when the session does not exist. */
  async build(sessionId: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id: sessionId },
      include: { channel: true },
    });

    if (!session) {
      throw new NotFoundException("Archive not found");
    }

    const [messages, snapshot] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { streamSessionId: sessionId },
        orderBy: [{ relativeTimeSec: "asc" }, { id: "asc" }],
      }),
      this.prisma.emoteSnapshot.findUnique({
        where: { streamSessionId: sessionId },
      }),
    ]);

    const anchorMs = resolveCaptureAnchorMs(messages);
    const gifs = await this.gifMirror.buildBundleAssets(messages.map((message) => parseStoredJsonString(message.gifsJson)));

    return {
      version: 1,
      kind: "tsr-archive-bundle",
      mediaTimeline: parseMediaTimeline(session.mediaTimelineJson),
      meta: {
        id: session.id,
        title: session.title,
        categoryName: session.categoryName,
        channelLogin: session.channel.twitchLogin,
        channelDisplayName: session.channel.displayName ?? session.channel.twitchLogin,
        startedAt: session.startedAt?.toISOString() ?? null,
        endedAt: session.endedAt?.toISOString() ?? null,
        chatOffsetSec: computeSessionChatOffsetSec(session),
      },
      // The bundle keeps the wall-clock times: it is meant to be readable
      // years from now without this app, and the size saved is not worth a
      // chat log with no timestamps in it.
      messages: messages.map((message) => {
        const replay = buildReplayMessage(message, anchorMs, { includeTimestamps: true });
        const urls = gifSourceUrls(replay.gifs);
        if (urls.length) replay.gifUrls = Object.fromEntries(urls.filter((url) => gifs.sources[url]).map((url) => [url, gifs.sources[url]]));
        return replay;
      }),
      // One binary copy per distinct image, even when chat repeats it or
      // Twitch supplies different attribution query strings for the same GIF.
      ...(Object.keys(gifs.assets).length ? { gifAssets: gifs.assets } : {}),
      ...(gifs.missing.length ? { missingGifAssets: gifs.missing } : {}),
      // Self-contained on purpose: the images of the emotes this chat actually
      // uses travel inside the file as data URIs, so the offline replay keeps
      // working with no network and after 7TV has dropped the emote.
      emotes: this.emoteMirrorService.buildBundleSnapshot(
        parseStoredJson(snapshot?.payloadJson) as EmoteSnapshotPayload | null,
        messages.map((message) => message.textRaw),
      ),
    };
  }

  /** Suggested file name for a built bundle, e.g. `skywhywalker-clx123.tsr.json`. */
  fileNameFor(channelLogin: string | null | undefined, sessionId: string) {
    const safeName = (channelLogin || "stream").replace(/[^a-z0-9_-]/gi, "_");
    return `${safeName}-${sessionId}.tsr.json`;
  }
}
