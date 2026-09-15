import { build } from 'esbuild';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const widget = path.join(root, 'app/twitch-chat-widget');
const css = (await readFile(path.join(root, 'app/globals.css'), 'utf8'))
  .replaceAll(':root', ':host').replace(/html,\s*body\s*\{/g, ':host {') + `
:host { all: initial; display: block; height: 100%; font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #e6e9ef; }
.tsr-shared-chat { height: 100%; min-height: 0; display: flex; flex-direction: column; background: var(--panel); }
.tsr-shared-chat > .chat-replay { flex: 1; height: 100%; min-height: 0; border-radius: 0; border: 0; }
`;
await mkdir(path.join(root, 'public'), {recursive: true});
await build({entryPoints: [path.join(widget, 'entry.tsx')], outfile: path.join(root, 'public/twitch-chat.widget.js'),
  bundle: true, format: 'iife', globalName: 'TSRChatWidget', platform: 'browser', target: 'es2020', jsx: 'automatic',
  minify: true, define: { 'process.env.NODE_ENV': '"production"', __CHAT_CSS__: JSON.stringify(css) },
  banner: {js: '/* tsr-chat-widget */'}, plugins: [{name: 'chat-environment', setup(build) {
    build.onResolve({filter: /(?:^|\/)api$/}, () => ({path: path.join(widget, 'api.ts')}));
    build.onResolve({filter: /(?:^|\/)(providers|spoiler)$/}, () => ({path: path.join(widget, 'context.tsx')}));
  }}],
});
