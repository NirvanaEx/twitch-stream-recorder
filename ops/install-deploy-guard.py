#!/usr/bin/env python3
"""Install the deployment guard and source pointers, preserving previous files."""
from pathlib import Path
import datetime as dt
import json
import shutil
import subprocess

source = Path(__file__).resolve().parents[1]
state = json.loads(Path('/srv/apps/twitch-http-api/current-release.json').read_text())
stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
backup = Path('/srv/backup/twitch-recorder-isolation') / stamp
backup.mkdir(parents=True, mode=0o700)
hook = Path('/srv/git/twitch-stream-recorder.git/hooks/post-receive')
shutil.copy2(hook, backup / 'post-receive')
shutil.copy2(source / 'ops/legacy-deploy-guard.sh', hook)
hook.chmod(0o755)
pointer = '''# Recorder/API separation (2026-09-26)

This legacy source is behind production. Its uncommitted changes are preserved.
Do not deploy it wholesale and do not use its old api+web deployment scripts.

For stream.neyron.site API changes read:
/root/projects/twitch-stream-recorder-current/AGENTS.md
/root/projects/twitch-stream-recorder-current/docs/OPERATIONS.md

The historical `twitch-recorder-api` container is the permanent recorder/media
owner. Never restart it to update the API/site. The independent HTTP API is
recorded in /srv/apps/twitch-http-api/current-release.json.
Deploy it with python3 /root/projects/twitch-stream-recorder-current/ops/deploy-api.py.
The old post-receive no longer deploys the monolith.
'''
for directory in ['/root/projects/twitch-stream-recorder', '/root/projects/twitch-stream-recorder-preview-preload-20260919']:
    target = Path(directory) / 'AGENTS.md'
    if not target.parent.exists(): continue
    if target.exists():
        shutil.copy2(target, backup / (target.parent.name + '-AGENTS.md'))
        if 'Recorder/API separation' not in target.read_text(): target.write_text(pointer + '\n' + target.read_text())
    else: target.write_text(pointer)
index = Path('/srv/README.md')
text = index.read_text()
if '## apps/twitch-http-api' not in text:
    shutil.copy2(index, backup / 'srv-README.md')
    index.write_text(text + '''

## apps/twitch-http-api — 2026-09-26

- stream.neyron.site now has an independent HTTP API. Source:
  `/root/projects/twitch-stream-recorder-current`; read AGENTS.md and docs/OPERATIONS.md.
- Live API state: `/srv/apps/twitch-http-api/current-release.json`; releases include tests,
  immutable source, Nginx before/after and capture continuity checks.
- API deploy: `python3 /root/projects/twitch-stream-recorder-current/ops/deploy-api.py`.
  Rollback: same with `--rollback`. No schema push or dependency restart.
- `twitch-recorder-api` retains its old name but is now the permanent recorder/media worker.
  Its PID, Streamlink, FFmpeg, chat and upload jobs survive API/web releases. Do not restart it.
- API role TSR_ROLE=api has no capture/recovery/upload timers and read-only media mounts.
  Recorder commands retain existing user authentication and are never retried automatically.
- Nginx `/api/` uses the versioned HTTP API; `/socket.io/` stays on the recorder. Preserve
  the existing tsr-sync routes. Retention/preview helpers retain the historical worker name.
- The old recorder bare repo post-receive is blocked to prevent accidental monolith deployment.
  Legacy source copies contain AGENTS.md pointers. No Git commits or pushes were performed.
- Credentials: `/root/.secrets/twitch-recorder-isolation/api.env` (0600), never print.
''')
print(json.dumps({'guardInstalled': str(hook), 'backup': str(backup), 'apiRelease': state['release']}))
