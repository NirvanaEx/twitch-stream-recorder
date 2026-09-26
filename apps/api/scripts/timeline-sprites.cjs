const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const execFile = promisify(require('node:child_process').execFile);

async function ensureSprites(directory, manifest) {
  const count = Math.ceil(manifest.previewCount / 100);
  if (manifest.sprites?.version === 1 && manifest.sprites.format === 'webp' && manifest.sprites.count === count) return manifest;
  for (let sheet = 0; sheet < count; sheet++) {
    const filename = path.join(directory, `sprite-${String(sheet + 1).padStart(6, '0')}.webp`);
    const temporary = filename + '.tmp.webp';
    const frames = Math.min(100, manifest.previewCount - sheet * 100);
    await execFile('nice', ['-n', '15', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
      '-threads', '1', '-start_number', String(sheet * 100 + 1),
      '-i', path.join(directory, 'preview-%06d.jpg'),
      '-vf', `tile=10x10:nb_frames=${frames}`, '-frames:v', '1', '-threads', '1', '-filter_threads', '1',
      '-c:v', 'libwebp', '-quality', '60', '-compression_level', '4', '-update', '1', temporary], { timeout: 120000 });
    await fs.rename(temporary, filename);
  }
  const ready = { ...manifest, sprites: { version: 1, format: 'webp', columns: 10, rows: 10,
    width: 320, height: 180, count } };
  await fs.writeFile(path.join(directory, 'ready.json.tmp'), JSON.stringify(ready));
  await fs.rename(path.join(directory, 'ready.json.tmp'), path.join(directory, 'ready.json'));
  return ready;
}
module.exports = { ensureSprites };

// Backfill sheets from existing JPEGs only; never read the original video.
if (require.main === module) (async () => {
  const root = path.resolve(process.env.DATA_DIR || '/data', 'timeline-previews');
  for (const id of await fs.readdir(root)) {
    if (!/^[a-z0-9]{20,32}$/.test(id)) continue;
    const directory = path.join(root, id);
    const manifest = JSON.parse(await fs.readFile(path.join(directory, 'ready.json'), 'utf8'));
    const ready = await ensureSprites(directory, manifest);
    console.log(id, ready.previewCount, 'frames in', ready.sprites.count, 'sheets');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
