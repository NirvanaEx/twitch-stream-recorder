"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { formatFileSize } from "../../lib/media";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../providers";
import { IconButton } from "../../components/IconButton";
import { PageTabs } from "../../components/PageTabs";
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

type ArchiveOverview = {
  configured: boolean;
  available: boolean;
  root: string | null;
  disk: { totalBytes: string; freeBytes: string } | null;
  keepDays: number;
  storedCount: number;
  storedBytes: string;
  expiredCount: number;
  queuedCount: number;
  errorCount: number;
};

type StorageOverview = {
  enabled: boolean;
  configured: boolean;
  chatId: string;
  videoKeepLocalDays: number;
  audioKeepLocalDays: number;
  uploadedCount: number;
  telegramBytes: string;
  freedBytes: string;
  awaitingCleanupCount: number;
  queue: QueueItem[];
};

type TabId = "archive" | "telegram";

export default function StoragePage() {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<StorageOverview | null>(null);
  const [archive, setArchive] = useState<ArchiveOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sweeping, setSweeping] = useState(false);
  const [tab, setTab] = useState<TabId>("archive");

  const load = useCallback(async () => {
    try {
      const [storage, archiveOverview] = await Promise.all([
        apiGet<StorageOverview>("telegram/storage"),
        apiGet<ArchiveOverview>("archive-storage"),
      ]);
      setData(storage);
      setArchive(archiveOverview);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [t.errors.apiUnavailable]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh(load);

  async function handleSweep() {
    setSweeping(true);
    try {
      await apiSend("archive-storage/sweep", "POST");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setSweeping(false);
    }
  }

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
          {data.videoKeepLocalDays < 0
            ? t.storage.keepLocalForever
            : data.videoKeepLocalDays === 0
              ? t.storage.keepLocalNow
              : t.storage.keepLocalNote.replace("{days}", String(data.videoKeepLocalDays))}
        </div>
      ) : null}

      <section className="panel">
        <PageTabs
          tabs={[
            { id: "archive" as TabId, label: t.storage.tabArchive },
            {
              id: "telegram" as TabId,
              label: t.storage.tabTelegram,
              count: data?.queue.length,
              alert: true,
            },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === "archive" ? (
          !archive?.configured ? (
            <div className="empty-state">{t.storage.archiveOff}</div>
          ) : (
            <div className="panel-body">
              {archive.available ? null : (
                <div className="notice error" style={{ marginBottom: 14 }}>
                  {t.storage.archiveUnavailable}
                </div>
              )}

              {archive.disk ? (
                <div className="storage-bar" style={{ height: 6 }}>
                  <div
                    className="storage-bar-fill"
                    style={{
                      width: `${
                        Number(archive.disk.totalBytes) > 0
                          ? Math.min(
                              100,
                              ((Number(archive.disk.totalBytes) -
                                Number(archive.disk.freeBytes)) /
                                Number(archive.disk.totalBytes)) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              ) : null}

              {/* One fact per row — free space, capacity, how much the archive
                  itself holds and how many recordings that is. */}
              <div className="kv-grid" style={{ marginTop: 16 }}>
                {archive.disk ? (
                  <>
                    <div className="kv">
                      <span className="kv-key">{t.storage.diskFree}</span>
                      <span className="kv-value">{formatFileSize(archive.disk.freeBytes)}</span>
                    </div>
                    <div className="kv">
                      <span className="kv-key">{t.storage.diskCapacity}</span>
                      <span className="kv-value">{formatFileSize(archive.disk.totalBytes)}</span>
                    </div>
                  </>
                ) : null}
                <div className="kv">
                  <span className="kv-key">{t.storage.archiveStoredSize}</span>
                  <span className="kv-value">{formatFileSize(archive.storedBytes)}</span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.archiveStored}</span>
                  <span className="kv-value">{archive.storedCount}</span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.archiveQueued}</span>
                  <span className="kv-value">{archive.queuedCount}</span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.archiveExpired}</span>
                  <span className="kv-value">{archive.expiredCount}</span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.archiveKeepLabel}</span>
                  <span className="kv-value">
                    {archive.keepDays < 0
                      ? t.settings.keepLocalForever
                      : `${archive.keepDays} ${t.settings.keepLocalDaysUnit}`}
                  </span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.dataRootLabel}</span>
                  <span className="kv-value" title={archive.root ?? ""}>
                    {archive.root ?? "—"}
                  </span>
                </div>
              </div>

              <div className="action-row" style={{ marginTop: 16 }}>
                {hasPermission("manage_archives") ? (
                  <button
                    type="button"
                    className={`btn${sweeping ? " is-loading" : ""}`}
                    disabled={sweeping}
                    onClick={() => void handleSweep()}
                  >
                    {t.storage.archiveSweep}
                  </button>
                ) : null}
                {archive.errorCount > 0 ? (
                  <span className="tag danger">
                    {t.storage.archiveErrors.replace("{count}", String(archive.errorCount))}
                  </span>
                ) : null}
              </div>
            </div>
          )
        ) : null}

        {tab === "telegram" ? (
          !data ? (
            <div className="empty-state">{t.common.loading}</div>
          ) : (
            <>
              <div className="panel-body">
                <div className="kv-grid">
                  <div className="kv">
                    <span className="kv-key">{t.storage.uploadedCount}</span>
                    <span className="kv-value">{data.uploadedCount}</span>
                  </div>
                  <div className="kv">
                    <span className="kv-key">{t.storage.telegramSize}</span>
                    <span className="kv-value">{formatFileSize(data.telegramBytes)}</span>
                  </div>
                  <div className="kv">
                    <span className="kv-key">{t.storage.freedSize}</span>
                    <span className="kv-value">{formatFileSize(data.freedBytes)}</span>
                  </div>
                  <div className="kv">
                    <span className="kv-key">{t.storage.awaitingCleanup}</span>
                    <span className="kv-value">{data.awaitingCleanupCount}</span>
                  </div>
                </div>
              </div>

              {data.queue.length === 0 ? (
                <div className="empty-state">{t.storage.queueEmpty}</div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t.common.channel}</th>
                        <th>{t.common.title}</th>
                        <th className="col-num">{t.common.sizeLabel}</th>
                        <th>{t.common.status}</th>
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
                          <td className="col-num">{formatFileSize(item.fileSizeBytes)}</td>
                          <td>{renderQueueStatus(item)}</td>
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
            </>
          )
        ) : null}
      </section>

      <div className="notice info">
        <Link href="/admin/files" style={{ textDecoration: "underline" }}>
          {t.storage.diskTitle} →
        </Link>
      </div>
    </main>
  );
}
