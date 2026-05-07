import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import {
  ALL_PERMISSIONS,
  isValidPermission,
  type PermissionKey,
} from "../auth/permissions";
import type { AuthenticatedUser } from "../auth/auth.types";
import {
  CreateRoleDto,
  CreateUserDto,
  UpdateRoleDto,
  UpdateUserDto,
} from "./dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // -------- users --------

  async listUsers() {
    const items = await this.prisma.user.findMany({
      orderBy: [{ isSuperadmin: "desc" }, { username: "asc" }],
      include: { role: true },
    });

    return {
      items: items.map((user) => ({
        id: user.id,
        username: user.username,
        isSuperadmin: user.isSuperadmin,
        roleId: user.roleId,
        roleName: user.role?.name ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };
  }

  async createUser(dto: CreateUserDto) {
    const username = dto.username.trim();
    const collision = await this.prisma.user.findUnique({ where: { username } });

    if (collision) {
      throw new ConflictException("Пользователь с таким логином уже существует.");
    }

    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
      if (!role) {
        throw new BadRequestException("Указанная роль не найдена.");
      }
    }

    const passwordHash = await AuthService.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        username,
        passwordHash,
        roleId: dto.roleId ?? null,
      },
      include: { role: true },
    });

    return {
      item: {
        id: user.id,
        username: user.username,
        isSuperadmin: user.isSuperadmin,
        roleId: user.roleId,
        roleName: user.role?.name ?? null,
      },
    };
  }

  async updateUser(currentUser: AuthenticatedUser, id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Пользователь не найден.");
    }

    // Superadmin's role is meaningless (they bypass permissions); we still allow
    // password reset on themselves but block stripping privileges.
    if (user.isSuperadmin && dto.roleId !== undefined) {
      throw new ForbiddenException("У суперадмина роль не используется.");
    }

    const data: { roleId?: string | null; passwordHash?: string } = {};

    if (dto.roleId !== undefined) {
      if (dto.roleId === null) {
        data.roleId = null;
      } else {
        const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
        if (!role) {
          throw new BadRequestException("Указанная роль не найдена.");
        }
        data.roleId = dto.roleId;
      }
    }

    if (dto.password) {
      // An admin resetting another user's password is allowed; resetting your
      // own password through this endpoint is also OK but the dedicated
      // /auth/change-password (with current password) is preferred for self.
      if (user.id === currentUser.id && !currentUser.isSuperadmin) {
        throw new ForbiddenException(
          "Свой пароль меняйте через страницу «Аккаунт» с подтверждением старого.",
        );
      }
      data.passwordHash = await AuthService.hashPassword(dto.password);
    }

    if (Object.keys(data).length === 0) {
      return { ok: true, noop: true };
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    return {
      item: {
        id: updated.id,
        username: updated.username,
        isSuperadmin: updated.isSuperadmin,
        roleId: updated.roleId,
        roleName: updated.role?.name ?? null,
      },
    };
  }

  async deleteUser(currentUser: AuthenticatedUser, id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Пользователь не найден.");
    }

    if (user.isSuperadmin) {
      throw new ForbiddenException("Суперадмина удалить нельзя.");
    }

    if (user.id === currentUser.id) {
      throw new ForbiddenException("Нельзя удалить самого себя.");
    }

    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }

  // -------- roles --------

  async listRoles() {
    const items = await this.prisma.role.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { users: true } } },
    });

    return {
      items: items.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.filter(isValidPermission),
        userCount: role._count.users,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
    };
  }

  async createRole(dto: CreateRoleDto) {
    const name = dto.name.trim();
    const collision = await this.prisma.role.findUnique({ where: { name } });
    if (collision) {
      throw new ConflictException("Роль с таким именем уже существует.");
    }

    const permissions = this.normalizePermissions(dto.permissions ?? []);

    const role = await this.prisma.role.create({
      data: {
        name,
        description: dto.description?.trim() || null,
        permissions,
      },
    });

    return { item: { ...role, userCount: 0 } };
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException("Роль не найдена.");
    }

    const data: {
      name?: string;
      description?: string | null;
      permissions?: string[];
    } = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name !== role.name) {
        const collision = await this.prisma.role.findUnique({ where: { name } });
        if (collision) {
          throw new ConflictException("Роль с таким именем уже существует.");
        }
        data.name = name;
      }
    }

    if (dto.description !== undefined) {
      data.description = dto.description?.toString().trim() || null;
    }

    if (dto.permissions !== undefined) {
      data.permissions = this.normalizePermissions(dto.permissions);
    }

    if (Object.keys(data).length === 0) {
      return { ok: true, noop: true };
    }

    const updated = await this.prisma.role.update({ where: { id }, data });
    return { item: updated };
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) {
      throw new NotFoundException("Роль не найдена.");
    }
    if (role._count.users > 0) {
      throw new ConflictException(
        `Нельзя удалить роль: её используют пользователей — ${role._count.users}.`,
      );
    }

    await this.prisma.role.delete({ where: { id } });
    return { ok: true };
  }

  private normalizePermissions(input: string[]): PermissionKey[] {
    const dedup = new Set<PermissionKey>();
    for (const raw of input) {
      const key = raw?.toString().trim();
      if (key && isValidPermission(key)) {
        dedup.add(key);
      }
    }
    // Keep a stable order (matches ALL_PERMISSIONS) so updates are deterministic.
    return ALL_PERMISSIONS.filter((key) => dedup.has(key));
  }
}
