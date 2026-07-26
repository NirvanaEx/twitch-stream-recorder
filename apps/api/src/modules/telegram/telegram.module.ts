import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { TelegramController } from "./telegram.controller";
import { TelegramClientService } from "./telegram-client.service";
import { TelegramService } from "./telegram.service";
import { TelegramStreamService } from "./telegram-stream.service";

@Module({
  imports: [RealtimeModule, ChatModule],
  controllers: [TelegramController],
  providers: [TelegramClientService, TelegramService, TelegramStreamService],
  exports: [TelegramClientService, TelegramService, TelegramStreamService],
})
export class TelegramModule {}
