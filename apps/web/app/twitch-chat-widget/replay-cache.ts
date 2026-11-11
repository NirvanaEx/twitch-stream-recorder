import type { ChatResponse } from "../lib/chat-render";

// Cache raw session data: VOD offsets are applied by each consumer afterwards.
type Entry = { key: string; savedAt: number; data: ChatResponse };
const memory = new Map<string, Entry>();
const pending = new Map<string, Promise<ChatResponse>>();
const DAY = 86400000;
const MAX_MESSAGES = 300000;
let database: Promise<IDBDatabase | null> | undefined;

function openDatabase() {
  return database ??= new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 1000);
    const finish = (db: IDBDatabase | null) => { clearTimeout(timer); resolve(db); };
    try {
      const request = indexedDB.open("tsr-replay-cache", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("sessions", { keyPath: "key" });
      request.onsuccess = () => finish(request.result);
      request.onerror = request.onblocked = () => finish(null);
    } catch { finish(null); }
  });
}

async function readDisk(key: string): Promise<Entry | undefined> {
  const db = await openDatabase();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const request = db.transaction("sessions").objectStore("sessions").get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(undefined);
    } catch { resolve(undefined); }
  });
}

function remember(entry: Entry) {
  memory.delete(entry.key);
  memory.set(entry.key, entry);
  let count = 0;
  let index = 0;
  for (const item of [...memory.values()].reverse()) {
    count += item.data.messages.length;
    if (count > MAX_MESSAGES || index++ >= 8) memory.delete(item.key);
  }
}

async function writeDisk(entry: Entry) {
  const db = await openDatabase();
  if (!db || entry.data.messages.length > MAX_MESSAGES) return;
  try {
    const store = db.transaction("sessions", "readwrite").objectStore("sessions");
    store.put(entry);
    // Walk keys by age without cloning every stored transcript into memory.
    const request = store.openCursor();
    const entries: Array<{ key: IDBValidKey; savedAt: number; count: number }> = [];
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        entries.push({ key: cursor.primaryKey, savedAt: cursor.value.savedAt, count: cursor.value.data.messages.length });
        cursor.continue();
      } else {
        let count = 0;
        entries.sort((a, b) => b.savedAt - a.savedAt).forEach((item, index) => {
          count += item.count;
          if (index >= 8 || count > MAX_MESSAGES || Date.now() - item.savedAt > 7 * DAY) store.delete(item.key);
        });
      }
    };
  } catch { /* Quota/private mode must never prevent chat playback. */ }
}

export function loadCachedReplay(
  key: string, completed: boolean, load: () => Promise<ChatResponse>,
): Promise<ChatResponse> {
  const running = pending.get(key);
  if (running) return running;
  const task = (async () => {
    const cached = memory.get(key) ?? (completed ? await readDisk(key) : undefined);
    const age = cached ? Date.now() - cached.savedAt : Infinity;
    if (cached && age >= 0 && age < (completed ? DAY : 15000) && Array.isArray(cached.data?.messages)) {
      remember(cached);
      return cached.data;
    }
    let data: ChatResponse;
    try { data = await load(); }
    catch (error) {
      if (completed && cached && age >= 0 && age < 7 * DAY && Array.isArray(cached.data?.messages)) {
        remember(cached);
        return cached.data;
      }
      throw error;
    }
    if (!Array.isArray(data?.messages)) throw new Error("Invalid replay response");
    const entry = { key, savedAt: Date.now(), data };
    remember(entry);
    if (completed) void writeDisk(entry);
    return data;
  })();
  pending.set(key, task);
  void task.finally(() => { if (pending.get(key) === task) pending.delete(key); }).catch(() => {});
  return task;
}
