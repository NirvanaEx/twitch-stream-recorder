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
        recordChat: dto.recordChat ?? true,
        keepDeletedMessages: dto.keepDeletedMessages ?? true,
        support7tv: dto.support7tv ?? true,
        defaultChatOffsetSec: dto.defaultChatOffsetSec ?? 0,
        telegramEnabled: dto.telegramEnabled ?? false,
        telegramChatId: dto.telegramChatId ?? "",
        audioTrackEnabled: dto.audioTrackEnabled ?? true,
        videoKeepLocalDays: dto.videoKeepLocalDays ?? 0,
        audioKeepLocalDays: dto.audioKeepLocalDays ?? 0,
        telegramApiId: telegramApiId ?? "",
        telegramApiHash: telegramApiHash ?? "",
        telegramBotToken: telegramBotToken ?? "",
      },
      update: {
        recordChat: dto.recordChat,
        keepDeletedMessages: dto.keepDeletedMessages,
        support7tv: dto.support7tv,
        defaultChatOffsetSec: dto.defaultChatOffsetSec,
        telegramEnabled: dto.telegramEnabled,
        telegramChatId: dto.telegramChatId,
        audioTrackEnabled: dto.audioTrackEnabled,
        videoKeepLocalDays: dto.videoKeepLocalDays,
        audioKeepLocalDays: dto.audioKeepLocalDays,
        telegramApiId,
        telegramApiHash,
        telegramBotToken,
      },
    });

    return this.serializeSettings(settings);
  }

  private serializeSettings(settings: AppSettings) {
    return {
      recordChat: settings.recordChat,
      keepDeletedMessages: settings.keepDeletedMessages,
      support7tv: settings.support7tv,
      defaultChatOffsetSec: settings.defaultChatOffsetSec,
      telegramEnabled: settings.telegramEnabled,
      telegramChatId: settings.telegramChatId,
      audioTrackEnabled: settings.audioTrackEnabled,
      videoKeepLocalDays: settings.videoKeepLocalDays,
      audioKeepLocalDays: settings.audioKeepLocalDays,
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
