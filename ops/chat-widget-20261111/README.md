# Twitch chat client cache — 2026-11-11

Source: canonical web widget plus standalone /root/projects/twitch-sync payload.

The payload retains and reparents the existing chat DOM/React root when Twitch hides or replaces its host. Header padding follows the actual Twitch collapse button rectangle. Widget updates with unchanged session, clock, offset and preferences are skipped.

Completed sessions use an origin/session/finalization-keyed IndexedDB cache (24h freshness, up to 7d offline fallback). Memory and disk are bounded to 8 sessions / 300,000 messages. Active sessions have a short 15s in-memory TTL and are not persisted. In-flight downloads are shared, failed loads can retry, metadata is cached raw before applying the current VOD shift. Cached content is the complete paginated chat; a partially loaded transcript is never persisted.

Validation: payload startup with both existing Tampermonkey origins; host collapse/disappearance/replacement and header clearance; full widget GIF/history/settings/seeking/pagination tests extended with remount and unchanged-update assertions; replay-loader and timeline tests; cache origin/finalization/TTL/failure/bounds tests. Chrome test with 30,000 synthetic messages: initial 6 page requests, still 6 after reload and remount.

The standalone widget is a public static artifact. This release replaces only that file in a layer on the exact current web image, then uses Compose up -d --no-deps web. No application source/dist tree is copied into the image. deploy.py snapshots protected process identities and automatically rolls back the web image if health/hash verification fails. State and rollback image: /srv/apps/twitch-chat-client/current-release.json.

To deploy: python3 ops/chat-widget-20261111/deploy.py. Roll back by setting the recorded previousImage in a web-only Compose override and running up -d --no-deps web. Do not restart the recorder/API/DB. Standalone payload release follows /root/projects/twitch-sync/sidecar/OPERATIONS.md.

Limit: the cache does not add a new incremental protocol or polling for a still-recording broadcast. Completed replay data is reused until its freshness deadline; live cache entries are short-lived.
