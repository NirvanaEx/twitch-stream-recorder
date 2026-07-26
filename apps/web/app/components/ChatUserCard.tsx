"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ChatCopy } from "../lib/chat-copy";
import { ROLE_LABELS } from "../lib/chat-copy";
import { readableAuthorColor } from "../lib/chat-prefs";
import {
  formatRenderTime,
  isVisiblyDeleted,
  messageRoles,
  parseActionMessage,
  type ChatMessage,
  type EmoteEntry,
} from "../lib/chat-render";
import { ChatText } from "./ChatText";

type Props = {
  login: string;
  /** Whole-stream message list, already sorted by relativeTimeSec. */
  messages: ChatMessage[];
  /** Chat time already reached by the player, on the whole-stream timeline. */
  thresholdSec: number;
  emoteMap: Map<string, EmoteEntry>;
  emotePx: number;
  readableColors: boolean;
  copy: ChatCopy;
  locale: "ru" | "en";
  onClose: () => void;
  /** Seek the player to a message, given its whole-stream time. */
  onSeek: (relativeTimeSec: number) => void;
  /**
   * False when that moment lies outside the part currently loaded, so the row
   * can say so instead of jumping somewhere wrong.
   */
  canSeek: (relativeTimeSec: number) => boolean;
  /** Same time the main list shows for a message, so the two agree. */
  toRenderTime: (relativeTimeSec: number) => number;
  /** Where to put the card the first time it opens — the chat column. */
  anchorEl: HTMLElement | null;
};

const CARD_WIDTH = 330;
const POSITION_KEY = "tsr-chat-user-card-pos";

function clampToViewport(x: number, y: number, width: number, height: number) {
  const maxX = Math.max(4, window.innerWidth - width - 4);
  const maxY = Math.max(4, window.innerHeight - height - 4);
  return { x: Math.min(Math.max(4, x), maxX), y: Math.min(Math.max(4, y), maxY) };
}

