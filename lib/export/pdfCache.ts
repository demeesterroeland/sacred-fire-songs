/**
 * Reuse the last generated setlist PDF while the playlist is unchanged (#304).
 *
 * "Dirty" is decided by a fingerprint of everything that ends up in the PDF:
 * playlist title/description, the ordered songs with their content, key, capo,
 * transposition and URL, plus the interface language, the site URL and the
 * user. Any change (order, added, removed, song edited, language switched)
 * gives a new fingerprint and therefore a fresh PDF.
 *
 * One cache entry per user + playlist (overwritten on regeneration), stored in
 * IndexedDB in the browser. Cache problems never block an export: they fall
 * back to generating the PDF.
 */

import type { ExportSongData } from './pdfExport';

export interface ExportFingerprintInput {
  userId: string;
  playlistId: string;
  locale: string;
  baseUrl?: string;
  title: string;
  description?: string | null;
  songs: ExportSongData[];
}

export interface CachedPdf {
  fingerprint: string;
  blob: Blob;
}

export interface PdfCacheStore {
  get(key: string): Promise<CachedPdf | undefined>;
  set(key: string, entry: CachedPdf): Promise<void>;
  clear(): Promise<void>;
}

export const pdfCacheKey = (userId: string, playlistId: string) => `${userId}:${playlistId}`;

/** SHA-256 (hex) of the export input in a fixed field order. */
export async function exportFingerprint(input: ExportFingerprintInput): Promise<string> {
  const canonical = JSON.stringify([
    input.userId,
    input.playlistId,
    input.locale,
    input.baseUrl ?? '',
    input.title,
    input.description ?? '',
    input.songs.map((s) => [
      s.title,
      s.author ?? '',
      s.key ?? '',
      s.capo ?? null,
      s.transposition ?? null,
      s.tuning ?? '',
      s.url ?? '',
      s.content,
    ]),
  ]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Returns the cached PDF when the fingerprint matches, otherwise generates and stores a new one. */
export async function getOrCreatePdf({
  store,
  key,
  fingerprint,
  generate,
}: {
  store: PdfCacheStore;
  key: string;
  fingerprint: string;
  generate: () => Promise<Blob>;
}): Promise<{ blob: Blob; reused: boolean }> {
  try {
    const cached = await store.get(key);
    if (cached?.fingerprint === fingerprint) return { blob: cached.blob, reused: true };
  } catch {
    // Unreadable cache: generate below.
  }
  const blob = await generate();
  try {
    await store.set(key, { fingerprint, blob });
  } catch {
    // Unwritable cache (quota, private mode): the export itself still succeeds.
  }
  return { blob, reused: false };
}

export function memoryPdfStore(): PdfCacheStore {
  const entries = new Map<string, CachedPdf>();
  return {
    get: async (key) => entries.get(key),
    set: async (key, entry) => void entries.set(key, entry),
    clear: async () => entries.clear(),
  };
}

const DB_NAME = 'sacred-fire-songs-pdf-cache';
const STORE = 'pdfs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = op(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(request.result as T);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      })
  );
}

/** Browser store (IndexedDB); falls back to an in-memory store when IndexedDB is unavailable. */
export function browserPdfStore(): PdfCacheStore {
  if (typeof indexedDB === 'undefined') return memoryPdfStore();
  return {
    get: (key) => run<CachedPdf | undefined>('readonly', (s) => s.get(key)),
    set: (key, entry) => run<void>('readwrite', (s) => s.put(entry, key)),
    clear: () => run<void>('readwrite', (s) => s.clear()),
  };
}

/** Forget every cached PDF, e.g. on sign-out so private setlists don't linger on a shared device. */
export async function clearPdfCache(): Promise<void> {
  try {
    await browserPdfStore().clear();
  } catch {
    // Nothing cached or IndexedDB blocked.
  }
}
