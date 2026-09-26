# stream.neyron.site: independent API and recorder

- Read `docs/OPERATIONS.md` before deployment. This tree contains the source for
  the current HTTP API, web and snapshots of independent services. Read docs/SOURCE-MAP.md.
  The old source/bare repository does not match production.
- `/srv/apps/twitch-http-api/current-release.json` identifies the live API.
- `twitch-recorder-api` is now the permanent **recorder/media worker**, despite
  its historical name. Never restart it to deploy the site or HTTP API.
- The initial separation keeps that exact running process and its Streamlink,
  FFmpeg, chat, Telegram and archive jobs alive. Its existing authenticated REST
  routes are recorder protocol v1. New API instances run with `TSR_ROLE=api`.
- API deployment: `python3 ops/deploy-api.py`. It does not run migrations or
  restart dependencies. No blanket `docker compose up/down`, `--remove-orphans`,
  restart-all, or legacy deployment scripts.
- Web deployment must target only web with `--no-deps`; API deployment must use
  the script above. Keep the `BEGIN TSR BACKGROUND SYNC` routes and the persistent
  recorder `/socket.io/` upstream when updating Nginx.
- API data mounts are read-only. Never enable capture/recovery/upload/mirroring
  timers in the API, including indirectly from constructors or module hooks.
- Recorder endpoints preserve end-user authentication. Do not invent a shared
  admin token, retry a timed-out mutation, or fall back to running it in the API.
- Schema/package changes need an explicit compatible build/migration; the
  deployment script rejects mismatches with the current recorder.
- Never initialize/seed production users on API start.
- Do not commit or push without the user's explicit request.
