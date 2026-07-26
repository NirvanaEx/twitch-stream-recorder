"use client";

import { useState } from "react";
import { useLanguage } from "../providers";

export type TelegramStreamStat = {
  id: number;
  archiveId: string;
  kind: "video" | "audio";
  partIndex: number | null;
  mbpsFromTelegram: number;
  mbpsToClient: number;
  servedMb: number;
  downloadedMb: number;
  wastedMb: number;
  elapsedSec: number;
  rangeFrom: number;
  rangeTo: number;
};

export type TelegramStreamStats = {
  active: boolean;
  mbpsFromTelegram?: number;
  mbpsToClient?: number;
  servedMb?: number;
  streams?: TelegramStreamStat[];
  global?: {
    mbpsFromTelegram: number;
    mbpsWasted: number;
    mbpsToClient: number;
    activeStreams: number;
  };
};

const CHIP_STYLE: React.CSSProperties = {
  marginLeft: 6,
  padding: "1px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  background: "rgba(124, 77, 255, 0.16)",
  color: "var(--accent)",
  whiteSpace: "nowrap",
  cursor: "default",
};

const PANEL_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  zIndex: 40,
  minWidth: 280,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--text)",
  whiteSpace: "nowrap",
  cursor: "default",
};

/**
 * Live Telegram throughput next to the "Source" label: the chip shows the sum
 * for this recording, hovering breaks it down per open stream and adds the
 * server-wide total. Several streams run whenever the viewer seeks, and the
 * whole point of the breakdown is that they share ONE MTProto connection.
 */
export function TelegramSpeedChip({ stats }: { stats: TelegramStreamStats | null }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  if (!stats?.active) {
    return null;
  }

  const streams = stats.streams ?? [];
  const global = stats.global;

  const streamLabel = (stream: TelegramStreamStat) =>
    stream.kind === "audio"
      ? t.replay.speedAudio
      : `${t.replay.speedPart} ${stream.partIndex ?? 1}`;

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        style={CHIP_STYLE}
        tabIndex={0}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        ▼ {(stats.mbpsFromTelegram ?? 0).toFixed(2)} МБ/с
      </span>

      {open ? (
        <span style={PANEL_STYLE}>
          <span
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: 6,
              color: "var(--text-muted)",
            }}
          >
            {t.replay.speedTitle}
          </span>

          <span style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>
            {t.replay.speedArchive}: ▼ {(stats.mbpsFromTelegram ?? 0).toFixed(2)} МБ/с
            <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>
              {" "}
              · {t.replay.speedToClient} {(stats.mbpsToClient ?? 0).toFixed(2)} МБ/с
            </span>
          </span>

          {streams.map((stream) => (
            <span
              key={stream.id}
              style={{
                display: "block",
                paddingLeft: 8,
                color: "var(--text-muted)",
                lineHeight: 1.7,
              }}
            >
              {streamLabel(stream)} · ▼ {stream.mbpsFromTelegram.toFixed(2)} МБ/с ·{" "}
              {stream.servedMb} МБ · {Math.round(stream.rangeFrom * 100)}–
              {Math.round(stream.rangeTo * 100)}%
              {stream.wastedMb > 0 ? (
                <span style={{ color: "var(--warning, #d08b3a)" }}>
                  {" "}
                  · {t.replay.speedWasted} {stream.wastedMb} МБ
                </span>
              ) : null}
            </span>
          ))}

          {global ? (
            <span
              style={{
                display: "block",
                marginTop: 6,
                paddingTop: 6,
                borderTop: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              {t.replay.speedServer}: ▼ {global.mbpsFromTelegram.toFixed(2)} МБ/с ·{" "}
              {global.activeStreams}{" "}
              {global.activeStreams === 1
                ? t.replay.speedStreamsOne
                : t.replay.speedStreamsMany}
              {global.mbpsWasted > 0 ? (
                <span style={{ color: "var(--warning, #d08b3a)" }}>
                  {" "}
                  · {t.replay.speedWasted} {global.mbpsWasted.toFixed(2)} МБ/с
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
