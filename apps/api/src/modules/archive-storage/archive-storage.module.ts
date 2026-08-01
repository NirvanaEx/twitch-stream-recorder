import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RecordingModule } from "../recording/recording.module";
import { ArchiveStorageController } from "./archive-storage.controller";
import { ArchiveStorageService } from "./archive-storage.service";

@Module({
  imports: [PrismaModule, ChatModule, RecordingModule],
  controllers: [ArchiveStorageController],
  providers: [ArchiveStorageService],
  exports: [ArchiveStorageService],
})
export class ArchiveStorageModule {}
