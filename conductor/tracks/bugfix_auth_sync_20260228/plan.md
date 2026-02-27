# Implementation Plan: Bug Fix Sprint (Auth Sync & Favorites)

**Track ID:** bugfix_auth_sync_20260228

## Phase 1: Auth State & UI Sync
- [ ] Task: Audit and refactor `useAuth` hook
    - [ ] Write unit tests to reproduce the stale "Guest" state after login
    - [ ] Refactor state synchronization to ensure it's hydration-safe and immediate
- [ ] Task: Fix Header/Sidebar conditional rendering
    - [ ] Ensure `UserMenu` vs `AuthButton` logic relies on the same source of truth
    - [ ] Verify fix across multiple refreshes
- [ ] Task: Conductor - User Manual Verification 'Auth State & UI Sync' (Protocol in workflow.md)

## Phase 2: Favorites Persistence & Nudges
- [ ] Task: Fix `SongCard` favorite logic branch
    - [ ] Write unit tests for `handleFavoriteClick` to ensure correct action is triggered based on auth state
    - [ ] Remove guest nudge toasts for authenticated users
- [ ] Task: Restore database persistence for favorites
    - [ ] Verify `toggleFavorite` server action is being called and returning success
    - [ ] Ensure React Query cache is invalidated/updated correctly after a member hearts a song
- [ ] Task: Fix `GuestBanner` visibility in `SongsPageContent`
- [ ] Task: Conductor - User Manual Verification 'Favorites Persistence & Nudges' (Protocol in workflow.md)

## Phase 3: Stability & Cleanup
- [ ] Task: Investigate and resolve client-side exception on /songs
    - [ ] Profile memory and check for timer/refresh leaks
    - [ ] Resolve any hydration mismatches found in `SongsPageContent`
- [ ] Task: Final Type Safety check
    - [ ] Run `npx tsc --noEmit` and resolve any new errors
- [ ] Task: Conductor - User Manual Verification 'Stability & Cleanup' (Protocol in workflow.md)
