import type { PermissionKey } from "./permissions";

export type AuthenticatedUser = {
  id: string;
  username: string;
  isSuperadmin: boolean;
  role: {
    id: string;
    name: string;
    permissions: PermissionKey[];
  } | null;
};

export type JwtPayload = {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
};
