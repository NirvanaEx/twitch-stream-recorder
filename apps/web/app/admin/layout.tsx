"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/app-shell";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../providers";

/**
 * Wraps every /admin/* page in the auth-gated AppShell.
 * Anonymous users are redirected to /login; the public site at "/" is
 * unaffected (it has its own layout).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Capture the requested admin URL so we can return there after login.
      const next =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/admin";
      const redirect = `/login?next=${encodeURIComponent(next)}`;
      router.replace(redirect);
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">{t.common.loading}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // While the redirect is in flight render a tiny placeholder so we don't
    // briefly show an unauth'd shell with broken API calls.
    return (
      <div className="page-shell">
        <div className="empty-state">
          {t.admin.needsLogin}{" "}
          <Link href="/login" style={{ color: "var(--accent)" }}>
            {t.auth.login}
          </Link>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
