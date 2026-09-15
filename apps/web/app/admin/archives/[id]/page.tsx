"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiSend, buildApiUrl } from "../../../lib/api";
import {
  buildAuthenticatedMediaUrl,
  formatFileSize,
  formatPeriod,
  formatSeconds,
  withAuthToken,
} from "../../../lib/media";
import { useRealtimeRefresh } from "../../../lib/use-realtime-refresh";
import { useLanguage } from "../../../providers";
import { ChatReplay } from "../../../components/ChatReplay";
import {
  TelegramSpeedChip,
  type TelegramStreamStats,
} from "../../../components/TelegramSpeedChip";
import { VideoPlayer, type PlayerMode } from "../../../components/VideoPlayer";
import {
  ChatDownloadIcon,
  CloudIcon,
  DownloadIcon,
  HardDriveIcon,
  SendIcon,
  TrashIcon,
} from "../../../components/icons";
import { useRecordingPlayback } from "../../../lib/use-recording-playback";
import { BroadcastSummary } from "../../../components/BroadcastSummary";
import { StorageBadges, PlaybackSourceSelect } from "../../../components/RecordingSources";
import type { RecordingStorage, PlaybackChoice, SourcePart, BroadcastInfo } from "../../../lib/playback-sources";
import { readRevealed, saveRevealed, useSpoiler } from "../../../lib/spoiler";

type TelegramPart = {
  partIndex: number;
  partCount: number;
  url: string | null;
  streamUrl: string;
  startOffsetSec: number;
  durationSec: number | null;
};

