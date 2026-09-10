import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import { createReadStream, statSync } from "node:fs";
import { AllowAnonymous } from "../auth/auth.decorators";
import { pipeFileToResponse } from "../recording/playback.utils";
import { GifMirrorService } from "./gif-mirror.service";

@AllowAnonymous()
@Controller("public/chat-gifs")
export class GifAssetsController {
  constructor(private readonly gifMirror: GifMirrorService) {}

  @Get(":key")
  serve(@Param("key") key: string, @Res() res: any) {
    const file = this.gifMirror.resolveFile(key);
    if (!file) {
      res.setHeader("Cache-Control", "no-store");
      throw new NotFoundException("GIF ещё не сохранена или недоступна.");
    }
    res.writeHead(200, {
      "Content-Length": statSync(file.path).size,
      "Content-Type": file.contentType,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    });
    pipeFileToResponse(createReadStream(file.path), res);
  }
}
