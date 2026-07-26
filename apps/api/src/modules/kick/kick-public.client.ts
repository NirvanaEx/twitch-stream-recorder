import { Injectable, Logger } from "@nestjs/common";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Credential-free access to a Kick channel.
 *
 * kick.com's own endpoints are behind Cloudflare's bot check: a plain Node
 * fetch is answered with 403. streamlink already carries the workaround (a TLS
 * context without session tickets plus Chrome headers) and is installed in this
 * image because it does the recording, so scripts/kick-channel.py borrows its
 * HTTP session for a single request and prints JSON.
 *
 * Why bother when there is an official API: the official one needs a developer
 * app, and it does NOT expose the chatroom id that chat capture subscribes to.
 * This path needs no setup at all and answers both questions at once.
 *
 * The trade-off is honest: it leans on a streamlink internal, spawns a Python
 * process per lookup, and Kick could tighten the endpoint at any time. Hence
 * the short-lived cache below and the official API taking precedence whenever
 * credentials are configured.
 */

export type KickPublicChannel = {
  id: number | null;
  userId: number | null;
  slug: string;
  chatroomId: number | null;
  displayName: string | null;
  avatar: string | null;
  isLive: boolean;
  livestreamId: number | null;
  title: string | null;
  category: string | null;
  startedAt: string | null;
  thumbnail: string | null;
};

// The recorder polls every channel on a timer and several call sites may want
// the same channel within one pass. A Python process per lookup is expensive
// enough that a few seconds of reuse is worth much more than freshness here.
const CACHE_TTL_MS = 15_000;

const SCRIPT_TIMEOUT_MS = 25_000;

@Injectable()
export class KickPublicClient {
  private readonly logger = new Logger(KickPublicClient.name);
  private readonly cache = new Map<string, { value: KickPublicChannel | null; at: number }>();
  private readonly inFlight = new Map<string, Promise<KickPublicChannel | null>>();
  private pythonCommand: string | null = null;

  async getChannel(slug: string, forceRefresh = false): Promise<KickPublicChannel | null> {
    const key = slug.toLowerCase();
    const cached = this.cache.get(key);

    if (!forceRefresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.value;
    }

    // Collapse concurrent lookups of the same channel onto one process.
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing;
    }

    const request = this.fetchChannel(key)
      .then((value) => {
        this.cache.set(key, { value, at: Date.now() });
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, request);
    return request;
  }

  private async fetchChannel(slug: string): Promise<KickPublicChannel | null> {
    const scriptPath = this.resolveScriptPath();

    if (!scriptPath) {
      throw new Error(
        "kick-channel.py was not found. Configure KICK_CLIENT_ID / KICK_CLIENT_SECRET to use the official API instead.",
      );
    }

    const python = await this.resolvePython();
    const raw = await this.run(python, [scriptPath, slug]);

    let payload: (KickPublicChannel & { ok?: boolean; error?: string }) | null = null;

    try {
      payload = JSON.parse(raw.trim().split("\n").pop() ?? "");
    } catch {
      throw new Error(`Kick helper returned no JSON: ${raw.slice(0, 200)}`);
    }

    if (!payload?.ok) {
      if (payload?.error === "channel_not_found") {
        return null;
      }

      throw new Error(`Kick lookup failed: ${payload?.error ?? "unknown error"}`);
    }

    return {
      id: payload.id ?? null,
      userId: payload.userId ?? null,
      slug: payload.slug ?? slug,
      chatroomId: payload.chatroomId ?? null,
      displayName: payload.displayName ?? null,
      avatar: payload.avatar ?? null,
      isLive: Boolean(payload.isLive),
      livestreamId: payload.livestreamId ?? null,
      title: payload.title ?? null,
      category: payload.category ?? null,
      // Kick returns "2026-07-25 21:28:33" (UTC, no zone marker); make it a
      // real ISO instant so `new Date(...)` does not read it as local time.
      startedAt: normalizeKickTimestamp(payload.startedAt),
      thumbnail: payload.thumbnail ?? null,
    };
  }

  /** dist/ sits next to scripts/ at runtime; src/ is three levels deeper in dev. */
  private resolveScriptPath() {
    const candidates = [
      resolve(process.cwd(), "scripts", "kick-channel.py"),
      resolve(__dirname, "..", "..", "..", "scripts", "kick-channel.py"),
      resolve(__dirname, "..", "..", "..", "..", "scripts", "kick-channel.py"),
    ];

    return candidates.find((candidate) => existsSync(candidate)) ?? null;
  }

  private async resolvePython() {
    if (this.pythonCommand) {
      return this.pythonCommand;
    }

    for (const candidate of ["python3", "python", "py"]) {
      try {
        await this.run(candidate, ["--version"], 5_000);
        this.pythonCommand = candidate;
        return candidate;
      } catch {
        // Try the next one.
      }
    }

    throw new Error("Python was not found, so Kick channels cannot be read without API keys.");
  }

  private run(command: string, args: string[], timeoutMs = SCRIPT_TIMEOUT_MS) {
    return new Promise<string>((resolvePromise, rejectPromise) => {
      const child = spawn(command, args, {
        stdio: ["ignore", "pipe", "pipe"],
        // The helper prints channel titles, which are full of emoji.
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });

      let stdout = "";
      let stderr = "";
      const timer = setTimeout(() => {
        child.kill();
        rejectPromise(new Error(`${command} timed out after ${timeoutMs} ms`));
      }, timeoutMs);
      timer.unref();

      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr = `${stderr}${chunk.toString()}`.slice(-1000);
      });

      child.once("error", (error) => {
        clearTimeout(timer);
        rejectPromise(error);
      });

      child.once("exit", (code) => {
        clearTimeout(timer);

        if (code === 0) {
          resolvePromise(stdout);
          return;
        }

        rejectPromise(new Error(`${command} exited with ${String(code)}: ${stderr.trim()}`));
      });
    });
  }
}

/** "2026-07-25 21:28:33" (UTC) -> "2026-07-25T21:28:33Z"; passes ISO through. */
export function normalizeKickTimestamp(value: string | null | undefined) {
  if (!value) return null;
  if (/[TZ]|[+-]\d{2}:\d{2}$/.test(value)) return value;

  const match = value.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/);
  return match ? `${match[1]}T${match[2]}Z` : value;
}
