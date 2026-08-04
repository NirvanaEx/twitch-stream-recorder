# Twitch Stream Recorder

Monorepo for a self-hosted Twitch stream recorder with realtime admin panel, browser replay, and synchronized chat playback.

## Services

- `apps/api`: NestJS API and WebSocket gateway
- `apps/web`: Next.js admin panel and replay UI
- `apps/worker`: background jobs, capture orchestration, retention tasks
- `infra/nginx`: reverse proxy and static HLS delivery

## How a recording is put together

One broadcast is one file. The capture is written in MPEG-TS pieces while the
stream runs and joined back into a single `.mp4` the moment it ends — the
cutting is undone before anything else sees the recording, so the player, the
archive and the download all get one continuous video.

The pieces are not a compromise on the recording: TS carries no per-file
container, its timestamps run straight through the boundaries, and the join is
a stream copy, so what comes out is what streamlink pulled. Verified in
`chunk-join.spec.ts` — the joined file decodes to the same audio, sample for
sample, as the uncut capture.

They exist for the disk. Joining from a folder of pieces lets each one be freed
as ffmpeg reads it, so a broadcast bigger than the free space still joins;
`RECORDING_SEGMENT_MINUTES` sets how big a piece is.

What is *not* done anymore is cutting the capture into finished `.mp4` chunks
as it runs. That shipped each chunk to Telegram during the broadcast, but the
recording then stayed a row of separate files: every boundary re-primed the
audio decoder, and the player hopping between files turned that into an audible
break mid-stream. It is still available as `RECORDING_LIVE_SEGMENTS=1` for a
disk too small to hold a whole broadcast — see `.env.example`.

Splitting for Telegram happens afterwards, on the finished file, and only
because a message cannot exceed 2 GB. Those parts are cut and uploaded one at a
time, and each is deleted as soon as Telegram has it, so the split needs a part
or two of free space rather than a second copy of the recording. The player
only ever falls back to them once both the local and the archive copy are gone.

## Where recordings live

Three tiers, in the order a finished recording passes through them:

| Tier | Location | Holds it for | Deleted by |
| --- | --- | --- | --- |
| capture | `DATA_DIR` on the server disk | minutes to hours | the move to the archive, or the local retention |
| telegram | the configured channel | forever | nothing automatic |
| archive | `ARCHIVE_DIR` on a mounted drive | `archiveKeepDays` (90 by default) | the archive retention |

Capture is always local: a network mount cannot take the thousands of small
appends `streamlink` and `ffmpeg` produce while recording. Once the session is
finished — and once Telegram has taken its copy from the fast local file — the
finished artefacts are moved to the archive tier and `playbackPath` follows
them, so the player, the covers and the downloads all read from the drive.

Each session becomes one self-contained folder, so a downloaded copy is a
complete archive rather than a video that needs this app's database:

```
<ARCHIVE_DIR>/<platform>/<login>/<YYYY-MM>/<stamp>__<title>__<id>/
    video.mp4        the recording (audio.m4a for an audio-only session)
    audio.m4a        standalone track, when one was extracted
    chat.tsr.json    chat replay with the used emotes inlined as data URIs
    cover.jpg        archive cover
    session.json     title, category, timings, Telegram message ids
```

Two rules make the tiering safe to leave unattended:

- the local original is deleted only after the copy on the drive has been
  verified byte-for-byte;
- a folder expires from the drive only once Telegram is confirmed to hold the
  same recording. The last copy of a broadcast is never the one that expires —
  it is kept past its date and the reason shows up on the storage page.

**If the mount goes away**, the tier reports itself unavailable and the app
behaves exactly as it did before the tier existed: recordings stay on the
server disk and go to Telegram, and the backlog moves across on its own once
the mount is back. That check is the `.archive-root` marker file — see
`.env.example` for how to create it and why it exists.

Retention is set in the admin panel, Settings → Storage. `/admin/storage`
shows the tier's state, its size, what is queued and what failed.

## First Run

1. Copy `.env.example` to `.env`
2. Fill auth secrets, database settings, and optionally Twitch app keys
3. Optionally point `ARCHIVE_DIR` at a mounted drive and create its
   `.archive-root` marker (see `.env.example`)
4. Run `docker compose up --build`

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

## Tampermonkey userscript updates

The script installed into Tampermonkey (served publicly at
`/twitch-audio.user.js`) is a thin **loader**. On every Twitch page load it
downloads the actual audio/chat code from `/twitch-audio.payload.js` via
`GM_xmlhttpRequest` and executes it, keeping the last good copy in GM storage
as an offline fallback. Deploying the web app is therefore enough for every
viewer to run the newest code — no Tampermonkey update cycle involved. The
loader itself still carries `@updateURL`/`@downloadURL` with a per-deployment
version for the rare case the loader changes.

Install it once from **Admin → Twitch audio → Install / update script**. The
install link passes the panel's exact origin as a `?origin=` query parameter,
and nginx forwards `Host` with the port intact (`$http_host`), so the baked
server address matches what the browser can actually reach.

The public panel URL used for installation must remain reachable from the
browser where Twitch is watched. If the hostname or port changes, install the
script once again from the new address. If the script was ever pasted into
Tampermonkey by hand (before the install link existed), delete that old copy —
it has no update metadata and would keep running stale code.

Relevant docs:

- Twitch app registration: `https://dev.twitch.tv/docs/authentication/register-app`
- EventSub webhook secret requirements: `https://dev.twitch.tv/docs/eventsub/handling-webhook-events/`

## Current State

This is still an early scaffold, but channel management and recording can now run either with official Twitch API credentials or in a public `streamlink`-based fallback mode.
