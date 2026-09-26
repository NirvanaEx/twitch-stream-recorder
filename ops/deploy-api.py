#!/usr/bin/env python3
"""Build/test/release HTTP API only. Existing recorder, web, DB and sync survive.

Run from the canonical source: python3 ops/deploy-api.py
Rollback: python3 ops/deploy-api.py --rollback
No git commit/push, schema sync, compose up/down, or recorder restart is used.
"""
import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time

SOURCE = Path(__file__).resolve().parents[1]
RUNTIME = Path('/srv/apps/twitch-http-api')
LEGACY = Path('/srv/apps/twitch-stream-recorder')
SECRETS = Path('/root/.secrets/twitch-recorder-isolation')
RECORDER = 'twitch-recorder-api'  # Stable owner; name retained to preserve all existing integrations.
NGINX = 'twitch-recorder-nginx'
NETWORK = 'twitch-stream-recorder_default'
STATE = RUNTIME / 'current-release.json'

def run(*args, input=None, quiet=False):
    result = subprocess.run(args, input=input, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        # Arguments can contain env-file names, but never secret values.
        raise RuntimeError(f'{args[0]} failed ({result.returncode}): {result.stderr[-4000:]} {result.stdout[-4000:]}')
    if not quiet and result.stdout:
        print(result.stdout[-2500:], flush=True)
    return result.stdout

def inspect(name):
    return json.loads(run('docker', 'inspect', name, quiet=True))[0]

def snapshot():
    container = inspect(RECORDER)
    rows = run('docker', 'top', RECORDER, '-eo', 'pid,ppid,comm', quiet=True).splitlines()[1:]
    processes = []
    for row in rows:
        pid, parent, command = row.split(None, 2)
        if command not in ('node', 'streamlink', 'ffmpeg', 'python3'): continue
        io = {}
        try:
            io = dict(line.split(': ', 1) for line in Path(f'/proc/{pid}/io').read_text().splitlines())
        except FileNotFoundError: pass
        processes.append({'pid': int(pid), 'parent': int(parent), 'command': command, 'writtenBytes': int(io.get('write_bytes', 0))})
    return {'at': dt.datetime.now(dt.timezone.utc).isoformat(), 'container': container['Id'],
            'pid': container['State']['Pid'], 'startedAt': container['State']['StartedAt'], 'processes': processes}

def install_nginx(config):
    run('docker', 'cp', str(config), f'{NGINX}:/etc/nginx/conf.d/default.conf', quiet=True)
    run('docker', 'exec', NGINX, 'nginx', '-t')
    run('docker', 'exec', NGINX, 'nginx', '-s', 'reload')

def health(name):
    script = 'fetch("http://127.0.0.1:3001/api/health",{signal:AbortSignal.timeout(6000)}).then(async r=>{if(!r.ok)throw Error(String(r.status));console.log(JSON.stringify(await r.json()))}).catch(e=>{console.error(e.message);process.exit(1)})'
    return json.loads(run('docker', 'exec', name, 'node', '-e', script, quiet=True))

def ensure_api(name):
    info = inspect(name)
    if info['Id'] == inspect(RECORDER)['Id'] or info['Config']['Labels'].get('tsr.role') != 'api':
        raise RuntimeError('Refusing to operate on a container that is not a managed HTTP API.')

def write_state(data):
    temp = STATE.with_suffix('.tmp')
    temp.write_text(json.dumps(data, indent=2) + '\n')
    temp.replace(STATE)

def rollback():
    state = json.loads(STATE.read_text())
    previous = state.get('previous')
    if previous:
        ensure_api(previous['container'])
        run('docker', 'start', previous['container'], quiet=True)
        for _ in range(30):
            try:
                if health(previous['container']).get('role') == 'api': break
            except Exception: pass
            time.sleep(1)
        else: raise RuntimeError('Previous HTTP API did not become healthy; routing untouched.')
    # Restore just this component's upstream, preserving later web/sync releases.
    saved = (Path(state['releaseDir']) / 'nginx-before.conf').read_text()
    upstream = re.search(r'set \$api_upstream http://[a-zA-Z0-9_.-]+:3001;', saved)
    if not upstream: raise RuntimeError('Saved API upstream is missing.')
    current_config = Path(state['releaseDir']) / 'nginx-before-rollback.conf'
    run('docker', 'cp', f'{NGINX}:/etc/nginx/conf.d/default.conf', str(current_config), quiet=True)
    config, count = re.subn(r'set \$api_upstream http://[a-zA-Z0-9_.-]+:3001;', lambda _: upstream.group(0), current_config.read_text())
    if count != 1: raise RuntimeError('Current API upstream is ambiguous.')
    rollback_config = Path(state['releaseDir']) / 'nginx-rollback.conf'
    rollback_config.write_text(config)
    try: install_nginx(rollback_config)
    except Exception:
        install_nginx(current_config)
        raise
    shutil.copy2(rollback_config, LEGACY / 'infra/nginx/default.conf')
    ensure_api(state['container'])
    run('docker', 'stop', '--time', '30', state['container'], quiet=True)
    if previous: write_state(previous)
    else:
        STATE.rename(RUNTIME / f'rolled-back-{state["release"]}.json')
    print('Rolled back API routing. Recorder was not restarted.', flush=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--rollback', action='store_true')
    args = parser.parse_args()
    RUNTIME.mkdir(parents=True, exist_ok=True)
    with (RUNTIME / 'deploy.lock').open('w') as lock, open('/tmp/twitch-stream-recorder-deploy.lock', 'a') as legacy_lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        fcntl.flock(legacy_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if args.rollback: return rollback()
        owner = inspect(RECORDER)
        if not owner['State']['Running']: raise RuntimeError('Recorder is not running. API deployment does not start it.')
        if health(RECORDER).get('role') == 'api': raise RuntimeError('Configured recorder points at an HTTP API.')
        before = snapshot()
        stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        release = f'{stamp}-{hashlib.sha256((SOURCE / "apps/api/src/main.ts").read_bytes()).hexdigest()[:8]}'
        directory = RUNTIME / 'releases' / release
        directory.mkdir(parents=True)
        (directory / 'recorder-before.json').write_text(json.dumps(before, indent=2))
        run('docker', 'cp', f'{NGINX}:/etc/nginx/conf.d/default.conf', str(directory / 'nginx-before.conf'), quiet=True)
        previous = json.loads(STATE.read_text()) if STATE.exists() else None
        original = (directory / 'nginx-before.conf').read_text()
        if 'BEGIN TSR BACKGROUND SYNC' not in original: raise RuntimeError('Expected sync routes are missing; inspect routing before deploy.')
        # Preserve the precise running dependency set and nullable DB columns.
        # Any package/schema change needs its own reviewed build/migration path.
        for local, remote in [('package.json', '/app/package.json'), ('prisma/schema.prisma', '/app/prisma/schema.prisma')]:
            live = run('docker', 'exec', RECORDER, 'cat', remote, quiet=True)
            if (SOURCE / 'apps/api' / local).read_text().replace('\r\n', '\n').strip() != live.strip():
                raise RuntimeError(f'{local} differs from running recorder. Resolve compatibility before deployment.')
        base = 'tsr-runtime-base:' + owner['Image'].split(':')[-1][:12]
        run('docker', 'image', 'tag', owner['Image'], base, quiet=True)
        api_source = SOURCE / 'apps/api'
        print('Compile and test using the exact running dependencies, without production network or data mounts.', flush=True)
        command = 'test -e node_modules || ln -s /app/node_modules node_modules; node /app/node_modules/typescript/bin/tsc -p tsconfig.json --incremental false && find dist -name "*.spec.js" -print0 | xargs -0 node --test --test-concurrency=1'
        report = run('docker', 'run', '--rm', '--network', 'none', '--memory', '768m', '--cpus', '1',
            '--entrypoint', 'sh', '-v', f'{api_source}:/work', '-w', '/work', base, '-c', command, quiet=True)
        (directory / 'tests.tap').write_text(report)
        print('\n'.join(report.splitlines()[-9:]), flush=True)
        context = directory / 'build'
        shutil.copytree(api_source / 'dist', context / 'dist')
        shutil.copy2(SOURCE / 'ops/Dockerfile.api', context / 'Dockerfile')
        image = 'twitch-http-api:' + release.lower()
        run('docker', 'build', '--network', 'none', '--build-arg', f'BASE_IMAGE={base}', '-t', image, str(context))
        # Immutable, secret-free source alongside every release for rollback/review.
        shutil.copytree(api_source / 'src', directory / 'source')
        shutil.copy2(SOURCE / 'ops/deploy-api.py', directory / 'deploy-api.py')
        SECRETS.mkdir(parents=True, exist_ok=True, mode=0o700)
        os.chmod(SECRETS, 0o700)
        env = dict(item.split('=', 1) for item in owner['Config']['Env'] if '=' in item)
        env.update(TSR_ROLE='api', TSR_RECORDER_URL=f'http://{RECORDER}:3001', TSR_RELEASE=release, PORT='3001', API_PORT='3001', NODE_ENV='production')
        env_file = SECRETS / 'api.env'
        fd = os.open(env_file, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, 'w') as handle:
            for key, value in env.items():
                if '\n' in value or '\r' in value: raise RuntimeError(f'Multiline environment field unsupported: {key}')
                handle.write(f'{key}={value}\n')
        name = 'tsr-http-api-' + stamp.lower()
        run('docker', 'run', '-d', '--name', name, '--network', NETWORK, '--restart', 'unless-stopped',
            '--label', 'tsr.role=api', '--label', f'tsr.release={release}', '--env-file', str(env_file),
            '--memory', '512m', '--cpus', '1', '--pids-limit', '128', '--cap-drop', 'ALL',
            '--security-opt', 'no-new-privileges', '--read-only', '--tmpfs', '/tmp:rw,nosuid,noexec,size=64m',
            '--log-opt', 'max-size=8m', '--log-opt', 'max-file=3',
            '--mount', f'type=bind,src={LEGACY}/data/runtime,dst=/data,readonly',
            '--mount', 'type=bind,src=/mnt,dst=/mnt,readonly,bind-propagation=rslave', image, quiet=True)
        switched = False
        config_installed = False
        try:
            for _ in range(30):
                try:
                    ready = health(name)
                    if ready.get('role') == 'api' and ready.get('backgroundJobs') is False and ready.get('recorder', {}).get('reachable'): break
                except Exception: pass
                time.sleep(1)
            else: raise RuntimeError('Candidate API did not pass role/recorder health checks.')
            candidate, count = re.subn(r'set \$api_upstream http://[a-zA-Z0-9_.-]+:3001;', f'set $api_upstream http://{name}:3001;', original)
            if count != 1: raise RuntimeError('Expected exactly one HTTP API upstream.')
            (directory / 'nginx-after.conf').write_text(candidate)
            config_installed = True
            install_nginx(directory / 'nginx-after.conf')
            switched = True
            # Nginx starts replacement workers asynchronously after SIGHUP;
            # a request in that interval can still hit the old configuration.
            for _ in range(15):
                live = json.loads(run('curl', '-fsS', '--max-time', '10', 'http://127.0.0.1:9000/api/health', quiet=True))
                if live.get('release') == release: break
                time.sleep(1)
            else: raise RuntimeError('Nginx did not switch to the candidate release.')
            after = snapshot()
            (directory / 'recorder-after.json').write_text(json.dumps(after, indent=2))
            if before['container'] != after['container'] or before['pid'] != after['pid'] or before['startedAt'] != after['startedAt']:
                raise RuntimeError('Recorder identity changed during deployment.')
            shutil.copy2(directory / 'nginx-after.conf', LEGACY / 'infra/nginx/default.conf')
            state = {'release': release, 'releaseDir': str(directory), 'image': image, 'container': name,
                     'recorder': RECORDER, 'recorderId': after['container'], 'recorderStartedAt': after['startedAt'], 'previous': previous}
            write_state(state)
            (directory / 'health.json').write_text(json.dumps(live, indent=2))
            print(json.dumps({'release': release, 'api': name, 'recorderPidUnchanged': after['pid'], 'recorderProcessesBefore': before['processes'], 'recorderProcessesAfter': after['processes']}, indent=2), flush=True)
        except Exception:
            if config_installed:
                install_nginx(directory / 'nginx-before.conf')
                shutil.copy2(directory / 'nginx-before.conf', LEGACY / 'infra/nginx/default.conf')
            ensure_api(name)
            run('docker', 'stop', '--time', '15', name, quiet=True)
            raise
        if switched and previous:
            ensure_api(previous['container'])
            run('docker', 'stop', '--time', '30', previous['container'], quiet=True)
        print('API deployed. Recorder, web, database, WebSockets and sync were not restarted.', flush=True)

if __name__ == '__main__': main()
