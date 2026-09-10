import { createHash } from "node:crypto";

export function isGifSourceUrl(value: string): boolean {
  if (/[\s\u0000-\u001f\u007f]/u.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      /^(?:media\d*|i)\.giphy\.com$/i.test(url.hostname);
  } catch { return false; }
}

/** Original URLs, including the query string, remain in the chat record. */
export function gifSourceUrls(tag: unknown): string[] {
  if (typeof tag !== "string" || tag.length > 65536) return [];
  const urls = new Set<string>();
  for (const entry of tag.split(/,(?=\d+-\d+\|)/)) {
    const match = /^(\d+)-(\d+)\|([^|]+)\|(.+)$/.exec(entry);
    if (!match) continue;
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (Number.isSafeInteger(start) && Number.isSafeInteger(end) && end >= start && isGifSourceUrl(match[4])) {
      urls.add(match[4]);
    }
  }
  return [...urls];
}

export const gifSourceKey = (url: string) => createHash("sha256").update(url).digest("hex");

export function mirroredGifUrls(tag: unknown): Record<string, string> | undefined {
  const urls = gifSourceUrls(tag);
  return urls.length ? Object.fromEntries(urls.map((url) => [url, `public/chat-gifs/${gifSourceKey(url)}`])) : undefined;
}
