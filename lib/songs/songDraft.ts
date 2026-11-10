/**
 * Add Song draft in localStorage (Story 3.1.4.4; Story 6.1.27 / G6.2, #411).
 * A guest can type a song, sign in, and come back to the same form: the draft
 * is read on mount and written on every change. Storage may be blocked (private
 * mode, cleared site data), so every access is guarded and never throws.
 */
export const SONG_DRAFT_KEY = 'song-form-draft';

type Draft = Record<string, unknown>;

function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function hasData(draft: Draft): boolean {
  return Object.values(draft).some((v) => (Array.isArray(v) ? v.length > 0 : !!v));
}

/** The saved draft, or null when there is none, it is empty, corrupt or storage is blocked. */
export function readSongDraft(storage: Storage | null = browserStorage()): Draft | null {
  try {
    const raw = storage?.getItem(SONG_DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return hasData(parsed as Draft) ? (parsed as Draft) : null;
  } catch {
    return null;
  }
}

export function writeSongDraft(draft: Draft, storage: Storage | null = browserStorage()): void {
  try {
    storage?.setItem(SONG_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage blocked or full: the form still works, only the draft is not kept */
  }
}

export function clearSongDraft(storage: Storage | null = browserStorage()): void {
  try {
    storage?.removeItem(SONG_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
