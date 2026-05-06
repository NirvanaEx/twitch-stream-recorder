import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
      },
      update: {},
    });

    return {
      retentionDays: settings.retentionDays,
      storageLimitGb: settings.storageLimitGb,
      recordChat: settings.recordChat,
      keepDeletedMessages: settings.keepDeletedMessages,
      support7tv: settings.support7tv,
      defaultChatOffsetSec: settings.defaultChatOffsetSec,
      updatedAt: settings.updatedAt,
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const settings = await this.prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        retentionDays: dto.retentionDays ?? 30,
        storageLimitGb: dto.storageLimitGb ?? 80,
        recordChat: dto.recordChat ?? true,
        keepDeletedMessages: dto.keepDeletedMessages ?? true,
        support7tv: dto.support7tv ?? true,
        defaultChatOffsetSec: dto.defaultChatOffsetSec ?? 0,
      },
      update: {
        retentionDays: dto.retentionDays,
        storageLimitGb: dto.storageLimitGb,
        recordChat: dto.recordChat,
        keepDeletedMessages: dto.keepDeletedMessages,
        support7tv: dto.support7tv,
        defaultChatOffsetSec: dto.defaultChatOffsetSec,
      },
    });

    return {
      retentionDays: settings.retentionDays,
      storageLimitGb: settings.storageLimitGb,
      recordChat: settings.recordChat,
      keepDeletedMessages: settings.keepDeletedMessages,
      support7tv: settings.support7tv,
      defaultChatOffsetSec: settings.defaultChatOffsetSec,
      updatedAt: settings.updatedAt,
    };
  }
}
