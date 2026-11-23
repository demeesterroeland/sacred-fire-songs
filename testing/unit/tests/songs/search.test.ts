// Story 6.2.18 / G5.1 (#521): the one search matcher. Title, aliases, every author and the original titles in
// songbooks are found accent- and case-insensitively; the hint names why a song matched when the title did not.
import { describe, expect, it } from 'vitest';
import { songFilterConfig } from '@/lib/songs/filterConfig';
import { filterSongs, type Song } from '@/lib/songUtils';
import { rankSongsBySearch, songMatchHint, songMatchHintText, songMatchesSearch, songSearchMatch } from '@/lib/songs/search';

const song = (over: Partial<Song> = {}): Song =>
  ({
    id: 's1',
    title: 'Huey Tonantzin',
    author: 'Anna Lee',
    authors: ['Anna Lee'],
    aliases: [],
    sourceTitles: [],
    songKey: null,
    color: 'red',
    createdAt: '2026-01-01T00:00:00Z',
    categories: [],
    ...over,
  }) as Song;

describe('songSearchMatch', () => {
  it('matches the title first and reports no hint for it', () => {
    const s = song({ aliases: ['Huey Madre'] });
    expect(songSearchMatch(s, 'huey')).toEqual({ field: 'title', text: 'Huey Tonantzin' });
    expect(songMatchHint(s, 'huey')).toBeNull();
  });

  it('finds a song by an alias', () => {
    const s = song({ aliases: ['Gran Venerable Madre Tierra'] });
    expect(songMatchesSearch(s, 'Venerable')).toBe(true);
    expect(songMatchHint(s, 'Venerable')).toEqual({ kind: 'alias', text: 'Gran Venerable Madre Tierra' });
  });

  it('finds a song by a co-author that is only in authors[]', () => {
    const s = song({ author: 'Anna Lee', authors: ['Anna Lee', 'Ben Cruz'] });
    expect(songMatchesSearch(s, 'ben cruz')).toBe(true);
    expect(songMatchHint(s, 'ben cruz')).toEqual({ kind: 'author', text: 'Ben Cruz' });
  });

  it('shows no author hint when the author is already in the row text', () => {
    const s = song({ author: 'Anna Lee, Ben Cruz', authors: ['Anna Lee', 'Ben Cruz'] });
    expect(songMatchesSearch(s, 'ben')).toBe(true);
    expect(songMatchHint(s, 'ben')).toBeNull();
  });

  it('finds a song by the original title in a songbook', () => {
    const s = song({ sourceTitles: ['Tonantzin Madre Tierra'] });
    expect(songMatchesSearch(s, 'madre tierra')).toBe(true);
    expect(songMatchHint(s, 'madre tierra')).toEqual({ kind: 'sourceTitle', text: 'Tonantzin Madre Tierra' });
  });

  it('ignores case and accents on both sides', () => {
    expect(songMatchesSearch(song({ aliases: ['Gran Venerable'] }), 'VENERABLE')).toBe(true);
    expect(songMatchesSearch(song({ aliases: ['Pachamamá'] }), 'pachamama')).toBe(true);
    expect(songMatchesSearch(song({ aliases: ['Pachamama'] }), 'Pachamamá')).toBe(true);
    expect(songMatchesSearch(song({ sourceTitles: ['Canción de Ñusta'] }), 'cancion de nusta')).toBe(true);
  });

  it('keeps the matched alias spelling in the hint', () => {
    const hint = songMatchHint(song({ aliases: ['Pachamamá'] }), 'pachamama');
    expect(hint).toEqual({ kind: 'alias', text: 'Pachamamá' });
  });

  it('prefers the alias over the songbook title and the author when several fields match', () => {
    const s = song({
      aliases: ['Madre Tierra'],
      sourceTitles: ['Canto a la Madre Tierra'],
      author: 'Anna Lee',
      authors: ['Anna Lee', 'Madre Tierra Collective'],
    });
    expect(songMatchHint(s, 'madre')).toEqual({ kind: 'alias', text: 'Madre Tierra' });
  });

  it('gives no hint for a content or category match, and nothing for an empty query', () => {
    expect(songMatchHint(song({ content: 'la luna llena' }), 'luna')).toBeNull();
    expect(songMatchesSearch(song({ content: 'la luna llena' }), 'luna')).toBe(true);
    expect(songMatchesSearch(song(), '   ')).toBe(true);
    expect(songMatchHint(song({ aliases: ['x'] }), '  ')).toBeNull();
  });

  it('does not match when no field contains the query', () => {
    expect(songMatchesSearch(song({ aliases: ['Other'], sourceTitles: ['Else'] }), 'venerable')).toBe(false);
  });

  it('survives missing arrays on rows that never selected them', () => {
    const bare = { id: 'x', title: 'Bare', author: '', categories: [] } as unknown as Song;
    expect(songMatchesSearch(bare, 'bare')).toBe(true);
    expect(songMatchesSearch(bare, 'nope')).toBe(false);
  });
});

