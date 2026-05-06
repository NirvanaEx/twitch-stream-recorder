"use client";

import { useEffect } from "react";

const SEEK_STEP_SECONDS = 5;

/**
 * Bind global keyboard shortcuts for a <video> element. Active anywhere on
 * the page (not just when the video is focused) so the user can scrub even
 * while the chat panel has focus.
 *
 *   ←  /  →   seek -5s / +5s
 *   J / L     seek -5s / +5s (YouTube-style)
 *   K / Space toggle play / pause
 *   M         toggle mute
 *
 * Shortcuts are suppressed when the user is typing in an input / textarea /
 * contenteditable element.
 */
export function useVideoShortcuts(videoElement: HTMLVideoElement | null) {
  useEffect(() => {
    if (!videoElement) return undefined;

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (target.isContentEditable) return true;
      return false;
    };

    const seekBy = (delta: number) => {
      const duration = Number.isFinite(videoElement.duration) ? videoElement.duration : null;
      const next = videoElement.currentTime + delta;
      videoElement.currentTime = Math.max(0, duration ? Math.min(next, duration) : next);
    };

    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      switch (event.key) {
        case "ArrowLeft":
        case "j":
        case "J":
          event.preventDefault();
          seekBy(-SEEK_STEP_SECONDS);
          break;
        case "ArrowRight":
        case "l":
        case "L":
          event.preventDefault();
          seekBy(SEEK_STEP_SECONDS);
          break;
        case "k":
        case "K":
        case " ":
          event.preventDefault();
          if (videoElement.paused) {
            void videoElement.play().catch(() => undefined);
          } else {
            videoElement.pause();
          }
          break;
        case "m":
        case "M":
          event.preventDefault();
          videoElement.muted = !videoElement.muted;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [videoElement]);
}
