import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { StreamEventsModule } from "../stream-events/stream-events.module";
import { RecordingModule } from "../recording/recording.module";
import { TelegramModule } from "../telegram/telegram.module";
import { PublicPreferencesController } from "./public-preferences.controller";
import { PublicStreamsController } from "./public.controller";

@Module({
  imports: [RecordingModule, TelegramModule, ChatModule, StreamEventsModule],
  controllers: [PublicStreamsController, PublicPreferencesController],
})
export class PublicModule {}
