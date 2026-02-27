# Guest Playlists Page Design

**Date:** 2026-02-27
**Branch:** feat/playlists-implementation
**Status:** Approved

---

## Problem

Visiting `/library/playlists` as a guest redirects to `/auth/login`. The page should be accessible without authentication, showing guests what they can unlock by signing in.

## Solution

Remove the hard `redirect('/auth/login')` guard in `app/library/playlists/page.tsx` and replace it with a guest-aware layout that teases all three playlist sections inline.

---

## Layout Overview

```
┌─────────────────────────────────────────┐
│  YOUR LIBRARY  [Playlists] [Albums] ...  │
├─────────────────────────────────────────┤
│  SMART PLAYLISTS                         │
│  [❤ My Favorites  — 🔒 Members only]   │
│  [🔥 My Songs     — 🔒 Members only]   │
│  [✎  My Drafts    — 🔒 Members only]   │
├─────────────────────────────────────────┤
│  PUBLIC PLAYLISTS  [COMING SOON]         │
│  [demo ghost card 1 — 40% opacity]      │
│  [demo ghost card 2 — 40% opacity]      │
│  italic note: "Community playlists..."  │
├─────────────────────────────────────────┤
│  MY PLAYLISTS                            │
│  [demo card 1 — 40% opacity + lock]     │
│  [demo card 2 — 40% opacity + lock]     │
│  🔓 Sign in to create your playlists →  │
└─────────────────────────────────────────┘
```

---

## Section Details

### Section 1: Smart Playlists

Three cards at full opacity, `cursor-default`. Each has a right-side lock indicator (`Lock` icon + `"Members only"` in `text-gray-600`) instead of a CTA button.

| Card | Icon | Color | Subtitle |
|---|---|---|---|
| My Favorites | Heart (filled) | amber | "Your favorited songs, always with you" |
| My Songs | Flame | red | "Songs you've contributed to the library" |
| My Drafts | PenLine | gray | "Your private work-in-progress songs" |

Styling: same as authenticated card (`bg-amber-500/8 border border-amber-500/20 rounded-2xl`) but non-interactive.

### Section 2: Public Playlists

- Section header has a `"COMING SOON"` pill badge (`text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5`)
- Two demo ghost cards at `opacity-40 pointer-events-none select-none`:
  - **Ceremony Night – Agua y Fuego** — Globe icon (blue), "Community Playlist · 14 songs"
  - **Opening Circle Icaros** — Users icon (purple), "Community Playlist · 9 songs"
- Italic note beneath: `"Public playlists shared by community members — coming soon."`

### Section 3: My Playlists

- Existing demo cards (Yage Ceremony 2024, Temazcal) at `opacity-40 pointer-events-none select-none`
- Lock icon overlaid on each icon container (top-right, small, `text-gray-600`)
- Single subtle sign-in CTA below cards:
  - `text-sm text-gray-500 hover:text-gray-300 transition-colors`
  - `LogIn` icon + "Sign in to create and manage your playlists →"
  - Links to `/auth/login`

---

## Implementation Notes

- `user` is fetched but NOT redirected if null
- All DB queries (`setlists`, `setlist_items`) are conditional on `user` existing
- Guest view is entirely static — no DB calls
- Authenticated view: unchanged from current implementation
- The "Create Playlist" button in the header is hidden for guests
- File to change: `app/library/playlists/page.tsx` only
