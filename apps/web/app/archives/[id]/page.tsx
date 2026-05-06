"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend, buildApiUrl } from "../../lib/api";
import { buildMediaUrl, formatFileSize } from "../../lib/media";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useVideoShortcuts } from "../../lib/use-video-shortcuts";
import { useLanguage } from "../../providers";
import { ChatReplay } from "../../components/ChatReplay";
import { DownloadIcon, MaximizeIcon, TrashIcon } from "../../components/icons";
import { formatPeriod } from "../../lib/media";

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
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

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
    if (data?.item.status !== "recording") return undefined;
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, [data?.item.status, load]);

  useEffect(() => {
    setChatMode(searchParams.get("mode") === "chat" ? "with" : "without");
  }, [searchParams]);

  useRealtimeRefresh(load);
  useVideoShortcuts(videoElement);

  const videoSrc = useMemo(() => buildMediaUrl(data?.videoUrl), [data?.videoUrl]);

  async function handleDelete() {
    if (!data || !window.confirm(t.archives.deleteConfirm)) return;
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
    <main className={chatMode === "with" ? "page-shell page-shell--wide" : "page-shell"}>
      <section className="page-header">
        <div>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {data?.item.channelDisplayName ?? t.common.archives}
          </span>
          <h2 className="page-title">{data?.item.title ?? data?.item.channelDisplayName ?? "Replay"}</h2>
          <p className="page-copy">{data?.item.categoryName ?? ""}</p>
        </div>
        <div className="action-row">
          <Link className="btn" href="/archives">
            ← {t.replay.backToArchives}
          </Link>
          <div style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 6 }}>
            <button
              type="button"
              className="btn"
              style={{
                border: "none",
                background: chatMode === "without" ? "var(--accent-soft)" : "transparent",
                borderRadius: 0,
              }}
              onClick={() => setChatMode("without")}
            >
              {t.replay.withoutChat}
            </button>
            <button
              type="button"
              className="btn"
              style={{
                border: "none",
                background: chatMode === "with" ? "var(--accent-soft)" : "transparent",
                borderRadius: 0,
              }}
              onClick={() => setChatMode("with")}
            >
              {t.replay.withChat}
            </button>
          </div>
          <a
            className="icon-btn"
            href={buildApiUrl(`archives/${params.id}/video?download=1`)}
            title={t.localReplay.downloadVideo}
            download
          >
            <DownloadIcon />
          </a>
          <a
            className="icon-btn"
            href={buildApiUrl(`archives/${params.id}/bundle`)}
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
          <Link
            className="icon-btn"
            href={`/archives/${params.id}/theater?chat=${chatMode === "with" ? 1 : 0}`}
            title={t.replay.theaterMode}
          >
            <MaximizeIcon />
          </Link>
          <button
            type="button"
            className="icon-btn danger"
            disabled={busyDelete || data?.item.status === "recording"}
            title={t.replay.deleteArchive}
            onClick={() => void handleDelete()}
          >
            <TrashIcon />
          </button>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {data?.item.status === "recording" ? (
        <div className="notice info">{t.replay.recordingInProgress}</div>
      ) : null}

      <section className={chatMode === "with" ? "replay-grid with-chat" : "replay-grid"}>
        <div className="panel">
          <div className="panel-body">
            {data?.videoReady && videoSrc ? (
              <video
                ref={setVideoElement}
                className="replay-video"
                controls
                preload="metadata"
                src={videoSrc}
              />
            ) : (
              <div className="empty-state">{t.replay.videoPending}</div>
            )}
            <div className="replay-meta" style={{ marginTop: 12 }}>
              <span>
                {t.archives.recordedAt}:
                <strong>
                  {data?.item.startedAt ? new Date(data.item.startedAt).toLocaleString() : "—"}
                </strong>
              </span>
              {data?.item.endedAt ? (
                <span>
                  {t.archives.endedAt}:
                  <strong>{new Date(data.item.endedAt).toLocaleString()}</strong>
                </span>
              ) : null}
              <span>
                {t.common.duration}:
                <strong>{formatPeriod(data?.item.startedAt, data?.item.endedAt)}</strong>
              </span>
              <span>
                {t.archives.size}:
                <strong>{formatFileSize(data?.item.fileSizeBytes)}</strong>
              </span>
            </div>
          </div>
        </div>

        {chatMode === "with" && data ? (
          <aside className="panel chat-panel">
            <ChatReplay
              archiveId={data.item.id}
              videoElement={videoElement}
              isLive={data.item.status === "recording"}
            />
          </aside>
        ) : null}
      </section>
    </main>
  );
}
