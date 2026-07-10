import { resolveRequestOrigin } from "../lib/request-origin";
import { buildTwitchAudioPayload } from "../lib/twitch-audio-script";

export const dynamic = "force-dynamic";

// The loader userscript fetches this on every Twitch page load and eval()s
// the response, so whatever is deployed here is what every viewer runs.
export function GET(request: Request) {
  const origin = resolveRequestOrigin(request);
  const payload = buildTwitchAudioPayload(origin);

  return new Response(payload, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "application/javascript; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
