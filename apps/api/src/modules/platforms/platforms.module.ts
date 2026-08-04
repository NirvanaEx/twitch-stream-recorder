import { Module } from "@nestjs/common";
import { KickModule } from "../kick/kick.module";
import { TwitchModule } from "../twitch/twitch.module";
import { VkPlayModule } from "../vkplay/vkplay.module";
import { PlatformsService } from "./platforms.service";

@Module({
  imports: [TwitchModule, KickModule, VkPlayModule],
  providers: [PlatformsService],
  exports: [PlatformsService, TwitchModule, KickModule, VkPlayModule],
})
export class PlatformsModule {}
