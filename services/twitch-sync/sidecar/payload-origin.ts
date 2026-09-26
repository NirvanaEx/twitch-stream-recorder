export const CANONICAL_ORIGIN = 'https://stream.neyron.site';
export const LEGACY_ORIGIN = 'http://198.51.100.42:9000';

// Installed loaders carry their original server address and @connect grant.
// Keep that address: changing it silently makes Tampermonkey block requests.
export function resolvePayloadOrigin(requestUrl: string, host?: string): string {
  const url = new URL(requestUrl, CANONICAL_ORIGIN);
  const requested = url.searchParams.get('origin')?.replace(/\/+$/, '');
  if (requested === CANONICAL_ORIGIN || requested === LEGACY_ORIGIN) return requested;
  return host === '198.51.100.42:9000' ? LEGACY_ORIGIN : CANONICAL_ORIGIN;
}
