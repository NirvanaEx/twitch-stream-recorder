"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
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
  const [disk, setDisk] = useState<DiskUsage | null>(null);
  const isTheater = pathname?.endsWith("/theater") ?? false;

  useEffect(() => {
    if (isTheater) return undefined;

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
        // Ignore.
      }
    }

    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isTheater]);

  if (isTheater) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/", label: t.common.dashboard, Icon: HomeIcon },
    { href: "/channels", label: t.common.channels, Icon: UsersIcon },
    { href: "/recording", label: t.common.recordingPage, Icon: VideoIcon },
    { href: "/local-replay", label: t.localReplay.navLabel, Icon: FolderOpenIcon },
    { href: "/archives", label: t.common.archives, Icon: ArchiveIcon },
    { href: "/settings", label: t.common.settings, Icon: SettingsIcon },
  ];

  const usagePercent = disk
    ? Math.min(100, Math.max(0, (disk.usedBytes / disk.totalBytes) * 100))
    : 0;

  const usageClass =
    usagePercent >= 90 ? "danger" : usagePercent >= 75 ? "warn" : "";

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-eyebrow">TSR</span>
          <h1 className="brand-title">{t.common.appName}</h1>
        </div>

        <nav className="nav-list">
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "nav-link active" : "nav-link"}
            >
              <Icon size={15} />
              <span>{label}</span>
            </Link>
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
