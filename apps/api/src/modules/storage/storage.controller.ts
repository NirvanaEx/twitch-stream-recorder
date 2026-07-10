import { Body, Controller, Get, Post } from "@nestjs/common";
import { RequirePermissions } from "../auth/auth.decorators";
import { StorageService } from "./storage.service";

@RequirePermissions("view_archives")
@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get("disk")
  scanDisk() {
    return this.storageService.scanDisk();
  }

  @RequirePermissions("manage_archives")
  @Post("disk/cleanup")
  cleanup(@Body() body?: { paths?: string[] }) {
    return this.storageService.cleanupOrphans(body?.paths);
  }
}
