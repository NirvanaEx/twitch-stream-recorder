import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCachedReplay } from './replay-cache';

test('replay cache shares requests, isolates origins and finalization, expires live data and retries failures', async (context) => {
  let now = 100000;
  context.mock.method(Date, 'now', () => now);
  const data = { messages: [{id:'one',authorLogin:'a',textRaw:'hello',relativeTimeSec:0}], emotes: null };
  let loads = 0;
  const load = async () => { loads++; return data; };
  const [a,b] = await Promise.all([loadCachedReplay('origin:s:end:v1',true,load),loadCachedReplay('origin:s:end:v1',true,load)]);
  assert.equal(loads,1); assert.equal(a,b);
  await loadCachedReplay('origin:s:end:v1',true,load); assert.equal(loads,1);
  await loadCachedReplay('other:s:end:v1',true,load); assert.equal(loads,2);
  await loadCachedReplay('origin:s:new-end:v1',true,load); assert.equal(loads,3);
  now += 86400001;
  const stale = await loadCachedReplay('origin:s:end:v1',true,async () => {throw Error('offline');});
  assert.equal(stale,data);
  let errors = 0;
  for (let i=0;i<2;i++) await loadCachedReplay('broken',true,async () => {errors++;throw Error('network');}).catch(()=>{});
  assert.equal(errors,2);
  let active=0;
  await loadCachedReplay('live',false,async()=>{active++;return data;}); now+=15001;
  await loadCachedReplay('live',false,async()=>{active++;return data;}); assert.equal(active,2);
  for (let i=0;i<9;i++) await loadCachedReplay('bounded:'+i,true,load);
  const before=loads;
  await loadCachedReplay('bounded:8',true,load); assert.equal(loads,before,'Newest entry survives the memory bound');
  await loadCachedReplay('bounded:0',true,load); assert.equal(loads,before+1,'Oldest entry is evicted');
});
