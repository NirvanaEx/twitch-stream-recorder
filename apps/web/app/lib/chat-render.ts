import { buildApiUrl } from "./api";
import type { ChatRole } from "./chat-prefs";

/**
 * Shared chat types and message tokenizing. Lives outside the component so the
 * replay list and the per-user history card render messages identically
 * without importing each other.
 */

export type ChatMessage = {
  id: string;
  authorLogin: string;
  authorDisplayName: string | null;
  authorColor: string | null;
  textRaw: string;
  badges?: string | null;
  /**
   * Author roles normalized by the API across Twitch and Kick. Absent in
   * .tsr.json bundles downloaded before this existed — the legacy `badges`
   * string is parsed as a fallback then.
   */
  roles?: ChatRole[];
  /** Raw Twitch IRC emote tag, code-point indexed. */
  emotes?: string | null;
  /**
   * Kick's own emotes and where they sit in `textRaw`. Kick sends them inline
   * as `[emote:39292:catJAM]`; capture unwraps the token to the bare name, so
   * without these the message reads as plain words.
   */
  inlineEmotes?: InlineEmote[] | null;
  relativeTimeSec: number;
  messageTimestamp: string;
  isDeleted: boolean;
  /**
   * When the deletion happened, on the same timeline as relativeTimeSec — so
   * the replay can strike the message at the moment chat saw it vanish
   * instead of from the very start. Null on rows recorded before this was
   * exposed, which fall back to "deleted from the beginning".
   */
  deletedAtSec?: number | null;
  /** Timeout seconds behind the deletion; 0 = permanent ban; null = plain delete. */
  banDurationSec?: number | null;
  /** The author's first message ever in this channel (Twitch first-msg tag). */
  isFirstMessage?: boolean;
};

