import { Injectable, Logger } from "@nestjs/common";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { EmoteEntry, EmoteSnapshotPayload } from "./seventv.service";

/**
 * Local copy of every 7TV image a recording needs.
 *
 * The per-session snapshot already freezes *which* emotes existed and under
 * what name, so a streamer reshuffling their set later cannot change an old
 * recording. What it did not survive was the picture disappearing: entries
 * carried only a cdn.7tv.app url, and an emote deleted from 7TV (by its owner,
 * by moderation, by a takedown) turns every old chat replay into broken
 * <img> boxes. Nothing was stored on our side to fall back to.
 *
 * So the bytes are mirrored at snapshot time. Files are keyed by 7TV emote id,
 * which is content-immutable — editing an emote on 7TV mints a new id rather
 * than replacing the image — so one file serves every session and every channel
 * that uses it. In practice the second recording of a channel downloads almost
 * nothing.
 *
 * Everything here is best-effort. A failed download just leaves `localUrl`
 * unset on that entry and the renderer falls back to the CDN, which is exactly
 * the old behaviour.
 */

const MAX_EMOTE_BYTES = 2 * 1024 * 1024;
const DOWNLOAD_CONCURRENCY = 5;
const DOWNLOAD_TIMEOUT_MS = 15_000;

/** Raw image bytes a single .tsr.json bundle may inline before we stop. */
const MAX_BUNDLE_IMAGE_BYTES = 8 * 1024 * 1024;

// 7TV ids are ULIDs. Anything else must never reach the filesystem — this
// value ends up in a path and, via the serving endpoint, comes back from a URL.
const SAFE_ID = /^[A-Za-z0-9]{1,64}$/;

