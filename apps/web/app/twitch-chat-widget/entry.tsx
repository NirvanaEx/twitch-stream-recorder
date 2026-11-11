import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ChatReplay } from "../components/ChatReplay";
import { loadReplayChat } from "../lib/replay-loader";
import type { ChatResponse } from "../lib/chat-render";
import { WidgetContext } from "./context";
import { apiGet, configureApi, type ReadJson } from "./api";
import { loadCachedReplay } from "./replay-cache";
import { mergeChats, onVodTimeline, sessionShift, shiftMetadata, type Session, type ReplayPage } from "./timeline";

declare const __CHAT_CSS__: string;
type Options = {
  server: string; request: ReadJson; sessions: Session[]; vodStartMs: number;
  video: HTMLVideoElement | null; offset: number; onOffsetChange: (offset: number) => void;
  spoilerFree: boolean; locale?: "ru" | "en";
};

function Widget({ options }: { options: Options }) {
  const [data, setData] = useState<ChatResponse | null>(null);
  const [failure, setFailure] = useState(false);
  const [retry, setRetry] = useState(0);
  const [activeSession, setActiveSession] = useState("");
  const key = sessionKey(options);
  const [shifts, setShifts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    setData(null); setFailure(false);
    if (!options.sessions.length) return;
    void (async () => {
      const nextShifts: Record<string, number> = {};
      const chats = [];
      // Bound request concurrency and retain the site's complete pagination.
      for (const session of options.sessions) {
        const endpoint = `public/streams/${session.id}`;
        const chat = await loadCachedReplay(
          `${new URL(options.server).origin}:${session.id}:${session.recordingEndedAt ?? "active"}:v1`,
          Boolean(session.recordingEndedAt), async () => {
            const readSession = <T,>(path: string) => options.request(new URL(options.server).origin + "/api/" + path) as Promise<T>;
            // The in-flight request belongs to the cache, so a disappearing
            // host cannot cancel a load another mounted consumer is awaiting.
            try {
              const result = await loadReplayChat(endpoint + "/chat", () => false, (path) => readSession<ReplayPage>(path));
              if (result) return result;
            } catch { /* Legacy replay also works without local video. */ }
            return readSession<ChatResponse>(endpoint + "/chat-replay");
          });
        if (cancelled || !chat) return;
        const shift = sessionShift(session, options.vodStartMs, chat);
        nextShifts[session.id] = shift;
        chats.push(onVodTimeline(chat, shift, options.vodStartMs));
      }
      if (!cancelled) { setShifts(nextShifts); setData(mergeChats(chats)); }
    })().catch(() => { if (!cancelled) setFailure(true); });
    return () => { cancelled = true; };
  }, [key, retry]);

  useEffect(() => {
    const video = options.video;
    const update = () => {
      const time = (video?.currentTime ?? 0) + options.offset;
      const sessions = options.sessions.slice().sort((a, b) => (shifts[a.id] ?? 0) - (shifts[b.id] ?? 0));
      const session = sessions.filter((s) => (shifts[s.id] ?? 0) <= time).at(-1) ?? sessions[0];
      setActiveSession(session?.id ?? "");
    };
    update();
    video?.addEventListener("timeupdate", update);
    video?.addEventListener("seeked", update);
    return () => { video?.removeEventListener("timeupdate", update); video?.removeEventListener("seeked", update); };
  }, [options.video, options.offset, key, shifts]);

  configureApi(options.server, options.request, (path, response) => {
    const id = path.split("/")[2];
    return shiftMetadata(path, response, shifts[id] ?? 0);
  });

  if (failure) return <div className="notice error">Не удалось загрузить чат. <button onClick={() => setRetry((n) => n + 1)}>Повторить</button></div>;
  if (!data) return <div className="notice">{options.sessions.length ? "Загрузка чата…" : "Ищу запись этого эфира…"}</div>;
  return <WidgetContext.Provider value={{ locale: options.locale ?? "ru", spoilerFree: options.spoilerFree }}>
    <ChatReplay staticData={data} archiveId={`twitch:${key}`} historySessionId={activeSession}
      liveEmotesUrl={activeSession ? `public/streams/${activeSession}/emotes/live` : undefined}
      timelineUrl={activeSession ? `public/streams/${activeSession}/timeline` : undefined}
      eventsUrl={activeSession ? `public/streams/${activeSession}/events` : undefined}
      videoElement={options.video} isLive={false}
      externalOffsetSec={-options.offset} onExternalOffsetChange={(value) => options.onOffsetChange(-value)} />
  </WidgetContext.Provider>;
}

export function mount(host: HTMLElement, options: Options) {
  // Keep existing userscript appearance preferences on the first upgrade.
  try {
    if (!localStorage.getItem("tsr-chat-prefs")) {
      const old = JSON.parse(localStorage.getItem("tsr-chat-view") || "null");
      if (old) localStorage.setItem("tsr-chat-prefs", JSON.stringify({
        fontPx: old.fontPx, emotePx: (old.emoteScale || 1.5) * (old.fontPx || 13),
        showTimestamps: old.showTime, stripes: old.zebra, readableColors: old.readable,
        showDeleted: old.showDeleted, highlightFirstMessage: old.firstMsg, keywords: old.highlight,
      }));
    }
  } catch { /* Storage is optional. */ }
  const shadow = host.attachShadow({ mode: "open" });
  // Typing/searching inside chat must not trigger Twitch's player shortcuts.
  shadow.addEventListener("keydown", (event) => event.stopPropagation());
  shadow.addEventListener("keyup", (event) => event.stopPropagation());
  const style = document.createElement("style");
  style.textContent = __CHAT_CSS__;
  const container = document.createElement("div");
  container.className = "tsr-shared-chat";
  shadow.append(style, container);
  const root = createRoot(container);
  let previous: Options | undefined;
  let previousKey = "";
  const update = (next: Options) => {
    const key = sessionKey(next);
    const unchanged = previous && previousKey === key && previous.server === next.server &&
      previous.video === next.video && previous.offset === next.offset &&
      previous.spoilerFree === next.spoilerFree && previous.locale === next.locale;
    previous = next;
    previousKey = key;
    if (!unchanged) root.render(<Widget key={key} options={next} />);
  };
  update(options);
  return { update, unmount: () => root.unmount() };
}

function sessionKey(options: Options) {
  return options.sessions.map((s) => `${s.id}:${s.recordingStartedAt ?? s.startedAt ?? ""}:${s.recordingEndedAt ?? ""}`)
    .sort().join(",") + ":" + options.vodStartMs;
}
