# Playback performance, 2026-09-09

Based on deployed `9ed962b` (including chat history/scroll fixes); GitHub and srv
main were checked before changes. Original development checkout's unrelated
uncommitted work is preserved; implementation uses a separate worktree.

## Shipped behavior

- No second video on initial page load. Legacy timeline previews mount after
  250 ms of dwell; metadata arrival applies the first seek, subsequent movement
  is debounced. Prepared recordings use 160×90 JPEG frames. Spoiler fog does no
  preview I/O.
- Listing/playback/audio/cover filesystem reads are asynchronous. Listing stats
  have a 3-second, 256-entry cache that merges in-flight reads. Media serving
  always checks fresh metadata for moved/growing files. Stored covers are tried
  locally before accessing the archive and retained in the existing 64-entry LRU.
- Socket refresh bursts collapse into one request; refreshes cannot overlap and
  hidden tabs defer socket refreshes until visible. Existing polling is unchanged.
- The web runtime uses Next standalone output and static assets, avoiding a
  second dependency installation and deployment of build caches.
- Prepared HLS uses native playback where supported, otherwise lazy-loaded
  hls.js 1.6.16. Buffer targets are bounded; fatal errors fall back to original
  MP4 with position and playback intent preserved. Multi-part recordings continue
  through the existing playlist player.

## Bounded HLS pilot

Pilot: `cmqoelw7a2ol4nb01une6t6aa`, complete 520.168-second recording, 52 preview
frames, approximately 443 MiB. Original video/audio packets are copied without
re-encoding. This is one quality, not adaptive bitrate or a CDN rollout.

Prepare explicitly inside the API container:

```sh
docker exec twitch-recorder-api python3 scripts/prepare-playback.py SESSION_ID
```

Only single-part video up to 15 minutes / 600 MiB is accepted. Preparation holds
a lock, uses one ffmpeg job with low CPU priority, enforces a 768 MiB total derived
cache budget and 20 GiB free-space reserve, and atomically publishes only a fully
validated playlist and preview set. Originals are never changed or removed.
Bundles expire after 30 days; future preparation removes only expired bundles
with this format's ready marker. Expired/missing bundles revert to MP4.
No public request triggers ffmpeg and no scheduled mass processing is enabled.

## Measurement and verification

The main `<video>` exposes local diagnostics in `data-startup-ms` (play request
to first displayed frame), `data-seek-ms` (last seek to `seeked`), `data-stall-count`,
`data-stall-ms`, and `data-delivery`. Nothing is transmitted. For an MP4 comparison
use the same watch URL with `?delivery=mp4`; keep cache/network conditions in mind.

- Linux/Node 22 API suite: 163/163 passed; additional ETag revalidation test passed.
- TypeScript API/web checks and Next production build passed.
- `scripts/test-playback-ui.cjs`: dwell cancellation, JPEG selection, initial
  metadata seek, one media element at mount, spoiler fog, HLS fallback/resume,
  metrics, refresh bursts/in-flight/hidden-tab behavior.
- Existing `scripts/test-chat-ui.cjs` regression harness passed.
- Windows-only archive-path expectations fail in the pre-existing API suite;
  the authoritative full-suite run was performed on Linux.

UI harnesses use `node --import tsx scripts/test-playback-ui.cjs` with jsdom
available through NODE_PATH, as for the existing chat harness.

External-domain validation also found Cloudflare adding weak ETags when Brotli
compressing the playlist. Public/admin media now accept weak If-None-Match and
multiple tags, so those responses can return 304 correctly. Browser testing
confirmed one video element and restored position on native HLS. Runtime files
changed from 492.2 MiB dependencies + 156.8 MiB Next output to 60.9 + 4.6 MiB.
