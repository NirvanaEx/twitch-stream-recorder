// Runs inside the existing API container, scheduled by the host systemd timer.
// Deliberately independent of recording lifecycle: no recorder restart needed.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

function run(command, args, timeout = 1800000) {
  const r = spawnSync(command, args, { encoding: 'utf8', timeout, maxBuffer: 1024 * 1024 });
  if (r.error || r.status !== 0) throw new Error(`${command}: ${r.error?.message || r.stderr?.slice(-1800)}`);
  return r.stdout;
}
function validateSegments(segments) {
  if (!segments.length) throw new Error('No segments');
  let end = 0;
  segments.forEach((s, i) => {
    if (s.index !== i + 1 || Math.abs(s.startOffsetSec - end) > 1 || !(s.durationSec > 0)) {
      throw new Error(`Missing or discontinuous segment ${s.index}`);
    }
    end = s.startOffsetSec + s.durationSec;
  });
  return end;
}
function archiveDestination(dir, root, remote) {
  const rel = path.relative(root, dir);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Archive directory outside configured root');
  return `${remote.replace(/\/$/, '')}/${rel}/audio.m4a`;
}
function probe(file) {
  const info = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], 60000));
  if (!info.streams.some(s => s.codec_type === 'audio') || info.streams.some(s => s.codec_type === 'video')) throw new Error('Invalid audio streams');
  const duration = Number(info.format.duration);
  if (!(duration > 0)) throw new Error('Invalid audio duration');
  return duration;
}
async function md5(file) {
  const hash = crypto.createHash('md5');
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
async function processSession(p, session) {
  const segments = session.segments;
  const expected = validateSegments(segments);
  const root = process.env.ARCHIVE_DIR || '/mnt/gdrive/twitch-recorder';
  const remote = process.env.ARCHIVE_RCLONE_REMOTE || 'gdrive:twitch-recorder';
  const destination = archiveDestination(session.archiveDir, root, remote);
  // Never write through a disconnected FUSE mount.
  fs.accessSync(path.join(root, '.archive-root'));
  const work = path.join(process.env.DATA_DIR || '/data', 'tmp', 'segmented-audio', session.id);
  fs.mkdirSync(work, { recursive: true });
  const free = fs.statfsSync(work);
  if (free.bavail * free.bsize < 3 * 1024 ** 3) throw new Error('Less than 3 GiB free; retry later');
  console.log(`START ${session.id}: ${segments.length} segments`);
  let total = 0;
  const pieces = [];
  for (const s of segments) {
    const piece = path.join(work, `${String(s.index).padStart(5, '0')}.m4a`);
    let duration;
    try { duration = probe(piece); } catch { duration = null; }
    if (!duration || Math.abs(duration - s.durationSec) > 2) {
      const source = [s.localPath, s.archivePath].find(f => f && fs.existsSync(f));
      if (!source) throw new Error(`No source for segment ${s.index}; retry later`);
      const temp = `${piece}.partial.m4a`;
      run('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', source, '-map', '0:a:0', '-vn', '-c:a', 'copy', '-movflags', '+faststart', temp]);
      duration = probe(temp);
      if (Math.abs(duration - s.durationSec) > 2) throw new Error(`Segment ${s.index} duration mismatch`);
      fs.renameSync(temp, piece);
    }
    total += duration;
    pieces.push(piece);
    console.log(`PART ${session.id} ${s.index}/${segments.length}`);
  }
  const list = path.join(work, 'concat.txt');
  fs.writeFileSync(list, pieces.map(f => `file '${f}'`).join('\n') + '\n');
  const output = path.join(work, 'audio.m4a');
  run('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-map', '0:a:0', '-c:a', 'copy', '-movflags', '+faststart', output]);
  const duration = probe(output);
  if (Math.abs(duration - total) > 2 || Math.abs(duration - expected) > Math.max(3, segments.length * 0.6)) throw new Error('Combined audio duration mismatch');
  const size = fs.statSync(output).size;
  const hash = await md5(output);
  const config = ['--config', process.env.ARCHIVE_RCLONE_CONFIG || '/etc/rclone/rclone.conf'];
  run('rclone', ['copyto', output, destination, '--immutable', '--checksum', ...config]);
  const stored = JSON.parse(run('rclone', ['lsjson', destination, '--stat', '--hash', ...config], 120000));
  if (stored.Size !== size || stored.Hashes?.md5 !== hash) throw new Error('Archive checksum verification failed');
  const audioPath = path.join(session.archiveDir, 'audio.m4a');
  // Direct rclone uploads become visible after the mount's one-minute poll.
  // Leave checkpoint files for a later retry if it remains unavailable.
  let visible = false;
  for (let attempt = 0; attempt < 25; attempt++) {
    try { visible = fs.statSync(audioPath).size === size; } catch {}
    if (visible) break;
    if (attempt < 24) await new Promise(resolve => setTimeout(resolve, 5000));
  }
  if (!visible) throw new Error('Archive mount has not refreshed yet');
  const updated = await p.streamSession.updateMany({
    where: { id: session.id, status: 'completed', extractAudio: true, audioDeletedAt: null, audioPath: null, telegramAudioMessageId: null },
    data: { audioPath, audioSizeBytes: String(size), audioLocalDeletedAt: null },
  });
  if (updated.count !== 1) throw new Error('Session changed during processing; audio not registered');
  console.log(`READY ${session.id} duration=${duration} bytes=${size} md5=${hash}`);
  // Only our disposable checkpoint folder, after checksum and database commit.
  fs.rmSync(work, { recursive: true });
}
async function main() {
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  try {
    const settings = await p.appSettings.findUnique({ where: { id: 'default' } });
    if (!settings?.audioTrackEnabled) return;
    const sessions = await p.streamSession.findMany({
      where: { segmented: true, status: 'completed', isLive: false, extractAudio: true,
        audioDeletedAt: null, audioPath: null, telegramAudioMessageId: null,
        archiveStatus: 'stored', archiveDeletedAt: null, archiveDir: { not: null },
        // Older recordings explicitly removed by the owner are outside recovery scope.
        createdAt: { gte: new Date('2026-09-09T00:00:00Z') } },
      include: { segments: { orderBy: { index: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
    sessions.sort((a, b) => Number(b.id === 'cmu01ov8a15oulc01usj0yr96') - Number(a.id === 'cmu01ov8a15oulc01usj0yr96'));
    let failures = 0;
    for (const s of sessions) {
      try { await processSession(p, s); }
      catch (error) { failures++; console.error(`RETRY ${s.id}: ${error.message}`); }
    }
    if (failures) process.exitCode = 1;
  } finally { await p.$disconnect(); }
}
module.exports = { validateSegments, archiveDestination, probe, processSession };
if (require.main === module || process.env.SEGMENTED_AUDIO_RUN === '1') main().catch(e => { console.error(e); process.exitCode = 1; });
