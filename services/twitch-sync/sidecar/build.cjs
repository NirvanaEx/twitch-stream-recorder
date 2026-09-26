const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const directory = path.resolve('sidecar/dist');
fs.mkdirSync(directory, { recursive: true });
esbuild.buildSync({ entryPoints: ['sidecar/server.ts'], bundle: true, platform: 'node', target: 'node22',
  format: 'cjs', external: ['@prisma/client'], outfile: path.join(directory, 'server.cjs') });
esbuild.buildSync({ entryPoints: ['apps/api/src/modules/public/audio-sync.worker.ts'], bundle: true,
  platform: 'node', target: 'node22', format: 'cjs', outfile: path.join(directory, 'audio-sync.worker.js') });
const builder = esbuild.buildSync({ entryPoints: ['apps/web/app/lib/twitch-audio-script.ts'], bundle: true,
  platform: 'node', target: 'node22', format: 'cjs', write: false }).outputFiles[0].text;
const generated = { exports: {} };
new Function('module', 'exports', builder)(generated, generated.exports);
for (const [origin, filename] of [
  ['https://stream.neyron.site', 'twitch-audio.payload.js'],
  ['http://193.160.119.15:9000', 'twitch-audio.legacy.payload.js'],
]) {
  const payload = generated.exports.buildTwitchAudioPayload(origin);
  new (require('node:vm').Script)(payload);
  fs.writeFileSync(path.join(directory, filename), payload);
}
console.log('Built standalone sync server, worker and payload');
