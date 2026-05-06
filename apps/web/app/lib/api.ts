export function buildApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
  const normalizedPath = path.replace(/^\/+/, "").replace(/^api\/+/, "");
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw await buildHttpError(response, `GET ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await buildHttpError(response, `${method} ${path} failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function buildHttpError(response: Response, fallbackMessage: string) {
  try {
    const text = await response.text();

    if (!text) {
      return new Error(fallbackMessage);
    }

    const payload = JSON.parse(text) as { message?: string | string[] };
    const message = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message;

    return new Error(message || fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

