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

## Why the pages used to sit there

The panel and the watch page are rendered in the browser, so every one of them
is a blank frame until its data arrives — and one request dwarfed all the
others. A three-hour broadcast is around 38 000 chat messages, and the replay
asks for all of them at once, because seeking anywhere has to land on the right
message. That response left the server as **16 MB of uncompressed JSON**: over
half of it the repeated field names of fields nobody had set.

Three changes, in the order they matter:

- **`gzip` in `infra/nginx/default.conf`.** Nothing was compressed before —
  nginx's `gzip_proxied` defaults to `off`, which means it never touches an
  upstream's response, and that is every response here. Video is excluded by
  type, so byte ranges are untouched.
- **The chat payload is sparse.** `chat/replay-message.utils.ts` omits any
  field with nothing to say, and the online endpoints leave out the wall-clock
  timestamp the players never read. The downloadable bundle keeps it — that
  file is meant to outlive this app.
- **The chat is cacheable.** It cannot change (the endpoint refuses anything
  whose video is not `ready`), so re-opening a recording reads it from disk.

16 MB → 7 MB → about 1.5 MB on the wire. Everything else that waits — the card
grid, the tables, the chat column — now draws a skeleton at the real geometry
instead of the word "Загрузка", so a wait reads as a wait rather than a hang.

## Chat and media clocks

New complete Twitch captures save HLS program timestamps in a small journal
beside the recording. Every 30 seconds, and after a source discontinuity, the
recorder fingerprints a short sequence of AAC packets. Once the MP4/M4A is
finished, those fingerprints are matched against its actual audio packets.
This locates the source clock in the file even after a TS join or timestamp
rebasing. Process exit time and download latency do not define this clock.

The verified mapping is stored in `StreamSession.mediaTimelineJson`, returned
with public/admin chat, and included in both the downloadable chat bundle and
archive metadata. Chat messages keep their original timestamps. Playback uses
the map with one second of media equal to one second of chat; missing video
causes a jump to the next available frame, where the intervening messages
become visible. Manual offsets remain optional corrections on top of the map.

After the final video part, **Continue chat** plays any remaining saved chat
on its own clock. It can be paused or advanced to the end; seeking/playing
the video resumes normal synchronization. This does not extend chat collection
indefinitely: capture still stops during recording finalization.

Online replay loads immutable cursor pages of 10,000 messages until the chat
is complete. The former 50,000-message cutoff silently hid the end of busy
broadcasts. Bundles also retain the full conversation, including those beyond
the former 100,000-message export limit. Rendering remains capped at 200
visible rows, independently of how much history the recording contains.

Message bodies recognize web links in replay, user history, and imported local
archives. HTTP(S) and bare domains open in a new tab; bare domains use HTTPS.
Links preserve the original text and coexist with platform emotes and mentions.
The shared renderer uses linkify-it with the TLD list, emits React anchors only
for HTTP(S), and keeps link clicks separate from chat actions.

Twitch GIF attachments are captured in `ChatMessage.gifsJson` as the original
IRC `gifs` tag and exposed in chat, user history, realtime messages and bundles.
The web player replaces the indicated code-point ranges with lazy-loaded GIF
images, while keeping the original full GIPHY URL and query parameters intact.
Clicking a GIF opens it in a new tab. Invalid metadata or a failed image leaves
the original text readable. Imported bundles can load only HTTPS GIPHY assets;
GIFs require internet access even during local replay (their bytes are not
embedded in the bundle). Older messages without GIF metadata remain text.

Existing archives, non-Twitch captures, opt-in live-segment recordings, and
captures whose map cannot be verified retain the legacy offset calculation.
Missing/ambiguous packet matches at a discontinuity or an interrupted journal
are not treated as a verified clock. Timing diagnostics must never stop video
capture. The adapter is tested with Streamlink 8.5.0, pinned in the API image.

Checks (no running application or database required):

```sh
npm test -w @tsr/api
npm test -w @tsr/web
python3 -m unittest discover -s apps/api/scripts -p test_capture_timing.py -v
```

The Python integration tests require Streamlink 8.5.0 and ffmpeg/ffprobe. They
exercise TS and fragmented MP4 capture, remuxing, and joining a recording with
twelve seconds of missing source media. Deploying later requires generating
the Prisma client and adding the nullable timeline and `gifsJson` columns through the existing
schema-sync deployment step; preparing/testing these changes does not run it.

## Spoiler-free mode

The eye toggle sits on both home pages — the public one and the panel's
dashboard — and in the player control bar.

It has two layers on purpose. **Settings → Запись и чат → "Режим без спойлеров
по умолчанию"** (`AppSettings.spoilerFreeDefault`, on out of the box) is what a
first visit, a fresh browser or an anonymous viewer gets; the public site reads
it from `GET /api/public/preferences`, which needs no login. Flipping the eye
writes an override for **that browser only** — turning it off to check the
length of one recording must not change what everyone else sees, and must not
need the settings permission. A browser that has never touched the eye keeps
following the server, so changing the default actually reaches people. If the
API cannot be reached the mode stays on: failing towards showing more than the
viewer asked for is the wrong way to fail.

A recording is watched to find out what happened, and the interface kept
answering that first: how long the broadcast ran, how big the file is, how far
along the progress bar sits, how many messages chat produced, where the
category changed. With the mode on, the position in the recording stays (plus
the real-world time of that moment) and none of the rest.

The timeline is the interesting part. It stops being a picture of the recording
and becomes a picture of *progress through it*: everything watched so far is
stretched across the bar — always filling it — and a fixed strip on the right
is fog. The scale shrinks as you watch, so the bar is ten minutes wide after
ten minutes and two hours wide after two hours, and neither says anything about
the end. Rewinding is exact. Dragging into the fog jumps forward blind, further
in meaning a bigger jump, and no frame preview is fetched there. `End` and the
`0`–`9` seek keys are off, because their whole premise is knowing where the end
is.

The geometry lives in `apps/web/app/lib/spoiler-timeline.ts`, as pure functions
with no player or DOM attached.

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

## Platforms

A channel carries the site it lives on, and everything downstream — capture,
chat, archive — follows from that one field.

| Platform | Channel looks like | Credentials | Chat |
| --- | --- | --- | --- |
| `twitch` | `twitch.tv/<login>` | optional (see below) | IRC |
| `kick` | `kick.com/<slug>` | optional | Pusher |
| `vkplay` | `live.vkvideo.ru/<name>` | none | Centrifuge pubsub |

VK Play Live (`live.vkvideo.ru`, formerly `vkplay.live`) needs no setup at all:
`api.live.vkvideo.ru` answers whether a channel is live, with what title,
category and viewer count, and hands out an anonymous websocket token for
chat. Its smiles arrive inside each message with their pictures, so unlike
Twitch and Kick there is no channel-wide emote set to snapshot.

Two things differ from Twitch there. It publishes no `audio_only` rendition,
so an audio-only capture takes the smallest video stream and the remux throws
the picture away — the same deal as Kick. And its qualities are named
`240p60 … 1440p60`, which is what a per-channel preferred quality has to say;
`best` always works.

VK Video proper (`vkvideo.ru`, `vk.com`) is a *different* platform and is not
supported: its listings redirect to `login.vk.ru`, so watching a channel there
would need a VK API token.

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
