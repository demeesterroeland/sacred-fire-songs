/**
 * Story 6.2.8 / G1.3 (#511): the background note printed with a song version ("About this song").
 *
 * Returns the note as paragraphs: blank lines separate paragraphs, single line breaks stay inside one.
 * An empty or whitespace-only note returns no paragraphs, so the panel is hidden. Plain text only: the caller
 * renders the strings as text nodes, never as HTML.
 */
export function songNoteParagraphs(note: string | null | undefined): string[] {
  if (!note) return [];
  return note
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
