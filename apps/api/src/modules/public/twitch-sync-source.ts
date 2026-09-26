export type VodMetadata = { login: string; createdAtMs: number; durationSec: number; playlistUrl: string };
export type VodSegment = { url: string; startSec: number; durationSec: number; wallMs: number | null; discontinuity: number };
const CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

export function twitchMediaUrl(raw: string, base?: string): string {
  const url = new URL(raw, base);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') ||
      !['.ttvnw.net', '.cloudfront.net', '.twitch.tv'].some(suffix => url.hostname.endsWith(suffix))) {
    throw new Error('Unsupported Twitch media host');
  }
  return url.href;
}
export async function boundedFetch(url: string, limit: number, init: RequestInit = {}): Promise<Buffer> {
  const response = await fetch(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(12000) });
  if (!response.ok || !response.body) throw new Error(`Source returned HTTP ${response.status}`);
  const reader = response.body.getReader();
  const chunks: Buffer[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error('Source response is too large');
      chunks.push(Buffer.from(value));
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  return Buffer.concat(chunks);
}
export async function getVodMetadata(vodId: string): Promise<VodMetadata> {
  if (!/^\d{1,20}$/.test(vodId)) throw new Error('Invalid VOD ID');
  const query = `query($id:ID!){video(id:$id){owner{login} createdAt lengthSeconds} videoPlaybackAccessToken(id:$id,params:{platform:"web",playerBackend:"mediaplayer",playerType:"site"}){value signature}}`;
  const payload = JSON.parse((await boundedFetch('https://gql.twitch.tv/gql', 200000, {
    method: 'POST', headers: { 'Client-ID': CLIENT_ID, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id: vodId } }),
  })).toString());
  const video = payload.data?.video, token = payload.data?.videoPlaybackAccessToken;
  if (!video || !token?.value || !token.signature) throw new Error('Twitch VOD is unavailable');
  const master = new URL(`https://usher.ttvnw.net/vod/${vodId}.m3u8`);
  master.search = new URLSearchParams({ nauth: token.value, nauthsig: token.signature,
    allow_source: 'true', allow_audio_only: 'true', player: 'twitchweb' }).toString();
  const playlist = (await boundedFetch(master.href, 500000)).toString();
  const audio = playlist.split(/\r?\n/).find((line: string) => /^https:/.test(line) && new URL(line).pathname.includes('/audio_only/'));
  if (!audio) throw new Error('Twitch audio-only stream is unavailable');
  const result = { login: String(video.owner?.login || '').toLowerCase(), createdAtMs: Date.parse(video.createdAt),
    durationSec: Number(video.lengthSeconds), playlistUrl: twitchMediaUrl(audio) };
  if (!Number.isFinite(result.createdAtMs) || !(result.durationSec > 0)) throw new Error('Invalid VOD clock');
  return result;
}

export function parseVodPlaylist(text: string, base: string): VodSegment[] {
  if (!text.startsWith('#EXTM3U')) throw new Error('Invalid Twitch playlist');
  let startSec = 0, durationSec = 0, wallMs: number | null = null, discontinuity = 0;
  const segments: VodSegment[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('#EXT-X-KEY:') && !line.includes('METHOD=NONE')) throw new Error('Encrypted VOD is unsupported');
    if (line.startsWith('#EXT-X-MAP:')) throw new Error('This VOD segment format is unsupported');
    if (line === '#EXT-X-DISCONTINUITY') { discontinuity++; wallMs = null; }
    if (line.startsWith('#EXT-X-PROGRAM-DATE-TIME:')) {
      const parsed = Date.parse(line.slice(25)); wallMs = Number.isFinite(parsed) ? parsed : null;
    }
    if (line.startsWith('#EXTINF:')) durationSec = Number.parseFloat(line.slice(8));
    else if (line && !line.startsWith('#')) {
      if (!(durationSec > 0 && durationSec <= 30) || segments.length > 50000) throw new Error('Invalid VOD segment');
      segments.push({ url: twitchMediaUrl(line, base), startSec, durationSec, wallMs, discontinuity });
      startSec += durationSec; if (wallMs !== null) wallMs += durationSec * 1000;
      durationSec = 0;
    }
  }
  return segments;
}

export function selectVodWindow(segments: VodSegment[], start: number, duration: number) {
  const selected = segments.filter(s => s.startSec < start + duration && s.startSec + s.durationSec > start);
  if (!selected.length || selected[0].startSec > start + 0.001 ||
      selected.at(-1)!.startSec + selected.at(-1)!.durationSec < start + duration - 0.05) throw new Error('VOD window is incomplete');
  const first = selected[0];
  for (const segment of selected) {
    if (segment.discontinuity !== first.discontinuity) throw new Error('Delay changed inside the VOD sample');
    if (first.wallMs !== null && segment.wallMs !== null &&
        Math.abs(segment.wallMs - first.wallMs - (segment.startSec - first.startSec) * 1000) > 500) throw new Error('VOD clock jumps inside the sample');
  }
  return { segments: selected, skipSec: start - first.startSec,
    wallAtStartMs: first.wallMs === null ? null : first.wallMs + (start - first.startSec) * 1000 };
}
