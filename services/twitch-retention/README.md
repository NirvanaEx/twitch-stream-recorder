# TSR: separate Drive retention

User policy approved 23 September 2026:

- Video: preserve today and yesterday by broadcast start date in Asia/Tashkent. Delete older video even without a Telegram backup, as explicitly requested.
- Audio: preserve 30 days from broadcast start, independently of video and Telegram upload. Files older than that expire under the requested audio retention policy.
- Never change Telegram messages. Keep replay chat, thumbnails and metadata. Skip active recordings, copies and uploads.

The old archive sweep deleted entire session folders and kept uploaded video indefinitely when standalone audio had not reached Telegram. This worker removes individual media files and updates segment paths so playback can fall back to Telegram. Audio younger than 30 days is never selected by video expiry.

Source: `/root/projects/twitch-retention`; bare: `/srv/git/twitch-retention.git`.
Runtime: `/srv/apps/twitch-retention/releases`; scheduler: `twitch-retention.timer`, every minute after the previous pass.
The maintenance process uses `docker exec` with the existing API's dependencies, database and mount. It does not restart API or recording processes, or bootstrap the application.

`git push srv main` prepares a release and runs a read-only plan. Inspect the plan and run `python3 /root/projects/twitch-retention/deploy.py --activate` to enable that exact release. The archive setting is 30 days for the legacy whole-folder/audio sweep; the independent video rule remains two calendar days. Keep this distinction in any future settings UI changes.

Tests: `node --test policy.test.cjs`. Plan manually: `python3 <release>/runner.py`. Apply manually: add `--apply`; a host lock prevents concurrent passes.

Reports: `/srv/backup/twitch-retention`; detailed pre-deletion manifests and progress are under `/srv/apps/twitch-stream-recorder/data/runtime/maintenance/retention-reports`. `latest.json` contains the last result.
Stop future cleanup with `systemctl stop twitch-retention.timer` (the active pass may still finish). Deletions already performed are permanent; the Drive mount uses `--drive-use-trash=false`. Telegram copies remain when they exist.

The main recorder source is behind its runtime; do not deploy that old checkout wholesale to change this policy.
