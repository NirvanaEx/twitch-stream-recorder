"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../providers";

function safeNext(raw: string | null): string {
  // Only allow same-site, /admin* destinations to avoid open-redirect.
  if (!raw) return "/admin";
  if (!raw.startsWith("/")) return "/admin";
  if (raw.startsWith("//")) return "/admin";
  if (!raw.startsWith("/admin")) return "/admin";
  return raw;
}

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLanguage();
  const { login, isAuthenticated } = useAuth();

  const next = safeNext(params.get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(next);
    }
  }, [isAuthenticated, next, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.invalid);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="brand-eyebrow">TSR</span>
          <h1 className="brand-title">{t.auth.loginTitle}</h1>
          <p className="page-copy" style={{ margin: "6px 0 0" }}>
            {t.auth.loginSubtitle}
          </p>
        </div>

        <label className="form-row">
          <span className="form-label">{t.auth.usernameLabel}</span>
          <input
            type="text"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="form-row">
          <span className="form-label">{t.auth.passwordLabel}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error ? <div className="notice error">{error}</div> : null}

        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? t.auth.submitting : t.auth.submitButton}
        </button>

        <Link href="/" className="auth-back">
          {t.auth.backToPublic}
        </Link>
      </form>
    </main>
  );
}

export default function LoginPage() {
  // useSearchParams must be inside Suspense in the App Router.
  return (
    <Suspense fallback={<main className="auth-shell"><div className="auth-card" /></main>}>
      <LoginContent />
    </Suspense>
  );
}
