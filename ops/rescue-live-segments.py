#!/usr/bin/env python3
import subprocess,json,pathlib,hashlib,os,datetime
RUNTIME=pathlib.Path('/srv/apps/twitch-stream-recorder/data/runtime').resolve()
SESSION='cmtyz1dss0001qs018z4glq31'
REPORT=pathlib.Path('/root/.secrets/stream-live-offload-20260913/segment-rescue.jsonl')
def node(js):
 r=subprocess.run(['docker','exec','-i','twitch-recorder-api','node'],input="const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{"+js+"})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>p.$disconnect());",text=True,capture_output=True,check=True)
 return json.loads(r.stdout)
segments=node("const path=require('./dist/modules/archive-storage/archive-paths');const s=await p.streamSession.findUniqueOrThrow({where:{id:"+json.dumps(SESSION)+"},include:{channel:true}});const dir=s.archiveDir??path.buildSessionDir(path.archiveRoot(),{platform:s.channel.platform,channelLogin:s.channel.twitchLogin,startedAt:s.startedAt??s.createdAt,title:s.title,sessionId:s.id});if(!s.archiveDir)await p.streamSession.update({where:{id:s.id},data:{archiveDir:dir}});const parts=await p.recordingSegment.findMany({where:{streamSessionId:s.id,localPath:{not:null},archivePath:null},orderBy:{index:'asc'}});console.log(JSON.stringify(parts.map(x=>({id:x.id,index:x.index,localPath:x.localPath,sizeBytes:x.sizeBytes,dir}))));")
for seg in segments:
 local=RUNTIME/seg['localPath'].removeprefix('/data/')
 assert local.resolve().is_relative_to(RUNTIME/'records') and local.suffix=='.mp4'
 if not local.exists(): continue
 size=local.stat().st_size
 assert size>0 and size==int(seg['sizeBytes'])
 archive=pathlib.PurePosixPath(seg['dir'])/('part%03d.mp4'%seg['index'])
 rel=archive.relative_to('/mnt/gdrive/twitch-recorder')
 remote='gdrive:twitch-recorder/'+str(rel)
 print('Uploading live part',seg['index'],size,flush=True)
 subprocess.run(['rclone','copyto','--drive-chunk-size','32M','--stats','0',str(local),remote],check=True)
 info=json.loads(subprocess.run(['rclone','lsjson',remote,'--stat','--hash'],text=True,capture_output=True,check=True).stdout)
 with local.open('rb') as f:
  h=hashlib.md5()
  for b in iter(lambda:f.read(8*1024*1024),b''):h.update(b)
 assert info['Size']==size and info['Hashes']['md5']==h.hexdigest(),'Drive verification failed'
 payload=json.dumps({'id':seg['id'],'local':seg['localPath'],'archive':str(archive)})
 result=node('const x='+payload+';const r=await p.recordingSegment.updateMany({where:{id:x.id,localPath:x.local,archivePath:null},data:{archivePath:x.archive,localPath:null}});console.log(JSON.stringify(r));')
 if result['count']==1:
  assert local.stat().st_size==size
  local.unlink()
  row={'time':datetime.datetime.now(datetime.timezone.utc).isoformat(),'id':seg['id'],'index':seg['index'],'bytes':size,'md5':h.hexdigest(),'archivePath':str(archive),'localDeleted':True}
  with REPORT.open('a') as f:f.write(json.dumps(row)+'\n')
  print('Verified on Drive and removed locally:',seg['index'],size,flush=True)
 else:print('Segment changed concurrently; local file kept',flush=True)
