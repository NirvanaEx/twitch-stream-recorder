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
  telegramEnabled: boolean;
  telegramChatId: string;
  telegramKeepLocalDays: number;
  audioTrackEnabled: boolean;
  audioKeepDays: number;
  telegramApiIdSet: boolean;
  telegramApiHashSet: boolean;
  telegramBotTokenSet: boolean;
};

// Secrets are write-only: the API never returns them, the form sends them
// only when the user typed a new value (empty string = keep stored).
type SettingsForm = SettingsResponse & {
  telegramApiId: string;
  telegramApiHash: string;
  telegramBotToken: string;
};

const EMPTY_SECRETS = {
  telegramApiId: "",
  telegramApiHash: "",
  telegramBotToken: "",
};

type TelegramStatusResponse = {
  enabled: boolean;
  chatId: string;
  keepLocalDays: number;
  tokenConfigured: boolean;
  botUsername: string | null;
  chatTitle: string | null;
  error: string | null;
};

export default function SettingsPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState<SettingsForm>({
    retentionDays: 30,
    storageLimitGb: 80,
    recordChat: true,
    keepDeletedMessages: true,
    support7tv: true,
    defaultChatOffsetSec: 0,
    telegramEnabled: false,
    telegramChatId: "",
    telegramKeepLocalDays: 7,
    audioTrackEnabled: true,
    audioKeepDays: 30,
    telegramApiIdSet: false,
    telegramApiHashSet: false,
    telegramBotTokenSet: false,
    ...EMPTY_SECRETS,
  });
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await apiGet<SettingsResponse>("settings");
        if (!cancelled) {
          setForm({ ...response, ...EMPTY_SECRETS });
          setError(null);
        }
      } catch {
        if (!cancelled) setError(t.errors.apiUnavailable);
      } finally {
        if (!cancelled) setLoading(false);
      }

      try {
        const status = await apiGet<TelegramStatusResponse>("telegram/status");
        if (!cancelled) setTelegramStatus(status);
      } catch {
        // The connection probe is informational only; ignore failures.
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
      setForm({ ...response, ...EMPTY_SECRETS });
      setSaved(true);
      setError(null);
      window.setTimeout(() => setSaved(false), 2000);

      try {
        setTelegramStatus(await apiGet<TelegramStatusResponse>("telegram/status"));
      } catch {
        // Informational probe only.
      }
    } catch {
      setError(t.errors.requestFailed);
    }
  }

  function renderTelegramConnection() {
    if (!telegramStatus) return null;

    if (!telegramStatus.tokenConfigured) {
      return <p className="page-copy">{t.settings.telegramTokenMissing}</p>;
    }

    return (
      <p className="page-copy">
        {t.settings.telegramConnection}:{" "}
        {telegramStatus.botUsername
          ? `${t.settings.telegramBot} @${telegramStatus.botUsername}`
          : "—"}
        {telegramStatus.chatTitle
          ? ` → ${t.settings.telegramChat} «${telegramStatus.chatTitle}»`
          : ""}
        {telegramStatus.error ? ` (${telegramStatus.error})` : ""}
      </p>
    );
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
                <h3 className="page-title" style={{ fontSize: 16, marginBottom: 8 }}>
                  {t.settings.telegramTitle}
                </h3>

                {renderTelegramConnection()}

                <label className="toggle-row">
                  <div className="toggle-copy">
                    <strong>{t.settings.telegramEnabled}</strong>
                  </div>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={form.telegramEnabled}
                      onChange={(event) =>
                        setForm((c) => ({ ...c, telegramEnabled: event.target.checked }))
                      }
                    />
                    <span className="slider" />
                  </span>
                </label>

                <label className="field">
                  <span className="field-label">{t.settings.telegramApiId}</span>
                  <input
                    className="input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={form.telegramApiIdSet ? t.settings.telegramSecretSet : "12345678"}
                    value={form.telegramApiId}
                    onChange={(event) =>
                      setForm((c) => ({ ...c, telegramApiId: event.target.value.trim() }))
                    }
                  />
                </label>

                <label className="field">
                  <span className="field-label">{t.settings.telegramApiHash}</span>
                  <input
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    placeholder={form.telegramApiHashSet ? t.settings.telegramSecretSet : ""}
                    value={form.telegramApiHash}
                    onChange={(event) =>
                      setForm((c) => ({ ...c, telegramApiHash: event.target.value.trim() }))
                    }
                  />
                </label>

                <label className="field">
                  <span className="field-label">{t.settings.telegramBotToken}</span>
                  <input
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    placeholder={form.telegramBotTokenSet ? t.settings.telegramSecretSet : ""}
                    value={form.telegramBotToken}
                    onChange={(event) =>
                      setForm((c) => ({ ...c, telegramBotToken: event.target.value.trim() }))
                    }
                  />
                  <span className="page-copy" style={{ fontSize: 12 }}>
                    {t.settings.telegramSecretsHint}
                  </span>
                </label>

                <label className="field">
                  <span className="field-label">{t.settings.telegramChatId}</span>
                  <input
                    className="input"
                    type="text"
                    placeholder="-1001234567890"
                    value={form.telegramChatId}
                    onChange={(event) =>
                      setForm((c) => ({ ...c, telegramChatId: event.target.value.trim() }))
                    }
                  />
                  <span className="page-copy" style={{ fontSize: 12 }}>
                    {t.settings.telegramChatIdHint}
                  </span>
                </label>

                <label className="field">
                  <span className="field-label">{t.settings.telegramKeepLocalDays}</span>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    value={form.telegramKeepLocalDays}
                    onChange={(event) =>
                      setForm((c) => ({
                        ...c,
                        telegramKeepLocalDays: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              </div>

              <div>
                <h3 className="page-title" style={{ fontSize: 16, marginBottom: 8 }}>
                  {t.settings.audioTitle}
                </h3>
                <p className="page-copy" style={{ fontSize: 12 }}>
                  {t.settings.audioHint}
                </p>

                <label className="toggle-row">
                  <div className="toggle-copy">
                    <strong>{t.settings.audioTrackEnabled}</strong>
                  </div>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={form.audioTrackEnabled}
                      onChange={(event) =>
                        setForm((c) => ({ ...c, audioTrackEnabled: event.target.checked }))
                      }
                    />
                    <span className="slider" />
                  </span>
                </label>

                <label className="field">
                  <span className="field-label">{t.settings.audioKeepDays}</span>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    value={form.audioKeepDays}
                    onChange={(event) =>
                      setForm((c) => ({ ...c, audioKeepDays: Number(event.target.value) }))
                    }
                  />
                  <span className="page-copy" style={{ fontSize: 12 }}>
                    {t.settings.audioKeepDaysHint}
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
