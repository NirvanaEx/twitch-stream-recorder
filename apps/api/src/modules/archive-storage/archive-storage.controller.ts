import { Controller, Get, Post } from "@nestjs/common";
import { RequirePermissions } from "../auth/auth.decorators";
import { ArchiveStorageService } from "./archive-storage.service";

@Controller("archive-storage")
export class ArchiveStorageController {
  constructor(private readonly archiveStorageService: ArchiveStorageService) {
    this.getOverview = this.getOverview.bind(this);
    this.runSweep = this.runSweep.bind(this);
  }

  @RequirePermissions("view_archives")
  @Get()
  getOverview() {
    return this.archiveStorageService.getOverview();
  }

  /**
   * Run the sweep now instead of waiting for the next tick — the useful button
   * after remounting the Drive or changing the retention.
   */
  @RequirePermissions("manage_archives")
  @Post("sweep")
  async runSweep() {
    this.archiveStorageService.kick();
    return { started: true };
  }
}
