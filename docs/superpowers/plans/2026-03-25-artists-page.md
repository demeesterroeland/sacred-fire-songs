# Artists Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browsable artists directory page at `/library/artists` that aggregates unique authors from public songs.

**Architecture:** Server component fetches aggregated artist data (name, song count, top categories) from Supabase via two queries composed in TypeScript. Data is passed to a client component that renders a compact list. Clicking an artist navigates to `/songs?search={name}`.

**Tech Stack:** Next.js 16, Supabase JS client, Tailwind CSS, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-25-artists-page-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/songs/serverQueries.ts` | Modify | Add `ArtistSummary` type + `fetchArtistsServer()` |
| `app/library/artists/page.tsx` | Modify | Convert placeholder to server component calling `fetchArtistsServer()` |
| `app/library/artists/ArtistsPageContent.tsx` | Create | Client component rendering the artist list |

---

### Task 1: Add `fetchArtistsServer()` to server queries

**Files:**
- Modify: `lib/songs/serverQueries.ts` (append to end of file)

- [ ] **Step 1: Add `ArtistSummary` type and `fetchArtistsServer` function**

Add at the end of `lib/songs/serverQueries.ts`:

```typescript
/* ── Artists aggregation ─────────────────────────────────── */

export interface ArtistSummary {
    name: string;
    songCount: number;
    topCategories: string[];
}

/**
 * Aggregates unique authors from public compositions with song counts
 * and their top 3 most common categories.
 */
export async function fetchArtistsServer(): Promise<ArtistSummary[]> {
    const supabase = await createClient();

    // Query 1: distinct authors with song counts
    const { data: compositions, error: compError } = await supabase
        .from('compositions')
        .select('original_author')
        .eq('is_public', true)
        .not('original_author', 'is', null);

    if (compError) {
        console.error('fetchArtistsServer compositions error:', compError);
        return [];
    }

    // Count songs per author
    const authorCounts = new Map<string, number>();
    for (const row of compositions || []) {
        const name = row.original_author;
        if (name) authorCounts.set(name, (authorCounts.get(name) || 0) + 1);
    }

    // Query 2: categories per author (for public songs only)
    const { data: catRows, error: catError } = await supabase
        .from('compositions')
        .select('original_author, song_category_map(categories(name))')
        .eq('is_public', true)
        .not('original_author', 'is', null);

    if (catError) {
        console.error('fetchArtistsServer categories error:', catError);
        // Continue without categories — still return authors with counts
    }

    // Count category frequency per author, pick top 3
    const authorCategories = new Map<string, Map<string, number>>();
    for (const row of catRows || []) {
        const name = row.original_author as string;
        if (!name) continue;
        if (!authorCategories.has(name)) authorCategories.set(name, new Map());
        const catMap = authorCategories.get(name)!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const mapItem of (row as any).song_category_map || []) {
            const catName = mapItem.categories?.name;
            if (catName) catMap.set(catName, (catMap.get(catName) || 0) + 1);
        }
    }

    // Build sorted result
    const artists: ArtistSummary[] = Array.from(authorCounts.entries())
        .map(([name, songCount]) => {
            const catMap = authorCategories.get(name);
            const topCategories = catMap
                ? Array.from(catMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([catName]) => catName)
                : [];
            return { name, songCount, topCategories };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    return artists;
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npx next build --no-lint 2>&1 | tail -5` or `npx tsc --noEmit`
Expected: No type errors related to the new function.

- [ ] **Step 3: Commit**

```bash
git add lib/songs/serverQueries.ts
git commit -m "feat(artists): add fetchArtistsServer query with category aggregation"
```

---

### Task 2: Create `ArtistsPageContent` client component

**Files:**
- Create: `app/library/artists/ArtistsPageContent.tsx`

- [ ] **Step 1: Create the client component**

Create `app/library/artists/ArtistsPageContent.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ArtistSummary } from '@/lib/songs/serverQueries';

const GRADIENTS: [string, string][] = [
    ['#ef4444', '#f97316'],
    ['#8b5cf6', '#6366f1'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#d97706'],
    ['#3b82f6', '#2563eb'],
    ['#ec4899', '#db2777'],
    ['#14b8a6', '#0d9488'],
    ['#f43f5e', '#e11d48'],
];

function getArtistGradient(name: string): [string, string] {
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return GRADIENTS[hash % GRADIENTS.length];
}

export default function ArtistsPageContent({ artists }: { artists: ArtistSummary[] }) {
    if (artists.length === 0) {
        return (
            <p className="text-sm text-gray-600 italic py-8 text-center">
                No artists yet — songs added to the library will appear here.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-1">
            {artists.map((artist) => {
                const [from, to] = getArtistGradient(artist.name);
                const initial = artist.name.charAt(0).toUpperCase();
                const subtitle = [
                    `${artist.songCount} song${artist.songCount !== 1 ? 's' : ''}`,
                    ...artist.topCategories,
                ].join(' · ');

                return (
                    <Link
                        key={artist.name}
                        href={`/songs?search=${encodeURIComponent(artist.name)}`}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors group"
                    >
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-base shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                            {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-gray-950 dark:group-hover:text-white transition-colors">
                                {artist.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {subtitle}
                            </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-700 shrink-0 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                    </Link>
                );
            })}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/library/artists/ArtistsPageContent.tsx
git commit -m "feat(artists): add ArtistsPageContent client component"
```

---

### Task 3: Wire up the server page

**Files:**
- Modify: `app/library/artists/page.tsx` (replace placeholder)

- [ ] **Step 1: Replace placeholder with server component**

Replace entire contents of `app/library/artists/page.tsx`:

```tsx
import { Mic2 } from 'lucide-react';
import { fetchArtistsServer } from '@/lib/songs/serverQueries';
import ArtistsPageContent from './ArtistsPageContent';

export default async function ArtistsPage() {
    const artists = await fetchArtistsServer();

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Mic2 className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Artists
                </h2>
                <span className="text-xs text-gray-600 ml-1">({artists.length})</span>
            </div>
            <ArtistsPageContent artists={artists} />
        </div>
    );
}
```

- [ ] **Step 2: Verify the page loads**

Run: `npm run dev` and visit `http://localhost:3000/library/artists`
Expected: List of artists with avatar initials, song counts, and category pills. Clicking an artist navigates to `/songs?search={name}`.

- [ ] **Step 3: Commit**

```bash
git add app/library/artists/page.tsx
git commit -m "feat(artists): wire up artists page with server data fetching"
```

---

### Task 4: Verify end-to-end and final commit

- [ ] **Step 1: Test the full flow**

1. Visit `/library/artists` — should show alphabetical list of artists
2. Click an artist — should navigate to `/songs?search={name}` showing their songs
3. Check dark mode — avatars, text, hover states should all look correct
4. Check light mode — same verification
5. Check the Artists tab in LibraryTabs is active when on the page

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds with no errors.
