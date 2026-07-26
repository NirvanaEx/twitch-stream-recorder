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
import {
  deletionOffsetSec,
  extractChatRoles,
  extractInlineEmotes,
  resolveCaptureAnchorMs,
} from "../chat/chat-roles.utils";
import { LiveEmotesService } from "../chat/live-emotes.service";
import { parseStoredJson, parseStoredJsonString } from "../chat/stored-chat.utils";
import { PrismaService } from "../prisma/prisma.service";
import {
  buildMediaCacheHeaders,
  computeSessionChatOffsetSec,
  parseMediaRange,
  resolveSessionPlaybackState,
} from "../recording/playback.utils";
import { RecordingService } from "../recording/recording.service";
import { ThumbnailService } from "../recording/thumbnail.service";
import { TelegramStreamService } from "../telegram/telegram-stream.service";
import {
  annotateBroadcastParts,
  matchSessionsToVod,
  type BroadcastPart,
} from "./vod-session-match";

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
    private readonly thumbnailService: ThumbnailService,
    private readonly liveEmotesService: LiveEmotesService,
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
          // Frame rendered from the recording itself on demand; Twitch's
          // preview 404s after the broadcast ends, so the list used to show
          // broken covers.
          thumbnailUrl: session.audioOnly
            ? null
            : `/api/public/streams/${session.id}/thumbnail`,
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

    const available = sessions.filter((session) => this.hasUsableAudio(session));
    const parts = annotateBroadcastParts(available, (session) => session.channelId);
    const items = available.map((session) => this.mapAudioTrack(session, parts.get(session.id)));

    return { items };
  }

  /**
   * Find the recorded audio track that matches an open Twitch VOD. The
   * userscript reads the VOD's channel login and broadcast date from Twitch
   * and asks here for the closest recording — so the right track is selected
   * automatically instead of by hand. CORS is open (called from twitch.tv).
   */
  @Get("audio-tracks/match")
  @Header("Access-Control-Allow-Origin", "*")
  async matchAudioTrack(
    @Query("channel") channel?: string,
    @Query("date") date?: string,
    @Query("length") length?: string,
  ) {
    const login = (channel ?? "").trim().toLowerCase();

    if (!login) {
      return { item: null, items: [] };
    }

    const sessions = await this.prisma.streamSession.findMany({
      where: {
        status: "completed",
        audioDeletedAt: null,
        channel: { twitchLogin: login },
        OR: [{ audioPath: { not: null } }, { telegramAudioMessageId: { not: null } }],
      },
      include: {
        channel: true,
        telegramParts: { select: { durationSec: true } },
      },
      // All restart fragments share the same Twitch startedAt. createdAt is
      // therefore required for deterministic ordering and newest fallback.
      orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    const available = sessions.filter((session) => this.hasUsableAudio(session));
    const { best, group } = matchSessionsToVod(available, date, length);

    if (!best) {
      return { item: null, items: [] };
    }

    const parts = annotateBroadcastParts(available, (session) => session.channelId);

    return {
      item: this.mapAudioTrack(best, parts.get(best.id)),
      items: group.map((session) => this.mapAudioTrack(session, parts.get(session.id))),
    };
  }

  /**
   * Same matching as "audio-tracks/match", but for the recorded chat — and
   * NOT gated on audio being available. That lets the userscript replay the
   * chat while the viewer listens to the VOD's original sound, and keeps the
   * chat working after the audio copy was deleted. CORS is open (twitch.tv).
   */
  @Get("chat-replay/match")
  @Header("Access-Control-Allow-Origin", "*")
  async matchChatReplay(
    @Query("channel") channel?: string,
    @Query("date") date?: string,
    @Query("length") length?: string,
  ) {
    const login = (channel ?? "").trim().toLowerCase();

    if (!login) {
      return { item: null, items: [] };
    }

    const sessions = await this.prisma.streamSession.findMany({
      where: {
        channel: { twitchLogin: login },
        // Set when a chat capture actually started for the session; sessions
        // recorded with chat disabled never match.
        chatAvailable: true,
      },
      include: {
        channel: true,
        telegramParts: { select: { durationSec: true } },
      },
      orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    const { best, group } = matchSessionsToVod(sessions, date, length);

    if (!best) {
      return { item: null, items: [] };
    }

    const parts = annotateBroadcastParts(sessions, (session) => session.channelId);

    return {
      item: this.mapChatSession(best, parts.get(best.id)),
      items: group.map((session) => this.mapChatSession(session, parts.get(session.id))),
    };
  }

  /**
   * Последние сессии канала с записанным чатом — для подгрузки истории в
   * юзерскрипте (поиск по прошлым стримам, история сообщений пользователя).
   * CORS открыт по той же причине, что и у match-эндпоинтов.
   */
  @Get("chat-replay/history")
  @Header("Access-Control-Allow-Origin", "*")
  async chatHistorySessions(
    @Query("channel") channel?: string,
    @Query("limit") limit?: string,
  ) {
    const login = (channel ?? "").trim().toLowerCase();
    if (!login) {
      return { items: [] };
    }

    const take = Math.min(30, Math.max(1, Number.parseInt(limit ?? "10", 10) || 10));

    const sessions = await this.prisma.streamSession.findMany({
      where: {
        channel: { twitchLogin: login },
        chatAvailable: true,
      },
      select: {
        id: true,
        title: true,
        startedAt: true,
        durationSec: true,
      },
      orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
      take,
    });

    return {
      items: sessions.map((session) => ({
        id: session.id,
        title: session.title,
        startedAt: session.startedAt?.toISOString() ?? null,
        durationSec: session.durationSec,
        chatUrl: `/api/public/streams/${session.id}/chat-replay`,
      })),
    };
  }

  /**
   * The anchor fields the userscript needs to place chat messages on the VOD
   * timeline — the same ones the audio tracks carry, minus the audio itself.
   */
  private mapChatSession(
    session: Parameters<PublicStreamsController["mapAudioTrack"]>[0],
    part?: BroadcastPart,
  ) {
    const track = this.mapAudioTrack(session, part);
    return {
      id: track.id,
      title: track.title,
      channelLogin: track.channelLogin,
      channelDisplayName: track.channelDisplayName,
      startedAt: track.startedAt,
      recordingStartedAt: track.recordingStartedAt,
      recordingEndedAt: track.recordingEndedAt,
      durationSec: track.durationSec,
      partIndex: track.partIndex,
      partCount: track.partCount,
      chatUrl: `/api/public/streams/${track.id}/chat-replay`,
    };
  }

  private hasUsableAudio(
    session: StreamSession & { audioPath: string | null; telegramAudioMessageId: string | null },
  ) {
    return Boolean(
      (session.audioPath && existsSync(resolve(session.audioPath))) ||
        session.telegramAudioMessageId,
    );
  }

  private mapAudioTrack(
    session: StreamSession & {
      channel: { twitchLogin: string; displayName: string | null };
      telegramParts: { durationSec: number | null }[];
      audioOnly: boolean;
    },
    part?: BroadcastPart,
  ) {
    // Prefer the probed media length; fall back to the parts sum, then to the
    // stream span (which overstates it when the recorder joined late).
    const partsDuration = session.telegramParts.reduce(
      (acc, part) => acc + (part.durationSec ?? 0),
      0,
    );
    const timestampsDuration =
      session.startedAt && session.endedAt
        ? Math.max(
            0,
            Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000),
          )
        : null;

    return {
      id: session.id,
      title: session.title,
      channelLogin: session.channel.twitchLogin,
      channelDisplayName: session.channel.displayName ?? session.channel.twitchLogin,
      startedAt: session.startedAt?.toISOString() ?? null,
      // When the capture actually started (the session row is created right
      // before streamlink spawns). Unlike startedAt (the Twitch go-live time)
      // this anchors the track on the VOD timeline even when the recorder
      // joined mid-stream.
      recordingStartedAt: session.createdAt.toISOString(),
      // When the capture process exited. recordingEndedAt - durationSec is a
      // MORE precise start anchor than recordingStartedAt: the row is created
      // before streamlink even connects, and --hls-live-restart rewinds the
      // live playlist, so the first recorded frame predates createdAt.
      recordingEndedAt: session.captureEndedAt?.toISOString() ?? null,
      durationSec:
        session.durationSec ?? (partsDuration > 0 ? partsDuration : timestampsDuration),
      audioOnly: session.audioOnly,
      // "Part N of M" when the broadcast was split by recorder restarts —
      // otherwise the fragments are identical in every list (same go-live
      // date, same title).
      partIndex: part?.partIndex ?? null,
      partCount: part?.partCount ?? null,
      audioUrl: `/api/public/streams/${session.id}/audio`,
    };
  }

  /** Cover frame of a recording, rendered on demand (see the admin twin). */
  @Get(":id/thumbnail")
  async streamThumbnail(@Param("id") id: string, @Req() req: any, @Res() res: any) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      select: { videoStatus: true },
    });

    if (session?.videoStatus !== "ready") {
      throw new NotFoundException("Обложка не найдена.");
    }

    const cover = await this.thumbnailService.getCover(id);

    if (req.headers["if-none-match"] === cover.etag) {
      res.writeHead(304, { ETag: cover.etag, "Cache-Control": "public, max-age=86400" });
      res.end();
      return;
    }

    res.writeHead(200, {
      "Content-Length": cover.buffer.length,
      "Content-Type": "image/jpeg",
      ETag: cover.etag,
      "Cache-Control": "public, max-age=86400",
    });
    res.end(cover.buffer);
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
    // A day, per how often the userscript reopens the same VOD's overlay.
    const cache = buildMediaCacheHeaders(stat, 86_400);

    if (!range && req.headers["if-none-match"] === cache.etag) {
      res.writeHead(304, cache.headers);
      res.end();
      return;
    }

    if (downloadName) {
      res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    }

    if (range) {
      const parsedRange = parseMediaRange(range, stat.size);
      if (!parsedRange) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        res.end();
        return;
      }
      const { start, end } = parsedRange;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "audio/mp4",
        ...cache.headers,
      });
      createReadStream(absolutePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "audio/mp4",
      "Accept-Ranges": "bytes",
      ...cache.headers,
    });
    createReadStream(absolutePath).pipe(res);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    const [session, settings] = await Promise.all([
      this.prisma.streamSession.findUnique({
        where: { id },
        include: {
          channel: true,
          telegramParts: { orderBy: { partIndex: "asc" } },
        },
      }),
      this.prisma.appSettings.findUnique({ where: { id: "default" } }),
    ]);

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
        thumbnailUrl: session.audioOnly
          ? null
          : `/api/public/streams/${session.id}/thumbnail`,
        startedAt: session.startedAt?.toISOString() ?? null,
        endedAt: session.endedAt?.toISOString() ?? null,
        // Real-world moment of the video's first frame (capture end minus the
        // probed length); positions on the timeline map to wall-clock time by
        // simple addition.
        mediaStartedAt:
          session.captureEndedAt && session.durationSec
            ? new Date(
                session.captureEndedAt.getTime() - session.durationSec * 1000,
              ).toISOString()
            : session.createdAt.toISOString(),
        durationSec: session.durationSec,
        fileSizeBytes: playback.fileSizeBytes,
        // Public clients hit the public video endpoint — never the admin one.
        videoUrl: `/api/public/streams/${session.id}/video`,
        videoSource: playback.videoReady ? "local" : "telegram",
        audioOnly: session.audioOnly,
        chatOffsetSec:
          computeSessionChatOffsetSec(session) + (settings?.defaultChatOffsetSec ?? 0),
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

    const anchorMs = resolveCaptureAnchorMs(messages);

    return {
      messages: messages.map((message) => ({
        id: message.id,
        authorLogin: message.authorLogin,
        authorDisplayName: message.authorDisplayName,
        authorColor: message.authorColor,
        textRaw: message.textRaw,
        badges: parseStoredJsonString(message.badgesJson),
        roles: extractChatRoles(message.badgesJson),
        emotes: parseStoredJsonString(message.emotesJson),
        inlineEmotes: extractInlineEmotes(message.emotesJson),
        relativeTimeSec: message.relativeTimeSec,
        messageTimestamp: message.messageTimestamp.toISOString(),
        isDeleted: message.isDeleted,
        deletedAtSec: deletionOffsetSec(message.deletedAt, anchorMs),
        banDurationSec: message.banDurationSec,
        isFirstMessage: message.isFirstMessage,
      })),
      emotes: parseStoredJson(snapshot?.payloadJson),
    };
  }

  /**
   * The channel's 7TV set as it is today — the "current emotes" mode of the
   * replay. The recorded snapshot stays the default; this is the opt-in.
   */
  @Get(":id/emotes/live")
  async getLiveEmotes(@Param("id") id: string) {
    // Existence only: unlike ":id/chat" this is not gated on the video being
    // ready — the emotes are just as useful while a recording is still running.
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!session) {
      throw new NotFoundException("Запись не найдена.");
    }

    return { emotes: await this.liveEmotesService.forSession(id) };
  }

  /**
   * Chat replay for the Tampermonkey userscript: the recorded chat (including
   * deleted messages) overlaid on the Twitch VOD's own chat column. Unlike
   * ":id/chat" it is NOT gated on video readiness — the viewer watches the
   * VOD on Twitch, so only the captured messages have to exist. CORS is open
   * because the script calls this from twitch.tv.
   */
  @Get(":id/chat-replay")
  @Header("Access-Control-Allow-Origin", "*")
  async getChatReplay(@Param("id") id: string) {
    const session = await this.prisma.streamSession.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!session) {
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

    const anchorMs = resolveCaptureAnchorMs(messages);

    return {
      messages: messages.map((message) => ({
        id: message.id,
        // Lets the userscript dedupe when one broadcast spans several
        // sessions whose capture windows overlap.
        providerMessageId: message.providerMessageId,
        authorLogin: message.authorLogin,
        authorDisplayName: message.authorDisplayName,
        authorColor: message.authorColor,
        textRaw: message.textRaw,
        // Raw Twitch IRC "emotes" tag ("id:start-end,.../..."), code-point
        // indexed — the userscript renders these from the Twitch CDN.
        emotes: message.emotesJson ? parseStoredJsonString(message.emotesJson) : null,
        badges: parseStoredJsonString(message.badgesJson),
        roles: extractChatRoles(message.badgesJson),
        relativeTimeSec: message.relativeTimeSec,
        messageTimestamp: message.messageTimestamp.toISOString(),
        isDeleted: message.isDeleted,
        deletedAtSec: deletionOffsetSec(message.deletedAt, anchorMs),
        banDurationSec: message.banDurationSec,
        isFirstMessage: message.isFirstMessage,
      })),
      emotes: parseStoredJson(snapshot?.payloadJson),
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
    // Audio overlays get reloaded on every VOD visit — cache them for a day;
    // video ranges are bulkier, an hour matches the Telegram-backed path.
    const cache = buildMediaCacheHeaders(stat, isAudioFile ? 86_400 : 3_600);

    if (!range && req.headers["if-none-match"] === cache.etag) {
      res.writeHead(304, cache.headers);
      res.end();
      return;
    }

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
