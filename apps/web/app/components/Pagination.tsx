"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  // Determine page numbers to display: keep at most 5 visible
  const pages: number[] = [];
  const window = 2;
  for (let p = Math.max(1, page - window); p <= Math.min(totalPages, page + window); p++) {
    pages.push(p);
  }

  return (
    <div className="pagination">
      <span className="pagination-info">
        {start}–{end} / {total}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon size={14} />
        </button>
        {pages[0] !== 1 ? (
          <>
            <button type="button" className="page-num" onClick={() => onPageChange(1)}>
              1
            </button>
            {pages[0] > 2 ? <span style={{ padding: "0 4px" }}>…</span> : null}
          </>
        ) : null}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={p === page ? "page-num active" : "page-num"}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        {pages[pages.length - 1] !== totalPages ? (
          <>
            {pages[pages.length - 1] < totalPages - 1 ? (
              <span style={{ padding: "0 4px" }}>…</span>
            ) : null}
            <button
              type="button"
              className="page-num"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon size={14} />
        </button>
      </div>
    </div>
  );
}
