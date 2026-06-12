import { getAuthToken } from "./api";

export function buildMediaUrl(path: string | null | undefined) {
  if (!path) {
    return "";
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

  if (base.startsWith("http://") || base.startsWith("https://")) {
    const root = base.replace(/\/api$/, "");
    return `${root}${path}`;
  }

  return path;
}

/**
 * Append the user's JWT to a URL as a `?token=` query parameter.
 *
 * `<video>` elements and `<a download>` clicks issue a plain navigation —
 * we cannot inject the `Authorization` header for them. The API's
 * JwtAuthGuard accepts the JWT via `?token=` on GET requests as a
 * fallback so these endpoints can be reached from a normal navigation.
 */
export function withAuthToken(url: string): string {
  if (!url) return url;

  const token = getAuthToken();
  if (!token) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

/** Convenience: media URL for an authenticated archive video / download. */
export function buildAuthenticatedMediaUrl(path: string | null | undefined) {
  const url = buildMediaUrl(path);
  return url ? withAuthToken(url) : url;
}

export function formatFileSize(fileSizeBytes: string | null | undefined) {
  if (!fileSizeBytes) {
    return "-";
  }

  const size = Number(fileSizeBytes);

  if (!Number.isFinite(size) || size <= 0) {
    return "-";
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(size < 100 * 1024 * 1024 ? 1 : 0)} MB`;
  }

  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function formatDuration(startedAt: string | null | undefined, now = Date.now()) {
  if (!startedAt) {
    return "--:--";
  }

  const startedMs = new Date(startedAt).getTime();

  if (!Number.isFinite(startedMs) || startedMs <= 0) {
    return "--:--";
  }

  const totalSeconds = Math.max(0, Math.floor((now - startedMs) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds,
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Format a known duration in seconds as "1h 23m" / "12m 5s" / "45s". */
export function formatSeconds(durationSec: number | null | undefined): string {
  if (!durationSec || !Number.isFinite(durationSec) || durationSec <= 0) return "—";

  const total = Math.floor(durationSec);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatPeriod(
  startedAt: string | null | undefined,
  endedAt: string | null | undefined,
): string {
  if (!startedAt) return "—";
  const startedMs = new Date(startedAt).getTime();
  if (!Number.isFinite(startedMs) || startedMs <= 0) return "—";

  const endedMs = endedAt ? new Date(endedAt).getTime() : null;
  const totalSeconds =
    endedMs && Number.isFinite(endedMs) && endedMs > startedMs
      ? Math.floor((endedMs - startedMs) / 1000)
      : 0;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (totalSeconds <= 0) return "—";
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

