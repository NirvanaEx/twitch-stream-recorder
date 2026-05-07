"use client";

import { useState } from "react";
import { apiSend } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../providers";

export default function AdminAccountPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    if (newPassword !== confirmPassword) {
      setError(t.account.mismatch);
      setNotice(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await apiSend("auth/change-password", "POST", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice(t.account.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.account.title}</h2>
          <p className="page-copy">{t.account.subtitle}</p>
        </div>
      </section>

      <section className="panel" style={{ maxWidth: 480 }}>
        {user ? (
          <div style={{ marginBottom: 16, color: "var(--text-dim)" }}>
            <strong>{user.username}</strong>{" "}
            {user.isSuperadmin ? (
              <span className="badge live" style={{ marginLeft: 6 }}>
                {t.auth.youAreSuperadmin}
              </span>
            ) : user.role ? (
              <span className="badge" style={{ marginLeft: 6 }}>
                {user.role.name}
              </span>
            ) : null}
          </div>
        ) : null}

        {error ? <div className="notice error">{error}</div> : null}
        {notice ? <div className="notice success">{notice}</div> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-row">
            <span className="form-label">{t.account.currentPasswordLabel}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label className="form-row">
            <span className="form-label">{t.account.newPasswordLabel}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={4}
              required
            />
          </label>
          <label className="form-row">
            <span className="form-label">{t.account.confirmPasswordLabel}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={4}
              required
            />
          </label>
          <div className="form-row form-row-actions">
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? t.common.loading : t.account.saveButton}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
