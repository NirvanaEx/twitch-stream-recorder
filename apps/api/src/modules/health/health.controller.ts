import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "../auth/auth.decorators";
import { TwitchService } from "../twitch/twitch.service";

@AllowAnonymous()
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
