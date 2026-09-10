import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { ArchiveBundleService } from "./archive-bundle.service";
import { ChatService } from "./chat.service";
import { EmoteAssetsController } from "./emote-assets.controller";
import { EmoteMirrorService } from "./emote-mirror.service";
import { LiveEmotesService } from "./live-emotes.service";
import { SevenTvService } from "./seventv.service";
import { GifMirrorService } from "./gif-mirror.service";
import { GifAssetsController } from "./gif-assets.controller";

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [EmoteAssetsController, GifAssetsController],
  providers: [
    ChatService,
    SevenTvService,
    EmoteMirrorService,
    GifMirrorService,
    LiveEmotesService,
    ArchiveBundleService,
  ],
  exports: [
    ChatService,
    SevenTvService,
    EmoteMirrorService,
    LiveEmotesService,
    ArchiveBundleService,
  ],
})
export class ChatModule {}
