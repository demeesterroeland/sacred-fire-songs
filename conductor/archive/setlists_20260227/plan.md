# Implementation Plan: User-defined Setlists & 'Your Hearth' Persistence

**Track ID:** setlists_20260227

## Phase 1: Foundation & Data Layer [checkpoint: 88cd9de]
- [x] Task: Create Setlist server actions [bd5ac72]
    - [ ] Write unit tests for setlist creation and retrieval
    - [ ] Implement `createSetlist` server action
    - [ ] Implement `getSetlists` server action
- [x] Task: Create Setlist Item server actions [bd5ac72]
    - [ ] Write unit tests for adding and removing songs from setlists
    - [ ] Implement `addSongToSetlist` server action
    - [ ] Implement `removeSongFromSetlist` server action
- [x] Task: Conductor - User Manual Verification 'Foundation & Data Layer' (Protocol in workflow.md) [88cd9de]

## Phase 2: UI - Setlist Management [checkpoint: 07d1a69]
- [x] Task: Implement SetlistManager component [900a570]
    - [ ] Write unit tests for `SetlistManager`
    - [ ] Implement UI for listing and creating setlists
- [x] Task: Implement "Add to Setlist" UI on Song Detail [fdbf700]
    - [ ] Write unit tests for "Add to Setlist" button logic
    - [ ] Add "Add to Setlist" dropdown/modal to `app/songs/[id]/page.tsx`
- [x] Task: Conductor - User Manual Verification 'UI - Setlist Management' (Protocol in workflow.md) [07d1a69]

## Phase 3: UI - Setlist Editing & "Your Hearth" [checkpoint: 4e05d29]
- [x] Task: Implement SetlistEditor with reordering [4c5a111]
    - [ ] Write unit tests for setlist reordering logic
    - [ ] Implement drag-and-drop reordering with `framer-motion`
- [x] Task: Integrate "Your Hearth" section [bc6411d]
    - [ ] Write unit tests for "Your Hearth" display logic
    - [ ] Add "Your Hearth" tab/section to user profile/dashboard
- [x] Task: Conductor - User Manual Verification 'UI - Setlist Editing & "Your Hearth"' (Protocol in workflow.md) [4e05d29]

## Phase 4: Offline & Final Polish [checkpoint: 58a9347]
- [x] Task: Ensure offline persistence [22bfed2]
    - [x] Write integration tests for offline setlist access [22bfed2]
    - [x] Configure React Query cache for setlists [22bfed2]
    - [x] Implement persistent cache with @tanstack/react-query-persist-client
    - [x] Add PWA manifest.json for offline recognition
- [x] Task: Documentation & Cleanup [d023f39]
    - [x] Update User Guide with setlist instructions [d023f39]
    - [x] Final code cleanup and linting [d023f39]
- [x] Task: Conductor - User Manual Verification 'Offline & Final Polish' (Protocol in workflow.md) [58a9347]
