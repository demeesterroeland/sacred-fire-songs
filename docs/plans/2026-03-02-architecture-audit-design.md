# Architecture Audit Remediation — Design Document

> **Version:** 1.0
> **Date:** 2026-03-02
> **Status:** Approved

## Goal

Address all 7 findings from the senior architecture audit: images config, staleTime tuning, DRY query builders, Zod validation on server actions, component extraction, infinite scroll pagination, and test coverage.

## Approach

Bottom-up (Approach A): fix foundations first, build upward. Each step is independently shippable as a small PR.

**Order:** Quick wins → DRY queries → Zod validation → Component extraction → Infinite scroll → Tests

---

## Section 1: Quick Wins

### Images Config

Add `remotePatterns` to `next.config.ts` for Supabase Storage avatars:

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co' },
  ],
}
```

### staleTime Tuning

Change from global 5-minute default to per-query settings:

- **Lists** (songs, playlists): `staleTime: 60_000` (1 min)
- **Details** (song/:id): `staleTime: 5 * 60_000` (5 min)

Applied via `queryOptions` on individual queries rather than changing the global default.

---

## Section 2: DRY Query Builders

### Problem

`lib/songs/serverQueries.ts` and `lib/songUtils.ts` duplicate Supabase `.select()` queries with identical joins. They've already diverged (the `is_public` filter bug).

### Solution

Create `lib/songs/queries.ts` with shared query builder functions:

- **`SONGS_SELECT`** — the shared select string with all joins
- **`songsQuery(client, opts?)`** — builds the query with optional `limit` and `cursor` params
- **`mapCompositionToSong(item, favoriteIds?)`** — normalizes raw Supabase row into `Song` interface

Both `serverQueries.ts` and `songUtils.ts` import from `queries.ts` instead of duplicating logic.

The `cursor` parameter is added now but not used until the infinite scroll task.

---

## Section 3: Zod Validation on Server Actions

### Problem

Server actions accept raw strings with minimal validation. Malformed inputs cause unnecessary DB round-trips.

### Solution

Create `lib/validation/schemas.ts` with reusable Zod atoms:

```typescript
export const uuid = z.string().uuid();
export const playlistTitle = z.string().trim().min(1, 'Title required').max(200);
export const playlistDescription = z.string().max(2000).optional();
```

**Scope — 3 files, ~10 functions:**

| File | Validation Added |
|------|-----------------|
| `playlistActions.ts` (7 fns) | uuid for IDs, playlistTitle, playlistDescription, uuid array for reorder |
| `toggleFavorite.ts` (1 fn) | uuid for compositionId |
| `deleteSong.ts` (1 fn) | uuid for id |

Each action calls `schema.parse()` at the top. ZodError is caught and returned as `{ error: string }`.

---

## Section 4: Component Extraction — SongsPageContent

### Problem

`SongsPageContent.tsx` is 451 lines handling filtering, sorting, favorites, guest nudges, categories, and rendering.

### Solution

Extract three focused hooks:

| Hook | Responsibility |
|------|---------------|
| `useSongsQuery(initialSongs)` | React Query setup for songs + taxonomy. Returns `{ songs, taxonomy, isLoading }` |
| `useFavoritesQuery(userId)` | Favorites fetching + guest merge. Returns `{ favoriteIds, toggleFavorite }` |
| `useSongsFilter(songs, taxonomy)` | Filtering/sorting logic. Returns `{ filtered, facets, handlers, activeCount }` |

`SongsPageContent.tsx` becomes a thin render shell (~150 lines). No behavior change — purely structural.

---

## Section 5: Infinite Scroll with Lazy Loading

### Problem

`fetchSongsServer()` loads all compositions with 3 joined tables. Won't scale beyond ~100 songs.

### Solution

Cursor-based pagination with `useInfiniteQuery` and `IntersectionObserver`.

**Server side:**
- `songsQuery()` builder supports `cursor` + `limit` (from Section 2)
- Default page size: 20 songs
- Cursor: `created_at` of last song (descending order, `lt()` for next page)
- SSR fetches first page, passes as `initialData`

**Client side:**
- `useSongsQuery` uses `useInfiniteQuery` instead of `useQuery`
- `getNextPageParam` returns last song's `created_at` or `undefined` if < 20 returned
- Pages flattened into single array for filtering/rendering

**Scroll trigger:**
- Sentinel `<div>` after last card, observed by `IntersectionObserver`
- Calls `fetchNextPage()` when visible
- Subtle loading spinner during fetch

**Filtering:**
- Client-side filtering works on all loaded pages
- When search query is active, fetch server-side with `.ilike('title', '%query%')` to avoid missing results beyond loaded pages

**Unchanged:**
- Favorites query (separate, small)
- Category tree (small, loaded fully)
- Song detail pages (individual fetch)

---

## Section 6: Test Coverage

### Tier 1 — Unit tests for new code

| Target | Tests |
|--------|-------|
| `lib/songs/queries.ts` | Query builder returns correct select/order/limit/cursor |
| `lib/validation/schemas.ts` | Valid inputs pass, invalid throw with correct messages |
| `mapCompositionToSong()` | Handles nulls, missing versions, empty categories |

### Tier 2 — Server action tests (mock Supabase)

| Target | Tests |
|--------|-------|
| `playlistActions.ts` | Auth check, ownership, smart playlist guard, Zod rejection |
| `toggleFavorite.ts` | Creates "My Favorites" on first toggle, toggles on/off |
| `deleteSong.ts` | Admin-only check, revalidation |

### Tier 3 — Hook tests (React Testing Library)

| Target | Tests |
|--------|-------|
| `useSongsFilter` | Filter combinations, empty states, facet counts |
| `useFavoritesQuery` | Merges guest + auth favorites correctly |

### Not in scope

- E2E tests (Playwright) — separate initiative
- Component render tests — low ROI for current complexity

All tests use vitest. Files in `lib/unit-tests/` following existing convention.

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-03-02 | Initial design — all 6 sections approved |
