import type { ChatMessage } from "@prisma/client";
import {
  deletionOffsetSec,
  extractChatRoles,
  extractInlineEmotes,
  extractPredictionBet,
  type ChatRole,
  type InlineEmote,
  type PredictionBet,
} from "./chat-roles.utils";
import { parseStoredJsonString } from "./stored-chat.utils";

/**
 * One chat row as the replay reads it.
 *
 * Three call sites used to build this object by hand, character for character:
 * the public watch endpoint, the admin one, and the downloadable bundle.
 *
 * The shape is deliberately *sparse*. Every field that carries no information
 * — a null emote tag, an empty inline list, `isDeleted: false` — is left
 * `undefined`, which `JSON.stringify` drops entirely. That costs nothing to
 * read (the client already treats all of them as optional) and it is not a
 * micro-optimisation: a three-hour broadcast is ~38 000 messages, and at that
 * count the repeated key names of fields nobody set were over half the
 * response. Dropping them took the payload from 16 MB to 7 MB before
 * compression, and the browser spends the difference on parsing.
 */
export type ReplayMessage = {
  id: string;
  authorLogin: string;
  authorDisplayName?: string;
  authorColor?: string;
  textRaw: string;
  badges?: string;
  roles?: ChatRole[];
  emotes?: string;
  inlineEmotes?: InlineEmote[];
  predictionBet?: PredictionBet;
  relativeTimeSec: number;
  messageTimestamp?: string;
  isDeleted?: true;
  deletedAtSec?: number;
  banDurationSec?: number;
  isFirstMessage?: true;
};

type Options = {
  /**
   * Keep the wall-clock timestamp of every message.
   *
   * The players do not use it — they position messages by `relativeTimeSec` —
   * so the online endpoints leave it out. The downloadable bundle keeps it:
   * that file is meant to outlive this app, and a chat log without times is a
   * worse archive for the sake of bytes nobody is waiting on.
   */
  includeTimestamps?: boolean;
};

export function buildReplayMessage(
  message: ChatMessage,
  anchorMs: number | null,
  options: Options = {},
): ReplayMessage {
  const displayName = message.authorDisplayName;
  const inlineEmotes = extractInlineEmotes(message.emotesJson);
  const roles = extractChatRoles(message.badgesJson);
  const deletedAtSec = deletionOffsetSec(message.deletedAt, anchorMs);

  return {
    id: message.id,
    authorLogin: message.authorLogin,
    // The nick is the login for most people; sending it twice per message is
    // pure repetition. The client already falls back to the login.
    authorDisplayName:
      displayName && displayName !== message.authorLogin ? displayName : undefined,
    authorColor: message.authorColor ?? undefined,
    textRaw: message.textRaw,
    badges: parseStoredJsonString(message.badgesJson) ?? undefined,
    roles: roles.length > 0 ? roles : undefined,
    emotes: parseStoredJsonString(message.emotesJson) ?? undefined,
    inlineEmotes: inlineEmotes.length > 0 ? inlineEmotes : undefined,
    predictionBet:
      extractPredictionBet(message.badgesJson, message.badgeInfoJson) ?? undefined,
    relativeTimeSec: message.relativeTimeSec,
    messageTimestamp: options.includeTimestamps
      ? message.messageTimestamp.toISOString()
      : undefined,
    isDeleted: message.isDeleted ? true : undefined,
    deletedAtSec: deletedAtSec ?? undefined,
    banDurationSec: message.banDurationSec ?? undefined,
    isFirstMessage: message.isFirstMessage ? true : undefined,
  };
}
