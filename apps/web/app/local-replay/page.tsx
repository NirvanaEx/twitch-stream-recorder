"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChatReplay } from "../components/ChatReplay";
import { FolderOpenIcon, MaximizeIcon } from "../components/icons";
import { formatPeriod } from "../lib/media";
import { useVideoShortcuts } from "../lib/use-video-shortcuts";
import { useLanguage } from "../providers";

type EmoteEntry = {
  id: string;
  name: string;
  url: string;
  animated: boolean;
};

type EmotePayload = {
  provider: string;
  fetchedAt: string;
  emotes: EmoteEntry[];
};

type ChatMessage = {
  id: string;
  authorLogin: string;
  authorDisplayName: string | null;
  authorColor: string | null;
  textRaw: string;
  relativeTimeSec: number;
  messageTimestamp: string;
  isDeleted: boolean;
};

type Bundle = {
  version: number;
  kind: string;
  meta: {
    id: string;
    title: string | null;
    categoryName: string | null;
    channelLogin: string;
    channelDisplayName: string;
    startedAt: string | null;
    endedAt: string | null;
  };
  messages: ChatMessage[];
  emotes: EmotePayload | null;
};

export default function LocalReplayPage() {
  const { t } = useLanguage();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Create / revoke the blob URL for the picked video file.
  // Must live in an effect (not useMemo), otherwise React Strict Mode's
  // double-invocation revokes the URL immediately and <video> fails to load.
  useEffect(() => {
    if (!videoFile) {
      setVideoUrl(null);
      return undefined;
    }

    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  useVideoShortcuts(videoElement);

  async function handleBundleFile(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Bundle;
      if (parsed.kind !== "tsr-archive-bundle") {
        setError(t.localReplay.invalidBundle);
        return;
      }
      setBundle(parsed);
      setError(null);
    } catch {
      setError(t.localReplay.invalidBundle);
    }
  }

  const staticChatData = useMemo(() => {
    if (!bundle) return undefined;
    return { messages: bundle.messages, emotes: bundle.emotes };
  }, [bundle]);

  const ready = videoUrl && bundle;

  if (theaterMode && ready) {
    return (
      <div className="theater-frame">
        <div className="theater-video-wrap">
          <div className="theater-bar">
            <button
              type="button"
              className="icon-btn"
              title={t.replay.backToArchives}
              onClick={() => setTheaterMode(false)}
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                color: "#fff",
                borderColor: "transparent",
              }}
            >
              ✕
            </button>
            <div className="theater-title">
              {bundle.meta.title ?? bundle.meta.channelDisplayName}
            </div>
          </div>
          <video
            ref={setVideoElement}
            controls
            autoPlay
            preload="metadata"
            src={videoUrl}
          />
        </div>
        <aside className="theater-chat">
          <ChatReplay staticData={staticChatData} videoElement={videoElement} isLive={false} />
        </aside>
      </div>
    );
  }

  return (
    <main className={ready ? "page-shell page-shell--wide" : "page-shell"}>
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.localReplay.title}</h2>
          <p className="page-copy">{t.localReplay.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}

      {!ready ? (
        <section className="panel">
          <div className="panel-body">
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
              <FilePicker
                label={t.localReplay.pickVideo}
                hint={t.localReplay.pickVideoHint}
                accept="video/*"
                file={videoFile}
                onPick={(file) => setVideoFile(file)}
              />
              <FilePicker
                label={t.localReplay.pickBundle}
                hint={t.localReplay.pickBundleHint}
                accept=".json,application/json"
                file={bundle ? new File([], `${bundle.meta.channelLogin}.tsr.json`) : null}
                onPick={(file) => void handleBundleFile(file)}
              />
            </div>

            <div
              className="hint-line"
              style={{
                marginTop: 16,
                color: "var(--text-dim)",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              {t.localReplay.help}{" "}
              <Link href="/archives" style={{ color: "var(--accent)" }}>
                {t.localReplay.openArchives}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="panel">
            <div className="panel-head">
              <h3 className="section-title">{bundle.meta.channelDisplayName}</h3>
              <div className="action-row">
                <button
                  type="button"
                  className="icon-btn"
                  title={t.replay.theaterMode}
                  onClick={() => setTheaterMode(true)}
                >
                  <MaximizeIcon />
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setVideoFile(null);
                    setBundle(null);
                  }}
                >
                  {t.localReplay.changeFiles}
                </button>
              </div>
            </div>
          </section>

          <section className="replay-grid with-chat">
            <div className="panel">
              <div className="panel-body">
                <video
                  ref={setVideoElement}
                  className="replay-video"
                  controls
                  preload="metadata"
                  src={videoUrl}
                />
                <div className="replay-meta" style={{ marginTop: 12 }}>
                  <span>
                    {t.common.title}: <strong>{bundle.meta.title ?? "—"}</strong>
                  </span>
                  <span>
                    {t.common.channel}: <strong>@{bundle.meta.channelLogin}</strong>
                  </span>
                  {bundle.meta.startedAt ? (
                    <span>
                      {t.archives.recordedAt}:
                      <strong>{new Date(bundle.meta.startedAt).toLocaleString()}</strong>
                    </span>
                  ) : null}
                  <span>
                    {t.common.duration}:
                    <strong>{formatPeriod(bundle.meta.startedAt, bundle.meta.endedAt)}</strong>
                  </span>
                </div>
              </div>
            </div>

            <aside className="panel chat-panel">
              <ChatReplay
                staticData={staticChatData}
                videoElement={videoElement}
                isLive={false}
              />
            </aside>
          </section>
        </>
      )}
    </main>
  );
}

function FilePicker({
  label,
  hint,
  accept,
  file,
  onPick,
}: {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      style={{
        border: "1px dashed var(--border-strong)",
        borderRadius: "var(--radius)",
        padding: 20,
        textAlign: "center",
        cursor: "pointer",
      }}
      onClick={() => inputRef.current?.click()}
    >
      <FolderOpenIcon size={28} />
      <div style={{ fontWeight: 600, marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{hint}</div>
      {file ? (
        <div
          style={{
            fontSize: 12,
            color: "var(--accent)",
            marginTop: 10,
            wordBreak: "break-all",
          }}
        >
          {file.name}
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
        }}
      />
    </div>
  );
}
