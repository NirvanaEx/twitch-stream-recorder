import { parseStoredJson } from "./stored-chat.utils";

/**
 * Author roles, normalized across platforms.
 *
 * The two platforms store badges in shapes that have nothing in common:
 * Twitch keeps the raw IRC tag ("moderator/1,subscriber/12"), Kick an object
 * with an array of `{type, text, count, image}`. The web chat used to read
 * only the Twitch string, so every Kick badge was silently dropped — the
 * parser hands back null for anything that is not a string.
 *
 * Rather than teach the UI both shapes, the roles are flattened here and sent
 * alongside the untouched `badges` field, which the userscript and older
 * .tsr.json bundles still read.
 */

export type ChatRole =
  | "broadcaster"
  | "moderator"
  | "vip"
  | "subscriber"
  | "founder"
  | "staff"
  | "verified"
  | "og"
  | "sub_gifter"
  | "turbo"
  | "artist";

const ROLE_ORDER: ChatRole[] = [
  "broadcaster",
  "moderator",
  "staff",
  "verified",
  "vip",
  "og",
  "founder",
  "subscriber",
  "sub_gifter",
  "artist",
  "turbo",
];

// Both platforms' badge names, mapped onto the shared vocabulary. A Twitch
// "founder" is an early subscriber, so it counts as both; "partner" and Kick's
// "verified" are the closest thing either platform has to "this is another
// streamer", which is what people actually want to highlight.
const ROLE_ALIASES: Record<string, ChatRole[]> = {
  broadcaster: ["broadcaster"],
  host: ["broadcaster"],
  moderator: ["moderator"],
  mod: ["moderator"],
  vip: ["vip"],
  subscriber: ["subscriber"],
  sub: ["subscriber"],
  founder: ["subscriber", "founder"],
  sub_gifter: ["sub_gifter"],
  "sub-gifter": ["sub_gifter"],
  staff: ["staff"],
  admin: ["staff"],
  global_mod: ["staff"],
  partner: ["verified"],
  verified: ["verified"],
  og: ["og"],
  turbo: ["turbo"],
  artist: ["artist"],
  "artist-badge": ["artist"],
};

type KickBadge = { type?: string | null; text?: string | null };
type KickBadges = { provider?: string; badges?: KickBadge[] };

export function extractChatRoles(badgesJson: string | null | undefined): ChatRole[] {
  if (!badgesJson) return [];

  const parsed = parseStoredJson<string | KickBadges>(badgesJson);

  if (!parsed) return [];

  const names =
    typeof parsed === "string"
      ? // Twitch: "moderator/1,subscriber/12" — the part before the slash.
        parsed.split(",").map((entry) => entry.split("/")[0])
      : (parsed.badges ?? []).map((badge) => badge?.type ?? badge?.text ?? "");

  const roles = new Set<ChatRole>();

  for (const name of names) {
    for (const role of ROLE_ALIASES[String(name).trim().toLowerCase()] ?? []) {
      roles.add(role);
    }
  }

  // Stable, rank-ordered output so the UI can render badges without sorting.
  return ROLE_ORDER.filter((role) => roles.has(role));
}

export type InlineEmote = { id: string; name: string; start: number; end: number };

/**
 * Kick's own emotes for one message.
 *
 * Kick sends them inline as `[emote:39292:catJAM]`; capture unwraps the token
 * to the bare name and records where it landed. That lands in the same column
 * as the Twitch emote tag, and the string parser hands back null for it — so
 * the web chat has been showing Kick emotes as plain words. Returned as its
 * own field, leaving `emotes` (the raw Twitch tag) untouched for the
 * userscript and older bundles.
 */
export function extractInlineEmotes(emotesJson: string | null | undefined): InlineEmote[] {
  if (!emotesJson) return [];

  const parsed = parseStoredJson<{ provider?: string; emotes?: InlineEmote[] }>(emotesJson);

  if (!parsed || typeof parsed !== "object" || parsed.provider !== "kick") {
    return [];
  }

  return (parsed.emotes ?? []).filter(
    (emote) =>
      emote &&
      typeof emote.id === "string" &&
      typeof emote.name === "string" &&
      Number.isFinite(emote.start) &&
      Number.isFinite(emote.end),
  );
}
