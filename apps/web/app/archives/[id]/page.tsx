"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { buildMediaUrl, formatFileSize } from "../../lib/media";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useLanguage } from "../../providers";

type ArchiveDetailResponse = {
  item: {
    id: string;
    channelId: string;
    channelLogin: string;
    channelDisplayName: string;
    title: string | null;
    categoryName: string | null;
    status: string;
    chatStatus: string;
    startedAt: string | null;
    endedAt: string | null;
    fileSizeBytes: string | null;
    videoReady: boolean;
    chatAvailable: boolean;
  };
  videoUrl: string | null;
  videoReady: boolean;
  chatAvailable: boolean;
};

export default function ArchiveReplayPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ArchiveDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [chatMode, setChatMode] = useState<"with" | "without">(
    searchParams.get("mode") === "chat" ? "with" : "without",
  );

  const load = useCallback(async () => {
    try {
      const response = await apiGet<ArchiveDetailResponse>(`archives/${params.id}`);
      setData(response);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [params.id, t.errors.apiUnavailable]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (data?.item.status !== "recording") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      void load();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [data?.item.status, load]);

  useEffect(() => {
    setChatMode(searchParams.get("mode") === "chat" ? "with" : "without");
  }, [searchParams]);

  useRealtimeRefresh(load);

  const videoSrc = useMemo(() => {
    return buildMediaUrl(data?.videoUrl);
  }, [data?.videoUrl]);

  async function handleDelete() {
    if (!data || !window.confirm(t.archives.deleteConfirm)) {
      return;
    }

    setBusyDelete(true);
    setError(null);

    try {
      await apiSend(`archives/${data.item.id}`, "DELETE");
      router.push("/archives");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyDelete(false);
    }
  }

  return (
    <main className="page-shell dashboard-shell">
      <section className="page-header compact-header">
        <div>
          <div className="eyebrow">{data?.item.channelDisplayName ?? t.common.archives}</div>
          <h2 className="page-title">{data?.item.title ?? data?.item.channelDisplayName ?? "Replay"}</h2>
          <p className="page-copy">{data?.item.categoryName ?? ""}</p>
        </div>
        <div className="card-actions">
          {data?.item.status === "recording" ? (
            <Link className="secondary-button" href="/recording">
              {t.common.recordingPage}
            </Link>
          ) : null}
          <button
            type="button"
            className="ghost-danger-button"
            disabled={busyDelete || data?.item.status === "recording"}
            onClick={() => void handleDelete()}
          >
            {busyDelete ? `${t.common.delete}...` : t.replay.deleteArchive}
          </button>
          <Link className="secondary-button" href="/archives">
            {t.replay.backToArchives}
          </Link>
        </div>
      </section>

      {error ? <div className="notice error-notice">{error}</div> : null}
      {data?.item.status === "recording" ? (
        <div className="notice info-notice">{t.replay.recordingInProgress}</div>
      ) : null}

      <section className={chatMode === "with" ? "replay-grid with-chat" : "replay-grid"}>
        <div className="panel replay-panel">
          <div className="section-head">
            <div className="offset-controls">
              <button
                type="button"
                className={chatMode === "without" ? "active-button" : ""}
                onClick={() => setChatMode("without")}
              >
                {t.replay.withoutChat}
              </button>
              <button
                type="button"
                className={chatMode === "with" ? "active-button" : ""}
                onClick={() => setChatMode("with")}
              >
                {t.replay.withChat}
              </button>
            </div>
            <div className="archive-meta-grid">
              <span>
                {t.archives.recordedAt}:{" "}
                {data?.item.startedAt ? new Date(data.item.startedAt).toLocaleString() : "-"}
              </span>
              <span>
                {t.archives.size}: {formatFileSize(data?.item.fileSizeBytes)}
              </span>
            </div>
          </div>

          {data?.videoReady && videoSrc ? (
            <video className="replay-video" controls preload="metadata" src={videoSrc} />
          ) : (
            <div className="empty-state">{t.replay.videoPending}</div>
          )}
        </div>

        {chatMode === "with" ? (
          <aside className="panel chat-panel">
            <h3 className="section-title">{t.replay.withChat}</h3>
            <div className="empty-state">
              {data?.item.chatStatus === "not_configured"
                ? t.replay.chatNotConfigured
                : t.replay.chatUnavailable}
            </div>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
