import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { computeSessionChatOffsetSec } from "../recording/playback.utils";
import { resolveCaptureAnchorMs } from "./chat-roles.utils";
import { EmoteMirrorService } from "./emote-mirror.service";
import { buildReplayMessage } from "./replay-message.utils";
import type { EmoteSnapshotPayload } from "./seventv.service";
import { parseStoredJson } from "./stored-chat.utils";

// The replay draws from chat, not from a transcript: a session with more
// messages than this is already far past what the player can render, and the
// bundle has to stay a file a browser can open.
const MAX_BUNDLE_MESSAGES = 100000;

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
        orderBy: { relativeTimeSec: "asc" },
        take: MAX_BUNDLE_MESSAGES,
      }),
      this.prisma.emoteSnapshot.findUnique({
        where: { streamSessionId: sessionId },
      }),
    ]);

    const anchorMs = resolveCaptureAnchorMs(messages);

    return {
      version: 1,
      kind: "tsr-archive-bundle",
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
      messages: messages.map((message) =>
        buildReplayMessage(message, anchorMs, { includeTimestamps: true }),
      ),
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
