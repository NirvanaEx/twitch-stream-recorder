'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const { PrismaClient } = require('/app/node_modules/@prisma/client');
const { cutoffs, expiredKinds, planSession, inside } = require('./policy.cjs');
const policy = require('./policy.json');
const root = '/mnt/gdrive/twitch-recorder';
const auditRoot = '/data/maintenance/retention-reports';
const apply = process.argv.includes('--apply');
const url = new URL(process.env.DATABASE_URL);
url.searchParams.set('connection_limit', '1');
const db = new PrismaClient({ datasources: { db: { url: url.href } } });
const include = { segments: true, telegramParts: true };

async function main() {
  const now = new Date();
  await fs.access(path.join(root, '.archive-root'));
  if (await fs.realpath(root) !== root) throw new Error('Unexpected archive root');
  const sessions = await db.streamSession.findMany({
    where: { status: 'completed', archiveDir: { not: null }, archiveDeletedAt: null,
      archiveStatus: { in: ['stored', 'error'] } }, include, orderBy: { createdAt: 'asc' },
  });
  const files = [], errors = [];
  for (const session of sessions) {
    try { files.push(...await planSession(root, session, now, policy)); }
    catch (e) { errors.push({ sessionId: session.id, error: e.message }); }
  }
  const report = { at: now.toISOString(), apply, policy, cutoffs: cutoffs(now, policy),
    plannedFiles: files.length, plannedBytes: files.reduce((n, f) => n + f.bytes, 0),
    sessions: [...new Set(files.map(f => f.sessionId))], deletedFiles: 0, deletedBytes: 0, errors };
  if (!apply) { console.log(JSON.stringify({ ...report, files })); return; }

  // Save the exact candidates and relevant database state before the first deletion.
  await fs.mkdir(auditRoot, { recursive: true });
  const audit = path.join(auditRoot, now.toISOString().replace(/[:.]/g, '-') + '.jsonl');
  if (files.length) await fs.writeFile(audit, JSON.stringify({ ...report, files, before: sessions.filter(s => report.sessions.includes(s.id)) }) + '\n', { flag: 'wx' });
  for (const sessionId of report.sessions) {
    try {
      const session = await db.streamSession.findUnique({ where: { id: sessionId }, include });
      if (!session) continue;
      const eligible = expiredKinds(session, new Date(), policy);
      const deleted = [];
      for (const file of files.filter(f => f.sessionId === sessionId)) {
        if (!eligible.includes(file.kind)) continue;
        await fs.access(path.join(root, '.archive-root'));
        if (path.dirname(file.path) !== path.resolve(session.archiveDir) || !inside(root, file.path) ||
            await fs.realpath(path.dirname(file.path)) !== path.dirname(file.path)) throw new Error('File moved outside its approved session');
        const stat = await fs.lstat(file.path).catch(e => { if (e.code === 'ENOENT') return null; throw e; });
        if (stat && (!stat.isFile() || stat.isSymbolicLink() || stat.size !== file.bytes || stat.mtimeMs !== file.mtimeMs))
          throw new Error('Media changed after planning; retry on next pass');
        if (stat) {
          await fs.unlink(file.path);
          report.deletedFiles++; report.deletedBytes += file.bytes;
          await fs.appendFile(audit, JSON.stringify({ deletedAt: new Date(), ...file }) + '\n');
        }
        deleted.push(file);
        // Only clear the path just removed. Telegram message/part records stay intact.
        if (file.kind === 'video') await db.recordingSegment.updateMany({
          where: { streamSessionId: sessionId, archivePath: file.path }, data: { archivePath: null },
        });
      }
      if (deleted.length) {
        const update = {};
        if (deleted.some(f => f.kind === 'video' || (f.kind === 'audio' && session.audioOnly)))
          update.localFileDeletedAt = session.localFileDeletedAt || new Date();
        if (deleted.some(f => f.kind === 'audio')) update.audioLocalDeletedAt = session.audioLocalDeletedAt || new Date();
        await db.streamSession.update({ where: { id: sessionId }, data: update });
      }
    } catch (e) { report.errors.push({ sessionId, error: e.message }); }
  }
  if (files.length) await fs.appendFile(audit, JSON.stringify({ result: report }) + '\n');
  await fs.writeFile(path.join(auditRoot, 'latest.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  if (report.errors.length) process.exitCode = 1;
}
main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => db.$disconnect());
