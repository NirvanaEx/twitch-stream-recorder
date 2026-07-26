import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { RecordingModule } from "../recording/recording.module";
import { TelegramModule } from "../telegram/telegram.module";
import { PublicStreamsController } from "./public.controller";

@Module({
  imports: [RecordingModule, TelegramModule, ChatModule],
  controllers: [PublicStreamsController],
})
export class PublicModule {}
