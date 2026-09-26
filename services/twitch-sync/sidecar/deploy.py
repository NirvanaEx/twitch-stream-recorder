#!/usr/bin/env python3
"""Deploy only the isolated sync service; never restart the recorder API."""
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import tarfile
import time
import urllib.request

SOURCE = Path('/root/projects/twitch-sync')
RUNTIME = Path('/srv/apps/twitch-sync')
BACKUP = Path('/srv/backup/twitch-sync') / time.strftime('%Y%m%dT%H%M%SZ', time.gmtime())
NGINX_SOURCE = Path('/srv/apps/twitch-stream-recorder/infra/nginx/default.conf')
API = 'twitch-recorder-api'
NGINX = 'twitch-recorder-nginx'

def run(*args, **kwargs):
    return subprocess.run(args, check=True, text=True, **kwargs)

def output(*args):
    return subprocess.check_output(args, text=True).strip()

def inspect(name):
    return json.loads(output('docker', 'inspect', name))[0]

def digest(data):
    return hashlib.sha256(data).hexdigest()

before = inspect(API)
version = output('git', '-C', str(SOURCE), 'rev-parse', 'HEAD')
if output('git', '-C', str(SOURCE), 'status', '--porcelain'):
    raise RuntimeError('Commit source changes before deployment')
release = RUNTIME / 'releases' / version[:12]
release.mkdir(parents=True, exist_ok=True)
BACKUP.mkdir(parents=True, exist_ok=False)
archive = subprocess.check_output(['git', '-C', str(SOURCE), 'archive', 'HEAD'])
with tarfile.open(fileobj=io.BytesIO(archive)) as bundle:
    bundle.extractall(release)

old_conf = subprocess.check_output(['docker', 'exec', NGINX, 'cat', '/etc/nginx/conf.d/default.conf'])
(BACKUP / 'nginx-default.conf').write_bytes(old_conf)
(BACKUP / 'api-before.json').write_text(json.dumps({
    'id': before['Id'], 'pid': before['State']['Pid'], 'startedAt': before['State']['StartedAt']
}, indent=2))
if NGINX_SOURCE.read_bytes() != old_conf:
    raise RuntimeError('Nginx runtime differs from its deployed source; inspect before changing')

begin, end = '  # BEGIN TSR BACKGROUND SYNC', '  # END TSR BACKGROUND SYNC'
block = '''  # BEGIN TSR BACKGROUND SYNC
  location = /twitch-audio.payload.js {
    set $sync_upstream http://tsr-sync:3002;
    proxy_pass $sync_upstream;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_connect_timeout 5s;
    proxy_read_timeout 75s;
  }
  location ~ ^/api/public/streams/[a-zA-Z0-9_-]+/audio-sync$ {
    set $sync_upstream http://tsr-sync:3002;
    proxy_pass $sync_upstream;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_connect_timeout 5s;
    proxy_read_timeout 75s;
    proxy_buffering off;
  }
  # END TSR BACKGROUND SYNC

'''
text = old_conf.decode()
if begin in text:
    start = text.index(begin)
    finish = text.index(end, start) + len(end)
    text = text[:start] + text[finish:].lstrip('\n')
marker = '  location /api/ {'
if text.count(marker) != 1:
    raise RuntimeError('Unexpected Nginx configuration')
new_conf = text.replace(marker, block + marker).encode()
config = release / 'sidecar' / 'nginx-default.conf'
config.write_bytes(new_conf)

# Reuse the exact running runtime for FFmpeg and Prisma. No npm install,
# schema migration, application bootstrap or recorder process is involved.
run('docker', 'tag', before['Image'], 'tsr-sync-base:20260923')
image = 'twitch-sync:' + version[:12]
run('docker', 'build', '--network=none', '-t', image, str(release / 'sidecar'))

secrets = Path('/root/.secrets/twitch-sync')
secrets.mkdir(mode=0o700, parents=True, exist_ok=True)
environment = dict(row.split('=', 1) for row in before['Config']['Env'] if '=' in row)
env_file = secrets / 'runtime.env'
db = environment['DATABASE_URL']
if '\n' in db or '\r' in db:
    raise RuntimeError('Unexpected database URL')
env_file.write_text('DATABASE_URL=' + db + '\n')
env_file.chmod(0o600)
existing = subprocess.run(['docker', 'inspect', 'tsr-sync'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
if existing.returncode == 0:
    previous = inspect('tsr-sync')
    (BACKUP / 'previous-sync-image.txt').write_text(previous['Config']['Image'])
    run('docker', 'rm', '-f', 'tsr-sync')
run('docker', 'run', '-d', '--name', 'tsr-sync', '--restart', 'unless-stopped',
    '--network', 'twitch-stream-recorder_default', '--network-alias', 'tsr-sync',
    '-p', '127.0.0.1:18769:3002', '--env-file', str(env_file),
    '-e', 'TSR_SYNC_VERSION=' + version[:12], '-e', 'NODE_OPTIONS=--max-old-space-size=128',
    '--cpus', '1', '--cpu-shares', '128', '--memory', '384m', '--pids-limit', '96',
    '--read-only', '--tmpfs', '/tmp:rw,nosuid,size=64m',
    '--log-opt', 'max-size=5m', '--log-opt', 'max-file=2', image)
for attempt in range(30):
    try:
        with urllib.request.urlopen('http://127.0.0.1:18769/health', timeout=2) as response:
            assert json.load(response)['ok']
        break
    except Exception:
        time.sleep(1)
else:
    raise RuntimeError('Sync health check failed; existing routes were not changed')

# Verify the precise served artifact before switching any traffic.
with urllib.request.urlopen('http://127.0.0.1:18769/twitch-audio.payload.js', timeout=5) as response:
    actual_payload = response.read()
expected = (release / 'sidecar/dist/twitch-audio.payload.js').read_bytes()
assert digest(actual_payload) == digest(expected)
with urllib.request.urlopen('http://127.0.0.1:18769/twitch-audio.payload.js?origin=http%3A%2F%2F193.160.119.15%3A9000', timeout=5) as response:
    legacy_payload = response.read()
expected_legacy = (release / 'sidecar/dist/twitch-audio.legacy.payload.js').read_bytes()
assert digest(legacy_payload) == digest(expected_legacy)
assert b"var SERVER = 'http://193.160.119.15:9000';" in legacy_payload

run('docker', 'cp', str(config), NGINX + ':/etc/nginx/conf.d/default.conf')
try:
    run('docker', 'exec', NGINX, 'nginx', '-t')
    run('docker', 'exec', NGINX, 'nginx', '-s', 'reload')
except Exception:
    run('docker', 'cp', str(BACKUP / 'nginx-default.conf'), NGINX + ':/etc/nginx/conf.d/default.conf')
    run('docker', 'exec', NGINX, 'nginx', '-t')
    run('docker', 'exec', NGINX, 'nginx', '-s', 'reload')
    raise

# Install the source-derived proxy artifact for subsequent compose builds.
# The running Nginx container retains the same ID; reload drains old workers.
NGINX_SOURCE.write_bytes(new_conf)
after = inspect(API)
assert (before['Id'], before['State']['Pid'], before['State']['StartedAt']) == (
    after['Id'], after['State']['Pid'], after['State']['StartedAt'])
report = {'version': version, 'image': image, 'payloadSha256': digest(expected),
    'apiId': after['Id'], 'apiPid': after['State']['Pid'], 'apiStartedAt': after['State']['StartedAt'],
    'backup': str(BACKUP), 'release': str(release)}
(RUNTIME / 'current-release.json').write_text(json.dumps(report, indent=2))
(BACKUP / 'release.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
