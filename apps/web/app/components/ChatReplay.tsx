"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { apiGet } from "../lib/api";
import { CHAT_COPY, ROLE_LABELS, type ChatCopy } from "../lib/chat-copy";
import {
  readableAuthorColor,
  splitList,
  useChatOffset,
  useChatPrefs,
  type ChatRole,
} from "../lib/chat-prefs";
import {
  formatRenderTime,
  isVisiblyDeleted,
  messageRoles,
  parseActionMessage,
  type ChatMessage,
  type ChatResponse,
  type EmoteEntry,
  type EmotePayload,
} from "../lib/chat-render";
import { useSpoiler } from "../lib/spoiler";
import { betColor } from "../lib/stream-events";
import { useLanguage } from "../providers";
import { ChatSettingsPanel } from "./ChatSettingsPanel";
import { ChatText } from "./ChatText";
import { ChatUserCard } from "./ChatUserCard";
import { SettingsIcon } from "./icons";
import { SkeletonText } from "./Skeleton";
import { advanceChatTail, chatTimeAtMedia, mediaTimeAtChat, validatedMediaTimeline } from "../lib/media-timeline";
import { loadReplayChat } from "../lib/replay-loader";
import { StreamEventCard } from "./StreamEventCard";
import { StreamMetaStrip } from "./StreamMetaStrip";

type ChatReplayProps = {
  archiveId?: string;
  /** Override the API path used to load chat (e.g. the public endpoint). */
  chatUrl?: string;
  /** Public session whose earlier channel history can be loaded. */
  historySessionId?: string;
  /**
   * API path returning the channel's 7TV set as it is now. Omit to hide the
   * "current emotes" switch — an offline bundle has no server to ask.
   */
  liveEmotesUrl?: string;
  /**
   * API path for the broadcast's viewers/title/category series. Omit to hide
   * the strip — an offline bundle carries no such data.
   */
  timelineUrl?: string;
  /**
   * API path for the broadcast's predictions and polls. Omit to hide the
   * cards — an offline bundle carries no such data.
   */
  eventsUrl?: string;
  staticData?: ChatResponse;
  // Audio-only archives play through an <audio> element, so only the shared
  // HTMLMediaElement surface (currentTime / timeupdate) may be used here.
  videoElement: HTMLMediaElement | null;
  isLive: boolean;
  defaultOffsetSec?: number;
  /** The Twitch host owns the VOD offset; keep both settings panels in sync. */
  externalOffsetSec?: number;
  onExternalOffsetChange?: (value: number) => void;
  /**
   * Start of the currently playing video on the whole-stream timeline, in
   * seconds. Used when a recording is split into Telegram parts: the video's
   * currentTime is part-local, while chat relativeTimeSec spans the whole
   * stream.
   */
  baseOffsetSec?: number;
  /** Only the end of the final part may enter post-stream chat playback. */
  isLastPart?: boolean;
};

const MAX_VISIBLE = 200;

