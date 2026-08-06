"use client";

import type { CSSProperties } from "react";

/**
 * Loading placeholders.
 *
 * Every page here fetches its data from the browser, so between "the JS ran"
 * and "the answer arrived" there is a gap the viewer used to spend looking at
 * the word "Загрузка…" on an otherwise blank page — which reads as a hang, not
 * as work in progress. These draw the shape of what is coming instead, at the
 * real size, so the layout does not jump when the data lands.
 *
 * They are deliberately dumb: a grey block that shimmers. Nothing here fetches
 * or measures anything.
 */

type BlockProps = {
  /** Any CSS width; a percentage makes rows of text look uneven and natural. */
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ width, height, radius, className, style }: BlockProps) {
  return (
    <span
      className={`skeleton${className ? ` ${className}` : ""}`}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden
    />
  );
}

/** A line of text. Several of these stacked read as a paragraph. */
export function SkeletonText({ width = "100%", height = "12px" }: BlockProps) {
  return <Skeleton width={width} height={height} radius="4px" className="skeleton--text" />;
}

/** The public home page's card grid, at the same geometry as the real cards. */
export function StreamCardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <section className="card-grid" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="stream-card stream-card--skeleton" key={index}>
          <div className="stream-card-thumb">
            <Skeleton width="100%" height="100%" radius="0" />
          </div>
          <div className="stream-card-body">
            <div className="stream-card-channel">
              <Skeleton width="22px" height="22px" radius="50%" />
              <SkeletonText width="40%" />
            </div>
            <SkeletonText width="92%" height="14px" />
            <SkeletonText width="58%" height="14px" />
            <SkeletonText width="45%" />
          </div>
        </div>
      ))}
    </section>
  );
}

/** The watch page: header, player stage, and the chat column beside it. */
export function WatchSkeleton({ withChat = true }: { withChat?: boolean }) {
  return (
    <div className={`replay-stage replay-stage--normal replay-stage--fit${withChat ? " has-chat" : ""}`} aria-busy="true">
      <div className="replay-stage__main">
        <header className="replay-stage__header">
          <SkeletonText width="120px" />
          <div className="watch-channel-row" style={{ marginBottom: 8, marginTop: 12 }}>
            <Skeleton width="34px" height="34px" radius="50%" />
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <SkeletonText width="260px" height="16px" />
              <SkeletonText width="180px" />
            </div>
          </div>
          <div className="replay-meta">
            <SkeletonText width="150px" />
            <SkeletonText width="90px" />
            <SkeletonText width="110px" />
          </div>
        </header>

        <div className="replay-stage__player">
          <Skeleton width="100%" height="100%" radius="var(--radius-lg)" className="skeleton--stage" />
        </div>
      </div>

      {withChat ? (
        <aside className="replay-stage__chat">
          <ChatSkeleton />
        </aside>
      ) : null}
    </div>
  );
}

/** Chat column: a bar, then rows of nick + message at varying widths. */
export function ChatSkeleton({ rows = 14 }: { rows?: number }) {
  return (
    <div className="chat-replay" aria-busy="true">
      <div className="chat-bar">
        <SkeletonText width="60px" />
      </div>
      <div className="chat-list-wrap">
        <div className="chat-list">
          {Array.from({ length: rows }, (_, index) => (
            <div className="chat-message chat-message--skeleton" key={index}>
              <SkeletonText width={`${34 + ((index * 17) % 40)}px`} />
              <SkeletonText width={`${45 + ((index * 29) % 45)}%`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Rows of a table whose columns are not worth spelling out one by one. */
export function TableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="skeleton-table" aria-busy="true">
      {Array.from({ length: rows }, (_, row) => (
        <div className="skeleton-table__row" key={row}>
          {Array.from({ length: columns }, (_, column) => (
            <SkeletonText
              key={column}
              // The first column is the name of the thing and reads longest.
              width={column === 0 ? "70%" : `${35 + ((row + column) * 13) % 40}%`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** A row of stat panels, as on the admin dashboard. */
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-stats" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="panel skeleton-stats__item" key={index}>
          <SkeletonText width="55%" />
          <SkeletonText width="35%" height="22px" />
        </div>
      ))}
    </div>
  );
}
