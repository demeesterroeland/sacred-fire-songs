# Artists Page Design

## Overview

A browsable directory of all unique song authors, derived from existing `compositions.original_author` data. No new database tables. Public page — no auth required.

**Route:** `/library/artists` (replaces current "Coming soon" placeholder)

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data source | Aggregate from `original_author` | No schema changes needed |
| Layout | Compact list rows | Scans fast, matches app style |
| Click behavior | Navigate to `/songs?search={name}` | Reuses existing search, consistent with author-click on song detail |
| Auth required | No | Discovery page for all visitors |
| Sorting | Alphabetical by name | Simple, no controls needed |
| Filtering | None | Manageable number of unique authors |
| Client caching | No React Query | Server-rendered, no client-side refetching needed |

## Data Model

No new tables. A server query aggregates from existing data using two queries composed in TypeScript:

**Query 1 — Author counts:**
```sql
SELECT original_author, COUNT(*) AS song_count
FROM compositions
WHERE is_public = true AND original_author IS NOT NULL
GROUP BY original_author
ORDER BY original_author ASC
```

**Query 2 — Categories per author:**
```sql
SELECT c.original_author, cat.name
FROM compositions c
JOIN song_category_map scm ON scm.composition_id = c.id
JOIN categories cat ON cat.id = scm.category_id
WHERE c.is_public = true AND c.original_author IS NOT NULL
```

The two results are combined in TypeScript: for each author, count the most frequent categories and keep the top 3.

### Artist Data Shape

Defined in `lib/songs/serverQueries.ts` alongside the query function:

```typescript
interface ArtistSummary {
  name: string;          // original_author value
  songCount: number;     // number of public songs
  topCategories: string[]; // up to 3 most common category names
}
```

## UI Layout

### Row Structure

Each artist row contains:
- **Avatar**: 44px circle with first letter initial, deterministic gradient background
- **Name**: Bold, primary text color
- **Subtitle**: `{N} songs · {category1}, {category2}, ...` (up to 3 categories)
- **Chevron**: Right-aligned `>` indicator

### Avatar Colors

Deterministic gradient derived from a hash of the artist name. Palette of 8 gradient pairs:

```typescript
const GRADIENTS = [
  ['#ef4444', '#f97316'], // red → orange
  ['#8b5cf6', '#6366f1'], // violet → indigo
  ['#10b981', '#059669'], // emerald → green
  ['#f59e0b', '#d97706'], // amber → yellow
  ['#3b82f6', '#2563eb'], // blue → blue
  ['#ec4899', '#db2777'], // pink → rose
  ['#14b8a6', '#0d9488'], // teal → teal
  ['#f43f5e', '#e11d48'], // rose → red
];

function getArtistGradient(name: string): [string, string] {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}
```

### Empty State

If no public songs exist (unlikely), show a message: "No artists yet — songs added to the library will appear here."

### Error Handling

Follow existing pattern in `serverQueries.ts`: `console.error` and return `[]`, which triggers the empty state.

### Responsive

Single column list on all breakpoints. Contained within the existing `LibraryTabs` layout (`max-w-4xl`).

## Files to Create/Modify

### Modified Files

1. **`app/library/artists/page.tsx`** — Convert from placeholder to server component
   - Calls `fetchArtistsServer()` to get aggregated artist data
   - Passes data to client component
   - No auth check (public page)

2. **`lib/songs/serverQueries.ts`** — Add `fetchArtistsServer()` function and `ArtistSummary` type
   - Two Supabase queries composed in TypeScript
   - Returns `ArtistSummary[]` sorted alphabetically

### New Files

3. **`app/library/artists/ArtistsPageContent.tsx`** — Client component
   - Renders the artist list
   - Each row is a link to `/songs?search={encodeURIComponent(name)}`
   - Avatar with deterministic gradient
   - Hover state: subtle background highlight

## Interactions

- **Click row** → `router.push('/songs?search={name}')` — shows all songs by that author
- **Hover row** → Subtle background highlight (`hover:bg-gray-100 dark:hover:bg-gray-800/70`)

## Out of Scope

- Follow/unfollow artists
- Dedicated artist detail page (`/library/artists/[slug]`)
- Artist images/photos
- Search/filter controls on the artists page
- New database tables
