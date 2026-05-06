"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../lib/api";
import { formatFileSize } from "../lib/media";
import { useRealtimeRefresh } from "../lib/use-realtime-refresh";
import { useLanguage } from "../providers";

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
};

type ArchivesResponse = {
  items: ArchiveItem[];
};

export default function ArchivesPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyArchiveId, setBusyArchiveId] = useState<string | null>(null);

  const loadArchives = useCallback(async () => {
    try {
      const response = await apiGet<ArchivesResponse>("archives");
      setItems(response.items.filter((item) => item.status !== "recording"));
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [t.errors.apiUnavailable]);

  useEffect(() => {
    void loadArchives();
  }, [loadArchives]);

  useRealtimeRefresh(loadArchives);

  async function handleDelete(archiveId: string) {
    if (!window.confirm(t.archives.deleteConfirm)) {
      return;
    }

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
    <main className="page-shell dashboard-shell">
      <section className="page-header">
        <h2 className="page-title">{t.archives.title}</h2>
        <p className="page-copy">{t.archives.subtitle}</p>
      </section>

      {error ? <div className="notice error-notice">{error}</div> : null}
      {success ? <div className="notice success-notice">{success}</div> : null}

      <section className="list-grid">
        {items.length ? (
          items.map((archive) => (
            <div className="panel archive-card-large" key={archive.id}>
              <div>
                <p className="row-title">{archive.title ?? archive.channelDisplayName}</p>
                <p className="row-subtitle">@{archive.channelLogin}</p>
              </div>

              <div className="archive-meta-grid">
                <span>
                  {t.archives.category}: {archive.categoryName ?? "-"}
                </span>
                <span>
                  {t.archives.recordedAt}:{" "}
                  {archive.startedAt ? new Date(archive.startedAt).toLocaleString() : "-"}
                </span>
                <span>
                  {t.archives.size}: {formatFileSize(archive.fileSizeBytes)}
                </span>
              </div>

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

                <button
                  type="button"
                  className="ghost-danger-button"
                  disabled={busyArchiveId === archive.id}
                  onClick={() => void handleDelete(archive.id)}
                >
                  {busyArchiveId === archive.id ? `${t.common.delete}...` : t.common.delete}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">{t.archives.empty}</div>
        )}
      </section>
    </main>
  );
}
