import { Controller, Get, Param, Post } from "@nestjs/common";
import { RequirePermissions } from "../auth/auth.decorators";
import { TelegramService } from "./telegram.service";

@Controller("telegram")
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {
    this.getStatus = this.getStatus.bind(this);
    this.getStorageOverview = this.getStorageOverview.bind(this);
    this.requestUpload = this.requestUpload.bind(this);
  }

  @RequirePermissions("manage_settings")
  @Get("status")
  getStatus() {
    return this.telegramService.getStatus();
  }

  @RequirePermissions("view_archives")
  @Get("storage")
  getStorageOverview() {
    return this.telegramService.getStorageOverview();
  }

  @RequirePermissions("manage_archives")
  @Post("upload/:id")
  requestUpload(@Param("id") id: string) {
    return this.telegramService.requestUpload(id);
  }
}
