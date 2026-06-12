"use client";

// Per-user (per-browser) "continue watching" positions, stored locally so
// every user resumes from their own spot without any server round-trips.

const PREFIX = "tsr-resume-";

export type ResumeState = {
  /** 1-based Telegram part index; 1 for single-file recordings. */
  part: number;
  /** Position inside that part, in seconds. */
  time: number;
  updatedAt: number;
};

export function readResume(archiveId: string): ResumeState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PREFIX + archiveId);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ResumeState;
    if (typeof parsed.part !== "number" || typeof parsed.time !== "number") return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveResume(archiveId: string, part: number, time: number) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      PREFIX + archiveId,
      JSON.stringify({ part, time, updatedAt: Date.now() } satisfies ResumeState),
    );
  } catch {
    // Storage may be unavailable (private mode); resuming is best-effort.
  }
}

export function clearResume(archiveId: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(PREFIX + archiveId);
  } catch {
    // Ignore.
  }
}
