import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  recordChat?: boolean;

  @IsOptional()
  @IsBoolean()
  keepDeletedMessages?: boolean;

  @IsOptional()
  @IsBoolean()
  support7tv?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-600)
  @Max(600)
  defaultChatOffsetSec?: number;

  @IsOptional()
  @IsBoolean()
  telegramEnabled?: boolean;

  // "-100..." channel id, "@channelusername", or empty to unset.
  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Matches(/^$|^(@[A-Za-z0-9_]{4,}|-?\d+)$/)
  telegramChatId?: string;

  @IsOptional()
  @IsBoolean()
  audioTrackEnabled?: boolean;

  // Spoiler-free viewing for anyone who has not set it themselves.
  @IsOptional()
  @IsBoolean()
  spoilerFreeDefault?: boolean;

  // Local retention, in days: -1 keep forever, 0 delete right after the
  // Telegram upload, N delete N days after it.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  @Max(3650)
  videoKeepLocalDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  @Max(3650)
  audioKeepLocalDays?: number;

  // Archive retention, in days from the start of the broadcast: how long a
  // recording stays on the mounted Drive. -1 keeps it there forever.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  @Max(3650)
  archiveKeepDays?: number;

  // Secrets: an empty string means "keep the stored value" so the settings
  // form can always submit the whole object without wiping them.
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Matches(/^\d*$/)
  telegramApiId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  telegramApiHash?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  telegramBotToken?: string;
}

