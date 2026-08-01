"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { useRealtimeRefresh } from "../../lib/use-realtime-refresh";
import { useLanguage } from "../../providers";
import { ArchiveCard, type ArchiveItem } from "../../components/ArchiveCard";
import { Pagination } from "../../components/Pagination";
import { PageTabs } from "../../components/PageTabs";

type ArchivesResponse = {
  items: ArchiveItem[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 12;

// Video recordings and audio-only captures are fetched (and paginated)
// separately: they are different artefacts with different lifecycles, and
// mixing them into one list made audio tracks impossible to find.
type Block = { items: ArchiveItem[]; total: number; page: number };

const EMPTY_BLOCK: Block = { items: [], total: 0, page: 1 };

type TabId = "video" | "audio";

export default function ArchivesPage() {
  const { t } = useLanguage();
  const [video, setVideo] = useState<Block>(EMPTY_BLOCK);
  const [audio, setAudio] = useState<Block>(EMPTY_BLOCK);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyArchiveId, setBusyArchiveId] = useState<string | null>(null);
  const [detailsArchive, setDetailsArchive] = useState<ArchiveItem | null>(null);
  const [tab, setTab] = useState<TabId>("video");

  const loadArchives = useCallback(async () => {
    try {
      const [videoResponse, audioResponse] = await Promise.all([
        apiGet<ArchivesResponse>(
          `archives?kind=video&page=${video.page}&pageSize=${PAGE_SIZE}`,
        ),
        apiGet<ArchivesResponse>(
          `archives?kind=audio&page=${audio.page}&pageSize=${PAGE_SIZE}`,
        ),
      ]);

      setVideo((current) => ({ ...current, items: videoResponse.items, total: videoResponse.total }));
      setAudio((current) => ({ ...current, items: audioResponse.items, total: audioResponse.total }));
      setError(null);
    } catch {
      setError(t.errors.apiUnavailable);
    }
  }, [video.page, audio.page, t.errors.apiUnavailable]);

  useEffect(() => {
    void loadArchives();
  }, [loadArchives]);

  useRealtimeRefresh(loadArchives);

  // If the last item of the last page was deleted, step back one page.
  useEffect(() => {
    setVideo((current) => {
      const totalPages = Math.max(1, Math.ceil(current.total / PAGE_SIZE));
      return current.page > totalPages ? { ...current, page: totalPages } : current;
    });
    setAudio((current) => {
      const totalPages = Math.max(1, Math.ceil(current.total / PAGE_SIZE));
      return current.page > totalPages ? { ...current, page: totalPages } : current;
    });
  }, [video.total, audio.total]);

  async function handleTelegramUpload(archiveId: string) {
    setBusyArchiveId(archiveId);
    setSuccess(null);
    setError(null);

    try {
      await apiSend(`telegram/upload/${archiveId}`, "POST");
      await loadArchives();
      setSuccess(t.archives.telegramQueued);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyArchiveId(null);
    }
  }

  async function handleDelete(archiveId: string) {
    if (!window.confirm(t.archives.deleteConfirm)) return;

    setBusyArchiveId(archiveId);
    setSuccess(null);
    setError(null);

    try {
      await apiSend(`archives/${archiveId}`, "DELETE");
      await loadArchives();
      setSuccess(t.archives.deleted);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.errors.requestFailed);
    } finally {
      setBusyArchiveId(null);
    }
  }

  function renderBlock(
    title: string,
    hint: string,
    block: Block,
    onPageChange: (page: number) => void,
    emptyLabel: string,
    audioLayout = false,
  ) {
    return (
      <>
        <div className="filter-row">
          <span className="filter-note">{hint}</span>
          <span className="filter-spacer" />
          <span className="filter-note">
            {t.storage.foundCount.replace("{count}", String(block.total))}
          </span>
        </div>

        {block.items.length === 0 ? (
          <div className="empty-state">{emptyLabel}</div>
        ) : (
          <>
            <div className={`archive-grid${audioLayout ? " audio" : ""}`}>
              {block.items.map((archive) => (
                <ArchiveCard
                  key={archive.id}
                  archive={archive}
                  busy={busyArchiveId === archive.id}
                  onUpload={(id) => void handleTelegramUpload(id)}
                  onDelete={(id) => void handleDelete(id)}
                  onDetails={setDetailsArchive}
                />
              ))}
            </div>

            <div className="panel-foot">
              <Pagination
                page={block.page}
                pageSize={PAGE_SIZE}
                total={block.total}
                onPageChange={onPageChange}
              />
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.archives.title}</h2>
          <p className="page-copy">{t.archives.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {success ? <div className="notice success">{success}</div> : null}

      {/* Video and audio are different artefacts with different lifecycles —
          a stream to watch and a track to overlay on a VOD. Stacked, the audio
          list lived below a full page of covers and was never seen. */}
      <section className="panel">
        <PageTabs
          tabs={[
            { id: "video" as TabId, label: t.archives.streamsBlock, count: video.total },
            { id: "audio" as TabId, label: t.archives.audioBlock, count: audio.total },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === "video"
          ? renderBlock(
              t.archives.streamsBlock,
              t.archives.streamsBlockHint,
              video,
              (page) => setVideo((current) => ({ ...current, page })),
              t.archives.empty,
            )
          : renderBlock(
              t.archives.audioBlock,
              t.archives.audioBlockHint,
              audio,
              (page) => setAudio((current) => ({ ...current, page })),
              t.archives.audioEmpty,
              true,
            )}
      </section>

      {detailsArchive ? (
        <div className="modal-overlay" onClick={() => setDetailsArchive(null)}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <h3 className="section-title">
                {t.archives.detailsTitle}
              </h3>
              <button type="button" className="btn" onClick={() => setDetailsArchive(null)}>
                ✕
              </button>
            </div>

            <div className="modal-row">
              <span className="modal-row-label">{t.common.title}</span>
              <span>{detailsArchive.title || detailsArchive.channelDisplayName}</span>
            </div>

            <div className="modal-row">
              <span className="modal-row-label">{t.archives.detailsStatus}</span>
              <span>
                {detailsArchive.telegramStatus === "uploaded"
                  ? t.archives.telegramUploaded
                  : detailsArchive.telegramStatus === "error"
                    ? `${t.archives.telegramError}: ${detailsArchive.telegramError ?? "—"}`
                    : detailsArchive.telegramStatus}
              </span>
            </div>

            {detailsArchive.telegramUploadedAt ? (
              <div className="modal-row">
                <span className="modal-row-label">{t.archives.detailsUploadedAt}</span>
                <span>{new Date(detailsArchive.telegramUploadedAt).toLocaleString()}</span>
              </div>
            ) : null}

            <div className="modal-row">
              <span className="modal-row-label">{t.archives.detailsLocalCopy}</span>
              <span>
                {detailsArchive.localFileDeletedAt
                  ? t.archives.detailsLocalCopyDeleted
                  : t.archives.detailsLocalCopyKept}
              </span>
            </div>

            {detailsArchive.telegramParts.length > 0 ? (
              <div className="modal-row">
                <span className="modal-row-label">{t.archives.detailsParts}</span>
                <span className="modal-part-links">
                  {detailsArchive.telegramParts.map((part) =>
                    part.url ? (
                      <a key={part.partIndex} href={part.url} target="_blank" rel="noreferrer">
                        {t.archives.telegramPart} {part.partIndex}/{part.partCount} ↗
                      </a>
                    ) : (
                      <span key={part.partIndex}>
                        {t.archives.telegramPart} {part.partIndex}/{part.partCount}
                      </span>
                    ),
                  )}
                </span>
              </div>
            ) : null}

            {detailsArchive.telegramChatUrl ? (
              <div className="modal-row">
                <span className="modal-row-label">{t.archives.detailsChatBundle}</span>
                <a href={detailsArchive.telegramChatUrl} target="_blank" rel="noreferrer">
                  {t.archives.openInTelegram} ↗
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
