"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { apiGet } from "../lib/api";
import { CHAT_COPY, ROLE_LABELS, type ChatCopy } from "../lib/chat-copy";
import { readableAuthorColor, splitList, useChatPrefs, type ChatRole } from "../lib/chat-prefs";
import {
  formatRenderTime,
  messageRoles,
  parseActionMessage,
  type ChatMessage,
  type ChatResponse,
  type EmoteEntry,
  type EmotePayload,
} from "../lib/chat-render";
import { useLanguage } from "../providers";
import { ChatSettingsPanel } from "./ChatSettingsPanel";
import { ChatText } from "./ChatText";
import { ChatUserCard } from "./ChatUserCard";
import { SettingsIcon } from "./icons";

type ChatReplayProps = {
  archiveId?: string;
  /** Override the API path used to load chat (e.g. the public endpoint). */
  chatUrl?: string;
  /**
   * API path returning the channel's 7TV set as it is now. Omit to hide the
   * "current emotes" switch — an offline bundle has no server to ask.
   */
  liveEmotesUrl?: string;
  staticData?: ChatResponse;
  // Audio-only archives play through an <audio> element, so only the shared
  // HTMLMediaElement surface (currentTime / timeupdate) may be used here.
  videoElement: HTMLMediaElement | null;
  isLive: boolean;
  defaultOffsetSec?: number;
  /**
   * Start of the currently playing video on the whole-stream timeline, in
   * seconds. Used when a recording is split into Telegram parts: the video's
   * currentTime is part-local, while chat relativeTimeSec spans the whole
   * stream.
   */
  baseOffsetSec?: number;
};

const MAX_VISIBLE = 200;

export function ChatReplay({
  archiveId,
  chatUrl,
  liveEmotesUrl,
  staticData,
  videoElement,
  isLive,
  defaultOffsetSec = 0,
  baseOffsetSec = 0,
}: ChatReplayProps) {
  const { locale } = useLanguage();
  const copy = CHAT_COPY[locale];
  const { prefs, update, toggleRole, reset } = useChatPrefs();

  const [data, setData] = useState<ChatResponse | null>(staticData ?? null);
  const [loading, setLoading] = useState(!staticData);
  const [loadError, setLoadError] = useState(false);
  const [offset, setOffset] = useState(defaultOffsetSec);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);

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
        const response = await apiGet<ChatResponse>(endpoint!);
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

    const handler = () => {
      const next = Math.floor(videoElement.currentTime);
      setCurrentTime((previous) => (previous === next ? previous : next));
    };

    videoElement.addEventListener("timeupdate", handler);
    videoElement.addEventListener("seeked", handler);
    handler();

    return () => {
      videoElement.removeEventListener("timeupdate", handler);
      videoElement.removeEventListener("seeked", handler);
    };
  }, [videoElement]);

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

    const toEntry = (message: ChatMessage) => ({
      message,
      renderTime: message.relativeTimeSec - baseOffsetSec + offset,
    });

    // Live recordings (or no video): show the latest captured messages.
    if (isLive || !videoElement) {
      return timeline.slice(-MAX_VISIBLE).map(toEntry);
    }

    // VOD: find how many messages have reached their render time. We want the
    // count of messages with relativeTimeSec <= currentTime + baseOffsetSec
    // - offset (the inverse of renderTime <= currentTime).
    const threshold = currentTime + baseOffsetSec - offset;
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
      entries.push(toEntry(timeline[i]));
    }
    return entries;
  }, [timeline, currentTime, offset, baseOffsetSec, isLive, videoElement]);

  // Twitch-style auto-scroll: only stick to the bottom while the user is
  // already there. If they scroll up to read older messages we stop forcing
  // them down and show a "jump to latest" pill instead.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !pinnedToBottom) return;

    list.scrollTop = list.scrollHeight;
  }, [visibleMessages, pinnedToBottom]);

  // Track whether the user is near the bottom of the chat. We use a small
  // threshold so tiny rounding errors don't unpin them.
  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;

    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    const nearBottom = distanceFromBottom < 24;

    setPinnedToBottom((prev) => (prev === nearBottom ? prev : nearBottom));
  };

  const jumpToLatest = () => {
    const list = listRef.current;
    if (!list) return;

    list.scrollTop = list.scrollHeight;
    setPinnedToBottom(true);
  };

  const toRenderTime = useCallback(
    (relativeTimeSec: number) => relativeTimeSec - baseOffsetSec + offset,
    [baseOffsetSec, offset],
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
  const userThreshold = isLive
    ? Number.POSITIVE_INFINITY
    : currentTime + baseOffsetSec - offset;

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
        {data?.messages.length ? (
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

      <div className="chat-list-wrap">
        <div ref={listRef} className="chat-list" onScroll={handleScroll}>
          {loading ? (
            <div className="chat-empty">{copy.loading}</div>
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
                emoteMap={emoteMap}
                emotePx={prefs.emotePx}
                readableColors={prefs.readableColors}
                highlightRoles={highlightRoles}
                highlightFirstMessage={prefs.highlightFirstMessage}
                keywords={keywords}
                selfNames={selfNames}
                isActiveUser={activeUser === entry.message.authorLogin}
                onAuthorClick={setActiveUser}
                locale={locale}
                copy={copy}
              />
            ))
          )}
        </div>

        {!pinnedToBottom ? (
          <button type="button" className="chat-jump-pill" onClick={jumpToLatest}>
            {copy.paused}
          </button>
        ) : null}

        {activeUser ? (
          <ChatUserCard
            login={activeUser}
            messages={allMessages}
            thresholdSec={userThreshold}
            emoteMap={emoteMap}
            emotePx={prefs.emotePx}
            readableColors={prefs.readableColors}
            copy={copy}
            locale={locale}
            onClose={() => setActiveUser(null)}
            onSeek={seekTo}
            canSeek={canSeek}
            toRenderTime={toRenderTime}
          />
        ) : null}
      </div>
    </div>
  );
}

