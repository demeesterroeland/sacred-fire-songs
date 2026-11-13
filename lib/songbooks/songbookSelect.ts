/**
 * The PostgREST selects of the songbook pages (Story 6.2.11 / G2.2, #514), apart from the server queries so a unit test and
 * a contract scenario can read them without loading server-only code.
 *
 * `song_version_sources (` is embedded once per select (PostgREST fails the whole query with 42803 on a duplicate embed,
 * like the song selects in `songSelect.ts`); a contract scenario sends both selects to the local API.
 */

/** The nested sources of a book with the version and song of each, for the page and the list counts. */
const BOOK_SOURCES_SELECT = `
  song_version_sources (
    id,
    page,
    original_title,
    is_primary,
    song_versions (
      id,
      created_at,
      compositions (
        id,
        title,
        original_author,
        authors,
        is_public
      )
    )
  )`;

/** One book with its songs: the select of `/songbooks/<id>`. */
export const SONGBOOK_PAGE_SELECT = `
  id,
  title,
  short_name,
  compiler,
  community,
  year,
  languages,
  attribution,${BOOK_SOURCES_SELECT}`;

/** Every book with just enough of its sources to count its songs (no titles, pages or authors): the select of `/songbooks`. */
export const SONGBOOK_LIST_SELECT = `
  id,
  title,
  short_name,
  compiler,
  year,
  song_version_sources (
    id,
    song_versions (
      id,
      compositions (
        id
      )
    )
  )`;

