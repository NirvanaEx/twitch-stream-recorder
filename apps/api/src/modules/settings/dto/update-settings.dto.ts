import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, Max, Min } from "class-validator";

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
}

