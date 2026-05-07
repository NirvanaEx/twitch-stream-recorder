import { Controller, Get } from "@nestjs/common";
import { RequirePermissions } from "../auth/auth.decorators";
import { DashboardService } from "./dashboard.service";

@RequirePermissions("view_archives")
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {
    this.getOverview = this.getOverview.bind(this);
  }

  @Get()
  getOverview() {
    return this.dashboardService.getOverview();
  }
}
