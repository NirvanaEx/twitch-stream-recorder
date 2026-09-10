"use client";

import { memo, useMemo, useState } from "react";
import { renderTokens, type EmoteEntry, type InlineEmote } from "../lib/chat-render";
import { resolveArchivedGif } from "../lib/chat-gifs";

/**
 * A message body: text with emotes substituted in. Shared by the replay list
 * and the per-user history card so both render a message the same way.
 */
export const ChatText = memo(function ChatText({
  text,
  emoteMap,
  twitchEmotes,
  inlineEmotes,
  twitchGifs,
  gifUrls,
  gifAssets,
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
  twitchGifs?: string | null;
  gifUrls?: Record<string, string>;
  gifAssets?: Record<string, string>;
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
    () => renderTokens(text, emoteMap, twitchEmotes, inlineEmotes, twitchGifs),
    [text, emoteMap, twitchEmotes, inlineEmotes, twitchGifs],
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
            role={onMentionClick ? "button" : undefined}
            tabIndex={onMentionClick ? 0 : undefined}
            title={onMentionClick ? mentionTitle : undefined}
            onClick={
              onMentionClick
                ? (event) => {
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
        ) : token.type === "link" ? (
          <a
            key={`link-${index}`}
            className="chat-link"
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            onAuxClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {token.value}
          </a>
        ) : token.type === "gif" ? (
          <ChatGif key={`gif-${token.id}-${token.url}-${gifUrls?.[token.url]}-${index}`}
            url={token.url} label={token.name} reference={gifUrls?.[token.url]} assets={gifAssets} />
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

function ChatGif({ url, label, reference, assets }: {
  url: string; label: string; reference?: string; assets?: Record<string, string>;
}) {
  const archived = useMemo(() => resolveArchivedGif(reference, assets), [reference, assets]);
  const [failures, setFailures] = useState(0);
  if (failures >= (archived ? 2 : 1)) return <span>{label}</span>;
  const source = archived && failures === 0 ? archived : url;
  return (
    <a className="chat-gif" href={source} target="_blank" rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      onAuxClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}>
      <img src={source} alt={label} title={label} loading="lazy" decoding="async"
        referrerPolicy="no-referrer" onError={() => setFailures((count) => count + 1)} />
    </a>
  );
}
