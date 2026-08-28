"use client";

import { memo, useMemo } from "react";
import { renderTokens, type EmoteEntry, type InlineEmote } from "../lib/chat-render";

/**
 * A message body: text with emotes substituted in. Shared by the replay list
 * and the per-user history card so both render a message the same way.
 */
export const ChatText = memo(function ChatText({
  text,
  emoteMap,
  twitchEmotes,
  inlineEmotes,
  emotePx,
  /** Lowercased logins to mark as "this is about you". */
  selfNames,
  onMentionClick,
  mentionTitle,
}: {
  text: string;
  emoteMap: Map<string, EmoteEntry>;
  twitchEmotes?: string | null;
  inlineEmotes?: InlineEmote[] | null;
  emotePx: number;
  selfNames?: Set<string>;
  /**
   * Open the mentioned user's history — the same card a click on the nick
   * opens. Without it a mention is still highlighted, just not clickable.
   */
  onMentionClick?: (name: string) => void;
  mentionTitle?: string;
}) {
  const tokens = useMemo(
    () => renderTokens(text, emoteMap, twitchEmotes, inlineEmotes),
    [text, emoteMap, twitchEmotes, inlineEmotes],
  );

  return (
    <>
      {tokens.map((token, index) =>
        token.type === "mention" ? (
          <span
            key={`mention-${index}`}
            className={`chat-mention${
              selfNames?.has(token.name.toLowerCase()) ? " is-self" : ""
            }`}
            // A span and not a button: the user card renders its messages
            // inside the seek button, and a button within a button is
            // invalid markup React refuses to hydrate.
            role={onMentionClick ? "button" : undefined}
            tabIndex={onMentionClick ? 0 : undefined}
            title={onMentionClick ? mentionTitle : undefined}
            onClick={
              onMentionClick
                ? (event) => {
                    // Otherwise the click also reaches the seek button below.
                    event.stopPropagation();
                    onMentionClick(token.name);
                  }
                : undefined
            }
            onKeyDown={
              onMentionClick
                ? (event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    event.stopPropagation();
                    onMentionClick(token.name);
                  }
                : undefined
            }
          >
            @{token.name}
          </span>
        ) : token.type === "emote" ? (
          <img
            key={`${token.name}-${index}`}
            src={token.url}
            alt={token.name}
            title={token.name}
            className="chat-emote"
            style={{ height: `${emotePx}px` }}
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
    </>
  );
});
