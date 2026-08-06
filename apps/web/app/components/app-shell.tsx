"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../providers";
import {
  ArchiveIcon,
  ChevronRightIcon,
  CloseIcon,
  CloudIcon,
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

type ArchiveUsage = {
  configured: boolean;
  available: boolean;
  disk: { totalBytes: string; freeBytes: string } | null;
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
  const [archive, setArchive] = useState<ArchiveUsage | null>(null);
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
        const [dashboard, archiveOverview] = await Promise.all([
          apiGet<{ diskUsage: DiskUsage | null }>("dashboard"),
          apiGet<ArchiveUsage>("archive-storage").catch(() => null),
        ]);
        if (cancelled) return;
        if (dashboard.diskUsage) {
          setDisk(dashboard.diskUsage);
        }
        setArchive(archiveOverview);
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
        { href: "/admin/recording", label: t.nav.recordingNow, Icon: RecordIcon, permission: "view_recording" },
        { href: "/admin/archives", label: t.nav.archive, Icon: ArchiveIcon, permission: "view_archives" },
        { href: "/admin/twitch-audio", label: t.nav.twitchAudio, Icon: MusicIcon, permission: "view_archives" },
      ],
    },
    {
      title: t.nav.groupStorage,
      items: [
        { href: "/admin/storage", label: t.nav.telegramStorage, Icon: SendIcon, permission: "view_archives" },
        { href: "/admin/files", label: t.nav.filesCheck, Icon: HardDriveIcon, permission: "view_archives" },
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
          {/* The way back out. The public site links into the panel from its
              header; without this the trip was one-way and people went at it
              by editing the URL. Sits in the sidebar rather than on the
              dashboard so it is there from every page of the panel. */}
          <Link href="/" className="nav-link nav-link--out">
            <TvIcon size={15} />
            <span>{t.nav.publicSite}</span>
            <ChevronRightIcon size={14} />
          </Link>

          {disk || archive?.configured ? (
            <div className="storage-block">
              {disk ? (
                <StorageTier
                  icon={<HardDriveIcon size={12} />}
                  label={t.common.diskServer}
                  freeBytes={disk.freeBytes}
                  totalBytes={disk.totalBytes}
                  freeLabel={t.common.diskFreeShort}
                  ofLabel={t.common.diskOf}
                />
              ) : null}

              {archive?.configured ? (
                <StorageTier
                  icon={<CloudIcon size={12} />}
                  label={t.common.diskArchive}
                  freeBytes={archive.disk ? Number(archive.disk.freeBytes) : 0}
                  totalBytes={archive.disk ? Number(archive.disk.totalBytes) : 0}
                  freeLabel={t.common.diskFreeShort}
                  ofLabel={t.common.diskOf}
                  offline={!archive.available}
                  offlineLabel={t.common.diskOffline}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>

      <div className="content-area">{children}</div>
    </div>
  );
}

/**
 * One storage tier in the sidebar: a label, how much is left, and a hairline
 * showing how full it is.
 *
 * The number leads and the bar supports it — "52 GB free" is the thing being
 * looked for, and the bar only has to answer "is that a lot?" at a glance. It
 * stays neutral grey until the tier is genuinely worth attention, so colour in
 * this corner of the screen always means something.
 */
function StorageTier({
  icon,
  label,
  freeBytes,
  totalBytes,
  freeLabel,
  ofLabel,
  offline = false,
  offlineLabel,
}: {
  icon: React.ReactNode;
  label: string;
  freeBytes: number;
  totalBytes: number;
  freeLabel: string;
  ofLabel: string;
  offline?: boolean;
  offlineLabel?: string;
}) {
  const usedPercent =
    totalBytes > 0 ? Math.min(100, Math.max(0, ((totalBytes - freeBytes) / totalBytes) * 100)) : 0;
  const fillClass = usedPercent >= 90 ? "danger" : usedPercent >= 75 ? "warn" : "";

  return (
    <div className={offline ? "storage-tier offline" : "storage-tier"}>
      <div className="storage-tier-name">
        {icon}
        <span>{label}</span>
      </div>
      <div className="storage-bar">
        <div
          className={`storage-bar-fill ${fillClass}`}
          style={{ width: offline ? "100%" : `${usedPercent}%` }}
        />
      </div>
      <div className="storage-tier-meta">
        {offline || totalBytes <= 0 ? (
          offlineLabel ?? "—"
        ) : (
          <>
            <strong>{formatBytes(freeBytes)}</strong> {freeLabel} {ofLabel}{" "}
            {formatBytes(totalBytes)}
          </>
        )}
      </div>
    </div>
  );
}
