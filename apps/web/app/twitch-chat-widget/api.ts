export type ReadJson = (url: string) => Promise<unknown>;
let origin = "";
let read: ReadJson;
let transform: (path: string, value: any) => any = (_, value) => value;

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
  return transform(normalized, await read(buildApiUrl(normalized))) as T;
}
