#!/usr/bin/env python3
"""Deploy the standalone chat widget only; never rebuild or restart a recorder."""
import hashlib,json,pathlib,shutil,subprocess,urllib.request,time,fcntl
SOURCE=pathlib.Path(__file__).resolve().parents[2]
RUNTIME=pathlib.Path('/srv/apps/twitch-chat-client')
COMPOSE=pathlib.Path('/srv/apps/twitch-stream-recorder/docker-compose.yml')
def run(*args):
    p=subprocess.run(args,check=True,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    return p.stdout.strip()
def info(name): return json.loads(run('docker','inspect',name))[0]
def digest(data):return hashlib.sha256(data).hexdigest()
def signature(item):return [item['Id'],item['State']['Pid'],item['State']['StartedAt']]
def main():
    RUNTIME.mkdir(parents=True,exist_ok=True)
    with (RUNTIME/'deploy.lock').open('w') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        before={name:signature(info(name)) for name in ['twitch-recorder-api','twitch-recorder-postgres','twitch-recorder-redis','tsr-http-api-20260930t163141z','twitch-recorder-nginx']}
        web=info('twitch-recorder-web')
        if shutil.disk_usage('/').free<12*1024**3:raise RuntimeError('Insufficient build reserve')
        asset=SOURCE/'apps/web/public/twitch-chat.widget.js'
        checksum=digest(asset.read_bytes())
        stamp=time.strftime('%Y%m%dT%H%M%SZ',time.gmtime())
        release=RUNTIME/'releases'/(stamp+'-'+checksum[:12]);release.mkdir(parents=True)
        workdir=web['Config']['WorkingDir']
        assert workdir.endswith('/apps/web') and '\n' not in workdir
        base='tsr-web-chat-base:'+web['Image'].split(':')[-1][:12]
        run('docker','tag',web['Image'],base)
        image='tsr-web:chat-cache-'+checksum[:12]
        shutil.copyfile(asset,release/'twitch-chat.widget.js')
        (release/'Dockerfile').write_text('FROM '+base+'\nCOPY twitch-chat.widget.js '+workdir+'/public/twitch-chat.widget.js\n')
        run('docker','cp','twitch-recorder-web:'+workdir+'/public/twitch-chat.widget.js',str(release/'previous.widget.js'))
        (release/'before.json').write_text(json.dumps({'protected':before,'webImage':web['Image'],'webImageTag':web['Config']['Image']},indent=2))
        run('docker','build','--network=none','-t',image,str(release))
        override=release/'compose.web.yml'
        override.write_text('services:\n  web:\n    image: '+image+'\n')
        def switch(tag):
            override.write_text('services:\n  web:\n    image: '+tag+'\n')
            run('docker','compose','-p','twitch-stream-recorder','-f',str(COMPOSE),'-f',str(override),'up','-d','--no-deps','web')
        try:
            switch(image)
            for attempt in range(40):
                try:
                    fetched=run('docker','exec','twitch-recorder-web','node','-e',"fetch('http://127.0.0.1:3000/twitch-chat.widget.js').then(async r=>{if(!r.ok)throw Error(String(r.status));console.log(require('node:crypto').createHash('sha256').update(await r.text()).digest('hex'))}).catch(e=>{console.error(e.message);process.exit(1)})")
                    if fetched!=checksum:raise RuntimeError('Served widget hash mismatch')
                    break
                except Exception:
                    if attempt==39:raise
                    time.sleep(1)
            for name,expected in before.items(): assert signature(info(name))==expected,name+' unexpectedly changed'
        except Exception:
            switch(web['Image'])
            raise
        state={'release':str(release),'image':image,'widgetSha256':checksum,'previousImage':web['Image'],'protectedUnchanged':True,'sourceCommit':run('git','-C',str(SOURCE),'rev-parse','HEAD')}
        (RUNTIME/'current-release.json').write_text(json.dumps(state,indent=2))
        (release/'release.json').write_text(json.dumps(state,indent=2))
        print(json.dumps(state,indent=2),flush=True)
if __name__=='__main__':main()
