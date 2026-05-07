"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { useLanguage } from "../../providers";

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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await apiGet<SettingsResponse>("settings");
        if (!cancelled) {
          setForm(response);
          setError(null);
        }
      } catch {
        if (!cancelled) setError(t.errors.apiUnavailable);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
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
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.settings.title}</h2>
          <p className="page-copy">{t.settings.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {saved ? <div className="notice success">{t.settings.saved}</div> : null}

      {loading ? (
        <div className="empty-state">{t.common.loading}</div>
      ) : (
        <section className="panel">
          <div className="panel-body">
            <form className="settings-form" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field-label">{t.settings.retentionDays}</span>
                <input
                  className="input"
                  type="number"
                  value={form.retentionDays}
                  onChange={(event) =>
                    setForm((c) => ({ ...c, retentionDays: Number(event.target.value) }))
                  }
                />
              </label>

              <label className="field">
                <span className="field-label">{t.settings.storageLimitGb}</span>
                <input
                  className="input"
                  type="number"
                  value={form.storageLimitGb}
                  onChange={(event) =>
                    setForm((c) => ({ ...c, storageLimitGb: Number(event.target.value) }))
                  }
                />
              </label>

              <label className="field">
                <span className="field-label">{t.settings.defaultChatOffsetSec}</span>
                <input
                  className="input"
                  type="number"
                  value={form.defaultChatOffsetSec}
                  onChange={(event) =>
                    setForm((c) => ({ ...c, defaultChatOffsetSec: Number(event.target.value) }))
                  }
                />
              </label>

              <div>
                <label className="toggle-row">
                  <div className="toggle-copy">
                    <strong>{t.settings.recordChat}</strong>
                  </div>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={form.recordChat}
                      onChange={(event) =>
                        setForm((c) => ({ ...c, recordChat: event.target.checked }))
                      }
                    />
                    <span className="slider" />
                  </span>
                </label>

                <label className="toggle-row">
                  <div className="toggle-copy">
                    <strong>{t.settings.keepDeletedMessages}</strong>
                  </div>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={form.keepDeletedMessages}
                      onChange={(event) =>
                        setForm((c) => ({ ...c, keepDeletedMessages: event.target.checked }))
                      }
                    />
                    <span className="slider" />
                  </span>
                </label>

                <label className="toggle-row">
                  <div className="toggle-copy">
                    <strong>{t.settings.support7tv}</strong>
                  </div>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={form.support7tv}
                      onChange={(event) =>
                        setForm((c) => ({ ...c, support7tv: event.target.checked }))
                      }
                    />
                    <span className="slider" />
                  </span>
                </label>
              </div>

              <div>
                <button className="btn primary" type="submit">
                  {t.settings.saveSettings}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
