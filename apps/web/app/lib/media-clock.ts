/** External replay consumers work in part-local time; MSE owns a global clock. */
export function partMediaTime(video: HTMLMediaElement, start: number) {
  return video.currentTime - (video.dataset?.continuousTimeline === "1" ? start : 0);
}
export function partMediaTarget(video: HTMLMediaElement, time: number, start: number) {
  return time + (video.dataset?.continuousTimeline === "1" ? start : 0);
}
export function partMediaDuration(video: HTMLMediaElement, start: number) {
  return Number.isFinite(video.duration) ? video.duration - (video.dataset?.continuousTimeline === "1" ? start : 0) : null;
}
