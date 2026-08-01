import { Injectable, Logger } from "@nestjs/common";
import * as fs from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { PrismaService } from "../prisma/prisma.service";

// Files younger than this are treated as busy: streamlink/ffmpeg may still be
// writing them even if the DB row does not reference them yet.
const RECENT_FILE_MS = 10 * 60 * 1000;

// The disk table pages through the biggest files; totals are always computed
// over all of them. The cap exists so one scan cannot return a hundred
// thousand rows — it is high enough that paging reaches the end in practice,
// and the response says when it did not.
const MAX_LISTED_FILES = 3000;

// Top-level dirs whose files are never orphans. The 7TV emote mirror is
// referenced only from a JSON blob inside EmoteSnapshot, never by a path
// column, so the reference map cannot see it — without this every mirrored
// image would be offered up for deletion, which is precisely the copy that
// keeps old chat replays alive once 7TV drops an emote.
const NEVER_ORPHAN_DIRS = new Set(["emotes"]);

type FileRef = {
  sessionId: string;
  channelLogin: string;
  title: string | null;
  status: string;
  field: "video" | "audio" | "chat" | "source";
};

type DiskFile = {
  absPath: string;
  path: string; // relative to DATA_DIR, posix separators
  dir: string; // top-level dir: records, chat, tmp, ...
  sizeBytes: number;
  mtimeMs: number;
  kind: "video" | "audio" | "source" | "chat" | "other";
  ref: FileRef | null;
  orphan: boolean;
  locked: boolean; // belongs to an active recording
  recent: boolean; // modified moments ago — may still be written to
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get dataRoot() {
    return resolve(process.env.DATA_DIR ?? "./data");
  }

  /**
   * Полная ревизия диска: каждый файл в DATA_DIR сопоставляется с сессиями в
   * базе. Файл без ссылки из базы — «лишний» (осиротевший .ts от прерванной
   * записи, остатки удалённых архивов и т.п.), его можно удалять безопасно.
   */
  async scanDisk() {
    const { refs, sessions } = await this.buildReferenceMap();
    const files = this.walkDataDir(refs);

    const dirTotals = new Map<string, { fileCount: number; totalBytes: number }>();
    const kindTotals = new Map<string, { fileCount: number; totalBytes: number }>();
    let totalBytes = 0;
    let orphanBytes = 0;
    let orphanCount = 0;

    for (const file of files) {
      totalBytes += file.sizeBytes;
      const dirStat = dirTotals.get(file.dir) ?? { fileCount: 0, totalBytes: 0 };
      dirStat.fileCount += 1;
      dirStat.totalBytes += file.sizeBytes;
      dirTotals.set(file.dir, dirStat);
      const kindStat = kindTotals.get(file.kind) ?? { fileCount: 0, totalBytes: 0 };
      kindStat.fileCount += 1;
      kindStat.totalBytes += file.sizeBytes;
      kindTotals.set(file.kind, kindStat);
      if (file.orphan) {
        orphanCount += 1;
        orphanBytes += file.sizeBytes;
      }
    }

    const sorted = [...files].sort((a, b) => b.sizeBytes - a.sizeBytes);
    const listed = sorted.slice(0, MAX_LISTED_FILES);

    // Обратная проверка: пути из базы, за которыми нет файла. Отсутствие
    // локальной копии после выгрузки в Telegram — норма, остальное — потеря.
    const missing: Array<{
      sessionId: string;
      channelLogin: string;
      title: string | null;
      status: string;
      field: FileRef["field"];
      path: string;
      expected: boolean;
    }> = [];
    for (const session of sessions) {
      const seen = new Set<string>();
      const checks: Array<[string | null, FileRef["field"]]> = [
        [session.recordingPath, "video"],
        [session.playbackPath, "video"],
        [session.audioPath, "audio"],
        [session.chatPath, "chat"],
      ];
      for (const [storedPath, field] of checks) {
        if (!storedPath) continue;
        const abs = resolve(storedPath);
        if (seen.has(abs)) continue;
        seen.add(abs);
        if (fs.existsSync(abs)) continue;
        const rel = relative(this.dataRoot, abs);
        missing.push({
          sessionId: session.id,
          channelLogin: session.channel.twitchLogin,
          title: session.title,
          status: session.status,
          field,
          path: rel.startsWith("..") ? abs : rel.split(sep).join("/"),
          // A local copy dropped by the retention cleanup is not a loss: the
          // Telegram copy is still there and playback falls back to it.
          expected:
            (field === "video" && Boolean(session.localFileDeletedAt)) ||
            (field === "audio" && Boolean(session.audioLocalDeletedAt)),
        });
      }
    }
    missing.sort((a, b) => Number(a.expected) - Number(b.expected));

    return {
      dataRoot: this.dataRoot,
      disk: this.getDiskSpace(),
      dbSizeBytes: await this.getDbSizeBytes(),
      missing: missing.slice(0, 200),
      missingTruncated: missing.length > 200,
      // Per-directory rows carry their share of the total so the table can
      // show proportion without the client re-deriving it from two columns.
      dirs: [...dirTotals.entries()]
        .map(([name, stat]) => ({
          name,
          fileCount: stat.fileCount,
          totalBytes: String(stat.totalBytes),
          sharePercent: totalBytes > 0 ? Math.round((stat.totalBytes / totalBytes) * 1000) / 10 : 0,
        }))
        .sort((a, b) => Number(b.totalBytes) - Number(a.totalBytes)),
      // Counts by kind: "what is actually eating the disk" is a different
      // question from "which folder is it in".
      kinds: [...kindTotals.entries()]
        .map(([kind, stat]) => ({
          kind,
          fileCount: stat.fileCount,
          totalBytes: String(stat.totalBytes),
        }))
        .sort((a, b) => Number(b.totalBytes) - Number(a.totalBytes)),
      fileCount: files.length,
      totalBytes: String(totalBytes),
      orphanCount,
      orphanBytes: String(orphanBytes),
      truncated: files.length > listed.length,
      files: listed.map((file) => ({
        path: file.path,
        dir: file.dir,
        sizeBytes: String(file.sizeBytes),
        mtime: new Date(file.mtimeMs).toISOString(),
        kind: file.kind,
        orphan: file.orphan,
        locked: file.locked,
        recent: file.recent,
        session: file.ref
          ? {
              id: file.ref.sessionId,
              channelLogin: file.ref.channelLogin,
              title: file.ref.title,
              status: file.ref.status,
              field: file.ref.field,
            }
          : null,
      })),
    };
  }

  /**
   * Удаляет лишние файлы. Без списка путей — все; со списком — только
   * перечисленные. Пути перепроверяются на месте: удалить файл, на который
   * ссылается база или который пишется прямо сейчас, через этот путь нельзя.
   */
  async cleanupOrphans(paths?: string[]) {
    const { refs } = await this.buildReferenceMap();
    const files = this.walkDataDir(refs);
    const orphans = files.filter((file) => file.orphan);
    const byPath = new Map(orphans.map((file) => [file.path, file]));

    let targets: DiskFile[];
    const skipped: Array<{ path: string; reason: string }> = [];

    if (paths && paths.length) {
      targets = [];
      for (const raw of paths) {
        const normalized = String(raw).replace(/\\/g, "/").replace(/^\/+/, "");
        const hit = byPath.get(normalized);
        if (hit) {
          targets.push(hit);
          continue;
        }
        const known = files.find((file) => file.path === normalized);
        skipped.push({
          path: normalized,
          reason: known
            ? known.locked
              ? "active-recording"
              : known.recent
                ? "recently-modified"
                : "referenced-by-session"
            : "not-found",
        });
      }
    } else {
      targets = orphans;
    }

    let deletedCount = 0;
    let freedBytes = 0;

    for (const file of targets) {
      try {
        fs.rmSync(file.absPath, { force: true });
        deletedCount += 1;
        freedBytes += file.sizeBytes;
      } catch (error) {
        skipped.push({
          path: file.path,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (deletedCount > 0) {
      this.logger.log(
        `Disk cleanup removed ${deletedCount} orphan file(s), freed ${freedBytes} bytes.`,
      );
    }

    return { deletedCount, freedBytes: String(freedBytes), skipped };
  }

  private getDiskSpace() {
    // statfs появился в Node 18.15 — на старом рантайме просто не показываем.
    const statfsSync = (fs as unknown as {
      statfsSync?: (path: string) => { bsize: number; blocks: number; bavail: number };
    }).statfsSync;
    if (typeof statfsSync !== "function") return null;
    try {
      const stat = statfsSync(this.dataRoot);
      return {
        totalBytes: String(stat.bsize * stat.blocks),
        freeBytes: String(stat.bsize * stat.bavail),
      };
    } catch {
      return null;
    }
  }

  private async getDbSizeBytes(): Promise<string | null> {
    try {
      const rows = await this.prisma.$queryRaw<Array<{ size: bigint }>>`
        SELECT pg_database_size(current_database()) AS size
      `;
      return rows && rows[0] ? String(rows[0].size) : null;
    } catch {
      return null; // не Postgres или нет прав — карточку просто не покажем
    }
  }

  private walkDataDir(refs: Map<string, FileRef>): DiskFile[] {
    const root = this.dataRoot;
    const out: DiskFile[] = [];
    const now = Date.now();

    const walk = (dir: string, depth: number) => {
      if (depth > 8) return;
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const absPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(absPath, depth + 1);
          continue;
        }
        if (!entry.isFile()) continue;
        let stat: fs.Stats;
        try {
          stat = fs.statSync(absPath);
        } catch {
          continue;
        }
        const rel = relative(root, absPath).split(sep).join("/");
        const ref = refs.get(resolve(absPath)) ?? null;
        const locked = Boolean(ref && ref.status === "recording");
        const recent = !ref && now - stat.mtimeMs < RECENT_FILE_MS;
        const topDir = rel.includes("/") ? rel.slice(0, rel.indexOf("/")) : ".";
        out.push({
          absPath,
          path: rel,
          dir: topDir,
          sizeBytes: stat.size,
          mtimeMs: stat.mtimeMs,
          kind: this.kindOf(rel),
          ref,
          orphan: !ref && !recent && !NEVER_ORPHAN_DIRS.has(topDir),
          locked,
          recent,
        });
      }
    };

    walk(root, 0);
    return out;
  }

  private kindOf(relPath: string): DiskFile["kind"] {
    const lower = relPath.toLowerCase();
    if (lower.endsWith(".mp4")) return "video";
    if (lower.endsWith(".m4a")) return "audio";
    if (lower.endsWith(".ts")) return "source";
    if (lower.endsWith(".json") || lower.endsWith(".jsonl")) return "chat";
    return "other";
  }

  /**
   * Карта «абсолютный путь → кто им владеет». Помимо путей из базы регистрируем
   * .ts-исходники записываемых и упавших сессий: их подберёт восстановление
   * после рестарта, удалять их как мусор нельзя.
   */
  private async buildReferenceMap() {
    const sessions = await this.prisma.streamSession.findMany({
      where: {
        OR: [
          { recordingPath: { not: null } },
          { playbackPath: { not: null } },
          { audioPath: { not: null } },
          { chatPath: { not: null } },
        ],
      },
      select: {
        id: true,
        status: true,
        title: true,
        recordingPath: true,
        playbackPath: true,
        audioPath: true,
        chatPath: true,
        localFileDeletedAt: true,
        audioLocalDeletedAt: true,
        channel: { select: { twitchLogin: true } },
      },
    });

    const refs = new Map<string, FileRef>();

    const register = (path: string | null, field: FileRef["field"], session: (typeof sessions)[number]) => {
      if (!path) return;
      const key = resolve(path);
      if (refs.has(key)) return;
      refs.set(key, {
        sessionId: session.id,
        channelLogin: session.channel.twitchLogin,
        title: session.title,
        status: session.status,
        field,
      });
    };

    for (const session of sessions) {
      register(session.recordingPath, "video", session);
      register(session.playbackPath, "video", session);
      register(session.audioPath, "audio", session);
      register(session.chatPath, "chat", session);

      // Исходник .ts жив, пока идёт запись или пока сессия ждёт восстановления
      // после сбоя. У завершённых сессий забытый .ts — обычный мусор.
      if (session.status === "recording" || session.status === "error") {
        for (const mediaPath of [session.recordingPath, session.playbackPath]) {
          if (!mediaPath) continue;
          register(resolve(mediaPath).replace(/\.(mp4|m4a)$/i, ".ts"), "source", session);
        }
      }
    }

    return { refs, sessions };
  }
}
