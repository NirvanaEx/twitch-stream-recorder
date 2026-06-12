"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../providers";
import {
  ArchiveIcon,
  CloseIcon,
  FolderOpenIcon,
  HardDriveIcon,
  HomeIcon,
  MenuIcon,
  MusicIcon,
  RecordIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  TvIcon,
  UserIcon,
  UsersIcon,
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
  // Mobile-only: the sidebar collapses into a top bar with a burger menu.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isTheater = pathname?.endsWith("/theater") ?? false;
  const canViewDashboard = hasPermission("view_archives");

  // Navigating closes the mobile menu.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
  // regular users only see what their role allows. Items are grouped into
  // titled sections; a section disappears when none of its items are visible.
  type NavItem = {
    href: string;
    label: string;
    Icon: typeof HomeIcon;
    permission: string | null;
  };

  const navGroups: Array<{ title: string; items: NavItem[] }> = [
    {
      title: t.nav.groupRecords,
      items: [
        { href: "/admin", label: t.common.dashboard, Icon: HomeIcon, permission: "view_archives" },
        { href: "/admin/channels", label: t.common.channels, Icon: TvIcon, permission: "manage_channels" },
        { href: "/admin/recording", label: t.nav.recordingNow, Icon: RecordIcon, permission: "view_recording" },
        { href: "/admin/archives", label: t.nav.archive, Icon: ArchiveIcon, permission: "view_archives" },
        { href: "/admin/twitch-audio", label: t.nav.twitchAudio, Icon: MusicIcon, permission: "view_archives" },
      ],
    },
    {
      title: t.nav.groupStorage,
      items: [
        { href: "/admin/storage", label: t.nav.telegramStorage, Icon: SendIcon, permission: "view_archives" },
        { href: "/admin/local-replay", label: t.localReplay.navLabel, Icon: FolderOpenIcon, permission: null },
      ],
    },
    {
      title: t.nav.groupAdmin,
      items: [
        { href: "/admin/users", label: t.admin.sectionUsers, Icon: UsersIcon, permission: "manage_users" },
        { href: "/admin/access", label: t.admin.sectionAccess, Icon: ShieldIcon, permission: "manage_roles" },
        { href: "/admin/settings", label: t.common.settings, Icon: SettingsIcon, permission: "manage_settings" },
        { href: "/admin/account", label: t.admin.sectionAccount, Icon: UserIcon, permission: null },
      ],
    },
  ];

  const visibleGroups = useMemo(
    () =>
      navGroups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => item.permission === null || hasPermission(item.permission),
          ),
        }))
        .filter((group) => group.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, user?.isSuperadmin, user?.role?.permissions?.join("|"), locale],
  );

  const usagePercent = disk
    ? Math.min(100, Math.max(0, (disk.usedBytes / disk.totalBytes) * 100))
    : 0;

  const usageClass =
    usagePercent >= 90 ? "danger" : usagePercent >= 75 ? "warn" : "";

  return (
    <div className="app-frame">
      <aside className={mobileMenuOpen ? "sidebar sidebar--open" : "sidebar"}>
        <div className="brand-block">
          <div className="brand-text">
            <span className="brand-eyebrow">TSR · {t.admin.panelLabel}</span>
            <h1 className="brand-title">{t.common.appName}</h1>
          </div>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>

        <nav className="nav-list">
          {visibleGroups.map((group) => (
            <div key={group.title} className="nav-group">
              <div className="nav-group-title">{group.title}</div>
              {group.items.map(({ href, label, Icon }) => {
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
            </div>
          ))}
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
