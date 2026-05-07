import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import {
  AuthenticatedUser,
  JwtPayload,
} from "./auth.types";
import { JWT_TTL_SECONDS } from "./auth.constants";
import { ALL_PERMISSIONS, isValidPermission, type PermissionKey } from "./permissions";

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.bootstrapSuperadmin();
  }

  private async bootstrapSuperadmin() {
    const existing = await this.prisma.user.findFirst({
      where: { isSuperadmin: true },
      select: { id: true, username: true },
    });

    if (existing) {
      return;
    }

    const username = (process.env.SUPERADMIN_USERNAME ?? "superadmin").trim() || "superadmin";
    const password = process.env.SUPERADMIN_PASSWORD ?? "123";
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // If a non-superadmin user already exists with this username (e.g. someone
    // created it via the UI), keep things safe: just promote them.
    const collision = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (collision) {
      await this.prisma.user.update({
        where: { id: collision.id },
        data: { isSuperadmin: true },
      });
      this.logger.warn(
        `Promoted existing user "${username}" to superadmin (no superadmin was present).`,
      );
      return;
    }

    await this.prisma.user.create({
      data: {
        username,
        passwordHash,
        isSuperadmin: true,
      },
    });

    this.logger.log(
      `Bootstrap: created default superadmin "${username}" (change the password from the UI).`,
    );
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException("Неверный логин или пароль.");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      throw new UnauthorizedException("Неверный логин или пароль.");
    }

    const payload: JwtPayload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: JWT_TTL_SECONDS,
    });

    return {
      token,
      user: this.serialize(user, user.role),
    };
  }

  async verifyToken(token: string): Promise<AuthenticatedUser> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException("Сессия истекла, войдите снова.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException("Пользователь больше не существует.");
    }

    return this.serialize(user, user.role);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 4) {
      throw new BadRequestException("Новый пароль должен содержать минимум 4 символа.");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException("Пользователь больше не существует.");
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!ok) {
      throw new BadRequestException("Текущий пароль введён неверно.");
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { ok: true };
  }

  /**
   * Returns true if the user is allowed to perform an action requiring
   * ALL of the listed permission keys. Superadmin always wins.
   */
  hasPermissions(user: AuthenticatedUser, required: PermissionKey[]) {
    if (user.isSuperadmin) {
      return true;
    }

    if (!required || required.length === 0) {
      return true;
    }

    if (!user.role) {
      return false;
    }

    const owned = new Set(user.role.permissions);
    return required.every((key) => owned.has(key));
  }

  static hashPassword(password: string) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  private serialize(
    user: {
      id: string;
      username: string;
      isSuperadmin: boolean;
    },
    role:
      | { id: string; name: string; permissions: string[] }
      | null,
  ): AuthenticatedUser {
    return {
      id: user.id,
      username: user.username,
      isSuperadmin: user.isSuperadmin,
      role: role
        ? {
            id: role.id,
            name: role.name,
            permissions: role.permissions.filter(isValidPermission),
          }
        : null,
    };
  }

  static get ALL_PERMISSIONS() {
    return ALL_PERMISSIONS;
  }
}
