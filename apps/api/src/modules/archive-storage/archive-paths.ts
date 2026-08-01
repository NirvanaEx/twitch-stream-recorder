import { existsSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

/**
 * Marker file that proves the archive root is the mounted Drive and not the
 * empty directory left behind when the mount is gone. It is created once, by
 * hand, on the host (see README) — the API only ever reads it.
 *
 * Without it a dropped rclone mount would look like a healthy but empty
 * archive: recordings would be "moved" onto the server's own disk under the
 * mount point, invisibly filling it, and the retention sweep would find no
 * folders and conclude everything had already expired.
 */
export const ARCHIVE_SENTINEL = ".archive-root";

/** Folder inside a session directory is fixed: the names below are the contract. */
export const ARCHIVE_FILES = {
  video: "video.mp4",
  audio: "audio.m4a",
  chat: "chat.tsr.json",
  cover: "cover.jpg",
  meta: "session.json",
} as const;

/** Absolute archive root from ARCHIVE_DIR, or null when the tier is switched off. */
export function archiveRoot(): string | null {
  const configured = process.env.ARCHIVE_DIR?.trim();
  return configured ? resolve(configured) : null;
}

/**
 * Is the archive tier usable right now? A network mount can vanish between two
 * ticks, so this is deliberately a live check and never cached: every caller
 * asks again, and a "no" simply means the recording stays on the server disk
 * and in Telegram until the mount is back.
 */
export function isArchiveAvailable(): boolean {
  const root = archiveRoot();

  if (!root) {
    return false;
  }

  try {
    // On a dead FUSE mount this throws ENOTCONN rather than returning false.
    return existsSync(join(root, ARCHIVE_SENTINEL));
  } catch {
    return false;
  }
}

export function dataRoot(): string {
  return resolve(process.env.DATA_DIR ?? "./data");
}

/**
 * Does this path live on the server's own disk? The local-retention cleanup
 * asks before deleting anything: once a recording has moved to the archive
 * tier its path points at the Drive, and "free some local cache" must never
 * mean "delete the archived original".
 */
export function isUnderDataRoot(path: string): boolean {
  const rel = relative(dataRoot(), resolve(path));
  return rel !== "" && !rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel);
}

/**
 * Filesystem-safe version of a stream title, kept readable rather than
 * transliterated: the folders are meant to be browsed by a human in the Drive
 * web UI, and "Прохождение Elden Ring" beats "Prokhozhdenie-Elden-Ring".
 */
export function slugifyTitle(title: string | null | undefined): string {
  if (!title) {
    return "";
  }

  return (
    title
      .normalize("NFC")
      // Whitelist rather than a blacklist of reserved characters: letters and
      // digits of any alphabet stay, everything else (including control
      // characters, slashes and the Windows-reserved set) becomes a space.
      .replace(/[^\p{L}\p{N} _-]+/gu, " ")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "")
  );
}

/** `2026-08-01_14-30-00` in UTC — same convention the local recordings use. */
export function formatStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` +
    `_${pad(date.getUTCHours())}-${pad(date.getUTCMinutes())}-${pad(date.getUTCSeconds())}`
  );
}

export type SessionFolderInput = {
  platform: string;
  channelLogin: string;
  startedAt: Date;
  title: string | null;
  /** Disambiguates two broadcasts that start in the same second. */
  sessionId: string;
};

/**
 * `<root>/<platform>/<login>/<YYYY-MM>/<stamp>__<title>`
 *
 * Platform first because the same slug is a different person on Twitch and on
 * Kick; the month bucket keeps a channel that streams daily from turning into
 * a thousand-entry folder that the Drive web UI struggles to page through.
 */
export function buildSessionDir(root: string, input: SessionFolderInput): string {
  const slug = slugifyTitle(input.title);
  const stamp = formatStamp(input.startedAt);
  const month = `${input.startedAt.getUTCFullYear()}-${String(
    input.startedAt.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
  // Two streams can start in the same second after a reconnect; the id suffix
  // makes the name unique without making the common case unreadable.
  const suffix = input.sessionId.slice(-6);
  const name = slug ? `${stamp}__${slug}__${suffix}` : `${stamp}__${suffix}`;

  return join(root, safeSegment(input.platform), safeSegment(input.channelLogin), month, name);
}

/**
 * Channel logins and platform names are already slugs on both platforms; this
 * is belt and braces. Dots are dropped rather than kept safe, so no segment can
 * ever be `.` or `..` and the result cannot climb out of the archive root even
 * if a login one day arrives from somewhere less trustworthy.
 */
function safeSegment(value: string): string {
  const cleaned = value.replace(/[^a-z0-9_-]/gi, "_").replace(/_{2,}/g, "_");
  return cleaned.replace(/^_+|_+$/g, "") || "unknown";
}