describe('one search for the filter and the legacy helper', () => {
  const songs = [
    song({ id: 'a', title: 'Alpha', aliases: ['Gran Venerable Madre'], sourceTitles: ['Venerable Madre'], authors: ['Venerable Voice'], author: 'Venerable Voice' }),
    song({ id: 'b', title: 'Beta', sourceTitles: ['Venerable Book Title'] }),
    song({ id: 'c', title: 'Gamma' }),
  ];

  it('the free-text filter finds each song once, however many fields match', () => {
    const found = songs.filter((s) => songFilterConfig.search!.match(s, 'venerable'));
    expect(found.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('filterSongs uses the same matcher (accents folded, aliases and songbook titles found)', () => {
    expect(filterSongs(songs, 'VENERABLE').map((s) => s.id)).toEqual(['a', 'b']);
    expect(filterSongs([song({ aliases: ['Pachamamá'] })], 'pachamama')).toHaveLength(1);
  });
});

describe('rankSongsBySearch', () => {
  const list = [
    song({ id: 'a', title: 'Alpha', aliases: ['Huey Alias'] }),
    song({ id: 'b', title: 'Huey Beta' }),
    song({ id: 'c', title: 'Charlie', author: 'Huey Cruz', authors: ['Huey Cruz'] }),
    song({ id: 'd', title: 'Delta Huey' }),
  ];

  it('puts title matches first and keeps the list order inside each group', () => {
    expect(rankSongsBySearch(list, 'huey').map((s) => s.id)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('leaves the list untouched without a query, and does not mutate the input', () => {
    const before = list.map((s) => s.id);
    expect(rankSongsBySearch(list, '  ')).toBe(list);
    rankSongsBySearch(list, 'huey');
    expect(list.map((s) => s.id)).toEqual(before);
  });
});

describe('repeated searches over the same song', () => {
  it('give the same answer for every query (the folded texts are built once per song)', () => {
    const s = song({ aliases: ['Gran Madre'], sourceTitles: ['Canción Ñandú'], content: '[Am]Fuego Sagrado' });
    expect(songSearchMatch(s, 'madre')?.field).toBe('alias');
    expect(songSearchMatch(s, 'nandu')?.field).toBe('sourceTitle');
    expect(songSearchMatch(s, 'fuego')?.field).toBe('content');
    expect(songSearchMatch(s, 'huey')?.field).toBe('title');
    expect(songSearchMatch(s, 'nothing here')).toBeNull();
  });
});

// Story 6.2.23 / G5.6 (#547): the title of a translation is searched; the hint names the language.
describe('translated titles', () => {
  const translated = (over: Partial<Song> = {}) =>
    song({ title: 'Madre Tierra', translationTitles: [{ language: 'nl', title: 'Moeder Aarde' }], ...over });

  it('finds a song by the title of a translation, with a hint naming the language', () => {
    expect(songSearchMatch(translated(), 'moeder aarde')).toEqual({ field: 'translationTitle', text: 'Moeder Aarde', language: 'nl' });
    expect(songMatchHint(translated(), 'moeder aarde')).toEqual({ kind: 'translationTitle', text: 'Moeder Aarde', language: 'nl' });
  });

  it('ignores case and accents on both sides', () => {
    const s = translated({ translationTitles: [{ language: 'fr', title: 'Mère Évangéline' }] });
    expect(songMatchesSearch(s, 'EVANGELINE')).toBe(true);
    expect(songMatchesSearch(translated(), 'MOEDER')).toBe(true);
  });

  it('shows no hint when the title itself matched', () => {
    const s = translated({ translationTitles: [{ language: 'nl', title: 'Madre Aarde' }] });
    expect(songMatchHint(s, 'madre')).toBeNull();
    expect(songSearchMatch(s, 'madre')?.field).toBe('title');
  });

  it('names the language that matched when several translations exist', () => {
    const s = translated({ translationTitles: [{ language: 'nl', title: 'Moeder Aarde' }, { language: 'de', title: 'Mutter Erde' }] });
    expect(songMatchHint(s, 'mutter')).toEqual({ kind: 'translationTitle', text: 'Mutter Erde', language: 'de' });
  });

  it('skips blank titles and songs without translations', () => {
    expect(songMatchesSearch(translated({ translationTitles: [{ language: 'nl', title: '  ' }] }), 'nl')).toBe(false);
    expect(songMatchesSearch(translated({ translationTitles: undefined }), 'aarde')).toBe(false);
  });

  it('ranks a title match before a song found by a translated title', () => {
    const byTranslation = translated({ id: 'a', title: 'Alpha' });
    const byTitle = song({ id: 'b', title: 'Moeder Zon' });
    expect(rankSongsBySearch([byTranslation, byTitle], 'moeder').map((x) => x.id)).toEqual(['b', 'a']);
  });

  it('renders the hint as "<language>: <title>" in the app language', () => {
    const t = (key: string, p?: Record<string, string | number>) =>
      key === 'songs.matchTranslation' ? `${p?.language}: ${p?.text}` : key;
    expect(songMatchHintText(translated(), 'aarde', t as never, 'en')).toBe('Dutch: Moeder Aarde');
    expect(songMatchHintText(translated(), 'aarde', t as never, 'nl')).toBe('Nederlands: Moeder Aarde');
  });
});
