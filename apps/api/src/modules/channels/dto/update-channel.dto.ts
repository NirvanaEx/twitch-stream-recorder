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

  @IsOptional()
  @IsString()
  @MaxLength(32)
  preferredQuality?: string;
}

