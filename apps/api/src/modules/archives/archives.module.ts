import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RecordingModule } from "../recording/recording.module";
import { TelegramModule } from "../telegram/telegram.module";
import { ArchivesController } from "./archives.controller";

@Module({
  imports: [RecordingModule, PrismaModule, TelegramModule, ChatModule],
  controllers: [ArchivesController],
})
export class ArchivesModule {}
