"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "./lib/api";
import { useRealtimeRefresh } from "./lib/use-realtime-refresh";
import { useLanguage } from "./providers";

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

function getChannelStatus(channel: ChannelCard, t: ReturnType<typeof useLanguage>["t"]) {
  if (channel.latestSession?.status === "recording") {
    return { label: t.common.recording, className: "pill live" };
  }

  if (channel.isLive) {
    return { label: t.common.live, className: "pill warn" };
  }

  return { label: t.common.offline, className: "pill" };
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyChannelId, setBusyChannelId] = useState<string | null>(null);

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
    const timer = window.setInterval(() => {
      void load();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [load]);

  useRealtimeRefresh(load);

  const channels = useMemo(() => {
    return [...(data?.channels ?? [])].sort((left, right) => {
      const leftScore =
        (left.latestSession?.status === "recording" ? 4 : 0) +
        (left.isLive ? 2 : 0) +
        (left.latestSession?.videoUrl ? 1 : 0);
      const rightScore =
        (right.latestSession?.status === "recording" ? 4 : 0) +
        (right.isLive ? 2 : 0) +
        (right.latestSession?.videoUrl ? 1 : 0);

      return rightScore - leftScore;
    });
  }, [data?.channels]);

  async function handleChannelAction(channelId: string, action: "start" | "stop" | "sync") {
    setBusyChannelId(channelId);

    try {
      await apiSend(`channels/${channelId}/${action}`, "POST");
      await load();
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyChannelId(null);
    }
  }

  return (
    <main className="page-shell dashboard-shell">
      <section className="page-header compact-header">
        <div>
          <h2 className="page-title">{t.dashboard.title}</h2>
          <p className="page-copy">{t.dashboard.subtitle}</p>
        </div>
        <Link className="primary-button" href="/channels">
          {t.dashboard.manageChannels}
        </Link>
      </section>

      {error ? <div className="notice error-notice">{error}</div> : null}

      <section className="summary-grid">
        <div className="summary-card">
          <span>{t.dashboard.trackedChannels}</span>
          <strong>{data?.trackedChannels ?? "-"}</strong>
        </div>
        <div className="summary-card">
          <span>{t.dashboard.liveNow}</span>
          <strong>{data?.liveChannels ?? "-"}</strong>
        </div>
        <div className="summary-card">
          <span>{t.dashboard.recordingNow}</span>
          <strong>{data?.activeRecordings ?? "-"}</strong>
        </div>
      </section>

      <section className="section-grid">
        <div className="panel section-card">
          <div className="section-head">
            <h3 className="section-title">{t.dashboard.liveNow}</h3>
            <Link className="text-link" href="/channels">
              {t.dashboard.manageChannels}
            </Link>
          </div>

          <div className="list-grid">
            {channels.length ? (
              channels.map((channel) => {
                const status = getChannelStatus(channel, t);
                const isRecording = channel.latestSession?.status === "recording";
                const isBusy = busyChannelId === channel.id;

                return (
                  <div className="channel-card compact-card" key={channel.id}>
                    <div className="channel-top">
                      <div className="identity-block">
                        <div className="avatar-shell">
                          {channel.profileImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={channel.profileImageUrl} alt={channel.displayName} />
                          ) : (
                            <span>{channel.displayName.slice(0, 1)}</span>
                          )}
                        </div>
                        <div className="identity-copy">
                          <p className="row-title">{channel.displayName}</p>
                          <p className="row-subtitle">@{channel.twitchLogin}</p>
                        </div>
                      </div>
                      <div className={status.className}>{status.label}</div>
                    </div>

                    {channel.currentTitle ? <p className="stream-line">{channel.currentTitle}</p> : null}

                    {channel.manualStopUntilOffline ? (
                      <div className="hint-line">{t.channels.autoPaused}</div>
                    ) : null}

                    {isRecording && !channel.latestSession?.videoReady ? (
                      <div className="hint-line">{t.recording.previewPending}</div>
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
                          onClick={() => void handleChannelAction(channel.id, "stop")}
                        >
                          {t.common.stop}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="primary-button"
                          disabled={isBusy || !channel.isLive}
                          onClick={() => void handleChannelAction(channel.id, "start")}
                        >
                          {t.common.start}
                        </button>
                      )}

                      {channel.latestSession?.videoReady && channel.latestSession?.videoUrl ? (
                        <Link className="secondary-button" href={`/archives/${channel.latestSession.id}`}>
                          {t.common.watch}
                        </Link>
                      ) : null}

                      <button
                        type="button"
                        className="secondary-button"
                        disabled={isBusy}
                        onClick={() => void handleChannelAction(channel.id, "sync")}
                      >
                        {t.common.retry}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">{t.dashboard.noChannels}</div>
            )}
          </div>
        </div>

        <div className="panel section-card">
          <div className="section-head">
            <h3 className="section-title">{t.dashboard.recentArchives}</h3>
            <Link className="text-link" href="/archives">
              {t.common.watch}
            </Link>
          </div>

          <div className="list-grid">
            {data?.latestArchives.length ? (
              data.latestArchives.map((archive) => (
                <div className="archive-card" key={archive.id}>
                  <p className="row-title">{archive.title ?? archive.channelDisplayName}</p>
                  <p className="row-subtitle">@{archive.channelLogin}</p>
                  <div className="meta">{new Date(archive.createdAt).toLocaleString()}</div>
                  <div className="card-actions">
                    {archive.videoReady && archive.videoUrl ? (
                      <>
                        <Link className="secondary-button" href={`/archives/${archive.id}?mode=video`}>
                          {t.common.watchVideo}
                        </Link>
                        <Link className="secondary-button" href={`/archives/${archive.id}?mode=chat`}>
                          {t.common.watchWithChat}
                        </Link>
                      </>
                    ) : (
                      <div className="hint-line">{t.replay.videoPending}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">{t.dashboard.noArchives}</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
