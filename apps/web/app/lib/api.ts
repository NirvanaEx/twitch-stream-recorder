const TOKEN_STORAGE_KEY = "tsr-auth-token";

export function buildApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
  const normalizedPath = path.replace(/^\/+/, "").replace(/^api\/+/, "");
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

// --- token storage (browser-only) ---

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // localStorage may be unavailable (private mode); ignore.
  }
}

// Listeners notified when the token changes (e.g. login/logout). Used by
// AuthContext to refresh /auth/me without prop-drilling.
type TokenListener = (token: string | null) => void;
const listeners = new Set<TokenListener>();

export function onAuthTokenChange(listener: TokenListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyTokenChange(token: string | null) {
  for (const listener of listeners) {
    try {
      listener(token);
    } catch {
      // Listener errors must not break the auth flow.
    }
  }
}

export function loginWithToken(token: string) {
  setAuthToken(token);
  notifyTokenChange(token);
}

export function clearAuthToken() {
  setAuthToken(null);
  notifyTokenChange(null);
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- request errors ---

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export function isUnauthorized(err: unknown): err is ApiError {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

async function buildHttpError(response: Response, fallbackMessage: string) {
  try {
    const text = await response.text();

    if (!text) {
      return new ApiError(response.status, fallbackMessage);
    }

    const payload = JSON.parse(text) as { message?: string | string[] };
    const message = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message;

    return new ApiError(response.status, message || fallbackMessage);
  } catch {
    return new ApiError(response.status, fallbackMessage);
  }
}

function handleAuthFailure(status: number) {
  if (status === 401) {
    // Token is invalid or expired — drop it so AuthContext sees the change
    // and the UI can route the user back to /login.
    clearAuthToken();
  }
}

// --- request helpers ---

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    cache: "no-store",
    headers: { ...authHeaders() },
  });

  if (!response.ok) {
    handleAuthFailure(response.status);
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
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    handleAuthFailure(response.status);
    throw await buildHttpError(response, `${method} ${path} failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
