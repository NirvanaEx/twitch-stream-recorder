"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "../lib/api";

type ChatMessage = {
  id: string;
  authorLogin: string;
  authorDisplayName: string | null;
  authorColor: string | null;
  textRaw: string;
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
  staticData?: ChatResponse;
  videoElement: HTMLVideoElement | null;
  isLive: boolean;
  defaultOffsetSec?: number;
};

const MAX_VISIBLE = 200;

export function ChatReplay({
  archiveId,
  staticData,
  videoElement,
  isLive,
  defaultOffsetSec = 0,
}: ChatReplayProps) {
  const [data, setData] = useState<ChatResponse | null>(staticData ?? null);
  const [loading, setLoading] = useState(!staticData);
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
    }
  }, [staticData]);

  // Load chat data once for online archives.
  useEffect(() => {
    if (!archiveId || staticData) return undefined;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const response = await apiGet<ChatResponse>(`archives/${archiveId}/chat`);
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setData({ messages: [], emotes: null });
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
  }, [archiveId, staticData]);

  // Re-fetch every 10s if still recording, to pick up new messages.
  useEffect(() => {
    if (!isLive || !archiveId || staticData) return undefined;

    const timer = window.setInterval(() => {
      void apiGet<ChatResponse>(`archives/${archiveId}/chat`)
        .then((response) => setData(response))
        .catch(() => undefined);
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [archiveId, isLive, staticData]);

  // Track video time.
  useEffect(() => {
    if (!videoElement) return undefined;

    const handler = () => setCurrentTime(videoElement.currentTime);
    videoElement.addEventListener("timeupdate", handler);
    videoElement.addEventListener("seeked", handler);
    setCurrentTime(videoElement.currentTime);

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

  // Twitch-style: show only messages whose render_time has been reached, keep
  // the last MAX_VISIBLE so the chat doesn't grow unbounded. When the user
  // seeks back, only messages up to the new currentTime are shown.
  const visibleMessages = useMemo(() => {
    if (!data) return [];

    const reached = data.messages.filter((message) => {
      if (!showDeleted && message.isDeleted) return false;

      // Live recordings: always show everything that has been captured so far.
      if (isLive || !videoElement) return true;

      const renderTime = message.relativeTimeSec + offset;
      return renderTime <= currentTime;
    });

    return reached.slice(-MAX_VISIBLE).map((message) => ({
      message,
      renderTime: message.relativeTimeSec + offset,
    }));
  }, [data, currentTime, offset, showDeleted, isLive, videoElement]);

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
      <div className="chat-controls">
        <div className="chat-offset-row">
          <span className="chat-offset-label">Offset</span>
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
            aria-label="Chat offset in seconds"
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
          <span>Show deleted</span>
        </label>
      </div>

      <div className="chat-list-wrap">
        <div ref={listRef} className="chat-list" onScroll={handleScroll}>
          {loading ? (
            <div className="chat-empty">Loading chat…</div>
          ) : visibleMessages.length === 0 ? (
            <div className="chat-empty">
              {data?.messages.length === 0
                ? "No chat messages were captured for this stream."
                : "Waiting for messages at this video time…"}
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
            Chat paused — click to resume ↓
          </button>
        ) : null}
      </div>
    </div>
  );
}

function formatRenderTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function ChatMessageItem({
  message,
  renderTime,
  emoteMap,
}: {
  message: ChatMessage;
  renderTime: number;
  emoteMap: Map<string, EmoteEntry>;
}) {
  const tokens = useMemo(() => renderTokens(message.textRaw, emoteMap), [
    message.textRaw,
    emoteMap,
  ]);

  const className = ["chat-message", message.isDeleted ? "is-deleted" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <span className="chat-time" title="Time in video">
        {formatRenderTime(renderTime)}
      </span>
      <span
        className="chat-author"
        style={{ color: message.authorColor || "#9ca3af" }}
      >
        {message.authorDisplayName ?? message.authorLogin}
      </span>
      <span className="chat-separator">: </span>
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
}

type Token =
  | { type: "text"; value: string }
  | { type: "emote"; name: string; url: string };

function renderTokens(text: string, emoteMap: Map<string, EmoteEntry>): Token[] {
  if (emoteMap.size === 0) {
    return [{ type: "text", value: text }];
  }

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
