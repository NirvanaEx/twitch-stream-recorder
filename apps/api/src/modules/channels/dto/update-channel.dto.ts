import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  displayName?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  autoRecord?: boolean;

  // Independent capture switches. At least one must stay on.
  @IsOptional()
  @IsBoolean()
  recordVideo?: boolean;

  @IsOptional()
  @IsBoolean()
  recordAudio?: boolean;

  /** @deprecated Kept so older clients keep working; maps onto recordVideo. */
  @IsOptional()
  @IsBoolean()
  audioOnly?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  preferredQuality?: string;
}

