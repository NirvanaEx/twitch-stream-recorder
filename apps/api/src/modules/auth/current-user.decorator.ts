import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import type { AuthenticatedUser } from "./auth.types";

/**
 * Pulls the authenticated user out of the request (set by JwtAuthGuard).
 * Returns undefined when used inside an @AllowAnonymous() route.
 */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    return request.user;
  },
);
