import { resolveRequestOrigin } from "../lib/request-origin";
import { buildTwitchAudioUserscript } from "../lib/twitch-audio-script";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const origin = resolveRequestOrigin(request);
  const scriptUrl = `${origin}/twitch-audio.user.js?origin=${encodeURIComponent(origin)}`;
  const script = buildTwitchAudioUserscript(origin, scriptUrl);

  return new Response(script, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Disposition": 'inline; filename="twitch-audio.user.js"',
      "Content-Type": "application/javascript; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
