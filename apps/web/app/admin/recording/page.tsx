"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { formatDuration, formatFileSize } from "../../lib/media";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useLanguage } from "../../providers";
import { IconButton, IconLink } from "../../components/IconButton";
import { FilmIcon, MessageIcon, StopIcon } from "../../components/icons";

type ActiveRecording = {
  id: string;
  channelId: string;
  channelLogin: string;
  channelDisplayName: string;
  title: string | null;
  startedAt: string | null;
  fileSizeBytes: string | null;
  videoReady: boolean;
  videoUrl: string | null;
};

type ActiveRecordingsResponse = { items: ActiveRecording[] };

export default function RecordingPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ActiveRecording[]>([]);
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
    const refresh = window.setInterval(() => void load(), 5000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(refresh);
      window.clearInterval(tick);
    };
  }, [load]);

  useRealtimeRefresh(load);

  async function handleStop(channelId: string) {
    setBusyChannelId(channelId);
    try {
      await apiSend(`channels/${channelId}/stop`, "POST");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyChannelId(null);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.recording.title}</h2>
          <p className="page-copy">{t.recording.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}

      <section className="panel">
        {items.length === 0 ? (
          <div className="empty-state">{t.recording.empty}</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t.common.channel}</th>
                  <th>{t.common.title}</th>
                  <th className="col-meta">{t.recording.startedAt}</th>
                  <th className="col-meta">{t.common.duration}</th>
                  <th className="col-meta">{t.common.sizeLabel}</th>
                  <th className="col-actions">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <div className="cell-channel">
                        <span className="badge recording">{t.common.recording}</span>
                        <div className="cell-name">
                          <strong>{session.channelDisplayName}</strong>
                          <span>@{session.channelLogin}</span>
                        </div>
                      </div>
                    </td>
                    <td className="col-truncate" title={session.title ?? ""}>
                      {session.title || "—"}
                    </td>
                    <td className="col-meta">
                      {session.startedAt ? new Date(session.startedAt).toLocaleTimeString() : "—"}
                    </td>
                    <td className="col-meta" style={{ color: "var(--accent)", fontWeight: 600 }}>
                      {formatDuration(session.startedAt, now)}
                    </td>
                    <td className="col-meta">{formatFileSize(session.fileSizeBytes)}</td>
                    <td className="col-actions">
                      <div className="action-row">
                        {session.videoReady && session.videoUrl ? (
                          <>
                            <IconLink
                              href={`/admin/archives/${session.id}?mode=video`}
                              title={t.common.watchVideo}
                            >
                              <FilmIcon />
                            </IconLink>
                            <IconLink
                              href={`/admin/archives/${session.id}?mode=chat`}
                              title={t.common.watchWithChat}
                            >
                              <MessageIcon />
                            </IconLink>
                          </>
                        ) : null}
                        <IconButton
                          title={t.common.stop}
                          className="stop"
                          loading={busyChannelId === session.channelId}
                          disabled={busyChannelId === session.channelId}
                          onClick={() => void handleStop(session.channelId)}
                        >
                          <StopIcon />
                        </IconButton>
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
