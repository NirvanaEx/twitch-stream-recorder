"use client";

import { useState } from "react";
import { buildApiUrl } from "../lib/api";
import { formatFileSize, formatPeriod, formatSeconds, withAuthToken } from "../lib/media";
import { waveformHeights } from "../lib/waveform";
import { useLanguage } from "../providers";
import { IconButton, IconLink } from "./IconButton";
import { PlatformTag } from "./PlatformTag";
import { DownloadIcon, HardDriveIcon, PlayIcon, SendIcon, TrashIcon } from "./icons";

export type TelegramPart = {
  partIndex: number;
  partCount: number;
  url: string | null;
};

export type ArchiveItem = {
  id: string;
  channelLogin: string;
  channelDisplayName: string;
  channelProfileImageUrl: string | null;
  platform: "twitch" | "kick";
  title: string | null;
  categoryName: string | null;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  fileSizeBytes: string | null;
  audioSizeBytes: string | null;
  videoReady: boolean;
  videoUrl: string | null;
  videoSource: "local" | "telegram" | null;
  telegramStatus: string;
  telegramProgress: number | null;
  telegramError: string | null;
  telegramUploadedAt: string | null;
  telegramChatUrl: string | null;
  telegramParts: TelegramPart[];
  localFileDeletedAt: string | null;
  audioOnly: boolean;
  audioAvailable: boolean;
  thumbnailUrl: string | null;
  durationSec: number | null;
};

export function ArchiveCard({
  archive,
  busy,
  onUpload,
  onDelete,
  onDetails,
}: {
  archive: ArchiveItem;
  busy: boolean;
  onUpload: (id: string) => void;
  onDelete: (id: string) => void;
  onDetails: (archive: ArchiveItem) => void;
}) {
  const { t } = useLanguage();
  const isAudio = archive.audioOnly;
  const duration = archive.durationSec
    ? formatSeconds(archive.durationSec)
    : formatPeriod(archive.startedAt, archive.endedAt);
  const size = formatFileSize(isAudio ? archive.audioSizeBytes ?? archive.fileSizeBytes : archive.fileSizeBytes);

  // Covers are rendered on demand from the video now, so a 404 is a real
  // possibility (e.g. Telegram briefly unreachable) — fall back to the empty
  // cover instead of the browser's broken-image icon.
  const [coverFailed, setCoverFailed] = useState(false);
  const cover =
    !coverFailed && archive.thumbnailUrl
      ? withAuthToken(buildApiUrl(archive.thumbnailUrl.replace(/^\/api\//, "")))
      : null;

  function renderTelegram() {
    if (archive.telegramStatus === "uploaded") {
      return (
        <button
          type="button"
          className="btn"
          style={{ padding: "2px 8px", fontSize: 11 }}
          onClick={() => onDetails(archive)}
          title={t.archives.details}
        >
          {t.archives.telegramUploaded}
          {archive.telegramParts.length > 1 ? ` · ${archive.telegramParts.length}` : ""}
        </button>
      );
    }

    if (archive.telegramStatus === "uploading") {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <span
            style={{
              width: 44,
              height: 4,
              borderRadius: 2,
              background: "var(--border)",
              overflow: "hidden",
              display: "inline-block",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: `${archive.telegramProgress ?? 0}%`,
                background: "var(--accent)",
                transition: "width 0.5s ease",
              }}
            />
          </span>
          <strong>{archive.telegramProgress ?? 0}%</strong>
        </span>
      );
    }

    if (archive.telegramStatus === "pending") {
      return <span style={{ fontSize: 11 }}>{t.archives.telegramPending}</span>;
    }

    if (archive.telegramStatus === "error") {
      return (
        <button
          type="button"
          className="btn"
          style={{ padding: "2px 8px", fontSize: 11, color: "var(--danger)" }}
          onClick={() => onDetails(archive)}
          title={archive.telegramError ?? t.archives.details}
        >
          {t.archives.telegramError}
        </button>
      );
    }

    return <span style={{ fontSize: 11, color: "var(--text-faint)" }}>—</span>;
  }

  return (
    <article className={`archive-card${isAudio ? " audio" : ""}`}>
      <div className="archive-cover">
        {isAudio ? (
          <div className="archive-cover-audio">
            {archive.channelProfileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar" src={archive.channelProfileImageUrl} alt="" />
            ) : (
              <span className="glyph">🎧</span>
            )}
            <span className="bars" aria-hidden="true">
              {waveformHeights(archive.id, 28).map((height, index) => (
                <i key={index} style={{ height }} />
              ))}
            </span>
          </div>
        ) : cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" loading="lazy" onError={() => setCoverFailed(true)} />
        ) : (
          <div className="archive-cover-empty">{t.archives.noCover}</div>
        )}

        {archive.videoSource ? (
          <span
            className="archive-cover-source"
            title={archive.videoSource === "telegram" ? "Telegram" : t.replay.sourceLocal}
          >
            {archive.videoSource === "telegram" ? (
              <SendIcon size={11} />
            ) : (
              <HardDriveIcon size={11} />
            )}
          </span>
        ) : null}

        {duration ? <span className="archive-cover-badge">{duration}</span> : null}
      </div>

      <div className="archive-card-body">
        <span className="archive-card-title" title={archive.title ?? ""}>
          {archive.title || archive.channelDisplayName}
        </span>

        <span className="archive-card-meta">
          <span>
            <PlatformTag platform={archive.platform} />@{archive.channelLogin}
          </span>
          {archive.categoryName ? <span>{archive.categoryName}</span> : null}
        </span>

        <span className="archive-card-meta">
          <span>
            {archive.startedAt ? new Date(archive.startedAt).toLocaleString() : "—"}
          </span>
          <span>{size}</span>
          {!isAudio && archive.audioAvailable ? <span title={t.archives.hasAudioTrack}>🎧</span> : null}
        </span>

        <div className="archive-card-foot">
          {renderTelegram()}

          <div className="action-row">
            {archive.videoReady && archive.videoUrl ? (
              <>
                <IconLink href={`/admin/archives/${archive.id}`} title={t.common.watch}>
                  <PlayIcon />
                </IconLink>
                <a
                  className="icon-btn"
                  href={withAuthToken(buildApiUrl(`archives/${archive.id}/video?download=1`))}
                  title={t.localReplay.downloadVideo}
                  download
                >
                  <DownloadIcon />
                </a>
              </>
            ) : (
              <span style={{ color: "var(--text-faint)", fontSize: 11 }}>
                {archive.localFileDeletedAt
                  ? t.archives.localFileDeleted
                  : t.replay.videoPending}
              </span>
            )}

            {archive.status === "completed" &&
            archive.videoReady &&
            (archive.telegramStatus === "none" || archive.telegramStatus === "error") ? (
              <IconButton
                title={t.archives.uploadToTelegram}
                loading={busy}
                disabled={busy}
                onClick={() => onUpload(archive.id)}
              >
                <SendIcon />
              </IconButton>
            ) : null}

            <IconButton
              title={t.common.delete}
              className="danger"
              loading={busy}
              disabled={busy}
              onClick={() => onDelete(archive.id)}
            >
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </article>
  );
}
