"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "../lib/api";
import { formatDuration } from "../lib/media";
import { useRealtimeRefresh } from "../lib/use-realtime-refresh";
import { useLanguage } from "../providers";
import { IconButton, IconLink } from "../components/IconButton";
import { Pagination } from "../components/Pagination";
import {
  FilmIcon,
  MessageIcon,
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

type ChannelsResponse = { items: ChannelItem[] };
type CreateChannelResponse = { item: ChannelItem; warning?: string | null };
type HealthResponse = {
  integrations?: { twitch?: { mode: "api" | "public" } };
};

type Action = "start" | "stop" | "delete" | "sync";

const PAGE_SIZE = 12;

function StatusBadge({
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

export default function ChannelsPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ChannelItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [twitchMode, setTwitchMode] = useState<"api" | "public">("api");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<{ id: string; action: Action } | null>(null);
  const [channelInput, setChannelInput] = useState("");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());

  const loadChannels = useCallback(async () => {
    try {
      const response = await apiGet<ChannelsResponse>("channels");
      setItems(response.items);
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
    void loadChannels();
    void loadHealth();
    const refresh = window.setInterval(() => {
      void loadChannels();
      void loadHealth();
    }, 15000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(refresh);
      window.clearInterval(tick);
    };
  }, [loadChannels, loadHealth]);

  useRealtimeRefresh(loadChannels);

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
      });
      setChannelInput("");
      await loadChannels();
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
      await loadChannels();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusy(null);
    }
  }

  async function handleAutoRecordChange(channel: ChannelItem, nextValue: boolean) {
    const previousItems = items;
    setItems((current) =>
      current.map((c) => (c.id === channel.id ? { ...c, autoRecord: nextValue } : c)),
    );
    try {
      await apiSend(`channels/${channel.id}`, "PATCH", { autoRecord: nextValue });
      await loadChannels();
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
          <h2 className="page-title">{t.channels.title}</h2>
          <p className="page-copy">{t.channels.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {success ? <div className="notice success">{success}</div> : null}
      {twitchMode === "public" ? (
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

      <section className="panel">
        <div className="panel-head">
          <h3 className="section-title">{t.channels.addTitle}</h3>
        </div>
        <div className="panel-body">
          <form onSubmit={handleSubmit} className="input-row">
            <input
              value={channelInput}
              onChange={(event) => setChannelInput(event.target.value)}
              placeholder={t.channels.inputHint}
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
                    <th className="col-status">{t.channels.autoRecordLabel}</th>
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
                              <span>@{channel.twitchLogin}</span>
                            </div>
                          </div>
                        </td>
                        <td className="col-status">
                          <StatusBadge channel={channel} t={t} now={now} />
                        </td>
                        <td className="col-truncate" title={channel.currentTitle ?? ""}>
                          {channel.currentTitle || "—"}
                        </td>
                        <td className="col-status">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={channel.autoRecord}
                              disabled={busyHere}
                              onChange={(event) =>
                                void handleAutoRecordChange(channel, event.target.checked)
                              }
                            />
                            <span className="slider" />
                          </label>
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

                            {channel.latestSession?.videoReady &&
                            channel.latestSession?.videoUrl ? (
                              <>
                                <IconLink
                                  href={`/archives/${channel.latestSession.id}?mode=video`}
                                  title={t.common.watchVideo}
                                >
                                  <FilmIcon />
                                </IconLink>
                                <IconLink
                                  href={`/archives/${channel.latestSession.id}?mode=chat`}
                                  title={t.common.watchWithChat}
                                >
                                  <MessageIcon />
                                </IconLink>
                              </>
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

            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={sortedItems.length}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </main>
  );
}
