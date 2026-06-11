import { Injectable } from "@nestjs/common";
import { AppSettings } from "@prisma/client";
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

    return this.serializeSettings(settings);
  }

  async updateSettings(dto: UpdateSettingsDto) {
    // Secrets are write-only: an empty/omitted value keeps what is stored, so
    // the settings form can submit its whole state without wiping them.
    const telegramApiId = dto.telegramApiId?.trim() || undefined;
    const telegramApiHash = dto.telegramApiHash?.trim() || undefined;
    const telegramBotToken = dto.telegramBotToken?.trim() || undefined;

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
        telegramEnabled: dto.telegramEnabled ?? false,
        telegramChatId: dto.telegramChatId ?? "",
        telegramKeepLocalDays: dto.telegramKeepLocalDays ?? 7,
        telegramApiId: telegramApiId ?? "",
        telegramApiHash: telegramApiHash ?? "",
        telegramBotToken: telegramBotToken ?? "",
      },
      update: {
        retentionDays: dto.retentionDays,
        storageLimitGb: dto.storageLimitGb,
        recordChat: dto.recordChat,
        keepDeletedMessages: dto.keepDeletedMessages,
        support7tv: dto.support7tv,
        defaultChatOffsetSec: dto.defaultChatOffsetSec,
        telegramEnabled: dto.telegramEnabled,
        telegramChatId: dto.telegramChatId,
        telegramKeepLocalDays: dto.telegramKeepLocalDays,
        telegramApiId,
        telegramApiHash,
        telegramBotToken,
      },
    });

    return this.serializeSettings(settings);
  }

  private serializeSettings(settings: AppSettings) {
    return {
      retentionDays: settings.retentionDays,
      storageLimitGb: settings.storageLimitGb,
      recordChat: settings.recordChat,
      keepDeletedMessages: settings.keepDeletedMessages,
      support7tv: settings.support7tv,
      defaultChatOffsetSec: settings.defaultChatOffsetSec,
      telegramEnabled: settings.telegramEnabled,
      telegramChatId: settings.telegramChatId,
      telegramKeepLocalDays: settings.telegramKeepLocalDays,
      // Secrets never leave the API; the UI only learns whether they are set
      // (either in the database or via env fallback).
      telegramApiIdSet: Boolean(
        settings.telegramApiId.trim() || process.env.TELEGRAM_API_ID?.trim(),
      ),
      telegramApiHashSet: Boolean(
        settings.telegramApiHash.trim() || process.env.TELEGRAM_API_HASH?.trim(),
      ),
      telegramBotTokenSet: Boolean(
        settings.telegramBotToken.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim(),
      ),
      updatedAt: settings.updatedAt,
    };
  }
}
