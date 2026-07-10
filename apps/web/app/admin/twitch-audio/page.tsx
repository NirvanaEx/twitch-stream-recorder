"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../providers";

type AudioTrack = {
  id: string;
  title: string | null;
  channelLogin: string;
  channelDisplayName: string;
  startedAt: string | null;
  durationSec: number | null;
  audioOnly: boolean;
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
  const { hasPermission } = useAuth();
  const [origin, setOrigin] = useState("");
  const [script, setScript] = useState("");
  const [tracks, setTracks] = useState<AudioTrack[] | null>(null);
  const [settings, setSettings] = useState<AudioSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const scriptAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const canManage = hasPermission("manage_archives");

  // Load the exact same public artifact Tampermonkey installs and later uses
  // for automatic updates. Keeping one source avoids preview/copy drift.
  useEffect(() => {
    setOrigin(window.location.origin);
    void fetch("/twitch-audio.user.js", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (!text.includes("// ==UserScript==")) throw new Error("Invalid userscript");
        setScript(text);
      })
      .catch(() => setScript(""));
  }, []);

  const loadTracks = async () => {
    try {
      const response = await apiGet<{ items: AudioTrack[] }>("public/streams/audio-tracks");
      setTracks(response.items);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  };

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

  async function handleDelete(track: AudioTrack) {
    const confirmText = track.audioOnly
      ? t.twitchAudio.deleteConfirmAudioOnly
      : t.twitchAudio.deleteConfirm;
    if (!window.confirm(confirmText)) return;

    setBusyId(track.id);
    setNotice(null);
    setError(null);
    try {
      await apiSend(`archives/${track.id}/audio`, "DELETE");
      await loadTracks();
      setNotice(t.twitchAudio.deleted);
      window.setTimeout(() => setNotice(null), 2500);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyId(null);
    }
  }

  const installUrl = origin ? `${origin}/twitch-audio.user.js` : "/twitch-audio.user.js";

  // Copy via a throwaway textarea. navigator.clipboard only exists in secure
  // contexts (https), and this panel often runs over plain http, so the
  // execCommand path must work on its own — independent of whether the script
  // preview is currently shown.
  function copyViaTextarea(text: string): boolean {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  async function handleCopy() {
    if (!script) return;

    let ok = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(script);
        ok = true;
      } catch {
        ok = false;
      }
    }

    if (!ok) {
      ok = copyViaTextarea(script);
    }

    if (!ok) {
      // As a last resort, reveal the script so the user can select it by hand.
      setShowScript(true);
      setError(t.twitchAudio.copyFailed);
      return;
    }

    setError(null);
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

      {notice ? <div className="notice success">{notice}</div> : null}

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
          <p className="page-copy" style={{ fontSize: 12, marginTop: 6 }}>
            {t.twitchAudio.updateNote}
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <a className="btn primary" href={installUrl}>
              {t.twitchAudio.installScript}
            </a>
            <button
              className="btn"
              type="button"
              disabled={!script}
              onClick={() => void handleCopy()}
            >
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
                      <td className="col-meta">
                        {track.audioOnly ? "🎧 " : ""}
                        {formatDuration(track.durationSec)}
                      </td>
                      <td className="col-actions">
                        <div className="action-row">
                          <a
                            className="btn"
                            href={`${track.audioUrl}?download=1`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t.twitchAudio.download}
                          </a>
                          {canManage ? (
                            <button
                              className="btn danger"
                              type="button"
                              disabled={busyId === track.id}
                              onClick={() => void handleDelete(track)}
                            >
                              {t.twitchAudio.deleteAudio}
                            </button>
                          ) : null}
                        </div>
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
