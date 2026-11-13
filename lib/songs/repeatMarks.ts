/**
 * The signs drawn around repeated lines (Story 6.2.15, #518): `‖:` before the first line, `:‖` after the last, `:‖ ×3`
 * when a count is given. One place for the reader (`SongDisplay`) and the PDF export (Story 6.2.17, #520), so a printed
 * sheet shows the very signs of the screen.
 */
export const REPEAT_START = '‖:';
export const REPEAT_END = ':‖';

/** The closing sign, with the count when the repeat has one. */
export function repeatEndText(times?: number): string {
  return times ? `${REPEAT_END} ×${times}` : REPEAT_END;
}
