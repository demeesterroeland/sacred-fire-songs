/**
 * Add Song draft in localStorage (Story 3.1.4.4; Story 6.1.27 / G6.2, #411).
 * A guest can type a song, sign in, and come back to the same form: the draft
 * is read on mount and written on every change. Storage may be blocked (private
 * mode, cleared site data), so every access is guarded and never throws.
 *
 * #607: the draft records its owner (the member id, or null for a guest). A
 * member's draft is only returned to that member; for anyone else it is
 * removed. A guest draft is returned to whoever signs in, so a guest can sign in
 * to save it (#229). `useAuth` removes the draft at sign-out.
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

interface StoredDraft {
  owner: string | null;
  draft: Draft;
}

function parse(raw: string | null | undefined): StoredDraft | null {
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const { owner, draft } = parsed as Partial<StoredDraft>;
  if (owner !== null && typeof owner !== 'string') return null; // older format without an owner
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return null;
  return { owner, draft };
}

/**
 * The draft for `viewerId` (a member id, or null for a guest), or null when
 * there is none, it is empty or corrupt, storage is blocked, or it belongs to
 * another member. In that last case the draft is also removed.
 */
export function readSongDraft(viewerId: string | null, storage: Storage | null = browserStorage()): Draft | null {
  try {
    const stored = parse(storage?.getItem(SONG_DRAFT_KEY));
    if (!stored) {
      clearSongDraft(storage);
      return null;
    }
    if (stored.owner !== null && stored.owner !== viewerId) {
      clearSongDraft(storage);
      return null;
    }
    return hasData(stored.draft) ? stored.draft : null;
  } catch {
    clearSongDraft(storage);
    return null;
  }
}

/** Stores the draft for `ownerId` (a member id, or null for a guest). */
export function writeSongDraft(draft: Draft, ownerId: string | null, storage: Storage | null = browserStorage()): void {
  try {
    const stored: StoredDraft = { owner: ownerId, draft };
    storage?.setItem(SONG_DRAFT_KEY, JSON.stringify(stored));
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
