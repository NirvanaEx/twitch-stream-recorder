"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../providers";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();

  const navItems = [
    { href: "/", label: t.common.dashboard },
    { href: "/channels", label: t.common.channels },
    { href: "/recording", label: t.common.recordingPage },
    { href: "/archives", label: t.common.archives },
    { href: "/settings", label: t.common.settings },
  ];

  return (
    <div className="app-frame">
      <aside className="sidebar panel">
        <div className="brand-block">
          <div className="eyebrow">TSR</div>
          <h1 className="brand-title">{t.common.appName}</h1>
          <p className="brand-copy">{t.dashboard.subtitle}</p>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "nav-link active" : "nav-link"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="lang-box">
          <div className="meta">{t.common.language}</div>
          <div className="offset-controls">
            <button
              type="button"
              className={locale === "ru" ? "active-button" : ""}
              onClick={() => setLocale("ru")}
            >
              RU
            </button>
            <button
              type="button"
              className={locale === "en" ? "active-button" : ""}
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
