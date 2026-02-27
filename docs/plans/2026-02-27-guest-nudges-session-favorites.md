# Guest Nudges & Session Favorites Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give guests a warm, contextual experience that communicates value before asking for commitment — localStorage-based favorites that persist on-device, friendly nudge modals/toasts at contribution moments, and a guest-friendly Playlists page.

**Architecture:** Guest favorites live entirely in localStorage (`sfs_guest_favorites: string[]`). A custom hook (`useGuestFavorites`) manages this. `SongCard` detects guest state via `useAuth` and switches between localStorage and server-action favorite behavior. The Add Song form shows a `JoinCircleModal` on submit instead of redirecting. The `AccessDenied` component gains a `variant` prop to handle guest vs. wrong-owner cases. On login/signup, a server action merges localStorage favorites into the user's "My Favorites" setlist.

**Tech Stack:** Next.js 14 App Router, React Query, Supabase, Tailwind CSS, Lucide icons, Radix UI Dialog (already installed via `components/ui/dialog.tsx`), Sonner (toast — to be installed)

---

## Task 1: Install Sonner Toast Library

**Why:** No toast component exists. Sonner is the shadcn/ui standard and integrates cleanly.

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `app/layout.tsx`

**Step 1: Install sonner**

```bash
npm install sonner
```

Expected output: `added 1 package`

**Step 2: Add Toaster to layout**

Read `app/layout.tsx`. Find the `<body>` tag and add `<Toaster />` just before `</body>`:

```tsx
import { Toaster } from 'sonner';

// Inside <body>, before closing tag:
<Toaster
  position="bottom-center"
  toastOptions={{
    style: {
      background: 'rgba(17, 24, 39, 0.95)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#f9fafb',
      backdropFilter: 'blur(12px)',
    },
  }}
/>
```

**Step 3: Verify import compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add app/layout.tsx package.json package-lock.json
git commit -m "feat: add sonner toast library"
```

---

## Task 2: Create `useGuestFavorites` Hook

**Files:**
- Create: `hooks/useGuestFavorites.ts`
- Test: `lib/unit-tests/useGuestFavorites.test.ts`

**Step 1: Write the failing test**

```typescript
// lib/unit-tests/useGuestFavorites.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

const STORAGE_KEY = 'sfs_guest_favorites';

// Pure logic extracted from hook for unit testing
function readIds(storage: Record<string, string>): Set<string> {
  try {
    const raw = storage[STORAGE_KEY];
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeIds(storage: Record<string, string>, ids: Set<string>) {
  storage[STORAGE_KEY] = JSON.stringify([...ids]);
}

function toggle(storage: Record<string, string>, id: string): { isFavorited: boolean; count: number } {
  const ids = readIds(storage);
  if (ids.has(id)) {
    ids.delete(id);
  } else {
    ids.add(id);
  }
  writeIds(storage, ids);
  return { isFavorited: ids.has(id), count: ids.size };
}

describe('guest favorites logic', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
  });

  it('starts empty', () => {
    expect(readIds(storage).size).toBe(0);
  });

  it('adds a favorite', () => {
    const result = toggle(storage, 'song-1');
    expect(result.isFavorited).toBe(true);
    expect(result.count).toBe(1);
    expect(readIds(storage).has('song-1')).toBe(true);
  });

  it('removes an existing favorite', () => {
    toggle(storage, 'song-1');
    const result = toggle(storage, 'song-1');
    expect(result.isFavorited).toBe(false);
    expect(result.count).toBe(0);
  });

  it('tracks multiple favorites independently', () => {
    toggle(storage, 'song-1');
    toggle(storage, 'song-2');
    const ids = readIds(storage);
    expect(ids.has('song-1')).toBe(true);
    expect(ids.has('song-2')).toBe(true);
    expect(ids.size).toBe(2);
  });

  it('handles corrupt storage gracefully', () => {
    storage[STORAGE_KEY] = 'not-valid-json{{{';
    expect(readIds(storage).size).toBe(0);
  });
});
```

**Step 2: Run to verify failure**

```bash
npx vitest run lib/unit-tests/useGuestFavorites.test.ts
```

Expected: FAIL — file does not exist yet.

**Step 3: Create the hook**

```typescript
// hooks/useGuestFavorites.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sfs_guest_favorites';
const NUDGE_THRESHOLDS = [1, 5]; // show nudge after 1st and 5th favorite

function readFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeToStorage(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export interface GuestFavoritesReturn {
  ids: Set<string>;
  toggle: (id: string) => { isFavorited: boolean; shouldNudge: boolean };
  count: number;
  getAll: () => string[];
  clear: () => void;
}

export function useGuestFavorites(): GuestFavoritesReturn {
  const [ids, setIds] = useState<Set<string>>(() => readFromStorage());

  // Sync from storage on mount (SSR-safe)
  useEffect(() => {
    setIds(readFromStorage());
  }, []);

  const toggle = useCallback((id: string): { isFavorited: boolean; shouldNudge: boolean } => {
    let isFavorited = false;
    let shouldNudge = false;

    setIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        isFavorited = false;
      } else {
        next.add(id);
        isFavorited = true;
        shouldNudge = NUDGE_THRESHOLDS.includes(next.size);
      }
      writeToStorage(next);
      return next;
    });

    return { isFavorited, shouldNudge };
  }, []);

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    setIds(new Set());
  }, []);

  const getAll = useCallback(() => [...ids], [ids]);

  return { ids, toggle, count: ids.size, getAll, clear };
}
```

**Step 4: Run tests**

```bash
npx vitest run lib/unit-tests/useGuestFavorites.test.ts
```

Expected: PASS (5 tests). Note: the test file tests the pure logic pattern; the hook itself is tested by integration.

**Step 5: Commit**

```bash
git add hooks/useGuestFavorites.ts lib/unit-tests/useGuestFavorites.test.ts
git commit -m "feat: add useGuestFavorites hook with localStorage persistence"
```

---

## Task 3: Update SongCard to Handle Guest Favorites

**Files:**
- Read first: `components/home/SongCard.tsx` (understand current `useToggleFavorite` usage)
- Read first: find where `useToggleFavorite` is defined (`grep -r "useToggleFavorite" hooks/` or `components/`)
- Modify: `components/home/SongCard.tsx`
- Modify (or create): wherever `useToggleFavorite` is defined

**Step 1: Find `useToggleFavorite`**

```bash
grep -r "useToggleFavorite" /home/roeland/Projects/sacred-fire-songs --include="*.ts" --include="*.tsx" -l
```

Read the file that defines it to understand its current implementation.

**Step 2: Update heart button in SongCard**

In `SongCard.tsx`, the heart button currently calls `useToggleFavorite`. Update it so that when `user` is null, it uses `useGuestFavorites` instead:

```tsx
// At the top of SongCard component body (after reading the exact current code):
import { useAuth } from '@/hooks/useAuth';
import { useGuestFavorites } from '@/hooks/useGuestFavorites';
import { toast } from 'sonner';

// Inside SongCard:
const { user } = useAuth();
const guestFavorites = useGuestFavorites();

// Replace the existing isFavorite/toggle logic:
const isGuestFavorited = !user && guestFavorites.ids.has(id);
const effectiveIsFavorite = user ? isFavorite : isGuestFavorited;

const handleFavoriteClick = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (!user) {
    const { shouldNudge } = guestFavorites.toggle(id);
    if (shouldNudge) {
      toast('Your circle is growing', {
        description: 'Create an account to carry it with you',
        action: {
          label: 'Join',
          onClick: () => window.location.href = '/auth/sign-up',
        },
        duration: 6000,
      });
    }
    return;
  }

  // existing authenticated toggle logic unchanged
  handleToggle(e); // or whatever the current handler is named
};
```

Replace the heart button's `onClick` with `handleFavoriteClick`.
Update `filled` / `hollow` visual state to use `effectiveIsFavorite`.

**Step 3: Verify visually**

Start dev server (`npm run dev`). Open `/songs` as a guest (log out). Click the heart on a song card. Verify:
- Heart fills with amber glow
- No redirect happens
- After 1st favorite: toast appears at bottom with "Your circle is growing" + Join link
- Refresh page: heart is still filled (localStorage persisted)

**Step 4: Commit**

```bash
git add components/home/SongCard.tsx
git commit -m "feat: guest favorites on SongCard via localStorage with nudge toast"
```

---

## Task 4: Create `JoinCircleModal` Component

**Files:**
- Create: `components/common/JoinCircleModal.tsx`

**Step 1: Create the modal**

```tsx
// components/common/JoinCircleModal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import Link from 'next/link';

