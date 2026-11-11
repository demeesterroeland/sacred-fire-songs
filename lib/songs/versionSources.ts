/**
 * Where a version was printed (Story 6.2.10 / G2.1, #513): the grey source line under the lyrics —
 * "Songbook A · p. 38 · compiled by Compiler A". Pure helpers plus the PostgREST select fragment, shared by the song
 * page and the later songbook page, PDF export and songbook filter (#514, #520, #522).
 */
import type { TranslateFn } from '@/lib/i18n';

/**
 * Nested select for a version's sources and their books. Embed it inside `song_versions ( … )`. Reading follows the
 * song's row-level security (sources and songbooks are readable exactly when the song is), so guests see it too.
 */
export const VERSION_SOURCES_SELECT = `
            song_version_sources (
              id,
              is_primary,
              original_title,
              page,
              songbooks (
                id,
                title,
                short_name,
                compiler
              )
            )`;

export interface SourceBook {
  id: string;
  title?: string | null;
  short_name?: string | null;
  compiler?: string | null;
}

/** One `song_version_sources` row with its book, as returned by VERSION_SOURCES_SELECT. */
export interface VersionSourceRow {
  id: string;
  is_primary: boolean;
  original_title?: string | null;
  page?: string | null;
  /** A many-to-one embed is an object; a one-item array is accepted too. `null` when the book is not readable. */
  songbooks?: SourceBook | SourceBook[] | null;
}

function bookOf(row: VersionSourceRow): SourceBook | null {
  const b = Array.isArray(row.songbooks) ? row.songbooks[0] : row.songbooks;
  return b ?? null;
}

const clean = (v: string | null | undefined): string => (v ?? '').trim();
const bookName = (b: SourceBook): string => clean(b.title) || clean(b.short_name);

/** Primary source first, then the others by book name. Returns a new array. */
export function sortSources(rows: ReadonlyArray<VersionSourceRow>): VersionSourceRow[] {
  const name = (r: VersionSourceRow) => {
    const b = bookOf(r);
    return b ? bookName(b) : '';
  };
  return [...rows].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || name(a).localeCompare(name(b), undefined, { sensitivity: 'base' })
  );
}

/**
 * "Songbook A · p. 38 · compiled by Compiler A [· Original title: …]". The page, compiler and original title drop out
 * when unknown; the original title only shows when it differs from the song's title. `null` when there is no readable book.
 */
export function formatSourceLine(row: VersionSourceRow, songTitle: string, t: TranslateFn): string | null {
  const book = bookOf(row);
  const name = book ? bookName(book) : '';
  if (!book || !name) return null;
  const page = clean(row.page);
  const compiler = clean(book.compiler);
  const original = clean(row.original_title);
  const showOriginal = original !== '' && original.toLowerCase() !== clean(songTitle).toLowerCase();
  return [
    name,
    page ? t(/[-–,;]/.test(page) ? 'song.source.pages' : 'song.source.page', { page }) : null,
    compiler ? t('song.source.compiledBy', { compiler }) : null,
    showOriginal ? t('song.source.originalTitle', { title: original }) : null,
  ]
    .filter((p): p is string => !!p)
    .join(' · ');
}

/** The lines to show for one version, primary first. Empty for no sources or older cached data without them. */
export function formatSourceLines(
  rows: ReadonlyArray<VersionSourceRow> | null | undefined,
  songTitle: string,
  t: TranslateFn
): { id: string; text: string }[] {
  if (!rows?.length) return [];
  return sortSources(rows).flatMap((row) => {
    const text = formatSourceLine(row, songTitle, t);
    return text ? [{ id: row.id, text }] : [];
  });
}
