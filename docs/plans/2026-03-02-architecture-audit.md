# Architecture Audit Remediation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address all 7 audit findings: images config, staleTime tuning, DRY query builders, Zod validation, component extraction, infinite scroll, and test coverage.

**Architecture:** Bottom-up approach — fix foundations (config, shared queries, validation) before structural changes (component extraction, infinite scroll). Each task is an independent, shippable commit. Tests are written for new code as it's created.

**Tech Stack:** Next.js 16, React 19, Supabase, TanStack React Query, Zod, Vitest

---

### Task 1: Quick Wins — Images Config & staleTime

**Files:**
- Modify: `next.config.ts`
- Modify: `components/providers/QueryProvider.tsx`

**Step 1: Add images remote patterns to next.config.ts**

Replace the contents of `next.config.ts` with:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '',
  // @ts-ignore - Valid in Next.js 16 to suppress local IP cross-origin warnings
  allowedDevOrigins: ['192.168.86.99:3000'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
```

**Step 2: Reduce global staleTime default in QueryProvider.tsx**

In `components/providers/QueryProvider.tsx`, change line 14 from:

```typescript
staleTime: 5 * 60 * 1000,
```

to:

```typescript
staleTime: 60 * 1000, // 1 minute — lists refresh frequently
```

> Note: In Task 4 (component extraction), individual detail queries will override this to 5 minutes via per-query `staleTime`.

**Step 3: Verify the app builds**

Run: `npx next build`
Expected: Build succeeds with no new errors.

**Step 4: Commit**

```bash
git add next.config.ts components/providers/QueryProvider.tsx
git commit -m "chore: add images remote patterns and tune staleTime defaults"
```

---

### Task 2: DRY Query Builders — Shared Songs Query

**Files:**
- Create: `lib/songs/queries.ts`
- Modify: `lib/songs/serverQueries.ts`
- Modify: `lib/songUtils.ts`

**Step 1: Create the shared query builder**

Create `lib/songs/queries.ts`:

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Song } from '@/lib/songUtils';

/**
 * Shared select string for composition queries.
 * Used by both server and client fetchers — single source of truth.
 */
export const SONGS_SELECT = `
  *,
  song_versions(key, content_chordpro, melody_notation),
  song_category_map(
    categories(
      name,
      slug,
      parent:parent_id(name, slug)
    )
  )
`;

/**
 * Builds a Supabase query for compositions with all joins.
 * Works with both server and browser Supabase clients.
 */
export function songsQuery(
  client: SupabaseClient,
  opts?: { limit?: number; cursor?: string }
) {
  let q = client
    .from('compositions')
    .select(SONGS_SELECT)
    .order('created_at', { ascending: false });

  if (opts?.cursor) q = q.lt('created_at', opts.cursor);
  if (opts?.limit) q = q.limit(opts.limit);
  return q;
}

/**
 * Maps a raw Supabase composition row (with joins) to a Song object.
 * Single source of truth for field mapping — used by server and client.
 */
export function mapCompositionToSong(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
  favoriteIds?: Set<string>
): Song {
  const version = (item.song_versions as any[])?.[0];

  const rawCategories = (item.song_category_map as any[]) || [];
  const categories = rawCategories.map((mapItem: any) => {
    const cat = mapItem.categories;
    return {
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent?.name || null,
      parentSlug: cat.parent?.slug || null,
    };
  });

  return {
    id: item.id,
    title: item.title,
    author: item.original_author || 'Unknown',
    songKey: version?.key || null,
    content: version?.content_chordpro || '',
    melodyNotation: version?.melody_notation || '',
    ownerId: item.owner_id ?? undefined,
    isPublic: item.is_public ?? true,
    hasChords: item.has_chords ?? false,
    hasMelody: item.has_melody ?? false,
    createdAt: item.created_at,
    color: 'red',
    categories,
    isFavorite: favoriteIds?.has(item.id) ?? false,
  } as Song;
}
```

**Step 2: Refactor serverQueries.ts to use shared builder**

Replace `fetchSongsServer` in `lib/songs/serverQueries.ts` (lines 9-101) with:

```typescript
import { songsQuery, mapCompositionToSong } from './queries';

export async function fetchSongsServer(limit?: number): Promise<Song[]> {
    const supabase = await createClient();

    const [songsResult, favoriteIds] = await Promise.all([
        songsQuery(supabase, { limit: limit ?? undefined }),
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return new Set<string>();

            const { data: setlist } = await supabase
                .from('setlists')
                .select('id')
                .eq('owner_id', user.id)
                .eq('title', 'My Favorites')
                .maybeSingle();

            if (!setlist) return new Set<string>();

            const { data: items } = await supabase
                .from('setlist_items')
                .select('song_versions(composition_id)')
                .eq('setlist_id', setlist.id);

            return new Set<string>(
                (items || []).map((i: any) => i.song_versions?.composition_id).filter(Boolean)
            );
        })(),
    ]);

    if (songsResult.error) {
        console.error('fetchSongsServer query error:', songsResult.error);
        return [];
    }

    return songsResult.data.map(item => mapCompositionToSong(item, favoriteIds));
}
```

Keep `fetchFavoriteSongsServer` and `fetchCategoryTreeServer` unchanged — they have different select patterns.

**Step 3: Refactor songUtils.ts client fetchSongs to use shared builder**

Replace the `fetchSongs` function in `lib/songUtils.ts` (lines 66-138) with:

```typescript
import { songsQuery, mapCompositionToSong } from './songs/queries';

export const fetchSongs = async (limit?: number) => {
    const supabase = createClient();
    const { data, error } = await songsQuery(supabase, { limit: limit ?? undefined });
    if (error) throw error;
    return data.map(item => mapCompositionToSong(item));
};
```

Remove the old `createClient` import from `./supabase/client` only if no other function in the file uses it. The `Song` interface and `filterSongs` function stay in this file.

**Step 4: Verify the app builds and songs load**

Run: `npx next build`
Expected: Build succeeds.

Run: `npx next dev` and navigate to `/songs`
Expected: Songs page loads with same data as before.

**Step 5: Commit**

```bash
git add lib/songs/queries.ts lib/songs/serverQueries.ts lib/songUtils.ts
git commit -m "refactor: extract shared query builder for songs (DRY)"
```

---

### Task 3: Zod Validation Schemas

**Files:**
- Create: `lib/validation/schemas.ts`
- Create: `lib/unit-tests/schemas.test.ts`

**Step 1: Write the failing test**

Create `lib/unit-tests/schemas.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { uuid, playlistTitle, playlistDescription } from '@/lib/validation/schemas';

describe('uuid schema', () => {
  it('accepts a valid UUID', () => {
    expect(() => uuid.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
  });

  it('rejects a non-UUID string', () => {
    expect(() => uuid.parse('not-a-uuid')).toThrow();
  });

  it('rejects an empty string', () => {
    expect(() => uuid.parse('')).toThrow();
  });
});

describe('playlistTitle schema', () => {
  it('accepts a normal title', () => {
    expect(playlistTitle.parse('My Ceremony Songs')).toBe('My Ceremony Songs');
  });

  it('trims whitespace', () => {
    expect(playlistTitle.parse('  Padded  ')).toBe('Padded');
  });

  it('rejects an empty string', () => {
    expect(() => playlistTitle.parse('')).toThrow();
  });

  it('rejects whitespace-only', () => {
    expect(() => playlistTitle.parse('   ')).toThrow();
  });

  it('rejects strings over 200 chars', () => {
    expect(() => playlistTitle.parse('x'.repeat(201))).toThrow();
  });
});

describe('playlistDescription schema', () => {
  it('accepts a normal description', () => {
    expect(playlistDescription.parse('Closing songs')).toBe('Closing songs');
  });

  it('accepts undefined', () => {
    expect(playlistDescription.parse(undefined)).toBeUndefined();
  });

  it('rejects strings over 2000 chars', () => {
    expect(() => playlistDescription.parse('x'.repeat(2001))).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run lib/unit-tests/schemas.test.ts`
Expected: FAIL — module `@/lib/validation/schemas` not found.

**Step 3: Create the schemas**

Create `lib/validation/schemas.ts`:

```typescript
import { z } from 'zod';

/** Validates a UUID string */
export const uuid = z.string().uuid();

/** Validates a playlist title: trimmed, 1-200 chars */
export const playlistTitle = z.string().trim().min(1, 'Title required').max(200, 'Title too long');

/** Validates an optional playlist description: max 2000 chars */
export const playlistDescription = z.string().max(2000, 'Description too long').optional();

/**
 * Wraps a Zod parse in a try/catch, returning { error: string } on failure.
 * Use in server actions to avoid throwing.
 */
export function safeParse<T>(schema: z.ZodType<T>, value: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(value);
  if (result.success) return { data: result.data };
  return { error: result.error.issues.map(i => i.message).join(', ') };
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/unit-tests/schemas.test.ts`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add lib/validation/schemas.ts lib/unit-tests/schemas.test.ts
git commit -m "feat: add Zod validation schemas with tests"
```

---

### Task 4: Apply Zod Validation to Server Actions

**Files:**
- Modify: `app/actions/playlistActions.ts`
- Modify: `app/actions/toggleFavorite.ts`
- Modify: `app/actions/deleteSong.ts`

**Step 1: Add Zod validation to playlistActions.ts**

At the top of `app/actions/playlistActions.ts`, add import:

```typescript
import { uuid, playlistTitle, playlistDescription, safeParse } from '@/lib/validation/schemas';
```

Then add validation at the top of each function body. For example, `createPlaylist`:

```typescript
export async function createPlaylist(
    title: string
): Promise<{ id: string } | { error: string }> {
    const parsed = safeParse(playlistTitle, title);
    if ('error' in parsed) return { error: parsed.error };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('setlists')
        .insert({ owner_id: user.id, title: parsed.data, is_public: false })
        .select('id')
        .maybeSingle();

    if (error) return { error: error.message };
    if (!data) return { error: 'Insert returned no data' };
    revalidatePath('/library/playlists');
    return { id: data.id };
}
```

> Note: Remove the manual `title.trim()` and `if (!trimmed)` checks — Zod handles this now.

Apply the same pattern to all 7 functions in `playlistActions.ts`:
- `renamePlaylist(id, title)` → validate `uuid` for id, `playlistTitle` for title
- `deletePlaylist(id)` → validate `uuid` for id
- `togglePlaylistVisibility(id, isPublic)` → validate `uuid` for id, `z.boolean()` for isPublic
- `updatePlaylistDescription(id, description)` → validate `uuid` for id, `playlistDescription` for description
- `addSongToPlaylist(playlistId, compositionId)` → validate `uuid` for both
- `removeSongFromPlaylist(itemId)` → validate `uuid` for itemId
- `reorderPlaylistSongs(playlistId, orderedItemIds)` → validate `uuid` for playlistId, `z.array(uuid)` for orderedItemIds

**Step 2: Add Zod validation to toggleFavorite.ts**

At the top of `toggleFavorite` function body in `app/actions/toggleFavorite.ts`:

```typescript
import { uuid, safeParse } from '@/lib/validation/schemas';

export async function toggleFavorite(compositionId: string) {
    const parsed = safeParse(uuid, compositionId);
    if ('error' in parsed) return { error: 'Invalid composition ID' };
    // ... rest of function uses parsed.data instead of compositionId
```

**Step 3: Add Zod validation to deleteSong.ts**

At the top of `deleteSong` function body in `app/actions/deleteSong.ts`:

```typescript
import { uuid, safeParse } from '@/lib/validation/schemas';

export async function deleteSong(id: string) {
    const parsed = safeParse(uuid, id);
    if ('error' in parsed) return { error: 'Invalid song ID' };
    // ... rest of function uses parsed.data instead of id
```

**Step 4: Verify the app builds**

Run: `npx next build`
Expected: Build succeeds.

**Step 5: Smoke test — create a playlist, toggle favorite, delete a song**

Run `npx next dev` and manually test:
1. Create a playlist from `/library/playlists/add`
2. Toggle favorite on any song
3. (If admin) Delete a test song

Expected: All actions work as before.

**Step 6: Commit**

```bash
git add app/actions/playlistActions.ts app/actions/toggleFavorite.ts app/actions/deleteSong.ts
git commit -m "feat: add Zod input validation to all server actions"
```

---

### Task 5: Component Extraction — Songs Page Hooks

**Files:**
- Create: `hooks/useSongsQuery.ts`
- Create: `hooks/useFavoritesQuery.ts`
- Create: `hooks/useSongsFilter.ts`
- Modify: `app/songs/SongsPageContent.tsx`

**Step 1: Extract useSongsQuery hook**

Create `hooks/useSongsQuery.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '@/lib/songUtils';
import { fetchCategoryTree, type TaxonomyNode } from '@/lib/taxonomyUtils';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import type { Song } from '@/lib/songUtils';

interface UseSongsQueryOptions {
  initialSongs: Song[];
  initialTaxonomy: TaxonomyNode[];
}

export function useSongsQuery({ initialSongs, initialTaxonomy }: UseSongsQueryOptions) {
  const { data: songs = [], isLoading: songsLoading } = useQuery({
    queryKey: SONG_KEYS.list(),
    queryFn: () => fetchSongs(),
    initialData: initialSongs,
    staleTime: 60_000, // 1 min for lists
  });

  const { data: taxonomy = [] } = useQuery({
    queryKey: SONG_KEYS.taxonomy(),
    queryFn: fetchCategoryTree,
    initialData: initialTaxonomy,
    staleTime: 5 * 60_000, // 5 min for taxonomy (rarely changes)
  });

  return { songs, taxonomy, songsLoading };
}
```

**Step 2: Extract useFavoritesQuery hook**

Create `hooks/useFavoritesQuery.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SONG_KEYS } from '@/lib/songs/queryKeys';

export function useFavoritesQuery(userId?: string) {
  const { data: favoriteIds = new Set<string>() } = useQuery({
    queryKey: SONG_KEYS.favorites(userId),
    queryFn: async () => {
      if (!userId) return new Set<string>();
      const supabase = createClient();
      const { data: setlist } = await supabase
        .from('setlists')
        .select('id')
        .eq('title', 'My Favorites')
        .maybeSingle();
      if (!setlist) return new Set<string>();
      const { data: items } = await supabase
        .from('setlist_items')
        .select('song_versions(composition_id)')
        .eq('setlist_id', setlist.id);
      return new Set<string>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (items ?? []).map((item: any) => item.song_versions?.composition_id).filter(Boolean)
      );
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  return { favoriteIds };
}
```

**Step 3: Extract useSongsFilter hook**

Create `hooks/useSongsFilter.ts`:

```typescript
import { useMemo } from 'react';
import { useDeclarativeFilter } from '@/hooks/useDeclarativeFilter';
import { songFilterConfig, type SongFilterState } from '@/lib/songs/filterConfig';
import type { Song } from '@/lib/songUtils';
import type { TaxonomyNode } from '@/lib/taxonomyUtils';

interface UseSongsFilterOptions {
  songs: Song[];
  taxonomy: TaxonomyNode[];
  userId?: string;
  favoriteIds: Set<string>;
  sortBy: string;
}

export function useSongsFilter({ songs, userId, favoriteIds, sortBy }: UseSongsFilterOptions) {
  const defaultState: SongFilterState = {
    status: userId ? 'all' : 'public',
    search: '',
    category: undefined,
    tags: [],
    chords: false,
    melody: false,
    favorites: false,
    mine: false,
  };

  const { filteredItems, facets, state, setFilter, resetFilters } = useDeclarativeFilter(
    songs,
    songFilterConfig,
    defaultState,
    {
      parseUrl: (params) => ({
        category: params.get('category') || undefined,
        tags: params.get('tag') ? params.get('tag')!.split(',').filter(Boolean) : [],
        status: (params.get('status') as SongFilterState['status']) || (userId ? 'all' : 'public'),
        search: params.get('search') || '',
        chords: params.get('chords') === 'true',
        melody: params.get('melody') === 'true',
        favorites: params.get('favorites') === 'true',
        mine: params.get('mine') === 'true',
      }),
      serializeUrl: (state) => ({
        category: state.category || '',
        tag: state.tags?.join(',') || '',
        status: state.status === 'all' ? '' : state.status || '',
        search: state.search || '',
        chords: state.chords ? 'true' : '',
        melody: state.melody ? 'true' : '',
        favorites: state.favorites ? 'true' : '',
        mine: state.mine ? 'true' : '',
        sort: sortBy,
      }),
    }
  );

  // Apply post-filters (favorites, mine)
  const finalFilteredItems = useMemo(() => {
    let items = filteredItems;
    if (state.favorites) items = items.filter(s => favoriteIds.has(s.id));
    if (state.mine && userId) items = items.filter(s => s.ownerId === userId);
    return items;
  }, [filteredItems, state.favorites, state.mine, favoriteIds, userId]);

  // Sort
  const displaySongs = useMemo(() => {
    return [...finalFilteredItems].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [finalFilteredItems, sortBy]);

  const chordsCount = facets.chords?.get('true') || 0;
  const melodyCount = facets.melody?.get('true') || 0;

  const hasActiveFilters = !!(
    state.category ||
    (state.tags?.length ?? 0) > 0 ||
    state.search ||
    (userId && state.status !== 'all') ||
    state.chords ||
    state.melody ||
    state.favorites ||
    state.mine
  );

  return {
    displaySongs,
    filteredCount: finalFilteredItems.length,
    state,
    setFilter,
    resetFilters,
    chordsCount,
    melodyCount,
    hasActiveFilters,
  };
}
```

**Step 4: Refactor SongsPageContent to use extracted hooks**

Replace lines 31-203 of `app/songs/SongsPageContent.tsx` with hook calls. The component should now:
1. Call `useSongsQuery({ initialSongs, initialTaxonomy })`
2. Call `useFavoritesQuery(user?.id)`
3. Call `useSongsFilter({ songs, taxonomy, userId: user?.id, favoriteIds, sortBy })`
4. Manage only local UI state (`localSearch`, `deleteTarget`, `filtersOpen`)
5. Render the JSX (lines 204-451 stay mostly the same)

The component should shrink from ~451 lines to ~250 lines (render + local UI state only).

**Step 5: Verify the app builds and songs page works**

Run: `npx next build`
Expected: Build succeeds.

Run: `npx next dev` and test:
1. Songs page loads
2. Search works
3. Filters work (category, tags, chords, melody, favorites, mine)
4. Sort dropdown works
5. Delete works

**Step 6: Commit**

```bash
git add hooks/useSongsQuery.ts hooks/useFavoritesQuery.ts hooks/useSongsFilter.ts app/songs/SongsPageContent.tsx
git commit -m "refactor: extract songs page hooks for separation of concerns"
```

---

### Task 6: Infinite Scroll — Server-Side Pagination

**Files:**
- Modify: `lib/songs/serverQueries.ts`
- Modify: `lib/songUtils.ts`
- Modify: `hooks/useSongsQuery.ts`
- Modify: `app/songs/SongsPageContent.tsx`
- Modify: `app/songs/page.tsx`

**Step 1: Add paginated fetch to server queries**

Add to `lib/songs/serverQueries.ts`:

```typescript
import { songsQuery, mapCompositionToSong } from './queries';

const PAGE_SIZE = 20;

export async function fetchSongsPageServer(cursor?: string): Promise<{
  songs: Song[];
  nextCursor: string | null;
}> {
  const supabase = await createClient();

  const [songsResult, favoriteIds] = await Promise.all([
    songsQuery(supabase, { limit: PAGE_SIZE, cursor }),
    // ... same favorites fetch as fetchSongsServer
  ]);

  if (songsResult.error) {
    console.error('fetchSongsPageServer error:', songsResult.error);
    return { songs: [], nextCursor: null };
  }

  const songs = songsResult.data.map(item => mapCompositionToSong(item, favoriteIds));
  const nextCursor = songs.length === PAGE_SIZE
    ? songs[songs.length - 1].createdAt
    : null;

  return { songs, nextCursor };
}
```

**Step 2: Add paginated client fetch**

Add to `lib/songUtils.ts`:

```typescript
import { songsQuery, mapCompositionToSong } from './songs/queries';

const PAGE_SIZE = 20;

export const fetchSongsPage = async (cursor?: string) => {
  const supabase = createClient();
  const { data, error } = await songsQuery(supabase, { limit: PAGE_SIZE, cursor });
  if (error) throw error;
  const songs = data.map(item => mapCompositionToSong(item));
  const nextCursor = songs.length === PAGE_SIZE
    ? songs[songs.length - 1].createdAt
    : null;
  return { songs, nextCursor };
};
```

**Step 3: Update useSongsQuery to use useInfiniteQuery**

Modify `hooks/useSongsQuery.ts`:

```typescript
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchSongsPage } from '@/lib/songUtils';
import { fetchCategoryTree, type TaxonomyNode } from '@/lib/taxonomyUtils';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import type { Song } from '@/lib/songUtils';
import { useMemo } from 'react';

interface UseSongsQueryOptions {
  initialSongs: Song[];
  initialNextCursor: string | null;
  initialTaxonomy: TaxonomyNode[];
}

export function useSongsQuery({ initialSongs, initialNextCursor, initialTaxonomy }: UseSongsQueryOptions) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: SONG_KEYS.list(),
    queryFn: ({ pageParam }) => fetchSongsPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: {
      pages: [{ songs: initialSongs, nextCursor: initialNextCursor }],
      pageParams: [undefined],
    },
    staleTime: 60_000,
  });

  const songs = useMemo(
    () => data?.pages.flatMap(p => p.songs) ?? [],
    [data]
  );

  const { data: taxonomy = [] } = useQuery({
    queryKey: SONG_KEYS.taxonomy(),
    queryFn: fetchCategoryTree,
    initialData: initialTaxonomy,
    staleTime: 5 * 60_000,
  });

  return { songs, taxonomy, fetchNextPage, hasNextPage, isFetchingNextPage };
}
```

**Step 4: Update the server page to pass initialNextCursor**

Modify `app/songs/page.tsx` to call `fetchSongsPageServer()` instead of `fetchSongsServer()` and pass `initialNextCursor` as a prop to `SongsPageContent`.

**Step 5: Add IntersectionObserver sentinel to SongsPageContent**

At the bottom of the song grid in `SongsPageContent.tsx`, add:

```tsx
import { useRef, useEffect } from 'react';

// Inside the component:
const sentinelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!hasNextPage || !sentinelRef.current) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) fetchNextPage();
    },
    { threshold: 0.1 }
  );
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasNextPage, fetchNextPage]);

