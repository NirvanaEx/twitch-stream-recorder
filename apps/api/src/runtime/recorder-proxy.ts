import { request, type IncomingMessage, type ServerResponse } from "node:http";
import { recorderOrigin } from "./role";

/** REST contract v1 deliberately retains existing authenticated command routes.
 * This allows the running recorder to survive the very first API deployment.
 * Authorization is forwarded, never replaced with an administrator identity.
 * Commands are sent once: a lost response is NOT permission to replay a write.
 */
export function isRecorderRequest(method: string, rawUrl: string): boolean {
  let path: string;
  try { path = decodeURIComponent(rawUrl.split("?", 1)[0]).replace(/\/+$/, "").toLowerCase(); }
  catch { return false; }
  const write = !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
  if (path === "/api/recording/active") return true;
  if (/^\/api\/channels(?:\/|$)/.test(path) && write) return true;
  if (/^\/api\/(telegram|archive-storage)(?:\/|$)/.test(path)) return true;
  if (path === "/api/storage/disk/cleanup" && write) return true;
  if (/^\/api\/archives(?:\/|$)/.test(path) && write) return true;
  if (/^\/api\/(?:archives|public\/streams)\/[^/]+\/emotes\/live$/.test(path)) return true;
  // The recorder owns the single Telegram connection and mutable preview/GIF
  // caches. Keep media streaming, export and its live metrics with that owner.
  return /^\/api\/(?:archives|public\/streams)\/[^/]+\/(?:video|audio|thumbnail|bundle|stream-stats)$/.test(path);
}

function endToEndHeaders(headers: IncomingMessage["headers"]) {
  const result = { ...headers };
  const excluded = ["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade",
    ...String(headers.connection ?? "").split(",").map((part) => part.trim().toLowerCase())];
  for (const name of excluded) delete result[name];
  return result;
}

export function recorderProxy(origin = recorderOrigin()) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!isRecorderRequest(req.method ?? "GET", req.url ?? "/")) return next();
    if (req.headers["x-tsr-recorder-hop"]) {
      res.writeHead(503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(JSON.stringify({ message: "Recorder routing loop prevented." }));
      return;
    }
    let response: IncomingMessage | undefined;
    const upstream = request({
      hostname: origin.hostname, port: origin.port || 80,
      method: req.method, path: req.url,
      headers: { ...endToEndHeaders(req.headers), host: origin.host, "x-tsr-recorder-hop": "1" },
    }, (incoming) => {
      response = incoming;
      res.writeHead(incoming.statusCode ?? 502, endToEndHeaders(incoming.headers));
      incoming.on("error", () => res.destroy());
      incoming.pipe(res);
    });
    upstream.setTimeout(300_000, () => upstream.destroy(new Error("Recorder response timeout")));
    const connectTimer = setTimeout(() => upstream.destroy(new Error("Recorder connect timeout")), 5_000);
    upstream.once("socket", (socket) => {
      if (socket.connecting) socket.once("connect", () => clearTimeout(connectTimer));
      else clearTimeout(connectTimer);
    });
    upstream.once("error", () => {
      clearTimeout(connectTimer);
      if (res.destroyed) return;
      if (res.headersSent) { res.destroy(); return; }
      res.writeHead(503, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify({ message: "Рекордер временно недоступен. Статус команды нужно проверить после восстановления связи." }));
    });
    res.once("close", () => { clearTimeout(connectTimer); response?.destroy(); upstream.destroy(); });
    req.once("aborted", () => upstream.destroy());
    req.pipe(upstream);
  };
}
