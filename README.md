# Twitch Stream Recorder

Monorepo for a self-hosted Twitch stream recorder with realtime admin panel, browser replay, and synchronized chat playback.

## Services

- `apps/api`: NestJS API and WebSocket gateway
- `apps/web`: Next.js admin panel and replay UI
- `apps/worker`: background jobs, capture orchestration, retention tasks
- `infra/nginx`: reverse proxy and static HLS delivery

## First Run

1. Copy `.env.example` to `.env`
2. Fill auth secrets, database settings, and optionally Twitch app keys
3. Run `docker compose up --build`

## Local Development

For local development you do not need to rebuild all app containers on every change.

1. Copy `.env.example` to `.env`
2. Install recording dependencies on the host (see below)
3. Run `npm install`
4. Run `npm run dev`

### Required system dependencies for recording

The API spawns `streamlink` and `ffmpeg` as child processes. They must be available in `PATH` (or as `python -m streamlink`).

Windows:

- `winget install Gyan.FFmpeg` (or grab a static ffmpeg build and add it to PATH)
- `pip install --user streamlink` (the API will fall back to `python -m streamlink` if `streamlink.exe` is not in PATH)

macOS:

- `brew install ffmpeg streamlink`

Linux:

- `sudo apt install ffmpeg && pip install --user streamlink`

If either binary is missing the API will log `Recording disabled: ...` on startup and refuse to auto-record. This prevents creating dozens of empty session entries in the database.

What `npm run dev` does:

- starts `postgres` and `redis` in Docker
- frees local ports `3000` and `3001` from stale processes
- applies the Prisma schema with `db push`
- runs `api`, `web`, and `worker` locally with hot reload
- starts Next.js with Turbopack for faster dev compilation
- recompiles the NestJS API incrementally and restarts it after successful rebuilds

If you ever change the Prisma schema and need to regenerate the client manually, run:

- `npm run prisma:generate`

On Windows, do that while the dev API is stopped, otherwise the Prisma query engine file can be locked and fail with `EPERM`.

Local URLs:

- `http://localhost:3000` - Next.js panel
- `http://localhost:3001/api/health` - API healthcheck

To stop local infrastructure:

- `npm run dev:down`

If the dev server cache gets corrupted or you want a full cold restart, run:

- `npm run dev:reset`

To run the local smoke test while dev services are up:

- `npm run verify:smoke`

## Twitch Integration Modes

The app now has two Twitch modes:

- Public mode: works without `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`. You can add channels by login, detect live status through `streamlink`, and record streams from the public channel URL.
- API mode: enabled when `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` are configured. This restores official Helix lookups, richer metadata, and EventSub readiness.

Public mode tradeoffs:

- channel existence is not validated through Helix before adding it
- channel avatars and display names may be limited
- EventSub stays unavailable
- live checks depend on `streamlink`, so `streamlink` must be installed anywhere the API runs

If you want the official Twitch API mode:

1. Open the Twitch developer console: `https://dev.twitch.tv/console/apps`
2. Register an application
3. For local setup, set the OAuth Redirect URL to `http://localhost:3000`
4. Create a client secret on the app's Manage page
5. Copy the Client ID and Client Secret into `.env`
6. Set `TWITCH_EVENTSUB_SECRET` to any ASCII secret between 10 and 100 characters, for example `openssl rand -hex 32`
7. Restart `npm run dev`

Relevant docs:

- Twitch app registration: `https://dev.twitch.tv/docs/authentication/register-app`
- EventSub webhook secret requirements: `https://dev.twitch.tv/docs/eventsub/handling-webhook-events/`

## Current State

This is still an early scaffold, but channel management and recording can now run either with official Twitch API credentials or in a public `streamlink`-based fallback mode.
