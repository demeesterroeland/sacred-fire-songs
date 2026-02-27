# Design: Guest Nudges & Session Favorites

**Date:** 2026-02-27
**Status:** Approved
**Stories:** 1.1.5 (revised), 1.2.4 (new)

---

## Context

Sacred Fire Songs allows guests to browse and view public songs freely. Today, blocked features (Add Song, Edit Song, Settings, Playlists) either silently redirect to login or show a generic AccessDenied. The Favorites feature is invisible to guests entirely.

The goal is to create a warm, contextual guest experience that communicates value before asking for commitment — in line with the sacred, ceremonial aesthetic of the project.

---

## Story 1.1.5 (Revised): Contextual Guest Nudges

### Principles

- Never interrupt browsing or reading
- Nudge only at natural "contribution" moments
- Use sacred-toned copy consistent with the project voice
- Preserve any work the guest has done when showing a nudge

### Nudge Surfaces

#### A. Add Song — Modal on Submit (Soft Gate)

- Guest can open and fully fill the Add Song form
- On submit, a **glassmorphism modal** appears (matching existing confirmation modals)
- Form content is preserved behind the modal
- Copy: *"Bring your songs to the fire"*
- CTAs: **Log In** (primary) and **Create Account** (secondary)
- Dismissing the modal returns the guest to their filled form

#### B. Add Song Button (Header / Dashboard) — Popover on Click

- For guests, clicking the Add Song nav link or dashboard card shows a small **animated popover**
- Copy: *"Join the circle to share medicine →"*
- Includes a **Log In** link
- Non-blocking — clicking elsewhere dismisses it
- Does not prevent navigation (clicking again or pressing Enter still opens the form)

#### C. Edit Song — Warm AccessDenied Panel

- Replace the generic `<AccessDenied />` component with a flame-themed panel
- For **wrong owner** (logged in but not the owner): *"This song belongs to another keeper of the fire."*
- For **guests**: *"This song is tended by its keeper. Join the circle to tend your own songs."* with Log In / Create Account CTAs

#### D. Library / Settings / Playlists — Contextual Banner

- A dismissible **amber/ember-toned banner** at the top of pages that require login
- Copy: *"Log in to see your drafts, save favorites, and build playlists."*
- Includes a **Log In** link
- Re-appears on next visit (not permanently dismissed)
- Applies to: `/account/settings`, `/library/playlists`, and any other middleware-protected route

---

## Story 1.2.4 (New): Session Favorites & Account Persistence Nudge

### Core Behaviour

- Heart icon is **visible to all users** (guests and authenticated) on song cards and the song detail page
- Guest favorites stored in **localStorage** under key `sfs_guest_favorites` (array of song IDs)
- Favorites persist across browser restarts on the same device

### Nudge Flow

| Trigger | Nudge |
|---------|-------|
| First favorite saved | Toast: *"Your circle is growing — create an account to carry it with you"* with a "Join" link |
| 4th+ favorite saved | One final toast nudge (no further nudges after that) |
| Visit Playlists page as guest | Banner: *"These songs live here for now. Create an account to keep them forever."* |

Nudges are **non-blocking toasts** (bottom of screen, auto-dismiss after 6s, manual dismiss available).

### Playlists Page (Guest View)

- Guests see a **"Your Hearth"** section showing their localStorage favorites
- If no favorites yet: an empty state with copy *"Songs you touch with your heart will gather here."* and a heart icon
- Above the section: the account persistence banner

### Account Merge on Sign-Up / Login

1. On successful authentication, read `sfs_guest_favorites` from localStorage
2. If non-empty, call a server action `mergeGuestFavorites(guestIds[])` that upserts rows into the `user_favorites` table (skipping duplicates)
3. Clear `sfs_guest_favorites` from localStorage
4. Show a brief success toast: *"Your hearth has been carried into your account."*

### Data Model

Guest favorites require no schema changes — they live entirely in localStorage. The existing `user_favorites` table (or equivalent) handles authenticated favorites. The merge action uses the existing persistence layer.

> **Note:** If a `user_favorites` table does not yet exist, it will need to be created as part of implementation.

---

## Shared Design Tokens

All nudge surfaces use the existing Sacred Fire design language:

- **Glassmorphism modals** — same as delete confirmation modals
- **Amber/ember accent** — `text-amber-400`, `border-amber-500/40`
- **Copy voice** — warm, ceremonial, community-oriented
- **Icons** — Flame (Lucide `Flame`), Heart (Lucide `Heart`), Candle/Ember metaphors

---

## Out of Scope

- Social login (removed from roadmap)
- Guest song drafts (Add Song form content is not persisted to localStorage — only the modal is shown)
- Push notifications or email nudges
