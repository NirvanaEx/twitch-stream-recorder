# Live offload on srv869552

Operational settings restored on 2026-09-13 (Asia/Tashkent) in the deployed .env:

```env
RECORDING_LIVE_SEGMENTS=1
RECORDING_SEGMENT_MINUTES=5
RECORDING_MIN_FREE_GB=2
```

Closed five-minute MP4 parts are registered during capture. Telegram and ArchiveStorage consume the part queue independently. ArchiveStorage verifies the Drive copy before deleting the local part; Telegram can retry from archivePath. Local deletion therefore does not wait for Telegram, but a verified Drive copy remains. Drive expiry still requires Telegram delivery.

The previous mode was LIVE_SEGMENTS=0 with 15-minute TS parts and a 20 GiB start reserve. It retained the entire active broadcast and joined it after the stream ended, filling the server disk. Five-minute parts bound normal capture disk usage and the 2 GiB start reserve allows recovery with limited free space; unavailable destinations still require monitoring.

Source and deployed application code differ. The runtime configuration was changed and two service modules were patched on top of the deployed source, preserving its timing/playback fixes. Sensitive pre-change config and verification reports are in /root/.secrets/stream-live-offload-20260913.

The Telegram uploader now drains waiting live segments between parts of a large archive and between completed sessions. Missing segment sources end the pass without a busy retry. Audio-only archive moves update audioPath with playbackPath; Telegram also accepts the archived playback path for older inconsistent rows. Four existing audio-only rows from September 9 onward were repaired and requeued after checking the Drive files.

Validation: the complete deployed API source compiled with TypeScript; 5 new regression checks plus 6 existing PartSplitter checks passed. The image was built as a minimal layer containing only the two tested service modules, and their hashes were verified in the running API container. Rollback image: twitch-stream-recorder-api:before-live-offload-20260913. The deployed source files were updated from the tested staging copy. No Git commit or push was made.

The accumulated 18,635,331,546-byte video and its audio were verified on the new Drive before restarting the uploader to release its open deleted source file. Disk availability rose from about 2 GiB to 21 GiB. One closed live segment was rescued separately with MD5/size verification; subsequent closed segments were offloaded and removed by ArchiveStorage itself. A 464,902,815-byte stale playback cache was removed only for old/unneeded or Telegram-confirmed sessions and with no open file handles.
