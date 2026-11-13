// Story 6.2.6 (#509) + 6.2.10 (#513) + 6.2.13 (#516): every song query embeds `song_version_sources (` exactly once, from the one
// VERSION_SOURCES_SELECT. A second embed (for example an inline `song_version_sources(is_primary, songbooks(...))`)
// makes PostgREST fail the whole query with 42803 and breaks the page.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EDIT_SONG_SELECT, SONG_SELECT } from '@/lib/songs/songSelect';
import { SONGS_SELECT } from '@/lib/songs/queries';
import { PLAYLIST_EXPORT_SELECT } from '@/lib/export/exportSong';
import { VERSION_SOURCES_SELECT } from '@/lib/songs/versionSources';

const embeds = (select: string) => select.match(/song_version_sources(![\w]+)?\s*\(/g) ?? [];
const translationEmbeds = (select: string) => select.match(/song_translations(![\w]+)?\s*\(/g) ?? [];

describe('song selects', () => {
  it('the song page select embeds the sources once and asks for the kind of each version', () => {
    expect(embeds(SONG_SELECT)).toHaveLength(1);
    expect(SONG_SELECT).toContain(VERSION_SOURCES_SELECT);
    expect(SONG_SELECT).toMatch(/version_kind/);
  });

  it('the song page select embeds the translations once (#516), with what the language switch shows', () => {
    expect(translationEmbeds(SONG_SELECT)).toHaveLength(1);
    expect(SONG_SELECT).toMatch(/song_translations \([^)]*language[^)]*title[^)]*lyrics[^)]*translator[^)]*\)/);
  });

  it('the edit page select embeds the sources once, from the same constant, and asks for the kind', () => {
    expect(embeds(EDIT_SONG_SELECT)).toHaveLength(1);
    expect(EDIT_SONG_SELECT).toContain(VERSION_SOURCES_SELECT);
    expect(EDIT_SONG_SELECT).toMatch(/version_kind/);
    expect(EDIT_SONG_SELECT).toMatch(/song_versions!inner/);
  });

  // Story 6.2.12 (#515): a naive merge of the select would silently drop `authors`, and every co-author with it.
  it.each([
    ['SONG_SELECT', SONG_SELECT],
    ['EDIT_SONG_SELECT', EDIT_SONG_SELECT],
  ])('%s selects the composition authors[] column next to original_author', (_name, select) => {
    const composition = select.split(/song_versions(!inner)?\s*\(/)[0];
    expect(composition).toMatch(/\boriginal_author\b/);
    expect(composition).toMatch(/\bauthors\b/);
  });

  // Story 6.2.18 (#521) + 6.2.19 (#522): the list select carries the original titles for the search and the book of
  // each source for the songbook filter, still through ONE embed (the book is nested inside it, not a second embed).
  it('the song list select embeds the sources once and asks for the original title and the book id and names', () => {
    expect(embeds(SONGS_SELECT)).toHaveLength(1);
    expect(SONGS_SELECT).toMatch(/song_version_sources\s*\(\s*original_title\s*,\s*songbooks\s*\(\s*id\s*,\s*title\s*,\s*short_name\s*\)\s*\)/);
    // `*` brings compositions.aliases and compositions.authors with every row
    expect(SONGS_SELECT.split(/song_versions\s*\(/)[0]).toMatch(/\*/);
  });

  // Story 6.2.23 (#547): the list select carries the translated titles for the search, still through ONE embed.
  it('the song list select embeds the translations once and asks only for language and title', () => {
    expect(translationEmbeds(SONGS_SELECT)).toHaveLength(1);
    expect(SONGS_SELECT).toMatch(/song_translations\s*\(\s*language\s*,\s*title\s*\)/);
  });

  // Story 6.2.20 (#523): the edit form is prefilled from these; without them it would show empty fields and a save
  // of "nothing changed" would look like a change.
  it('the edit page select asks for the beats and the note of each version', () => {
    const versions = EDIT_SONG_SELECT.split(/song_versions!inner\s*\(/)[1];
    expect(versions).toMatch(/\bbeats\b/);
    expect(versions).toMatch(/\bsong_note\b/);
  });

  // Story 6.2.17 (#520): the playlist export prints the pinned version's sources; it needs no translations.
  it('the playlist export select embeds the sources once, from the same constant, and no translations', () => {
    expect(embeds(PLAYLIST_EXPORT_SELECT)).toHaveLength(1);
    expect(PLAYLIST_EXPORT_SELECT).toContain(VERSION_SOURCES_SELECT);
    expect(translationEmbeds(PLAYLIST_EXPORT_SELECT)).toHaveLength(0);
  });

  it('the edit page, fetchSong and the playlist actions carry no inline copy of the embed', () => {
    for (const file of ['app/songs/[id]/edit/page.tsx', 'lib/songs/fetchSong.ts', 'app/actions/playlistActions.ts']) {
      expect(embeds(readFileSync(file, 'utf8')), file).toHaveLength(0);
      expect(translationEmbeds(readFileSync(file, 'utf8')), file).toHaveLength(0);
    }
  });
});
