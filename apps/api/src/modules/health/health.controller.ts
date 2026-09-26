import { ownsBackgroundJobs, runtimeRole } from "../../runtime/role";
import { recorderHealth } from "../../runtime/recorder-health";
import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "../auth/auth.decorators";
import { PlatformsService } from "../platforms/platforms.service";

@AllowAnonymous()
@Controller("health")
export class HealthController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get()
  async getHealth() {
    return {
      ok: true,
      service: "api",
      role: runtimeRole(),
      backgroundJobs: ownsBackgroundJobs(),
      release: process.env.TSR_RELEASE ?? "development",
      ...(runtimeRole() === "api" ? { recorder: await recorderHealth() } : {}),
      timestamp: new Date().toISOString(),
      integrations: this.platformsService.getConfigurationState(),
    };
  }
}
