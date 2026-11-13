/**
 * Where a version was printed (Story 6.2.10 / G2.1, #513): the grey source line under the lyrics —
 * "Songbook A · p. 38 · compiled by Compiler A". Pure helpers plus the PostgREST select fragment, shared by the song
 * page and the later songbook page, PDF export and songbook filter (#514, #520, #522).
 */
import type { TranslateFn } from '@/lib/i18n';

/**
 * Nested select for a version's sources and their books. Embed it inside `song_versions ( … )`. Reading follows the
 * song's row-level security (sources and songbooks are readable exactly when the song is), so guests see it too.
 *
 * Use this ONE constant wherever a song query needs a version's sources (the source line, #513, and the version label,
 * #530): PostgREST fails the whole query with 42803 when `song_version_sources (` is embedded twice in one select.
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

/** What ordering the sources needs; a full `VersionSourceRow` fits, and so does the lighter row of a version label. */
export interface SourceOrderRow {
  id?: string;
  is_primary?: boolean | null;
  songbooks?: SourceBook | SourceBook[] | null;
}

function bookOf(row: SourceOrderRow): SourceBook | null {
  const b = Array.isArray(row.songbooks) ? row.songbooks[0] : row.songbooks;
  return b ?? null;
}

const clean = (v: string | null | undefined): string => (v ?? '').trim();

/** The name of a book as the source line shows it: the title, else the short name. (The version label, #530, prefers `short_name`.) */
const bookName = (b: SourceBook): string => clean(b.title) || clean(b.short_name);

/**
 * Primary source first, then the others by book name (in `locale`), then by id so the order never depends on the
 * order PostgREST happened to return. Returns a new array.
 */
export function sortSources<T extends SourceOrderRow>(rows: ReadonlyArray<T>, locale?: string): T[] {
  const name = (r: T) => {
    const b = bookOf(r);
    return b ? bookName(b) : '';
  };
  return [...rows].sort(
    (a, b) =>
      Number(!!b.is_primary) - Number(!!a.is_primary) ||
      name(a).localeCompare(name(b), locale, { sensitivity: 'base' }) ||
      (a.id ?? '').localeCompare(b.id ?? '')
  );
}

/**
 * The source the version belongs to first: the `is_primary` row, else the first after `sortSources`. The source line
 * and the version label (#530) both use it, so they name the same book. `null` without sources.
 */
export function primarySource<T extends SourceOrderRow>(rows: ReadonlyArray<T> | null | undefined, locale?: string): T | null {
  if (!rows?.length) return null;
  return rows.find((r) => r.is_primary) ?? sortSources(rows, locale)[0] ?? null;
}

// ── page ────────────────────────────────────────────────────────────────────

/** "p.", "pp.", "pág.", "págs.", "S.", "blz.", "с." that an importer copied from the printed book. */
const PAGE_PREFIX = /^(?:pp|p|págs|pág|pags|pag|S|blz|с)(?:\.\s*|\s+)(?=\S)/i;
/** Between two pages: a mark, " y " / " and " / " en " / " et " / " e " / " und ", or just white space. */
const PAGE_SEPARATOR = /\s*[–—\-/,;&+]\s*|\s+(?:y|and|en|et|e|und)\s+|\s+/i;
const ARABIC_PAGE = /^\d+[a-z]?$/i;
export const ROMAN_PAGE = /^[ivxlcdm]+$/i;

/** The page as shown: importer prefixes stripped; `plural` when it names several pages ("38–39", "38 & 40", "iv-vi"). */
function parsePage(raw: string | null | undefined): { page: string; plural: boolean } | null {
  let page = clean(raw);
  while (PAGE_PREFIX.test(page)) page = page.replace(PAGE_PREFIX, '').trim();
  if (/^(?:pp|p|págs|pág|pags|pag|S|blz|с)\.$/i.test(page)) page = '';
  if (!page) return null;
  // Several pages: every part is a page of the same kind. "A-12" and "II-4" are one page (section-page numbering).
  const parts = page.split(PAGE_SEPARATOR).filter(Boolean);
  const plural = parts.length > 1 && (parts.every((p) => ARABIC_PAGE.test(p)) || parts.every((p) => ROMAN_PAGE.test(p)));
  return { page, plural };
}

