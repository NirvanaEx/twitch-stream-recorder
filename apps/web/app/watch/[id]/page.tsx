"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { use } from "react";
import { apiGet, buildApiUrl } from "../../lib/api";
import { buildMediaUrl, formatFileSize, formatPeriod } from "../../lib/media";
import { clearResume, readResume, saveResume } from "../../lib/resume";
import { readRevealed, saveRevealed, useSpoiler } from "../../lib/spoiler";
import { useLanguage } from "../../providers";
import { ChatReplay } from "../../components/ChatReplay";
import { WatchSkeleton } from "../../components/Skeleton";
import { VideoPlayer, type PlayerMode } from "../../components/VideoPlayer";
import { CloudIcon, DownloadIcon, HardDriveIcon, SendIcon } from "../../components/icons";

/** One piece of the recording, and the tier it is read from. */
type PublicPlaybackPart = {
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
  const { t } = useLanguage();
  const { spoilerFree } = useSpoiler();
  const [data, setData] = useState<PublicStreamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PlayerMode>("normal");
  const [chatVisible, setChatVisible] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLMediaElement | null>(null);
  // 1-based index of the Telegram part being played (split recordings only).
  const [currentPart, setCurrentPart] = useState(1);
  const [pendingAutoplay, setPendingAutoplay] = useState(false);

  // The pieces this recording plays back in — chunks off the archive drive,
  // Telegram parts for whatever the drive no longer holds. Empty when it is
  // one stored file.
  const parts = data?.parts ?? [];
  const activePart =
    parts.length > 0 ? parts[Math.min(currentPart, parts.length) - 1] : null;
  const activeSource = activePart?.source ?? data?.videoSource ?? null;

  // Seamless playback: when every part has a known duration, the player shows
  // ONE continuous timeline and switches parts internally.
  const playlist = useMemo(
    () =>
      parts.length > 0 && parts.every((part) => (part.durationSec ?? 0) > 0)
        ? parts.map((part) => ({
            src: buildMediaUrl(part.streamUrl),
            durationSec: part.durationSec as number,
          }))
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.parts],
  );

  // Saved "continue watching" part, captured once for the player's start segment.
  const initialSegmentRef = useRef(0);
  if (initialSegmentRef.current === 0) {
    initialSegmentRef.current = Math.max(1, readResume(id)?.part ?? 1);
  }

  const handleSegmentChange = useCallback((segment: number) => {
    setCurrentPart(segment);
  }, []);

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

  // ---- "Continue watching": restore and persist the position locally ----

  const resumePartAppliedRef = useRef(false);
  const resumeSeekAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (resumePartAppliedRef.current || !data) return;
    resumePartAppliedRef.current = true;

    const saved = readResume(id);
    if (
      saved &&
      parts.length > 1 &&
      saved.part >= 1 &&
      saved.part <= parts.length
    ) {
      setCurrentPart(saved.part);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, parts.length, id]);

  useEffect(() => {
    if (!videoElement || !data) return undefined;

    const key = `${id}:${currentPart}`;
    if (resumeSeekAppliedRef.current === key) return undefined;

    const saved = readResume(id);
    if (!saved || saved.part !== currentPart || saved.time < 10) {
      resumeSeekAppliedRef.current = key;
      return undefined;
    }

    const apply = () => {
      resumeSeekAppliedRef.current = key;
      const total = videoElement.duration;
      if (Number.isFinite(total) && total > 0 && saved.time > total - 30) return;
      videoElement.currentTime = saved.time;
    };

    if (videoElement.readyState >= 1) {
      apply();
      return undefined;
    }

    videoElement.addEventListener("loadedmetadata", apply, { once: true });
    return () => videoElement.removeEventListener("loadedmetadata", apply);
  }, [videoElement, data, currentPart, id]);

  useEffect(() => {
    if (!videoElement || !data) return undefined;

    let lastSavedAt = 0;

    const save = () => {
      const time = videoElement.currentTime;
      if (!Number.isFinite(time) || time < 10) return;

      const total = videoElement.duration;
      const isLastPart = parts.length === 0 || currentPart >= parts.length;

      if (isLastPart && Number.isFinite(total) && total > 0 && total - time < 60) {
        clearResume(id);
        return;
      }

      saveResume(id, currentPart, time);
    };

    const onTimeUpdate = () => {
      const now = Date.now();
      if (now - lastSavedAt < 5000) return;
      lastSavedAt = now;
      save();
    };

    videoElement.addEventListener("timeupdate", onTimeUpdate);
    videoElement.addEventListener("pause", save);

    return () => {
      videoElement.removeEventListener("timeupdate", onTimeUpdate);
      videoElement.removeEventListener("pause", save);
    };
  }, [videoElement, data, currentPart, parts.length, id]);

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
      <div className="public-shell public-shell--watch">
        <WatchSkeleton withChat={chatVisible} />
      </div>
    );
  }

  const videoSrc = activePart
    ? buildMediaUrl(activePart.streamUrl)
    : buildMediaUrl(data.videoUrl) || buildApiUrl(`public/streams/${id}/video`);
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
              {/* Length and file size are two ways of saying the same thing —
                  how long this evening ran — so spoiler-free drops both. */}
              {!spoilerFree && data.startedAt && data.endedAt ? (
                <span>
                  {t.publicSite.durationLabel}:{" "}
                  <strong>{formatPeriod(data.startedAt, data.endedAt)}</strong>
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

          <div className="replay-stage__player">
            <VideoPlayer
              src={videoSrc}
              playlist={playlist ?? undefined}
              initialSegment={initialSegmentRef.current}
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
              timelineStartAt={
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
              chatUrl={`public/streams/${id}/chat`}
              liveEmotesUrl={`public/streams/${id}/emotes/live`}
              timelineUrl={`public/streams/${id}/timeline`}
              eventsUrl={`public/streams/${id}/events`}
              videoElement={videoElement}
              isLive={false}
              defaultOffsetSec={data?.chatOffsetSec ?? 0}
              baseOffsetSec={activePart?.startOffsetSec ?? 0}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
