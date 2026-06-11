"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { use } from "react";
import { apiGet, buildApiUrl } from "../../lib/api";
import { buildMediaUrl, formatFileSize, formatPeriod } from "../../lib/media";
import { useLanguage } from "../../providers";
import { ChatReplay } from "../../components/ChatReplay";
import { VideoPlayer, type PlayerMode } from "../../components/VideoPlayer";
import { DownloadIcon } from "../../components/icons";

type PublicTelegramPart = {
  partIndex: number;
  partCount: number;
  streamUrl: string;
  startOffsetSec: number;
  durationSec: number | null;
};

type PublicStreamDetail = {
  id: string;
  title: string | null;
  categoryName: string | null;
  channel: {
    login: string;
    displayName: string;
    profileImageUrl: string | null;
  };
  previewImageUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
  fileSizeBytes: string | null;
  videoUrl: string;
  videoSource: "local" | "telegram";
  telegramParts: PublicTelegramPart[];
};

// Shared with the admin replay page: chat is ON by default, the in-player
// toggle persists the user's preference.
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
  return true;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function PublicWatchPage({
  params,
}: {
  // Next.js 15 App Router: params is a Promise.
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [data, setData] = useState<PublicStreamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PlayerMode>("normal");
  const [chatVisible, setChatVisible] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  // 1-based index of the Telegram part being played (split recordings only).
  const [currentPart, setCurrentPart] = useState(1);
  const [pendingAutoplay, setPendingAutoplay] = useState(false);

  const telegramParts =
    data?.videoSource === "telegram" ? data.telegramParts ?? [] : [];
  const activePart =
    telegramParts.length > 0
      ? telegramParts[Math.min(currentPart, telegramParts.length) - 1]
      : null;

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

  useEffect(() => {
    setChatVisible(readStoredChatPref());
  }, []);

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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await apiGet<{ item: PublicStreamDetail }>(
          `public/streams/${id}`,
        );
        if (!cancelled) {
          setData(response.item);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t.publicSite.notFound);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, t.publicSite.notFound]);

  if (error) {
    return (
      <div className="public-shell">
        <Link href="/" className="auth-back" style={{ display: "inline-block", marginBottom: 12 }}>
          {t.publicSite.backToList}
        </Link>
        <div className="empty-state">
          {t.publicSite.notFound}
          <div style={{ marginTop: 8, color: "var(--text-faint)", fontSize: 13 }}>
            {t.publicSite.notFoundHint}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="public-shell">
        <div className="empty-state">{t.common.loading}</div>
      </div>
    );
  }

  const videoSrc = activePart
    ? buildMediaUrl(activePart.streamUrl)
    : buildMediaUrl(data.videoUrl) || buildApiUrl(`public/streams/${id}/video`);
  const posterSrc = data.previewImageUrl ?? undefined;
  const playerTitle = data.title || data.channel.displayName;

  const stageClass = [
    "replay-stage",
    `replay-stage--${mode}`,
    chatVisible ? "has-chat" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Keep one stable DOM tree across normal / theater / fullscreen so the
  // <video> element never re-mounts and playback continues seamlessly.
  return (
    <div className={mode === "theater" ? "replay-page-host" : "public-shell"}>
      <div className={stageClass}>
        <header className="replay-stage__header">
          <Link
            href="/"
            className="auth-back"
            style={{ display: "inline-block", marginBottom: 12 }}
          >
            {t.publicSite.backToList}
          </Link>

          <div className="watch-channel-row" style={{ marginBottom: 8 }}>
            {data.channel.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.channel.profileImageUrl}
                alt={data.channel.displayName}
                className="stream-card-avatar"
              />
            ) : (
              <span className="stream-card-avatar fallback">
                {data.channel.displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <h2 className="page-title" style={{ margin: 0 }}>
                {playerTitle}
              </h2>
              <div style={{ color: "var(--text-faint)", fontSize: 12 }}>
                {data.channel.displayName} · @{data.channel.login}
                {data.categoryName ? ` · ${data.categoryName}` : ""}
              </div>
            </div>
          </div>

          <div className="replay-meta">
            <span>
              {t.archives.recordedAt}: <strong>{formatDate(data.startedAt)}</strong>
            </span>
            {data.startedAt && data.endedAt ? (
              <span>
                {t.publicSite.durationLabel}:{" "}
                <strong>{formatPeriod(data.startedAt, data.endedAt)}</strong>
              </span>
            ) : null}
            {data.fileSizeBytes ? (
              <span>
                {t.archives.size}: <strong>{formatFileSize(data.fileSizeBytes)}</strong>
              </span>
            ) : null}
            {data.videoSource ? (
              <span>
                {t.replay.sourceLabel}:{" "}
                <strong>
                  {data.videoSource === "telegram" ? "Telegram" : t.replay.sourceLocal}
                </strong>
              </span>
            ) : null}
            <a
              className="icon-btn"
              href={buildApiUrl(
                activePart
                  ? `public/streams/${id}/video?part=${activePart.partIndex}&download=1`
                  : `public/streams/${id}/video?download=1`,
              )}
              title={t.localReplay.downloadVideo}
              download
            >
              <DownloadIcon />
            </a>
          </div>
        </header>

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
          <VideoPlayer
            src={videoSrc}
            poster={posterSrc}
            mode={mode}
            onModeChange={setMode}
            chatVisible={chatVisible}
            showChatButton
            onChatToggle={() => setChatVisible((value) => !value)}
            onVideoElement={setVideoElement}
            title={mode !== "normal" ? playerTitle : undefined}
          />
        </div>

        {chatVisible ? (
          <aside className="replay-stage__chat">
            <ChatReplay
              chatUrl={`public/streams/${id}/chat`}
              videoElement={videoElement}
              isLive={false}
              baseOffsetSec={activePart?.startOffsetSec ?? 0}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
