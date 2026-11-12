// Story 6.2.6 (#509) + 6.2.10 (#513): every song query embeds `song_version_sources (` exactly once, from the one
// VERSION_SOURCES_SELECT. A second embed (for example an inline `song_version_sources(is_primary, songbooks(...))`)
// makes PostgREST fail the whole query with 42803 and breaks the page.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EDIT_SONG_SELECT, SONG_SELECT } from '@/lib/songs/songSelect';
import { SONGS_SELECT } from '@/lib/songs/queries';
import { VERSION_SOURCES_SELECT } from '@/lib/songs/versionSources';

const embeds = (select: string) => select.match(/song_version_sources(![\w]+)?\s*\(/g) ?? [];

describe('song selects', () => {
  it('the song page select embeds the sources once and asks for the kind of each version', () => {
    expect(embeds(SONG_SELECT)).toHaveLength(1);
    expect(SONG_SELECT).toContain(VERSION_SOURCES_SELECT);
    expect(SONG_SELECT).toMatch(/version_kind/);
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

  // Story 6.2.18 (#521): the list select carries the original titles for the search, still through ONE embed.
  it('the song list select embeds the sources once and asks only for the original title', () => {
    expect(embeds(SONGS_SELECT)).toHaveLength(1);
    expect(SONGS_SELECT).toMatch(/song_version_sources\s*\(\s*original_title\s*\)/);
    // `*` brings compositions.aliases and compositions.authors with every row
    expect(SONGS_SELECT.split(/song_versions\s*\(/)[0]).toMatch(/\*/);
  });

  it('the edit page and fetchSong carry no inline copy of the embed', () => {
    for (const file of ['app/songs/[id]/edit/page.tsx', 'lib/songs/fetchSong.ts']) {
      expect(embeds(readFileSync(file, 'utf8')), file).toHaveLength(0);
    }
  });
});
