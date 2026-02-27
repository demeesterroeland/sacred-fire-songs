# Specification: User-defined Setlists & 'Your Hearth' Persistence

**Track ID:** setlists_20260227
**Status:** Draft
**Date:** 2026-02-27

## Overview
Allow authenticated users ("The Circle") to create, manage, and share custom collections of songs ("Setlists"). These collections will form the core of "Your Hearth"—the user's personalized practice and ceremonial space.

## Requirements

### Functional Requirements
1. **Create Setlist:** Users can create a new setlist with a title and optional description.
2. **Add/Remove Songs:** Users can add songs from the library to their setlists and remove them as needed.
3. **Reorder Setlist:** Users can drag-and-drop or use controls to reorder songs within a setlist.
4. **Visibility Control:** Setlists can be marked as "Private" (visible only to the owner) or "Public" (visible to everyone).
5. **Persistence:** All setlist data must be persisted in the Supabase database and synchronized with the PWA's offline cache.
6. **'Your Hearth' Integration:** A dedicated section in the user profile/dashboard showing their personal setlists.

### User Stories
- **As a Member**, I want to create a setlist for an upcoming ceremony so that I have all the lyrics and chords ready in one place.
- **As a Guitarero**, I want to reorder my setlist so that the flow of the ceremony is musically and energetically consistent.
- **As a Keeper**, I want to share a public setlist so that others can learn the songs we frequently use in our circle.

## Technical Design
- **Database Schema:** Use existing `public.setlists` and `public.setlist_items` tables.
- **API:** Implement Server Actions for creating, updating, and deleting setlists and items.
- **UI:** 
    - Create a `SetlistManager` component for handling the list of setlists.
    - Create a `SetlistEditor` component for reordering and managing songs within a single setlist.
    - Use `framer-motion` for smooth reordering animations.
- **Caching:** Ensure `useQuery` hooks for setlists have appropriate `staleTime` and invalidation logic.

## Acceptance Criteria
- [ ] User can successfully create a setlist and see it in "Your Hearth."
- [ ] User can add a song to a setlist from the song detail page.
- [ ] User can reorder songs in a setlist and have the order persist after a page refresh.
- [ ] A public setlist is visible to guests, while a private setlist is hidden.
- [ ] Setlists are accessible offline after being viewed once.
