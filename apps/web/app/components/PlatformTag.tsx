"use client";

/**
 * Tiny origin marker next to a channel or archive. Channel names look alike
 * across the platforms and can even be identical strings owned by different
 * people, so the platform has to be visible wherever a login is shown.
 */

const STYLES: Record<string, { label: string; color: string; background: string; host: string }> = {
  twitch: {
    label: "TW",
    color: "#c4b5fd",
    background: "rgba(145, 70, 255, 0.18)",
    host: "twitch.tv",
  },
  kick: {
    label: "KICK",
    color: "#86efac",
    background: "rgba(83, 252, 24, 0.16)",
    host: "kick.com",
  },
  vkplay: {
    label: "VK",
    color: "#93c5fd",
    background: "rgba(37, 99, 235, 0.18)",
    host: "live.vkvideo.ru",
  },
};

export function PlatformTag({ platform }: { platform: string | null | undefined }) {
  const style = STYLES[platform ?? "twitch"] ?? STYLES.twitch;

  return (
    <span
      title={style.host}
      style={{
        display: "inline-block",
        marginRight: 5,
        padding: "0 5px",
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.04em",
        lineHeight: "15px",
        verticalAlign: "1px",
        color: style.color,
        background: style.background,
      }}
    >
      {style.label}
    </span>
  );
}
