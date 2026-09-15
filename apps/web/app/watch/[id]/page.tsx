"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { use } from "react";
import { apiGet, buildApiUrl } from "../../lib/api";
import { buildMediaUrl, formatFileSize, formatPeriod, formatSeconds } from "../../lib/media";
import { useRecordingPlayback } from "../../lib/use-recording-playback";
import { BroadcastSummary } from "../../components/BroadcastSummary";
import { StorageBadges, PlaybackSourceSelect } from "../../components/RecordingSources";
import type { RecordingStorage, PlaybackChoice, SourcePart, BroadcastInfo } from "../../lib/playback-sources";
import { readRevealed, saveRevealed, useSpoiler } from "../../lib/spoiler";
import { useLanguage } from "../../providers";
import { ChatReplay } from "../../components/ChatReplay";
import { WatchSkeleton } from "../../components/Skeleton";
import { VideoPlayer, type PlayerMode } from "../../components/VideoPlayer";
import { CloudIcon, DownloadIcon, HardDriveIcon, SendIcon } from "../../components/icons";

/** One piece of the recording, and the tier it is read from. */
type PublicPlaybackPart = SourcePart & {
  partIndex: number;
  partCount: number;
  streamUrl: string;
  startOffsetSec: number;
  durationSec: number | null;
  source: "local" | "drive" | "telegram";
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
  thumbnailUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
  fileSizeBytes: string | null;
  videoUrl: string;
  hlsUrl?: string;
  previewFrames?: { baseUrl: string; count: number; intervalSec: number };
  broadcast?: BroadcastInfo | null;
  storage?: RecordingStorage;
  playbackSources?: PlaybackChoice[];
  videoSource: "local" | "drive" | "telegram";
  audioOnly: boolean;
  chatOffsetSec: number;
  parts: PublicPlaybackPart[];
  /** Wall-clock moment of the video's first frame. */
  mediaStartedAt: string | null;
  durationSec: number | null;
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
  const searchParams = useSearchParams();
  const single = searchParams.get("single") === "1";
  const { t } = useLanguage();
  const { spoilerFree } = useSpoiler();
  const [data, setData] = useState<PublicStreamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PlayerMode>("normal");
  const [chatVisible, setChatVisible] = useState(true);
  const playback = useRecordingPlayback(id, data ?? null, buildMediaUrl, single);
  const { videoElement, setVideoElement, currentPart, setCurrentPart, parts, activePart, activeSource, videoSrc, playlist } = playback;
  const chatSessionId = activePart?.sessionId ?? id;
  const handleSegmentChange = useCallback((segment: number) => setCurrentPart(segment), [setCurrentPart]);
  const [pendingAutoplay, setPendingAutoplay] = useState(false);

  // How far into this recording the viewer has ever got — the line the
  // spoiler-free timeline draws its fog behind. Read once, so the player owns
  // it for the rest of the session, and written back as it advances.
  const initialRevealedRef = useRef(0);
  if (initialRevealedRef.current === 0) {
    initialRevealedRef.current = readRevealed(id);
  }

  const handleRevealed = useCallback(
    (seconds: number) => {
      saveRevealed(id, seconds);
    },
    [id],
  );

  // Auto-advance to the next part when the current one finishes (fallback
  // mode only — with a playlist the player handles this internally).
  useEffect(() => {
    if (playlist || !videoElement || parts.length < 2) return undefined;

    const onEnded = () => {
      setCurrentPart((part) => {
        if (part < parts.length) {
          setPendingAutoplay(true);
          return part + 1;
        }
        return part;
      });
    };

    videoElement.addEventListener("ended", onEnded);
    return () => videoElement.removeEventListener("ended", onEnded);
  }, [playlist, videoElement, parts.length]);

  // Resume playback once the next part's metadata is in (fallback mode).
  useEffect(() => {
    if (playlist || !pendingAutoplay || !videoElement) return undefined;

    const onLoaded = () => {
      setPendingAutoplay(false);
      void videoElement.play().catch(() => undefined);
    };

    videoElement.addEventListener("loadedmetadata", onLoaded, { once: true });
    return () => videoElement.removeEventListener("loadedmetadata", onLoaded);
  }, [playlist, pendingAutoplay, videoElement, currentPart]);

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
          `public/streams/${id}${single ? "?single=1" : ""}`,
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
  }, [id, single, t.publicSite.notFound]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void apiGet<{ item: PublicStreamDetail }>(`public/streams/${id}${single ? "?single=1" : ""}`).then((response) => {
        if (!cancelled) setData(response.item);
      }).catch(() => undefined);
    }, 30000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [id, single]);

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
      <div className="public-shell public-shell--watch">
        <WatchSkeleton withChat={chatVisible} />
      </div>
    );
  }

  const posterSrc = data.thumbnailUrl ?? data.previewImageUrl ?? undefined;
  const playerTitle = data.title || data.channel.displayName;

  const stageClass = [
    "replay-stage",
    `replay-stage--${mode}`,
    // Screen-fit: the stage takes exactly the viewport height and the two
    // columns (video+info | chat) divide it, so the page itself never scrolls.
    "replay-stage--fit",
    chatVisible ? "has-chat" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Keep one stable DOM tree across normal / theater / fullscreen so the
  // <video> element never re-mounts and playback continues seamlessly.
  return (
    <div
      className={
        mode === "theater" ? "replay-page-host" : "public-shell public-shell--watch"
      }
    >
      <div className={stageClass}>
        <div className="replay-stage__main">
          <header className="replay-stage__header replay-stage__header--sources">
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
              {/* Length and file size are two ways of saying the same thing —
                  how long this evening ran — so spoiler-free drops both. */}
              {!spoilerFree && data.startedAt && data.endedAt ? (
                <span>
                  {t.publicSite.durationLabel}:{" "}
                  <strong>{data.durationSec ? formatSeconds(data.durationSec) : formatPeriod(data.startedAt, data.endedAt)}</strong>
                </span>
              ) : null}
              {!spoilerFree && data.fileSizeBytes ? (
                <span>
                  {t.archives.size}: <strong>{formatFileSize(data.fileSizeBytes)}</strong>
                </span>
              ) : null}
              {activeSource ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  {activeSource === "telegram" ? (
                    <SendIcon size={13} />
                  ) : activeSource === "drive" ? (
                    <CloudIcon size={13} />
                  ) : (
                    <HardDriveIcon size={13} />
                  )}
                  {t.replay.sourceLabel}:{" "}
                  <strong>
                    {activeSource === "telegram"
                      ? "Telegram"
                      : activeSource === "drive"
                        ? "Google Drive"
                        : t.replay.sourceLocal}
                  </strong>
                </span>
              ) : null}
              <a
                className="icon-btn"
                href={`${videoSrc}${videoSrc.includes("?") ? "&" : "?"}download=1`}
                title={t.localReplay.downloadVideo}
                download
              >
                <DownloadIcon />
              </a>
            </div>
            <StorageBadges storage={data.storage} />
            <BroadcastSummary broadcast={data.broadcast} current={activePart?.continuationIndex} />
          </header>

          {!playlist && mode === "normal" && parts.length > 1 ? (
            <div className="action-row" style={{ margin: "8px 0" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                {t.archives.telegramPart}
                <select
                  className="input"
                  style={{ width: "auto", padding: "4px 8px" }}
                  value={currentPart}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (next === currentPart) return;
                    setPendingAutoplay(true);
                    setCurrentPart(next);
                  }}
                >
                  {parts.map((part) => (
                    <option key={part.partIndex} value={part.partIndex}>
                      {part.partIndex} / {part.partCount}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {data.storage ? (
            <div className="replay-source-toolbar">
              <PlaybackSourceSelect storage={data.storage} choices={data.playbackSources} value={playback.selectedSource} onChange={(source) => { setPendingAutoplay(false); playback.changeSource(source); }} />
            </div>
          ) : null}

          <div className="replay-stage__player">
            <VideoPlayer
              src={videoSrc}
              hlsUrl={!data.playbackSources?.length && data.hlsUrl && searchParams.get("delivery") !== "mp4" ? buildMediaUrl(data.hlsUrl) : undefined}
              previewFrames={data.previewFrames ? {
                ...data.previewFrames, baseUrl: buildMediaUrl(data.previewFrames.baseUrl),
              } : undefined}
              playlist={playlist ?? undefined}
              initialSegment={playback.initialSegment}
              playbackKey={playback.playbackKey}
              initialPlayback={playback.initialPlayback}
              onSegmentChange={handleSegmentChange}
              audioOnly={data.audioOnly}
              artworkUrl={data.channel.profileImageUrl}
              poster={posterSrc}
              mode={mode}
              onModeChange={setMode}
              chatVisible={chatVisible}
              showChatButton
              onChatToggle={() => setChatVisible((value) => !value)}
              onVideoElement={setVideoElement}
              title={mode !== "normal" ? playerTitle : undefined}
              timelineStartAt={activePart?.sessionMediaStartedAt ? new Date(activePart.sessionMediaStartedAt).getTime() + ((activePart.sessionOffsetSec ?? 0) - activePart.startOffsetSec) * 1000 :
                data.mediaStartedAt ? new Date(data.mediaStartedAt).getTime() : null
              }
              spoilerFree={spoilerFree}
              initialRevealedSec={initialRevealedRef.current}
              onRevealedChange={handleRevealed}
            />
          </div>
        </div>

        {chatVisible ? (
          <aside className="replay-stage__chat">
            <ChatReplay
              key={chatSessionId}
              chatUrl={`public/streams/${chatSessionId}/chat`}
              historySessionId={chatSessionId}
              liveEmotesUrl={`public/streams/${chatSessionId}/emotes/live`}
              timelineUrl={`public/streams/${chatSessionId}/timeline`}
              eventsUrl={`public/streams/${chatSessionId}/events`}
              videoElement={videoElement}
              isLive={false}
              defaultOffsetSec={activePart?.sessionChatOffsetSec ?? data?.chatOffsetSec ?? 0}
              baseOffsetSec={activePart?.sessionOffsetSec ?? activePart?.startOffsetSec ?? 0}
              isLastPart={parts.length === 0 || currentPart >= parts.length}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
