import { Controller, Get } from "@nestjs/common";
import { TwitchService } from "../twitch/twitch.service";

@Controller("health")
export class HealthController {
  constructor(private readonly twitchService: TwitchService) {}

  @Get()
  getHealth() {
    return {
      ok: true,
      service: "api",
      timestamp: new Date().toISOString(),
      integrations: {
        twitch: this.twitchService.getConfigurationState(),
      },
    };
  }
}
