"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { formatFileSize } from "../../lib/media";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../providers";
import { IconButton } from "../../components/IconButton";
import { RefreshIcon, TrashIcon } from "../../components/icons";

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

type MissingFile = {
  sessionId: string;
  channelLogin: string;
  title: string | null;
  status: string;
  field: "video" | "audio" | "chat" | "source";
  path: string;
  expected: boolean;
};

type DiskOverview = {
  dataRoot: string;
  disk: { totalBytes: string; freeBytes: string } | null;
  dbSizeBytes: string | null;
  missing: MissingFile[];
  missingTruncated: boolean;
  dirs: Array<{ name: string; fileCount: number; totalBytes: string }>;
  totalBytes: string;
  orphanCount: number;
  orphanBytes: string;
  truncated: boolean;
  files: DiskFile[];
};

export default function FilesPage() {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const [disk, setDisk] = useState<DiskOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onlyOrphans, setOnlyOrphans] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDisk(await apiGet<DiskOverview>("storage/disk"));
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    } finally {
      setLoading(false);
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
      setNotice(
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

  function fileKindLabel(kind: DiskFile["kind"] | MissingFile["field"]) {
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

  // Баланс диска: сколько занято всего и какая доля — записи и база. Всё
  // остальное (система, докер-образы, логи контейнеров) живёт вне хранилища.
  const diskTotal = disk?.disk ? Number(disk.disk.totalBytes) : 0;
  const diskFree = disk?.disk ? Number(disk.disk.freeBytes) : 0;
  const diskUsed = diskTotal > 0 ? diskTotal - diskFree : 0;
  const dataBytes = disk ? Number(disk.totalBytes) : 0;
  const dbBytes = disk?.dbSizeBytes ? Number(disk.dbSizeBytes) : 0;
  const otherBytes = Math.max(0, diskUsed - dataBytes - dbBytes);

  const lostFiles = disk ? disk.missing.filter((item) => !item.expected) : [];
  const expectedMissing = disk ? disk.missing.filter((item) => item.expected) : [];

  const visibleFiles = disk
    ? disk.files.filter((file) => !onlyOrphans || file.orphan)
    : [];

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.storage.filesPageTitle}</h2>
          <p className="page-copy">{t.storage.filesPageSubtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <IconButton title={t.common.loading} loading={loading} onClick={() => void load()}>
            <RefreshIcon />
          </IconButton>
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
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {notice ? <div className="notice info">{notice}</div> : null}

      {!disk ? (
        <div className="empty-state">{t.common.loading}</div>
      ) : (
        <>
          <section className="stats-row">
            {disk.disk ? (
              <>
                <div className="stat-card">
                  <span className="stat-label">{t.storage.diskFree}</span>
                  <span className="stat-value">{formatFileSize(String(diskFree))}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">{t.storage.diskUsedTotal}</span>
                  <span className="stat-value">{formatFileSize(String(diskUsed))}</span>
                </div>
              </>
            ) : null}
            <div className="stat-card">
              <span className="stat-label">{t.storage.dataFiles}</span>
              <span className="stat-value">{formatFileSize(disk.totalBytes)}</span>
            </div>
            {disk.dbSizeBytes ? (
              <div className="stat-card">
                <span className="stat-label">{t.storage.dbSize}</span>
                <span className="stat-value">{formatFileSize(disk.dbSizeBytes)}</span>
              </div>
            ) : null}
            {disk.disk ? (
              <div className="stat-card">
                <span className="stat-label">{t.storage.otherUsage}</span>
                <span className="stat-value">{formatFileSize(String(otherBytes))}</span>
              </div>
            ) : null}
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

          {disk.disk && otherBytes > dataBytes ? (
            <div className="notice info">
              {t.storage.verdictMismatch
                .replace("{data}", formatFileSize(disk.totalBytes))
                .replace("{used}", formatFileSize(String(diskUsed)))
                .replace("{other}", formatFileSize(String(otherBytes)))}
            </div>
          ) : null}

          <section className="panel" style={{ marginTop: 16 }}>
            <div className="panel-body">
              <h3 className="page-title" style={{ fontSize: 16, marginBottom: 10 }}>
                {t.storage.dirsTitle}
              </h3>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t.storage.dirCol}</th>
                      <th className="col-meta">{t.storage.fileCountCol}</th>
                      <th className="col-meta">{t.common.sizeLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disk.dirs.map((dir) => (
                      <tr key={dir.name}>
                        <td>{dir.name}</td>
                        <td className="col-meta">{dir.fileCount}</td>
                        <td className="col-meta">{formatFileSize(dir.totalBytes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  {t.storage.diskTitle}
                  {disk.truncated ? (
                    <span style={{ opacity: 0.6, fontSize: 12, marginLeft: 8 }}>
                      {t.storage.truncatedNote}
                    </span>
                  ) : null}
                </h3>
                <label
                  style={{ display: "inline-flex", gap: 6, alignItems: "center", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={onlyOrphans}
                    onChange={(event) => setOnlyOrphans(event.target.checked)}
                  />
                  {t.storage.onlyOrphans}
                </label>
              </div>

              {visibleFiles.length === 0 ? (
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
                      {visibleFiles.map((file) => (
                        <tr key={file.path}>
                          <td className="col-truncate" title={file.path}>
                            {file.path}
                          </td>
                          <td className="col-meta">{formatFileSize(file.sizeBytes)}</td>
                          <td className="col-meta">{new Date(file.mtime).toLocaleString()}</td>
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

          <section className="panel" style={{ marginTop: 16 }}>
            <div className="panel-body">
              <h3 className="page-title" style={{ fontSize: 16, marginBottom: 10 }}>
                {t.storage.missingTitle}
              </h3>
              {disk.missing.length === 0 ? (
                <div className="empty-state">{t.storage.missingEmpty}</div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t.storage.fileCol}</th>
                        <th>{t.common.channel}</th>
                        <th className="col-meta">{t.common.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...lostFiles, ...expectedMissing].map((item) => (
                        <tr key={item.sessionId + item.path}>
                          <td className="col-truncate" title={item.path}>
                            <Link href={`/admin/archives/${item.sessionId}`}>{item.path}</Link>
                          </td>
                          <td>@{item.channelLogin}</td>
                          <td className="col-meta">
                            {item.expected ? (
                              <span style={{ opacity: 0.7 }}>{t.storage.missingUploaded}</span>
                            ) : (
                              <span style={{ color: "var(--danger, #e5484d)", fontWeight: 600 }}>
                                {t.storage.missingLost} · {fileKindLabel(item.field)}
                              </span>
                            )}
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