/** One piece of the recording, and the tier it is read from. */
type PlaybackPart = TelegramPart & SourcePart & {
  source: "local" | "drive" | "telegram";
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
    broadcast?: BroadcastInfo | null;
  storage?: RecordingStorage;
    playbackSources?: PlaybackChoice[];
    videoUrl?: string | null;
    videoSource: "local" | "drive" | "telegram" | null;
    audioOnly: boolean;
    channelProfileImageUrl: string | null;
    chatAvailable: boolean;
    chatOffsetSec: number;
    telegramStatus: string;
    telegramParts: TelegramPart[];
    parts: PlaybackPart[];
    localFileDeletedAt: string | null;
    /** Wall-clock moment of the video's first frame (see serializeSession). */
    mediaStartedAt: string | null;
    /** Probed length of the recorded file — NOT the whole-broadcast span. */
    recordingDurationSec: number | null;
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
  const { spoilerFree } = useSpoiler();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const single = useSearchParams().get("single") === "1";

  const [data, setData] = useState<ArchiveDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [chatVisible, setChatVisible] = useState<boolean>(true);
  const [mode, setMode] = useState<PlayerMode>("normal");
  const playback = useRecordingPlayback(params.id, data?.item ?? null, buildAuthenticatedMediaUrl, single);
  const { videoElement, setVideoElement, currentPart, setCurrentPart, parts, activePart, activeSource, videoSrc, playlist } = playback;
  const chatSessionId = activePart?.sessionId ?? params.id;
  const handleSegmentChange = useCallback((segment: number) => setCurrentPart(segment), [setCurrentPart]);
  const [pendingAutoplay, setPendingAutoplay] = useState(false);
  // Live Telegram streaming throughput, shown as a chip next to the source.
  const [tgStats, setTgStats] = useState<TelegramStreamStats | null>(null);

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
      const response = await apiGet<ArchiveDetailResponse>(`archives/${params.id}${single ? "?single=1" : ""}`);
      setData(response);
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [params.id, single, t.errors.apiUnavailable]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (data?.item.status !== "recording") return undefined;
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, [data?.item.status, load]);

  useRealtimeRefresh(load);

  // Furthest point ever reached in this recording — the spoiler-free timeline
  // draws its fog behind it. Shared storage with the public watch page, so
  // switching between the two does not reset what has been seen.
  const initialRevealedRef = useRef(0);
  if (initialRevealedRef.current === 0) {
    initialRevealedRef.current = readRevealed(params.id);
  }

  const handleRevealed = useCallback(
    (seconds: number) => {
      saveRevealed(params.id, seconds);
    },
    [params.id],
  );


  // Poll live Telegram throughput while watching a Telegram-sourced archive.
  // The endpoint is cheap and returns { active: false } when nothing streams.
  // Nothing to poll while the piece being played comes off the drive.
  useEffect(() => {
    if (activeSource !== "telegram") {
      setTgStats(null);
      return undefined;
    }

    let cancelled = false;
    const poll = () => {
      apiGet<TelegramStreamStats>(`archives/${chatSessionId}/stream-stats`)
        .then((stats) => {
          if (!cancelled) setTgStats(stats);
        })
        .catch(() => undefined);
    };

    poll();
    const timer = window.setInterval(poll, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeSource, chatSessionId]);

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
    // One-screen stage, same as the public watch page: video and chat divide
    // the viewport, nothing dangles below. The admin shell reacts via
    // .app-frame:has(.replay-stage--fit) and hands the height down.
    "replay-stage--fit",
    hasChat ? "has-chat" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const playerTitle =
    data?.item.title ?? data?.item.channelDisplayName ?? "Replay";

  // Wall-clock window the recording actually covers. The old
  // formatPeriod(startedAt, endedAt) span measured go-live -> capture end,
  // which showed "4h 44m" for a 3-minute capture that joined mid-stream.
  const mediaStartMs = data?.item.mediaStartedAt
    ? new Date(data.item.mediaStartedAt).getTime()
    : null;
  const recordingWindow = (() => {
    if (!mediaStartMs || !Number.isFinite(mediaStartMs)) return null;
    const start = new Date(mediaStartMs);
    const duration = data?.item.recordingDurationSec ?? null;
    const startText = start.toLocaleTimeString();
    if (!duration) return { text: startText, utc: start.toISOString() };
    const end = new Date(mediaStartMs + duration * 1000);
    return {
      text: `${startText}–${end.toLocaleTimeString()} · ${formatSeconds(duration)}`,
      utc: `${start.toISOString()} – ${end.toISOString()}`,
    };
  })();

  // We keep a single, stable DOM tree across modes so the <video>
  // element inside <VideoPlayer> never re-mounts and playback continues
  // smoothly when toggling between normal / theater / fullscreen.
  // The wrapping <main> stays mounted; CSS classes on the stage handle
  // the visual switch (fixed overlay in theater, native fullscreen API
  // for fullscreen).
  return (
    <main className={mode === "theater" ? "replay-page-host" : "page-shell page-shell--wide"}>
      <div className={stageClass}>
        {/* Everything except the chat lives in one column. The stage used to be
            a grid with named areas for header/player/chat only, so notices and
            the part selector were auto-placed into implicit rows BELOW the
            video — an error about the archive rendered under the player. */}
        <div className="replay-stage__main">
          <header className="replay-stage__header replay-stage__header--sources">
            <Link className="replay-back" href="/admin/archives" title={t.replay.backToArchives}>
              ←
            </Link>

            <div className="replay-titles">
              <h2 className="replay-title" title={playerTitle}>
                {playerTitle}
              </h2>
              <div className="replay-subtitle">
                <span>{data?.item.channelDisplayName ?? t.common.archives}</span>
                {data?.item.categoryName ? <span>{data.item.categoryName}</span> : null}
                {isLive ? <span className="badge live">{t.common.recording}</span> : null}
              </div>
            </div>

            <div className="action-row">
              <a
                className="icon-btn"
                href={`${videoSrc}${videoSrc.includes("?") ? "&" : "?"}download=1`}
                title={t.localReplay.downloadVideo}
                download
              >
                <DownloadIcon />
              </a>
              <a
                className="icon-btn"
                href={withAuthToken(buildApiUrl(`archives/${chatSessionId}/bundle`))}
                title={t.localReplay.downloadBundle}
                download
              >
                <ChatDownloadIcon />
              </a>
              {!data?.item.broadcast ? <button
                type="button"
                className="icon-btn danger"
                disabled={busyDelete || isLive}
                title={t.replay.deleteArchive}
                onClick={() => void handleDelete()}
              >
                <TrashIcon />
              </button> : null}
            </div>
            <StorageBadges storage={data?.item.storage} />
            <BroadcastSummary broadcast={data?.item.broadcast} admin current={activePart?.continuationIndex} />
          </header>

          {mode === "normal" && error ? <div className="notice error">{error}</div> : null}

          {data?.videoReady && videoSrc && data.item.storage ? (
            <div className="replay-source-toolbar">
              <PlaybackSourceSelect storage={data.item.storage} choices={data.item.playbackSources} value={playback.selectedSource} onChange={(source) => { setPendingAutoplay(false); playback.changeSource(source); }} />
            </div>
          ) : null}

          <div className="replay-stage__player">
            {data?.videoReady && videoSrc ? (
              <VideoPlayer
                src={videoSrc}
                playlist={playlist ?? undefined}
                initialSegment={playback.initialSegment}
              playbackKey={playback.playbackKey}
              initialPlayback={playback.initialPlayback}
                onSegmentChange={handleSegmentChange}
                audioOnly={data.item.audioOnly}
                artworkUrl={data.item.channelProfileImageUrl}
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
                timelineStartAt={activePart?.sessionMediaStartedAt ? new Date(activePart.sessionMediaStartedAt).getTime() + ((activePart.sessionOffsetSec ?? 0) - activePart.startOffsetSec) * 1000 : mediaStartMs}
                spoilerFree={spoilerFree}
                initialRevealedSec={initialRevealedRef.current}
                onRevealedChange={handleRevealed}
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

          {/* Facts about the file belong under the video, not above it: they
              are read once and never while watching. */}
          <div className="replay-facts">
            <span title={t.archives.recordedAt}>
              {data?.item.startedAt ? new Date(data.item.startedAt).toLocaleString() : "—"}
            </span>
            {/* The recording window and the file size both spell out how long
                the broadcast ran, so spoiler-free keeps neither. */}
            {spoilerFree ? null : recordingWindow ? (
              <span title={`${t.replay.recordingWindow} (UTC): ${recordingWindow.utc}`}>
                {t.replay.recordingWindow}: {recordingWindow.text}
              </span>
            ) : (
              <span>{formatPeriod(data?.item.startedAt, data?.item.endedAt)}</span>
            )}
            {spoilerFree ? null : <span>{formatFileSize(data?.item.fileSizeBytes)}</span>}

            {activeSource ? (
              <span className="replay-facts__source">
                {activeSource === "telegram" ? (
                  <SendIcon size={13} />
                ) : activeSource === "drive" ? (
                  <CloudIcon size={13} />
                ) : (
                  <HardDriveIcon size={13} />
                )}
                {activeSource === "telegram"
                  ? "Telegram"
                  : activeSource === "drive"
                    ? "Google Drive"
                    : t.replay.sourceLocal}
                {activeSource === "telegram" ? <TelegramSpeedChip stats={tgStats} /> : null}
              </span>
            ) : null}

            {!playlist && parts.length > 1 ? (
              <label className="replay-facts__part">
                {t.archives.telegramPart}
                <select
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
            ) : null}
          </div>
        </div>

        {hasChat ? (
          <aside className="replay-stage__chat">
            <ChatReplay
              key={chatSessionId}
              archiveId={chatSessionId}
              liveEmotesUrl={`archives/${chatSessionId}/emotes/live`}
              timelineUrl={`archives/${chatSessionId}/timeline`}
              eventsUrl={`archives/${chatSessionId}/events`}
              videoElement={videoElement}
              isLive={isLive}
              defaultOffsetSec={activePart?.sessionChatOffsetSec ?? data!.item.chatOffsetSec ?? 0}
              mediaPartStartSec={activePart?.startOffsetSec ?? 0}
              baseOffsetSec={activePart?.sessionOffsetSec ?? activePart?.startOffsetSec ?? 0}
              isLastPart={parts.length === 0 || currentPart >= parts.length}
            />
          </aside>
        ) : null}
      </div>
    </main>
  );
}
