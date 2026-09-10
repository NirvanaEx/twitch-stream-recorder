import { apiGet } from "./api";
import type { ChatResponse } from "./chat-render";

type Page = ChatResponse & { nextCursor?: string | null };

export async function loadReplayChat(
  endpoint: string,
  cancelled: () => boolean,
  read: (url: string) => Promise<Page> = (url) => apiGet<Page>(url, { cacheable: true }),
): Promise<ChatResponse | null> {
  let result: ChatResponse | null = null;
  let cursor: string | null = null;
  const seen = new Set<string>();
  do {
    if (cancelled()) return null;
    const query = `${endpoint}${endpoint.includes("?") ? "&" : "?"}page=1${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const page = await read(query);
    if (cancelled()) return null;
    if (!result) result = { messages: [...page.messages], emotes: page.emotes, mediaTimeline: page.mediaTimeline };
    else result.messages.push(...page.messages);
    cursor = page.nextCursor ?? null;
    if (cursor && seen.has(cursor)) throw new Error("Chat page cursor did not advance");
    if (cursor) seen.add(cursor);
  } while (cursor);
  return result;
}
