# Walkthrough: Guest Nudges & Session Favorites (Feb 27, 2026)

## Goal
Implement a warm, contextual experience for unauthenticated guests, allowing them to participate in the community (favoriting songs) and gently nudging them to create an account at natural contribution moments.

## Changes

### 1. Guest Favorites Logic
- **Hook**: Created `useGuestFavorites` which uses `localStorage` (key: `sfs_guest_favorites`) to store song IDs.
- **Persistence**: Favorites persist on the device across browser restarts.
- **Nudge Toasts**: Added automatic toasts via `Sonner` that appear after the 1st and 5th favorite, encouraging users to "Join the circle".

### 2. UI Nudges (Soft Gates)
- **Add Song**: Instead of a hard redirect to login, guests can now fill out the entire "Add Song" form. When they click "Publish", a `JoinCircleModal` appears, explaining the value of an account while preserving their form data.
- **Edit Song**: Updated `AccessDenied.tsx` with a warm "This Song Has a Keeper" variant for guests, including clear Join/Login CTAs.
- **Library Banner**: Added a dismissible, amber-toned `GuestBanner` to the `/songs` page to highlight account benefits (drafts, playlists).

### 3. Guest-Accessible Playlists
- **Middleware**: Ensured `/library` routes are public in `lib/supabase/proxy.ts`.
- **"Your Hearth"**: Guests can now visit the playlists page and see their localStorage favorites in a beautiful "Your Hearth" section, rather than being blocked by a login wall.

### 4. Account Merge on Login
- **Server Action**: Created `mergeGuestFavorites` to take a list of IDs and upsert them into the user's "My Favorites" setlist in Supabase.
- **Trigger**: Added a global `PostAuthHandler` provider that detects login transitions and automatically merges any guest favorites, showing a confirmation toast.

## Evidence
- **Files Created**:
    - `hooks/useGuestFavorites.ts`
    - `lib/unit-tests/useGuestFavorites.test.ts`
    - `components/common/JoinCircleModal.tsx`
    - `components/common/GuestBanner.tsx`
    - `components/playlists/GuestHearth.tsx`
    - `components/providers/PostAuthHandler.tsx`
    - `app/actions/mergeGuestFavorites.ts`
- **Files Modified**:
    - `components/home/SongCard.tsx`
    - `components/song/SongForm.tsx`
    - `components/common/feedback/AccessDenied.tsx`
    - `app/songs/[id]/edit/page.tsx`
    - `app/songs/SongsPageContent.tsx`
    - `app/library/playlists/page.tsx`
    - `app/layout.tsx`
    - `docs/logbook/epic&user stories.md`
    - `docs/logbook/master-tasks.md`

## Verification
- [x] Unit tests for guest favorites logic passed.
- [x] TypeScript check passed.
- [x] Manual verification of the merge-on-login flow confirmed.
