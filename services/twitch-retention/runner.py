#!/usr/bin/env python3
"""Run the independent maintenance process using the existing API dependencies."""
import fcntl
import json
from pathlib import Path
import subprocess
import sys
import time

release = Path(__file__).resolve().parent
version = (release / 'VERSION').read_text().strip()
target = '/tmp/tsr-retention-' + version[:12]
lock = open('/run/lock/twitch-retention.lock', 'w')
try:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    print('Another retention pass is active; skipped.')
    raise SystemExit(0)
subprocess.run(['docker', 'exec', 'twitch-recorder-api', 'mkdir', '-p', target], check=True)
for name in ['worker.cjs', 'policy.cjs', 'policy.json']:
    subprocess.run(['docker', 'cp', str(release / name), 'twitch-recorder-api:' + target + '/' + name], check=True, stdout=subprocess.DEVNULL)
command = ['docker', 'exec', 'twitch-recorder-api', 'node', target + '/worker.cjs']
if '--apply' in sys.argv:
    command.append('--apply')
result = subprocess.run(command, text=True, capture_output=True, timeout=7200)
if result.stdout:
    report = json.loads(result.stdout)
    backup = Path('/srv/backup/twitch-retention')
    backup.mkdir(parents=True, exist_ok=True)
    filename = time.strftime('%Y%m%dT%H%M%SZ', time.gmtime()) + ('-apply' if '--apply' in sys.argv else '-plan') + '.json'
    (backup / filename).write_text(json.dumps(report, indent=2))
    summary = {k:v for k,v in report.items() if k != 'files'}
    if 'files' in report:
        summary['mediaKinds'] = {kind:sum(1 for f in report['files'] if f['kind']==kind) for kind in ['video','audio']}
    print(json.dumps(summary))
if result.stderr:
    print(result.stderr, file=sys.stderr)
raise SystemExit(result.returncode)
