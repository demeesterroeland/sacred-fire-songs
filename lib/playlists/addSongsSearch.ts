/**
 * What the "+ Add Songs" sheet of a playlist lists (Story 6.2.22 / G5.5, #542).
 *
 * The sheet gets the same whole song list as the song list page (`fetchAllSongs`, one react-query cache entry) and
 * filters it in memory with the song list's own matcher and ranking (`songMatchesSearch`, `rankSongsBySearch`,
 * `lib/songs/search.ts`), so a song found in the list is found here, by the same title, alias, songbook title, author,
 * category or lyrics. Not a second matcher: this only chooses the order and the size of what is shown.
 */
import type { Song } from '@/lib/songUtils';
import { foldForSearch, rankSongsBySearch, songMatchesSearch } from '@/lib/songs/search';

/** Rows the sheet renders at most: the sheet is a picker, a longer list is narrowed by typing. */
export const ADD_SONGS_RESULT_LIMIT = 50;

const byTitle = (a: Song, b: Song): number => foldForSearch(a.title).localeCompare(foldForSearch(b.title));

/**
 * The songs to offer for a query: the ones the matcher accepts, titles that matched first (each group A to Z),
 * at most `limit`. Without a query: the first `limit` songs by title. The song objects are returned as they are
 * (the matcher keeps its folded texts per object).
 */
export function addSongsResults(songs: readonly Song[], query: string, limit: number = ADD_SONGS_RESULT_LIMIT): Song[] {
  const matching = songs.filter((song) => songMatchesSearch(song, query)).sort(byTitle);
  return [...rankSongsBySearch(matching, query)].slice(0, limit);
}
