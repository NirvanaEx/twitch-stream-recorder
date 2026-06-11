import { Module } from "@nestjs/common";
import { RecordingModule } from "../recording/recording.module";
import { TelegramModule } from "../telegram/telegram.module";
import { PublicStreamsController } from "./public.controller";

@Module({
  imports: [RecordingModule, TelegramModule],
  controllers: [PublicStreamsController],
})
export class PublicModule {}