export function ChatReplay({
  archiveId,
  chatUrl,
  historySessionId = archiveId,
  liveEmotesUrl,
  timelineUrl,
  eventsUrl,
  staticData,
  videoElement,
  isLive,
  defaultOffsetSec = 0,
  externalOffsetSec,
  onExternalOffsetChange,
  baseOffsetSec = 0,
  isLastPart = true,
}: ChatReplayProps) {
  const { locale } = useLanguage();
  const { spoilerFree } = useSpoiler();
  const copy = CHAT_COPY[locale];
  const { prefs, update, toggleRole, reset } = useChatPrefs();

  const [data, setData] = useState<ChatResponse | null>(staticData ?? null);
  const [loading, setLoading] = useState(!staticData);
  const [loadError, setLoadError] = useState(false);
  // Remembered per recording — an offset tuned for one stream is wrong for
  // the next, so a single shared value would keep breaking alignment.
  const [savedOffset, setSavedOffset] = useChatOffset(archiveId ?? chatUrl ?? null, defaultOffsetSec);
  const offset = externalOffsetSec ?? savedOffset;
  const setOffset = useCallback((next: number | ((current: number) => number)) => {
    const value = typeof next === "function" ? next(offset) : next;
    if (externalOffsetSec !== undefined && onExternalOffsetChange) onExternalOffsetChange(value);
    else setSavedOffset(value);
  }, [offset, externalOffsetSec, onExternalOffsetChange, setSavedOffset]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [tailTime, setTailTime] = useState<number | null>(null);
  const [tailPlaying, setTailPlaying] = useState(false);
  const mediaTimeline = useMemo(() => validatedMediaTimeline(data?.mediaTimeline), [data?.mediaTimeline]);
  const playbackTime = tailTime ?? currentTime;
  const chatThreshold = chatTimeAtMedia(playbackTime + baseOffsetSec - offset, mediaTimeline);
  const lastMessage = data?.messages.at(-1);
  const tailEnd = lastMessage
    ? mediaTimeAtChat(lastMessage.relativeTimeSec, mediaTimeline) + offset - baseOffsetSec
    : 0;
  const hasTail = isLastPart && !isLive && videoEnded && videoDuration > 0 && tailEnd > videoDuration + 0.001;
  const [pinnedToBottom, setPinnedToBottom] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);
  const lastScrollTop = useRef(0);
  // State, not a ref: the card positions itself against this element and has
  // to re-render once it exists.
  const [wrapEl, setWrapEl] = useState<HTMLDivElement | null>(null);

  const [liveEmotes, setLiveEmotes] = useState<EmotePayload | null>(null);
  const [liveEmotesState, setLiveEmotesState] = useState<"idle" | "loading" | "error">("idle");

  // If static data provided (offline mode), sync it.
  useEffect(() => {
    if (staticData) {
      setData(staticData);
      setLoading(false);
      setLoadError(false);
    }
  }, [staticData]);

  const endpoint = chatUrl ?? (archiveId ? `archives/${archiveId}/chat` : null);

  // Load chat data once for online archives.
  useEffect(() => {
    if (!endpoint || staticData) return undefined;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(false);
      setData(null);
      try {
        // Load every page, including broadcasts beyond the old 50k cutoff.
        // Finished pages are cacheable; a seek then has the complete timeline.
        const response = await loadReplayChat(endpoint!, () => cancelled);
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setData({ messages: [], emotes: null });
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [endpoint, staticData]);

  // A different archive may be a different channel — drop the cached set.
  useEffect(() => {
    setLiveEmotes(null);
    setLiveEmotesState("idle");
  }, [liveEmotesUrl]);

  // Fetched lazily — the snapshot mode must not pay for a 7TV round-trip.
  useEffect(() => {
    if (!prefs.useLiveEmotes || !liveEmotesUrl || liveEmotes) return undefined;

    let cancelled = false;
    setLiveEmotesState("loading");

    void (async () => {
      try {
        const response = await apiGet<{ emotes: EmotePayload | null }>(liveEmotesUrl);
        if (cancelled) return;
        setLiveEmotes(response.emotes);
        setLiveEmotesState("idle");
      } catch {
        if (!cancelled) setLiveEmotesState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [prefs.useLiveEmotes, liveEmotesUrl, liveEmotes]);

  // Follow the player clock, once a second.
  useEffect(() => {
    if (!videoElement) return undefined;

    const resetTail = () => { setTailTime(null); setTailPlaying(false); setVideoEnded(false); };
    const durationChanged = () => setVideoDuration(Number.isFinite(videoElement.duration) ? videoElement.duration : 0);
    const ended = () => {
      durationChanged(); setCurrentTime(videoElement.currentTime); setVideoEnded(true);
    };
    resetTail();
    durationChanged();
    if (videoElement.ended) ended();

    const handler = () => {
      const next = videoElement.ended ? videoElement.currentTime : Math.floor(videoElement.currentTime);
      setCurrentTime((previous) => (previous === next ? previous : next));
    };

    videoElement.addEventListener("timeupdate", handler);
    videoElement.addEventListener("seeked", handler);
    videoElement.addEventListener("seeking", resetTail);
    videoElement.addEventListener("playing", resetTail);
    videoElement.addEventListener("emptied", resetTail);
    videoElement.addEventListener("ended", ended);
    videoElement.addEventListener("durationchange", durationChanged);
    handler();

    return () => {
      videoElement.removeEventListener("timeupdate", handler);
      videoElement.removeEventListener("seeked", handler);
      videoElement.removeEventListener("seeking", resetTail);
      videoElement.removeEventListener("playing", resetTail);
      videoElement.removeEventListener("emptied", resetTail);
      videoElement.removeEventListener("ended", ended);
      videoElement.removeEventListener("durationchange", durationChanged);
    };
  }, [videoElement, baseOffsetSec, endpoint]);

  useEffect(() => {
    if (!tailPlaying || !hasTail) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = (now - previous) / 1000;
      previous = now;
      setTailTime((time) => advanceChatTail(time ?? videoDuration, elapsed, tailEnd, videoElement?.playbackRate ?? 1));
    }, 200);
    return () => window.clearInterval(timer);
  }, [tailPlaying, hasTail, videoDuration, tailEnd, videoElement]);

  useEffect(() => {
    if (tailTime !== null && tailTime >= tailEnd) setTailPlaying(false);
  }, [tailTime, tailEnd]);

  const emoteMap = useMemo(() => {
    // One source or the other, never a blend: mixing them would silently
    // present today's emotes as part of the record.
    const source = prefs.useLiveEmotes && liveEmotes ? liveEmotes : data?.emotes;
    const map = new Map<string, EmoteEntry>();
    for (const emote of source?.emotes ?? []) {
      map.set(emote.name, emote);
    }
    return map;
  }, [data?.emotes, prefs.useLiveEmotes, liveEmotes]);

  const keywords = useMemo(() => splitList(prefs.keywords), [prefs.keywords]);
  // Whatever the viewer listed as keywords is almost always their own name, so
  // a mention of it gets marked harder than a mention of anyone else.
  const selfNames = useMemo(() => new Set(keywords), [keywords]);
  const hiddenUsers = useMemo(() => new Set(splitList(prefs.hiddenUsers)), [prefs.hiddenUsers]);
  const highlightRoles = useMemo(() => new Set(prefs.highlightRoles), [prefs.highlightRoles]);
  const searchTerm = search.trim().toLowerCase();

  // Everything that removes messages, applied once. Recomputed only when the
  // data or a filter changes — NOT on every timeupdate.
  const timeline = useMemo(() => {
    const all = data?.messages ?? [];

    return all.filter((message) => {
      if (!prefs.showDeleted && message.isDeleted) return false;
      if (hiddenUsers.has(message.authorLogin.toLowerCase())) return false;
      if (prefs.hideCommands && message.textRaw.trimStart().startsWith("!")) return false;

      if (searchTerm) {
        const haystack = `${message.authorLogin} ${message.authorDisplayName ?? ""} ${
          message.textRaw
        }`.toLowerCase();
        if (!haystack.includes(searchTerm)) return false;
      }

      return true;
    });
  }, [data, prefs.showDeleted, prefs.hideCommands, hiddenUsers, searchTerm]);

  const hiddenCount = (data?.messages.length ?? 0) - timeline.length;

  // Twitch-style: show only messages whose render_time has been reached, keep
  // the last MAX_VISIBLE so the chat doesn't grow unbounded. Messages arrive
  // sorted by relativeTimeSec and renderTime is just a constant shift of it, so
  // the cutoff is a binary search instead of an O(n) scan over ~50k messages on
  // every (now per-second) update.
  const visibleMessages = useMemo(() => {
    if (timeline.length === 0) return [];

    // `deleted` is resolved here, not in the row: the strike has to appear at
    // the moment of the ban rather than from the start, and this memo already
    // reruns as the clock moves. Rows stay memo-stable because the flag only
    // ever flips once.
    const toEntry = (message: ChatMessage, chatTime: number) => ({
      message,
      renderTime: mediaTimeAtChat(message.relativeTimeSec, mediaTimeline) - baseOffsetSec + offset,
      deleted: isVisiblyDeleted(message, chatTime),
    });

    // Live recordings (or no video): whatever is already deleted, is deleted.
    if (isLive || !videoElement) {
      return timeline
        .slice(-MAX_VISIBLE)
        .map((message) => toEntry(message, Number.POSITIVE_INFINITY));
    }

    // VOD: find how many messages have reached their render time. We want the
    // count of messages with relativeTimeSec <= currentTime + baseOffsetSec
    // - offset (the inverse of renderTime <= currentTime).
    const threshold = chatThreshold;
    let lo = 0;
    let hi = timeline.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (timeline[mid].relativeTimeSec <= threshold) lo = mid + 1;
      else hi = mid;
    }

    const start = Math.max(0, lo - MAX_VISIBLE);
    const entries = [];
    for (let i = start; i < lo; i += 1) {
      entries.push(toEntry(timeline[i], threshold));
    }
    return entries;
  }, [timeline, chatThreshold, mediaTimeline, offset, baseOffsetSec, isLive, videoElement]);

  const pinToLatest = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
    lastScrollTop.current = list.scrollTop;
  }, []);

  // Set the final position before paint, including row eviction at the 200
  // message limit. The resulting scroll event is not a user scrolling up.
  useLayoutEffect(() => {
    if (pinnedRef.current) pinToLatest();
  });

  // Emotes, font changes and event cards can resize the list without a new
  // message. Keep following those changes too, but never move a paused reader.
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) pinToLatest();
    });
    if (listRef.current) observer.observe(listRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [pinToLatest]);

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 24;
    const movedUp = list.scrollTop < lastScrollTop.current - 1;
    lastScrollTop.current = list.scrollTop;
    // Growing content alone must never show the pause pill.
    if (nearBottom || movedUp) {
      pinnedRef.current = nearBottom;
      setPinnedToBottom(nearBottom);
    }
  };

  const jumpToLatest = () => {
    pinnedRef.current = true;
    pinToLatest();
    setPinnedToBottom(true);
  };

  const toRenderTime = useCallback(
    (relativeTimeSec: number) => mediaTimeAtChat(relativeTimeSec, mediaTimeline) - baseOffsetSec + offset,
    [baseOffsetSec, offset, mediaTimeline],
  );

  const canSeek = useCallback(
    (relativeTimeSec: number) => {
      if (!videoElement || isLive) return false;
      const target = toRenderTime(relativeTimeSec);
      // A split archive only holds one part at a time; anything outside it
      // would silently jump to the wrong moment.
      const duration = Number.isFinite(videoElement.duration) ? videoElement.duration : null;
      return target >= 0 && (duration === null || target <= duration);
    },
    [videoElement, isLive, toRenderTime],
  );

  const seekTo = useCallback(
    (relativeTimeSec: number) => {
      if (!videoElement || !canSeek(relativeTimeSec)) return;
      videoElement.currentTime = Math.max(0, toRenderTime(relativeTimeSec));
    },
    [videoElement, canSeek, toRenderTime],
  );

  // The user card needs the unfiltered history: hiding bots or searching must
  // not silently shorten someone's record when you open their card.
  const allMessages = data?.messages ?? [];

  // A mention carries whatever the person typed — usually the login, but
  // Twitch also allows a non-Latin display name, and that is what chat tags.
  // Both spellings have to lead to the same card, or clicking one opens an
  // empty history for a user who is right there in the chat.
  const loginByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const message of data?.messages ?? []) {
      map.set(message.authorLogin.toLowerCase(), message.authorLogin);
      if (message.authorDisplayName) {
        map.set(message.authorDisplayName.toLowerCase(), message.authorLogin);
      }
    }
    return map;
  }, [data?.messages]);

  // Someone mentioned but silent in this broadcast keeps the typed name: the
  // card then shows an empty history rather than nothing happening at all.
  const openMention = useCallback(
    (name: string) => setActiveUser(loginByName.get(name.toLowerCase()) ?? name.toLowerCase()),
    [loginByName],
  );
  const userThreshold = isLive || !videoElement
    ? Number.POSITIVE_INFINITY
    : chatThreshold;

  const liveEmotesNote =
    liveEmotesState === "loading"
      ? copy.liveEmotesLoading
      : liveEmotesState === "error"
        ? copy.liveEmotesError
        : prefs.useLiveEmotes && liveEmotes === null
          ? copy.liveEmotesNone
          : null;

  const rootStyle = {
    "--chat-font": `${prefs.fontPx}px`,
    "--chat-emote": `${prefs.emotePx}px`,
  } as CSSProperties;

  const rootClass = [
    "chat-replay",
    prefs.compact ? "is-compact" : "",
    prefs.stripes ? "has-stripes" : "",
    prefs.showTimestamps ? "" : "no-time",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} style={rootStyle}>
      {/* One compact row instead of a heading plus a permanently expanded
          settings block: the offset is tuned once per archive, if ever, and it
          used to cost a fifth of the panel's height every session. */}
      <div className="chat-bar">
        <strong className="chat-bar__title">{copy.title}</strong>
        {/* The message count is a length measure in disguise: 40 000 messages
            is a long night, 900 is an hour that went quietly. */}
        {!spoilerFree && data?.messages.length ? (
          <span className="chat-bar__count">{data.messages.length}</span>
        ) : null}
        {hiddenCount > 0 ? (
          <span className="chat-bar__filtered" title={copy.filtered}>
            −{hiddenCount}
          </span>
        ) : null}
        {offset !== 0 ? (
          <span className="chat-bar__offset" title={copy.offset}>
            {offset > 0 ? `+${offset}` : offset}s
          </span>
        ) : null}
        <button
          type="button"
          className={`chat-bar__gear${settingsOpen ? " is-active" : ""}`}
          onClick={() => setSettingsOpen((value) => !value)}
          title={copy.settings}
          aria-expanded={settingsOpen}
        >
          <SettingsIcon size={14} />
        </button>
      </div>

      {data?.missingGifAssets?.length ? (
        <div className="chat-empty" role="status">
          {locale === "ru"
            ? "В этом файле нет копий некоторых GIF. Они откроются, только если оригиналы ещё доступны."
            : "Some GIF images are missing from this file. They can load only while the originals remain available."}
        </div>
      ) : null}

      {settingsOpen ? (
        <ChatSettingsPanel
          prefs={prefs}
          update={update}
          toggleRole={toggleRole}
          reset={reset}
          copy={copy}
          locale={locale}
          offset={offset}
          setOffset={setOffset}
          search={search}
          setSearch={setSearch}
          liveEmotesUrl={liveEmotesUrl}
          liveEmotesNote={liveEmotesNote}
        />
      ) : null}

      {hasTail ? (
        <div className="chat-tail" role="group" aria-label={copy.afterStream}>
          <span>{copy.afterStream}</span>
          {(tailTime ?? videoDuration) < tailEnd ? (
            <>
              <button type="button" className="button secondary" onClick={() => {
                setTailTime((time) => time ?? videoDuration);
                setTailPlaying((playing) => !playing);
              }}>{tailPlaying ? copy.pauseTail : copy.playTail}</button>
              <button type="button" className="button secondary" onClick={() => {
                setTailPlaying(false); setTailTime(tailEnd);
              }}>{copy.showTail}</button>
            </>
          ) : <span>{copy.tailComplete}</span>}
        </div>
      ) : null}

      <StreamMetaStrip
        timelineUrl={timelineUrl}
        chatTimeSec={userThreshold}
        // Spoiler-free overrides the per-chat "show me everything" switch:
        // the strip's bar spans the whole broadcast, so how far along it the
        // colour stops is the length of the recording, drawn.
        reveal={!spoilerFree && prefs.revealTimeline}
        onToggleReveal={() => update("revealTimeline", !prefs.revealTimeline)}
        hideScale={spoilerFree}
        copy={copy}
        locale={locale}
      />

      {prefs.showEvents ? (
        <StreamEventCard
          eventsUrl={eventsUrl}
          collapsed={prefs.collapseEvents}
          onToggleCollapsed={() => update("collapseEvents", !prefs.collapseEvents)}
          chatTimeSec={userThreshold}
          copy={copy}
          locale={locale}
        />
      ) : null}

      <div className="chat-list-wrap" ref={setWrapEl}>
        <div ref={listRef} className="chat-list thin-scroll" onScroll={handleScroll}>
          <div ref={contentRef} className="chat-list-content">
            {loading ? (
              // The chat is the heaviest thing on the page — several megabytes
              // for a long broadcast — so this placeholder is on screen the
              // longest and has the most work to do.
              Array.from({ length: 16 }, (_, index) => (
                <div className="chat-message chat-message--skeleton" key={index}>
                  <SkeletonText width={`${34 + ((index * 17) % 40)}px`} />
                  <SkeletonText width={`${45 + ((index * 29) % 45)}%`} />
              </div>
            ))
          ) : loadError ? (
            <div className="chat-empty chat-empty--error">{copy.loadError}</div>
          ) : visibleMessages.length === 0 ? (
            <div className="chat-empty">
              {data?.messages.length === 0 ? copy.empty : copy.waiting}
            </div>
          ) : (
            visibleMessages.map((entry) => (
              <ChatMessageRow
                key={entry.message.id}
                message={entry.message}
                renderTime={entry.renderTime}
                deleted={entry.deleted}
                emoteMap={emoteMap}
                gifAssets={data?.gifAssets}
                emotePx={prefs.emotePx}
                readableColors={prefs.readableColors}
                highlightRoles={highlightRoles}
                highlightFirstMessage={prefs.highlightFirstMessage}
                showBets={prefs.showBets}
                keywords={keywords}
                selfNames={selfNames}
                isActiveUser={activeUser === entry.message.authorLogin}
                onAuthorClick={setActiveUser}
                onMentionClick={openMention}
                locale={locale}
                copy={copy}
              />
            ))
          )}
          </div>
        </div>

        {!pinnedToBottom ? (
          <button type="button" className="chat-jump-pill" onClick={jumpToLatest}>
            {copy.paused}
          </button>
        ) : null}

        {activeUser ? (
          <ChatUserCard
            key={`${historySessionId ?? endpoint ?? "offline"}:${activeUser.toLowerCase()}`}
            login={activeUser}
            historyUrl={historySessionId ? `public/streams/${historySessionId}/chat/users/${encodeURIComponent(activeUser)}/history` : undefined}
            messages={allMessages}
            thresholdSec={userThreshold}
            emoteMap={emoteMap}
            gifAssets={data?.gifAssets}
            emotePx={prefs.emotePx}
            readableColors={prefs.readableColors}
            copy={copy}
            locale={locale}
            onClose={() => setActiveUser(null)}
            onMentionClick={openMention}
            onSeek={seekTo}
            canSeek={canSeek}
            toRenderTime={toRenderTime}
            anchorEl={wrapEl}
          />
        ) : null}
      </div>
    </div>
  );
}

