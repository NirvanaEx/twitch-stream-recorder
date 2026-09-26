#!/usr/bin/env bash
set -eu
cat >/dev/null
printf '%s\n' \
  'Automatic deployment of the old monolith is disabled: it would interrupt active recordings.' \
  'HTTP API source: /root/projects/twitch-stream-recorder-current' \
  'Deploy API: python3 /root/projects/twitch-stream-recorder-current/ops/deploy-api.py' \
  'Recorder maintenance is separate. Read AGENTS.md and docs/OPERATIONS.md in that source.' >&2
exit 1
