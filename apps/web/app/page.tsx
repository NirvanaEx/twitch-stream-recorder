"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pagination } from "./components/Pagination";
import { apiGet } from "./lib/api";
import { formatPeriod } from "./lib/media";
import { useAuth } from "./lib/auth-context";
import { useLanguage } from "./providers";

type PublicStreamCard = {
  id: string;
  title: string | null;
  channel: {
    login: string;
    displayName: string;
    profileImageUrl: string | null;
  };
  previewImageUrl: string | null;
  // Frame from the recording; Twitch's own preview 404s once the broadcast
  // ends, which is exactly when an archive gets watched.
  thumbnailUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
  fileSizeBytes: string | null;
};

type PublicListResponse = {
  items: PublicStreamCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const PAGE_SIZE = 12;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function PublicHomePage() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PublicListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input → reset to page 1 when query stabilises.
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      setCommittedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));
      if (committedSearch) params.set("search", committedSearch);
      const response = await apiGet<PublicListResponse>(
        `public/streams?${params.toString()}`,
      );
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    } finally {
      setLoading(false);
    }
  }, [page, committedSearch, t.errors.requestFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const empty = !loading && items.length === 0;

  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="public-brand">
          <span className="brand-eyebrow">TSR</span>
          <h1 className="brand-title">{t.publicSite.brand}</h1>
          <p className="public-tagline">{t.publicSite.tagline}</p>
        </div>

        <div className="public-header-actions">
          {isAuthenticated && user ? (
            <Link className="btn primary" href="/admin">
              {t.publicSite.enterAdmin} · {user.username}
            </Link>
          ) : (
            <Link className="btn" href="/login">
              {t.auth.login}
            </Link>
          )}
        </div>
      </header>

      <section className="public-search-row">
        <input
          type="search"
          placeholder={t.publicSite.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="public-search-input"
        />
      </section>

      {error ? <div className="notice error">{error}</div> : null}

      {loading && !data ? (
        <div className="empty-state">{t.common.loading}</div>
      ) : empty ? (
        <div className="empty-state">
          {committedSearch ? t.publicSite.emptyForQuery : t.publicSite.empty}
          {!committedSearch ? (
            <div style={{ marginTop: 8, color: "var(--text-faint)", fontSize: 13 }}>
              {t.publicSite.emptyHint}
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <section className="card-grid">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/watch/${item.id}`}
                className="stream-card"
              >
                <div className="stream-card-thumb">
                  {item.thumbnailUrl ?? item.previewImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(item.thumbnailUrl ?? item.previewImageUrl) as string}
                      alt={item.title ?? item.channel.displayName}
                      loading="lazy"
                    />
                  ) : (
                    <div className="stream-card-thumb-fallback">
                      {item.channel.displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  {item.startedAt && item.endedAt ? (
                    <span className="stream-card-duration">
                      {formatPeriod(item.startedAt, item.endedAt)}
                    </span>
                  ) : null}
                </div>
                <div className="stream-card-body">
                  <div className="stream-card-channel">
                    {item.channel.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.channel.profileImageUrl}
                        alt={item.channel.displayName}
                        className="stream-card-avatar"
                      />
                    ) : (
                      <span className="stream-card-avatar fallback">
                        {item.channel.displayName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span>{item.channel.displayName}</span>
                  </div>
                  <h3 className="stream-card-title">
                    {item.title || item.channel.displayName}
                  </h3>
                  <div className="stream-card-meta">{formatDate(item.startedAt)}</div>
                </div>
              </Link>
            ))}
          </section>

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={(next) => setPage(next)}
          />
        </>
      )}
    </div>
  );
}
