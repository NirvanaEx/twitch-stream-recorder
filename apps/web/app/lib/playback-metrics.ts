/** Local diagnostics only: last startup/seek and accumulated rebuffering.
 * No requests, personal data, render state updates, or unbounded event history.
 */
export function trackPlaybackMetrics(video: HTMLMediaElement, now = () => performance.now()) {
  for (const key of ["startupMs", "seekMs", "stallCount", "stallMs"]) delete video.dataset[key];
  let startedAt: number | null = null;
  let seekAt: number | null = null;
  let stallAt: number | null = null;
  let firstFrame = false;
  let stallCount = 0;
  let stallMs = 0;
  let frameId: number | undefined;
  const v = video as HTMLVideoElement;
  const finishStall = () => {
    if (stallAt !== null) {
      stallMs += now() - stallAt;
      stallAt = null;
      video.dataset.stallMs = String(Math.round(stallMs));
    }
  };
  const frame = () => {
    frameId = undefined;
    if (!firstFrame && startedAt !== null) {
      firstFrame = true;
      video.dataset.startupMs = String(Math.round(now() - startedAt));
    }
    if (seekAt !== null) {
      video.dataset.seekMs = String(Math.round(now() - seekAt));
      seekAt = null;
    }
    finishStall();
  };
  const ready = () => {
    if (frameId !== undefined) v.cancelVideoFrameCallback(frameId);
    if (typeof v.requestVideoFrameCallback === "function") {
      frameId = v.requestVideoFrameCallback(frame);
    } else frame();
  };
  const handlers: Record<string, () => void> = {
    play: () => { if (!firstFrame && startedAt === null) startedAt = now(); },
    seeking: () => { seekAt = now(); finishStall(); },
    seeked: ready,
    playing: ready,
    waiting: () => {
      if (firstFrame && !video.paused && !video.seeking && seekAt === null && stallAt === null) {
        stallAt = now();
        video.dataset.stallCount = String(++stallCount);
      }
    },
    pause: finishStall,
    ended: finishStall,
  };
  for (const [event, handler] of Object.entries(handlers)) video.addEventListener(event, handler);
  return () => {
    for (const [event, handler] of Object.entries(handlers)) video.removeEventListener(event, handler);
    if (frameId !== undefined) v.cancelVideoFrameCallback(frameId);
  };
}
