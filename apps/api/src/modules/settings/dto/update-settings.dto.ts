import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  retentionDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4096)
  storageLimitGb?: number;

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
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3650)
  telegramKeepLocalDays?: number;

  @IsOptional()
  @IsBoolean()
  audioTrackEnabled?: boolean;

  // 0 disables the auto-deletion of audio tracks.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3650)
  audioKeepDays?: number;

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

