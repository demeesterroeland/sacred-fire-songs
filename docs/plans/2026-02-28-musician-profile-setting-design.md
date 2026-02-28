# Musician → Profile Setting — Design Document

**Version:** 1.0
**Date:** February 28, 2026
**Status:** Approved

---

## Goal

Remove `musician` as a role in the role hierarchy and replace it with a boolean profile setting (`is_musician`). A user self-declares whether they play an instrument and can read chords — this is a personal preference, not a trust level requiring Admin approval.

## Role Hierarchy (After)

```
Guest → Member → Gatekeeper → Admin
```

`is_musician: boolean` lives on the `profiles` table as a user preference.

## Why This Change

| Old model | Problem |
|---|---|
| `musician` is a role assigned by Admin | Reading chords is a skill, not a trust level |
| Members can't transpose or use setlists | No good reason to gate these features |
| Upgrade path requires Admin action | Creates unnecessary friction for contributors |

## Database Migration

### Step 1 — Add `is_musician` column

```sql
ALTER TABLE public.profiles
  ADD COLUMN is_musician boolean NOT NULL DEFAULT false;
```

### Step 2 — Migrate existing musician rows

```sql
UPDATE public.profiles
  SET is_musician = true, role = 'member'
  WHERE role = 'musician';
```

### Step 3 — Add `gatekeeper` to enum, remove `musician`

Postgres cannot drop an enum value directly. The approach is to create a new type, swap it in, and drop the old one:

```sql
-- Create replacement enum
CREATE TYPE user_role_new AS ENUM ('admin', 'gatekeeper', 'member');

-- Swap column type
ALTER TABLE public.profiles
  ALTER COLUMN role TYPE user_role_new
  USING role::text::user_role_new;

-- Drop old enum and rename new one
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;
```

> **Note:** The Gatekeeper role (Epic 3.4) is added in the same migration to avoid two separate enum rebuilds.

### Step 4 — Update TypeScript type

```ts
// hooks/useAuth.tsx (and any other type definition)
export type UserRole = 'admin' | 'gatekeeper' | 'member' | 'guest';

// Profile type
interface Profile {
  role: UserRole;
  is_musician: boolean;
  // ...
}
```

## UI Changes

### Profile / Settings page

Add a toggle in the user's profile settings:

```
[ ] I play an instrument and can read chord notation
```

Saving this flips `is_musician` on their profile. No Admin involvement.

### Features gated by `is_musician`

| Feature | File | Behaviour |
|---|---|---|
| Transpose controls | `app/songs/[id]/page.tsx` | Shown on song detail only when `is_musician = true` |
| Sheet music / ABC notation (future) | `components/song/SongDisplay.tsx` | Shown only when `is_musician = true` |
| Chord pill on song cards | `components/home/SongCard.tsx:114` | The amber chord icon badge is hidden when `is_musician = false` |
| Chord filter toggle on Songs page | `app/songs/SongsPageContent.tsx:310` | The "Chords" filter pill is hidden when `is_musician = false` |
| Capo & key prominence | Song detail header | Surfaced more visibly in the UI |

> Setlists/playlists, PDF export, and version submission are **not** gated — any Member can use them.

### Signup / onboarding (optional future)

A single question during signup: "Do you play an instrument?" sets `is_musician` immediately so new users don't have to find the setting.

## Files to Change

| File | Change |
|---|---|
| `supabase/migrations/YYYYMMDD_musician_to_profile_setting.sql` | New migration (steps 1–3 above) |
| `docs/design/db-schema.sql` | Update enum + add column |
| `hooks/useAuth.tsx` | Update `UserRole` type, remove mock-musician |
| `components/dev/MockRoleSwitcher.tsx` | Remove musician option; add is_musician toggle |
| `components/dev/QuickLogin.tsx` | Update test user config |
| `supabase/seeds/02_profiles.sql` | Change seed musician user to member + is_musician=true |
| `app/account/settings/page.tsx` (or equivalent) | Add is_musician toggle |
| `app/songs/[id]/page.tsx` | Conditionally show transpose based on is_musician |

## Out of Scope

- No changes to RLS policies (none currently check for musician role)
- No changes to song ownership or edit permissions
- Gatekeeper role implementation details are covered in the separate Gatekeeper design doc
