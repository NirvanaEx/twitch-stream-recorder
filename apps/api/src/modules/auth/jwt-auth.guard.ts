import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ALLOW_ANONYMOUS_KEY, REQUIRE_PERMISSIONS_KEY } from "./auth.constants";
import { AuthService } from "./auth.service";
import type { PermissionKey } from "./permissions";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowAnonymous = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ANONYMOUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (allowAnonymous) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: unknown;
    }>();
    const header = (request.headers["authorization"] ?? "") as string;
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (!token) {
      throw new UnauthorizedException("Нужно войти.");
    }

    const user = await this.authService.verifyToken(token);
    request.user = user;

    const required = this.reflector.getAllAndMerge<PermissionKey[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (required && required.length > 0) {
      if (!this.authService.hasPermissions(user, required)) {
        throw new ForbiddenException("Недостаточно прав.");
      }
    }

    return true;
  }
}
