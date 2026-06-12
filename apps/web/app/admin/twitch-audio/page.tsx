"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "../../lib/api";
import { buildTwitchAudioUserscript } from "../../lib/twitch-audio-script";
import { useLanguage } from "../../providers";

type AudioTrack = {
  id: string;
  title: string | null;
  channelLogin: string;
  channelDisplayName: string;
  startedAt: string | null;
  durationSec: number | null;
  audioUrl: string;
};

type AudioSettings = {
  audioTrackEnabled: boolean;
  audioKeepDays: number;
};

function formatDuration(sec: number | null): string {
  if (!sec || sec <= 0) return "—";
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
}

export default function TwitchAudioPage() {
  const { t } = useLanguage();
  const [origin, setOrigin] = useState("");
  const [tracks, setTracks] = useState<AudioTrack[] | null>(null);
  const [settings, setSettings] = useState<AudioSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const scriptAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // The script bakes in the address the panel is opened from: that is the
  // address the user's browser can already reach.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await apiGet<{ items: AudioTrack[] }>(
          "public/streams/audio-tracks",
        );
        if (!cancelled) {
          setTracks(response.items);
          setError(null);
        }
      } catch {
        if (!cancelled) setError(t.errors.apiUnavailable);
      }

      try {
        const response = await apiGet<AudioSettings>("settings");
        if (!cancelled) setSettings(response);
      } catch {
        // Settings need manage_settings; the hints are optional without it.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [t.errors.apiUnavailable]);

  const script = useMemo(
    () => (origin ? buildTwitchAudioUserscript(origin) : ""),
    [origin],
  );

  async function handleCopy() {
    if (!script) return;

    try {
      await navigator.clipboard.writeText(script);
    } catch {
      // The clipboard API needs a secure context (https); over plain http
      // fall back to selecting the hidden textarea and execCommand.
      const area = scriptAreaRef.current;
      if (!area) return;
      setShowScript(true);
      area.value = script;
      area.focus();
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        return;
      }
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.twitchAudio.title}</h2>
          <p className="page-copy">{t.twitchAudio.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}

      {settings && !settings.audioTrackEnabled ? (
        <div className="notice error">
          {t.twitchAudio.disabledNote}{" "}
          <Link href="/admin/settings" style={{ textDecoration: "underline" }}>
            {t.storage.openSettings}
          </Link>
        </div>
      ) : null}

      <section className="panel">
        <div className="panel-body">
          <h3 className="page-title" style={{ fontSize: 16, marginBottom: 10 }}>
            {t.twitchAudio.howTitle}
          </h3>
          <ol className="page-copy" style={{ paddingLeft: 20, display: "grid", gap: 6 }}>
            <li>{t.twitchAudio.step1}</li>
            <li>{t.twitchAudio.step2}</li>
            <li>{t.twitchAudio.step3}</li>
            <li>{t.twitchAudio.step4}</li>
          </ol>

          <p className="page-copy" style={{ fontSize: 12, marginTop: 10 }}>
            {t.twitchAudio.serverNote.replace("{origin}", origin || "…")}
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn primary" type="button" onClick={() => void handleCopy()}>
              {copied ? t.twitchAudio.copied : t.twitchAudio.copyScript}
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => setShowScript((current) => !current)}
            >
              {showScript ? t.twitchAudio.hideScript : t.twitchAudio.showScript}
            </button>
          </div>

          <textarea
            ref={scriptAreaRef}
            readOnly
            value={script}
            spellCheck={false}
            style={{
              display: showScript ? "block" : "none",
              width: "100%",
              minHeight: 280,
              marginTop: 12,
              background: "var(--bg-input, #0e0e10)",
              color: "inherit",
              border: "1px solid var(--border, #2f2f35)",
              borderRadius: 8,
              padding: 10,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          />
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel-body">
          <h3 className="page-title" style={{ fontSize: 16, marginBottom: 10 }}>
            {t.twitchAudio.tracksTitle}
          </h3>

          {settings && settings.audioKeepDays > 0 ? (
            <p className="page-copy" style={{ fontSize: 12, marginBottom: 10 }}>
              {t.twitchAudio.expireNote.replace("{days}", String(settings.audioKeepDays))}
            </p>
          ) : null}

          {!tracks ? (
            <div className="empty-state">{t.common.loading}</div>
          ) : tracks.length === 0 ? (
            <div className="empty-state">{t.twitchAudio.tracksEmpty}</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.twitchAudio.colChannel}</th>
                    <th>{t.twitchAudio.colTitle}</th>
                    <th className="col-meta">{t.twitchAudio.colDate}</th>
                    <th className="col-meta">{t.twitchAudio.colDuration}</th>
                    <th className="col-actions" />
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track) => (
                    <tr key={track.id}>
                      <td>@{track.channelLogin}</td>
                      <td className="col-truncate" title={track.title ?? ""}>
                        <Link href={`/admin/archives/${track.id}`}>
                          {track.title || track.channelDisplayName}
                        </Link>
                      </td>
                      <td className="col-meta">
                        {track.startedAt
                          ? new Date(track.startedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="col-meta">{formatDuration(track.durationSec)}</td>
                      <td className="col-actions">
                        <a
                          className="btn"
                          href={`${track.audioUrl}?download=1`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t.twitchAudio.download}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
