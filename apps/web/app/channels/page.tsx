"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "../lib/api";
import { useRealtimeRefresh } from "../lib/use-realtime-refresh";
import { useLanguage } from "../providers";

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

type ChannelsResponse = {
  items: ChannelItem[];
};

type CreateChannelResponse = {
  item: ChannelItem;
  warning?: string | null;
};

type HealthResponse = {
  integrations?: {
    twitch?: {
      apiReady: boolean;
      mode: "api" | "public";
      missing: string[];
    };
  };
};

type ChannelAction = "start" | "stop" | "delete" | "sync" | "toggle-auto-record";

function getStatus(
  channel: ChannelItem,
  t: ReturnType<typeof useLanguage>["t"],
): { label: string; className: string } {
  if (channel.latestSession?.status === "recording") {
    return { label: t.common.recording, className: "pill live" };
  }

  if (channel.isLive) {
    return { label: t.common.live, className: "pill warn" };
  }

  return { label: t.common.offline, className: "pill" };
}

export default function ChannelsPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ChannelItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [twitchMode, setTwitchMode] = useState<"api" | "public">("api");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyChannelAction, setBusyChannelAction] = useState<{
    channelId: string;
    action: ChannelAction;
  } | null>(null);
  const [channelInput, setChannelInput] = useState("");

  const loadChannels = useCallback(async (mode: "initial" | "refresh" | "silent" = "silent") => {
    if (mode === "initial") {
      setInitialLoading(true);
    }

    try {
      const response = await apiGet<ChannelsResponse>("channels");
      setItems(response.items);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    } finally {
      if (mode === "initial") {
        setInitialLoading(false);
      }
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
    void loadChannels("initial");
    void loadHealth();
    const timer = window.setInterval(() => {
      void loadChannels("silent");
      void loadHealth();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [loadChannels, loadHealth]);

  useRealtimeRefresh(() => loadChannels("silent"));

  const sortedItems = useMemo(() => {
    return [...items].sort((left, right) => {
      const leftScore =
        (left.latestSession?.status === "recording" ? 8 : 0) +
        (left.isLive ? 4 : 0) +
        (left.manualStopUntilOffline ? 2 : 0) +
        (left.latestSession?.videoUrl ? 1 : 0);
      const rightScore =
        (right.latestSession?.status === "recording" ? 8 : 0) +
        (right.isLive ? 4 : 0) +
        (right.manualStopUntilOffline ? 2 : 0) +
        (right.latestSession?.videoUrl ? 1 : 0);

      return rightScore - leftScore;
    });
  }, [items]);

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
      await loadChannels("silent");
      setError(null);

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

  async function handleAction(
    channelId: string,
    action: "start" | "stop" | "delete" | "sync",
  ) {
    setBusyChannelAction({ channelId, action });
    setSuccess(null);
    setError(null);

    try {
      if (action === "delete") {
        await apiSend(`channels/${channelId}`, "DELETE");
      } else {
        await apiSend(`channels/${channelId}/${action}`, "POST");
      }

      await loadChannels("silent");
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyChannelAction(null);
    }
  }

  async function handleAutoRecordChange(channel: ChannelItem, nextValue: boolean) {
    const previousItems = items;

    setBusyChannelAction({
      channelId: channel.id,
      action: "toggle-auto-record",
    });
    setSuccess(null);
    setError(null);
    setItems((currentItems) =>
      currentItems.map((currentChannel) =>
        currentChannel.id === channel.id
          ? {
              ...currentChannel,
              autoRecord: nextValue,
            }
          : currentChannel,
      ),
    );

    try {
      await apiSend(`channels/${channel.id}`, "PATCH", {
        autoRecord: nextValue,
      });
      await loadChannels("silent");
    } catch (requestError) {
      setItems(previousItems);
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyChannelAction(null);
    }
  }

  function getActionLabel(action: ChannelAction) {
    switch (action) {
      case "start":
        return t.common.start;
      case "stop":
        return t.common.stop;
      case "delete":
        return t.common.delete;
      case "sync":
        return t.common.retry;
      case "toggle-auto-record":
        return t.channels.autoRecordLabel;
      default:
        return t.common.loading;
    }
  }

  return (
    <main className="page-shell dashboard-shell">
      <section className="page-header">
        <h2 className="page-title">{t.channels.title}</h2>
        <p className="page-copy">{t.channels.subtitle}</p>
      </section>

      {error ? <div className="notice error-notice">{error}</div> : null}
      {success ? <div className="notice success-notice">{success}</div> : null}

      <section className="panel section-card">
        <div className="section-head">
          <h3 className="section-title">{t.channels.addTitle}</h3>
        </div>

        {initialLoading ? <div className="notice info-notice">{t.common.loading}</div> : null}

        {twitchMode === "public" ? (
          <div className="notice warn-notice">
            <strong>{t.channels.twitchSetupTitle}</strong>
            <p>{t.channels.twitchSetupCopy}</p>
            <p>{t.channels.twitchSetupRestart}</p>
            <a
              className="text-link"
              href="https://dev.twitch.tv/console/apps"
              rel="noreferrer"
              target="_blank"
            >
              {t.channels.twitchSetupAction}
            </a>
          </div>
        ) : null}

        <form className="add-channel-form" onSubmit={handleSubmit}>
          <label className="field add-channel-field">
            <span>{t.channels.inputLabel}</span>
            <input
              value={channelInput}
              onChange={(event) => setChannelInput(event.target.value)}
              placeholder={t.channels.inputHint}
              required
            />
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? t.common.loading : t.channels.addButton}
          </button>
        </form>

        <div className="hint-line">{t.channels.refreshHint}</div>
      </section>

      <section className="list-grid">
        {sortedItems.length ? (
          sortedItems.map((channel) => {
            const status = getStatus(channel, t);
            const isRecording = channel.latestSession?.status === "recording";
            const busyAction =
              busyChannelAction?.channelId === channel.id ? busyChannelAction.action : null;
            const isBusy = Boolean(busyAction);
            const displayName = channel.displayName ?? channel.twitchLogin;

            return (
              <div className="panel channel-ops-card" key={channel.id}>
                <div className="channel-top">
                  <div className="identity-block">
                    <div className="avatar-shell">
                      {channel.profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={channel.profileImageUrl} alt={displayName} />
                      ) : (
                        <span>{displayName.slice(0, 1)}</span>
                      )}
                    </div>
                    <div className="identity-copy">
                      <p className="row-title">{displayName}</p>
                      <p className="row-subtitle">@{channel.twitchLogin}</p>
                    </div>
                  </div>
                  <div className={status.className}>{status.label}</div>
                </div>

                {channel.currentTitle ? (
                  <div className="detail-block">
                    <span>{t.channels.currentTitle}</span>
                    <strong>{channel.currentTitle}</strong>
                  </div>
                ) : null}

                <div className="channel-meta-row">
                  {channel.currentGameName ? (
                    <div className="detail-inline">
                      <span>{t.channels.currentGame}</span>
                      <strong>{channel.currentGameName}</strong>
                    </div>
                  ) : null}

                  {channel.liveStartedAt ? (
                    <div className="detail-inline">
                      <span>{t.channels.liveSince}</span>
                      <strong>{new Date(channel.liveStartedAt).toLocaleString()}</strong>
                    </div>
                  ) : null}
                </div>

                <label className="toggle-row channel-toggle-row">
                  <div className="channel-toggle-copy">
                    <span>{t.channels.autoRecordLabel}</span>
                    <p className="hint-line">
                      {busyAction === "toggle-auto-record"
                        ? t.common.loading
                        : channel.autoRecord
                          ? t.common.enabled
                          : t.common.disabled}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={channel.autoRecord}
                    disabled={isBusy}
                    onChange={(event) =>
                      void handleAutoRecordChange(channel, event.target.checked)
                    }
                  />
                </label>

                {channel.manualStopUntilOffline ? (
                  <div className="hint-line">{t.channels.autoPaused}</div>
                ) : null}

                {channel.autoRecord && !channel.isLive && !channel.manualStopUntilOffline ? (
                  <div className="hint-line">{t.channels.autoRecordWaiting}</div>
                ) : null}

                {channel.latestSession ? (
                  <div className="detail-inline">
                    <span>{t.channels.lastArchive}</span>
                    <strong>{channel.latestSession.title ?? displayName}</strong>
                  </div>
                ) : null}

                {isRecording && !channel.latestSession?.videoReady ? (
                  <div className="hint-line">{t.recording.previewPending}</div>
                ) : null}

                {busyAction ? (
                  <div className="channel-progress">
                    <span className="progress-spinner" aria-hidden="true" />
                    <span>{`${getActionLabel(busyAction)}...`}</span>
                  </div>
                ) : null}

                <div className="card-actions">
                  {isRecording ? (
                    <Link className="secondary-button" href="/recording">
                      {t.common.recordingPage}
                    </Link>
                  ) : null}

                  {isRecording ? (
                    <button
                      type="button"
                      className="danger-button"
                      disabled={isBusy}
                      onClick={() => void handleAction(channel.id, "stop")}
                    >
                      {busyAction === "stop" ? `${t.common.stop}...` : t.common.stop}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="primary-button"
                      disabled={isBusy || !channel.isLive}
                      onClick={() => void handleAction(channel.id, "start")}
                    >
                      {busyAction === "start" ? `${t.common.start}...` : t.common.start}
                    </button>
                  )}

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={isBusy}
                    onClick={() => void handleAction(channel.id, "sync")}
                  >
                    {busyAction === "sync" ? `${t.common.retry}...` : t.common.retry}
                  </button>

                  {channel.latestSession?.videoReady && channel.latestSession?.videoUrl ? (
                    <>
                      <Link className="secondary-button" href={`/archives/${channel.latestSession.id}?mode=video`}>
                        {t.common.watchVideo}
                      </Link>
                      <Link className="secondary-button" href={`/archives/${channel.latestSession.id}?mode=chat`}>
                        {t.common.watchWithChat}
                      </Link>
                    </>
                  ) : null}

                  <button
                    type="button"
                    className="ghost-danger-button"
                    disabled={isBusy}
                    onClick={() => void handleAction(channel.id, "delete")}
                  >
                    {busyAction === "delete" ? `${t.common.delete}...` : t.common.delete}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">{initialLoading ? t.common.loading : t.channels.empty}</div>
        )}
      </section>
    </main>
  );
}
