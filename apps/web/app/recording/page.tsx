"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../lib/api";
import { buildMediaUrl, formatDuration, formatFileSize } from "../lib/media";
import { useRealtimeRefresh } from "../lib/use-realtime-refresh";
import { useLanguage } from "../providers";

type ActiveRecordingItem = {
  id: string;
  channelId: string;
  channelLogin: string;
  channelDisplayName: string;
  title: string | null;
  categoryName: string | null;
  status: string;
  chatStatus: string;
  startedAt: string | null;
  fileSizeBytes: string | null;
  videoReady: boolean;
  videoUrl: string | null;
};

type ActiveRecordingsResponse = {
  items: ActiveRecordingItem[];
};

export default function RecordingPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ActiveRecordingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyChannelId, setBusyChannelId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const response = await apiGet<ActiveRecordingsResponse>("recording/active");
      setItems(response.items);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [t.errors.apiUnavailable]);

  useEffect(() => {
    void load();

    const refreshTimer = window.setInterval(() => {
      void load();
    }, 15000);

    const clockTimer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(refreshTimer);
      window.clearInterval(clockTimer);
    };
  }, [load]);

  useRealtimeRefresh(load);

  async function handleStop(channelId: string) {
    setBusyChannelId(channelId);

    try {
      await apiSend(`channels/${channelId}/stop`, "POST");
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
          <h2 className="page-title">{t.recording.title}</h2>
          <p className="page-copy">{t.recording.subtitle}</p>
        </div>
        <Link className="secondary-button" href="/channels">
          {t.common.channels}
        </Link>
      </section>

      {error ? <div className="notice error-notice">{error}</div> : null}

      <section className="list-grid">
        {items.length ? (
          items.map((item) => {
            const isBusy = busyChannelId === item.channelId;
            const videoSrc = buildMediaUrl(item.videoUrl);

            return (
              <div className="panel recording-card" key={item.id}>
                <div className="channel-top">
                  <div className="identity-copy">
                    <p className="row-title">{item.title ?? item.channelDisplayName}</p>
                    <p className="row-subtitle">
                      @{item.channelLogin}
                      {item.categoryName ? ` • ${item.categoryName}` : ""}
                    </p>
                  </div>
                  <div className="pill live">{t.common.recording}</div>
                </div>

                <div className="recording-meta-grid">
                  <div className="detail-inline">
                    <span>{t.recording.liveDuration}</span>
                    <strong>{formatDuration(item.startedAt, now)}</strong>
                  </div>
                  <div className="detail-inline">
                    <span>{t.recording.startedAt}</span>
                    <strong>{item.startedAt ? new Date(item.startedAt).toLocaleString() : "-"}</strong>
                  </div>
                  <div className="detail-inline">
                    <span>{t.recording.fileSize}</span>
                    <strong>{formatFileSize(item.fileSizeBytes)}</strong>
                  </div>
                </div>

                {item.videoReady && videoSrc ? (
                  <video className="recording-video" controls preload="metadata" src={videoSrc} />
                ) : (
                  <div className="empty-state">{t.recording.previewPending}</div>
                )}

                <div className="hint-line">
                  {item.chatStatus === "not_configured"
                    ? t.replay.chatNotConfigured
                    : t.replay.chatUnavailable}
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="danger-button"
                    disabled={isBusy}
                    onClick={() => void handleStop(item.channelId)}
                  >
                    {isBusy ? `${t.common.stop}...` : t.common.stop}
                  </button>

                  {item.videoReady ? (
                    <Link className="secondary-button" href={`/archives/${item.id}?mode=video`}>
                      {t.common.watchVideo}
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">{t.recording.empty}</div>
        )}
      </section>
    </main>
  );
}
