import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { SettingsModule } from "../settings/settings.module";
import { TelegramModule } from "../telegram/telegram.module";
import { PlatformsModule } from "../platforms/platforms.module";
import { StreamEventsModule } from "../stream-events/stream-events.module";
import { RecordingController } from "./recording.controller";
import { RecordingService } from "./recording.service";
import { ThumbnailService } from "./thumbnail.service";

@Module({
  imports: [
    PlatformsModule,
    SettingsModule,
    RealtimeModule,
    ChatModule,
    TelegramModule,
    StreamEventsModule,
  ],
  controllers: [RecordingController],
  providers: [RecordingService, ThumbnailService],
  exports: [RecordingService, ThumbnailService],
})
export class RecordingModule {}