const EXTENSION_MIME: Record<string, string> = {
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

@Injectable()
export class EmoteMirrorService {
  private readonly logger = new Logger(EmoteMirrorService.name);

  directory() {
    return resolve(process.env.DATA_DIR ?? "./data", "emotes");
  }

  /**
   * Download every emote that is not on disk yet and return the entries with
   * `localUrl` filled in for the ones we now hold. The input is not mutated.
   */
  async mirror(emotes: EmoteEntry[]): Promise<{ entries: EmoteEntry[]; downloaded: number }> {
    if (emotes.length === 0) {
      return { entries: emotes, downloaded: 0 };
    }

    const directory = this.directory();

    try {
      mkdirSync(directory, { recursive: true });
    } catch (error) {
      this.logger.warn(
        `Emote mirror directory ${directory} is unusable: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { entries: emotes, downloaded: 0 };
    }

    const results = new Array<EmoteEntry>(emotes.length);
    let downloaded = 0;
    let cursor = 0;

    const worker = async () => {
      while (cursor < emotes.length) {
        const index = cursor++;
        const emote = emotes[index];
        const fileName = this.fileNameFor(emote);

        if (!fileName) {
          results[index] = emote;
          continue;
        }

        const absolutePath = join(directory, fileName);

        if (this.isUsableFile(absolutePath)) {
          results[index] = { ...emote, localUrl: this.publicPath(fileName) };
          continue;
        }

        const saved = await this.download(emote.url, absolutePath);

        if (saved) {
          downloaded += 1;
          results[index] = { ...emote, localUrl: this.publicPath(fileName) };
        } else {
          results[index] = emote;
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, emotes.length) }, () => worker()),
    );

    return { entries: results, downloaded };
  }

  /**
   * Absolute path of a mirrored file, or null when the name is not one we
   * could have written. Guards the serving endpoint against traversal.
   */
  resolveFile(fileName: string): string | null {
    const match = /^([A-Za-z0-9]{1,64})\.([a-z]{3,4})$/.exec(fileName);

    if (!match || !EXTENSION_MIME[match[2]]) {
      return null;
    }

    const absolutePath = join(this.directory(), `${match[1]}.${match[2]}`);
    return this.isUsableFile(absolutePath) ? absolutePath : null;
  }

  contentTypeFor(fileName: string) {
    const extension = fileName.split(".").pop() ?? "";
    return EXTENSION_MIME[extension] ?? "application/octet-stream";
  }

  /**
   * Snapshot for a .tsr.json bundle, with the images of the emotes that the
   * chat actually uses inlined as data URIs.
   *
   * Only used emotes are inlined, and that is lossless: an emote whose name
   * appears in no message can never be rendered by this replay. It also keeps
   * the bundle small — a set is often ~700 emotes while a stream uses a couple
   * of hundred.
   */
  buildBundleSnapshot(
    payload: EmoteSnapshotPayload | null,
    messageTexts: string[],
  ): EmoteSnapshotPayload | null {
    if (!payload?.emotes?.length) {
      return payload;
    }

    const used = new Set<string>();

    for (const text of messageTexts) {
      for (const word of text.split(/\s+/)) {
        if (word) used.add(word);
      }
    }

    let budget = MAX_BUNDLE_IMAGE_BYTES;
    let inlined = 0;
    let skipped = 0;

    const emotes = payload.emotes.map((emote) => {
      if (!used.has(emote.name)) {
        // Strip localUrl: it points at this server, which the offline replay
        // cannot reach anyway. The CDN url stays as the only usable source.
        const { localUrl: _localUrl, ...rest } = emote;
        return rest;
      }

      const fileName = this.fileNameFor(emote);
      const absolutePath = fileName ? join(this.directory(), fileName) : null;

      if (!absolutePath || !this.isUsableFile(absolutePath)) {
        const { localUrl: _localUrl, ...rest } = emote;
        return rest;
      }

      try {
        const size = statSync(absolutePath).size;

        if (size > budget) {
          skipped += 1;
          const { localUrl: _localUrl, ...rest } = emote;
          return rest;
        }

        const buffer = readFileSync(absolutePath);
        budget -= size;
        inlined += 1;

        return {
          ...emote,
          // The bundle is opened from a file:// page with no network — the
          // image has to travel inside it.
          localUrl: `data:${this.contentTypeFor(fileName!)};base64,${buffer.toString("base64")}`,
        };
      } catch {
        const { localUrl: _localUrl, ...rest } = emote;
        return rest;
      }
    });

    if (skipped > 0) {
      this.logger.warn(
        `Bundle emote budget exhausted: ${inlined} inlined, ${skipped} left as CDN links.`,
      );
    }

    return { ...payload, emotes };
  }

  private publicPath(fileName: string) {
    return `public/emotes/${fileName}`;
  }

  private fileNameFor(emote: EmoteEntry) {
    if (!SAFE_ID.test(emote.id)) {
      return null;
    }

    const extension = (emote.url.split(".").pop() ?? "").toLowerCase();
    return EXTENSION_MIME[extension] ? `${emote.id}.${extension}` : `${emote.id}.webp`;
  }

  private isUsableFile(absolutePath: string) {
    try {
      return existsSync(absolutePath) && statSync(absolutePath).size > 0;
    } catch {
      return false;
    }
  }

  private async download(url: string, absolutePath: string) {
    // Written under a temp name and renamed, so a download killed mid-flight
    // cannot leave a truncated image that later looks cached.
    const temporaryPath = `${absolutePath}.part`;

    try {
      const response = await fetch(url, {
        headers: { Accept: "image/webp,image/*" },
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      });

      if (!response.ok) {
        return false;
      }

      const declaredLength = Number(response.headers.get("content-length") ?? "0");

      if (declaredLength > MAX_EMOTE_BYTES) {
        this.logger.warn(`Emote ${url} is ${declaredLength} bytes — skipped.`);
        return false;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (buffer.length === 0 || buffer.length > MAX_EMOTE_BYTES) {
        return false;
      }

      writeFileSync(temporaryPath, buffer);
      renameSync(temporaryPath, absolutePath);
      return true;
    } catch {
      try {
        rmSync(temporaryPath, { force: true });
      } catch {
        // Best-effort cleanup.
      }

      return false;
    }
  }
}
