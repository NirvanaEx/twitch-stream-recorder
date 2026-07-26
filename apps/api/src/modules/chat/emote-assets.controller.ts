import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import { createReadStream, statSync } from "node:fs";
import { AllowAnonymous } from "../auth/auth.decorators";
import { EmoteMirrorService } from "./emote-mirror.service";

/**
 * Serves the mirrored 7TV images. Anonymous on purpose: these are chat emotes,
 * already public on 7TV's own CDN, and the public archive pages need them
 * without a token.
 */
@AllowAnonymous()
@Controller("public/emotes")
export class EmoteAssetsController {
  constructor(private readonly emoteMirrorService: EmoteMirrorService) {}

  @Get(":file")
  serveEmote(@Param("file") file: string, @Res() res: any) {
    const absolutePath = this.emoteMirrorService.resolveFile(file);

    if (!absolutePath) {
      throw new NotFoundException("Эмоут не найден.");
    }

    // The file name carries the 7TV emote id, and a 7TV emote never changes
    // its image — so this can be cached for as long as the browser likes.
    res.writeHead(200, {
      "Content-Length": statSync(absolutePath).size,
      "Content-Type": this.emoteMirrorService.contentTypeFor(file),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    });

    createReadStream(absolutePath).pipe(res);
  }
}
