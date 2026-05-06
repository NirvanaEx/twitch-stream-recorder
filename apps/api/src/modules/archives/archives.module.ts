import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RecordingModule } from "../recording/recording.module";
import { ArchivesController } from "./archives.controller";

@Module({
  imports: [RecordingModule, PrismaModule],
  controllers: [ArchivesController],
})
export class ArchivesModule {}
