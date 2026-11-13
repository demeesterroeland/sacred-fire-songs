/**
 * One look for every playlist row on the Library page: flat, separated by lines (design tokens rule 5).
 * Boxes are for inputs, buttons, sheets and dialogs.
 */
export const PLAYLIST_LIST = 'divide-y divide-line border-y border-line';

/** Rows start 16 px in, like the song rows on /songs and Home (#488). */
export const PLAYLIST_ROW = 'group flex w-full min-w-0 min-h-tap items-center gap-3 py-3 ps-4 transition-colors hover:bg-surface';

/** The ⋯ menu on a row: centred at the right edge. No transform, so the menu's fixed layers stay on the window. */
export const PLAYLIST_MENU = 'absolute inset-y-0 right-0 z-10 flex items-center';
