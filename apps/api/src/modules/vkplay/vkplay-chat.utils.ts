/**
 * Turning a VK Play Live chat message into the flat shape the recorder stores.
 *
 * A message arrives as a list of typed parts rather than a string: ordinary
 * text, mentions of other viewers, and smiles that are images. The text part
 * is itself a JSON string in the editor's own format — ["текст","unstyled",[]]
 * — so a plain read of `content` would store the punctuation of that wrapper
 * as if the viewer had typed it.
 *
 * Smiles are flattened the same way Kick's are: the name goes into the text
 * where the image was, and its position is recorded alongside, so the replay
 * can paste the picture back and a plain-text export still reads sensibly.
 */

export type VkPlayMessagePart = {
  type?: string;
  content?: string;
  displayName?: string;
  nick?: string;
  name?: string;
  id?: string | number;
  smallUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
};

export type VkPlayInlineEmote = {
  id: string;
  name: string;
  start: number;
  end: number;
  /** VK Play hosts its smiles itself, so the picture travels with the message. */
  url: string | null;
};

export function renderChatMessage(parts: VkPlayMessagePart[] | undefined) {
  const emotes: VkPlayInlineEmote[] = [];
  let text = "";

  for (const part of parts ?? []) {
    switch (part.type) {
      case "text":
        text += readTextContent(part.content);
        break;

      case "mention":
        text += `@${part.displayName ?? part.nick ?? part.name ?? ""}`;
        break;

      case "link":
        text += readTextContent(part.content) || part.name || "";
        break;

      case "smile": {
        const name = part.name ?? String(part.id ?? "");
        if (!name) break;

        emotes.push({
          id: String(part.id ?? name),
          name,
          start: text.length,
          end: text.length + name.length - 1,
          url: part.largeUrl ?? part.mediumUrl ?? part.smallUrl ?? null,
        });
        text += name;
        break;
      }

      default:
        // Unknown part types (stickers, future toys) are skipped rather than
        // rendered as "[object Object]".
        break;
    }
  }

  return { text: text.trim(), emotes };
}

/**
 * A text part carries ["the text","unstyled",[]]. Older or odd parts have been
 * seen carrying the bare string, so both are accepted.
 */
function readTextContent(content: string | undefined) {
  if (!content) {
    return "";
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (Array.isArray(parsed) && typeof parsed[0] === "string") {
      return parsed[0];
    }

    return typeof parsed === "string" ? parsed : "";
  } catch {
    return content;
  }
}

/**
 * The colour a viewer's nickname is shown in. VK Play sends a palette index,
 * not a colour, and the palette is the site's own — these are the eight it
 * uses, read off the player. An index nobody recognises simply gets no colour,
 * which the chat renders in its default ink.
 */
const NICK_COLORS: Record<string, string> = {
  "1": "#e64646",
  "2": "#e6a23c",
  "3": "#d4c11e",
  "4": "#5fb63b",
  "5": "#3bb6a4",
  "6": "#3b8ee6",
  "7": "#8b5fe6",
  "8": "#e65fa4",
};

export function resolveNickColor(nickColor: unknown) {
  if (typeof nickColor === "number" || typeof nickColor === "string") {
    return NICK_COLORS[String(nickColor)] ?? null;
  }

  return null;
}

export type VkPlayBadge = {
  name?: string;
  smallUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  achievement?: { type?: string; name?: string };
};

/**
 * Badges and roles both hang off the author and both show up next to the
 * nickname; the recorder keeps them in one list, with the picture, because
 * that is all the replay needs to draw them.
 */
export function collectBadges(author: {
  badges?: VkPlayBadge[];
  roles?: VkPlayBadge[];
  isVerifiedStreamer?: boolean;
}) {
  const badges = [...(author.roles ?? []), ...(author.badges ?? [])].map((badge) => ({
    type: badge.achievement?.type ?? badge.name ?? null,
    text: badge.name ?? null,
    count: null as number | null,
    image: badge.mediumUrl ?? badge.smallUrl ?? badge.largeUrl ?? null,
  }));

  if (author.isVerifiedStreamer) {
    badges.unshift({ type: "verified", text: "Verified", count: null, image: null });
  }

  return badges;
}
