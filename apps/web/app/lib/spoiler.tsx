"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiGet } from "./api";

/**
 * Spoiler-free mode.
 *
 * A recording is watched to find out what happened, and the interface around
 * it keeps giving that away before the video does. How long the broadcast ran,
 * how big the file is, how far along the progress bar sits, how many messages
 * chat produced, where the category changed — each of those answers "was this
 * a short evening or a marathon, and is the interesting part still coming"
 * without anyone asking.
 *
 * With this on, the app shows the position in the recording (and the real
 * time that moment happened) and nothing that implies what is left.
 *
 * The setting is global and per browser: it is a way of watching, not a
 * property of any one recording.
 */

const STORAGE_KEY = "tsr-spoiler-free";

/**
 * Two layers, on purpose.
 *
 * The admin sets the default in Settings, and it is what a first visit, a
 * fresh browser or an anonymous viewer gets. Flipping the toggle in the header
 * or in the player writes an override for *that browser only* — turning it off
 * to check the length of one recording must not change what everyone else
 * sees, and it must not need the settings permission either.
 *
 * A browser that has never touched the toggle keeps following the server, so
 * changing the default in Settings actually reaches people.
 */
const DEFAULT_WHEN_UNREACHABLE = true;

type SpoilerContextValue = {
  spoilerFree: boolean;
  setSpoilerFree: (value: boolean) => void;
  toggleSpoilerFree: () => void;
  /** True while this browser is still following the server's default. */
  followsServerDefault: boolean;
  /** Drop this browser's override and go back to the server's default. */
  resetToServerDefault: () => void;
};

const SpoilerContext = createContext<SpoilerContextValue>({
  spoilerFree: DEFAULT_WHEN_UNREACHABLE,
  setSpoilerFree: () => undefined,
  toggleSpoilerFree: () => undefined,
  followsServerDefault: true,
  resetToServerDefault: () => undefined,
});

function readOverride(): boolean | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    // Private mode — this browser simply has no opinion.
  }
  return null;
}

export function SpoilerProvider({ children }: { children: ReactNode }) {
  // Both server and client start here: reading localStorage during the first
  // render would make the markup differ from the prerendered HTML and React
  // would throw the tree away. The stored override and the server's default
  // are applied right after mount.
  const [serverDefault, setServerDefault] = useState(DEFAULT_WHEN_UNREACHABLE);
  const [override, setOverride] = useState<boolean | null>(null);

  useEffect(() => {
    setOverride(readOverride());
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await apiGet<{ spoilerFreeDefault: boolean }>(
          "public/preferences",
          { cacheable: true },
        );
        if (!cancelled) setServerDefault(response.spoilerFreeDefault);
      } catch {
        // API unreachable: spoiler-free stays on. Failing towards showing
        // more than the viewer asked for is the wrong way to fail.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const spoilerFree = override ?? serverDefault;

  const setSpoilerFree = useCallback((value: boolean) => {
    setOverride(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // Ignore — the choice then lasts as long as the tab does.
    }
  }, []);

  const toggleSpoilerFree = useCallback(() => {
    setSpoilerFree(!(readOverride() ?? spoilerFree));
  }, [setSpoilerFree, spoilerFree]);

  const resetToServerDefault = useCallback(() => {
    setOverride(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
  }, []);

  const value = useMemo(
    () => ({
      spoilerFree,
      setSpoilerFree,
      toggleSpoilerFree,
      followsServerDefault: override === null,
      resetToServerDefault,
    }),
    [spoilerFree, setSpoilerFree, toggleSpoilerFree, override, resetToServerDefault],
  );

  return <SpoilerContext.Provider value={value}>{children}</SpoilerContext.Provider>;
}

export function useSpoiler() {
  return useContext(SpoilerContext);
}

/**
 * How far into a recording this browser has actually got.
 *
 * Separate from the "continue watching" position, which moves backwards the
 * moment you rewind. This one only ever grows: it is the line between what the
 * viewer has already seen — and may therefore be shown — and the fog.
 */
const REVEAL_PREFIX = "tsr-revealed-";

export function readRevealed(recordingId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(REVEAL_PREFIX + recordingId);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveRevealed(recordingId: string, seconds: number) {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(seconds) || seconds <= 0) return;

  try {
    if (seconds <= readRevealed(recordingId)) return;
    window.localStorage.setItem(REVEAL_PREFIX + recordingId, String(Math.floor(seconds)));
  } catch {
    // Ignore.
  }
}
