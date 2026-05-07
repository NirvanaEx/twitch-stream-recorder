import { Module } from "@nestjs/common";
import { RecordingModule } from "../recording/recording.module";
import { PublicStreamsController } from "./public.controller";

@Module({
  imports: [RecordingModule],
  controllers: [PublicStreamsController],
})
export class PublicModule {}
