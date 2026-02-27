# Playlist Management — Design Document

> Version: 1.0 | Date: 2026-02-28 | Status: Approved

## User Story

**Story 1.3.x:** As an authenticated user, I can manage playlists — Create, View, Rename, Delete, Reorder songs, and Remove songs — so that I can curate personal song collections.

---

## Scope

**Active in this story:**
- Create playlist (from Playlists page + inline from PlaylistPicker)
- View playlist detail with ordered song list
- Rename playlist (via context menu → inline title edit)
- Delete playlist (via context menu + confirmation)
- Reorder songs within a playlist (drag and drop)
- Remove a song from a playlist
- Add a song to a playlist (from SongCard on library page + song detail page)

**Coming soon (context menu stubs only):**
- Edit Playlist (metadata)
- Add to this Playlist (from context menu)
- Make Playlist Private / Public

**Protected (no mutations):**
- Smart playlists: My Favorites, My Songs, My Drafts

---

## Architecture

### New Route

`/library/playlists/[id]` — server component fetches playlist + ordered `setlist_items` with song metadata, passes to `PlaylistDetailClient` (client component) for DnD and inline editing.

### New Server Actions (`app/actions/`)

| Action | Signature | Notes |
|--------|-----------|-------|
| `createPlaylist` | `(title: string) → { id: string } \| { error: string }` | Inserts into `setlists` |
| `renamePlaylist` | `(id: string, title: string) → { error?: string }` | Updates `setlists.title` |
| `deletePlaylist` | `(id: string) → { error?: string }` | Cascade deletes items |
| `addSongToPlaylist` | `(playlistId, songVersionId) → { error?: string }` | Upsert into `setlist_items` |
| `removeSongFromPlaylist` | `(itemId: string) → { error?: string }` | Deletes `setlist_items` row |
| `reorderPlaylistSongs` | `(playlistId, orderedItemIds[]) → { error?: string }` | Bulk updates `order_index` |

All actions include server-side guard: smart playlists (My Favorites, My Songs, My Drafts) reject mutations.

### DnD Library

Install `@dnd-kit/core` + `@dnd-kit/sortable` (~8kb, React 19 compatible, touch-friendly). No DnD library currently installed.

---

## Components

### `PlaylistContextMenu`
- `···` icon button on each user playlist card (playlists page) and in the playlist detail page header
- Uses Radix `DropdownMenu`
- **Rename** → triggers inline `<input>` replacing the title; saves on blur/Enter
- **Delete Playlist** → opens `DeleteConfirmationModal` before calling `deletePlaylist`
- **Edit Playlist / Add to this Playlist / Make Private·Public** → disabled items with "Coming soon" tooltip
- Smart playlists: no context menu rendered

### `PlaylistPicker`
- Radix `Popover` triggered by a `+` icon on `SongCard` (alongside the heart) and a button on the song detail page
- Contents:
  - "New playlist…" inline text input at top → creates playlist and adds song in one step
  - List of user playlists, each with a checkmark if the song is already in it
  - Clicking a playlist toggles the song in/out (add or remove)
- Fetches playlists via React Query key `['playlists', userId]` — single shared query, no per-card fetching

### `PlaylistDetailClient`
- Client component wrapping the `@dnd-kit/sortable` list
- Owns local DnD state for optimistic reorder
- Each row: drag handle (left) | song title + artist | remove button (right)

---

## Data Flow & State

| Surface | Data source | Mutation strategy |
|---------|-------------|-------------------|
| Playlists page | Server component | `router.refresh()` after create/rename/delete |
| Playlist detail | Server component (initial) | Optimistic local state + server action |
| PlaylistPicker | React Query `['playlists', userId]` | Invalidate on add/remove |

**Optimistic updates:**
- Reorder: instant local swap → server action fires in background; reverts on failure
- Add/remove in picker: checkmark toggles instantly → server action fires async
- Rename: input replaces title inline → saves on blur/Enter, brief "Saved ✓" indicator
- Delete: item removed from list immediately → toast confirms; reappears on failure

---

## Error Handling

- All server actions return `{ error?: string }` — failures trigger Sonner toast + optimistic rollback
- Rename failure: title reverts to original
- Delete failure: item reappears in list
- Reorder failure: order reverts to pre-drag state
- Duplicate playlist names: allowed (no uniqueness constraint)
- Adding already-present song: picker shows it checked; clicking removes it
- Deleting playlist with songs: handled by existing `ON DELETE CASCADE` on `setlist_items`

---

## Testing

- Unit tests (Vitest) for each server action: happy path + auth guard + smart playlist guard
- Manual verification checklist in the implementation plan
- No UI component tests for MVP

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-02-28 | Initial approved design |
