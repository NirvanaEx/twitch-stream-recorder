"use client";

import { useSpoiler } from "../lib/spoiler";
import { useLanguage } from "../providers";
import { EyeIcon, EyeOffIcon } from "./icons";

/**
 * The switch for spoiler-free mode.
 *
 * Deliberately present in both places a viewer changes their mind: on the list,
 * before picking something to watch, and inside the player, when a timeline
 * they did not want turns out to be sitting there.
 */
export function SpoilerToggle({
  variant = "button",
  size = 16,
}: {
  /** "button" carries a label; "icon" is the bare eye, for the control bar. */
  variant?: "button" | "icon";
  size?: number;
}) {
  const { spoilerFree, toggleSpoilerFree } = useSpoiler();
  const { t } = useLanguage();

  const title = `${spoilerFree ? t.spoiler.on : t.spoiler.off} — ${t.spoiler.hint}`;
  const Icon = spoilerFree ? EyeOffIcon : EyeIcon;

  if (variant === "icon") {
    return (
      <button
        type="button"
        className={`vp__btn${spoilerFree ? " vp__btn--active" : ""}`}
        onClick={toggleSpoilerFree}
        title={title}
        aria-pressed={spoilerFree}
      >
        <Icon size={size} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn spoiler-toggle${spoilerFree ? " is-active" : ""}`}
      onClick={toggleSpoilerFree}
      title={title}
      aria-pressed={spoilerFree}
    >
      <Icon size={size} />
      {t.spoiler.label}
    </button>
  );
}
