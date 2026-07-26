"use client";

import type { ChatCopy } from "../lib/chat-copy";
import { ROLE_LABELS } from "../lib/chat-copy";
import {
  CHAT_PREFS_LIMITS,
  HIGHLIGHTABLE_ROLES,
  type ChatPrefs,
  type ChatRole,
} from "../lib/chat-prefs";

type Props = {
  prefs: ChatPrefs;
  update: <K extends keyof ChatPrefs>(key: K, value: ChatPrefs[K]) => void;
  toggleRole: (role: ChatRole) => void;
  reset: () => void;
  copy: ChatCopy;
  locale: "ru" | "en";
  offset: number;
  setOffset: (next: number | ((current: number) => number)) => void;
  /** Transient, unlike the rest — a search is per-visit, not a preference. */
  search: string;
  setSearch: (value: string) => void;
  /** Omitted for offline bundles, which have no server to ask for a live set. */
  liveEmotesUrl?: string;
  liveEmotesNote: string | null;
};

export function ChatSettingsPanel({
  prefs,
  update,
  toggleRole,
  reset,
  copy,
  locale,
  offset,
  setOffset,
  search,
  setSearch,
  liveEmotesUrl,
  liveEmotesNote,
}: Props) {
  return (
    <div className="chat-settings">
      <div className="chat-offset-row">
        <span className="chat-offset-label">{copy.offset}</span>
        <button type="button" onClick={() => setOffset((o) => o - 5)} title="-5s">
          −5
        </button>
        <button type="button" onClick={() => setOffset((o) => o - 1)} title="-1s">
          −1
        </button>
        <input
          type="number"
          className="offset-input"
          value={offset}
          onChange={(event) => {
            const value = Number(event.target.value);
            setOffset(Number.isFinite(value) ? value : 0);
          }}
          aria-label={copy.offsetAria}
        />
        <span style={{ color: "var(--text-faint)" }}>s</span>
        <button type="button" onClick={() => setOffset((o) => o + 1)} title="+1s">
          +1
        </button>
        <button type="button" onClick={() => setOffset((o) => o + 5)} title="+5s">
          +5
        </button>
        <button type="button" onClick={() => setOffset(0)} title="reset">
          ↺
        </button>
      </div>

      <div className="chat-settings__section">{copy.sectionView}</div>

      <label className="chat-slider">
        <span>
          {copy.fontSize}
          <b>{prefs.fontPx}px</b>
        </span>
        <input
          type="range"
          min={CHAT_PREFS_LIMITS.fontPx.min}
          max={CHAT_PREFS_LIMITS.fontPx.max}
          value={prefs.fontPx}
          onChange={(event) => update("fontPx", Number(event.target.value))}
        />
      </label>

      <label className="chat-slider">
        <span>
          {copy.emoteSize}
          <b>{prefs.emotePx}px</b>
        </span>
        <input
          type="range"
          min={CHAT_PREFS_LIMITS.emotePx.min}
          max={CHAT_PREFS_LIMITS.emotePx.max}
          value={prefs.emotePx}
          onChange={(event) => update("emotePx", Number(event.target.value))}
        />
      </label>

      <div className="chat-chip-row">
        <Chip
          active={prefs.compact}
          label={copy.compact}
          onClick={() => update("compact", !prefs.compact)}
        />
        <Chip
          active={prefs.showTimestamps}
          label={copy.showTimestamps}
          onClick={() => update("showTimestamps", !prefs.showTimestamps)}
        />
        <Chip
          active={prefs.stripes}
          label={copy.stripes}
          onClick={() => update("stripes", !prefs.stripes)}
        />
        <Chip
          active={prefs.readableColors}
          label={copy.readableColors}
          title={copy.readableColorsHint}
          onClick={() => update("readableColors", !prefs.readableColors)}
        />
      </div>

      <div className="chat-settings__section">{copy.sectionHighlight}</div>

      <div className="chat-chip-row">
        {HIGHLIGHTABLE_ROLES.map((role) => (
          <Chip
            key={role}
            active={prefs.highlightRoles.includes(role)}
            label={ROLE_LABELS[role][locale]}
            className={`chat-chip--${role}`}
            onClick={() => toggleRole(role)}
          />
        ))}
        <Chip
          active={prefs.highlightFirstMessage}
          label={copy.highlightFirst}
          className="chat-chip--first"
          onClick={() => update("highlightFirstMessage", !prefs.highlightFirstMessage)}
        />
      </div>

      <label className="chat-field" title={copy.keywordsHint}>
        <span>{copy.keywords}</span>
        <input
          type="text"
          value={prefs.keywords}
          placeholder={copy.keywordsPlaceholder}
          onChange={(event) => update("keywords", event.target.value)}
        />
      </label>

      <div className="chat-settings__section">{copy.sectionFilter}</div>

      <label className="chat-field">
        <span>{copy.search}</span>
        <input
          type="search"
          value={search}
          placeholder={copy.searchPlaceholder}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      <label className="chat-toggle">
        <input
          type="checkbox"
          checked={prefs.showDeleted}
          onChange={(event) => update("showDeleted", event.target.checked)}
        />
        <span>{copy.showDeleted}</span>
      </label>

      <label className="chat-toggle">
        <input
          type="checkbox"
          checked={prefs.hideCommands}
          onChange={(event) => update("hideCommands", event.target.checked)}
        />
        <span>{copy.hideCommands}</span>
      </label>

      <label className="chat-field">
        <span>{copy.hiddenUsers}</span>
        <input
          type="text"
          value={prefs.hiddenUsers}
          placeholder={copy.hiddenUsersPlaceholder}
          onChange={(event) => update("hiddenUsers", event.target.value)}
        />
      </label>

      {liveEmotesUrl ? (
        <label className="chat-toggle" title={copy.liveEmotesHint}>
          <input
            type="checkbox"
            checked={prefs.useLiveEmotes}
            onChange={(event) => update("useLiveEmotes", event.target.checked)}
          />
          <span>
            {copy.liveEmotes}
            {liveEmotesNote ? ` — ${liveEmotesNote}` : ""}
          </span>
        </label>
      ) : null}

      <button type="button" className="chat-reset" onClick={reset}>
        {copy.reset}
      </button>
    </div>
  );
}

function Chip({
  active,
  label,
  onClick,
  title,
  className = "",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`chat-chip${active ? " is-active" : ""} ${className}`.trim()}
      onClick={onClick}
      title={title}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
