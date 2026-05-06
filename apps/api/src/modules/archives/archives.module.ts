import { Module } from "@nestjs/common";
import { RecordingModule } from "../recording/recording.module";
import { ArchivesController } from "./archives.controller";

@Module({
  imports: [RecordingModule],
  controllers: [ArchivesController],
})
export class ArchivesModule {}
