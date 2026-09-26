const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateSegments, archiveDestination } = require('./segmented-audio.cjs');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const {processSession, probe} = require('./segmented-audio.cjs');
test('accepts ordered segments including short final part', () => {
  assert.equal(validateSegments([{index:1,startOffsetSec:0,durationSec:300},{index:2,startOffsetSec:300,durationSec:23}]),323);
});
test('rejects missing chunks and timeline gaps instead of publishing truncated audio', () => {
  assert.throws(() => validateSegments([]));
  assert.throws(() => validateSegments([{index:2,startOffsetSec:0,durationSec:300}]));
  assert.throws(() => validateSegments([{index:1,startOffsetSec:0,durationSec:300},{index:2,startOffsetSec:310,durationSec:23}]));
});
test('archive writes must stay within the configured archive root', () => {
  assert.equal(archiveDestination('/mnt/archive/channel/stream','/mnt/archive','gdrive:recorder'),'gdrive:recorder/channel/stream/audio.m4a');
  assert.throws(() => archiveDestination('/etc','/mnt/archive','gdrive:recorder'));
  assert.throws(() => archiveDestination('/mnt/archive-other','/mnt/archive','gdrive:recorder'));
});
test('real AAC extraction resumes after a missing part, verifies archive and publishes once', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-worker-test-'));
  const previous = {...process.env};
  try {
    const archive = path.join(temp,'archive');
    const dir = path.join(archive,'channel','session');
    const bin = path.join(temp,'bin');
    fs.mkdirSync(dir,{recursive:true}); fs.mkdirSync(bin);
    fs.writeFileSync(path.join(archive,'.archive-root'),'test');
    // A local archive double: extraction/concat/probing remain real ffmpeg.
    fs.writeFileSync(path.join(bin,'rclone'), `#!/usr/bin/env node
const fs=require('fs'),crypto=require('crypto');const a=process.argv.slice(2);
if(a[0]==='copyto')fs.copyFileSync(a[1],a[2]);
else console.log(JSON.stringify({Size:fs.statSync(a[1]).size,Hashes:{md5:crypto.createHash('md5').update(fs.readFileSync(a[1])).digest('hex')}}));
`,{mode:0o755});
    Object.assign(process.env,{ARCHIVE_DIR:archive,ARCHIVE_RCLONE_REMOTE:archive,DATA_DIR:temp,PATH:bin+':'+process.env.PATH});
    const first = path.join(dir,'part001.mp4'), second=path.join(dir,'part002.mp4');
    execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=440:duration=2','-c:a','aac',first]);
    const s={id:'testsession',archiveDir:dir,segments:[{index:1,startOffsetSec:0,durationSec:2,archivePath:first},{index:2,startOffsetSec:2,durationSec:2,archivePath:second}]};
    const writes=[]; const p={streamSession:{updateMany:async q=>{writes.push(q);return {count:1}}}};
    await assert.rejects(processSession(p,s),/No source for segment 2/);
    assert.equal(writes.length,0);
    const checkpoint=path.join(temp,'tmp','segmented-audio',s.id,'00001.m4a');
    assert.ok(fs.existsSync(checkpoint));
    fs.copyFileSync(first,second);
    fs.unlinkSync(first); // Success now requires reusing the first checkpoint.
    await processSession(p,s);
    assert.equal(writes.length,1);
    assert.equal(writes[0].where.audioDeletedAt,null);
    assert.equal(writes[0].where.audioPath,null);
    assert.ok(Math.abs(probe(writes[0].data.audioPath)-4)<0.2);
    assert.equal(fs.existsSync(checkpoint),false);
  } finally {
    process.env=previous;
    fs.rmSync(temp,{recursive:true,force:true});
  }
});
