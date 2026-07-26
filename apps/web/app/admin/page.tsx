"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "../lib/api";
import { formatDuration } from "../lib/media";
import { useRealtimeRefresh } from "../lib/use-realtime-refresh";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../providers";
import { IconButton, IconLink } from "../components/IconButton";
import { Pagination } from "../components/Pagination";
import { PlatformTag } from "../components/PlatformTag";
import {
  CircleDotIcon,
  FilmIcon,
  PlayIcon,
  PlusIcon,
  RefreshIcon,
  StopIcon,
  TrashIcon,
} from "../components/icons";

type ChannelItem = {
  id: string;
  twitchLogin: string;
  displayName: string | null;
  profileImageUrl: string | null;
  isEnabled: boolean;
  autoRecord: boolean;
  platform: "twitch" | "kick";
  audioOnly: boolean;
  recordVideo: boolean;
  recordAudio: boolean;
  manualStopUntilOffline: boolean;
  preferredQuality: string;
  isLive: boolean;
  currentTitle: string | null;
  currentGameName: string | null;
  liveStartedAt: string | null;
  latestSession: {
    id: string;
    status: string;
    isLive: boolean;
    title: string | null;
    startedAt: string | null;
    endedAt: string | null;
    videoReady: boolean;
    videoUrl: string | null;
  } | null;
};

