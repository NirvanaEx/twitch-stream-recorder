import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9_.\-]+$/u, {
    message: "Логин может содержать только буквы, цифры и символы _ . -",
  })
  username!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  roleId?: string | null;
}

export class UpdateUserDto {
  // null — снять роль; string — назначить; undefined — не трогать.
  @IsOptional()
  roleId?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(128)
  password?: string;
}

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string | null;

  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];
}

// Just to keep tsc happy if class-validator strips unknowns we never use.
export const _isBooleanRef = IsBoolean;
