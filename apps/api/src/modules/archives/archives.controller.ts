import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { createReadStream, existsSync, statSync, type Stats } from "node:fs";
import { resolve } from "node:path";
import { RequirePermissions } from "../auth/auth.decorators";
import { parseStoredJson, parseStoredJsonString } from "../chat/stored-chat.utils";
import { PrismaService } from "../prisma/prisma.service";
import {
  buildMediaCacheHeaders,
  computeSessionChatOffsetSec,
  parseMediaRange,
} from "../recording/playback.utils";
import { RecordingService } from "../recording/recording.service";
import { ThumbnailService } from "../recording/thumbnail.service";
import { TelegramStreamService } from "../telegram/telegram-stream.service";

@RequirePermissions("view_archives")
@Controller("archives")
export class ArchivesController {
  constructor(
    private readonly recordingService: RecordingService,
    private readonly prisma: PrismaService,
    private readonly telegramStreamService: TelegramStreamService,
    private readonly thumbnailService: ThumbnailService,
  ) {
    this.listArchives = this.listArchives.bind(this);
    this.getArchive = this.getArchive.bind(this);
    this.streamArchiveVideo = this.streamArchiveVideo.bind(this);
    this.deleteArchive = this.deleteArchive.bind(this);
    this.deleteArchiveAudio = this.deleteArchiveAudio.bind(this);
    this.getArchiveChat = this.getArchiveChat.bind(this);
    this.getStreamStats = this.getStreamStats.bind(this);
    this.getThumbnail = this.getThumbnail.bind(this);
  }

  /**
   * Cover frame rendered on demand from the recording itself (local file or
   * the Telegram copy) — nothing is stored on disk. Twitch's own preview URL
   * stops resolving once the broadcast ends, hence a cover of our own.
   */
  @Get(":id/thumbnail")
  async getThumbnail(@Param("id") id: string, @Req() req: any, @Res() res: any) {
    const cover = await this.thumbnailService.getCover(id);

    if (req.headers["if-none-match"] === cover.etag) {
      res.writeHead(304, { ETag: cover.etag, "Cache-Control": "private, max-age=86400" });
      res.end();
      return;
    }

    res.writeHead(200, {
      "Content-Length": cover.buffer.length,
      "Content-Type": "image/jpeg",
      ETag: cover.etag,
      "Cache-Control": "private, max-age=86400",
    });
    res.end(cover.buffer);
  }

  @Get(":id/stream-stats")
  getStreamStats(@Param("id") id: string) {
    const stats = this.telegramStreamService.getLiveStats(id);

    if (stats) {
      return { active: true, ...stats };
    }

    // Nothing streaming this archive, but other archives may still be pulling
    // from the same MTProto connection — the panel shows that as context.
    const global = this.telegramStreamService.getGlobalStats();
    return { active: false, global };
  }