const ChatMessageRow = memo(function ChatMessageRow({
  message,
  renderTime,
  deleted,
  emoteMap,
  gifAssets,
  emotePx,
  readableColors,
  highlightRoles,
  highlightFirstMessage,
  showBets,
  keywords,
  selfNames,
  isActiveUser,
  onAuthorClick,
  onMentionClick,
  locale,
  copy,
}: {
  message: ChatMessage;
  renderTime: number;
  /** Already struck through at the player's current position. */
  deleted: boolean;
  emoteMap: Map<string, EmoteEntry>;
  gifAssets?: Record<string, string>;
  emotePx: number;
  readableColors: boolean;
  highlightRoles: Set<ChatRole>;
  highlightFirstMessage: boolean;
  /** Show the "bet on X" chip before the nick. */
  showBets: boolean;
  keywords: string[];
  selfNames: Set<string>;
  isActiveUser: boolean;
  onAuthorClick: (login: string) => void;
  onMentionClick: (name: string) => void;
  locale: "ru" | "en";
  copy: ChatCopy;
}) {
  const display = parseActionMessage(message.textRaw);
  const roles = messageRoles(message);

  // The strongest role wins the row tint — messageRoles is rank-ordered, so
  // the broadcaster does not get painted as a plain subscriber.
  const role = roles.find((entry) => highlightRoles.has(entry));
  const matchesKeyword =
    keywords.length > 0 &&
    keywords.some((word) => display.text.toLowerCase().includes(word));

  const className = [
    "chat-message",
    deleted ? "is-deleted" : "",
    display.isAction ? "is-action" : "",
    highlightFirstMessage && message.isFirstMessage ? "is-first" : "",
    role ? `is-role is-role--${role}` : "",
    matchesKeyword ? "is-keyword" : "",
    isActiveUser ? "is-active-user" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // null = the message was deleted on its own; a number = a timeout/ban took
  // the author's whole history with it, and the length is worth showing. The
  // chip appears together with the strike, not before it.
  const ban = deleted ? message.banDurationSec ?? null : null;
  const isFirst = highlightFirstMessage && Boolean(message.isFirstMessage);
  const color = readableColors ? readableAuthorColor(message.authorColor) : message.authorColor;
  const bet = showBets ? message.predictionBet ?? null : null;

  return (
    <div className={className}>
      <span className="chat-time" title="Time in video">
        {formatRenderTime(renderTime)}
      </span>
      {isFirst ? (
        // A tint alone reads as "some highlight"; the chip says which one.
        <span className="chat-first" title={copy.firstMessageTitle}>
          {copy.firstMessage}
        </span>
      ) : null}
      {roles.length > 0 ? (
        <span className="chat-badges">
          {roles.map((entry) => (
            <span key={entry} className={`chat-badge chat-badge--${entry}`} title={ROLE_LABELS[entry][locale]}>
              {ROLE_LABELS[entry].badge}
            </span>
          ))}
        </span>
      ) : null}
      {bet ? (
        // Right where Twitch puts it: a coloured chip before the nick, so you
        // can read a bet-heavy chat and see who backed what at a glance.
        <span
          className="chat-bet"
          style={{ background: betColor(bet.badgeVersion) }}
          title={bet.outcomeTitle ? `${copy.eventBetOn}: ${bet.outcomeTitle}` : copy.eventPrediction}
        >
          {bet.outcomeTitle ?? "•"}
        </span>
      ) : null}
      <button
        type="button"
        className="chat-author"
        style={{ color: color || "#9ca3af" }}
        onClick={() => onAuthorClick(message.authorLogin)}
        title={copy.userCardTitle}
      >
        {message.authorDisplayName ?? message.authorLogin}
      </button>
      <span className="chat-separator">{display.isAction ? " " : ": "}</span>
      <span className="chat-text">
        <ChatText
          text={display.text}
          emoteMap={emoteMap}
          twitchEmotes={message.emotes}
          inlineEmotes={message.inlineEmotes}
          twitchGifs={message.gifs}
          gifUrls={message.gifUrls}
          gifAssets={gifAssets}
          emotePx={emotePx}
          selfNames={selfNames}
          onMentionClick={onMentionClick}
          mentionTitle={copy.userCardTitle}
        />
      </span>
      {ban !== null ? (
        <span
          className={`chat-ban${ban === 0 ? " chat-ban--perma" : ""}`}
          title={ban === 0 ? copy.banPermanent : copy.banTimeout}
        >
          {ban === 0 ? "⛔" : "⏱"} {formatBanDuration(ban, locale)}
        </span>
      ) : null}
    </div>
  );
});

/** "10 мин" / "1 ч" / "30 сек"; 0 means the ban had no end. */
function formatBanDuration(seconds: number, locale: "ru" | "en") {
  if (seconds <= 0) return locale === "ru" ? "бан" : "ban";
  if (seconds < 60) return locale === "ru" ? `${seconds} сек` : `${seconds}s`;
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return locale === "ru" ? `${minutes} мин` : `${minutes}m`;
  }
  if (seconds < 86400) {
    const hours = Math.round(seconds / 3600);
    return locale === "ru" ? `${hours} ч` : `${hours}h`;
  }
  const days = Math.round(seconds / 86400);
  return locale === "ru" ? `${days} дн` : `${days}d`;
}
