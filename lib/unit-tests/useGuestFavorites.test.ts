import { describe, it, expect, beforeEach } from 'vitest';

const STORAGE_KEY = 'sfs_guest_favorites';

// Pure logic extracted from hook for unit testing
function readIds(storage: Record<string, string>): Set<string> {
  try {
    const raw = storage[STORAGE_KEY];
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeIds(storage: Record<string, string>, ids: Set<string>) {
  storage[STORAGE_KEY] = JSON.stringify([...ids]);
}

function toggle(storage: Record<string, string>, id: string): { isFavorited: boolean; count: number } {
  const ids = readIds(storage);
  if (ids.has(id)) {
    ids.delete(id);
  } else {
    ids.add(id);
  }
  writeIds(storage, ids);
  return { isFavorited: ids.has(id), count: ids.size };
}

describe('guest favorites logic', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
  });

  it('starts empty', () => {
    expect(readIds(storage).size).toBe(0);
  });

  it('adds a favorite', () => {
    const result = toggle(storage, 'song-1');
    expect(result.isFavorited).toBe(true);
    expect(result.count).toBe(1);
    expect(readIds(storage).has('song-1')).toBe(true);
  });

  it('removes an existing favorite', () => {
    toggle(storage, 'song-1');
    const result = toggle(storage, 'song-1');
    expect(result.isFavorited).toBe(false);
    expect(result.count).toBe(0);
  });

  it('tracks multiple favorites independently', () => {
    toggle(storage, 'song-1');
    toggle(storage, 'song-2');
    const ids = readIds(storage);
    expect(ids.has('song-1')).toBe(true);
    expect(ids.has('song-2')).toBe(true);
    expect(ids.size).toBe(2);
  });

  it('handles corrupt storage gracefully', () => {
    storage[STORAGE_KEY] = 'not-valid-json{{{';
    expect(readIds(storage).size).toBe(0);
  });
});
