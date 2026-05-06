import { Controller, Delete, Get, Param, Req, Res } from "@nestjs/common";
import { createReadStream } from "node:fs";
import { PrismaService } from "../prisma/prisma.service";
import { RecordingService } from "../recording/recording.service";

@Controller("archives")
export class ArchivesController {
  constructor(
    private readonly recordingService: RecordingService,
    private readonly prisma: PrismaService,
  ) {
    this.listArchives = this.listArchives.bind(this);
    this.getArchive = this.getArchive.bind(this);
    this.streamArchiveVideo = this.streamArchiveVideo.bind(this);
    this.deleteArchive = this.deleteArchive.bind(this);
    this.getArchiveChat = this.getArchiveChat.bind(this);
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
        relativeTimeSec: message.relativeTimeSec,
        messageTimestamp: message.messageTimestamp.toISOString(),
        isDeleted: message.isDeleted,
      })),
      emotes: snapshot ? JSON.parse(snapshot.payloadJson) : null,
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
      },
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

    const safeName = (session.channel.twitchLogin || "stream").replace(/[^a-z0-9_-]/gi, "_");
    const filename = `${safeName}-${session.id}.tsr.json`;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(JSON.stringify(bundle, null, 2));
  }

  @Get()
  listArchives() {
    return this.recordingService.getArchiveList();
  }

  @Get(":id")
  getArchive(@Param("id") id: string) {
    return this.recordingService.getArchiveById(id);
  }

  @Delete(":id")
  deleteArchive(@Param("id") id: string) {
    return this.recordingService.deleteArchive(id);
  }

  @Get(":id/video")
  async streamArchiveVideo(@Param("id") id: string, @Req() req: any, @Res() res: any) {
    const { absolutePath, stat } = await this.recordingService.getPlayableFile(id);
    const range = req.headers.range as string | undefined;

    if (req.query?.download === "1") {
      const session = await this.prisma.streamSession.findUnique({
        where: { id },
        include: { channel: true },
      });
      const safeName = (session?.channel.twitchLogin || "stream").replace(/[^a-z0-9_-]/gi, "_");
      const filename = `${safeName}-${id}.mp4`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
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
        "Content-Type": "video/mp4",
      });

      createReadStream(absolutePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
    });

    createReadStream(absolutePath).pipe(res);
  }
}
