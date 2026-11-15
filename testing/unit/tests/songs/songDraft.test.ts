// Story 6.1.27 / G6.2 (#411): the Add Song draft survives the sign-in round trip (L2).
import { describe, expect, it } from 'vitest';
import { SONG_DRAFT_KEY, clearSongDraft, readSongDraft, writeSongDraft } from '@/lib/songs/songDraft';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => { m.delete(k); },
    setItem: (k, v) => { m.set(k, String(v)); },
  };
}

const throwing: Storage = {
  length: 0,
  clear() { throw new Error('blocked'); },
  getItem() { throw new Error('blocked'); },
  key() { return null; },
  removeItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
};

describe('song draft storage', () => {
  it('keeps the typed title and lyrics for the next visit', () => {
    const s = memoryStorage();
    writeSongDraft({ title: 'Grandmother Earth', lyrics: '[G]Mother', categoryIds: [] }, s);
    expect(readSongDraft(s)).toEqual({ title: 'Grandmother Earth', lyrics: '[G]Mother', categoryIds: [] });
  });

  it('ignores an empty draft', () => {
    const s = memoryStorage();
    writeSongDraft({ title: '', lyrics: '', categoryIds: [] }, s);
    expect(readSongDraft(s)).toBeNull();
  });

  it('ignores a corrupt draft instead of throwing', () => {
    const s = memoryStorage();
    s.setItem(SONG_DRAFT_KEY, '{not json');
    expect(readSongDraft(s)).toBeNull();
  });

  it('never throws when storage is blocked (private mode)', () => {
    expect(() => writeSongDraft({ title: 'x' }, throwing)).not.toThrow();
    expect(readSongDraft(throwing)).toBeNull();
    expect(() => clearSongDraft(throwing)).not.toThrow();
  });

  it('clears the draft after a save', () => {
    const s = memoryStorage();
    writeSongDraft({ title: 'x' }, s);
    clearSongDraft(s);
    expect(s.getItem(SONG_DRAFT_KEY)).toBeNull();
  });
});
