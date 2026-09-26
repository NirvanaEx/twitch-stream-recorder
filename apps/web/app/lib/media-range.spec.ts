import assert from 'node:assert/strict';
import test from 'node:test';
import { createMediaRangeReader, fetchMediaRange, mediaBufferAhead, MEDIA_RANGE_BYTES as B } from './media-range';

test('downloads adjacent blocks concurrently and consumes them in file order', async () => {
  const requested: number[] = [];
  const replies = new Map<number, (res: Response) => void>();
  const total = B + 16;
  const fetcher: typeof fetch = async (_src, options) => {
    const offset = Number(new Headers(options?.headers).get('Range')!.match(/bytes=(\d+)/)![1]);
    requested.push(offset);
    return new Promise(resolve => replies.set(offset, resolve));
  };
  const reader = createMediaRangeReader('/video', total, new AbortController().signal, fetcher);
  try {
    const first = reader.read(0);
    assert.deepEqual(requested, [0, B], 'next block must start before the first response completes');
    replies.get(B)!(new Response(new Uint8Array(16), {status:206,headers:{'Content-Range':`bytes ${B}-${total-1}/${total}`}}));
    replies.get(0)!(new Response(new Uint8Array(B), {status:206,headers:{'Content-Range':`bytes 0-${B-1}/${total}`}}));
    assert.equal((await first).data.fileStart, 0);
    const last = await reader.read(B);
    assert.equal(last.data.fileStart, B);
    assert.equal(last.data.byteLength, 16);
    assert.deepEqual(requested, [0, B], 'prefetched final block must not be downloaded again');
  } finally { reader.dispose(); }
});

test('seeking/disposal cancels both current and prefetched requests', async () => {
  const signals: AbortSignal[] = [];
  const fetcher: typeof fetch = async (_src, options) => {
    const signal = options!.signal!; signals.push(signal);
    return new Promise((_resolve, reject) => signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}));
  };
  const controller = new AbortController();
  const reader = createMediaRangeReader('/video', B*3, controller.signal, fetcher);
  const first = reader.read(0);
  controller.abort();
  await assert.rejects(first, {name:'AbortError'});
  assert.equal(signals.length, 2);
  assert.ok(signals.every(s=>s.aborted));
  reader.dispose();
  await assert.rejects(reader.read(B), {name:'AbortError'});
});

test('refuses wrong offsets and truncated range responses', async () => {
  const signal = new AbortController().signal;
  await assert.rejects(fetchMediaRange('/video',0,8,signal,async()=>new Response(new Uint8Array(8),{status:206,headers:{'Content-Range':'bytes 1-8/100'}})),/Invalid media range/);
  await assert.rejects(fetchMediaRange('/video',0,8,signal,async()=>new Response(new Uint8Array(4),{status:206,headers:{'Content-Range':'bytes 0-7/100'}})),/Truncated media range/);
});

test('reserves equal wall-clock playback at 1x, 1.5x and 2x without unbounded buffering', () => {
  assert.equal(mediaBufferAhead(1),45);
  assert.equal(mediaBufferAhead(1.5),67.5);
  assert.equal(mediaBufferAhead(2),90);
  assert.equal(mediaBufferAhead(16),90);
  assert.equal(mediaBufferAhead(NaN),45);
});
