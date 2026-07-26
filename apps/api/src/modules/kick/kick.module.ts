import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { StreamEventsModule } from "../stream-events/stream-events.module";
import { KickChatService } from "./kick-chat.service";
import { KickPublicClient } from "./kick-public.client";
import { KickService } from "./kick.service";

@Module({
  imports: [PrismaModule, RealtimeModule, StreamEventsModule],
  providers: [KickPublicClient, KickService, KickChatService],
  exports: [KickService, KickPublicClient, KickChatService],
})
export class KickModule {}
