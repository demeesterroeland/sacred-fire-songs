/**
 * Story 6.2.20 / G5.3 (#523): what the edit form may write to a version's beats, note and (for admins) source.
 *
 * Pure helpers, shared by the form, its validation messages and the BDD steps. Reading stays where it was:
 * beats in `technicalItems()` (`songMeta.ts`, #510), the note in `songNoteParagraphs()` (`songNote.ts`, #511) and the
 * source in `formatSourceLine()` (`versionSources.ts`, #513).
 *
 * Principle (as for authors, #533): only a field the user changed is written. The form is prefilled from stored
 * values that an importer may have written in an untidy or unusual form; saving the form untouched must not rewrite them.
 */

export const BEATS_MAX_LENGTH = 20;
export const NOTE_MAX_LENGTH = 4000;
export const SOURCE_PAGE_MAX_LENGTH = 40;
export const SOURCE_TITLE_MAX_LENGTH = 200;

type Blank = string | null | undefined;

// ── beats ───────────────────────────────────────────────────────────────────

/**
 * Songbook beats as the meta line prints them ("Beats 8", "Beats 8y4"): a count from 1 to 99, or several counts
 * joined by `y`, `&`, `+`, `/`, `-` or a comma, with at most one space on either side ("8 y 4", "3/4"). No leading
 * zero, no other words: the value is printed as is after "Beats", so free text would read as a sentence there.
 */
const BEATS_PATTERN = /^[1-9]\d?(?: ?[y&+/,-] ?[1-9]\d?)*$/;

/** Trimmed, white space collapsed to one space, `Y` as `y`; `null` when blank (stored as NULL, never ''). */
export function normalizeBeats(raw: Blank): string | null {
  const value = (raw ?? '').replace(/\s+/g, ' ').trim().replace(/Y/g, 'y');
  return value === '' ? null : value;
}

/** Why a beats input cannot be saved: `tooLong`, `format`, or `null` when it can (blank included). */
export function beatsError(raw: Blank): 'tooLong' | 'format' | null {
  const value = normalizeBeats(raw);
  if (value === null) return null;
  if (value.length > BEATS_MAX_LENGTH) return 'tooLong';
  return BEATS_PATTERN.test(value) ? null : 'format';
}

// ── note ────────────────────────────────────────────────────────────────────

// Control characters except tab (\t) and line feed (\n); NUL in particular makes PostgreSQL refuse a text value.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * The note as stored: plain text. Line endings unified to `\n`, control characters dropped, trailing spaces on a line
 * removed, three or more line breaks collapsed to one blank line, both ends trimmed. Single line breaks and blank
 * lines (paragraph breaks, see `songNoteParagraphs`) stay. `null` when blank. Markup is not touched: the song page
 * renders the note as text, never as HTML.
 */
export function normalizeNote(raw: Blank): string | null {
  const value = (raw ?? '')
    .replace(/\r\n?|[\u2028\u2029]/g, '\n')
    .replace(CONTROL_CHARS, '')
    .replace(/[^\S\n]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return value === '' ? null : value;
}

export function noteError(raw: Blank): 'tooLong' | null {
  return (normalizeNote(raw) ?? '').length > NOTE_MAX_LENGTH ? 'tooLong' : null;
}

// ── dirty fields of the version ─────────────────────────────────────────────

export interface VersionMetaInput {
  beats?: Blank;
  note?: Blank;
}

/**
 * The `song_versions` columns to write for beats and note: only those whose normalized value differs from the one
 * the form was prefilled with. An untouched form returns `{}`. Blank values come back as `null`.
 */
export function versionMetaFieldsForSave(
  current: VersionMetaInput,
  initial: VersionMetaInput | undefined
): { beats?: string | null; song_note?: string | null } {
  const fields: { beats?: string | null; song_note?: string | null } = {};
  const beats = normalizeBeats(current.beats);
  if (beats !== normalizeBeats(initial?.beats)) fields.beats = beats;
  const note = normalizeNote(current.note);
  if (note !== normalizeNote(initial?.note)) fields.song_note = note;
  return fields;
}

// ── source (admins) ─────────────────────────────────────────────────────────

/** Page or original title of a source: trimmed, white space collapsed; `null` when blank. */
export function normalizeSourceText(raw: Blank): string | null {
  const value = (raw ?? '').replace(/\s+/g, ' ').trim();
  return value === '' ? null : value;
}

export function sourceTextError(field: 'page' | 'originalTitle', raw: Blank): 'tooLong' | null {
  const max = field === 'page' ? SOURCE_PAGE_MAX_LENGTH : SOURCE_TITLE_MAX_LENGTH;
  return (normalizeSourceText(raw) ?? '').length > max ? 'tooLong' : null;
}

/**
 * Who sees the "Correct source" link and may send a source correction: admins only, matching the policy
 * "Admins can manage version sources" (the source line itself is read-only for everyone). Row-level security
 * is the real guard; this keeps the form from offering what the database would refuse.
 */
export function canCorrectSource(role: string | null | undefined): boolean {
  return role === 'admin';
}

export interface SourceInput {
  sourcePage?: Blank;
  sourceOriginalTitle?: Blank;
}

/** The `song_version_sources` columns an admin changed (`{}` when none), blank as `null`. */
export function sourceFieldsForSave(
  current: SourceInput,
  initial: SourceInput | undefined
): { page?: string | null; original_title?: string | null } {
  const fields: { page?: string | null; original_title?: string | null } = {};
  const page = normalizeSourceText(current.sourcePage);
  if (page !== normalizeSourceText(initial?.sourcePage)) fields.page = page;
  const title = normalizeSourceText(current.sourceOriginalTitle);
  if (title !== normalizeSourceText(initial?.sourceOriginalTitle)) fields.original_title = title;
  return fields;
}
