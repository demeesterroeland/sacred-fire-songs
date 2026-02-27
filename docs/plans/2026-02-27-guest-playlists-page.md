# Guest Playlists Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow unauthenticated guests to visit `/library/playlists` without being redirected, showing a rich teaser of what they can unlock by signing in.

**Architecture:** Single-file change in `app/library/playlists/page.tsx`. The `user` object becomes optional — all DB queries are gated on `user` existing. When `user` is null, a fully static guest layout is rendered in place of the authenticated content. No new files, no new routes.

**Tech Stack:** Next.js 16 App Router (RSC), Supabase SSR client, Tailwind CSS, Lucide React icons, TypeScript.

---

### Task 1: Remove the auth redirect and make `user` optional

**Files:**
- Modify: `app/library/playlists/page.tsx`

**Step 1: Remove the redirect**

In `app/library/playlists/page.tsx`, remove line 2 (`import { redirect } from 'next/navigation';`) and line 29 (`if (!user) redirect('/auth/login');`).

Also wrap the user-dependent DB queries in `if (user) { ... }` so they don't execute for guests.

The function signature changes from assuming `user` is defined to treating it as `null | User`.

**Step 2: Verify the dev server still compiles**

Check the terminal running `npm run dev` — no TypeScript errors should appear.

Expected: `✓ Ready` or similar, no red errors in terminal.

**Step 3: Verify guest access manually**

Open `http://localhost:3000/library/playlists` in an incognito window (or while logged out).

Expected: Page loads without redirecting. Currently renders a blank/broken page — that's fine, we fix it in Task 2.

**Step 4: Commit checkpoint**

```bash
git add app/library/playlists/page.tsx
git commit -m "fix: remove auth redirect from /library/playlists

Guests can now access the page without being redirected to /auth/login.
DB queries are now gated on user existing.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Implement the guest layout

**Files:**
- Modify: `app/library/playlists/page.tsx`

**Step 1: Add required imports**

Add these to the import block (only add what isn't already imported):

```typescript
import { Lock, LogIn, Globe, Users, PenLine, Music } from 'lucide-react';
import Link from 'next/link';
```

**Step 2: Create the `GuestView` component**

Add this above the `PlaylistsPage` function:

```tsx
function GuestView() {
    return (
        <div className="space-y-8">

            {/* Section 1: Smart Playlists — locked */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Smart Playlists</p>
                <div className="grid grid-cols-1 gap-3">

                    {/* My Favorites */}
                    <div className="bg-amber-500/8 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 cursor-default">
                        <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
                            <Heart className="w-6 h-6 text-amber-400 fill-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-100">My Favorites</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Your favorited songs, always with you</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Lock className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600 font-medium">Members only</span>
                        </div>
                    </div>

                    {/* My Songs */}
                    <div className="bg-red-500/8 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 cursor-default">
                        <div className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center shrink-0">
                            <Music className="w-6 h-6 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-100">My Songs</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Songs you've contributed to the library</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Lock className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600 font-medium">Members only</span>
                        </div>
                    </div>

                    {/* My Drafts */}
                    <div className="bg-gray-800/40 border border-gray-700/40 p-4 rounded-2xl flex items-center gap-4 cursor-default">
                        <div className="w-12 h-12 bg-gray-700/40 rounded-xl flex items-center justify-center shrink-0">
                            <PenLine className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-100">My Drafts</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Your private work-in-progress songs</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Lock className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600 font-medium">Members only</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Section 2: Public Playlists — coming soon + ghost demo */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Public Playlists</p>
                    <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">Coming Soon</span>
                </div>
                <div className="grid grid-cols-1 gap-3 opacity-40 pointer-events-none select-none">
                    <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                            <Globe className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100">Ceremony Night – Agua y Fuego</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Community Playlist · 14 songs</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100">Opening Circle Icaros</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Community Playlist · 9 songs</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-600 italic mt-3">
                    Public playlists shared by community members — coming soon.
                </p>
            </div>

            {/* Section 3: My Playlists — demo ghost + sign-in nudge */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">My Playlists</p>
                <div className="grid grid-cols-1 gap-3 opacity-40 pointer-events-none select-none">
                    <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0">
                            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                                <Flame className="w-6 h-6 text-orange-500" />
                            </div>
                            <Lock className="absolute -top-1 -right-1 w-3 h-3 text-gray-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100">Yage Ceremony 2024</h3>
                            <p className="text-xs text-gray-500 mt-0.5">12 songs</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0">
                            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                                <Droplets className="w-6 h-6 text-blue-500" />
                            </div>
                            <Lock className="absolute -top-1 -right-1 w-3 h-3 text-gray-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100">Temazcal — Water Songs</h3>
                            <p className="text-xs text-gray-500 mt-0.5">8 songs</p>
                        </div>
                    </div>
                </div>

                {/* Single subtle sign-in nudge */}
                <Link
                    href="/auth/login"
                    className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors group"
                >
                    <LogIn className="w-4 h-4 group-hover:text-gray-300 transition-colors" />
                    Sign in to create and manage your playlists
                    <span className="text-gray-600 group-hover:text-gray-400 transition-colors">→</span>
                </Link>
            </div>

        </div>
    );
}
```

**Step 3: Update `PlaylistsPage` to branch on `user`**

Replace the function body so that when `user` is null it returns `<GuestView />`, and when authenticated it returns the existing layout (unchanged):

```tsx
export default async function PlaylistsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <GuestView />;

    // ... rest of existing authenticated code unchanged ...
}
```

Also remove the "Create Playlist" button wrapper guard — it's fine to keep it only in the authenticated path since guests hit `<GuestView />` before reaching it. No change needed there.

**Step 4: Verify in browser (guest)**

Open `http://localhost:3000/library/playlists` while logged out.

Expected:
- Page loads, no redirect
- "Your Library" header + Playlists/Albums/Artists tabs visible
- Three Smart Playlist cards with lock indicators
- Public Playlists section with "COMING SOON" badge + 2 ghost cards + italic note
- My Playlists ghost cards + "Sign in to create and manage…" link

**Step 5: Verify authenticated view is unchanged**

Log in and visit `/library/playlists`.

Expected: Exactly the same as before — "Create Playlist" button, My Favorites, real setlists, song counts.

**Step 6: Commit**

```bash
git add app/library/playlists/page.tsx
git commit -m "feat: show guest teaser layout for /library/playlists

Replace hard auth redirect with guest-aware page:
- Smart Playlists section (locked, Members only badge)
- Public Playlists section (coming soon + ghost demo cards)
- My Playlists section (demo ghost + subtle sign-in nudge)
Authenticated view unchanged.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Done Criteria

- [ ] Guest visits `/library/playlists` — no redirect, sees teaser layout
- [ ] Authenticated user visits `/library/playlists` — identical to before
- [ ] "Sign in" nudge links to `/auth/login`
- [ ] No TypeScript errors in terminal
- [ ] Both commits on `feat/playlists-implementation`
