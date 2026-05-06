import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { SettingsModule } from "../settings/settings.module";
import { TwitchModule } from "../twitch/twitch.module";
import { RecordingController } from "./recording.controller";
import { RecordingService } from "./recording.service";

@Module({
  imports: [TwitchModule, SettingsModule, RealtimeModule, ChatModule],
  controllers: [RecordingController],
  providers: [RecordingService],
  exports: [RecordingService],
})
export class RecordingModule {}
