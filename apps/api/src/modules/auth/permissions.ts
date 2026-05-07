/**
 * The hardcoded list of permission keys the app understands.
 * Roles store any subset of these keys; the PermissionsGuard checks
 * @RequirePermissions(...) decorators against the user's role.
 *
 * Superadmins bypass these checks entirely.
 */
export const PERMISSIONS = {
  // Channels page: list, add, edit, start/stop, delete.
  manage_channels: "Управление каналами (добавить/удалить, ручной старт/стоп).",
  // Recording page: see live recording state.
  view_recording: "Просмотр активной записи.",
  // Archives page: see, watch, download, delete.
  view_archives: "Просмотр списка архивов и плеера в админке.",
  manage_archives: "Удаление архивов.",
  // Settings page.
  manage_settings: "Изменение настроек хранения и чата.",
  // Users CRUD.
  manage_users: "Управление пользователями.",
  // Roles CRUD + permission editor.
  manage_roles: "Управление ролями и правами.",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as PermissionKey[];

export function isValidPermission(key: string): key is PermissionKey {
  return Object.prototype.hasOwnProperty.call(PERMISSIONS, key);
}

export function describePermissions() {
  return ALL_PERMISSIONS.map((key) => ({
    key,
    description: PERMISSIONS[key],
  }));
}
