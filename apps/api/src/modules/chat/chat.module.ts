import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { ChatService } from "./chat.service";
import { EmoteAssetsController } from "./emote-assets.controller";
import { EmoteMirrorService } from "./emote-mirror.service";
import { SevenTvService } from "./seventv.service";

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [EmoteAssetsController],
  providers: [ChatService, SevenTvService, EmoteMirrorService],
  exports: [ChatService, SevenTvService, EmoteMirrorService],
})
export class ChatModule {}
