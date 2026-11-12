# Emote rendering and first-message highlight — 2026-11-12

The existing mirrored assets already return public, max-age=31536000, immutable. Two images caught pending in the live Twitch widget returned locally in 6–12ms; one HTTPS edge request took 362ms. The live browser at 2x had 4 of 9 visible emotes pending in one sample. Stable message keys and memoized rows already retain DOM between ticks. The missing part was lookahead: every new small emote used native lazy loading only after its row was mounted.

Small emotes now load eagerly with async decoding. A speed-aware lookahead warms upcoming emotes (15 playback seconds at 1x, 30 at 2x, at most 60), scans at most 300 rows, schedules at most 32 unique URLs, runs at most 4 low-priority image requests, and retains at most 64 loaded/decoded images. The queued working set is bounded to 48 URLs. Missing mirror fallbacks are reused for 60s instead of being retried by each new message. Browser HTTP caching remains unchanged. Large GIF attachments remain lazy and are not speculatively downloaded.

First messages use a green full-row background, inset outline and left accent. The former text-only underline is removed; specificity keeps zebra stripes, role highlights and compact spacing from overriding the whole-row highlight.

Validation: 18 component/helper tests plus the existing full-widget integration covering GIF/history/settings/pagination/seeking/reload. Added an assertion that the first-message row encloses its timestamp, author and text.

Publish only the generated widget using the established ops/chat-widget-20261111/deploy.py. It snapshots protected services, creates a single small static-file layer, uses Compose --no-deps web and retains the exact previous image for rollback. No recorder, API or database restart.