type DashboardStats = {
  trackedChannels: number;
  liveChannels: number;
  activeRecordings: number;
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

type ChannelsResponse = { items: ChannelItem[] };
type CreateChannelResponse = { item: ChannelItem; warning?: string | null };
type HealthResponse = {
  integrations?: { twitch?: { mode: "api" | "public" } };
};

type Action = "start" | "stop" | "sync" | "delete";

const PAGE_SIZE = 12;

function ChannelStatusBadge({
  channel,
  t,
  now,
}: {
  channel: ChannelItem;
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
  if (channel.manualStopUntilOffline)
    return <span className="badge warn">{t.common.offline}</span>;
  return <span className="badge">{t.common.offline}</span>;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("manage_channels");

  const [items, setItems] = useState<ChannelItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [twitchMode, setTwitchMode] = useState<"api" | "public">("api");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<{ id: string; action: Action } | null>(null);
  const [channelInput, setChannelInput] = useState("");
  const [platform, setPlatform] = useState<"twitch" | "kick">("twitch");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const [channels, dashboard] = await Promise.all([
        apiGet<ChannelsResponse>("channels"),
        apiGet<DashboardStats>("dashboard"),
      ]);
      setItems(channels.items);
      setStats(dashboard);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [t.errors.apiUnavailable]);

  const loadHealth = useCallback(async () => {
    try {
      const response = await apiGet<HealthResponse>("health");
      setTwitchMode(response.integrations?.twitch?.mode ?? "api");
    } catch {
      setTwitchMode("api");
    }
  }, []);

  useEffect(() => {
    void load();
    void loadHealth();
    const refresh = window.setInterval(() => {
      void load();
      void loadHealth();
    }, 15000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(refresh);
      window.clearInterval(tick);
    };
  }, [load, loadHealth]);

  useRealtimeRefresh(load);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const score = (c: ChannelItem) =>
        (c.latestSession?.status === "recording" ? 8 : 0) +
        (c.isLive ? 4 : 0) +
        (c.manualStopUntilOffline ? 2 : 0) +
        (c.latestSession?.videoUrl ? 1 : 0);
      return score(b) - score(a);
    });
  }, [items]);

  const pagedItems = useMemo(
    () => sortedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedItems, page],
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [sortedItems.length, page]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const response = await apiSend<CreateChannelResponse>("channels", "POST", {
        channel: channelInput,
        platform,
      });
      setChannelInput("");
      await load();
      setSuccess(
        response.warning
          ? `${t.channels.added} ${response.warning}`
          : response.item.latestSession?.status === "recording"
            ? `${t.channels.added} ${t.channels.autoRecordingStarted}`
            : t.channels.added,
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setSaving(false);
    }
  }

  async function handleAction(channelId: string, action: Action) {
    if (action === "delete" && !window.confirm(t.archives.deleteConfirm)) return;

    setBusy({ id: channelId, action });
    setSuccess(null);
    setError(null);

    try {
      if (action === "delete") {
        await apiSend(`channels/${channelId}`, "DELETE");
      } else {
        await apiSend(`channels/${channelId}/${action}`, "POST");
      }
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusy(null);
    }
  }

  async function handleToggleChange(
    channel: ChannelItem,
    field: "autoRecord" | "recordVideo" | "recordAudio",
    nextValue: boolean,
  ) {
    // Video and audio are independent, but turning both off would mean
    // "record nothing" — that is what the auto-record switch is for.
    if (
      (field === "recordVideo" && !nextValue && !channel.recordAudio) ||
      (field === "recordAudio" && !nextValue && !channel.recordVideo)
    ) {
      setError(t.channels.trackRequired);
      return;
    }

    const previousItems = items;
    setItems((current) =>
      current.map((c) => (c.id === channel.id ? { ...c, [field]: nextValue } : c)),
    );
    try {
      await apiSend(`channels/${channel.id}`, "PATCH", { [field]: nextValue });
      await load();
    } catch (requestError) {
      setItems(previousItems);
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
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
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {success ? <div className="notice success">{success}</div> : null}
      {canManage && twitchMode === "public" ? (
        <div className="notice warn">
          <strong>{t.channels.twitchSetupTitle}</strong>{" "}
          <a
            href="https://dev.twitch.tv/console/apps"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "underline" }}
          >
            {t.channels.twitchSetupAction}
          </a>
        </div>
      ) : null}

      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-label">{t.dashboard.trackedChannels}</span>
          <span className="stat-value">{stats?.trackedChannels ?? "—"}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">
            <CircleDotIcon size={11} /> {t.dashboard.liveNow}
          </span>
          <span className="stat-value live">{stats?.liveChannels ?? "—"}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{t.dashboard.recordingNow}</span>
          <span className="stat-value recording">{stats?.activeRecordings ?? "—"}</span>
        </div>
      </section>

      {canManage ? (
        <section className="panel">
          <div className="panel-head">
            <h3 className="section-title">{t.channels.addTitle}</h3>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit} className="input-row">
              <select
                value={platform}
                onChange={(event) =>
                  setPlatform(event.target.value === "kick" ? "kick" : "twitch")
                }
                aria-label={t.channels.platformLabel}
                style={{ flex: "none", width: 120 }}
              >
                <option value="twitch">Twitch</option>
                <option value="kick">Kick</option>
              </select>
              <input
                value={channelInput}
                onChange={(event) => setChannelInput(event.target.value)}
                placeholder={
                  platform === "kick" ? t.channels.inputHintKick : t.channels.inputHint
                }
                required
              />
              <button
                type="submit"
                className={`btn primary${saving ? " is-loading" : ""}`}
                disabled={saving}
              >
                <PlusIcon size={14} />
                {t.channels.addButton}
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-head">
          <h3 className="section-title">{t.common.channels}</h3>
        </div>

        {sortedItems.length === 0 ? (
          <div className="empty-state">{t.channels.empty}</div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.common.channel}</th>
                    <th className="col-status">{t.common.status}</th>
                    <th>{t.channels.currentTitle}</th>
                    {canManage ? (
                      <>
                        <th className="col-status">{t.channels.autoRecordLabel}</th>
                        <th className="col-status" title={t.channels.recordVideoHint}>
                          {t.channels.recordVideoLabel}
                        </th>
                        <th className="col-status" title={t.channels.recordAudioHint}>
                          {t.channels.recordAudioLabel}
                        </th>
                      </>
                    ) : null}
                    <th className="col-actions">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedItems.map((channel) => {
                    const isRecording = channel.latestSession?.status === "recording";
                    const canStart = channel.isLive && !isRecording;
                    const displayName = channel.displayName ?? channel.twitchLogin;
                    const busyHere = anyBusy(channel.id);

                    return (
                      <tr key={channel.id}>
                        <td>
                          <div className="cell-channel">
                            <div className="avatar">
                              {channel.profileImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={channel.profileImageUrl} alt={displayName} />
                              ) : (
                                <span>{displayName.slice(0, 1).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="cell-name">
                              <strong>{displayName}</strong>
                              <span>
                                <PlatformTag platform={channel.platform} />@
                                {channel.twitchLogin}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="col-status">
                          <ChannelStatusBadge channel={channel} t={t} now={now} />
                        </td>
                        <td className="col-truncate" title={channel.currentTitle ?? ""}>
                          {channel.currentTitle || "—"}
                        </td>
                        {canManage ? (
                          <>
                            <td className="col-status">
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={channel.autoRecord}
                                  disabled={busyHere}
                                  onChange={(event) =>
                                    void handleToggleChange(
                                      channel,
                                      "autoRecord",
                                      event.target.checked,
                                    )
                                  }
                                />
                                <span className="slider" />
                              </label>
                            </td>
                            <td className="col-status">
                              <label className="switch" title={t.channels.recordVideoHint}>
                                <input
                                  type="checkbox"
                                  checked={channel.recordVideo}
                                  disabled={busyHere}
                                  onChange={(event) =>
                                    void handleToggleChange(
                                      channel,
                                      "recordVideo",
                                      event.target.checked,
                                    )
                                  }
                                />
                                <span className="slider" />
                              </label>
                            </td>
                            <td className="col-status">
                              <label className="switch" title={t.channels.recordAudioHint}>
                                <input
                                  type="checkbox"
                                  checked={channel.recordAudio}
                                  disabled={busyHere}
                                  onChange={(event) =>
                                    void handleToggleChange(
                                      channel,
                                      "recordAudio",
                                      event.target.checked,
                                    )
                                  }
                                />
                                <span className="slider" />
                              </label>
                            </td>
                          </>
                        ) : null}
                        <td className="col-actions">
                          <div className="action-row">
                            {canManage ? (
                              isRecording ? (
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
                              )
                            ) : null}

                            {channel.latestSession?.videoReady &&
                            channel.latestSession?.videoUrl ? (
                              <IconLink
                                href={`/admin/archives/${channel.latestSession.id}`}
                                title={t.common.watch}
                              >
                                <FilmIcon />
                              </IconLink>
                            ) : null}

                            {canManage ? (
                              <>
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
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={sortedItems.length}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3 className="section-title">{t.dashboard.recentArchives}</h3>
          <Link className="btn" href="/admin/archives">
            {t.common.archives}
          </Link>
        </div>

        {stats?.latestArchives.length === 0 ? (
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
                {stats?.latestArchives.map((archive) => (
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
