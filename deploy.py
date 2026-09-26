#!/usr/bin/env python3
import io
import json
from pathlib import Path
import subprocess
import sys
import tarfile

source = Path('/root/projects/twitch-retention')
runtime = Path('/srv/apps/twitch-retention')
def run(*args, **kw): return subprocess.run(args, check=True, text=True, **kw)
def output(*args): return subprocess.check_output(args, text=True).strip()
version = output('git', '-C', str(source), 'rev-parse', 'HEAD')
if output('git', '-C', str(source), 'status', '--porcelain'):
    raise RuntimeError('Commit changes before deployment')
release = runtime / 'releases' / version[:12]
release.mkdir(parents=True, exist_ok=True)
archive = subprocess.check_output(['git', '-C', str(source), 'archive', 'HEAD'])
with tarfile.open(fileobj=io.BytesIO(archive)) as bundle:
    bundle.extractall(release)
(release / 'VERSION').write_text(version)
if '--activate' not in sys.argv:
    run('python3', str(release / 'runner.py'))
    print('Prepared and checked; no deletion or settings change yet.')
    raise SystemExit(0)

# The video worker and its tests are already deployed. Protect 30-day audio
# from the legacy whole-folder sweep; this is NOT the video retention rule.
script = r'''
const {PrismaClient}=require('/app/node_modules/@prisma/client');
const fs=require('node:fs');const p=new PrismaClient();
(async()=>{const before=await p.appSettings.findUnique({where:{id:'default'},select:{archiveKeepDays:true,videoKeepLocalDays:true,audioKeepLocalDays:true,updatedAt:true}});
const dir='/data/maintenance/retention-reports';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(dir+'/settings-before-'+Date.now()+'.json',JSON.stringify({before,policy:'Video=today+yesterday Asia/Tashkent; audio=30 days'},null,2),{flag:'wx'});
await p.appSettings.update({where:{id:'default'},data:{archiveKeepDays:30}});
console.log(JSON.stringify({before,archiveKeepDays:30,videoCalendarDays:2}));})().finally(()=>p.$disconnect());
'''
run('docker', 'exec', '-i', 'twitch-recorder-api', 'node', '-', input=script)
service = '''[Unit]
Description=TSR separate video and audio retention
After=docker.service gdrive.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/bin/python3 %s/runner.py --apply
TimeoutStartSec=2h
''' % release
timer = '''[Unit]
Description=Check TSR retention every minute

[Timer]
OnBootSec=60
OnUnitInactiveSec=60
AccuracySec=5
Unit=twitch-retention.service

[Install]
WantedBy=timers.target
'''
Path('/etc/systemd/system/twitch-retention.service').write_text(service)
Path('/etc/systemd/system/twitch-retention.timer').write_text(timer)
run('systemctl', 'daemon-reload')
run('systemctl', 'enable', '--now', 'twitch-retention.timer')
run('systemctl', 'start', '--no-block', 'twitch-retention.service')
(runtime / 'current-release.json').write_text(json.dumps({'version':version,'release':str(release),'videoCalendarDays':2,'audioDays':30,'timeZone':'Asia/Tashkent'},indent=2))
print('Separate retention enabled; recorder API was not restarted.')
