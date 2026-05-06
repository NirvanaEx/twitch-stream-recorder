"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet } from "../../../lib/api";
import { buildMediaUrl } from "../../../lib/media";
import { useLanguage } from "../../../providers";
import { useVideoShortcuts } from "../../../lib/use-video-shortcuts";
import { ChatReplay } from "../../../components/ChatReplay";
import { ChevronLeftIcon, MessageIcon } from "../../../components/icons";

type ArchiveDetailResponse = {
  item: {
    id: string;
    title: string | null;
    channelDisplayName: string;
    status: string;
    chatAvailable: boolean;
  };
  videoUrl: string | null;
  videoReady: boolean;
  chatAvailable: boolean;
};

export default function TheaterPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ArchiveDetailResponse | null>(null);
  const [showChat, setShowChat] = useState(searchParams.get("chat") !== "0");
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await apiGet<ArchiveDetailResponse>(`archives/${params.id}`);
      setData(response);
    } catch {
      // ignore
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // browser will exit fullscreen; we also send user back via Link below
      }
      if (event.key.toLowerCase() === "c") {
        setShowChat((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useVideoShortcuts(videoElement);

  const videoSrc = useMemo(() => buildMediaUrl(data?.videoUrl), [data?.videoUrl]);

  return (
    <div className={showChat ? "theater-frame" : "theater-frame no-chat"}>
      <div className="theater-video-wrap">
        <div className="theater-bar">
          <Link
            className="icon-btn"
            href={`/archives/${params.id}?mode=${showChat ? "chat" : "video"}`}
            title={t.replay.backToArchives}
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              borderColor: "transparent",
            }}
          >
            <ChevronLeftIcon />
          </Link>
          <div className="theater-title">
            {data?.item.title ?? data?.item.channelDisplayName ?? "Replay"}
          </div>
          <div className="theater-actions">
            <button
              type="button"
              className={`icon-btn${showChat ? " is-loading" : ""}`}
              title={showChat ? t.replay.withoutChat : t.replay.withChat}
              onClick={() => setShowChat((value) => !value)}
              style={{
                background: showChat ? "var(--accent)" : "rgba(0,0,0,0.6)",
                color: showChat ? "#0b0d10" : "#fff",
                borderColor: "transparent",
              }}
            >
              <MessageIcon />
            </button>
          </div>
        </div>

        {data?.videoReady && videoSrc ? (
          <video
            ref={setVideoElement}
            controls
            autoPlay
            preload="metadata"
            src={videoSrc}
          />
        ) : (
          <div className="empty-state" style={{ color: "#fff" }}>
            {t.replay.videoPending}
          </div>
        )}
      </div>

      {showChat && data ? (
        <aside className="theater-chat">
          <ChatReplay
            archiveId={data.item.id}
            videoElement={videoElement}
            isLive={data.item.status === "recording"}
          />
        </aside>
      ) : null}
    </div>
  );
}
