export type TwitchGifRange = {
  /** Zero-based code-point positions, with an inclusive end, like Twitch emotes. */
  start: number;
  end: number;
  id: string;
  url: string;
};

/** Keep Twitch's asset URL verbatim, including attribution/query parameters.
 * https://dev.twitch.tv/docs/chat/irc#privmsg-tags
 * Imported bundles are untrusted: GIF metadata may only load GIPHY HTTPS assets.
 */
export function parseTwitchGifRanges(tag: unknown): TwitchGifRange[] {
  if (typeof tag !== "string" || tag.length > 65536) return [];
  const ranges: TwitchGifRange[] = [];
  // Commas inside a URL are not separators unless another placement follows.
  for (const entry of tag.split(/,(?=\d+-\d+\|)/)) {
    const match = /^(\d+)-(\d+)\|([^|]+)\|(.+)$/.exec(entry);
    if (!match) continue;
    const start = Number(match[1]);
    const end = Number(match[2]);
    const url = match[4];
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || end < start || /[\s\u0000-\u001f\u007f]/u.test(url)) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port ||
          !/^(?:media\d*|i)\.giphy\.com$/i.test(parsed.hostname)) continue;
    } catch { continue; }
    ranges.push({ start, end, id: match[3], url });
  }
  return ranges;
}
