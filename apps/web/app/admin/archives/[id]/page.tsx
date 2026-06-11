"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend, buildApiUrl } from "../../../lib/api";
import {
  buildAuthenticatedMediaUrl,
  formatFileSize,
  formatPeriod,
  withAuthToken,
} from "../../../lib/media";
import { useRealtimeRefresh } from "../../../lib/use-realtime-refresh";
import { useLanguage } from "../../../providers";
import { ChatReplay } from "../../../components/ChatReplay";
import { VideoPlayer, type PlayerMode } from "../../../components/VideoPlayer";
import { DownloadIcon, TrashIcon } from "../../../components/icons";

type TelegramPart = {
  partIndex: number;
  partCount: number;
  url: string | null;
  streamUrl: string;
  startOffsetSec: number;
  durationSec: number | null;
};

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
    videoSource: "local" | "telegram" | null;
    chatAvailable: boolean;
    telegramStatus: string;
    telegramParts: TelegramPart[];
    localFileDeletedAt: string | null;
  };
  videoUrl: string | null;
  videoReady: boolean;
  chatAvailable: boolean;
};

// v2: chat is now ON by default and only hidden when the user clicks the
// in-player chat toggle. The key bump resets stale "hidden" preferences
// left over from the old "Without chat" entry button.
const CHAT_PREF_KEY = "tsr-replay-chat-visible-v2";

function readStoredChatPref(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(CHAT_PREF_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    // Ignore.
  }
  return true; // default ON
}

