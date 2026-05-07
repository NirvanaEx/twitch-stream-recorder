"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChatReplay } from "../components/ChatReplay";
import { VideoPlayer, type PlayerMode } from "../components/VideoPlayer";
import { FolderOpenIcon } from "../components/icons";
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

const CHAT_PREF_KEY = "tsr-replay-chat-visible";

function readStoredChatPref(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(CHAT_PREF_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    // Ignore
  }
  return true;
}

export default function LocalReplayPage() {
  const { t } = useLanguage();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<PlayerMode>("normal");
  const [chatVisible, setChatVisible] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Read stored chat-visibility preference once.
  useEffect(() => {
    setChatVisible(readStoredChatPref());
  }, []);

  // Persist chat-visibility on every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_PREF_KEY, chatVisible ? "1" : "0");
    } catch {
      // Ignore.
    }
  }, [chatVisible]);

  // Lock body scrolling while the theater overlay is open.
  useEffect(() => {
    if (mode !== "theater") return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);

  // Create / revoke the blob URL for the picked video file.
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

  const ready = Boolean(videoUrl && bundle);
  const hasChat = chatVisible && ready;

  const stageClass = [
    "replay-stage",
    `replay-stage--${mode}`,
    hasChat ? "has-chat" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!ready) {
    return (
      <main className="page-shell">
        <section className="page-header">
          <div>
            <h2 className="page-title">{t.localReplay.title}</h2>
            <p className="page-copy">{t.localReplay.subtitle}</p>
          </div>
        </section>

        {error ? <div className="notice error">{error}</div> : null}

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
      </main>
    );
  }

  const playerTitle = bundle!.meta.title ?? bundle!.meta.channelDisplayName;

  return (
    <main className={mode === "theater" ? "replay-page-host" : "page-shell page-shell--wide"}>
      <div className={stageClass}>
        <header className="replay-stage__header page-header">
          <div>
            <h2 className="page-title">{playerTitle}</h2>
            <p className="page-copy">@{bundle!.meta.channelLogin}</p>
          </div>
          <div className="action-row">
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
        </header>

        {error ? <div className="notice error">{error}</div> : null}

        <div className="replay-stage__player">
          <VideoPlayer
            src={videoUrl!}
            mode={mode}
            onModeChange={setMode}
            chatVisible={chatVisible}
            showChatButton
            onChatToggle={() => setChatVisible((value) => !value)}
            onVideoElement={setVideoElement}
            isLive={false}
            autoPlay={false}
            title={mode !== "normal" ? playerTitle : undefined}
          />
        </div>

        {hasChat ? (
          <aside className="replay-stage__chat">
            <ChatReplay
              staticData={staticChatData}
              videoElement={videoElement}
              isLive={false}
            />
          </aside>
        ) : null}
      </div>
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
