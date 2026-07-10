// Resolves the public origin a userscript should call back to.
//
// Priority: the ?origin= query parameter (the admin panel passes the exact
// address the browser reached it at — immune to proxies), then the
// X-Forwarded-* headers, then the Host header. nginx's $host variable strips
// the port, so a bare Host header behind a proxy on a non-default port would
// otherwise produce an unreachable address.
//
// Every candidate goes through URL normalisation, which rejects
// malformed/host-header-injection values before they are embedded into the
// generated JavaScript (an origin cannot contain quotes or newlines).
export function resolveRequestOrigin(request: Request): string {
  const requestUrl = new URL(request.url);

  const override = requestUrl.searchParams.get("origin");
  if (override) {
    try {
      const parsed = new URL(override);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      // Fall through to header-based resolution.
    }
  }

  const requestHeaders = request.headers;
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestProtocol = requestUrl.protocol === "https:" ? "https" : "http";
  const protocol =
    forwardedProto === "https" || forwardedProto === "http"
      ? forwardedProto
      : requestProtocol;
  const host = forwardedHost || requestHeaders.get("host") || requestUrl.host;

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    // request.url is supplied by Next and remains the safe fallback.
    return requestUrl.origin;
  }
}
