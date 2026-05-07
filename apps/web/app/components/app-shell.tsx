"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../providers";
import {
  ArchiveIcon,
  FolderOpenIcon,
  HardDriveIcon,
  HomeIcon,
  SettingsIcon,
  UsersIcon,
  VideoIcon,
} from "./icons";

type DiskUsage = {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const { user, hasPermission, logout } = useAuth();
  const [disk, setDisk] = useState<DiskUsage | null>(null);
  const isTheater = pathname?.endsWith("/theater") ?? false;
  const canViewDashboard = hasPermission("view_archives");

  useEffect(() => {
    if (isTheater || !canViewDashboard) return undefined;

    let cancelled = false;

    async function load() {
      try {
        const response = await apiGet<{
          diskUsage: DiskUsage | null;
        }>("dashboard");
        if (!cancelled && response.diskUsage) {
          setDisk(response.diskUsage);
        }
      } catch {
        // Either unauthorised or transient error — stay silent in the shell.
      }
    }

    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isTheater, canViewDashboard]);

  if (isTheater) {
    return <>{children}</>;
  }

  // Each nav item is gated by a permission key. Superadmin sees everything;
  // regular users only see what their role allows.
  const navItems: Array<{
    href: string;
    label: string;
    Icon: typeof HomeIcon;
    permission: string | null;
  }> = [
    { href: "/admin", label: t.common.dashboard, Icon: HomeIcon, permission: "view_archives" },
    { href: "/admin/channels", label: t.common.channels, Icon: UsersIcon, permission: "manage_channels" },
    { href: "/admin/recording", label: t.common.recordingPage, Icon: VideoIcon, permission: "view_recording" },
    { href: "/admin/local-replay", label: t.localReplay.navLabel, Icon: FolderOpenIcon, permission: null },
    { href: "/admin/archives", label: t.common.archives, Icon: ArchiveIcon, permission: "view_archives" },
    { href: "/admin/users", label: t.admin.sectionUsers, Icon: UsersIcon, permission: "manage_users" },
    { href: "/admin/access", label: t.admin.sectionAccess, Icon: SettingsIcon, permission: "manage_roles" },
    { href: "/admin/settings", label: t.common.settings, Icon: SettingsIcon, permission: "manage_settings" },
    { href: "/admin/account", label: t.admin.sectionAccount, Icon: UsersIcon, permission: null },
  ];

  const visibleNav = useMemo(
    () =>
      navItems.filter(
        (item) => item.permission === null || hasPermission(item.permission),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, user?.isSuperadmin, user?.role?.permissions?.join("|")],
  );

  const usagePercent = disk
    ? Math.min(100, Math.max(0, (disk.usedBytes / disk.totalBytes) * 100))
    : 0;

  const usageClass =
    usagePercent >= 90 ? "danger" : usagePercent >= 75 ? "warn" : "";

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-eyebrow">TSR · {t.admin.panelLabel}</span>
          <h1 className="brand-title">{t.common.appName}</h1>
        </div>

        <nav className="nav-list">
          {visibleNav.map(({ href, label, Icon }) => {
            // /admin should match exactly; deeper paths use prefix match so the
            // active state stays consistent (e.g. /admin/archives/[id]).
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={isActive ? "nav-link active" : "nav-link"}
              >
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {disk ? (
            <div className="disk-block">
              <div className="disk-block-head">
                <HardDriveIcon size={12} />
                <span>{t.common.diskFree}</span>
              </div>
              <div className="disk-bar">
                <div
                  className={`disk-bar-fill ${usageClass}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="disk-meta">
                <span>{formatBytes(disk.freeBytes)} free</span>
                <span>{formatBytes(disk.totalBytes)}</span>
              </div>
            </div>
          ) : null}

          {user ? (
            <div className="user-block">
              <div className="user-block-head">
                <strong>{user.username}</strong>
                {user.isSuperadmin ? (
                  <span className="badge live">{t.auth.youAreSuperadmin}</span>
                ) : user.role ? (
                  <span className="badge">{user.role.name}</span>
                ) : null}
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => logout()}
                style={{ width: "100%", marginTop: 6 }}
              >
                {t.auth.logout}
              </button>
            </div>
          ) : null}

          <div className="lang-row">
            <button
              type="button"
              className={locale === "ru" ? "active" : ""}
              onClick={() => setLocale("ru")}
            >
              RU
            </button>
            <button
              type="button"
              className={locale === "en" ? "active" : ""}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
        </div>
      </aside>

      <div className="content-area">{children}</div>
    </div>
  );
}
