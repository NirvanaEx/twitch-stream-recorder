import { Module } from "@nestjs/common";
import { RecordingModule } from "../recording/recording.module";
import { PlatformsModule } from "../platforms/platforms.module";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";

@Module({
  imports: [PlatformsModule, RecordingModule],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
