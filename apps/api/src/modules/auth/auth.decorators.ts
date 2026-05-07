import { SetMetadata } from "@nestjs/common";
import { ALLOW_ANONYMOUS_KEY, REQUIRE_PERMISSIONS_KEY } from "./auth.constants";
import type { PermissionKey } from "./permissions";

/**
 * Marks a controller or handler as accessible without a JWT.
 * Used by /api/auth/login, /api/health, /api/public/* and similar.
 */
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_KEY, true);

/**
 * Requires the authenticated user to either be a superadmin or own a role
 * that includes ALL of the listed permission keys.
 */
export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);
