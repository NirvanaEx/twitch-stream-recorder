import { Controller, Get, Header } from "@nestjs/common";
import { AllowAnonymous } from "../auth/auth.decorators";
import { PrismaService } from "../prisma/prisma.service";

/**
 * The viewing defaults a browser needs before it has been told anything.
 *
 * Separate from `/settings`, which needs the `manage_settings` permission and
 * returns Telegram credentials alongside everything else. The public site is
 * watched by people who are not logged in at all, and all they need is the one
 * question "is spoiler-free on unless I say otherwise".
 *
 * Deliberately not part of the streams listing: the answer is the same for
 * every page, so it should not ride along on a per-page request.
 */
@AllowAnonymous()
@Controller("public/preferences")
export class PublicPreferencesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  // Short, not immutable: an admin flipping the switch should reach browsers
  // within a minute, and one row read is not worth caching harder than that.
  @Header("Cache-Control", "public, max-age=60")
  async getPreferences() {
    const settings = await this.prisma.appSettings.findUnique({
      where: { id: "default" },
      select: { spoilerFreeDefault: true },
    });

    // No settings row yet (a fresh install): spoiler-free is the default the
    // schema would have created it with.
    return { spoilerFreeDefault: settings?.spoilerFreeDefault ?? true };
  }
}
