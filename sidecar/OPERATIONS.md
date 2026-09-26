# Deployment without stopping an active recording

Source: `/root/projects/twitch-sync`; bare repository: `/srv/git/twitch-sync.git`.
Run `git push srv main` here to deploy this component only. Do not push the stale recorder checkout to deploy this change.

The `tsr-sync` container serves the generated payload and the new `audio-sync` route. It queries metadata with Prisma and reads audio through the existing API. It never starts the Nest application, recording jobs, migrations or upload workers.

The payload must preserve the installed loader's `?origin=` address and Tampermonkey `@connect` permission. Build and serve both the domain and legacy `http://193.160.119.15:9000` variants. Never silently switch legacy clients to the domain: their requests will be blocked by the extension. The deploy check verifies both artifacts; `test-payload-startup.cjs` runs the complete generated scripts with each set of permissions.

The runtime inherits the exact API image for existing FFmpeg/Prisma dependencies. One comparison runs at a time; the container has a 1-CPU and 384-MiB limit. No new host port is exposed publicly: health/debug access is on `127.0.0.1:18769` only.

The deploy hook archives the committed source into `/srv/apps/twitch-sync/releases`, builds its small image, checks its health and payload hash, then installs two Nginx locations and runs `nginx -t` plus a graceful reload. It does not restart API, web, Nginx containers, Streamlink or FFmpeg. The deployed Nginx source receives the same generated configuration for later image builds.

State: `/srv/apps/twitch-sync/current-release.json`. Backups: `/srv/backup/twitch-sync/<timestamp>`. Secret runtime environment: `/root/.secrets/twitch-sync/runtime.env` (0600, do not print).

Before any future full recorder deployment, preserve the `BEGIN TSR BACKGROUND SYNC` block in `infra/nginx/default.conf` or rerun this component's deployment. The older recorder bare repository does not include changes from several prior live fixes.

Rollback: copy the saved `nginx-default.conf` into the existing Nginx container and its deployed source; test and gracefully reload Nginx. Old API/web immediately resume handling these URLs. Do not restart the recorder API for rollback. Keep the independent sync container until diagnostics finish; it has no recording jobs.
