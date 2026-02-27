# Specification: Bug Fix Sprint (Auth Sync & Favorites)

**Track ID:** bugfix_auth_sync_20260228
**Status:** New
**Date:** 2026-02-27

## Overview
This track addresses several critical regressions in authentication state synchronization and the favorites persistence layer that have emerged following the Guest Nudges implementation and React 19 audit.

## Reported Bugs

### 1. GuestBanner Inconsistency
- **Issue:** On the `/songs` page, the GuestBanner ("Log in to see your drafts...") remains visible even for authenticated users.
- **Goal:** Banner should strictly hide when a valid session is detected.

### 2. Client-Side Exception on Song List
- **Issue:** After remaining on the `/songs` page for a period of time, a generic "client-side exception" occurs.
- **Potential Cause:** Likely a hydration mismatch, session refresh loop, or a memory leak in the recently added notification or favorites logic.

### 3. Auth UI Mismatch (Sign In vs UserMenu)
- **Issue:** Authenticated users see the "Sign In" button instead of the `UserMenu`. Correct UI only appears after two manual page refreshes.
- **Goal:** Instantaneous and reliable UI transition upon login/session detection.

### 4. Incorrect Nudge Toasts for Members
- **Issue:** Logged-in users (with UserMenu visible) receive the "Join the circle" nudge toast when clicking a heart icon.
- **Goal:** Authenticated users should never see guest nudges.

### 5. Favorites Persistence Failure
- **Issue:** Favorited songs are not being saved to the database. Page refreshes clear all heart states.
- **Goal:** Heart states must persist to the Supabase `setlist_items` table for members.

## Technical Gaps to Investigate
- **`useAuth.tsx`:** Verify how the session is being synchronized from the Supabase client to the React state.
- **`SongsPageContent.tsx`:** Check the conditional rendering logic for `GuestBanner`.
- **`SongCard.tsx`:** Verify the branch logic between `useGuestFavorites` and the `toggleFavorite` server action.
- **`QueryProvider.tsx`:** Ensure the new persistent cache isn't caching "Guest" states too aggressively.

## Acceptance Criteria
- [ ] GuestBanner is invisible for authenticated users on first load.
- [ ] UserMenu appears immediately and consistently for logged-in users.
- [ ] Clicking heart as a member saves to DB and persists across refreshes.
- [ ] Nudge toasts are restricted to guests only.
- [ ] No client-side exceptions occur during prolonged sessions on the song list.
