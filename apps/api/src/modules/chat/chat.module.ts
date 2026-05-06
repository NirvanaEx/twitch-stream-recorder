import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { ChatService } from "./chat.service";
import { SevenTvService } from "./seventv.service";

@Module({
  imports: [PrismaModule, RealtimeModule],
  providers: [ChatService, SevenTvService],
  exports: [ChatService, SevenTvService],
})
export class ChatModule {}
