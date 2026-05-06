import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

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
