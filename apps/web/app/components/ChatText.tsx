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
}: {
  text: string;
  emoteMap: Map<string, EmoteEntry>;
  twitchEmotes?: string | null;
  inlineEmotes?: InlineEmote[] | null;
  emotePx: number;
  selfNames?: Set<string>;
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
