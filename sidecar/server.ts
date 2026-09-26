import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { BackgroundAudioSync } from '../apps/api/src/modules/public/background-audio-sync';
import { CANONICAL_ORIGIN, LEGACY_ORIGIN, resolvePayloadOrigin } from './payload-origin';

const database = new URL(process.env.DATABASE_URL!);
database.searchParams.set('connection_limit', '2');
const prisma = new PrismaClient({ datasources: { db: { url: database.href } } });
const engine = new BackgroundAudioSync();
const payloads = new Map([
  [CANONICAL_ORIGIN, readFileSync(resolve(__dirname, 'twitch-audio.payload.js'))],
  [LEGACY_ORIGIN, readFileSync(resolve(__dirname, 'twitch-audio.legacy.payload.js'))],
]);
const version = process.env.TSR_SYNC_VERSION || '20260923-background';
const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-TSR-Sync-Version', version);
  const json = (status: number, value: unknown) => {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(value));
  };
  try {
    if (request.method !== 'GET') return json(405, { error: 'GET required' });
    const url = new URL(request.url || '/', 'http://localhost');
    if (url.pathname === '/health') return json(200, { ok: true, service: 'tsr-sync', version });
    if (url.pathname === '/twitch-audio.payload.js') {
      response.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      response.end(payloads.get(resolvePayloadOrigin(request.url || '/', request.headers.host))); return;
    }
    const match = /^\/api\/public\/streams\/([a-zA-Z0-9_-]{1,80})\/audio-sync$/.exec(url.pathname);
    if (!match) return json(404, { error: 'Not found' });
    const vod = url.searchParams.get('vod') || '';
    const position = Number(url.searchParams.get('position'));
    const estimate = Number(url.searchParams.get('estimate'));
    if (!/^\d{1,20}$/.test(vod) || !url.searchParams.has('position') || !url.searchParams.has('estimate') ||
        !Number.isFinite(position) || position < 0 || position > 86400 ||
        !Number.isFinite(estimate) || estimate < 0 || estimate > 86400) return json(400, { error: 'Invalid position' });
    const session = await prisma.streamSession.findUnique({ where: { id: match[1] }, select: {
      id: true, durationSec: true, mediaTimelineJson: true, createdAt: true,
      startedAt: true, endedAt: true, status: true, audioDeletedAt: true,
      channel: { select: { twitchLogin: true } },
    } });
    if (!session || session.status !== 'completed' || session.audioDeletedAt) return json(404, { error: 'Audio not found' });
    json(200, await engine.measure(session, vod, position, estimate));
  } catch {
    json(503, { status: 'unavailable', reason: 'Background sync unavailable; no offset changed' });
  }
});
server.listen(Number(process.env.PORT || 3002), '0.0.0.0', () => console.log(`tsr-sync ${version} ready`));
process.on('SIGTERM', () => { server.close(); void prisma.$disconnect().finally(() => process.exit(0)); });