// In JSX, after the song grid:
{hasNextPage && (
  <div ref={sentinelRef} className="flex justify-center py-8">
    {isFetchingNextPage && (
      <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
    )}
  </div>
)}
```

**Step 6: Verify infinite scroll works**

Run: `npx next dev`

1. Navigate to `/songs`
2. If you have > 20 songs, verify only 20 load initially
3. Scroll down — more songs should auto-load
4. With <= 20 songs, verify no "load more" sentinel appears
5. Search and filters still work

**Step 7: Commit**

```bash
git add lib/songs/serverQueries.ts lib/songUtils.ts hooks/useSongsQuery.ts app/songs/SongsPageContent.tsx app/songs/page.tsx
git commit -m "feat: add infinite scroll with cursor-based pagination"
```

---

### Task 7: Test Coverage — Query Builder & Mapper

**Files:**
- Create: `lib/unit-tests/queries.test.ts`

**Step 1: Write tests for mapCompositionToSong**

Create `lib/unit-tests/queries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { mapCompositionToSong } from '@/lib/songs/queries';

describe('mapCompositionToSong', () => {
  const baseItem = {
    id: 'abc-123',
    title: 'Test Song',
    original_author: 'Test Author',
    owner_id: 'user-1',
    is_public: true,
    has_chords: true,
    has_melody: false,
    created_at: '2026-01-01T00:00:00Z',
    song_versions: [{ key: 'Am', content_chordpro: '[Am]Hello', melody_notation: '' }],
    song_category_map: [
      { categories: { name: 'Healing', slug: 'healing', parent: { name: 'Theme', slug: 'theme' } } },
    ],
  };

  it('maps a complete row correctly', () => {
    const song = mapCompositionToSong(baseItem);
    expect(song.id).toBe('abc-123');
    expect(song.title).toBe('Test Song');
    expect(song.author).toBe('Test Author');
    expect(song.songKey).toBe('Am');
    expect(song.content).toBe('[Am]Hello');
    expect(song.categories).toHaveLength(1);
    expect(song.categories[0].name).toBe('Healing');
    expect(song.categories[0].parent).toBe('Theme');
    expect(song.isFavorite).toBe(false);
  });

  it('handles missing author', () => {
    const song = mapCompositionToSong({ ...baseItem, original_author: null });
    expect(song.author).toBe('Unknown');
  });

  it('handles missing song_versions', () => {
    const song = mapCompositionToSong({ ...baseItem, song_versions: [] });
    expect(song.songKey).toBeNull();
    expect(song.content).toBe('');
  });

  it('handles empty categories', () => {
    const song = mapCompositionToSong({ ...baseItem, song_category_map: [] });
    expect(song.categories).toEqual([]);
  });

  it('marks favorite when in favoriteIds set', () => {
    const favs = new Set(['abc-123']);
    const song = mapCompositionToSong(baseItem, favs);
    expect(song.isFavorite).toBe(true);
  });

  it('marks not favorite when not in set', () => {
    const favs = new Set(['other-id']);
    const song = mapCompositionToSong(baseItem, favs);
    expect(song.isFavorite).toBe(false);
  });
});
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run lib/unit-tests/queries.test.ts`
Expected: All tests PASS.

**Step 3: Commit**

```bash
git add lib/unit-tests/queries.test.ts
git commit -m "test: add unit tests for shared query mapper"
```

---

### Task 8: Test Coverage — Server Action Validation

**Files:**
- Modify: `lib/unit-tests/playlistActions.test.ts` (or create if minimal)

**Step 1: Check existing test file**

Read `lib/unit-tests/playlistActions.test.ts` to understand what's already tested.

**Step 2: Add validation-focused tests**

Add tests that verify Zod validation catches bad input before hitting the DB:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase so we can verify it's NOT called on invalid input
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } })) },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
    })),
  })),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('createPlaylist validation', () => {
  it('rejects empty title', async () => {
    const { createPlaylist } = await import('@/app/actions/playlistActions');
    const result = await createPlaylist('');
    expect(result).toHaveProperty('error');
  });

  it('rejects title over 200 chars', async () => {
    const { createPlaylist } = await import('@/app/actions/playlistActions');
    const result = await createPlaylist('x'.repeat(201));
    expect(result).toHaveProperty('error');
  });
});

describe('deletePlaylist validation', () => {
  it('rejects non-UUID id', async () => {
    const { deletePlaylist } = await import('@/app/actions/playlistActions');
    const result = await deletePlaylist('not-a-uuid');
    expect(result).toHaveProperty('error');
  });
});
```

**Step 3: Run tests**

Run: `npx vitest run lib/unit-tests/playlistActions.test.ts`
Expected: All tests PASS.

**Step 4: Commit**

```bash
git add lib/unit-tests/playlistActions.test.ts
git commit -m "test: add validation tests for server actions"
```

---

## Summary

| Task | What | Key Files |
|------|------|-----------|
| 1 | Images config + staleTime | `next.config.ts`, `QueryProvider.tsx` |
| 2 | DRY query builder | `lib/songs/queries.ts` (new) |
| 3 | Zod schemas + tests | `lib/validation/schemas.ts` (new) |
| 4 | Apply Zod to server actions | `app/actions/*.ts` |
| 5 | Extract songs page hooks | `hooks/useSongs*.ts` (3 new) |
| 6 | Infinite scroll | `useSongsQuery.ts`, `SongsPageContent.tsx` |
| 7 | Query mapper tests | `lib/unit-tests/queries.test.ts` (new) |
| 8 | Server action validation tests | `lib/unit-tests/playlistActions.test.ts` |

**Parallelization:** Tasks 1-3 are independent. Tasks 4 depends on 3. Task 5 depends on 2. Task 6 depends on 2+5. Tasks 7-8 depend on their respective implementation tasks.
