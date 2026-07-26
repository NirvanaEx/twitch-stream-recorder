import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "../auth/auth.decorators";
import { PlatformsService } from "../platforms/platforms.service";

@AllowAnonymous()
@Controller("health")
export class HealthController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get()
  getHealth() {
    return {
      ok: true,
      service: "api",
      timestamp: new Date().toISOString(),
      integrations: this.platformsService.getConfigurationState(),
    };
  }
}
