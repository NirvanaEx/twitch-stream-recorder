export type ReadJson = (url: string) => Promise<unknown>;
let origin = "";
let read: ReadJson;
let transform: (path: string, value: any) => any = (_, value) => value;
const metadata = new Map<string, { until: number; value: Promise<unknown> }>();

export function configureApi(server: string, request: ReadJson, adapt: typeof transform) {
  origin = new URL(server).origin;
  read = request;
  transform = adapt;
}
export function buildApiUrl(path: string) {
  return origin + "/api/" + path.replace(/^\/+/, "").replace(/^api\/+/, "");
}
export async function apiGet<T>(path: string, _options?: unknown): Promise<T> {
  const normalized = path.replace(/^\/+/, "").replace(/^api\/+/, "");
  if (!normalized.startsWith("public/streams/")) throw new Error("Unsupported chat endpoint");
  const url = buildApiUrl(normalized);
  // Keep raw metadata, then apply the current VOD shift on every delivery.
  const ttl = /\/(timeline|events)$/.test(normalized) ? 300000 :
    normalized.endsWith("/emotes/live") ? 60000 : 0;
  let entry = metadata.get(url);
  if (!ttl || !entry || entry.until <= Date.now()) {
    entry = { until: Date.now() + ttl, value: read(url) };
    if (ttl) {
      metadata.delete(url);
      metadata.set(url, entry);
      if (metadata.size > 24) metadata.delete(metadata.keys().next().value!);
      const current = entry;
      void entry.value.catch(() => { if (metadata.get(url) === current) metadata.delete(url); });
    }
  }
  return transform(normalized, await entry.value) as T;
}
