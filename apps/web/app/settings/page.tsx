"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiSend } from "../lib/api";
import { useLanguage } from "../providers";

type SettingsResponse = {
  retentionDays: number;
  storageLimitGb: number;
  recordChat: boolean;
  keepDeletedMessages: boolean;
  support7tv: boolean;
  defaultChatOffsetSec: number;
};

export default function SettingsPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState<SettingsResponse>({
    retentionDays: 30,
    storageLimitGb: 80,
    recordChat: true,
    keepDeletedMessages: true,
    support7tv: true,
    defaultChatOffsetSec: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadSettings() {
    try {
      const response = await apiGet<SettingsResponse>("settings");
      setForm(response);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, [t.errors.apiUnavailable]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await apiSend<SettingsResponse>("settings", "PUT", form);
      setForm(response);
      setSaved(true);
      setError(null);
      window.setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(t.errors.requestFailed);
    }
  }

  return (
    <main className="page-shell dashboard-shell">
      <section className="page-header compact-header">
        <div>
          <div className="eyebrow">{t.common.settings}</div>
          <h2 className="page-title">{t.settings.title}</h2>
          <p className="page-copy">{t.settings.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error-notice">{error}</div> : null}
      {saved ? <div className="notice success-notice">{t.settings.saved}</div> : null}

      <section className="panel section-card">
        {loading ? (
          <div className="meta">{t.common.loading}</div>
        ) : (
          <form className="settings-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>{t.settings.retentionDays}</span>
              <input
                type="number"
                value={form.retentionDays}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    retentionDays: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label className="field">
              <span>{t.settings.storageLimitGb}</span>
              <input
                type="number"
                value={form.storageLimitGb}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    storageLimitGb: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label className="field">
              <span>{t.settings.defaultChatOffsetSec}</span>
              <input
                type="number"
                value={form.defaultChatOffsetSec}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    defaultChatOffsetSec: Number(event.target.value),
                  }))
                }
              />
            </label>

            <div className="toggle-grid">
              <label className="toggle-row">
                <span>{t.settings.recordChat}</span>
                <input
                  type="checkbox"
                  checked={form.recordChat}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, recordChat: event.target.checked }))
                  }
                />
              </label>
              <label className="toggle-row">
                <span>{t.settings.keepDeletedMessages}</span>
                <input
                  type="checkbox"
                  checked={form.keepDeletedMessages}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      keepDeletedMessages: event.target.checked,
                    }))
                  }
                />
              </label>
              <label className="toggle-row">
                <span>{t.settings.support7tv}</span>
                <input
                  type="checkbox"
                  checked={form.support7tv}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, support7tv: event.target.checked }))
                  }
                />
              </label>
            </div>

            <button className="primary-button fit-button" type="submit">
              {t.settings.saveSettings}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

