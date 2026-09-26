# Standalone audio for segmented recordings

Installed on srv869552 on 2026-09-16. Source: `ops/segmented-audio.cjs`.

The existing recorder skips standalone audio when RECORDING_LIVE_SEGMENTS=1.
A host systemd oneshot now runs the additional completion step inside the
existing API container, using its Prisma client, ffmpeg and archive mount.
This intentionally avoids restarting active captures or replacing divergent
production application files with the older checkout. No database migration.

`twitch-segmented-audio.timer` runs two minutes after the previous pass ends,
and two minutes after boot. Concurrent timer invocations do not overlap.
Units are stored beside this document under ops for reinstalling on a new host.

Only completed, non-live, segmented sessions with extraction enabled, no deleted
audio, no existing audio, and a stored archive are eligible. Recordings before
2026-09-09 are excluded because the owner previously removed old archives.
The global audioTrackEnabled switch is respected. Existing audio is never replaced.

The worker checks segment indexes and timeline continuity, extracts AAC without
re-encoding one part at a time, and checkpoints parts under
`/data/tmp/segmented-audio/<session-id>`. It checks free space (3 GiB reserve),
audio streams and duration, concatenates audio, uploads `audio.m4a` directly with
rclone, verifies remote size and MD5, then sets audioPath and audioSizeBytes.
The existing public audio endpoints and UI discover the track automatically.
Video files, original stream timings, and Telegram messages are unchanged.
Audio resides on the same Drive archive as its video, under existing retention.

Errors are logged as RETRY and retried on the next timer run. Completed audio
checkpoints are reused. The database publication is conditional, protecting
against audio deletion or another producer publishing during processing.

Operations:

    systemctl status twitch-segmented-audio.timer twitch-segmented-audio.service
    journalctl -u twitch-segmented-audio.service -n 50
    systemctl start --no-block twitch-segmented-audio.service

Disable future processing with `systemctl disable --now twitch-segmented-audio.timer`.
Keep a running pass alive to finish safely; do not stop the API or its recorder.
Existing published audio remains usable if the timer is disabled.

Validation: Node tests cover discontinuous/missing segments, short final parts,
archive path containment, and real ffmpeg extraction/concatenation with a missing
source retry, checkpoint reuse and a checksum-verified local archive double.
