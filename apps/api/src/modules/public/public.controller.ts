import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { createReadStream, existsSync, statSync, type Stats } from "node:fs";
import { resolve } from "node:path";
import { Prisma, StreamSession, TelegramUploadPart } from "@prisma/client";
import { AllowAnonymous } from "../auth/auth.decorators";
import { PrismaService } from "../prisma/prisma.service";
import { resolveSessionPlaybackState } from "../recording/playback.utils";
import { RecordingService } from "../recording/recording.service";
import { TelegramStreamService } from "../telegram/telegram-stream.service";

// A session whose local file is gone is still watchable when its parts were
// uploaded to Telegram; the public video endpoint streams them back. An
// audio-only session has no parts — its Telegram copy is one audio message.
function isTelegramPlayable(
  session: StreamSession & { telegramParts: TelegramUploadPart[] },
  locallyReady: boolean,
) {
  if (locallyReady || session.telegramStatus !== "uploaded") {
    return false;
  }

  return (
    session.telegramParts.length > 0 ||
    (session.audioOnly && Boolean(session.telegramAudioMessageId))
  );
}

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

@AllowAnonymous()
@Controller("public/streams")
export class PublicStreamsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recordingService: RecordingService,
    private readonly telegramStreamService: TelegramStreamService,
  ) {}

  @Get()
  async list(
    @Query("search") rawSearch?: string,
    @Query("page") rawPage?: string,
    @Query("pageSize") rawPageSize?: string,
  ) {
    const search = (rawSearch ?? "").trim();
    const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.parseInt(rawPageSize ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
    );

    // Public listing: only ready archives. Mirrors the visibility of the
    // /admin/archives page (videoStatus == ready, playbackPath set), filtered
    // by title (case-insensitive substring).
    const where: Prisma.StreamSessionWhereInput = {
      videoStatus: "ready",
      playbackPath: { not: null },
      ...(search
        ? {
            title: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          }
        : {}),
    };

    const [total, sessions] = await this.prisma.$transaction([
      this.prisma.streamSession.count({ where }),
      this.prisma.streamSession.findMany({
        where,
        include: {
          channel: true,
          telegramParts: { orderBy: { partIndex: "asc" } },
        },
        orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const items = sessions
      .map((session) => {
        const playback = resolveSessionPlaybackState(session);
        if (!playback.videoReady && !isTelegramPlayable(session, playback.videoReady)) {
          return null;
        }

        return {
          id: session.id,
          title: session.title,
          channel: {
            login: session.channel.twitchLogin,
            displayName: session.channel.displayName ?? session.channel.twitchLogin,
            profileImageUrl: session.channel.profileImageUrl,
          },
          previewImageUrl: session.previewImageUrl,
          startedAt: session.startedAt?.toISOString() ?? null,
          endedAt: session.endedAt?.toISOString() ?? null,
          fileSizeBytes: playback.fileSizeBytes,
        };
      })
      .filter(Boolean);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  /**
   * Audio tracks the Tampermonkey userscript can overlay on Twitch VODs.
   * Declared before ":id" so the static segment wins the route match; CORS is
   * open because the script calls this from twitch.tv.
   */
  @Get("audio-tracks")
  @Header("Access-Control-Allow-Origin", "*")
  async listAudioTracks() {
    const sessions = await this.prisma.streamSession.findMany({
      where: {
        status: "completed",
        audioDeletedAt: null,
        OR: [{ audioPath: { not: null } }, { telegramAudioMessageId: { not: null } }],
      },
      include: {
        channel: true,
        telegramParts: { select: { durationSec: true } },
      },
      orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
      take: 60,
    });

    const items = sessions
      .filter(
        (session) =>
          (session.audioPath && existsSync(resolve(session.audioPath))) ||
          session.telegramAudioMessageId,
      )
      .map((session) => {
        // Parts carry the real recording duration; the startedAt/endedAt diff
        // overstates it when the recorder joined the stream late.
        const partsDuration = session.telegramParts.reduce(
          (acc, part) => acc + (part.durationSec ?? 0),
          0,
        );
        const timestampsDuration =
          session.startedAt && session.endedAt
            ? Math.max(
                0,
                Math.round(
                  (session.endedAt.getTime() - session.startedAt.getTime()) / 1000,
                ),
              )
            : null;

        return {
          id: session.id,
          title: session.title,
          channelLogin: session.channel.twitchLogin,
          channelDisplayName: session.channel.displayName ?? session.channel.twitchLogin,
          startedAt: session.startedAt?.toISOString() ?? null,
          durationSec: partsDuration > 0 ? partsDuration : timestampsDuration,
          audioUrl: `/api/public/streams/${session.id}/audio`,
        };
      });

    return { items };
  }

  @Get(":id/audio")
  async streamAudio(@Param("id") id: string, @Req() req: any, @Res() res: any) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (
      !session ||
      session.audioDeletedAt ||
      (!session.audioPath && !session.telegramAudioMessageId)
    ) {
      throw new NotFoundException("Аудиодорожка не найдена.");
    }

    // The userscript loads this URL into an <audio> element on twitch.tv.
    res.setHeader("Access-Control-Allow-Origin", "*");

    let downloadName: string | null = null;

    if (req.query?.download === "1") {
      const safeName = (session.channel.twitchLogin || "stream").replace(/[^a-z0-9_-]/gi, "_");
      downloadName = `${safeName}-${id}.m4a`;
    }

    const absolutePath = session.audioPath ? resolve(session.audioPath) : null;

    if (!absolutePath || !existsSync(absolutePath)) {
      // The local file is gone — stream the Telegram copy instead.
      await this.telegramStreamService.streamAudioToResponse(id, req, res, downloadName);
      return;
    }

    const stat = statSync(absolutePath);
    const range = req.headers.range as string | undefined;

    if (downloadName) {
      res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    }

    if (range) {
      const [rawStart, rawEnd] = range.replace("bytes=", "").split("-");
      const start = Math.max(0, Number(rawStart) || 0);
      const end = rawEnd ? Math.min(Number(rawEnd), stat.size - 1) : stat.size - 1;

      if (start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        res.end();
        return;
      }

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "audio/mp4",
      });
      createReadStream(absolutePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "audio/mp4",
      "Accept-Ranges": "bytes",
    });
    createReadStream(absolutePath).pipe(res);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      include: {
        channel: true,
        telegramParts: { orderBy: { partIndex: "asc" } },
      },
    });

    if (!session || session.videoStatus !== "ready" || !session.playbackPath) {
      throw new NotFoundException("Запись не найдена.");
    }

    const playback = resolveSessionPlaybackState(session);
    const telegramPlayable = isTelegramPlayable(session, playback.videoReady);

    if (!playback.videoReady && !telegramPlayable) {
      throw new NotFoundException("Видео ещё не готово.");
    }

    return {
      item: {
        id: session.id,
        title: session.title,
        categoryName: session.categoryName,
        channel: {
          login: session.channel.twitchLogin,
          displayName: session.channel.displayName ?? session.channel.twitchLogin,
          profileImageUrl: session.channel.profileImageUrl,
        },
        previewImageUrl: session.previewImageUrl,
        startedAt: session.startedAt?.toISOString() ?? null,
        endedAt: session.endedAt?.toISOString() ?? null,
        fileSizeBytes: playback.fileSizeBytes,
        // Public clients hit the public video endpoint — never the admin one.
        videoUrl: `/api/public/streams/${session.id}/video`,
        videoSource: playback.videoReady ? "local" : "telegram",
        audioOnly: session.audioOnly,
        telegramParts: telegramPlayable
          ? session.telegramParts.map((part) => ({
              partIndex: part.partIndex,
              partCount: part.partCount,
              streamUrl: `/api/public/streams/${session.id}/video?part=${part.partIndex}`,
              startOffsetSec: part.startOffsetSec,
              durationSec: part.durationSec,
            }))
          : [],
      },
    };
  }

  @Get(":id/chat")
  async getChat(@Param("id") id: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      select: { id: true, videoStatus: true, playbackPath: true },
    });

    if (!session || session.videoStatus !== "ready" || !session.playbackPath) {
      throw new NotFoundException("Запись не найдена.");
    }

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
        relativeTimeSec: message.relativeTimeSec,
        messageTimestamp: message.messageTimestamp.toISOString(),
        isDeleted: message.isDeleted,
      })),
      emotes: snapshot ? JSON.parse(snapshot.payloadJson) : null,
    };
  }

  @Get(":id/video")
  async streamVideo(@Param("id") id: string, @Req() req: any, @Res() res: any) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      select: { id: true, videoStatus: true, playbackPath: true, audioOnly: true },
    });

    if (!session || session.videoStatus !== "ready" || !session.playbackPath) {
      throw new NotFoundException("Запись не найдена.");
    }

    let local: { absolutePath: string; stat: Stats } | null = null;

    try {
      local = await this.recordingService.getPlayableFile(id);
    } catch {
      // The local file is gone — fall back to the Telegram copy below.
      local = null;
    }

    if (!local) {
      const full = await this.prisma.streamSession.findUnique({
        where: { id },
        include: { channel: true },
      });
      const safeName = (full?.channel.twitchLogin || "stream").replace(/[^a-z0-9_-]/gi, "_");

      // Audio-only sessions have no video parts in Telegram — their copy is
      // a single audio message served through the same endpoint.
      if (session.audioOnly) {
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

    if (req.query?.download === "1") {
      const full = await this.prisma.streamSession.findUnique({
        where: { id },
        include: { channel: true },
      });
      const safeName = (full?.channel.twitchLogin || "stream").replace(/[^a-z0-9_-]/gi, "_");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeName}-${id}.${isAudioFile ? "m4a" : "mp4"}"`,
      );
    }

    if (range) {
      const [rawStart, rawEnd] = range.replace("bytes=", "").split("-");
      const start = Number(rawStart);
      const end = rawEnd ? Number(rawEnd) : stat.size - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });
      createReadStream(absolutePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    });
    createReadStream(absolutePath).pipe(res);
  }
}
