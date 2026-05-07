"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { use } from "react";
import { apiGet, buildApiUrl } from "../../lib/api";
import { buildMediaUrl, formatPeriod } from "../../lib/media";
import { useLanguage } from "../../providers";
import { VideoPlayer, type PlayerMode } from "../../components/VideoPlayer";

type PublicStreamDetail = {
  id: string;
  title: string | null;
  categoryName: string | null;
  channel: {
    login: string;
    displayName: string;
    profileImageUrl: string | null;
  };
  previewImageUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
  fileSizeBytes: string | null;
  videoUrl: string;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function PublicWatchPage({
  params,
}: {
  // Next.js 15 App Router: params is a Promise.
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [data, setData] = useState<PublicStreamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PlayerMode>("normal");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await apiGet<{ item: PublicStreamDetail }>(
          `public/streams/${id}`,
        );
        if (!cancelled) {
          setData(response.item);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t.publicSite.notFound);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, t.publicSite.notFound]);

  if (error) {
    return (
      <div className="public-shell">
        <Link href="/" className="auth-back" style={{ display: "inline-block", marginBottom: 12 }}>
          {t.publicSite.backToList}
        </Link>
        <div className="empty-state">
          {t.publicSite.notFound}
          <div style={{ marginTop: 8, color: "var(--text-faint)", fontSize: 13 }}>
            {t.publicSite.notFoundHint}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="public-shell">
        <div className="empty-state">{t.common.loading}</div>
      </div>
    );
  }

  const videoSrc = buildMediaUrl(data.videoUrl) || buildApiUrl(`public/streams/${id}/video`);
  const posterSrc = data.previewImageUrl ?? undefined;

  return (
    <div className={mode === "normal" ? "public-shell" : "public-shell theater"}>
      <Link href="/" className="auth-back" style={{ display: "inline-block", marginBottom: 12 }}>
        {t.publicSite.backToList}
      </Link>

      <div className="watch-layout">
        <div className="watch-player">
          <VideoPlayer
            src={videoSrc}
            poster={posterSrc}
            mode={mode}
            onModeChange={setMode}
            showChatButton={false}
            title={data.title ?? data.channel.displayName}
          />
        </div>

        <aside className="watch-meta">
          <h2 className="page-title" style={{ margin: 0 }}>
            {data.title || data.channel.displayName}
          </h2>
          <div className="watch-channel-row">
            {data.channel.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.channel.profileImageUrl}
                alt={data.channel.displayName}
                className="stream-card-avatar"
              />
            ) : (
              <span className="stream-card-avatar fallback">
                {data.channel.displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <strong>{data.channel.displayName}</strong>
              <div style={{ color: "var(--text-faint)", fontSize: 12 }}>
                @{data.channel.login}
              </div>
            </div>
          </div>

          <dl className="meta-list">
            {data.categoryName ? (
              <>
                <dt>{t.archives.category}</dt>
                <dd>{data.categoryName}</dd>
              </>
            ) : null}
            <dt>{t.archives.recordedAt}</dt>
            <dd>{formatDate(data.startedAt)}</dd>
            {data.endedAt ? (
              <>
                <dt>{t.archives.endedAt}</dt>
                <dd>{formatDate(data.endedAt)}</dd>
              </>
            ) : null}
            {data.startedAt && data.endedAt ? (
              <>
                <dt>{t.publicSite.durationLabel}</dt>
                <dd>{formatPeriod(data.startedAt, data.endedAt)}</dd>
              </>
            ) : null}
          </dl>
        </aside>
      </div>
    </div>
  );
}
