import { Module } from "@nestjs/common";
import { TwitchModule } from "../twitch/twitch.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [TwitchModule],
  controllers: [HealthController],
})
export class HealthModule {}
