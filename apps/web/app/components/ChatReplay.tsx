"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { apiGet, buildApiUrl } from "../lib/api";
import { useLanguage } from "../providers";
import { SettingsIcon } from "./icons";

type ChatMessage = {
  id: string;
  authorLogin: string;
  authorDisplayName: string | null;
  authorColor: string | null;
  textRaw: string;
  badges?: string | null;
  emotes?: string | null;
  relativeTimeSec: number;
  messageTimestamp: string;
  isDeleted: boolean;
  /** Timeout seconds behind the deletion; 0 = permanent ban; null = plain delete. */
  banDurationSec?: number | null;
  /** The author's first message ever in this channel (Twitch first-msg tag). */
  isFirstMessage?: boolean;
};

type EmoteEntry = {
  id: string;
  name: string;
  /** Original 7TV CDN url — the fallback when our own copy is unavailable. */
  url: string;
  /**
   * Our mirrored copy: an API-relative path for an online archive, or a
   * self-contained data: URI inside a downloaded .tsr.json bundle.
   */
  localUrl?: string;
  animated: boolean;
};

type EmotePayload = {
  provider: string;
  fetchedAt: string;
  emotes: EmoteEntry[];
};

type ChatResponse = {
  messages: ChatMessage[];
  emotes: EmotePayload | null;
};

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
  const [data, setData] = useState<ChatResponse | null>(staticData ?? null);
  const [loading, setLoading] = useState(!staticData);
  const [loadError, setLoadError] = useState(false);
  const [offset, setOffset] = useState(defaultOffsetSec);
  // Deleted messages are shown by default — with strikethrough and the ban
  // length, hiding them turned out to be the rarer wish. The toggle persists.
  const [showDeleted, setShowDeleted] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // The recorded snapshot is the default on purpose: it is what the chat
  // actually saw. "Current" is the opt-in for recordings whose snapshot is
  // missing (every Kick stream captured before 7TV was wired up) or older
  // than the channel's set. The choice persists across archives.
  const [useLiveEmotes, setUseLiveEmotes] = useState(false);
  const [liveEmotes, setLiveEmotes] = useState<EmotePayload | null>(null);
  const [liveEmotesState, setLiveEmotesState] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    try {
      if (window.localStorage.getItem("tsr-chat-show-deleted") === "0") {
        setShowDeleted(false);
      }
      if (window.localStorage.getItem("tsr-chat-live-emotes") === "1") {
        setUseLiveEmotes(true);
      }
    } catch {
      // Ignore broken localStorage.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("tsr-chat-live-emotes", useLiveEmotes ? "1" : "0");
    } catch {
      // Ignore storage errors.
    }
  }, [useLiveEmotes]);

  // Fetched lazily — the snapshot mode must not pay for a 7TV round-trip.
  useEffect(() => {
    if (!useLiveEmotes || !liveEmotesUrl || liveEmotes) return undefined;

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
  }, [useLiveEmotes, liveEmotesUrl, liveEmotes]);

  // A different archive may be a different channel — drop the cached set.
  useEffect(() => {
    setLiveEmotes(null);
    setLiveEmotesState("idle");
  }, [liveEmotesUrl]);

  useEffect(() => {
    try {
      window.localStorage.setItem("tsr-chat-show-deleted", showDeleted ? "1" : "0");
    } catch {
      // Ignore storage errors.
    }
  }, [showDeleted]);
  const [currentTime, setCurrentTime] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);

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

  // Do not carry a manually adjusted offset into another archive when the
  // same client component instance is reused during navigation.
  useEffect(() => {
    setOffset(defaultOffsetSec);
  }, [endpoint, defaultOffsetSec]);

  // Re-fetch every 10s if still recording, to pick up new messages.
  useEffect(() => {
    if (!isLive || !endpoint || staticData) return undefined;

    const timer = window.setInterval(() => {
      void apiGet<ChatResponse>(endpoint)
        .then((response) => {
          setData(response);
          setLoadError(false);
        })
        .catch(() => undefined);
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [endpoint, isLive, staticData]);

  // Track video time. `timeupdate` fires ~4x/sec; chat only needs 1s
  // granularity, so we quantise to whole seconds and skip the state update
  // (and the whole re-render) when the second hasn't changed. This alone cuts
  // chat re-renders ~75% and stops the chat from competing with video decode.
  useEffect(() => {
    if (!videoElement) return undefined;

    const handler = () => {
      const next = Math.floor(videoElement.currentTime);
      setCurrentTime((prev) => (prev === next ? prev : next));
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
    const source = useLiveEmotes && liveEmotes ? liveEmotes : data?.emotes;
    const map = new Map<string, EmoteEntry>();
    for (const emote of source?.emotes ?? []) {
      map.set(emote.name, emote);
    }
    return map;
  }, [data?.emotes, useLiveEmotes, liveEmotes]);

  // The deleted-filtered, time-sorted message list. Recomputed only when the
  // data or the "show deleted" toggle changes — NOT on every timeupdate.
  const timeline = useMemo(() => {
    const all = data?.messages ?? [];
    return showDeleted ? all : all.filter((message) => !message.isDeleted);
  }, [data, showDeleted]);

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

  return (
    <div className="chat-replay">
      {/* One compact row instead of a heading plus a permanently expanded
          settings block: the offset is tuned once per archive, if ever, and it
          used to cost a fifth of the panel's height every session. */}
      <div className="chat-bar">
        <strong className="chat-bar__title">{copy.title}</strong>
        {data?.messages.length ? (
          <span className="chat-bar__count">{data.messages.length}</span>
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
        <div className="chat-settings">
          <div className="chat-offset-row">
            <span className="chat-offset-label">{copy.offset}</span>
            <button type="button" onClick={() => setOffset((o) => o - 5)} title="-5s">
              −5
            </button>
            <button type="button" onClick={() => setOffset((o) => o - 1)} title="-1s">
              −1
            </button>
            <input
              type="number"
              className="offset-input"
              value={offset}
              onChange={(event) => {
                const value = Number(event.target.value);
                setOffset(Number.isFinite(value) ? value : 0);
              }}
              aria-label={copy.offsetAria}
            />
            <span style={{ color: "var(--text-faint)" }}>s</span>
            <button type="button" onClick={() => setOffset((o) => o + 1)} title="+1s">
              +1
            </button>
            <button type="button" onClick={() => setOffset((o) => o + 5)} title="+5s">
              +5
            </button>
            <button type="button" onClick={() => setOffset(0)} title="reset">
              ↺
            </button>
          </div>
          <label className="chat-toggle">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(event) => setShowDeleted(event.target.checked)}
            />
            <span>{copy.showDeleted}</span>
          </label>
          {liveEmotesUrl ? (
            <label className="chat-toggle" title={copy.liveEmotesHint}>
              <input
                type="checkbox"
                checked={useLiveEmotes}
                onChange={(event) => setUseLiveEmotes(event.target.checked)}
              />
              <span>
                {copy.liveEmotes}
                {useLiveEmotes && liveEmotesState === "loading" ? ` — ${copy.liveEmotesLoading}` : ""}
                {useLiveEmotes && liveEmotesState === "error" ? ` — ${copy.liveEmotesError}` : ""}
                {useLiveEmotes && liveEmotesState === "idle" && liveEmotes === null
                  ? ` — ${copy.liveEmotesNone}`
                  : ""}
              </span>
            </label>
          ) : null}
        </div>
      ) : null}

      <div className="chat-list-wrap">
        <div ref={listRef} className="chat-list" onScroll={handleScroll}>
          {loading ? (
            <div className="chat-empty">{copy.loading}</div>
          ) : loadError ? (
            <div className="chat-empty chat-empty--error">{copy.loadError}</div>
          ) : visibleMessages.length === 0 ? (
            <div className="chat-empty">
              {data?.messages.length === 0
                ? copy.empty
                : copy.waiting}
            </div>
          ) : (
            visibleMessages.map((entry) => (
              <ChatMessageItem
                key={entry.message.id}
                message={entry.message}
                renderTime={entry.renderTime}
                emoteMap={emoteMap}
                locale={locale}
              />
            ))
          )}
        </div>
        {!pinnedToBottom && visibleMessages.length > 0 ? (
          <button
            type="button"
            className="chat-jump-pill"
            onClick={jumpToLatest}
            title="Jump to latest"
          >
            {copy.paused}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function formatRenderTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    : `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/** "10 мин" / "1 ч" / "30 сек"; 0 means the ban had no end. */
function formatBanDuration(seconds: number, locale: "ru" | "en") {
  if (seconds <= 0) return locale === "ru" ? "бан" : "ban";
  if (seconds < 60) return `${seconds} ${locale === "ru" ? "сек" : "s"}`;
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)} ${locale === "ru" ? "мин" : "min"}`;
  }
  const hours = Math.round((seconds / 3600) * 10) / 10;
  return `${hours} ${locale === "ru" ? "ч" : "h"}`;
}

const ChatMessageItem = memo(function ChatMessageItem({
  message,
  renderTime,
  emoteMap,
  locale,
}: {
  message: ChatMessage;
  renderTime: number;
  emoteMap: Map<string, EmoteEntry>;
  locale: "ru" | "en";
}) {
  const display = useMemo(() => parseActionMessage(message.textRaw), [message.textRaw]);
  const tokens = useMemo(() => renderTokens(display.text, emoteMap, message.emotes), [
    display.text,
    message.textRaw,
    message.emotes,
    emoteMap,
  ]);

  const className = [
    "chat-message",
    message.isDeleted ? "is-deleted" : "",
    display.isAction ? "is-action" : "",
    message.isFirstMessage ? "is-first" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const copy = CHAT_COPY[locale];
  // null = the message was deleted on its own; a number = a timeout/ban took
  // the author's whole history with it, and the length is worth showing.
  const ban = message.isDeleted ? message.banDurationSec ?? null : null;

  return (
    <div className={className}>
      <span className="chat-time" title="Time in video">
        {formatRenderTime(renderTime)}
      </span>
      <ChatBadges raw={message.badges} />
      <span
        className="chat-author"
        style={{ color: message.authorColor || "#9ca3af" }}
      >
        {message.authorDisplayName ?? message.authorLogin}
      </span>
      <span className="chat-separator">{display.isAction ? " " : ": "}</span>
      <span className="chat-text">
        {tokens.map((token, index) =>
          token.type === "emote" ? (
            <img
              key={`${token.name}-${index}`}
              src={token.url}
              alt={token.name}
              className="chat-emote"
              loading="lazy"
              onError={
                token.fallbackUrl
                  ? (event) => {
                      // Our copy is missing (recorded before the mirror, or the
                      // file was lost) — retry against 7TV once, then stop, so a
                      // dead url cannot loop.
                      const image = event.currentTarget;
                      if (token.fallbackUrl && image.src !== token.fallbackUrl) {
                        image.src = token.fallbackUrl;
                      }
                    }
                  : undefined
              }
            />
          ) : (
            <span key={`text-${index}`}>{token.value}</span>
          ),
        )}
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

type Token =
  | { type: "text"; value: string }
  | { type: "emote"; name: string; url: string; fallbackUrl?: string };

function renderTokens(
  text: string,
  emoteMap: Map<string, EmoteEntry>,
  twitchEmotes?: string | null,
): Token[] {
  const ranges = parseTwitchEmoteRanges(twitchEmotes);
  if (ranges.length === 0) {
    return renderPlainTokens(text, emoteMap);
  }

  const codePoints = Array.from(text);
  const tokens: Token[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start < cursor || range.end >= codePoints.length) continue;
    tokens.push(...renderPlainTokens(codePoints.slice(cursor, range.start).join(""), emoteMap));
    const name = codePoints.slice(range.start, range.end + 1).join("");
    tokens.push({
      type: "emote",
      name,
      url: `https://static-cdn.jtvnw.net/emoticons/v2/${range.id}/default/dark/2.0`,
    });
    cursor = range.end + 1;
  }

  tokens.push(...renderPlainTokens(codePoints.slice(cursor).join(""), emoteMap));
  return tokens;
}

/**
 * Prefer our mirrored copy, keep the 7TV CDN as the fallback.
 *
 * A snapshot freezes which emotes a stream had, but not the pictures — those
 * lived only on cdn.7tv.app, so an emote deleted there turned every old replay
 * into broken boxes. Recordings made after the mirror landed carry `localUrl`;
 * older ones have only `url` and keep working exactly as before.
 *
 * A data: URI (offline bundle) is already self-contained; anything else is an
 * API-relative path that has to go through the configured API base.
 */
function resolveEmoteSrc(emote: EmoteEntry): { url: string; fallbackUrl?: string } {
  if (!emote.localUrl) {
    return { url: emote.url };
  }

  if (emote.localUrl.startsWith("data:")) {
    return { url: emote.localUrl };
  }

  return { url: buildApiUrl(emote.localUrl), fallbackUrl: emote.url };
}

function renderPlainTokens(text: string, emoteMap: Map<string, EmoteEntry>): Token[] {
  if (!text) return [];
  if (emoteMap.size === 0) return [{ type: "text", value: text }];

  const parts = text.split(/(\s+)/);
  const tokens: Token[] = [];

  for (const part of parts) {
    const emote = emoteMap.get(part);

    if (emote) {
      tokens.push({ type: "emote", name: emote.name, ...resolveEmoteSrc(emote) });
    } else {
      const last = tokens[tokens.length - 1];
      if (last?.type === "text") {
        last.value += part;
      } else {
        tokens.push({ type: "text", value: part });
      }
    }
  }

  return tokens;
}

function parseTwitchEmoteRanges(tag?: string | null) {
  const ranges: Array<{ id: string; start: number; end: number }> = [];
  for (const group of tag?.split("/") ?? []) {
    const separator = group.indexOf(":");
    if (separator <= 0) continue;
    const id = group.slice(0, separator);
    for (const pair of group.slice(separator + 1).split(",")) {
      const [rawStart, rawEnd] = pair.split("-");
      const start = Number.parseInt(rawStart, 10);
      const end = Number.parseInt(rawEnd, 10);
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
        ranges.push({ id, start, end });
      }
    }
  }
  return ranges.sort((a, b) => a.start - b.start);
}

function parseActionMessage(raw: string) {
  if (!raw.startsWith("\u0001ACTION ")) return { text: raw, isAction: false };
  const withoutPrefix = raw.slice(8);
  return {
    text: withoutPrefix.endsWith("\u0001") ? withoutPrefix.slice(0, -1) : withoutPrefix,
    isAction: true,
  };
}

const BADGE_LABELS: Record<string, string> = {
  broadcaster: "СТР",
  moderator: "MOD",
  vip: "VIP",
  subscriber: "SUB",
  staff: "STAFF",
  admin: "ADMIN",
  global_mod: "GM",
  partner: "✓",
  turbo: "T",
};

function ChatBadges({ raw }: { raw?: string | null }) {
  if (!raw) return null;
  const badges = raw
    .split(",")
    .map((entry) => entry.split("/")[0])
    .filter((kind) => BADGE_LABELS[kind]);
  if (badges.length === 0) return null;
  return (
    <span className="chat-badges">
      {badges.map((kind) => (
        <span key={kind} className={`chat-badge chat-badge--${kind}`} title={kind}>
          {BADGE_LABELS[kind]}
        </span>
      ))}
    </span>
  );
}

const CHAT_COPY = {
  ru: {
    title: "Чат",
    messages: "сообщ.",
    offset: "Сдвиг",
    settings: "Настройки чата",
    offsetAria: "Сдвиг чата в секундах",
    showDeleted: "Показывать удалённые",
    liveEmotes: "Текущие эмоуты канала",
    liveEmotesHint:
      "По умолчанию показываются эмоуты на момент записи. Здесь — набор канала на 7TV прямо сейчас: пригодится, если снапшот не снялся или набор с тех пор пополнился.",
    liveEmotesLoading: "загружаю…",
    liveEmotesError: "не удалось загрузить",
    liveEmotesNone: "у канала нет 7TV",
    banPermanent: "Пользователь забанен навсегда",
    banTimeout: "Пользователь получил таймаут",
    loading: "Загружаю чат…",
    loadError: "Не удалось загрузить чат. Проверьте соединение с сервером.",
    empty: "Для этого стрима сообщения чата не записались.",
    waiting: "Ожидаю сообщения для текущего момента видео…",
    paused: "Прокрутка чата остановлена — к новым ↓",
  },
  en: {
    title: "Chat",
    messages: "messages",
    offset: "Offset",
    settings: "Chat settings",
    offsetAria: "Chat offset in seconds",
    showDeleted: "Show deleted",
    liveEmotes: "Channel's current emotes",
    liveEmotesHint:
      "By default the emotes are the ones from the time of recording. This shows the channel's 7TV set as it is now — useful when no snapshot was taken, or the set has grown since.",
    liveEmotesLoading: "loading…",
    liveEmotesError: "could not load",
    liveEmotesNone: "channel has no 7TV",
    banPermanent: "User was banned permanently",
    banTimeout: "User was timed out",
    loading: "Loading chat…",
    loadError: "Could not load chat. Check the server connection.",
    empty: "No chat messages were captured for this stream.",
    waiting: "Waiting for messages at this video time…",
    paused: "Chat paused — jump to latest ↓",
  },
} as const;
