"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "../lib/api";
import { useLanguage } from "../providers";

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
};

type EmoteEntry = {
  id: string;
  name: string;
  url: string;
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
  staticData?: ChatResponse;
  videoElement: HTMLVideoElement | null;
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
  const [showDeleted, setShowDeleted] = useState(false);
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
    const map = new Map<string, EmoteEntry>();
    for (const emote of data?.emotes?.emotes ?? []) {
      map.set(emote.name, emote);
    }
    return map;
  }, [data?.emotes]);

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
      <div className="chat-heading">
        <strong>{copy.title}</strong>
        <span>{data?.messages.length ? `${data.messages.length} ${copy.messages}` : ""}</span>
      </div>
      <div className="chat-controls">
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
      </div>

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

const ChatMessageItem = memo(function ChatMessageItem({
  message,
  renderTime,
  emoteMap,
}: {
  message: ChatMessage;
  renderTime: number;
  emoteMap: Map<string, EmoteEntry>;
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
  ]
    .filter(Boolean)
    .join(" ");

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
            />
          ) : (
            <span key={`text-${index}`}>{token.value}</span>
          ),
        )}
      </span>
    </div>
  );
});

type Token =
  | { type: "text"; value: string }
  | { type: "emote"; name: string; url: string };

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

function renderPlainTokens(text: string, emoteMap: Map<string, EmoteEntry>): Token[] {
  if (!text) return [];
  if (emoteMap.size === 0) return [{ type: "text", value: text }];

  const parts = text.split(/(\s+)/);
  const tokens: Token[] = [];

  for (const part of parts) {
    const emote = emoteMap.get(part);

    if (emote) {
      tokens.push({ type: "emote", name: emote.name, url: emote.url });
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
    title: "Чат записи",
    messages: "сообщ.",
    offset: "Сдвиг",
    offsetAria: "Сдвиг чата в секундах",
    showDeleted: "Показывать удалённые",
    loading: "Загружаю чат…",
    loadError: "Не удалось загрузить чат. Проверьте соединение с сервером.",
    empty: "Для этого стрима сообщения чата не записались.",
    waiting: "Ожидаю сообщения для текущего момента видео…",
    paused: "Прокрутка чата остановлена — к новым ↓",
  },
  en: {
    title: "Recorded chat",
    messages: "messages",
    offset: "Offset",
    offsetAria: "Chat offset in seconds",
    showDeleted: "Show deleted",
    loading: "Loading chat…",
    loadError: "Could not load chat. Check the server connection.",
    empty: "No chat messages were captured for this stream.",
    waiting: "Waiting for messages at this video time…",
    paused: "Chat paused — jump to latest ↓",
  },
} as const;