  @Get(":id/chat")
  async getArchiveChat(@Param("id") id: string) {
    const [messages, snapshot] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { streamSessionId: id },
        orderBy: { relativeTimeSec: "asc" },
        take: 50000,
      }),
      this.prisma.emoteSnapshot.findUnique({
        where: { streamSessionId: id },
      }),
    ]);

    return {
      messages: messages.map((message) => ({
        id: message.id,
        authorLogin: message.authorLogin,
        authorDisplayName: message.authorDisplayName,
        authorColor: message.authorColor,
        textRaw: message.textRaw,
        badges: parseStoredJsonString(message.badgesJson),
        emotes: parseStoredJsonString(message.emotesJson),
        relativeTimeSec: message.relativeTimeSec,
        messageTimestamp: message.messageTimestamp.toISOString(),
        isDeleted: message.isDeleted,
      })),
      emotes: parseStoredJson(snapshot?.payloadJson),
    };
  }

  @Get(":id/bundle")
  async getArchiveBundle(@Param("id") id: string, @Res() res: any) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (!session) {
      res.status(404).json({ message: "Archive not found" });
      return;
    }

    const [messages, snapshot] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { streamSessionId: id },
        orderBy: { relativeTimeSec: "asc" },
        take: 100000,
      }),
      this.prisma.emoteSnapshot.findUnique({
        where: { streamSessionId: id },
      }),
    ]);

    const bundle = {
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
      messages: messages.map((message) => ({
        id: message.id,
        authorLogin: message.authorLogin,
        authorDisplayName: message.authorDisplayName,
        authorColor: message.authorColor,
        textRaw: message.textRaw,
        badges: parseStoredJsonString(message.badgesJson),
        emotes: parseStoredJsonString(message.emotesJson),
        relativeTimeSec: message.relativeTimeSec,
        messageTimestamp: message.messageTimestamp.toISOString(),
        isDeleted: message.isDeleted,
      })),
      emotes: parseStoredJson(snapshot?.payloadJson),
    };

    const safeName = (session.channel.twitchLogin || "stream").replace(/[^a-z0-9_-]/gi, "_");
    const filename = `${safeName}-${session.id}.tsr.json`;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(JSON.stringify(bundle, null, 2));
  }

  @Get()
  listArchives(
    @Query("page") rawPage?: string,
    @Query("pageSize") rawPageSize?: string,
    @Query("kind") rawKind?: string,
  ) {
    const page = Number.parseInt(rawPage ?? "1", 10) || 1;
    const pageSize = Number.parseInt(rawPageSize ?? "15", 10) || 15;
    const kind = rawKind === "video" || rawKind === "audio" ? rawKind : "all";

    return this.recordingService.getArchiveList(page, pageSize, kind);
  }

  @Get(":id")
  getArchive(@Param("id") id: string) {
    return this.recordingService.getArchiveById(id);
  }

  @RequirePermissions("manage_archives")
  @Delete(":id/audio")
  deleteArchiveAudio(@Param("id") id: string) {
    return this.recordingService.deleteAudioTrack(id);
  }

  @RequirePermissions("manage_archives")
  @Delete(":id")
  deleteArchive(@Param("id") id: string) {
    return this.recordingService.deleteArchive(id);
  }

  @Get(":id/video")
  async streamArchiveVideo(@Param("id") id: string, @Req() req: any, @Res() res: any) {
    let local: { absolutePath: string; stat: Stats } | null = null;

    try {
      local = await this.recordingService.getPlayableFile(id);
    } catch {
      // The local file is gone — fall back to the Telegram copy below.
      local = null;
    }

    if (!local) {
      const session = await this.prisma.streamSession.findUnique({
        where: { id },
        include: { channel: true },
      });
      const safeName = (session?.channel.twitchLogin || "stream").replace(/[^a-z0-9_-]/gi, "_");

      // Audio-only sessions have no video parts in Telegram — their copy is a
      // single audio message served through the same endpoint.
      if (session?.audioOnly) {
        const downloadName = req.query?.download === "1" ? `${safeName}-${id}.m4a` : null;
        await this.telegramStreamService.streamAudioToResponse(id, req, res, downloadName);
        return;
      }

      const partIndex = Math.max(1, Number.parseInt(req.query?.part ?? "1", 10) || 1);
      const downloadName =
        req.query?.download === "1" ? `${safeName}-${id}-part${partIndex}.mp4` : null;

      await this.telegramStreamService.streamToResponse(id, partIndex, req, res, downloadName);
      return;
    }

    const { absolutePath, stat } = local;
    const range = req.headers.range as string | undefined;
    const isAudioFile = absolutePath.toLowerCase().endsWith(".m4a");
    const contentType = isAudioFile ? "audio/mp4" : "video/mp4";
    // Audio overlays get reloaded on every VOD visit — cache them for a day;
    // video ranges are bulkier, an hour matches the Telegram-backed path.
    const cache = buildMediaCacheHeaders(stat, isAudioFile ? 86_400 : 3_600);

    if (!range && req.headers["if-none-match"] === cache.etag) {
      res.writeHead(304, cache.headers);
      res.end();
      return;
    }

    if (req.query?.download === "1") {
      const session = await this.prisma.streamSession.findUnique({
        where: { id },
        include: { channel: true },
      });
      const safeName = (session?.channel.twitchLogin || "stream").replace(/[^a-z0-9_-]/gi, "_");
      const filename = `${safeName}-${id}.${isAudioFile ? "m4a" : "mp4"}`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    }

    if (range) {
      const parsedRange = parseMediaRange(range, stat.size);
      if (!parsedRange) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        res.end();
        return;
      }
      const { start, end } = parsedRange;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
        ...cache.headers,
      });

      createReadStream(absolutePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      ...cache.headers,
    });

    createReadStream(absolutePath).pipe(res);
  }
}
