import { renderTokens, type ChatMessage, type EmoteEntry } from "./chat-render";

export type ChatImage = { url: string; fallbackUrl?: string };

// Retain a small decoded working set; HTTP caching remains the browser's job.
// Four low-priority downloads cannot flood the connection during a seek.
export function createChatImageWarmer(createImage = () => new window.Image()) {
  const ready = new Map<string, HTMLImageElement>();
  const failed = new Map<string, { url: string; until: number }>();
  const queued = new Map<string, ChatImage>();
  const pending = new Set<string>();
  let active = 0;

  function rememberFallback(url: string, fallbackUrl: string) {
    failed.delete(url);
    failed.set(url, { url: fallbackUrl, until: Date.now() + 60000 });
    if (failed.size > 128) failed.delete(failed.keys().next().value!);
  }

  function source(url: string) {
    const fallback = failed.get(url);
    if (fallback && fallback.until > Date.now()) return fallback.url;
    failed.delete(url);
    return url;
  }

  function drain() {
    while (active < 4 && queued.size) {
      const [key, item] = queued.entries().next().value!;
      queued.delete(key);
      if (ready.has(key) || pending.has(key)) continue;
      pending.add(key);
      active++;
      const image = createImage();
      image.decoding = "async";
      image.loading = "eager";
      image.fetchPriority = "low";
      let done = false;
      const finish = (success: boolean) => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        image.onload = image.onerror = null;
        if (success) {
          ready.set(key, image);
          if (ready.size > 64) ready.delete(ready.keys().next().value!);
        } else image.removeAttribute("src");
        pending.delete(key);
        active--;
        drain();
      };
      const timer = window.setTimeout(() => finish(false), 15000);
      image.onload = () => {
        // Decode while the image is still ahead of the playhead. Merely
        // downloading bytes can leave the first visible frame waiting.
        if (typeof image.decode === "function") void image.decode().then(() => finish(true), () => finish(true));
        else finish(true);
      };
      image.onerror = () => {
        if (item.fallbackUrl && image.src !== item.fallbackUrl) {
          rememberFallback(item.url, item.fallbackUrl);
          image.src = item.fallbackUrl;
        } else finish(false);
      };
      image.src = source(item.url);
    }
  }

  return {
    source, rememberFallback,
    warm(images: ChatImage[]) {
      for (const image of images) {
        const cached = ready.get(image.url);
        if (cached) {
          ready.delete(image.url);
          ready.set(image.url, cached);
          continue;
        }
        if (!pending.has(image.url)) {
          queued.set(image.url, image);
          if (queued.size > 48) queued.delete(queued.keys().next().value!);
        }
      }
      drain();
    },
  };
}

export const chatImages = createChatImageWarmer();

export function upcomingChatImages(
  messages: ChatMessage[], emotes: Map<string, EmoteEntry>, time: number, rate: number,
): ChatImage[] {
  const end = time + Math.min(60, Math.max(15, rate * 15));
  let lo = 0, hi = messages.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (messages[mid].relativeTimeSec <= time) lo = mid + 1;
    else hi = mid;
  }
  const found = new Map<string, ChatImage>();
  // Only small emotes are warmed. Full GIF attachments can be megabytes.
  for (let i = lo; i < Math.min(messages.length, lo + 300) && messages[i].relativeTimeSec <= end; i++) {
    const m = messages[i];
    for (const token of renderTokens(m.textRaw, emotes, m.emotes, m.inlineEmotes, m.gifs)) {
      if (token.type === "emote") found.set(token.url, { url: token.url, fallbackUrl: token.fallbackUrl });
      if (found.size >= 32) return [...found.values()];
    }
  }
  return [...found.values()];
}