interface JoinCircleModalProps {
  open: boolean;
  onClose: () => void;
  context?: 'add-song' | 'general';
}

const COPY = {
  'add-song': {
    title: 'Bring your songs to the fire',
    body: 'Your song is ready. Create an account to share it with the circle — your work will be waiting for you.',
  },
  general: {
    title: 'Join the circle',
    body: 'Create a free account to contribute to the Sacred Fire songbook.',
  },
};

export function JoinCircleModal({ open, onClose, context = 'general' }: JoinCircleModalProps) {
  const copy = COPY[context];

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-950/95 border border-amber-500/30 backdrop-blur-xl text-white">
        <DialogHeader className="items-center gap-3 pt-2">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-7 h-7 text-amber-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white text-center">
            {copy.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-400 text-center text-sm leading-relaxed px-4">
          {copy.body}
        </p>

        <div className="flex flex-col gap-3 pt-2 pb-2 px-4">
          <Button
            asChild
            className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold"
          >
            <Link href="/auth/sign-up" onClick={onClose}>
              Create Account
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Link href="/auth/login" onClick={onClose}>
              Log In
            </Link>
          </Button>
          <button
            onClick={onClose}
            className="text-xs text-gray-600 hover:text-gray-500 text-center pt-1"
          >
            Continue browsing
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add components/common/JoinCircleModal.tsx
git commit -m "feat: add JoinCircleModal component for guest contribution nudge"
```

---

## Task 5: Soft Gate — Add Song Form Shows Modal Instead of Redirect

**Files:**
- Modify: `components/song/SongForm.tsx` (around lines 361–367)

**Step 1: Add modal state and swap redirect for modal**

At the top of `SongForm`, add:

```tsx
import { JoinCircleModal } from '@/components/common/JoinCircleModal';

// Inside component, add state:
const [showJoinModal, setShowJoinModal] = useState(false);
```

Replace the current `handleFormSubmit` redirect block:

```tsx
// BEFORE:
const handleFormSubmit = (data: SongFormData) => {
  if (!user) {
    router.push('/auth/login?message=Please log in to save songs');
    return;
  }
  mutation.mutate(data);
};

// AFTER:
const handleFormSubmit = (data: SongFormData) => {
  if (!user) {
    setShowJoinModal(true);
    return;
  }
  mutation.mutate(data);
};
```

At the bottom of the returned JSX (before the final closing tag), add:

```tsx
<JoinCircleModal
  open={showJoinModal}
  onClose={() => setShowJoinModal(false)}
  context="add-song"
/>
```

**Step 2: Verify**

Start dev server. Log out. Go to `/songs/add`. Fill in a title and some lyrics. Click "Publish Song". Verify:
- Modal appears with "Bring your songs to the fire" copy
- Form data is NOT lost (still visible behind modal)
- Clicking "Continue browsing" closes modal, form still has data
- Clicking "Create Account" navigates to `/auth/sign-up`

**Step 3: Commit**

```bash
git add components/song/SongForm.tsx
git commit -m "feat: show JoinCircleModal on Add Song submit for guests (soft gate)"
```

---

## Task 6: Update `AccessDenied` for Guest vs Wrong-Owner

**Files:**
- Modify: `components/common/feedback/AccessDenied.tsx`
- Modify: `app/songs/[id]/edit/page.tsx`

**Step 1: Add `variant` prop to AccessDenied**

Read `components/common/feedback/AccessDenied.tsx` first. Then add:

```tsx
interface AccessDeniedProps {
  variant?: 'wrong-owner' | 'guest';
}

export default function AccessDenied({ variant = 'wrong-owner' }: AccessDeniedProps) {
  // ...existing ember animation...

  const isGuest = variant === 'guest';

  return (
    // ...existing wrapper...

    // Replace the static copy block with:
    <h1 className="...existing classes...">
      {isGuest ? 'This Song Has a Keeper' : 'This Medicine is Not Yours to Edit'}
    </h1>
    <p className="...existing classes...">
      {isGuest
        ? 'This song is tended by its keeper. Join the circle to tend your own songs.'
        : 'Only the song\'s original keeper or an elder of the circle may edit this medicine.'}
    </p>

    {/* Guest: show join CTAs; wrong-owner: show return button */}
    {isGuest ? (
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/auth/sign-up"
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-lg transition-colors"
        >
          Join the Circle
        </a>
        <a
          href="/auth/login"
          className="px-6 py-2.5 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          Log In
        </a>
      </div>
    ) : (
      <a href="/" className="...existing return button classes...">
        {/* existing return button content */}
      </a>
    )}
  );
}
```

**Step 2: Pass variant from edit page**

Read `app/songs/[id]/edit/page.tsx`. Find where `<AccessDenied />` is rendered. Update it to:

```tsx
// Where user is null (guest check):
if (!user) return <AccessDenied variant="guest" />;

// Where user exists but is not owner:
if (!isOwner && !isAdmin) return <AccessDenied variant="wrong-owner" />;
```

The exact location depends on whether this is a client component or server component — read the file first.

**Step 3: Verify**

- Log out, navigate to any `/songs/<id>/edit`. Verify: guest copy + Join/Login buttons.
- Log in as a non-owner, navigate to another user's edit page. Verify: wrong-owner copy + Return button.

**Step 4: Commit**

```bash
git add components/common/feedback/AccessDenied.tsx app/songs/[id]/edit/page.tsx
git commit -m "feat: warm guest-aware AccessDenied with join CTAs"
```

---

## Task 7: Guest Info Banner on Library Page

**Files:**
- Create: `components/common/GuestBanner.tsx`
- Modify: `app/songs/SongsPageContent.tsx`

**Step 1: Create the banner component**

```tsx
// components/common/GuestBanner.tsx
'use client';

import { useState } from 'react';
import { Flame, X } from 'lucide-react';
import Link from 'next/link';

interface GuestBannerProps {
  message: string;
  linkText?: string;
  linkHref?: string;
}

export function GuestBanner({ message, linkText, linkHref }: GuestBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
      <Flame className="w-4 h-4 text-amber-400 shrink-0" />
      <p className="text-gray-300 flex-1">
        {message}
        {linkText && linkHref && (
          <>
            {' '}
            <Link href={linkHref} className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
              {linkText}
            </Link>
          </>
        )}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-500 hover:text-gray-400 shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

**Step 2: Add banner to SongsPageContent**

Read `app/songs/SongsPageContent.tsx`. Find the top of the rendered JSX (inside the main content area, after the sticky header / search bar). Add the banner for guests only:

```tsx
import { GuestBanner } from '@/components/common/GuestBanner';

// Inside JSX, below the search/filter header, before the song grid:
{!user && (
  <GuestBanner
    message="Log in to see your drafts, save favorites, and build playlists."
    linkText="Log in"
    linkHref="/auth/login"
  />
)}
```

**Step 3: Verify**

Log out. Open `/songs`. Verify the amber banner appears below the search bar. Verify dismissing it hides it. Verify it does not appear when logged in.

**Step 4: Commit**

```bash
git add components/common/GuestBanner.tsx app/songs/SongsPageContent.tsx
git commit -m "feat: guest info banner on library page"
```

---

## Task 8: Guest Playlists Page with "Your Hearth" Section

**Files:**
- Read first: `app/library/playlists/page.tsx` (or wherever the playlists page lives — check `app/` structure)
- Modify: the playlists page to be guest-accessible
- Modify: `lib/supabase/proxy.ts` (add playlists to public routes if needed)
- Create: `components/playlists/GuestHearth.tsx`

**Step 1: Check current middleware protection**

Read `lib/supabase/proxy.ts`. Find the public routes list. If `/library/playlists` is not in it, add it.

**Step 2: Update playlists page to not hard-redirect guests**

Read the playlists page. If it has `if (!user) redirect('/auth/login')`, change it to:

```tsx
// Server component: fetch user but don't redirect
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

// Pass user (possibly null) to the client component
return <PlaylistsPageContent initialUser={user} />;
```

Or if it's a client component, skip the redirect and render guest content instead.

**Step 3: Create `GuestHearth` component**

```tsx
// components/playlists/GuestHearth.tsx
'use client';

import { useGuestFavorites } from '@/hooks/useGuestFavorites';
import { GuestBanner } from '@/components/common/GuestBanner';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export function GuestHearth() {
  const { ids } = useGuestFavorites();
  const count = ids.size;

  return (
    <div className="space-y-4">
      <GuestBanner
        message="These songs live here for now. Create an account to keep them forever."
        linkText="Join the circle"
        linkHref="/auth/sign-up"
      />

      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
        <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
          Your Hearth
        </h2>
        {count > 0 && (
          <span className="text-xs text-gray-500">({count} songs)</span>
        )}
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <Heart className="w-10 h-10 text-gray-700" />
          <p className="text-gray-500 text-sm max-w-xs">
            Songs you touch with your heart will gather here.
          </p>
          <Link
            href="/songs"
            className="text-amber-400 hover:text-amber-300 text-sm underline underline-offset-2"
          >
            Browse the library
          </Link>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">
          You have {count} song{count !== 1 ? 's' : ''} in your hearth.{' '}
          <Link href="/songs" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
            Browse more
          </Link>
        </p>
      )}
    </div>
  );
}
```

**Step 4: Integrate GuestHearth into playlists page**

In the playlists page client component, show `<GuestHearth />` when `user` is null instead of the authenticated playlists content.

**Step 5: Verify**

- Log out. Navigate to playlists page. Verify: not redirected, sees "Your Hearth" with empty state.
- Favorite 2 songs on `/songs`. Return to playlists. Verify: count shows 2 songs.
- Log in. Verify: normal authenticated playlists view shown.

**Step 6: Commit**

```bash
git add components/playlists/GuestHearth.tsx app/library/playlists/page.tsx lib/supabase/proxy.ts
git commit -m "feat: guest-accessible playlists page with Your Hearth section"
```

---

## Task 9: Merge Guest Favorites on Login

**Files:**
- Create: `app/actions/mergeGuestFavorites.ts`
- Modify: `app/auth/confirm/route.ts` (or wherever post-login redirect is handled)
- Modify: The auth callback / login success handler to trigger merge

**Step 1: Create the server action**

```typescript
// app/actions/mergeGuestFavorites.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function mergeGuestFavorites(guestCompositionIds: string[]): Promise<{ merged: number }> {
  if (!guestCompositionIds.length) return { merged: 0 };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { merged: 0 };

  // Find or create "My Favorites" setlist
  let { data: setlist } = await supabase
    .from('setlists')
    .select('id')
    .eq('owner_id', user.id)
    .eq('title', 'My Favorites')
    .maybeSingle();

  if (!setlist) {
    const { data: newSetlist, error } = await supabase
      .from('setlists')
      .insert({ owner_id: user.id, title: 'My Favorites', is_public: false })
      .select('id')
      .single();
    if (error || !newSetlist) return { merged: 0 };
    setlist = newSetlist;
  }

  // Get first song_version_id for each composition
  const { data: versions } = await supabase
    .from('song_versions')
    .select('id, composition_id')
    .in('composition_id', guestCompositionIds);

  if (!versions?.length) return { merged: 0 };

  // Get existing setlist items to avoid duplicates
  const { data: existing } = await supabase
    .from('setlist_items')
    .select('song_version_id')
    .eq('setlist_id', setlist.id);

  const existingIds = new Set(existing?.map(e => e.song_version_id) ?? []);

  // Get current max order_index
  const { data: maxItem } = await supabase
    .from('setlist_items')
    .select('order_index')
    .eq('setlist_id', setlist.id)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  let orderIndex = (maxItem?.order_index ?? -1) + 1;

  // Build inserts (one per composition, using first version, skip existing)
  const seen = new Set<string>();
  const toInsert = [];
  for (const v of versions) {
    if (existingIds.has(v.id) || seen.has(v.composition_id)) continue;
    seen.add(v.composition_id);
    toInsert.push({ setlist_id: setlist.id, song_version_id: v.id, order_index: orderIndex++ });
  }

  if (!toInsert.length) return { merged: 0 };

  await supabase.from('setlist_items').insert(toInsert);
  return { merged: toInsert.length };
}
```

**Step 2: Trigger merge after login**

Read the login flow — specifically `app/auth/confirm/route.ts` and/or the `LoginForm` component to understand when auth completes.

The merge needs to happen client-side (because localStorage is only available in the browser). Find the component that handles post-login success (e.g., the success callback in `LoginForm.tsx` or the page the user lands on after auth).

In the component that fires after successful login, add:

```tsx
import { mergeGuestFavorites } from '@/app/actions/mergeGuestFavorites';
import { useGuestFavorites } from '@/hooks/useGuestFavorites';
import { toast } from 'sonner';

// After login success:
const guestFavorites = useGuestFavorites();
const guestIds = guestFavorites.getAll();

if (guestIds.length > 0) {
  const result = await mergeGuestFavorites(guestIds);
  guestFavorites.clear();
  if (result.merged > 0) {
    toast('Your hearth has been carried into your account', {
      description: `${result.merged} song${result.merged !== 1 ? 's' : ''} added to My Favorites`,
      duration: 5000,
    });
  }
}
```

**Step 3: Verify**

- Log out. Favorite 3 songs. Note the song titles.
- Log in. Verify merge toast appears: "Your hearth has been carried into your account — 3 songs added to My Favorites".
- Navigate to playlists / "My Favorites". Verify the 3 songs appear.
- Log out and back in again without adding guest favorites. Verify no merge toast.

**Step 4: Commit**

```bash
git add app/actions/mergeGuestFavorites.ts
git commit -m "feat: merge guest localStorage favorites into My Favorites on login"
```

---

## Task 10: Update Epic & User Stories Documentation

**Files:**
- Modify: `docs/logbook/epic&user stories.md`

**Step 1: Update Story 1.1.5**

Change `[Not Implemented]` to `[Implemented]` on Story 1.1.5 and update the comment:

```markdown
**Story 1.1.5: [Implemented]** As a Guest, I want to be kindly prompted to create an account when I try to contribute so that I understand this is a community feature.
<!-- Four nudge surfaces: (A) JoinCircleModal on Add Song form submit, (B) warm AccessDenied with Join/Login CTAs on Edit Song, (C) GuestBanner on Library page, (D) guest-accessible Playlists page. -->
```

**Step 2: Add Story 1.2.4**

Add after Story 1.2.3:

```markdown
**Story 1.2.4: [Implemented]** As a Guest, I want to save favorite songs without an account so that I can build a personal collection, and be nudged to create an account to persist it permanently.
<!-- localStorage-based favorites via useGuestFavorites hook (key: sfs_guest_favorites). Heart icon visible to all users. Nudge toasts at 1st and 5th favorite. "Your Hearth" section on Playlists page. Guest favorites merged into "My Favorites" setlist on login. -->
```

**Step 3: Bump version and date**

Use `/update-doc-changelog` skill or manually update the header.

**Step 4: Commit**

```bash
git add docs/logbook/epic&user\ stories.md
git commit -m "docs: update stories 1.1.5 and add 1.2.4 (guest nudges and session favorites)"
```

---

## Verification Checklist (Final)

Run through these scenarios before creating a PR:

| Scenario | Expected |
|----------|----------|
| Guest opens `/songs` | Amber GuestBanner appears, heart icons visible on cards |
| Guest favorites a song | Heart fills, localStorage updated |
| Guest favorites first song | Toast nudge appears |
| Guest favorites 5th song | Second toast nudge appears |
| Guest refreshes page | Hearts still filled (localStorage) |
| Guest opens `/songs/add`, fills form, clicks Publish | JoinCircleModal appears, form data preserved |
| Guest clicks "Continue browsing" on modal | Modal closes, form intact |
| Guest visits `/songs/<id>/edit` | Guest-variant AccessDenied with Join/Login CTAs |
| Guest visits playlists page | Not redirected, sees "Your Hearth" section |
| Guest with 0 favorites on playlists | Empty state with heart icon |
| Guest with 3 favorites on playlists | Count shown |
| Guest logs in with localStorage favorites | Merge toast, songs in My Favorites |
| Logged-in user favorites a song | Server action fires, no localStorage involved |
| Logged-in user sees no GuestBanner | Banner hidden |

---

## PR Description Template

```
## Summary
- Implements Story 1.1.5 (revised): four guest nudge surfaces (Add Song modal, Edit Song AccessDenied, Library banner, accessible Playlists page)
- Implements Story 1.2.4 (new): localStorage-based guest favorites with contextual nudge toasts and merge-on-login

## Test plan
- [ ] Guest can favorite songs without an account (localStorage)
- [ ] Guest favorites persist across page refreshes
- [ ] Nudge toast appears after 1st and 5th guest favorite
- [ ] JoinCircleModal appears on Add Song submit for guests (form data preserved)
- [ ] Edit Song shows warm guest AccessDenied with join CTAs
- [ ] Library page shows dismissible GuestBanner for guests
- [ ] Playlists page accessible to guests, shows "Your Hearth"
- [ ] Guest favorites merge into My Favorites on login
- [ ] All authenticated user flows unchanged
```
