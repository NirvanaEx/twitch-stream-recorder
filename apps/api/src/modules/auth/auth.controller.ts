import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { AllowAnonymous } from "./auth.decorators";
import { CurrentUser } from "./current-user.decorator";
import { ChangePasswordDto, LoginDto } from "./dto";
import { AuthService } from "./auth.service";
import { describePermissions } from "./permissions";
import type { AuthenticatedUser } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowAnonymous()
  @Post("login")
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }

  @Post("change-password")
  @HttpCode(200)
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @AllowAnonymous()
  @Get("permissions")
  permissions() {
    return { items: describePermissions() };
  }
}
