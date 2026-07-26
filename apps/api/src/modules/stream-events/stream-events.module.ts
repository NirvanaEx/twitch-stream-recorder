import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { StreamEventsService } from "./stream-events.service";
import { TwitchEventsService } from "./twitch-events.service";

@Module({
  imports: [PrismaModule],
  providers: [StreamEventsService, TwitchEventsService],
  exports: [StreamEventsService, TwitchEventsService],
})
export class StreamEventsModule {}
