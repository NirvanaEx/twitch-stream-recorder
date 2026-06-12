"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend, buildApiUrl } from "../../lib/api";
import { formatFileSize, formatPeriod, withAuthToken } from "../../lib/media";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useLanguage } from "../../providers";
import { IconButton, IconLink } from "../../components/IconButton";
import { Pagination } from "../../components/Pagination";
import {
  DownloadIcon,
  HardDriveIcon,
  PlayIcon,
  SendIcon,
  TrashIcon,
} from "../../components/icons";

type TelegramPart = {
  partIndex: number;
  partCount: number;
  url: string | null;
};

type ArchiveItem = {
  id: string;
  channelLogin: string;
  channelDisplayName: string;
  title: string | null;
  categoryName: string | null;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  fileSizeBytes: string | null;
  videoReady: boolean;
  videoUrl: string | null;
  videoSource: "local" | "telegram" | null;
  telegramStatus: string;
  telegramProgress: number | null;
  telegramError: string | null;
  telegramParts: TelegramPart[];
  localFileDeletedAt: string | null;
};

type ArchivesResponse = {
  items: ArchiveItem[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 15;

export default function ArchivesPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyArchiveId, setBusyArchiveId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadArchives = useCallback(async () => {
    try {
      const response = await apiGet<ArchivesResponse>(
        `archives?page=${page}&pageSize=${PAGE_SIZE}`,
      );
      setItems(response.items);
      setTotal(response.total);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [page, t.errors.apiUnavailable]);

  useEffect(() => {
    void loadArchives();
  }, [loadArchives]);

  useRealtimeRefresh(loadArchives);

  // If the last item of the last page was deleted, step back one page.
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [total, page]);

  async function handleTelegramUpload(archiveId: string) {
    setBusyArchiveId(archiveId);
    setSuccess(null);
    setError(null);

    try {
      await apiSend(`telegram/upload/${archiveId}`, "POST");
      await loadArchives();
      setSuccess(t.archives.telegramQueued);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyArchiveId(null);
    }
  }

  function renderTelegramCell(archive: ArchiveItem) {
    if (archive.telegramStatus === "uploaded" && archive.telegramParts.length > 0) {
      return (
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
          {archive.telegramParts.map((part) =>
            part.url ? (
              <a
                key={part.partIndex}
                href={part.url}
                target="_blank"
                rel="noreferrer"
                title={t.archives.openInTelegram}
              >
                {part.partCount > 1
                  ? `${t.archives.telegramPart} ${part.partIndex}/${part.partCount}`
                  : t.archives.telegramUploaded}
              </a>
            ) : (
              <span key={part.partIndex}>{t.archives.telegramUploaded}</span>
            ),
          )}
        </span>
      );
    }

    if (archive.telegramStatus === "uploading") {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {t.archives.telegramUploading}
          {archive.telegramProgress !== null ? (
            <>
              <span
                style={{
                  width: 48,
                  height: 4,
                  borderRadius: 2,
                  background: "var(--border, #333)",
                  overflow: "hidden",
                  display: "inline-block",
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${archive.telegramProgress}%`,
                    background: "var(--accent, #7c3aed)",
                    transition: "width 0.5s ease",
                  }}
                />
              </span>
              <strong>{archive.telegramProgress}%</strong>
            </>
          ) : null}
        </span>
      );
    }

    if (archive.telegramStatus === "pending") {
      return <span>{t.archives.telegramPending}</span>;
    }

    if (archive.telegramStatus === "error") {
      return (
        <span style={{ color: "var(--danger, #e5484d)" }} title={archive.telegramError ?? ""}>
          {t.archives.telegramError}
        </span>
      );
    }

    return <span>—</span>;
  }

  async function handleDelete(archiveId: string) {
    if (!window.confirm(t.archives.deleteConfirm)) return;

    setBusyArchiveId(archiveId);
    setSuccess(null);
    setError(null);

    try {
      await apiSend(`archives/${archiveId}`, "DELETE");
      await loadArchives();
      setSuccess(t.archives.deleted);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyArchiveId(null);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.archives.title}</h2>
          <p className="page-copy">{t.archives.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {success ? <div className="notice success">{success}</div> : null}

      <section className="panel">
        {items.length === 0 ? (
          <div className="empty-state">{t.archives.empty}</div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.common.channel}</th>
                    <th>{t.common.title}</th>
                    <th className="col-meta">{t.archives.category}</th>
                    <th className="col-meta">{t.archives.recordedAt}</th>
                    <th className="col-meta">{t.common.duration}</th>
                    <th className="col-meta">{t.common.sizeLabel}</th>
                    <th className="col-meta">Telegram</th>
                    <th className="col-actions">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((archive) => (
                    <tr key={archive.id}>
                      <td>@{archive.channelLogin}</td>
                      <td className="col-truncate" title={archive.title ?? ""}>
                        {archive.title || archive.channelDisplayName}
                      </td>
                      <td className="col-meta">{archive.categoryName ?? "—"}</td>
                      <td className="col-meta">
                        {archive.startedAt ? new Date(archive.startedAt).toLocaleString() : "—"}
                      </td>
                      <td className="col-meta">
                        {formatPeriod(archive.startedAt, archive.endedAt)}
                      </td>
                      <td className="col-meta">
                        <span
                          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                          title={
                            archive.videoSource === "telegram"
                              ? "Telegram"
                              : archive.videoSource === "local"
                                ? t.replay.sourceLocal
                                : undefined
                          }
                        >
                          {archive.videoSource === "telegram" ? (
                            <SendIcon size={13} />
                          ) : archive.videoSource === "local" ? (
                            <HardDriveIcon size={13} />
                          ) : null}
                          {formatFileSize(archive.fileSizeBytes)}
                        </span>
                      </td>
                      <td className="col-meta">{renderTelegramCell(archive)}</td>
                      <td className="col-actions">
                        <div className="action-row">
                          {archive.videoReady && archive.videoUrl ? (
                            <>
                              <IconLink
                                href={`/admin/archives/${archive.id}`}
                                title={t.common.watch}
                              >
                                <PlayIcon />
                              </IconLink>
                              <a
                                className="icon-btn"
                                href={withAuthToken(
                                  buildApiUrl(`archives/${archive.id}/video?download=1`),
                                )}
                                title={t.localReplay.downloadVideo}
                                download
                              >
                                <DownloadIcon />
                              </a>
                              <a
                                className="icon-btn"
                                href={withAuthToken(
                                  buildApiUrl(`archives/${archive.id}/bundle`),
                                )}
                                title={t.localReplay.downloadBundle}
                                download
                                style={{ position: "relative" }}
                              >
                                <DownloadIcon />
                                <span
                                  style={{
                                    position: "absolute",
                                    bottom: 2,
                                    right: 2,
                                    fontSize: 8,
                                    fontWeight: 700,
                                    color: "var(--accent)",
                                    background: "var(--panel)",
                                    borderRadius: 2,
                                    padding: "0 2px",
                                    lineHeight: 1.1,
                                  }}
                                >
                                  CHAT
                                </span>
                              </a>
                            </>
                          ) : (
                            <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
                              {archive.localFileDeletedAt
                                ? t.archives.localFileDeleted
                                : t.replay.videoPending}
                            </span>
                          )}
                          {archive.status === "completed" &&
                          archive.videoReady &&
                          (archive.telegramStatus === "none" ||
                            archive.telegramStatus === "error") ? (
                            <IconButton
                              title={t.archives.uploadToTelegram}
                              loading={busyArchiveId === archive.id}
                              disabled={busyArchiveId === archive.id}
                              onClick={() => void handleTelegramUpload(archive.id)}
                            >
                              <SendIcon />
                            </IconButton>
                          ) : null}
                          <IconButton
                            title={t.common.delete}
                            className="danger"
                            loading={busyArchiveId === archive.id}
                            disabled={busyArchiveId === archive.id}
                            onClick={() => void handleDelete(archive.id)}
                          >
                            <TrashIcon />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </main>
  );
}
