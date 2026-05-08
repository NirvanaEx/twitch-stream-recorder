"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "../lib/api";
import { formatDuration } from "../lib/media";
import { useRealtimeRefresh } from "../lib/use-realtime-refresh";
import { useLanguage } from "../providers";
import { IconButton, IconLink } from "../components/IconButton";
import {
  CircleDotIcon,
  FilmIcon,
  PlayIcon,
  PlusIcon,
  RefreshIcon,
  StopIcon,
  TrashIcon,
} from "../components/icons";

type ChannelCard = {
  id: string;
  twitchLogin: string;
  displayName: string;
  profileImageUrl: string | null;
  isLive: boolean;
  manualStopUntilOffline: boolean;
  currentTitle: string | null;
  currentGameName: string | null;
  latestSession: {
    id: string;
    status: string;
    videoReady: boolean;
    videoUrl: string | null;
    startedAt?: string | null;
  } | null;
};

type DashboardResponse = {
  trackedChannels: number;
  liveChannels: number;
  activeRecordings: number;
  channels: ChannelCard[];
  latestArchives: Array<{
    id: string;
    channelLogin: string;
    channelDisplayName: string;
    title: string | null;
    status: string;
    videoReady: boolean;
    videoUrl: string | null;
    createdAt: string;
  }>;
};

function ChannelStatusBadge({
  channel,
  t,
  now,
}: {
  channel: ChannelCard;
  t: ReturnType<typeof useLanguage>["t"];
  now: number;
}) {
  if (channel.latestSession?.status === "recording") {
    return (
      <span className="badge recording">
        {t.common.recording}
        {channel.latestSession.startedAt
          ? ` · ${formatDuration(channel.latestSession.startedAt, now)}`
          : ""}
      </span>
    );
  }
  if (channel.isLive) return <span className="badge live">{t.common.live}</span>;
  return <span className="badge">{t.common.offline}</span>;
}

