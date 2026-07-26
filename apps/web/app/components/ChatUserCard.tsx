"use client";

import { useMemo } from "react";
import type { ChatCopy } from "../lib/chat-copy";
import { ROLE_LABELS } from "../lib/chat-copy";
import { readableAuthorColor } from "../lib/chat-prefs";
import {
  formatRenderTime,
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
};

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
}: Props) {
  const own = useMemo(
    () => messages.filter((message) => message.authorLogin === login),
    [messages, login],
  );

  // Only what the viewer could already have seen. Showing the rest would spoil
  // the stream — the whole point of the card is "who is this, so far".
  const shown = useMemo(
    () => own.filter((message) => message.relativeTimeSec <= thresholdSec),
    [own, thresholdSec],
  );

  const latest = shown[shown.length - 1] ?? own[0];
  const displayName = latest?.authorDisplayName ?? login;
  const color = readableColors ? readableAuthorColor(latest?.authorColor) : latest?.authorColor;
  const roles = latest ? messageRoles(latest) : [];
  const deletedCount = shown.filter((message) => message.isDeleted).length;

  return (
    <div className="chat-user-card">
      <div className="chat-user-card__head">
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
        <b>{shown.length}</b> {copy.userCardCount}
        {own.length !== shown.length ? (
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

      <div className="chat-user-card__hint">{copy.userCardHint}</div>

      <div className="chat-user-card__list">
        {shown.length === 0 ? (
          <div className="chat-empty">{copy.userCardEmpty}</div>
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
                className={`chat-user-card__row${message.isDeleted ? " is-deleted" : ""}`}
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
    </div>
  );
}
