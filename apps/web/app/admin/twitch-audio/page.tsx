"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { buildTwitchAudioUserscript } from "../../lib/twitch-audio-script";
import { useLanguage } from "../../providers";
import { Pagination } from "../../components/Pagination";
import { PageTabs } from "../../components/PageTabs";
import { PlatformTag } from "../../components/PlatformTag";
import { formatFileSize } from "../../lib/media";
import { TableSkeleton } from "../../components/Skeleton";

type AudioTrack = {
  id: string;
  title: string | null;
  channelLogin: string;
  channelDisplayName: string;
  platform: "twitch" | "kick";
  sizeBytes: string | null;
  storedIn: "local" | "archive" | "telegram";
  startedAt: string | null;
  durationSec: number | null;
  audioOnly: boolean;
  partIndex: number | null;
  partCount: number | null;
  audioUrl: string;
};

const PAGE_SIZE = 15;

type TabId = "tracks" | "install";

type AudioSettings = {
  audioTrackEnabled: boolean;
  audioKeepLocalDays: number;
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<TabId>("tracks");
  const scriptAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const canManage = hasPermission("manage_archives");

  // Load the exact same public artifact Tampermonkey installs and later uses
  // for automatic updates. Keeping one source avoids preview/copy drift. The
  // browser-observed origin travels along so a proxy that mangles the Host
  // header cannot bake a wrong server address into the script.
  useEffect(() => {
    const pageOrigin = window.location.origin;
    setOrigin(pageOrigin);
    void fetch(`/twitch-audio.user.js?origin=${encodeURIComponent(pageOrigin)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (!text.includes("// ==UserScript==")) throw new Error("Invalid userscript");
        setScript(text);
      })
      // The route being unreachable must not kill the copy path — build the
      // same loader locally as a fallback.
      .catch(() => setScript(buildTwitchAudioUserscript(pageOrigin)));
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

  const filteredTracks = useMemo(() => {
    if (!tracks) return [];
    const needle = search.trim().toLowerCase();
    if (!needle) return tracks;
    return tracks.filter(
      (track) =>
        (track.title ?? "").toLowerCase().includes(needle) ||
        track.channelLogin.toLowerCase().includes(needle),
    );
  }, [tracks, search]);

  const pageTracks = filteredTracks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const installUrl = origin
    ? `${origin}/twitch-audio.user.js?origin=${encodeURIComponent(origin)}`
    : "/twitch-audio.user.js";

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
        <PageTabs
          tabs={[
            { id: "tracks" as TabId, label: t.twitchAudio.tabTracks, count: tracks?.length },
            { id: "install" as TabId, label: t.twitchAudio.tabInstall },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === "tracks" ? (
          <>
        <div className="panel-head">
          <p className="section-sub">{t.twitchAudio.tracksSub}</p>
          {settings ? (
            <span className="filter-note">
              {settings.audioKeepLocalDays < 0
                ? t.storage.keepLocalForever
                : settings.audioKeepLocalDays === 0
                  ? t.storage.keepLocalNow
                  : t.storage.keepLocalNote.replace(
                      "{days}",
                      String(settings.audioKeepLocalDays),
                    )}
            </span>
          ) : null}
        </div>

        <div className="filter-row">
          <input
            type="search"
            className="input"
            placeholder={t.twitchAudio.searchPlaceholder}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <span className="filter-spacer" />
          <span className="filter-note">
            {t.storage.foundCount.replace("{count}", String(filteredTracks.length))}
          </span>
        </div>

        {tracks === null ? (
          <TableSkeleton rows={6} columns={4} />
        ) : pageTracks.length === 0 ? (
          <div className="empty-state">{t.twitchAudio.tracksEmpty}</div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.common.title}</th>
                    <th>{t.common.channel}</th>
                    <th className="col-num">{t.twitchAudio.colDate}</th>
                    <th className="col-num">{t.twitchAudio.colDuration}</th>
                    <th className="col-num">{t.common.sizeLabel}</th>
                    <th>{t.twitchAudio.colWhere}</th>
                    <th className="col-actions">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageTracks.map((track) => (
                    <tr key={track.id}>
                      <td className="col-truncate" title={track.title ?? ""}>
                        {track.title || track.channelDisplayName}
                        {track.partCount && track.partCount > 1 ? (
                          <span className="tag" style={{ marginLeft: 6 }}>
                            {track.partIndex}/{track.partCount}
                          </span>
                        ) : null}
                        {track.audioOnly ? (
                          <span className="tag" style={{ marginLeft: 6 }}>
                            {t.twitchAudio.audioOnlyTag}
                          </span>
                        ) : null}
                      </td>
                      <td>
                        <PlatformTag platform={track.platform} />@{track.channelLogin}
                      </td>
                      <td className="col-num">
                        {track.startedAt ? new Date(track.startedAt).toLocaleString() : "—"}
                      </td>
                      <td className="col-num">{formatDuration(track.durationSec)}</td>
                      <td className="col-num">
                        {track.sizeBytes ? formatFileSize(track.sizeBytes) : "—"}
                      </td>
                      <td>
                        <span className={track.storedIn === "telegram" ? "tag" : "tag ok"}>
                          {track.storedIn === "local"
                            ? t.twitchAudio.whereLocal
                            : track.storedIn === "archive"
                              ? t.twitchAudio.whereArchive
                              : t.twitchAudio.whereTelegram}
                        </span>
                      </td>
                      <td className="col-actions">
                        <div className="action-row">
                          <a className="btn" href={track.audioUrl} target="_blank" rel="noreferrer">
                            {t.twitchAudio.listen}
                          </a>
                          {canManage ? (
                            <button
                              type="button"
                              className="btn danger"
                              disabled={busyId === track.id}
                              onClick={() => void handleDelete(track)}
                            >
                              {t.common.delete}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="panel-foot">
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={filteredTracks.length}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
          </>
        ) : null}

        {tab === "install" ? (
          <>
        <div className="panel-body">
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

          <div className="action-row" style={{ marginTop: 12 }}>
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
          </>
        ) : null}
      </section>
    </main>
  );
}
