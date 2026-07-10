"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { formatFileSize } from "../../lib/media";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../providers";
import { IconButton } from "../../components/IconButton";
import { SendIcon, TrashIcon } from "../../components/icons";

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

type DiskFile = {
  path: string;
  dir: string;
  sizeBytes: string;
  mtime: string;
  kind: "video" | "audio" | "source" | "chat" | "other";
  orphan: boolean;
  locked: boolean;
  recent: boolean;
  session: {
    id: string;
    channelLogin: string;
    title: string | null;
    status: string;
    field: "video" | "audio" | "chat" | "source";
  } | null;
};

type DiskOverview = {
  dataRoot: string;
  disk: { totalBytes: string; freeBytes: string } | null;
  dirs: Array<{ name: string; fileCount: number; totalBytes: string }>;
  totalBytes: string;
  orphanCount: number;
  orphanBytes: string;
  truncated: boolean;
  files: DiskFile[];
};

export default function StoragePage() {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const [data, setData] = useState<StorageOverview | null>(null);
  const [disk, setDisk] = useState<DiskOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  const [onlyOrphans, setOnlyOrphans] = useState(false);
  const [diskNotice, setDiskNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await apiGet<StorageOverview>("telegram/storage");
      setData(response);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
    try {
      setDisk(await apiGet<DiskOverview>("storage/disk"));
    } catch {
      // Ревизия диска не критична для остальной страницы.
    }
  }, [t.errors.apiUnavailable]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh(load);

  async function handlePurge(paths?: string[]) {
    if (!paths && disk) {
      const ok = window.confirm(
        t.storage.purgeConfirm.replace("{size}", formatFileSize(disk.orphanBytes)),
      );
      if (!ok) return;
    }
    setPurging(true);
    try {
      const result = await apiSend<{ deletedCount: number; freedBytes: string }>(
        "storage/disk/cleanup",
        "POST",
        paths ? { paths } : {},
      );
      setDiskNotice(
        t.storage.purgeDone
          .replace("{count}", String(result.deletedCount))
          .replace("{size}", formatFileSize(result.freedBytes)),
      );
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setPurging(false);
    }
  }

  function fileKindLabel(kind: DiskFile["kind"] | "video" | "audio" | "chat" | "source") {
    if (kind === "video") return t.storage.fileKindVideo;
    if (kind === "audio") return t.storage.fileKindAudio;
    if (kind === "chat") return t.storage.fileKindChat;
    if (kind === "source") return t.storage.fileKindSource;
    return t.storage.fileKindOther;
  }

  function renderFileStatus(file: DiskFile) {
    if (file.locked) {
      return <span style={{ color: "var(--warning, #f5a524)" }}>{t.storage.statusRecording}</span>;
    }
    if (file.session) {
      return (
        <Link
          href={`/admin/archives/${file.session.id}`}
          title={file.session.title ?? ""}
          style={{ textDecoration: "underline" }}
        >
          {fileKindLabel(file.session.field)} · @{file.session.channelLogin}
        </Link>
      );
    }
    if (file.recent) {
      return <span style={{ opacity: 0.7 }}>{t.storage.statusRecent}</span>;
    }
    return (
      <span style={{ color: "var(--danger, #e5484d)", fontWeight: 600 }}>
        {t.storage.statusOrphan} · {fileKindLabel(file.kind)}
      </span>
    );
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
        </>
      )}

      <section className="page-header" style={{ marginTop: 28 }}>
        <div>
          <h2 className="page-title">{t.storage.diskTitle}</h2>
          <p className="page-copy">{t.storage.diskSubtitle}</p>
        </div>
        {disk && disk.orphanCount > 0 && hasPermission("manage_archives") ? (
          <button
            type="button"
            className="btn danger"
            disabled={purging}
            onClick={() => void handlePurge()}
          >
            {t.storage.purgeOrphans} ({disk.orphanCount} · {formatFileSize(disk.orphanBytes)})
          </button>
        ) : null}
      </section>

      {diskNotice ? <div className="notice info">{diskNotice}</div> : null}

      {!disk ? (
        <div className="empty-state">{t.common.loading}</div>
      ) : (
        <>
          <section className="stats-row">
            {disk.disk ? (
              <div className="stat-card">
                <span className="stat-label">{t.storage.diskFree}</span>
                <span className="stat-value">{formatFileSize(disk.disk.freeBytes)}</span>
              </div>
            ) : null}
            <div className="stat-card">
              <span className="stat-label">{t.storage.diskUsed}</span>
              <span className="stat-value">{formatFileSize(disk.totalBytes)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{t.storage.diskOrphans}</span>
              <span
                className="stat-value"
                style={disk.orphanCount > 0 ? { color: "var(--danger, #e5484d)" } : undefined}
              >
                {disk.orphanCount} · {formatFileSize(disk.orphanBytes)}
              </span>
            </div>
          </section>

          <section className="panel" style={{ marginTop: 16 }}>
            <div className="panel-body">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h3 className="page-title" style={{ fontSize: 16, margin: 0 }}>
                  {t.storage.fileCol}
                  {disk.truncated ? (
                    <span style={{ opacity: 0.6, fontSize: 12, marginLeft: 8 }}>
                      {t.storage.truncatedNote}
                    </span>
                  ) : null}
                </h3>
                <label style={{ display: "inline-flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={onlyOrphans}
                    onChange={(event) => setOnlyOrphans(event.target.checked)}
                  />
                  {t.storage.onlyOrphans}
                </label>
              </div>

              {disk.files.filter((file) => !onlyOrphans || file.orphan).length === 0 ? (
                <div className="empty-state">{t.storage.diskEmpty}</div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t.storage.fileCol}</th>
                        <th className="col-meta">{t.common.sizeLabel}</th>
                        <th className="col-meta">{t.storage.modifiedCol}</th>
                        <th className="col-meta">{t.common.status}</th>
                        <th className="col-actions">{t.common.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disk.files
                        .filter((file) => !onlyOrphans || file.orphan)
                        .map((file) => (
                          <tr key={file.path}>
                            <td className="col-truncate" title={file.path}>
                              {file.path}
                            </td>
                            <td className="col-meta">{formatFileSize(file.sizeBytes)}</td>
                            <td className="col-meta">
                              {new Date(file.mtime).toLocaleString()}
                            </td>
                            <td className="col-meta">{renderFileStatus(file)}</td>
                            <td className="col-actions">
                              {file.orphan && hasPermission("manage_archives") ? (
                                <IconButton
                                  title={t.storage.deleteFile}
                                  loading={purging}
                                  disabled={purging}
                                  onClick={() => void handlePurge([file.path])}
                                >
                                  <TrashIcon />
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
        </>
      )}
    </main>
  );
}
