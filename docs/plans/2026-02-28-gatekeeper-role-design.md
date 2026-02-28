# Gatekeeper Role — Design Document

**Version:** 1.1
**Date:** February 28, 2026
**Status:** Approved

---

## Goal

Introduce a **Gatekeeper** role that sits between Member and Admin. Gatekeepers curate the song library and playlists: they flag quality issues, merge duplicates, enrich metadata, and surface featured content — without having the destructive power to permanently delete.

> **Note:** `musician` has been removed as a role. It is now a profile setting (`is_musician: boolean`) self-declared by any Member. See `2026-02-28-musician-profile-setting-design.md`.

## Role Hierarchy

```
Guest → Member → Gatekeeper → Admin
```

`is_musician` is a profile flag, not a role step — any Member or Gatekeeper can have it set.

## Permissions

| Capability | Guest | Member | Gatekeeper | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse & search | ✅ | ✅ | ✅ | ✅ |
| Add / edit own songs | ❌ | ✅ | ✅ | ✅ |
| Edit metadata & media links on **any** song | ❌ | ❌ | ✅ | ✅ |
| Edit lyrics/chords on songs they don't own | ❌ | ❌ | ❌ | ✅ |
| Flag songs (`needs_improvement`, `duplicate`) | ❌ | ❌ | ✅ | ✅ |
| Access Gatekeeper queue dashboard | ❌ | ❌ | ✅ | ✅ |
| Merge duplicate songs into versions | ❌ | ❌ | ✅ | ✅ |
| Feature / unfeature public playlists | ❌ | ❌ | ✅ | ✅ |
| Delete songs permanently | ❌ | ❌ | ❌ | ✅ |
| Manage users & roles | ❌ | ❌ | ❌ | ✅ |

## Feature Areas

### A. Content Flagging & Improvement Queue

- Songs can be flagged with one of two statuses: `needs_improvement` or `duplicate`
- A visible badge appears on the song card and detail page for all users
- All flagged songs appear in a private **Gatekeeper queue** — a dashboard view grouped by flag type and sortable by date
- When a song is flagged, the original poster receives an **in-app notification** explaining what needs attention (e.g. "Your song 'Grandmother Earth' has been flagged as needing improvement")
- When a flag is resolved (unflagged or merged), the original poster is notified again

### B. Metadata & Media Editing

- Gatekeepers can edit the following fields on any song:
  - YouTube, SoundCloud, Spotify URLs
  - Song key and capo
  - Categories / tags
- Lyrics and ChordPro content are **not** editable by Gatekeepers
- Changes are saved immediately with no approval flow
- The song detail page shows "Last updated by [name]" attribution

### C. Duplicate Merging

- From the Gatekeeper queue or a song detail page, a Gatekeeper can select "Merge with…"
- A search picker lets them select the canonical (primary) song
- The secondary song becomes an alternate version linked to the canonical entry
- Both original contributors are notified of the merge with the canonical song link
- The merged/secondary song URL redirects to the canonical entry

### D. Featured Playlists

- Gatekeepers can toggle a **Featured** flag on any public playlist via the context menu
- The `/library/playlists` page gains a **"Featured"** section above the existing "Public Playlists" section
- Featured playlists are visible to all users including guests
- The Featured section is hidden when no playlists are featured

## Data Model Notes

- `profiles.role` gains a new value: `'gatekeeper'` (added in the same enum rebuild as removing `musician` — see `2026-02-28-musician-to-profile-setting.md` Task 1)
- `compositions` gains a `flag_status` column: `null | 'needs_improvement' | 'duplicate'`
- `compositions` gains a `flagged_by` (uuid, FK profiles) and `flagged_at` (timestamptz) column
- `setlists` gains an `is_featured` boolean column (default false)
- A new `notifications` table (or use an existing pattern) for in-app messages to original posters

## Dev Tooling — QuickSwitch

The existing `MockRoleSwitcher` component (`components/dev/MockRoleSwitcher.tsx`) must be renamed to **QuickSwitch** and updated to cover all current mock personas, including the new Gatekeeper role and a Member with `is_musician = true`.

### Rename

- File: `components/dev/MockRoleSwitcher.tsx` → `components/dev/QuickSwitch.tsx`
- Export: `MockRoleSwitcher` → `QuickSwitch`
- Update all imports across the codebase

### Mock personas after update

| Option value | Label | role | is_musician |
|---|---|---|---|
| `guest` | Guest | — | — |
| `mock-member` | Member | `member` | `false` |
| `mock-member-musician` | Member (Musician) | `member` | `true` |
| `mock-gatekeeper` | Gatekeeper | `gatekeeper` | `false` |
| `mock-admin` | Admin | `admin` | `false` |

Add `mock-gatekeeper` to `MOCK_USERS` in `hooks/useAuth.tsx`:

```typescript
'mock-gatekeeper': {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'gatekeeper@mock.com',
    role: 'gatekeeper' as UserRole,
    is_musician: false,
    full_name: 'Mock Gatekeeper',
    avatar_url: undefined
},
```

### QuickSwitch UI

```tsx
// components/dev/QuickSwitch.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function QuickSwitch() {
  const { mockRole, switchMockRole } = useAuth();

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
        Quick Switch
      </h3>
      <select
        className="w-full bg-gray-800 text-xs text-gray-300 rounded px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
        value={mockRole || ''}
        onChange={(e) => switchMockRole(e.target.value || null)}
      >
        <option value="">— Real Auth —</option>
        <option value="guest">Guest</option>
        <option value="mock-member">Member</option>
        <option value="mock-member-musician">Member (Musician)</option>
        <option value="mock-gatekeeper">Gatekeeper</option>
        <option value="mock-admin">Admin</option>
      </select>
      <p className="text-[9px] text-gray-600 px-1 leading-tight">
        Simulates UI states only. Does not affect RLS.
      </p>
    </div>
  );
}
```

### Files to update after rename

```bash
# Find all imports of MockRoleSwitcher
grep -rn "MockRoleSwitcher" --include="*.tsx" --include="*.ts" .
```

Expected: one or two layout/dev panel files. Update each import to `QuickSwitch`.

## Out of Scope

- Gatekeepers cannot edit lyrics or ChordPro content
- Permanent deletion always requires Admin
- No public-facing Gatekeeper profile or badge (internal role only)