export default function ArchiveReplayPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<ArchiveDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [chatVisible, setChatVisible] = useState<boolean>(true);
  const [mode, setMode] = useState<PlayerMode>("normal");
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  // 1-based index of the Telegram part being played (split recordings only).
  const [currentPart, setCurrentPart] = useState(1);
  const [pendingAutoplay, setPendingAutoplay] = useState(false);

  // Restore the user's stored chat preference on mount. Default is ON;
  // toggling the in-player chat button persists the choice for next time.
  useEffect(() => {
    setChatVisible(readStoredChatPref());
  }, []);

  // Persist user's choice once they toggle.
  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_PREF_KEY, chatVisible ? "1" : "0");
    } catch {
      // Ignore (private mode, etc.)
    }
  }, [chatVisible]);

  // Lock the body when the theater overlay is up so the page behind it
  // does not scroll.
  useEffect(() => {
    if (mode !== "theater") return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);

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

  useRealtimeRefresh(load);

  // Telegram-offloaded recordings are streamed back part by part; locally
  // stored ones keep playing the single full file.
  const telegramParts = useMemo(
    () => (data?.item.videoSource === "telegram" ? data.item.telegramParts : []),
    [data?.item.videoSource, data?.item.telegramParts],
  );
  const activePart =
    telegramParts.length > 0
      ? telegramParts[Math.min(currentPart, telegramParts.length) - 1]
      : null;

  // The /api/archives/:id/video endpoint is auth-protected; <video> can't
  // attach the Authorization header, so we sign the URL with `?token=`.
  const videoSrc = useMemo(
    () => buildAuthenticatedMediaUrl(activePart ? activePart.streamUrl : data?.videoUrl),
    [activePart, data?.videoUrl],
  );

  useEffect(() => {
    setCurrentPart(1);
  }, [params.id]);

  // Auto-advance to the next part when the current one finishes.
  useEffect(() => {
    if (!videoElement || telegramParts.length < 2) return undefined;

    const onEnded = () => {
      setCurrentPart((part) => {
        if (part < telegramParts.length) {
          setPendingAutoplay(true);
          return part + 1;
        }
        return part;
      });
    };

    videoElement.addEventListener("ended", onEnded);
    return () => videoElement.removeEventListener("ended", onEnded);
  }, [videoElement, telegramParts.length]);

  // Resume playback once the next part's metadata is in.
  useEffect(() => {
    if (!pendingAutoplay || !videoElement) return undefined;

    const onLoaded = () => {
      setPendingAutoplay(false);
      void videoElement.play().catch(() => undefined);
    };

    videoElement.addEventListener("loadedmetadata", onLoaded, { once: true });
    return () => videoElement.removeEventListener("loadedmetadata", onLoaded);
  }, [pendingAutoplay, videoElement, currentPart]);

  async function handleDelete() {
    if (!data || !window.confirm(t.archives.deleteConfirm)) return;
    setBusyDelete(true);
    setError(null);
    try {
      await apiSend(`archives/${data.item.id}`, "DELETE");
      router.push("/admin/archives");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyDelete(false);
    }
  }

  const isLive = data?.item.status === "recording";
  const hasChat = chatVisible && Boolean(data);
  const stageClass = [
    "replay-stage",
    `replay-stage--${mode}`,
    hasChat ? "has-chat" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const playerTitle =
    data?.item.title ?? data?.item.channelDisplayName ?? "Replay";

  // We keep a single, stable DOM tree across modes so the <video>
  // element inside <VideoPlayer> never re-mounts and playback continues
  // smoothly when toggling between normal / theater / fullscreen.
  // The wrapping <main> stays mounted; CSS classes on the stage handle
  // the visual switch (fixed overlay in theater, native fullscreen API
  // for fullscreen).
  return (
    <main className={mode === "theater" ? "replay-page-host" : "page-shell page-shell--wide"}>
      <div className={stageClass}>
        <header className="replay-stage__header page-header">
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
            <h2 className="page-title">{playerTitle}</h2>
            <p className="page-copy">{data?.item.categoryName ?? ""}</p>
            <div className="replay-meta" style={{ marginTop: 8 }}>
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
              {data?.item.videoSource ? (
                <span>
                  {t.replay.sourceLabel}:
                  <strong>
                    {data.item.videoSource === "telegram" ? "Telegram" : t.replay.sourceLocal}
                  </strong>
                </span>
              ) : null}
            </div>
          </div>
          <div className="action-row">
            <Link className="btn" href="/admin/archives">
              ← {t.replay.backToArchives}
            </Link>
            <a
              className="icon-btn"
              href={withAuthToken(
                buildApiUrl(
                  activePart
                    ? `archives/${params.id}/video?part=${activePart.partIndex}&download=1`
                    : `archives/${params.id}/video?download=1`,
                ),
              )}
              title={t.localReplay.downloadVideo}
              download
            >
              <DownloadIcon />
            </a>
            <a
              className="icon-btn"
              href={withAuthToken(buildApiUrl(`archives/${params.id}/bundle`))}
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
            <button
              type="button"
              className="icon-btn danger"
              disabled={busyDelete || isLive}
              title={t.replay.deleteArchive}
              onClick={() => void handleDelete()}
            >
              <TrashIcon />
            </button>
          </div>
        </header>

        {mode === "normal" && error ? <div className="notice error">{error}</div> : null}
        {mode === "normal" && isLive ? (
          <div className="notice info">{t.replay.recordingInProgress}</div>
        ) : null}

        {telegramParts.length > 1 ? (
          <div className="action-row" style={{ margin: "8px 0", flexWrap: "wrap" }}>
            {telegramParts.map((part) => (
              <button
                key={part.partIndex}
                type="button"
                className={`btn ${part.partIndex === currentPart ? "primary" : ""}`}
                onClick={() => {
                  if (part.partIndex === currentPart) return;
                  setPendingAutoplay(true);
                  setCurrentPart(part.partIndex);
                }}
              >
                {t.archives.telegramPart} {part.partIndex}/{part.partCount}
              </button>
            ))}
          </div>
        ) : null}

        <div className="replay-stage__player">
          {data?.videoReady && videoSrc ? (
            <VideoPlayer
              src={videoSrc}
              mode={mode}
              onModeChange={setMode}
              chatVisible={chatVisible}
              showChatButton={Boolean(data)}
              onChatToggle={() => setChatVisible((value) => !value)}
              onVideoElement={setVideoElement}
              isLive={isLive}
              autoPlay={false}
              title={mode !== "normal" ? playerTitle : undefined}
              emptyText={t.replay.videoPending}
            />
          ) : (
            <div className="vp">
              <div className="vp__empty">
                {data?.item.localFileDeletedAt ? (
                  <span style={{ display: "inline-flex", gap: 10, flexWrap: "wrap" }}>
                    {t.archives.localFileDeleted}
                    {(data.item.telegramParts ?? []).map((part) =>
                      part.url ? (
                        <a key={part.partIndex} href={part.url} target="_blank" rel="noreferrer">
                          {part.partCount > 1
                            ? `${t.archives.telegramPart} ${part.partIndex}/${part.partCount}`
                            : t.archives.openInTelegram}
                        </a>
                      ) : null,
                    )}
                  </span>
                ) : (
                  t.replay.videoPending
                )}
              </div>
            </div>
          )}
        </div>

        {hasChat ? (
          <aside className="replay-stage__chat">
            <ChatReplay
              archiveId={data!.item.id}
              videoElement={videoElement}
              isLive={isLive}
              baseOffsetSec={activePart?.startOffsetSec ?? 0}
            />
          </aside>
        ) : null}
      </div>
    </main>
  );
}
