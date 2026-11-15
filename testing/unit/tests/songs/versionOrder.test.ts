// Story 6.1.11 / G2.6 (#395, UXA-049): one stable version order for the page, the edit form and the list.
import { describe, expect, it } from 'vitest';
import { editSongHref, firstVersion, pickVersion, sortVersions, songVersionHref } from '@/lib/songs/versionOrder';

describe('sortVersions', () => {
  it('orders oldest first without mutating the input', () => {
    const input = [
      { id: 'c', created_at: '2026-03-01T00:00:00Z' },
      { id: 'a', created_at: '2026-01-01T00:00:00Z' },
      { id: 'b', created_at: '2026-02-01T00:00:00Z' },
    ];
    expect(sortVersions(input).map((v) => v.id)).toEqual(['a', 'b', 'c']);
    expect(input.map((v) => v.id)).toEqual(['c', 'a', 'b']);
  });

  it('breaks identical timestamps by id, so the order never depends on the database', () => {
    const t = '2026-01-01T00:00:00Z';
    const a = sortVersions([{ id: 'b', created_at: t }, { id: 'c', created_at: t }, { id: 'a', created_at: t }]);
    const b = sortVersions([{ id: 'a', created_at: t }, { id: 'c', created_at: t }, { id: 'b', created_at: t }]);
    expect(a.map((v) => v.id)).toEqual(['a', 'b', 'c']);
    expect(b.map((v) => v.id)).toEqual(['a', 'b', 'c']);
  });

  it('compares instants, not spellings of them', () => {
    const list = [
      { id: 'late', created_at: '2026-01-01T01:00:00+00:00' },
      { id: 'early', created_at: '2026-01-01T00:30:00.000Z' },
    ];
    expect(sortVersions(list).map((v) => v.id)).toEqual(['early', 'late']);
  });

  it('puts rows without a timestamp last and tolerates null or missing lists', () => {
    expect(sortVersions([{ id: 'x' }, { id: 'y', created_at: '2026-01-01T00:00:00Z' }]).map((v) => v.id)).toEqual(['y', 'x']);
    expect(sortVersions(null)).toEqual([]);
    expect(sortVersions(undefined)).toEqual([]);
  });
});

describe('firstVersion', () => {
  it('is the oldest version, or undefined without versions', () => {
    expect(firstVersion([{ id: 'b', created_at: '2026-02-01T00:00:00Z' }, { id: 'a', created_at: '2026-01-01T00:00:00Z' }])?.id).toBe('a');
    expect(firstVersion([])).toBeUndefined();
    expect(firstVersion(null)).toBeUndefined();
  });
});

describe('pickVersion (the version Edit opens)', () => {
  const list = [
    { id: 'b', created_at: '2026-02-01T00:00:00Z' },
    { id: 'a', created_at: '2026-01-01T00:00:00Z' },
  ];
  it('opens the asked version when it exists', () => {
    expect(pickVersion(list, 'b')?.id).toBe('b');
  });
  it('falls back to the first (oldest) version for no, blank or unknown ids', () => {
    expect(pickVersion(list, null)?.id).toBe('a');
    expect(pickVersion(list, '')?.id).toBe('a');
    expect(pickVersion(list, 'zzz')?.id).toBe('a');
    expect(pickVersion([], 'a')).toBeUndefined();
  });
});

describe('editSongHref', () => {
  it('opens Edit on the version being read', () => {
    expect(editSongHref('s1', 'v2')).toBe('/songs/s1/edit?version=v2');
  });
  it('is the plain edit URL without a version', () => {
    expect(editSongHref('s1', undefined)).toBe('/songs/s1/edit');
  });
});

describe('songVersionHref (where Save returns to)', () => {
  it('opens the reader on the version that was edited', () => {
    expect(songVersionHref('s1', 'v2')).toBe('/songs/s1?version=v2');
  });
  it('is the plain song URL without a version', () => {
    expect(songVersionHref('s1', undefined)).toBe('/songs/s1');
  });
});
