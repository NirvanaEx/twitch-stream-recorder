/* Scheduled separately from capture: one ffmpeg, one decoder thread, resumable
 * per-part output. No full-video copy and no work triggered by hover requests. */
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { createHash } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const { ensureSprites } = require('./timeline-sprites.cjs');
const root = path.resolve(process.env.DATA_DIR || '/data', 'timeline-previews');
const origin = process.env.PREVIEW_API_ORIGIN || 'http://127.0.0.1:3001';
const cutoff = '2026-09-15T00:00:00.000Z';
const interval = 10;
const db = new PrismaClient();
const log = (...args) => console.log(new Date().toISOString(), ...args);
async function json(url) {
  const response = await fetch(new URL(url, origin), { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
async function read(file) { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; } }
async function accessible(file) { if (!file) return false; try { await fs.access(file); return true; } catch { return false; } }
async function atomic(file, data) { await fs.writeFile(file + '.tmp', JSON.stringify(data)); await fs.rename(file + '.tmp', file); }
const frame = (index) => `preview-${String(index + 1).padStart(6, '0')}.jpg`;
function extract(source, seek, count, start, directory) {
  return new Promise((resolve, reject) => {
    const child = spawn('nice', ['-n', '15', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
      '-threads', '1', '-skip_frame', 'nokey', '-ss', String(seek), '-i', source,
      '-an', '-sn', '-dn', '-vf', `fps=1/${interval}:start_time=0,scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2`,
      '-frames:v', String(count), '-threads', '1', '-filter_threads', '1', '-q:v', '5',
      '-start_number', String(start + 1), path.join(directory, 'preview-%06d.jpg')],
      { stdio: ['ignore', 'ignore', 'pipe'] });
    let errors = '';
    child.stderr.on('data', chunk => { errors = (errors + chunk).slice(-3000); });
    const timer = setTimeout(() => child.kill('SIGKILL'), 20 * 60 * 1000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}: ${errors}`)); });
    const stop = () => child.kill('SIGTERM');
    process.once('SIGTERM', stop);
    child.once('close', () => process.removeListener('SIGTERM', stop));
  });
}
async function generate(id) {
  if (!/^[a-z0-9]{20,32}$/.test(id)) return;
  const { item } = await json(`/api/public/streams/${id}`);
  if (item.audioOnly || !(item.durationSec > 0)) return;
  // Do not freeze a bundle while another continuation is still recording.
  const session = await db.streamSession.findUnique({ where: { id } });
  if (!session || session.status === 'recording') return;
  if (session.twitchStreamId && await db.streamSession.count({ where: {
    channelId: session.channelId, twitchStreamId: session.twitchStreamId, status: 'recording',
  } })) return;
  const parts = item.parts?.length ? item.parts : [{ startOffsetSec: 0, durationSec: item.durationSec, streamUrl: item.videoUrl }];
  const count = Math.ceil(item.durationSec / interval);
  if (count > 20000) throw new Error(`${id}: exceeds 20000-frame budget`);
  const signature = createHash('sha256').update(JSON.stringify([item.durationSec,
    parts.map(p => [p.sessionId || id, p.startOffsetSec, p.durationSec])])).digest('hex');
  const final = path.join(root, id);
  const existing = await read(path.join(final, 'ready.json'));
  if (existing?.signature === signature) { await ensureSprites(final, existing); return; }
  const staging = path.join(root, `${id}.building`);
  await fs.mkdir(staging, { recursive: true });
  let progress = await read(path.join(staging, 'progress.json'));
  if (progress?.signature !== signature) {
    await fs.rm(staging, { recursive: true, force: true });
    await fs.mkdir(staging, { recursive: true });
    progress = { signature, completed: [] };
  }
  log('generating', id, count, 'frames;', parts.length, 'parts');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const start = Math.ceil(part.startOffsetSec / interval);
    const end = Math.min(count, Math.ceil((parts[i + 1]?.startOffsetSec ?? item.durationSec) / interval));
    if (end <= start || progress.completed.includes(i)) continue;
    const partSession = await db.streamSession.findUnique({ where: { id: part.sessionId || id }, include: { segments: true } });
    const segment = partSession?.segments.find(s => s.startOffsetSec === (part.sessionOffsetSec ?? part.startOffsetSec));
    const candidates = segment ? [segment.localPath, segment.archivePath] : [partSession?.playbackPath];
    let source;
    for (const candidate of candidates) if (await accessible(candidate)) { source = candidate; break; }
    source ||= new URL(part.streamUrl, origin).href;
    await extract(source, Math.max(0, start * interval - part.startOffsetSec), end - start, start, staging);
    // Last sample can fall after the last keyframe. Extend the last real frame.
    for (let index = start; index < end; index++) {
      const file = path.join(staging, frame(index));
      if (!await accessible(file)) {
        if (index === start) throw new Error(`${id}: no frame for part ${i + 1}`);
        await fs.copyFile(path.join(staging, frame(index - 1)), file);
      }
    }
    progress.completed.push(i);
    await atomic(path.join(staging, 'progress.json'), progress);
    log(id, `part ${i + 1}/${parts.length}`);
  }
  let bytes = 0;
  for (let i = 0; i < count; i++) bytes += (await fs.stat(path.join(staging, frame(i)))).size;
  if (bytes > 256 * 1024 * 1024) throw new Error(`${id}: preview storage budget exceeded`);
  await atomic(path.join(staging, 'ready.json'), { version: 2, signature, durationSec: item.durationSec,
    previewCount: count, previewIntervalSec: interval, broadcast: Boolean(item.broadcast),
    generatedAt: new Date().toISOString(), bytes });
  await ensureSprites(staging, await read(path.join(staging, 'ready.json')));
  const previous = final + '.previous';
  await fs.rm(previous, { recursive: true, force: true });
  if (await accessible(final)) await fs.rename(final, previous);
  await fs.rename(staging, final);
  await fs.rm(previous, { recursive: true, force: true });
  log('READY', id, count, 'frames', bytes, 'bytes');
}
async function main() {
  await fs.mkdir(root, { recursive: true });
  // Match recording deletion without tying thumbnails to temporary HLS expiry.
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const id = entry.name.replace(/\.(building|previous)$/, '');
    if (entry.isDirectory() && /^[a-z0-9]{20,32}$/.test(id) &&
        !await db.streamSession.findUnique({ where: { id }, select: { id: true } })) {
      await fs.rm(path.join(root, entry.name), { recursive: true, force: true });
    }
  }
  const ids = process.argv.slice(2);
  if (!ids.length) {
    for (let page = 1; page <= 100; page++) {
      const data = await json(`/api/public/streams?page=${page}&pageSize=50`);
      for (const item of data.items) if (item.startedAt >= cutoff) ids.push(item.id);
      if (page >= data.totalPages || data.items.some(item => item.startedAt && item.startedAt < cutoff)) break;
    }
  }
  let failed = false;
  for (const id of ids) try { await generate(id); } catch (error) { failed = true; log('ERROR', id, error.message); }
  if (failed) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