export function ChatUserCard({
  login,
  messages,
  thresholdSec,
  emoteMap,
  emotePx,
  readableColors,
  copy,
  locale,
  onClose,
  onSeek,
  canSeek,
  toRenderTime,
  anchorEl,
}: Props) {
  // Rendered into <body>: the card is dragged anywhere on screen, and a
  // position:fixed element trapped inside a transformed ancestor would be
  // clipped to the chat column instead.
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [search, setSearch] = useState("");
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => setMounted(true), []);

  // Reopen where it was left, unless that spot no longer fits (window resized
  // or a smaller screen) — then fall back to sitting over the chat column.
  useEffect(() => {
    if (!mounted || position) return;

    let stored: { x: number; y: number } | null = null;
    try {
      const raw = window.localStorage.getItem(POSITION_KEY);
      if (raw) stored = JSON.parse(raw) as { x: number; y: number };
    } catch {
      // Ignore a corrupt value.
    }

    const height = Math.min(420, window.innerHeight * 0.6);

    if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
      setPosition(clampToViewport(stored.x, stored.y, CARD_WIDTH, height));
      return;
    }

    const rect = anchorEl?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 - CARD_WIDTH / 2 : window.innerWidth - CARD_WIDTH - 24;
    const y = rect ? rect.bottom - height - 8 : 80;

    setPosition(clampToViewport(x, y, CARD_WIDTH, height));
  }, [mounted, position, anchorEl]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    // Let the close button and the search field behave normally.
    if ((event.target as HTMLElement).closest("button, input")) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const offset = dragOffset.current;
    const card = cardRef.current;
    if (!offset || !card) return;

    event.preventDefault();
    const rect = card.getBoundingClientRect();
    setPosition(
      clampToViewport(event.clientX - offset.x, event.clientY - offset.y, rect.width, rect.height),
    );
  }, []);

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragOffset.current) return;
      dragOffset.current = null;

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Capture may already be gone.
      }

      if (position) {
        try {
          window.localStorage.setItem(POSITION_KEY, JSON.stringify(position));
        } catch {
          // Ignore storage errors.
        }
      }
    },
    [position],
  );

  // Escape closes, like any dialog.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const own = useMemo(
    () => messages.filter((message) => message.authorLogin === login),
    [messages, login],
  );

  // Only what the viewer could already have seen. Showing the rest would spoil
  // the stream — the whole point of the card is "who is this, so far".
  const upToNow = useMemo(
    () => own.filter((message) => message.relativeTimeSec <= thresholdSec),
    [own, thresholdSec],
  );

  const term = search.trim().toLowerCase();
  const shown = useMemo(
    () => (term ? upToNow.filter((m) => m.textRaw.toLowerCase().includes(term)) : upToNow),
    [upToNow, term],
  );

  const latest = upToNow[upToNow.length - 1] ?? own[0];
  const displayName = latest?.authorDisplayName ?? login;
  const color = readableColors ? readableAuthorColor(latest?.authorColor) : latest?.authorColor;
  const roles = latest ? messageRoles(latest) : [];
  // Counted the same way the list shows them: a ban that lands later has not
  // happened yet at this point in the video.
  const deletedCount = upToNow.filter((message) => isVisiblyDeleted(message, thresholdSec)).length;

  if (!mounted || !position) return null;

  return createPortal(
    <div
      ref={cardRef}
      className="chat-user-card"
      style={{ left: position.x, top: position.y, width: CARD_WIDTH }}
      role="dialog"
      aria-label={`${copy.userCardTitle}: ${displayName}`}
    >
      <div
        className="chat-user-card__head"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        title={copy.userCardDrag}
      >
        <span className="chat-user-card__grip" aria-hidden="true">
          ⠿
        </span>
        <span className="chat-user-card__name" style={{ color: color || "#9ca3af" }}>
          {displayName}
        </span>
        <button
          type="button"
          className="chat-user-card__close"
          onClick={onClose}
          title={copy.userCardClose}
          aria-label={copy.userCardClose}
        >
          ✕
        </button>
      </div>

      <div className="chat-user-card__meta">
        {roles.length > 0 ? (
          <div className="chat-user-card__roles">
            {roles.map((role) => (
              <span key={role} className={`chat-badge chat-badge--${role}`}>
                {ROLE_LABELS[role].badge}
              </span>
            ))}
          </div>
        ) : null}

        <div className="chat-user-card__stats">
          <b>{upToNow.length}</b> {copy.userCardCount}
          {own.length !== upToNow.length ? (
            <>
              {" · "}
              <b>{own.length}</b> {copy.userCardTotal}
            </>
          ) : null}
          {deletedCount > 0 ? (
            <>
              {" · "}
              <b>{deletedCount}</b> {copy.userCardDeleted}
            </>
          ) : null}
        </div>

        <input
          type="search"
          className="chat-user-card__search"
          value={search}
          placeholder={copy.userCardSearch}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="chat-user-card__hint">{copy.userCardHint}</div>
      </div>

      <div className="chat-user-card__list thin-scroll">
        {shown.length === 0 ? (
          <div className="chat-empty">{term ? copy.userCardNoMatch : copy.userCardEmpty}</div>
        ) : (
          // Newest first: the reason to open this card is almost always "what
          // did they just say", not "how did they start".
          [...shown].reverse().map((message) => {
            const display = parseActionMessage(message.textRaw);
            const seekable = canSeek(message.relativeTimeSec);

            return (
              <button
                key={message.id}
                type="button"
                className={`chat-user-card__row${
                  isVisiblyDeleted(message, thresholdSec) ? " is-deleted" : ""
                }`}
                onClick={() => onSeek(message.relativeTimeSec)}
                disabled={!seekable}
                title={seekable ? copy.userCardSeek : copy.userCardOtherPart}
              >
                <span className="chat-time">
                  {formatRenderTime(toRenderTime(message.relativeTimeSec))}
                </span>
                <span className="chat-text">
                  <ChatText
                    text={display.text}
                    emoteMap={emoteMap}
                    twitchEmotes={message.emotes}
                    inlineEmotes={message.inlineEmotes}
                    emotePx={Math.min(emotePx, 24)}
                  />
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  );
}
