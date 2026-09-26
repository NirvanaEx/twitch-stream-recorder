'use strict';
const path = require('node:path');
const fs = require('node:fs/promises');
const DAY = 86400000;

function cutoffs(now, policy) {
  if (policy.timeZone !== 'Asia/Tashkent') throw new Error('Unsupported retention timezone');
  if (!Number.isInteger(policy.videoCalendarDays) || policy.videoCalendarDays < 1) throw new Error('Invalid video days');
  if (!Number.isInteger(policy.audioDays) || policy.audioDays < 1) throw new Error('Invalid audio days');
  // Tashkent has UTC+05:00 year-round. Preserve the entire current and previous day.
  const offset = 5 * 3600000;
  const localMidnight = Math.floor((now.getTime() + offset) / DAY) * DAY - offset;
  return { video: new Date(localMidnight - (policy.videoCalendarDays - 1) * DAY),
    audio: new Date(now.getTime() - policy.audioDays * DAY) };
}

function inside(root, target) {
  const rel = path.relative(path.resolve(root), path.resolve(target));
  return rel !== '' && rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel);
}

function confirmedVideo(session) {
  const parts = session.telegramParts || [];
  if (session.telegramStatus !== 'uploaded' || !parts.length) return false;
  if (parts.some(p => !p.messageId || !p.fileId)) return false;
  if (session.segmented) return session.segments.length > 0 && session.segments.every(s =>
    s.telegramStatus === 'uploaded' && parts.some(p => p.partIndex === s.index));
  return parts.every(p => p.partCount === parts.length) &&
    parts.every((_, i) => parts.some(p => p.partIndex === i + 1));
}

function expiredKinds(session, now, policy) {
  if (session.status !== 'completed' || !['stored', 'error'].includes(session.archiveStatus) ||
      session.telegramStatus === 'uploading') return [];
  const start = new Date(session.startedAt || session.createdAt);
  if (!Number.isFinite(start.getTime())) throw new Error('Invalid session date');
  const cutoff = cutoffs(now, policy);
  const result = [];
  if (!session.audioOnly && start < cutoff.video && (policy.deleteUnbackedVideo || confirmedVideo(session))) result.push('video');
  if (start <= cutoff.audio && (policy.deleteUnbackedAudio ||
      (session.telegramAudioMessageId && session.telegramAudioFileId))) result.push('audio');
  return result;
}

function mediaKind(name) {
  if (/^(?:video|part\d+)\.(?:mp4|mkv|webm|ts)$/i.test(name)) return 'video';
  if (/^audio\.(?:m4a|mp3|aac|ogg|opus)$/i.test(name)) return 'audio';
  return null;
}

async function planSession(root, session, now, policy) {
  const kinds = expiredKinds(session, now, policy);
  if (!kinds.length || !session.archiveDir) return [];
  const directory = path.resolve(session.archiveDir);
  if (!inside(root, directory)) throw new Error('Session directory escapes archive root');
  const parts = path.relative(root, directory).split(path.sep);
  if (parts.length !== 4 || !['twitch', 'kick'].includes(parts[0]) || !/^\d{4}-\d{2}$/.test(parts[2]))
    throw new Error('Unexpected session directory layout');
  const info = await fs.lstat(directory).catch(e => { if (e.code === 'ENOENT') return null; throw e; });
  if (!info) return [];
  if (!info.isDirectory() || info.isSymbolicLink() || await fs.realpath(directory) !== directory)
    throw new Error('Archive directory contains a symlink');
  const result = [];
  for (const name of await fs.readdir(directory)) {
    const kind = mediaKind(name);
    if (!kinds.includes(kind)) continue;
    const filename = path.join(directory, name);
    const stat = await fs.lstat(filename);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Refusing non-regular media file');
    result.push({ sessionId: session.id, kind, path: filename, bytes: stat.size, mtimeMs: stat.mtimeMs,
      telegramConfirmed: kind === 'video' ? confirmedVideo(session) : !!(session.telegramAudioMessageId && session.telegramAudioFileId) });
  }
  return result;
}

module.exports = { cutoffs, inside, confirmedVideo, expiredKinds, mediaKind, planSession };
