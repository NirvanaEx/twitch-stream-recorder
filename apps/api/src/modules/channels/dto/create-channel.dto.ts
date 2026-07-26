import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { PLATFORMS } from "../../platforms/platforms.service";

export class CreateChannelDto {
  @IsString()
  @MaxLength(255)
  channel!: string;

  // Defaults to Twitch so existing clients keep working.
  @IsOptional()
  @IsIn(PLATFORMS as unknown as string[])
  platform?: string;
}
