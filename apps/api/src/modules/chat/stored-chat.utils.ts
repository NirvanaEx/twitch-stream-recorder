/** A corrupt legacy row must not make the entire replay endpoint fail. */
export function parseStoredJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function parseStoredJsonString(value: string | null | undefined): string | null {
  const parsed = parseStoredJson<unknown>(value);
  return typeof parsed === "string" ? parsed : null;
}
