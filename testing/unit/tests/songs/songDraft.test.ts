// Story 6.1.27 / G6.2 (#411): the Add Song draft survives the sign-in round trip (L2).
// #607: a member's draft is never shown to another person on the same device.
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
    writeSongDraft({ title: 'Grandmother Earth', lyrics: '[G]Mother', categoryIds: [] }, null, s);
    expect(readSongDraft(null, s)).toEqual({ title: 'Grandmother Earth', lyrics: '[G]Mother', categoryIds: [] });
  });

  it('ignores an empty draft', () => {
    const s = memoryStorage();
    writeSongDraft({ title: '', lyrics: '', categoryIds: [] }, null, s);
    expect(readSongDraft(null, s)).toBeNull();
  });

  it('ignores a corrupt draft instead of throwing', () => {
    const s = memoryStorage();
    s.setItem(SONG_DRAFT_KEY, '{not json');
    expect(readSongDraft(null, s)).toBeNull();
  });

  it('never throws when storage is blocked (private mode)', () => {
    expect(() => writeSongDraft({ title: 'x' }, 'u1', throwing)).not.toThrow();
    expect(readSongDraft('u1', throwing)).toBeNull();
    expect(() => clearSongDraft(throwing)).not.toThrow();
  });

  it('clears the draft after a save', () => {
    const s = memoryStorage();
    writeSongDraft({ title: 'x' }, null, s);
    clearSongDraft(s);
    expect(s.getItem(SONG_DRAFT_KEY)).toBeNull();
  });
});

describe('song draft owner (#607)', () => {
  it('gives a member back their own draft', () => {
    const s = memoryStorage();
    writeSongDraft({ title: 'Mine' }, 'member-a', s);
    expect(readSongDraft('member-a', s)).toEqual({ title: 'Mine' });
  });

  it('removes a member draft instead of showing it to a guest', () => {
    const s = memoryStorage();
    writeSongDraft({ title: 'Private words' }, 'member-a', s);
    expect(readSongDraft(null, s)).toBeNull();
    expect(s.getItem(SONG_DRAFT_KEY)).toBeNull();
  });

  it('removes a member draft instead of showing it to another member', () => {
    const s = memoryStorage();
    writeSongDraft({ title: 'Private words' }, 'member-a', s);
    expect(readSongDraft('member-b', s)).toBeNull();
    expect(s.getItem(SONG_DRAFT_KEY)).toBeNull();
  });

  it('keeps a guest draft for the person who signs in to save it (#229)', () => {
    const s = memoryStorage();
    writeSongDraft({ title: 'Guest song' }, null, s);
    expect(readSongDraft('member-a', s)).toEqual({ title: 'Guest song' });
  });

  it('drops a draft stored before owners were recorded', () => {
    const s = memoryStorage();
    s.setItem(SONG_DRAFT_KEY, JSON.stringify({ title: 'Old format' }));
    expect(readSongDraft(null, s)).toBeNull();
    expect(readSongDraft('member-a', s)).toBeNull();
  });
});
