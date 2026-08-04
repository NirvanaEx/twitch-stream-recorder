import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { VkPlayChatService } from "./vkplay-chat.service";
import { VkPlayPublicClient } from "./vkplay-public.client";
import { VkPlayService } from "./vkplay.service";

@Module({
  imports: [PrismaModule, RealtimeModule],
  providers: [VkPlayPublicClient, VkPlayService, VkPlayChatService],
  exports: [VkPlayService, VkPlayPublicClient, VkPlayChatService],
})
export class VkPlayModule {}
