import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { TelegramUploadPart } from "@prisma/client";
import { Readable } from "node:stream";
import { Api } from "telegram";
import { returnBigInt } from "telegram/Helpers";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramClientService } from "./telegram-client.service";

// MTProto upload.getFile requires the offset to be 4 KB aligned and the chunk
// size to divide 1 MB; 512 KB satisfies both and is the maximum allowed.
const CHUNK_SIZE = 512 * 1024;

// Resolved messages carry a file_reference that Telegram expires after a
// while; re-fetch the message when the cached one gets stale or rejected.
const MEDIA_CACHE_TTL_MS = 5 * 60_000;

@Injectable()
export class TelegramStreamService {
  private readonly logger = new Logger(TelegramStreamService.name);
  private readonly mediaCache = new Map<
    string,
    { media: Api.TypeMessageMedia; fetchedAt: number }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramClientService: TelegramClientService,
  ) {}

  /**
   * Stream one uploaded part straight from Telegram into an HTTP response,
   * honouring Range requests so the web player can seek.
   */
  async streamToResponse(
    sessionId: string,
    partIndex: number,
    req: any,
    res: any,
    downloadName: string | null = null,
  ) {
    const part = await this.prisma.telegramUploadPart.findUnique({
      where: {
        streamSessionId_partIndex: { streamSessionId: sessionId, partIndex },
      },
    });

    if (!part) {
      throw new NotFoundException(
        `Telegram copy of archive ${sessionId} (part ${partIndex}) was not found.`,
      );
    }

    const totalSize = Number(part.fileSizeBytes ?? 0);

    if (!Number.isFinite(totalSize) || totalSize <= 0) {
      throw new NotFoundException(
        `Telegram part ${partIndex} of archive ${sessionId} has no recorded size.`,
      );
    }

    // Resolve everything that can fail BEFORE writing the response head.
    const client = await this.telegramClientService.getClient();
    let media = await this.resolveMedia(part);

    const range = req.headers.range as string | undefined;
    let start = 0;
    let end = totalSize - 1;
    let statusCode = 200;

    if (range) {
      const [rawStart, rawEnd] = range.replace("bytes=", "").split("-");
      start = Math.max(0, Number(rawStart) || 0);
      end = rawEnd ? Math.min(Number(rawEnd), totalSize - 1) : totalSize - 1;
      statusCode = 206;
    }

    if (start > end) {
      res.writeHead(416, { "Content-Range": `bytes */${totalSize}` });
      res.end();
      return;
    }

    if (downloadName) {
      res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    }

    res.writeHead(statusCode, {
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
      ...(statusCode === 206
        ? { "Content-Range": `bytes ${start}-${end}/${totalSize}` }
        : {}),
    });

    const resolveMedia = (force: boolean) => this.resolveMedia(part, force);

    async function* byteRange() {
      let position = start;
      let refreshedReference = false;

      while (position <= end) {
        const alignedStart = Math.floor(position / CHUNK_SIZE) * CHUNK_SIZE;
        let skip = position - alignedStart;

        try {
          for await (const chunk of client.iterDownload({
            file: media as Api.TypeMessageMedia,
            offset: returnBigInt(alignedStart),
            requestSize: CHUNK_SIZE,
          })) {
            let buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

            if (skip > 0) {
              if (buffer.length <= skip) {
                skip -= buffer.length;
                continue;
              }
              buffer = buffer.subarray(skip);
              skip = 0;
            }

            const remaining = end - position + 1;
            if (buffer.length > remaining) {
              buffer = buffer.subarray(0, remaining);
            }

            yield buffer;
            position += buffer.length;

            if (position > end) {
              return;
            }
          }
          return;
        } catch (error) {
          // The cached file_reference expired mid-stream: refresh the message
          // once and resume from the current position.
          if (!refreshedReference && String(error).includes("FILE_REFERENCE")) {
            refreshedReference = true;
            media = await resolveMedia(true);
            continue;
          }
          throw error;
        }
      }
    }

    const readable = Readable.from(byteRange());

    res.once("close", () => readable.destroy());
    readable.once("error", (error) => {
      this.logger.warn(
        `Telegram stream for ${sessionId} part ${partIndex} failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      try {
        res.destroy();
      } catch {
        // The socket may already be gone.
      }
    });

    readable.pipe(res);
  }

  private async resolveMedia(part: TelegramUploadPart, forceRefresh = false) {
    const cached = this.mediaCache.get(part.id);

    if (!forceRefresh && cached && Date.now() - cached.fetchedAt < MEDIA_CACHE_TTL_MS) {
      return cached.media;
    }

    const client = await this.telegramClientService.getClient();
    const entity = await this.telegramClientService.resolveChat(part.chatId);
    const messages = await client.getMessages(entity, {
      ids: [Number(part.messageId)],
    });
    const media = messages?.[0]?.media;

    if (!media) {
      throw new NotFoundException(
        "The Telegram message with this video part no longer exists.",
      );
    }

    this.mediaCache.set(part.id, { media, fetchedAt: Date.now() });
    return media;
  }
}
