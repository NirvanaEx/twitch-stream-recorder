"use client";

import { useLanguage } from "../providers";
import type { PlaybackChoice, RecordingStorage, StorageCopy } from "../lib/playback-sources";
import { CloudIcon, SendIcon } from "./icons";

const labels = {
  ru: { saved: "Сохранено", partial: "Частично", saving: "Сохраняется", missing: "Нет копии", unavailable: "Недоступно", error: "Ошибка сохранения" },
  en: { saved: "Saved", partial: "Partial", saving: "Saving", missing: "No copy", unavailable: "Unavailable", error: "Save failed" },
};
function copyLabel(copy: StorageCopy, locale: "ru" | "en") {
  const count = copy.state !== "saved" && copy.savedParts > 0 && copy.totalParts > 1 ? ` ${copy.savedParts}/${copy.totalParts}` : "";
  return labels[locale][copy.state] + count;
}
export function StorageBadges({ storage }: { storage?: RecordingStorage }) {
  const { locale } = useLanguage();
  if (!storage) return null;
  return <div className="recording-storage" aria-label={locale === "ru" ? "Копии записи" : "Recording copies"}>
    {(["drive", "telegram"] as const).map((source) => {
      const copy = storage[source];
      const name = source === "drive" ? "Google Drive" : "Telegram";
      return <span key={source} className={`storage-copy storage-copy--${copy.state}`} title={`${name}: ${copyLabel(copy, locale)}`}>
        {source === "drive" ? <CloudIcon size={13} /> : <SendIcon size={13} />}
        <span>{name}</span><span className="storage-copy__status">{copy.state === "saved" ? "✓ " : copy.state === "missing" || copy.state === "unavailable" ? "− " : "◷ "}{copyLabel(copy, locale)}</span>
      </span>;
    })}
  </div>;
}

export function PlaybackSourceSelect({ storage, choices = [], value, onChange }: {
  storage?: RecordingStorage; choices?: PlaybackChoice[]; value: string; onChange: (source: string) => void;
}) {
  const { locale } = useLanguage();
  if (!storage) return null;
  const label = locale === "ru" ? "Источник видео" : "Video source";
  return <label className="playback-source" title={label}>
    <span>{locale === "ru" ? "Источник" : "Source"}</span>
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {value === "auto" ? <option value="auto">{locale === "ru" ? "Авто (по частям)" : "Auto (by part)"}</option> : null}
      {(["drive", "telegram"] as const).map((source) => <option key={source} value={source} disabled={!choices.some((item) => item.source === source)}>
        {source === "drive" ? "Google Drive" : "Telegram"}{storage[source].available ? "" : ` — ${copyLabel(storage[source], locale)}`}
      </option>)}
      {choices.some((item) => item.source === "local") ? <option value="local">{locale === "ru" ? "Сервер" : "Server"}</option> : null}
    </select>
  </label>;
}