type Action = "start" | "stop" | "sync" | "delete";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<{ id: string; action: Action } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const response = await apiGet<DashboardResponse>("dashboard");
      setData(response);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [t.errors.apiUnavailable]);

  useEffect(() => {
    void load();
    const refresh = window.setInterval(() => void load(), 15000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(refresh);
      window.clearInterval(tick);
    };
  }, [load]);

  useRealtimeRefresh(load);

  const channels = useMemo(() => {
    return [...(data?.channels ?? [])].sort((a, b) => {
      const score = (c: ChannelCard) =>
        (c.latestSession?.status === "recording" ? 4 : 0) +
        (c.isLive ? 2 : 0) +
        (c.latestSession?.videoUrl ? 1 : 0);
      return score(b) - score(a);
    });
  }, [data?.channels]);

  async function handleAction(channelId: string, action: Action) {
    if (action === "delete" && !window.confirm(t.archives.deleteConfirm)) return;

    setBusy({ id: channelId, action });
    try {
      if (action === "delete") {
        await apiSend(`channels/${channelId}`, "DELETE");
      } else {
        await apiSend(`channels/${channelId}/${action}`, "POST");
      }
      await load();
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusy(null);
    }
  }

  const isBusy = (id: string, action: Action) => busy?.id === id && busy.action === action;
  const anyBusy = (id: string) => busy?.id === id;

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.dashboard.title}</h2>
          <p className="page-copy">{t.dashboard.subtitle}</p>
        </div>
        <Link className="btn primary" href="/admin/channels">
          <PlusIcon size={14} />
          {t.dashboard.manageChannels}
        </Link>
      </section>

      {error ? <div className="notice error">{error}</div> : null}

      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-label">{t.dashboard.trackedChannels}</span>
          <span className="stat-value">{data?.trackedChannels ?? "—"}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">
            <CircleDotIcon size={11} /> {t.dashboard.liveNow}
          </span>
          <span className="stat-value live">{data?.liveChannels ?? "—"}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{t.dashboard.recordingNow}</span>
          <span className="stat-value recording">{data?.activeRecordings ?? "—"}</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3 className="section-title">{t.dashboard.liveNow}</h3>
          <Link className="btn" href="/admin/channels">
            {t.dashboard.manageChannels}
          </Link>
        </div>

        {channels.length === 0 ? (
          <div className="empty-state">{t.dashboard.noChannels}</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t.common.channel}</th>
                  <th className="col-status">{t.common.status}</th>
                  <th>{t.common.title}</th>
                  <th className="col-actions">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((channel) => {
                  const isRecording = channel.latestSession?.status === "recording";
                  const canStart = channel.isLive && !isRecording;
                  const busyHere = anyBusy(channel.id);

                  return (
                    <tr key={channel.id}>
                      <td>
                        <div className="cell-channel">
                          <div className="avatar">
                            {channel.profileImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={channel.profileImageUrl} alt={channel.displayName} />
                            ) : (
                              <span>{channel.displayName.slice(0, 1).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="cell-name">
                            <strong>{channel.displayName}</strong>
                            <span>@{channel.twitchLogin}</span>
                          </div>
                        </div>
                      </td>
                      <td className="col-status">
                        <ChannelStatusBadge channel={channel} t={t} now={now} />
                      </td>
                      <td className="col-truncate" title={channel.currentTitle ?? ""}>
                        {channel.currentTitle || "—"}
                      </td>
                      <td className="col-actions">
                        <div className="action-row">
                          {isRecording ? (
                            <IconButton
                              title={t.common.stop}
                              className="stop"
                              loading={isBusy(channel.id, "stop")}
                              disabled={busyHere}
                              onClick={() => void handleAction(channel.id, "stop")}
                            >
                              <StopIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              title={t.common.start}
                              className="live"
                              loading={isBusy(channel.id, "start")}
                              disabled={busyHere || !canStart}
                              onClick={() => void handleAction(channel.id, "start")}
                            >
                              <PlayIcon />
                            </IconButton>
                          )}

                          {channel.latestSession?.videoReady && channel.latestSession?.videoUrl ? (
                            <IconLink
                              href={`/admin/archives/${channel.latestSession.id}`}
                              title={t.common.watch}
                            >
                              <FilmIcon />
                            </IconLink>
                          ) : null}

                          <IconButton
                            title={t.common.retry}
                            loading={isBusy(channel.id, "sync")}
                            disabled={busyHere}
                            onClick={() => void handleAction(channel.id, "sync")}
                          >
                            <RefreshIcon />
                          </IconButton>

                          <IconButton
                            title={t.common.delete}
                            className="danger"
                            loading={isBusy(channel.id, "delete")}
                            disabled={busyHere}
                            onClick={() => void handleAction(channel.id, "delete")}
                          >
                            <TrashIcon />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3 className="section-title">{t.dashboard.recentArchives}</h3>
          <Link className="btn" href="/admin/archives">
            {t.common.archives}
          </Link>
        </div>

        {data?.latestArchives.length === 0 ? (
          <div className="empty-state">{t.dashboard.noArchives}</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t.common.channel}</th>
                  <th>{t.common.title}</th>
                  <th className="col-meta">{t.archives.recordedAt}</th>
                  <th className="col-actions">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {data?.latestArchives.map((archive) => (
                  <tr key={archive.id}>
                    <td>@{archive.channelLogin}</td>
                    <td className="col-truncate" title={archive.title ?? ""}>
                      {archive.title || archive.channelDisplayName}
                    </td>
                    <td className="col-meta">{new Date(archive.createdAt).toLocaleString()}</td>
                    <td className="col-actions">
                      <div className="action-row">
                        {archive.videoReady && archive.videoUrl ? (
                          <IconLink
                            href={`/admin/archives/${archive.id}`}
                            title={t.common.watch}
                          >
                            <FilmIcon />
                          </IconLink>
                        ) : (
                          <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
                            {t.replay.videoPending}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
