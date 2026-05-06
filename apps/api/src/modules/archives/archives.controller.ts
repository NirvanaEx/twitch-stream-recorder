import { Controller, Delete, Get, Param, Req, Res } from "@nestjs/common";
import { createReadStream } from "node:fs";
import { RecordingService } from "../recording/recording.service";

@Controller("archives")
export class ArchivesController {
  constructor(private readonly recordingService: RecordingService) {
    this.listArchives = this.listArchives.bind(this);
    this.getArchive = this.getArchive.bind(this);
    this.streamArchiveVideo = this.streamArchiveVideo.bind(this);
    this.deleteArchive = this.deleteArchive.bind(this);
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
