// Story 6.2.9 / G1.4 (#512): link a song as a version of another song — pure helpers (L2).
import { describe, expect, it } from 'vitest';
import { DICTIONARIES, SUPPORTED_LOCALES, translateFrom } from '@/lib/i18n';
import {
  SONG_LINK_ERROR_KEYS,
  canLinkSongs,
  linkPreviewLines,
  parseLinkSummary,
  songLinkError,
  songRedirectHref,
  type SongLinkSummary,
} from '@/lib/songs/linkSong';

const t = (key: string, params?: Record<string, string | number>) =>
  translateFrom(DICTIONARIES.en, DICTIONARIES.en, key, params);

const summary = (over: Partial<SongLinkSummary> = {}): SongLinkSummary => ({
  source_id: 's',
  source_title: 'Weyo Wey Yanna (Songbook B)',
  target_id: 't',
  target_title: 'Weyo wey yanna',
  versions: 0,
  recordings: 0,
  playlist_items: 0,
  favourites: 0,
  favourites_merged: 0,
  categories_added: 0,
  aliases_added: [],
  catalog_slug: 'none',
  catalog_keys_cleared: 0,
  translations: 0,
  ...over,
});

describe('canLinkSongs', () => {
  it.each([
    ['admin', true],
    ['gatekeeper', true],
    ['musician', false],
    ['member', false],
    ['expert', false],
    [null, false],
    [undefined, false],
  ])('%s → %s', (role, expected) => {
    expect(canLinkSongs(role)).toBe(expected);
  });
});

describe('songRedirectHref', () => {
  it('keeps the query, so the version and the take still open', () => {
    expect(songRedirectHref('new', '?version=v1&recording=r1')).toBe('/songs/new?version=v1&recording=r1');
    expect(songRedirectHref('new', new URLSearchParams('version=v1'))).toBe('/songs/new?version=v1');
  });

  it('has no "?" without a query', () => {
    expect(songRedirectHref('new', '')).toBe('/songs/new');
    expect(songRedirectHref('new', null)).toBe('/songs/new');
  });
});

describe('parseLinkSummary', () => {
  it('reads the database answer and defends against odd values', () => {
    const parsed = parseLinkSummary({
      source_id: 's',
      target_id: 't',
      source_title: 'A',
      target_title: 'B',
      versions: '2',
      recordings: 3,
      playlist_items: -1,
      aliases_added: ['A', 4],
      catalog_slug: 'weird',
    });
    expect(parsed).toMatchObject({ versions: 2, recordings: 3, playlist_items: 0, aliases_added: ['A'], catalog_slug: 'none' });
  });

  it('is null for anything that is not a summary', () => {
    expect(parseLinkSummary(null)).toBeNull();
    expect(parseLinkSummary({ versions: 1 })).toBeNull();
  });
});

describe('linkPreviewLines', () => {
  it('lists what moves, with singular and plural, and leaves out empty items', () => {
    const lines = linkPreviewLines(summary({ versions: 2, recordings: 3, playlist_items: 1, favourites_merged: 1 }));
    expect(lines.map((l) => t(l.key, l.params))).toEqual([
      '2 versions',
      '3 recordings',
      '1 playlist entry',
      '1 shared favorite merged',
    ]);
  });

  it('names the new aliases and the catalog slug outcome', () => {
    const lines = linkPreviewLines(
      summary({ aliases_added: ['Weyo Wey Yanna (Songbook B)'], catalog_slug: 'redirect', catalog_keys_cleared: 1 })
    );
    const text = lines.map((l) => t(l.key, l.params));
    expect(text[0]).toContain('Weyo Wey Yanna (Songbook B)');
    expect(lines.map((l) => l.key)).toEqual([
      'song.link.preview.aliases',
      'song.link.preview.slugKept',
      'song.link.preview.catalogKeys.one',
    ]);
  });

  it('has a translation for every line in every language', () => {
    const all = summary({
      versions: 2,
      recordings: 1,
      playlist_items: 2,
      favourites: 1,
      favourites_merged: 2,
      categories_added: 1,
      translations: 2,
      aliases_added: ['x'],
      catalog_slug: 'moved',
      catalog_keys_cleared: 2,
    });
    const keys = [
      ...linkPreviewLines(all).map((l) => l.key),
      ...linkPreviewLines({ ...all, versions: 1, recordings: 2, playlist_items: 1, favourites: 2, favourites_merged: 1, categories_added: 2, translations: 1, catalog_slug: 'redirect', catalog_keys_cleared: 1 }).map((l) => l.key),
      ...Object.values(SONG_LINK_ERROR_KEYS),
    ];
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of keys) expect(DICTIONARIES[locale][key], `${locale}: ${key}`).toBeTruthy();
    }
  });
});

describe('songLinkError', () => {
  it.each([
    [{ code: '42501', message: 'Only gatekeepers and admins can link songs' }, 'forbidden'],
    [{ code: 'P0002', message: 'Song not found' }, 'notFound'],
    [{ code: '22023', message: 'A song cannot be linked to itself' }, 'self'],
    [{ code: '22023', message: 'This song is already linked to another song' }, 'alreadyLinked'],
    [{ code: '22023', message: 'Pick the song' }, 'invalid'],
    [{ code: '22P02', message: 'invalid input syntax for type uuid' }, 'invalid'],
    [{ code: '08006', message: 'connection failure' }, 'failed'],
    [null, 'failed'],
  ])('%o → %s', (error, expected) => {
    expect(songLinkError(error)).toBe(expected);
  });
});
