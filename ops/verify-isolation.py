#!/usr/bin/env python3
"""Restart ONLY the separated HTTP API and verify recording identity/progress.

Uses a short-lived owner token internally for authenticated, read-only checks;
the token, user information and environment are never printed or saved.
"""
import importlib.util
import json
from pathlib import Path
import subprocess
import time

spec = importlib.util.spec_from_file_location('deploy', Path(__file__).with_name('deploy-api.py'))
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)

READ = r'''
const {PrismaClient}=require('@prisma/client');
const {JwtService}=require('@nestjs/jwt');
const p=new PrismaClient();
(async()=>{
  const user=await p.user.findFirst({where:{isSuperadmin:true},select:{id:true,username:true}});
  if(!user) throw Error('Missing existing owner account');
  const token=new JwtService({secret:process.env.JWT_SECRET || 'dev-secret-change-me'}).sign({sub:user.id,username:user.username},{expiresIn:60});
  const root=process.argv[2];
  const active=await fetch(root+'/api/recording/active',{headers:{Authorization:'Bearer '+token}});
  if(!active.ok) throw Error('Authenticated status failed: '+active.status);
  const body=await active.json();
  const unauthorized=await fetch(root+'/api/channels/nonexistent-isolation-check/start',{method:'POST'});
  if(unauthorized.status!==401) throw Error('Unauthenticated command must be denied');
  // A guaranteed nonexistent channel exercises authorized command forwarding
  // and validation without starting/stopping any real capture.
  const absent=await p.channel.findUnique({where:{id:'nonexistent-isolation-check'},select:{id:true}});
  if(absent) throw Error('Unexpected verification ID collision');
  const command=await fetch(root+'/api/channels/nonexistent-isolation-check/start',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}'});
  if(command.status!==404) throw Error('Authenticated command routing failed: '+command.status+' '+await command.text());
  const sessions=await p.streamSession.findMany({where:{status:'recording'},select:{id:true,channel:{select:{twitchLogin:true}}}});
  const result=[];
  for(const s of sessions){
    const last=await p.chatMessage.findFirst({where:{streamSessionId:s.id},orderBy:{relativeTimeSec:'desc'},select:{id:true,messageTimestamp:true}});
    const count=await p.chatMessage.count({where:{streamSessionId:s.id}});
    result.push({id:s.id,channel:s.channel.twitchLogin,chatMessages:count,lastChat:last});
  }
  console.log(JSON.stringify({sessions:result,apiSessionIds:body.items.map(x=>x.id),unauthorized:unauthorized.status,authorizedMissingChannel:command.status}));
})().finally(()=>p.$disconnect()).catch(e=>{console.error(e.message);process.exit(1)});
'''

def read_state(api):
    output = deploy.run('docker', 'exec', '-i', deploy.RECORDER, 'node', '-', f'http://{api}:3001', input=READ, quiet=True)
    return json.loads(output)

state = json.loads(deploy.STATE.read_text())
api = state['container']
deploy.ensure_api(api)
before = {'recorder': deploy.snapshot(), 'state': read_state(api), 'api': deploy.inspect(api)['State']['StartedAt']}
deploy.run('docker', 'restart', '--time', '20', api, quiet=True)
for _ in range(30):
    try:
        health = deploy.health(api)
        if health.get('role') == 'api' and health.get('recorder', {}).get('reachable'): break
    except Exception: pass
    time.sleep(1)
else: raise RuntimeError('API did not return healthy after restart')
time.sleep(10)
after = {'recorder': deploy.snapshot(), 'state': read_state(api), 'api': deploy.inspect(api)['State']['StartedAt']}
assert before['api'] != after['api'], 'API was not actually restarted'
assert before['recorder']['container'] == after['recorder']['container']
assert before['recorder']['pid'] == after['recorder']['pid']
assert before['recorder']['startedAt'] == after['recorder']['startedAt']
old_sessions = {x['id'] for x in before['state']['sessions']}
new_sessions = {x['id'] for x in after['state']['sessions']}
assert old_sessions == new_sessions, 'Session changed; inspect whether the broadcast ended naturally'
assert set(after['state']['apiSessionIds']) == new_sessions
old_processes = {x['pid']: x for x in before['recorder']['processes']}
new_processes = {x['pid']: x for x in after['recorder']['processes']}
assert set(old_processes) == set(new_processes), 'Capture process changed during restart'
progress = [pid for pid, row in new_processes.items() if row['writtenBytes'] > old_processes[pid]['writtenBytes'] and row['command'] in ('ffmpeg', 'streamlink', 'python3')]
if old_sessions: assert progress, 'No capture write progress observed'
report = {'passed': True, 'before': before, 'after': after, 'captureProcessesWriting': progress}
(Path(state['releaseDir']) / 'restart-verification.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
