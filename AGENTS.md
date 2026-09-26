# Recorder/API separation (2026-09-26)

This legacy source is behind production. Its uncommitted changes are preserved.
Do not deploy it wholesale and do not use its old api+web deployment scripts.

For stream.neyron.site API changes read:
/root/projects/twitch-stream-recorder-isolation/AGENTS.md
/root/projects/twitch-stream-recorder-isolation/docs/OPERATIONS.md

The historical `twitch-recorder-api` container is the permanent recorder/media
owner. Never restart it to update the API/site. The independent HTTP API is
recorded in /srv/apps/twitch-http-api/current-release.json.
Deploy it with python3 /root/projects/twitch-stream-recorder-isolation/ops/deploy-api.py.
The old post-receive no longer deploys the monolith.
