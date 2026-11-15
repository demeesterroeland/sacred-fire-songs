// Story 6.2.22 / G5.5 (#542): the "+ Add Songs" sheet finds songs with the song list's own matcher and ranking.
import { describe, expect, it } from 'vitest';
import { ADD_SONGS_RESULT_LIMIT, addSongsResults } from '@/lib/playlists/addSongsSearch';
import { rankSongsBySearch, songMatchesSearch } from '@/lib/songs/search';
import type { Song } from '@/lib/songUtils';

let n = 0;
const song = (over: Partial<Song>): Song =>
  ({ id: `s${++n}`, title: 'Untitled', author: '', authors: [], aliases: [], sourceTitles: [], songKey: null, color: 'red', createdAt: '2026-01-01T00:00:00Z', categories: [], ...over }) as Song;

describe('addSongsResults', () => {
  it('finds a song by an alias', () => {
    const madre = song({ title: 'Madre Tierra', aliases: ['Pachamama'] });
    expect(addSongsResults([song({ title: 'Other' }), madre], 'pachamama')).toEqual([madre]);
  });

  it('finds a song by any author, even one the row does not show', () => {
    const huey = song({ title: 'Huey', author: 'Anna Lee', authors: ['Anna Lee', 'Ben Cruz'] });
    expect(addSongsResults([huey], 'ben cruz')).toEqual([huey]);
  });

  it('finds a song by its title in a songbook', () => {
    const huey = song({ title: 'Huey', sourceTitles: ['Canto a la Madre Tierra'] });
    expect(addSongsResults([huey], 'canto a la')).toEqual([huey]);
  });

  it('ignores case and accents, like the list', () => {
    const a = song({ title: 'A', aliases: ['Pachamamá'] });
    expect(addSongsResults([a], 'PACHAMAMA')).toEqual([a]);
  });

  it('puts songs whose title matched before songs found by something else (the list ranking)', () => {
    const byAlias = song({ title: 'Alpha', aliases: ['Huey Madre'] });
    const byTitle = song({ title: 'Huey Tonantzin' });
    expect(addSongsResults([byAlias, byTitle], 'huey')).toEqual([byTitle, byAlias]);
    expect(addSongsResults([byAlias, byTitle], 'huey')).toEqual(rankSongsBySearch([byAlias, byTitle].filter((s) => songMatchesSearch(s, 'huey')), 'huey'));
  });

  it('without a query lists the songs by title, A to Z', () => {
    const b = song({ title: 'Bravo' });
    const a = song({ title: 'alpha' });
    const e = song({ title: 'Éclat' });
    expect(addSongsResults([b, e, a], '').map((s) => s.title)).toEqual(['alpha', 'Bravo', 'Éclat']);
  });

  it('keeps the song objects (the matcher caches its folded texts per object)', () => {
    const a = song({ title: 'Alpha' });
    expect(addSongsResults([a], '')[0]).toBe(a);
  });

  it('shows at most ADD_SONGS_RESULT_LIMIT songs, after ranking', () => {
    const many = Array.from({ length: ADD_SONGS_RESULT_LIMIT + 20 }, (_, i) => song({ title: `Song ${String(i).padStart(3, '0')}` }));
    expect(addSongsResults(many, '')).toHaveLength(ADD_SONGS_RESULT_LIMIT);
    const late = song({ title: 'Zzz', aliases: ['Needle'] });
    expect(addSongsResults([...many, late], 'needle')).toEqual([late]);
  });

  it('returns nothing for a query that matches nothing', () => {
    expect(addSongsResults([song({ title: 'Alpha' })], 'zzz')).toEqual([]);
  });
});
