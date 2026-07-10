"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { formatFileSize } from "../../lib/media";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../providers";
import { IconButton } from "../../components/IconButton";
import { SendIcon } from "../../components/icons";

type QueueItem = {
  id: string;
  channelLogin: string;
  channelDisplayName: string;
  title: string | null;
  telegramStatus: string;
  telegramProgress: number | null;
  telegramError: string | null;
  fileSizeBytes: string | null;
  startedAt: string | null;
};

type StorageOverview = {
  enabled: boolean;
  configured: boolean;
  chatId: string;
  keepLocalDays: number;
  uploadedCount: number;
  telegramBytes: string;
  freedBytes: string;
  awaitingCleanupCount: number;
  queue: QueueItem[];
};

export default function StoragePage() {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<StorageOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await apiGet<StorageOverview>("telegram/storage");
      setData(response);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [t.errors.apiUnavailable]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh(load);

  async function handleRetry(sessionId: string) {
    setBusyId(sessionId);
    try {
      await apiSend(`telegram/upload/${sessionId}`, "POST");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyId(null);
    }
  }

  function renderQueueStatus(item: QueueItem) {
    if (item.telegramStatus === "uploading") {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {t.archives.telegramUploading}
          {item.telegramProgress !== null ? <strong>{item.telegramProgress}%</strong> : null}
        </span>
      );
    }

    if (item.telegramStatus === "error") {
      return (
        <span style={{ color: "var(--danger, #e5484d)" }} title={item.telegramError ?? ""}>
          {t.archives.telegramError}
        </span>
      );
    }

    return <span>{t.archives.telegramPending}</span>;
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.storage.title}</h2>
          <p className="page-copy">{t.storage.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}

      {data && !data.configured ? (
        <div className="notice error">
          {t.storage.notConfigured}{" "}
          <Link href="/admin/settings" style={{ textDecoration: "underline" }}>
            {t.storage.openSettings}
          </Link>
        </div>
      ) : null}

      {data && data.configured ? (
        <div className="notice info">
          {data.enabled ? t.storage.autoUploadOn : t.storage.autoUploadOff}
          {" · "}
          {t.storage.keepLocalNote.replace("{days}", String(data.keepLocalDays))}
        </div>
      ) : null}

      {!data ? (
        <div className="empty-state">{t.common.loading}</div>
      ) : (
        <>
          <section className="stats-row">
            <div className="stat-card">
              <span className="stat-label">{t.storage.uploadedCount}</span>
              <span className="stat-value">{data.uploadedCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{t.storage.telegramSize}</span>
              <span className="stat-value">{formatFileSize(data.telegramBytes)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{t.storage.freedSize}</span>
              <span className="stat-value">{formatFileSize(data.freedBytes)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{t.storage.awaitingCleanup}</span>
              <span className="stat-value">{data.awaitingCleanupCount}</span>
            </div>
          </section>

          <section className="panel" style={{ marginTop: 16 }}>
            <div className="panel-body">
              <h3 className="page-title" style={{ fontSize: 16, marginBottom: 10 }}>
                {t.storage.queueTitle}
              </h3>

              {data.queue.length === 0 ? (
                <div className="empty-state">{t.storage.queueEmpty}</div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t.common.channel}</th>
                        <th>{t.common.title}</th>
                        <th className="col-meta">{t.common.sizeLabel}</th>
                        <th className="col-meta">{t.common.status}</th>
                        <th className="col-actions">{t.common.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.queue.map((item) => (
                        <tr key={item.id}>
                          <td>@{item.channelLogin}</td>
                          <td className="col-truncate" title={item.title ?? ""}>
                            <Link href={`/admin/archives/${item.id}`}>
                              {item.title || item.channelDisplayName}
                            </Link>
                          </td>
                          <td className="col-meta">{formatFileSize(item.fileSizeBytes)}</td>
                          <td className="col-meta">{renderQueueStatus(item)}</td>
                          <td className="col-actions">
                            {item.telegramStatus === "error" && hasPermission("manage_archives") ? (
                              <IconButton
                                title={t.archives.uploadToTelegram}
                                loading={busyId === item.id}
                                disabled={busyId === item.id}
                                onClick={() => void handleRetry(item.id)}
                              >
                                <SendIcon />
                              </IconButton>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <div className="notice info" style={{ marginTop: 16 }}>
            <Link href="/admin/files" style={{ textDecoration: "underline" }}>
              {t.storage.diskTitle} →
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
