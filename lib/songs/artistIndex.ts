/**
 * The artists index (Library → Artists): every author with a song count and the first titles.
 * Pure, so the server query and the unit tests share it. Story 6.2.12 / G2.3 (#515): names come from
 * `compositions.authors` (a single credit is not split), else from `original_author` split by `parseArtists`, the same
 * source (`songAuthorNames`) and cleaning as the author filter (`songFilterConfig.artist`), so every name listed here finds exactly the songs counted for it.
 */
import { songAuthorNames } from '@/lib/songs/authors';
import { normalizeWhitespace, removeDiacritics } from '@/lib/utils';

export interface ArtistRow {
  title: string | null;
  original_author?: string | null;
  authors?: ReadonlyArray<string | null> | null;
}

export interface ArtistSummary {
  name: string;
  songCount: number;
  songTitles: string[];
}

const TITLES_PER_ARTIST = 5;

/** Every individual author of a song: `authors[]`, else `original_author` split. Same source as the author filter. */
function rowNames(row: ArtistRow): string[] {
  return songAuthorNames({ authors: row.authors, originalAuthor: row.original_author });
}

/**
 * Aggregates unique authors with song counts and the first titles. Handles spacing, casing and accent variations;
 * a song counts once per author. Songs without any author are listed under "No Artist".
 */
export function aggregateArtists(rows: readonly ArtistRow[]): ArtistSummary[] {
  const authorCounts = new Map<string, number>();
  const authorTitles = new Map<string, string[]>();
  const authorCanonicalNames = new Map<string, string>(); // lowercased-normalized -> preferred casing
  let unspecifiedCount = 0;
  const unspecifiedTitles: string[] = [];

  for (const row of rows) {
    const seenInSong = new Set<string>();
    for (const artistName of rowNames(row)) {
      const normalized = normalizeWhitespace(artistName);
      if (!normalized) continue;
      const key = removeDiacritics(normalized).toLowerCase();
      if (seenInSong.has(key)) continue;
      seenInSong.add(key);

      authorCounts.set(key, (authorCounts.get(key) || 0) + 1);

      if (!authorTitles.has(key)) authorTitles.set(key, []);
      const titles = authorTitles.get(key)!;
      if (titles.length < TITLES_PER_ARTIST && row.title && !titles.includes(row.title)) titles.push(row.title);

      // Keep casing with most uppercase letters, or fall back to the first one seen
      const existingCanonical = authorCanonicalNames.get(key);
      if (!existingCanonical) {
        authorCanonicalNames.set(key, normalized);
      } else if ((normalized.match(/[A-Z]/g) || []).length > (existingCanonical.match(/[A-Z]/g) || []).length) {
        authorCanonicalNames.set(key, normalized);
      }
    }

    if (seenInSong.size === 0) {
      unspecifiedCount++;
      if (unspecifiedTitles.length < TITLES_PER_ARTIST && row.title) unspecifiedTitles.push(row.title);
    }
  }

  const result = Array.from(authorCounts.entries())
    .map(([key, songCount]) => ({
      name: authorCanonicalNames.get(key) || key,
      songCount,
      songTitles: authorTitles.get(key) || [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (unspecifiedCount > 0) {
    result.push({ name: 'No Artist', songCount: unspecifiedCount, songTitles: unspecifiedTitles });
  }
  return result;
}
