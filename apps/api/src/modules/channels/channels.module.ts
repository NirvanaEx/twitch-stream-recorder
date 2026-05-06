import { Module } from "@nestjs/common";
import { RecordingModule } from "../recording/recording.module";
import { TwitchModule } from "../twitch/twitch.module";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";

@Module({
  imports: [TwitchModule, RecordingModule],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
