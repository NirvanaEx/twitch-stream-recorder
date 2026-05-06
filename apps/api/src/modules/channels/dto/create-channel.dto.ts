import { IsString, MaxLength } from "class-validator";

export class CreateChannelDto {
  @IsString()
  @MaxLength(255)
  channel!: string;
}
