import type { ChatMessage, ChatResponse } from "../lib/chat-render";

export type Session = { id: string; recordingStartedAt?: string; startedAt?: string };
export type ReplayPage = ChatResponse & { nextCursor?: string | null };
export function sessionShift(session: Session, vodStartMs: number, data?: ChatResponse) {
  const anchor = data?.mediaTimeline?.captureAnchorMs || Date.parse(session.recordingStartedAt || session.startedAt || "");
  return Number.isFinite(anchor) && vodStartMs > 0 ? (anchor - vodStartMs) / 1000 : 0;
}
export function onVodTimeline(data: ChatResponse, shift: number, vodStartMs: number): ChatResponse {
  return {
    ...data,
    // Twitch's VOD clock is already linear wall time. The recording's packet
    // gap map only describes our MP4, and must not be applied a second time.
    mediaTimeline: null,
    messages: data.messages.map((message) => {
      const stamp = Date.parse(message.messageTimestamp || "");
      return { ...message,
        relativeTimeSec: vodStartMs > 0 && Number.isFinite(stamp) ? (stamp - vodStartMs) / 1000 : message.relativeTimeSec + shift,
        deletedAtSec: message.deletedAtSec == null ? message.deletedAtSec : message.deletedAtSec + shift,
      };
    }),
  };
}
export function mergeChats(chats: ChatResponse[]): ChatResponse {
  const messages = new Map<string, ChatMessage>();
  const emotes = new Map();
  for (const chat of chats) {
    for (const m of chat.messages) {
      const key = m.id;
      if (!messages.has(key)) messages.set(key, m);
    }
    for (const emote of chat.emotes?.emotes ?? []) emotes.set(emote.name, emote);
  }
  return { messages: [...messages.values()].sort((a, b) => a.relativeTimeSec - b.relativeTimeSec),
    emotes: { provider: "7tv", fetchedAt: "", emotes: [...emotes.values()] },
    gifAssets: Object.assign({}, ...chats.map((chat) => chat.gifAssets)),
  };
}
export function shiftMetadata(path: string, data: any, shift: number) {
  const add = (n: number | null) => n == null ? n : n + shift;
  if (path.endsWith("/events")) return { ...data, events: (data.events ?? []).map((event: any) => ({ ...event,
    startedAtSec: add(event.startedAtSec), lockedAtSec: add(event.lockedAtSec), endedAtSec: add(event.endedAtSec),
    samples: event.samples.map((sample: any) => ({ ...sample, atSec: add(sample.atSec) })),
  })) };
  if (path.endsWith("/timeline")) return { ...data,
    points: data.points.map((point: any) => ({ ...point, relativeTimeSec: add(point.relativeTimeSec) })),
    segments: data.segments.map((segment: any) => ({ ...segment, startSec: add(segment.startSec), endSec: add(segment.endSec) })),
    titles: data.titles.map((title: any) => ({ ...title, atSec: add(title.atSec) })),
  };
  return data;
}