const ChatMessageRow = memo(function ChatMessageRow({
  message,
  renderTime,
  emoteMap,
  emotePx,
  readableColors,
  highlightRoles,
  highlightFirstMessage,
  keywords,
  selfNames,
  isActiveUser,
  onAuthorClick,
  locale,
  copy,
}: {
  message: ChatMessage;
  renderTime: number;
  emoteMap: Map<string, EmoteEntry>;
  emotePx: number;
  readableColors: boolean;
  highlightRoles: Set<ChatRole>;
  highlightFirstMessage: boolean;
  keywords: string[];
  selfNames: Set<string>;
  isActiveUser: boolean;
  onAuthorClick: (login: string) => void;
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
    message.isDeleted ? "is-deleted" : "",
    display.isAction ? "is-action" : "",
    highlightFirstMessage && message.isFirstMessage ? "is-first" : "",
    role ? `is-role is-role--${role}` : "",
    matchesKeyword ? "is-keyword" : "",
    isActiveUser ? "is-active-user" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // null = the message was deleted on its own; a number = a timeout/ban took
  // the author's whole history with it, and the length is worth showing.
  const ban = message.isDeleted ? message.banDurationSec ?? null : null;
  const color = readableColors ? readableAuthorColor(message.authorColor) : message.authorColor;

  return (
    <div className={className}>
      <span className="chat-time" title="Time in video">
        {formatRenderTime(renderTime)}
      </span>
      {roles.length > 0 ? (
        <span className="chat-badges">
          {roles.map((entry) => (
            <span key={entry} className={`chat-badge chat-badge--${entry}`} title={ROLE_LABELS[entry][locale]}>
              {ROLE_LABELS[entry].badge}
            </span>
          ))}
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
          emotePx={emotePx}
          selfNames={selfNames}
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
