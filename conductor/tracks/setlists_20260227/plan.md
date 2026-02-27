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

## Phase 2: UI - Setlist Management
- [x] Task: Implement SetlistManager component [900a570]
    - [ ] Write unit tests for `SetlistManager`
    - [ ] Implement UI for listing and creating setlists
- [x] Task: Implement "Add to Setlist" UI on Song Detail [fdbf700]
    - [ ] Write unit tests for "Add to Setlist" button logic
    - [ ] Add "Add to Setlist" dropdown/modal to `app/songs/[id]/page.tsx`
- [ ] Task: Conductor - User Manual Verification 'UI - Setlist Management' (Protocol in workflow.md)

## Phase 3: UI - Setlist Editing & "Your Hearth"
- [ ] Task: Implement `SetlistEditor` with reordering
    - [ ] Write unit tests for setlist reordering logic
    - [ ] Implement drag-and-drop reordering with `framer-motion`
- [ ] Task: Integrate "Your Hearth" section
    - [ ] Write unit tests for "Your Hearth" display logic
    - [ ] Add "Your Hearth" tab/section to user profile/dashboard
- [ ] Task: Conductor - User Manual Verification 'UI - Setlist Editing & "Your Hearth"' (Protocol in workflow.md)

## Phase 4: Offline & Final Polish
- [ ] Task: Ensure offline persistence
    - [ ] Write integration tests for offline setlist access
    - [ ] Configure React Query cache for setlists
- [ ] Task: Documentation & Cleanup
    - [ ] Update User Guide with setlist instructions
    - [ ] Final code cleanup and linting
- [ ] Task: Conductor - User Manual Verification 'Offline & Final Polish' (Protocol in workflow.md)
