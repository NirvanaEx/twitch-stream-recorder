import { Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, statfsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { gifSourceKey, gifSourceUrls, isGifSourceUrl } from "./chat-gifs.utils";
import { parseStoredJsonString } from "./stored-chat.utils";

const MAX_ASSET_BYTES = 25 * 1024 * 1024;
const MAX_BUNDLE_BYTES = 128 * 1024 * 1024;
const FILE_RE = /^[a-f0-9]{64}\.(gif|webp|png|jpg)$/;
const KEY_RE = /^[a-f0-9]{64}$/;
const MIME: Record<string, string> = { gif: "image/gif", webp: "image/webp", png: "image/png", jpg: "image/jpeg" };
type RecordEntry = { url: string; file?: string; size?: number; attempts: number; nextAttemptAt: number; error?: string };

/** Persistent download queue + immutable, content-addressed files. Neither is a
 * disposable cache: include DATA_DIR/chat-gifs in backups, along with the DB. */
@Injectable()
export class GifMirrorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GifMirrorService.name);
  private readonly root = resolve(process.env.DATA_DIR ?? "./data", "chat-gifs");
  private readonly records = new Map<string, RecordEntry>();
  private readonly pending = new Set<string>();
  private readonly jobs = new Map<string, Promise<void>>();
  private readonly abort = new AbortController();
  private active = 0;
  private readonly waiters: Array<() => void> = [];
  private timer?: NodeJS.Timeout;
  private stopped = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    try {
      this.makeDirs();
      for (const name of readdirSync(join(this.root, "index"))) {
        if (!/^[a-f0-9]{64}\.json$/.test(name)) continue;
        const key = name.slice(0, -5);
        this.readRecord(key);
      }
    } catch (error) { this.logger.warn(`GIF storage initialization failed: ${String(error)}`); }
    this.timer = setInterval(() => this.drain(), 15_000);
    this.timer.unref();
    this.drain();
    // Recover the small DB/file-write window after a crash and older URL-only
    // messages. No titles/search guesses; a saved source URL is required.
    void this.backfill().catch((error) => this.logger.warn(`GIF backfill failed: ${String(error)}`));
  }

  onModuleDestroy() {
    this.stopped = true;
    clearInterval(this.timer);
    this.abort.abort();
  }

  enqueue(tag: unknown) {
    for (const url of gifSourceUrls(tag)) {
      try { this.recordFor(url); }
      catch (error) { this.logger.warn(`Cannot queue GIF ${gifSourceKey(url)}: ${String(error)}`); }
    }
    this.drain();
  }

  private async backfill() {
    let cursor: string | undefined;
    while (!this.stopped) {
      const rows = await this.prisma.chatMessage.findMany({
        where: { gifsJson: { not: null } }, select: { id: true, gifsJson: true },
        orderBy: { id: "asc" }, take: 250,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      for (const row of rows) this.enqueue(parseStoredJsonString(row.gifsJson));
      if (rows.length < 250) return;
      cursor = rows[rows.length - 1].id;
      await new Promise<void>((done) => setImmediate(done));
    }
  }

  private makeDirs() {
    mkdirSync(join(this.root, "index"), { recursive: true });
    mkdirSync(join(this.root, "files"), { recursive: true });
  }

  private readRecord(key: string): RecordEntry | undefined {
    if (this.records.has(key)) return this.records.get(key);
    try {
      const record = JSON.parse(readFileSync(join(this.root, "index", `${key}.json`), "utf8")) as RecordEntry;
      if (!isGifSourceUrl(record.url) || gifSourceKey(record.url) !== key ||
          (record.file && !FILE_RE.test(record.file))) return undefined;
      record.attempts = Number.isSafeInteger(record.attempts) && record.attempts >= 0 ? record.attempts : 0;
      record.nextAttemptAt = Number.isFinite(record.nextAttemptAt) ? record.nextAttemptAt : 0;
      this.records.set(key, record);
      if (!this.usable(record)) this.pending.add(key);
      return record;
    } catch { return undefined; }
  }

  private recordFor(url: string): RecordEntry {
    const key = gifSourceKey(url);
    const existing = this.readRecord(key);
    if (existing) return existing;
    const record: RecordEntry = { url, attempts: 0, nextAttemptAt: 0 };
    this.saveRecord(key, record);
    this.records.set(key, record);
    this.pending.add(key);
    return record;
  }

  private saveRecord(key: string, record: RecordEntry) {
    this.makeDirs();
    this.writeAtomic(join(this.root, "index", `${key}.json`), JSON.stringify(record));
  }

  private writeAtomic(path: string, bytes: string | Buffer) {
    const temp = `${path}.${randomUUID()}.part`;
    try { writeFileSync(temp, bytes); renameSync(temp, path); }
    finally { rmSync(temp, { force: true }); }
  }

  private usable(record: RecordEntry) {
    if (!record.file || !FILE_RE.test(record.file)) return false;
    try { return statSync(join(this.root, "files", record.file)).size === record.size && (record.size ?? 0) > 0; }
    catch { return false; }
  }

  /** Read-only endpoint: an HTTP visitor cannot make the server fetch a URL. */
  resolveFile(key: string): { path: string; contentType: string } | null {
    if (!KEY_RE.test(key)) return null;
    const record = this.readRecord(key);
    if (!record || !this.usable(record)) return null;
    return { path: join(this.root, "files", record.file!), contentType: MIME[record.file!.split(".").pop()!] };
  }

  private drain() {
    if (this.stopped) return;
    let slots = 2 - this.jobs.size;
    for (const key of this.pending) {
      if (slots <= 0) break;
      const record = this.records.get(key)!;
      if (this.jobs.has(key) || record.nextAttemptAt > Date.now()) continue;
      slots--;
      void this.ensure(record.url);
    }
  }

  /** Shared by the background worker and export; at most two downloads total. */
  async ensure(url: string): Promise<void> {
    if (!isGifSourceUrl(url) || this.stopped) return;
    const key = gifSourceKey(url);
    const current = this.jobs.get(key);
    if (current) return current;
    let record: RecordEntry;
    try { record = this.recordFor(url); }
    catch (error) { this.logger.warn(`Cannot queue GIF ${key}: ${String(error)}`); return; }
    if (this.usable(record)) { this.pending.delete(key); return; }
    this.pending.add(key);
    if (record.nextAttemptAt > Date.now()) return;
    const job = this.download(record).finally(() => {
      this.jobs.delete(key);
      if (this.timer) setImmediate(() => this.drain());
    });
    this.jobs.set(key, job);
    return job;
  }

  private async download(record: RecordEntry) {
    if (this.active >= 2) await new Promise<void>((done) => this.waiters.push(done));
    else this.active++;
    try {
      if (this.stopped) return;
      this.makeDirs();
      const disk = statfsSync(this.root);
      if (disk.bavail * disk.bsize < 1024 * 1024 * 1024) throw new Error("less than 1 GiB free disk space");
      const signal = AbortSignal.any([this.abort.signal, AbortSignal.timeout(20_000)]);
      let url = record.url;
      let response: Response | undefined;
      // Validate every redirect, never send requests to arbitrary hosts.
      for (let hop = 0; hop < 4; hop++) {
        response = await fetch(url, { redirect: "manual", signal, headers: { Accept: "image/gif,image/webp,image/png,image/jpeg" } });
        if (![301, 302, 303, 307, 308].includes(response.status)) break;
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location) throw new Error("redirect without location");
        url = new URL(location, url).href;
        if (!isGifSourceUrl(url)) throw new Error("untrusted redirect");
        response = undefined;
      }
      if (!response?.ok || !response.body) {
        await response?.body?.cancel();
        throw new Error(`HTTP ${response?.status ?? "redirect limit"}`);
      }
      if (Number(response.headers.get("content-length")) > MAX_ASSET_BYTES) {
        await response.body.cancel();
        throw new Error("GIF exceeds 25 MiB");
      }
      const reader = response.body.getReader();
      const chunks: Buffer[] = [];
      let size = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > MAX_ASSET_BYTES) throw new Error("GIF exceeds 25 MiB");
          chunks.push(Buffer.from(chunk.value));
        }
      } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
      const bytes = Buffer.concat(chunks, size);
      const extension = imageExtension(bytes);
      if (!extension) throw new Error("unsupported image bytes");
      const file = `${createHash("sha256").update(bytes).digest("hex")}.${extension}`;
      const path = join(this.root, "files", file);
      if (!existsSync(path) || statSync(path).size !== size) this.writeAtomic(path, bytes);
      const saved: RecordEntry = { url: record.url, file, size, attempts: record.attempts + 1, nextAttemptAt: 0 };
      this.saveRecord(gifSourceKey(record.url), saved);
      Object.assign(record, saved);
      delete record.error;
      this.pending.delete(gifSourceKey(record.url));
    } catch (error) {
      if (!this.stopped) {
        record.attempts++;
        const delays = [60_000, 300_000, 1_800_000, 21_600_000, 86_400_000];
        record.nextAttemptAt = Date.now() + delays[Math.min(record.attempts - 1, delays.length - 1)];
        record.error = error instanceof Error ? error.message : String(error);
        try { this.saveRecord(gifSourceKey(record.url), record); } catch { /* DB backfill recovers if disk is unavailable. */ }
        this.logger.warn(`GIF ${gifSourceKey(record.url)} not saved: ${record.error}; will retry`);
      }
    } finally {
      const next = this.waiters.shift();
      if (next) next(); else this.active--;
    }
  }

  async buildBundleAssets(tags: unknown[]) {
    const urls = [...new Set(tags.flatMap(gifSourceUrls))];
    await Promise.all(urls.map((url) => this.ensure(url)));
    const assets: Record<string, string> = {};
    const sources: Record<string, string> = {};
    const missing: Array<{ url: string; reason: string }> = [];
    let bytesUsed = 0;
    for (const url of urls) {
      const record = this.readRecord(gifSourceKey(url));
      if (!record || !this.usable(record)) {
        missing.push({ url, reason: record?.error ?? "not downloaded" });
        continue;
      }
      const assetId = record.file!.split(".")[0];
      if (!assets[assetId]) {
        bytesUsed += record.size!;
        // Never silently turn a promised offline archive into external links.
        if (bytesUsed > MAX_BUNDLE_BYTES) throw new ServiceUnavailableException("GIF images exceed the 128 MiB JSON bundle limit. The full GIF archive remains in DATA_DIR/chat-gifs; back it up with the database.");
        const bytes = readFileSync(join(this.root, "files", record.file!));
        assets[assetId] = `data:${MIME[record.file!.split(".").pop()!]};base64,${bytes.toString("base64")}`;
      }
      sources[url] = `asset:${assetId}`;
    }
    return { assets, sources, missing };
  }
}

function imageExtension(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (/^GIF8[79]a$/.test(bytes.subarray(0, 6).toString("ascii"))) return "gif";
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg";
  return null;
}
