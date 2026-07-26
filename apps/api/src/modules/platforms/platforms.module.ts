import { Module } from "@nestjs/common";
import { KickModule } from "../kick/kick.module";
import { TwitchModule } from "../twitch/twitch.module";
import { PlatformsService } from "./platforms.service";

@Module({
  imports: [TwitchModule, KickModule],
  providers: [PlatformsService],
  exports: [PlatformsService, TwitchModule, KickModule],
})
export class PlatformsModule {}