// ── original title ──────────────────────────────────────────────────────────

/** NFKC, one apostrophe, collapsed white space, no trailing `.!?`, so that cosmetic differences do not count. */
function normalizeTitle(v: string | null | undefined): string {
  return clean(v)
    .normalize('NFKC')
    .replace(/[’‘ʼ]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '')
    .trim();
}

const sameTitle = (a: string, b: string): boolean => normalizeTitle(a).localeCompare(normalizeTitle(b), undefined, { sensitivity: 'base' }) === 0;

/** The page as printed, without an importer prefix ("p. 38" gives "38"); `null` when there is none. Ranges stay as they are. */
export function cleanPage(raw: string | null | undefined): string | null {
  return parsePage(raw)?.page ?? null;
}

/** The page as the source line and the songbook page word it: "p. 38" or "pp. 38–39"; `null` without a page. */
export function pageLabel(raw: string | null | undefined, t: TranslateFn): string | null {
  const page = parsePage(raw);
  return page ? t(page.plural ? 'song.source.pages' : 'song.source.page', { page: page.page }) : null;
}

/** The original title when it is a real difference from the song's title (not a cosmetic one); else `null`. */
export function differingOriginalTitle(original: string | null | undefined, songTitle: string): string | null {
  const o = clean(original);
  return o !== '' && !sameTitle(o, songTitle) ? o : null;
}

/** One source line in pieces: the book (what links to its page) and the rest ("p. 38 · compiled by …"). */
export interface SourceLineParts {
  bookId: string;
  name: string;
  /** The page, compiler and original title joined with " · "; empty when none is known. */
  rest: string;
}

/**
 * The pieces of "Songbook A · p. 38 · compiled by Compiler A [· Original title: …]". The page, compiler and original
 * title drop out when unknown; the original title only shows when it differs from the song's title. `null` when there
 * is no readable book.
 */
export function sourceLineParts(row: VersionSourceRow, songTitle: string, t: TranslateFn): SourceLineParts | null {
  const book = bookOf(row);
  const name = book ? bookName(book) : '';
  if (!book || !name) return null;
  const compiler = clean(book.compiler);
  const original = differingOriginalTitle(row.original_title, songTitle);
  const rest = [
    pageLabel(row.page, t),
    compiler ? t('song.source.compiledBy', { compiler }) : null,
    original ? t('song.source.originalTitle', { title: original }) : null,
  ]
    .filter((p): p is string => !!p)
    .join(' · ');
  return { bookId: book.id, name, rest };
}

/** "Songbook A · p. 38 · compiled by Compiler A [· Original title: …]", or `null` when there is no readable book. */
export function formatSourceLine(row: VersionSourceRow, songTitle: string, t: TranslateFn): string | null {
  const parts = sourceLineParts(row, songTitle, t);
  return parts ? [parts.name, parts.rest].filter(Boolean).join(' · ') : null;
}

/** The lines to show for one version, primary first: the text and its pieces (the book is what links to its page). Empty for no sources or older cached data without them. */
export function formatSourceLines(
  rows: ReadonlyArray<VersionSourceRow> | null | undefined,
  songTitle: string,
  t: TranslateFn,
  locale?: string
): { id: string; text: string; bookId: string; name: string; rest: string }[] {
  if (!rows?.length) return [];
  return sortSources(rows, locale).flatMap((row) => {
    const parts = sourceLineParts(row, songTitle, t);
    return parts ? [{ id: row.id, text: [parts.name, parts.rest].filter(Boolean).join(' · '), ...parts }] : [];
  });
}