export type EmoteEntry = {
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

export type EmotePayload = {
  provider: string;
  fetchedAt: string;
  emotes: EmoteEntry[];
};

export type ChatResponse = {
  messages: ChatMessage[];
  emotes: EmotePayload | null;
};

export type InlineEmote = { id: string; name: string; start: number; end: number };

export type Token =
  | { type: "text"; value: string }
  | { type: "mention"; name: string }
  | { type: "emote"; name: string; url: string; fallbackUrl?: string };

export function renderTokens(
  text: string,
  emoteMap: Map<string, EmoteEntry>,
  twitchEmotes?: string | null,
  inlineEmotes?: InlineEmote[] | null,
): Token[] {
  // Kick first: the message carries the exact emote ids, which beats guessing
  // by name against a 7TV set that may not even contain them.
  if (inlineEmotes?.length) {
    return renderInlineEmoteTokens(text, emoteMap, inlineEmotes);
  }

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
export function resolveEmoteSrc(emote: EmoteEntry): { url: string; fallbackUrl?: string } {
  if (!emote.localUrl) {
    return { url: emote.url };
  }

  if (emote.localUrl.startsWith("data:")) {
    return { url: emote.localUrl };
  }

  return { url: buildApiUrl(emote.localUrl), fallbackUrl: emote.url };
}

/**
 * Kick emotes sit at recorded string offsets in the text. Each position is
 * verified against the emote's name before use and re-found when it does not
 * line up: messages captured before the offsets were fixed can be shifted by
 * however much leading whitespace the trim removed.
 */
function renderInlineEmoteTokens(
  text: string,
  emoteMap: Map<string, EmoteEntry>,
  inlineEmotes: InlineEmote[],
): Token[] {
  const placed: Array<{ id: string; name: string; start: number }> = [];
  let searchFrom = 0;

  for (const emote of [...inlineEmotes].sort((a, b) => a.start - b.start)) {
    if (!emote.name) continue;

    let start = emote.start;

    if (text.slice(start, start + emote.name.length) !== emote.name) {
      const found = text.indexOf(emote.name, searchFrom);
      if (found < 0) continue;
      start = found;
    }

    // Overlapping placements would duplicate text; skip rather than corrupt.
    if (start < searchFrom) continue;

    placed.push({ id: emote.id, name: emote.name, start });
    searchFrom = start + emote.name.length;
  }

  const tokens: Token[] = [];
  let cursor = 0;

  for (const emote of placed) {
    tokens.push(...renderPlainTokens(text.slice(cursor, emote.start), emoteMap));
    tokens.push({
      type: "emote",
      name: emote.name,
      url: `https://files.kick.com/emotes/${encodeURIComponent(emote.id)}/fullsize`,
    });
    cursor = emote.start + emote.name.length;
  }

  tokens.push(...renderPlainTokens(text.slice(cursor), emoteMap));
  return tokens;
}

// A leading "@" plus the characters both platforms allow in a login. The tail
// (punctuation like "," or "!") is kept as ordinary text.
const MENTION_PATTERN = /^@([\p{L}\p{N}_.-]{1,32})([\s\S]*)$/u;

function renderPlainTokens(text: string, emoteMap: Map<string, EmoteEntry>): Token[] {
  if (!text) return [];

  const parts = text.split(/(\s+)/);
  const tokens: Token[] = [];

  const pushText = (value: string) => {
    if (!value) return;
    const last = tokens[tokens.length - 1];
    if (last?.type === "text") last.value += value;
    else tokens.push({ type: "text", value });
  };

  for (const part of parts) {
    if (part.startsWith("@") && part.length > 1) {
      const mention = MENTION_PATTERN.exec(part);
      if (mention) {
        tokens.push({ type: "mention", name: mention[1] });
        pushText(mention[2]);
        continue;
      }
    }

    const emote = emoteMap.get(part);

    if (emote) {
      tokens.push({ type: "emote", name: emote.name, ...resolveEmoteSrc(emote) });
    } else {
      pushText(part);
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

// IRC "/me": the payload is wrapped in SOH + "ACTION " ... SOH. Built from a
// char code so the control byte never has to survive a source-file round trip.
const ACTION_MARK = String.fromCharCode(1);
const ACTION_PREFIX = `${ACTION_MARK}ACTION `;

export function parseActionMessage(raw: string) {
  if (!raw.startsWith(ACTION_PREFIX)) return { text: raw, isAction: false };
  const withoutPrefix = raw.slice(ACTION_PREFIX.length);
  return {
    text: withoutPrefix.endsWith(ACTION_MARK) ? withoutPrefix.slice(0, -1) : withoutPrefix,
    isAction: true,
  };
}

/**
 * Roles of a message's author. Prefers the API's normalized list and falls
 * back to parsing the raw Twitch badge string, which is all an older bundle
 * carries.
 */
export function messageRoles(message: ChatMessage): ChatRole[] {
  if (message.roles?.length) return message.roles;
  if (!message.badges) return [];

  const legacy: Record<string, ChatRole> = {
    broadcaster: "broadcaster",
    moderator: "moderator",
    vip: "vip",
    subscriber: "subscriber",
    founder: "subscriber",
    staff: "staff",
    admin: "staff",
    global_mod: "staff",
    partner: "verified",
    turbo: "turbo",
  };

  const roles = new Set<ChatRole>();
  for (const entry of message.badges.split(",")) {
    const role = legacy[entry.split("/")[0]];
    if (role) roles.add(role);
  }
  return [...roles];
}

/**
 * Whether the viewer should see this message as deleted *yet*.
 *
 * A ban wipes the author's whole backlog at once, so messages sent long
 * before it are flagged deleted too. Showing them struck through from the
 * start would rewrite history — during the stream they read as normal until
 * the ban landed. `chatTimeSec` is the point the player has reached, on the
 * chat timeline.
 */
export function isVisiblyDeleted(message: ChatMessage, chatTimeSec: number) {
  if (!message.isDeleted) return false;
  if (message.deletedAtSec == null) return true;
  return chatTimeSec >= message.deletedAtSec;
}

export function formatRenderTime(totalSeconds: number) {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
