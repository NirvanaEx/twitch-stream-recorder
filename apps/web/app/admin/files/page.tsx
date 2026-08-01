"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { formatFileSize } from "../../lib/media";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../providers";
import { IconButton } from "../../components/IconButton";
import { Pagination } from "../../components/Pagination";
import { PageTabs } from "../../components/PageTabs";
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
  dirs: Array<{
    name: string;
    fileCount: number;
    totalBytes: string;
    sharePercent: number;
  }>;
  kinds: Array<{ kind: DiskFile["kind"]; fileCount: number; totalBytes: string }>;
  fileCount: number;
  totalBytes: string;
  orphanCount: number;
  orphanBytes: string;
  truncated: boolean;
  files: DiskFile[];
};

// The file table is paged in the browser: one scan already walks the whole
// tree, so asking the server again per page would re-walk it for nothing.
const PAGE_SIZE = 25;

type TabId = "overview" | "dirs" | "kinds" | "files" | "missing";

export default function FilesPage() {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const [disk, setDisk] = useState<DiskOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onlyOrphans, setOnlyOrphans] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [missingPage, setMissingPage] = useState(1);
  const [tab, setTab] = useState<TabId>("overview");

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

  // Any change to what is being filtered starts from the first page, or the
  // table silently shows nothing on a page that no longer exists.
  useEffect(() => {
    setPage(1);
  }, [search, onlyOrphans]);

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

  // Status and ownership are two different facts and now live in two columns:
  // "лишний · видео" read as one thing and was two.
  function renderFileStatus(file: DiskFile) {
    if (file.locked) return <span className="tag warn">{t.storage.statusRecording}</span>;
    if (file.session) return <span className="tag ok">{t.storage.statusLinked}</span>;
    if (file.recent) return <span className="tag">{t.storage.statusRecent}</span>;
    return <span className="tag danger">{t.storage.statusOrphan}</span>;
  }

  function renderFileOwner(file: DiskFile) {
    if (!file.session) return <span className="muted">—</span>;
    return (
      <Link href={`/admin/archives/${file.session.id}`} title={file.session.title ?? ""}>
        @{file.session.channelLogin}
      </Link>
    );
  }

  // Disk balance: what the recorder holds, what Postgres holds, and everything
  // else on the same partition — the system, docker images, container logs.
  const diskTotal = disk?.disk ? Number(disk.disk.totalBytes) : 0;
  const diskFree = disk?.disk ? Number(disk.disk.freeBytes) : 0;
  const diskUsed = diskTotal > 0 ? diskTotal - diskFree : 0;
  const dataBytes = disk ? Number(disk.totalBytes) : 0;
  const dbBytes = disk?.dbSizeBytes ? Number(disk.dbSizeBytes) : 0;
  const otherBytes = Math.max(0, diskUsed - dataBytes - dbBytes);
  const usedPercent = diskTotal > 0 ? Math.round((diskUsed / diskTotal) * 100) : 0;

  const lostFiles = disk ? disk.missing.filter((item) => !item.expected) : [];
  const expectedMissing = disk ? disk.missing.filter((item) => item.expected) : [];

  const filteredFiles = useMemo(() => {
    if (!disk) return [];
    const needle = search.trim().toLowerCase();
    return disk.files.filter((file) => {
      if (onlyOrphans && !file.orphan) return false;
      if (needle && !file.path.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [disk, onlyOrphans, search]);

  const pageFiles = filteredFiles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Real losses first: an expected gap is a file whose Telegram copy took
  // over, and it must not bury one that is simply gone.
  const missingOrdered = [...lostFiles, ...expectedMissing];
  const pageMissing = missingOrdered.slice(
    (missingPage - 1) * PAGE_SIZE,
    missingPage * PAGE_SIZE,
  );

  const tabs = [
    { id: "overview" as TabId, label: t.storage.tabOverview },
    { id: "dirs" as TabId, label: t.storage.tabDirs, count: disk?.dirs.length },
    { id: "kinds" as TabId, label: t.storage.tabKinds, count: disk?.kinds.length },
    { id: "files" as TabId, label: t.storage.tabFiles, count: disk?.files.length },
    {
      id: "missing" as TabId,
      label: t.storage.tabMissing,
      count: lostFiles.length,
      alert: true,
    },
  ];

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.storage.filesPageTitle}</h2>
          <p className="page-copy">{t.storage.filesPageSubtitle}</p>
        </div>
        <div className="panel-head-actions">
          <IconButton title={t.common.refresh} loading={loading} onClick={() => void load()}>
            <RefreshIcon />
          </IconButton>
          {disk && disk.orphanCount > 0 && hasPermission("manage_archives") ? (
            <button
              type="button"
              className="btn danger"
              disabled={purging}
              onClick={() => void handlePurge()}
            >
              {t.storage.purgeOrphans}
              <span className="tab-count alert">{disk.orphanCount}</span>
            </button>
          ) : null}
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {notice ? <div className="notice info">{notice}</div> : null}

      {!disk ? (
        <div className="empty-state">{t.common.loading}</div>
      ) : (
        <section className="panel">
          <PageTabs tabs={tabs} active={tab} onChange={setTab} />

          {tab === "overview" ? (
            <div className="panel-body">
              <div className="storage-bar" style={{ height: 6 }}>
                <div
                  className={`storage-bar-fill ${
                    usedPercent >= 90 ? "danger" : usedPercent >= 75 ? "warn" : ""
                  }`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>

              {/* One fact per row. "12 GB · 480" used to read as a single value
                  and was two unrelated numbers sharing a cell. */}
              <div className="kv-grid" style={{ marginTop: 16 }}>
                <div className="kv">
                  <span className="kv-key">{t.storage.diskFree}</span>
                  <span className="kv-value">{formatFileSize(String(diskFree))}</span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.diskUsedTotal}</span>
                  <span className="kv-value">{formatFileSize(String(diskUsed))}</span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.diskCapacity}</span>
                  <span className="kv-value">{formatFileSize(String(diskTotal))}</span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.dataFiles}</span>
                  <span className="kv-value">{formatFileSize(disk.totalBytes)}</span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.fileCountCol}</span>
                  <span className="kv-value">{disk.fileCount}</span>
                </div>
                {disk.dbSizeBytes ? (
                  <div className="kv">
                    <span className="kv-key">{t.storage.dbSize}</span>
                    <span className="kv-value">{formatFileSize(disk.dbSizeBytes)}</span>
                  </div>
                ) : null}
                {disk.disk ? (
                  <div className="kv">
                    <span className="kv-key">{t.storage.otherUsage}</span>
                    <span className="kv-value">{formatFileSize(String(otherBytes))}</span>
                  </div>
                ) : null}
                <div className="kv">
                  <span className="kv-key">{t.storage.diskOrphans}</span>
                  <span
                    className="kv-value"
                    style={disk.orphanCount > 0 ? { color: "var(--danger)" } : undefined}
                  >
                    {disk.orphanCount}
                  </span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.orphanBytesLabel}</span>
                  <span className="kv-value">{formatFileSize(disk.orphanBytes)}</span>
                </div>
                <div className="kv">
                  <span className="kv-key">{t.storage.dataRootLabel}</span>
                  <span className="kv-value" title={disk.dataRoot}>
                    {disk.dataRoot}
                  </span>
                </div>
              </div>

              {disk.disk && otherBytes > dataBytes ? (
                <div className="notice info" style={{ marginTop: 16 }}>
                  {t.storage.verdictMismatch
                    .replace("{data}", formatFileSize(disk.totalBytes))
                    .replace("{used}", formatFileSize(String(diskUsed)))
                    .replace("{other}", formatFileSize(String(otherBytes)))}
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === "dirs" ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.storage.dirCol}</th>
                    <th className="col-num">{t.storage.fileCountCol}</th>
                    <th className="col-num">{t.common.sizeLabel}</th>
                    <th className="col-num">{t.storage.shareCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {disk.dirs.map((dir) => (
                    <tr key={dir.name}>
                      <td>{dir.name}</td>
                      <td className="col-num">{dir.fileCount}</td>
                      <td className="col-num">{formatFileSize(dir.totalBytes)}</td>
                      <td className="col-num">
                        <span className="share">
                          <span className="share-bar">
                            <span
                              className="share-bar-fill"
                              style={{ width: `${Math.min(100, dir.sharePercent)}%` }}
                            />
                          </span>
                          <span className="share-value">{dir.sharePercent}%</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {tab === "kinds" ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.storage.kindCol}</th>
                    <th className="col-num">{t.storage.fileCountCol}</th>
                    <th className="col-num">{t.common.sizeLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {disk.kinds.map((row) => (
                    <tr key={row.kind}>
                      <td>{fileKindLabel(row.kind)}</td>
                      <td className="col-num">{row.fileCount}</td>
                      <td className="col-num">{formatFileSize(row.totalBytes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {tab === "files" ? (
            <>
              <div className="filter-row">
                <input
                  type="search"
                  className="input"
                  placeholder={t.storage.searchPlaceholder}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    checked={onlyOrphans}
                    onChange={(event) => setOnlyOrphans(event.target.checked)}
                  />
                  {t.storage.onlyOrphans}
                </label>
                <span className="filter-spacer" />
                {disk.truncated ? (
                  <span className="filter-note">{t.storage.truncatedNote}</span>
                ) : null}
                <span className="filter-note">
                  {t.storage.foundCount.replace("{count}", String(filteredFiles.length))}
                </span>
              </div>

              {pageFiles.length === 0 ? (
                <div className="empty-state">{t.storage.diskEmpty}</div>
              ) : (
                <>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{t.storage.fileCol}</th>
                          <th>{t.storage.kindCol}</th>
                          <th className="col-num">{t.common.sizeLabel}</th>
                          <th className="col-num">{t.storage.modifiedCol}</th>
                          <th>{t.common.status}</th>
                          <th>{t.common.channel}</th>
                          <th className="col-actions">{t.common.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageFiles.map((file) => (
                          <tr key={file.path}>
                            <td className="col-truncate" title={file.path}>
                              {file.path}
                            </td>
                            <td>{fileKindLabel(file.kind)}</td>
                            <td className="col-num">{formatFileSize(file.sizeBytes)}</td>
                            <td className="col-num">
                              {new Date(file.mtime).toLocaleString()}
                            </td>
                            <td>{renderFileStatus(file)}</td>
                            <td>{renderFileOwner(file)}</td>
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
                  <div className="panel-foot">
                    <Pagination
                      page={page}
                      pageSize={PAGE_SIZE}
                      total={filteredFiles.length}
                      onPageChange={setPage}
                    />
                  </div>
                </>
              )}
            </>
          ) : null}

          {tab === "missing" ? (
            <>
              <div className="filter-row">
                <span className="filter-note">{t.storage.missingSub}</span>
                <span className="filter-spacer" />
                <span className="filter-note">
                  {t.storage.missingLost}: {lostFiles.length} ·{" "}
                  {t.storage.missingUploaded}: {expectedMissing.length}
                </span>
              </div>

              {pageMissing.length === 0 ? (
                <div className="empty-state">{t.storage.missingEmpty}</div>
              ) : (
                <>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{t.storage.fileCol}</th>
                          <th>{t.storage.kindCol}</th>
                          <th>{t.common.channel}</th>
                          <th>{t.common.status}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageMissing.map((item) => (
                          <tr key={item.sessionId + item.path}>
                            <td className="col-truncate" title={item.path}>
                              <Link href={`/admin/archives/${item.sessionId}`}>{item.path}</Link>
                            </td>
                            <td>{fileKindLabel(item.field)}</td>
                            <td>@{item.channelLogin}</td>
                            <td>
                              {item.expected ? (
                                <span className="tag">{t.storage.missingUploaded}</span>
                              ) : (
                                <span className="tag danger">{t.storage.missingLost}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="panel-foot">
                    <Pagination
                      page={missingPage}
                      pageSize={PAGE_SIZE}
                      total={missingOrdered.length}
                      onPageChange={setMissingPage}
                    />
                  </div>
                </>
              )}
            </>
          ) : null}
        </section>
      )}
    </main>
  );
}
