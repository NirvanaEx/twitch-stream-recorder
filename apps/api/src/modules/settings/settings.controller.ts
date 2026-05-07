import { Body, Controller, Get, Put } from "@nestjs/common";
import { RequirePermissions } from "../auth/auth.decorators";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {
    this.getSettings = this.getSettings.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
  }

  @RequirePermissions("manage_settings")
  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @RequirePermissions("manage_settings")
  @Put()
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
