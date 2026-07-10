import { buildTwitchAudioUserscript } from "../lib/twitch-audio-script";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const requestHeaders = request.headers;
  const requestUrl = new URL(request.url);
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestProtocol = requestUrl.protocol === "https:" ? "https" : "http";
  const protocol =
    forwardedProto === "https" || forwardedProto === "http"
      ? forwardedProto
      : requestProtocol;
  const host = forwardedHost || requestHeaders.get("host") || requestUrl.host;

  // URL normalisation rejects malformed/host-header-injection values before
  // they are embedded into the generated JavaScript string.
  let origin = requestUrl.origin;
  try {
    origin = new URL(`${protocol}://${host}`).origin;
  } catch {
    // request.url is supplied by Next and remains the safe fallback.
  }

  const scriptUrl = `${origin}/twitch-audio.user.js`;
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
