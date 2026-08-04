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

export type PredictionBet = {
  /** "blue-1" — which outcome slot, and therefore which colour. */
  badgeVersion: string;
  /** The outcome as it was written, e.g. "PETERBOT POLLO". */
  outcomeTitle: string | null;
};

/**
 * What this author bet on, if anything.
 *
 * Twitch puts the bet in the chat line itself, split across two tags: `badges`
 * carries `predictions/blue-1` (the slot) and `badge-info` carries
 * `predictions/PETERBOT POLLO` (the label). Neither is useful alone — the slot
 * has no meaning without the label, and the label has no colour without the
 * slot — so they are read together and handed to the UI as one thing.
 *
 * This is deliberately independent of the recorded prediction event: it works
 * even when the prediction opened before the recorder attached, or when the
 * PubSub capture was down. Messages captured before badge-info was stored
 * simply have no label, and the UI falls back to the colour alone.
 */
export function extractPredictionBet(
  badgesJson: string | null | undefined,
  badgeInfoJson: string | null | undefined,
): PredictionBet | null {
  const badges = badgesJson ? parseStoredJson<string | KickBadges>(badgesJson) : null;

  // Kick has no predictions, and its badges parse to an object — bail on both.
  if (typeof badges !== "string") return null;

  const badgeVersion = findTagValue(badges, "predictions");
  if (!badgeVersion) return null;

  const info = badgeInfoJson ? parseStoredJson<string>(badgeInfoJson) : null;
  const outcomeTitle = typeof info === "string" ? findTagValue(info, "predictions") : null;

  return { badgeVersion, outcomeTitle };
}

/**
 * The value of one badge in an IRC badge list.
 *
 * Only the FIRST slash is a separator: outcome titles routinely contain one
 * ("HIGGS/CURVE"), and splitting on every slash would truncate them.
 */
function findTagValue(list: string, key: string): string | null {
  for (const entry of list.split(",")) {
    const slash = entry.indexOf("/");
    if (slash === -1) continue;
    if (entry.slice(0, slash) !== key) continue;
    const value = entry.slice(slash + 1).trim();
    if (value) return value;
  }
  return null;
}

/**
 * When a deletion happened, on the same timeline as relativeTimeSec.
 *
 * A ban wipes the author's whole backlog, so every one of their earlier
 * messages is flagged deleted. Replaying that as "struck through from the
 * start" is wrong: during the stream those messages looked perfectly normal
 * until the moment the hammer fell. With the deletion placed on the timeline,
 * the replay can strike them exactly when chat saw it happen.
 *
 * The capture anchor is not stored, but every message carries both its wall
 * clock time and its offset from that anchor, so it can be recovered. The max
 * is taken rather than the first message's: relativeTimeSec is clamped at 0,
 * so anything captured before the anchor (Kick backfills its recent history)
 * would drag the estimate backwards. Accurate to within a second, which is
 * the resolution of relativeTimeSec anyway.
 */
export function resolveCaptureAnchorMs(
  messages: Array<{ messageTimestamp: Date; relativeTimeSec: number }>,
): number | null {
  let anchor: number | null = null;

  for (const message of messages) {
    const candidate = message.messageTimestamp.getTime() - message.relativeTimeSec * 1000;
    if (anchor === null || candidate > anchor) anchor = candidate;
  }

  return anchor;
}

export function deletionOffsetSec(
  deletedAt: Date | null | undefined,
  anchorMs: number | null,
): number | null {
  if (!deletedAt || anchorMs === null) return null;
  return Math.round((deletedAt.getTime() - anchorMs) / 1000);
}

export type InlineEmote = {
  id: string;
  name: string;
  start: number;
  end: number;
  /**
   * Where the picture lives, for platforms that do not have one predictable
   * CDN path per id. Kick emotes leave this unset — theirs is derived from the
   * id — while VK Play Live sends the url with every message.
   */
  url?: string | null;
};

/**
 * A platform's own emotes for one message.
 *
 * Kick sends them inline as `[emote:39292:catJAM]` and VK Play Live as typed
 * parts; capture unwraps both to the bare name and records where it landed.
 * That lands in the same column as the Twitch emote tag, and the string parser
 * hands back null for it — so without this the web chat shows them as plain
 * words. Returned as its own field, leaving `emotes` (the raw Twitch tag)
 * untouched for the userscript and older bundles.
 */
const INLINE_EMOTE_PROVIDERS = new Set(["kick", "vkplay"]);

export function extractInlineEmotes(emotesJson: string | null | undefined): InlineEmote[] {
  if (!emotesJson) return [];

  const parsed = parseStoredJson<{ provider?: string; emotes?: InlineEmote[] }>(emotesJson);

  if (!parsed || typeof parsed !== "object" || !INLINE_EMOTE_PROVIDERS.has(parsed.provider ?? "")) {
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
