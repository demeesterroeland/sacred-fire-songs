// Rows of the Add to playlist sheet (Story 6.1.30 / G8.1, #414). Pure, so the
// order and the check marks can be tested without a browser.
import type { PickerPlaylist } from './pickerQueries';

export type PickerRow =
    | { kind: 'new' }
    | { kind: 'playlist'; id: string; title: string; checked: boolean };

/** "New playlist" is always the first row; each playlist shows a check when it already holds the song. */
export function buildPickerRows(playlists: readonly PickerPlaylist[], containingIds: ReadonlySet<string>): PickerRow[] {
    return [
        { kind: 'new' },
        ...playlists.map((p): PickerRow => ({ kind: 'playlist', id: p.id, title: p.title, checked: containingIds.has(p.id) })),
    ];
}

/** Tapping a playlist row adds the song, or removes it when it is already there. */
export function toggleMembership(containingIds: ReadonlySet<string>, playlistId: string): Set<string> {
    const next = new Set(containingIds);
    if (next.has(playlistId)) next.delete(playlistId);
    else next.add(playlistId);
    return next;
}
