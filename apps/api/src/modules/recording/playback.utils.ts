import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

type SessionPlaybackFields = {
  id: string;
  playbackPath: string | null;
  fileSizeBytes: string | null;
};

export function resolveSessionPlaybackState(session: SessionPlaybackFields) {
  if (!session.playbackPath) {
    return {
      absolutePath: null,
      fileExists: false,
      fileSizeBytes: session.fileSizeBytes,
      videoReady: false,
      videoUrl: null,
    };
  }

  const absolutePath = resolve(session.playbackPath);

  if (!existsSync(absolutePath)) {
    return {
      absolutePath,
      fileExists: false,
      fileSizeBytes: session.fileSizeBytes,
      videoReady: false,
      videoUrl: null,
    };
  }

  try {
    const stat = statSync(absolutePath);
    const fileSizeBytes = String(stat.size);
    const videoReady = stat.size > 0;

    return {
      absolutePath,
      fileExists: true,
      fileSizeBytes,
      videoReady,
      videoUrl: videoReady ? `/api/archives/${session.id}/video` : null,
    };
  } catch {
    return {
      absolutePath,
      fileExists: false,
      fileSizeBytes: session.fileSizeBytes,
      videoReady: false,
      videoUrl: null,
    };
  }
}
