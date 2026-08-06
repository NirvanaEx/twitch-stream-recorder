"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/app-shell";
import { Skeleton, SkeletonText, TableSkeleton } from "../components/Skeleton";
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
    // The whole panel is behind an /auth/me round-trip. Draw the frame it is
    // about to become — sidebar on the left, page on the right — so the wait
    // reads as loading rather than as a blank screen.
    return (
      <div className="app-frame" aria-busy="true">
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-text">
              <Skeleton width="90px" height="10px" />
              <Skeleton width="130px" height="16px" style={{ marginTop: 6 }} />
            </div>
          </div>
          <nav className="nav-list">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} width="100%" height="30px" />
            ))}
          </nav>
        </aside>
        <main className="page-shell">
          <SkeletonText width="180px" height="20px" />
          <SkeletonText width="320px" />
          <div style={{ marginTop: 20 }}>
            <TableSkeleton rows={6} columns={4} />
          </div>
        </main>
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
