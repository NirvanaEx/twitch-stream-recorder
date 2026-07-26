"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Chat appearance and filtering preferences.
 *
 * Kept in one localStorage blob rather than a key per switch: there are a
 * dozen of them now, and the two that shipped as separate keys are migrated in
 * on first read so nobody loses a setting they already made.
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

/** The roles worth offering as a highlight switch — the rest are noise. */
export const HIGHLIGHTABLE_ROLES = [
  "broadcaster",
  "moderator",
  "vip",
  "subscriber",
  "verified",
  "staff",
] as const satisfies readonly ChatRole[];

export type ChatPrefs = {
  fontPx: number;
  emotePx: number;
  /** Tighter line spacing — fits roughly a third more messages on screen. */
  compact: boolean;
  showTimestamps: boolean;
  /** Alternating row tint; makes wall-of-text stretches scannable. */
  stripes: boolean;
  /**
   * Lift author colours that are too dark to read on the panel background.
   * Twitch lets people pick near-black nick colours, which are unreadable here.
   */
  readableColors: boolean;
  showDeleted: boolean;
  useLiveEmotes: boolean;
  highlightRoles: ChatRole[];
  highlightFirstMessage: boolean;
  /** Comma-separated words; a message containing one gets the accent row. */
  keywords: string;
  /** Hide "!command" messages — usually bot traffic. */
  hideCommands: boolean;
  /** Comma-separated logins to hide entirely (bots). */
  hiddenUsers: string;
  /**
   * Show the whole broadcast timeline at once. Off by default: the category
   * strip would otherwise announce that the streamer switches to something
   * else two hours in, which is exactly the kind of thing people watch a
   * recording to discover.
   */
  revealTimeline: boolean;
  /** Replay the prediction/poll cards above the chat. */
  showEvents: boolean;
  /** Show the "bet on X" chip before a nick while a prediction was open. */
  showBets: boolean;
};

export const DEFAULT_CHAT_PREFS: ChatPrefs = {
  fontPx: 13,
  emotePx: 28,
  compact: false,
  showTimestamps: true,
  stripes: false,
  readableColors: true,
  showDeleted: true,
  useLiveEmotes: false,
  highlightRoles: ["broadcaster", "moderator"],
  highlightFirstMessage: true,
  keywords: "",
  hideCommands: false,
  hiddenUsers: "",
  revealTimeline: false,
  showEvents: true,
  showBets: true,
};

export const CHAT_PREFS_LIMITS = {
  fontPx: { min: 10, max: 24 },
  emotePx: { min: 16, max: 64 },
};

const STORAGE_KEY = "tsr-chat-prefs";
const LEGACY_SHOW_DELETED = "tsr-chat-show-deleted";
const LEGACY_LIVE_EMOTES = "tsr-chat-live-emotes";

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function readStored(): ChatPrefs {
  if (typeof window === "undefined") return DEFAULT_CHAT_PREFS;

  let stored: Partial<ChatPrefs> = {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<ChatPrefs>;
  } catch {
    // Corrupt blob — fall back to defaults rather than break the chat.
  }

  // Settings made before this blob existed.
  try {
    if (stored.showDeleted === undefined) {
      stored.showDeleted = window.localStorage.getItem(LEGACY_SHOW_DELETED) !== "0";
    }
    if (stored.useLiveEmotes === undefined) {
      stored.useLiveEmotes = window.localStorage.getItem(LEGACY_LIVE_EMOTES) === "1";
    }
  } catch {
    // Ignore unavailable storage (private mode).
  }

  return {
    ...DEFAULT_CHAT_PREFS,
    ...stored,
    fontPx: clamp(
      stored.fontPx,
      CHAT_PREFS_LIMITS.fontPx.min,
      CHAT_PREFS_LIMITS.fontPx.max,
      DEFAULT_CHAT_PREFS.fontPx,
    ),
    emotePx: clamp(
      stored.emotePx,
      CHAT_PREFS_LIMITS.emotePx.min,
      CHAT_PREFS_LIMITS.emotePx.max,
      DEFAULT_CHAT_PREFS.emotePx,
    ),
    highlightRoles: Array.isArray(stored.highlightRoles)
      ? stored.highlightRoles
      : DEFAULT_CHAT_PREFS.highlightRoles,
  };
}

export function useChatPrefs() {
  // Server render and first client paint must agree, so the stored blob is
  // read in an effect rather than in the initializer.
  const [prefs, setPrefs] = useState<ChatPrefs>(DEFAULT_CHAT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(readStored());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage errors.
    }
  }, [prefs, loaded]);

  const update = useCallback(<K extends keyof ChatPrefs>(key: K, value: ChatPrefs[K]) => {
    setPrefs((current) => ({ ...current, [key]: value }));
  }, []);

  const toggleRole = useCallback((role: ChatRole) => {
    setPrefs((current) => ({
      ...current,
      highlightRoles: current.highlightRoles.includes(role)
        ? current.highlightRoles.filter((entry) => entry !== role)
        : [...current.highlightRoles, role],
    }));
  }, []);

  const reset = useCallback(() => setPrefs(DEFAULT_CHAT_PREFS), []);

  return { prefs, update, toggleRole, reset };
}

/**
 * Chat offset, remembered per recording.
 *
 * It is a correction for one archive's alignment, so a single shared value
 * would carry a fix for one stream onto every other one. Keyed by archive
 * instead, and only stored once it differs from what the server computed —
 * otherwise a later server-side improvement could never reach a viewer who
 * had merely opened the page.
 */
export function useChatOffset(storageKey: string | null, defaultOffsetSec: number) {
  const [offset, setOffset] = useState(defaultOffsetSec);
  const [loaded, setLoaded] = useState(false);

  const key = storageKey ? `tsr-chat-offset:${storageKey}` : null;

  useEffect(() => {
    setLoaded(false);

    if (!key) {
      setOffset(defaultOffsetSec);
      setLoaded(true);
      return;
    }

    let stored: number | null = null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) stored = parsed;
      }
    } catch {
      // Ignore unavailable storage.
    }

    setOffset(stored ?? defaultOffsetSec);
    setLoaded(true);
  }, [key, defaultOffsetSec]);

  useEffect(() => {
    if (!loaded || !key) return;

    try {
      if (offset === defaultOffsetSec) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, String(offset));
    } catch {
      // Ignore storage errors.
    }
  }, [offset, defaultOffsetSec, key, loaded]);

  return [offset, setOffset] as const;
}

/** "word, other" -> ["word", "other"], lowercased and de-blanked. */
export function splitList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Push a too-dark author colour up to something readable on the dark panel,
 * keeping its hue. Twitch allows any hex, and #0a0a23 on #16161a is invisible.
 */
export function readableAuthorColor(color: string | null | undefined) {
  if (!color) return "#9ca3af";

  const match = /^#?([0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return color;

  const value = parseInt(match[1], 16);
  let r = (value >> 16) & 0xff;
  let g = (value >> 8) & 0xff;
  let b = value & 0xff;

  // Rec. 709 luma; below ~0.3 the nick disappears into the background.
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luma >= 0.35) return color;

  const lift = 0.35 / Math.max(luma, 0.04);
  r = Math.min(255, Math.round(r * lift) || 90);
  g = Math.min(255, Math.round(g * lift) || 90);
  b = Math.min(255, Math.round(b * lift) || 90);

  return `rgb(${r}, ${g}, ${b})`;
}
