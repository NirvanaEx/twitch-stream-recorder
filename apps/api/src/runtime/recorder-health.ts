import { recorderOrigin } from "./role";

type RecorderHealth = { reachable: boolean; checkedAt: string; protocol: 1; role?: string };
let cached: RecorderHealth | undefined;
let pending: Promise<RecorderHealth> | undefined;

/** Read-only liveness, never restart/recover recordings on an API reconnect. */
export function recorderHealth(): Promise<RecorderHealth> {
  if (cached && Date.now() - Date.parse(cached.checkedAt) < 5_000) return Promise.resolve(cached);
  if (pending) return pending;
  pending = (async () => {
    let reachable = false;
    let role: string | undefined;
    try {
      const response = await fetch(new URL("/api/health", recorderOrigin()), { signal: AbortSignal.timeout(3_000), redirect: "error" });
      const body = await response.json() as { ok?: boolean; role?: string };
      role = body.role ?? "legacy-recorder";
      reachable = response.ok && body.ok === true && role !== "api";
    } catch { /* A missing worker does not turn DB rows into stopped sessions. */ }
    cached = { reachable, checkedAt: new Date().toISOString(), protocol: 1, ...(role ? { role } : {}) };
    return cached;
  })().finally(() => { pending = undefined; });
  return pending;
}
