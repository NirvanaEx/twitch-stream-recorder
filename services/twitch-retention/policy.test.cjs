const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { cutoffs, expiredKinds, planSession, inside, confirmedVideo } = require('./policy.cjs');
const policy = require('./policy.json');
const now = new Date('2026-09-23T16:00:00Z');
function session(overrides = {}) {
  return { id: 'test', status: 'completed', archiveStatus: 'stored', startedAt: '2026-09-20T12:00:00Z',
    telegramStatus: 'none', audioOnly: false, segments: [], telegramParts: [], ...overrides };
}
test('calendar window preserves all of yesterday in Tashkent, not just the last 48 hours', () => {
  assert.equal(cutoffs(now, policy).video.toISOString(), '2026-09-21T19:00:00.000Z');
  assert.deepEqual(expiredKinds(session({startedAt:'2026-09-21T19:00:00Z'}),now,policy),[]);
  assert.deepEqual(expiredKinds(session({startedAt:'2026-09-21T18:59:59Z'}),now,policy),['video']);
});
test('midnight rollover advances video cutoff by one day', () => {
  assert.equal(cutoffs(new Date('2026-09-23T19:00:00Z'),policy).video.toISOString(),'2026-09-22T19:00:00.000Z');
});
test('video expiry is independent of missing audio upload and requires explicit unbacked policy', () => {
  assert.deepEqual(expiredKinds(session(),now,policy),['video']);
  assert.deepEqual(expiredKinds(session(),now,{...policy,deleteUnbackedVideo:false}),[]);
});
test('recording, copying and currently uploading sessions are never touched', () => {
  for (const override of [{status:'recording'},{status:'processing'},{archiveStatus:'copying'},{telegramStatus:'uploading'}])
    assert.deepEqual(expiredKinds(session(override),now,policy),[]);
});
test('audio-only sessions younger than 30 days survive the video cutoff', () => {
  assert.deepEqual(expiredKinds(session({audioOnly:true}),now,policy),[]);
});
test('audio retention is 30 days independently of Telegram and the two-day video policy', () => {
  const old=session({audioOnly:true,startedAt:'2026-08-01T00:00:00Z'});
  assert.deepEqual(expiredKinds(old,now,policy),['audio']);
  assert.deepEqual(expiredKinds(old,now,{...policy,deleteUnbackedAudio:false}),[]);
  assert.deepEqual(expiredKinds({...old,telegramAudioMessageId:'1',telegramAudioFileId:'2'},now,policy),['audio']);
  assert.deepEqual(expiredKinds({...old,startedAt:'2026-08-24T16:00:01Z'},now,policy),[]);
});
test('Telegram confirmation requires all segments and valid part records', () => {
  const s=session({segmented:true,telegramStatus:'uploaded',segments:[{index:1,telegramStatus:'uploaded'},{index:2,telegramStatus:'uploaded'}],telegramParts:[{partIndex:1,messageId:'1',fileId:'a'}]});
  assert.equal(confirmedVideo(s),false);
  s.telegramParts.push({partIndex:2,messageId:'2',fileId:'b'});
  assert.equal(confirmedVideo(s),true);
});
test('planning removes only old video files and preserves audio, chat and recent media', async () => {
  const root=await fs.mkdtemp(path.join(__dirname,'.retention-test-'));
  try {
    const dir=path.join(root,'twitch','channel','2026-09','2026-09-20__test');await fs.mkdir(dir,{recursive:true});
    for(const file of ['video.mp4','part001.mp4','audio.m4a','chat.tsr.json','session.json','cover.jpg'])await fs.writeFile(path.join(dir,file),'content');
    const planned=await planSession(root,session({archiveDir:dir}),now,policy);
    assert.deepEqual(planned.map(x=>path.basename(x.path)).sort(),['part001.mp4','video.mp4']);
    assert.deepEqual(await planSession(root,session({archiveDir:dir,startedAt:'2026-09-22T00:00:00Z'}),now,policy),[]);
    await assert.rejects(planSession(root,session({archiveDir:path.dirname(root)}),now,policy),/escapes/);
  } finally {
    assert.ok(inside(__dirname,root));assert.ok(path.basename(root).startsWith('.retention-test-'));await fs.rm(root,{recursive:true});
  }
});
