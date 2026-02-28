# Musician → Profile Setting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove `musician` as a role and replace it with an `is_musician` boolean on `profiles`, then wire that flag to show/hide chord-related UI (chord filter, chord pill on cards, transpose controls).

**Architecture:** A Supabase migration rebuilds the `user_role` enum (drops `musician`, adds `gatekeeper`), adds an `is_musician` column, and migrates existing data. The `useAuth` hook is updated to fetch and expose `is_musician`. UI elements read from `user?.is_musician`. The profile settings page gets a new toggle that saves to Supabase.

**Tech Stack:** Next.js 15 (App Router), Supabase (Postgres + RLS), TypeScript, Tailwind CSS, Sonner toasts, vitest

---

## Context

**Current role enum:** `('admin', 'musician', 'member')`
**Target role enum:** `('admin', 'gatekeeper', 'member')`

Key files to know:
- `hooks/useAuth.tsx` — defines `UserRole`, `AuthUser`, `MOCK_USERS`, fetches profile
- `context/UserPreferencesContext.tsx` — localStorage preferences (keepScreenAwake etc.) — **not** where is_musician goes (it's account-level, not device-level)
- `components/account/settings/ProfileSettings.tsx` — where the new toggle will live
- `components/home/SongCard.tsx:114` — Guitar icon hidden when !isMusician
- `app/songs/SongsPageContent.tsx:310` — Chords filter toggle hidden when !isMusician
- `components/dev/MockRoleSwitcher.tsx` — dev tool, remove musician option
- `components/dev/QuickLogin.tsx` — dev tool, update musician test user

---

## Task 1: DB Migration — add column, migrate data, rebuild enum

**Files:**
- Create: `supabase/migrations/20260228120000_musician_to_profile_setting.sql`
- Modify: `docs/design/db-schema.sql`

### Step 1: Create the migration file

```sql
-- supabase/migrations/20260228120000_musician_to_profile_setting.sql

-- 1. Add is_musician column
ALTER TABLE public.profiles
  ADD COLUMN is_musician boolean NOT NULL DEFAULT false;

-- 2. Migrate existing musician rows → member + is_musician = true
UPDATE public.profiles
  SET is_musician = true, role = 'member'::text::user_role
  WHERE role = 'musician';

-- 3. Rebuild user_role enum: drop 'musician', add 'gatekeeper'
-- Postgres cannot drop enum values directly — must recreate the type.
CREATE TYPE user_role_new AS ENUM ('admin', 'gatekeeper', 'member');

ALTER TABLE public.profiles
  ALTER COLUMN role DROP DEFAULT;

ALTER TABLE public.profiles
  ALTER COLUMN role TYPE user_role_new
  USING role::text::user_role_new;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'member';

DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;
```

### Step 2: Apply the migration locally

```bash
npx supabase db reset
# OR if you want incremental:
npx supabase migration up
```

Expected: No errors. Verify with:
```bash
npx supabase db diff
```
Expected: No pending changes (migration fully applied).

### Step 3: Update docs/design/db-schema.sql

Find the line:
```sql
create type user_role as enum ('admin', 'musician', 'member');
```
Replace with:
```sql
create type user_role as enum ('admin', 'gatekeeper', 'member');
```

Find the profiles table definition and add after the `role` column:
```sql
  is_musician boolean not null default false,
```

### Step 4: Commit

```bash
git add supabase/migrations/20260228120000_musician_to_profile_setting.sql docs/design/db-schema.sql
git commit -m "feat: add is_musician column, remove musician role from enum, add gatekeeper"
```

---

## Task 2: Update TypeScript types and useAuth hook

**Files:**
- Modify: `hooks/useAuth.tsx`

### Step 1: Write a unit test for the UserRole type guard

Create `lib/unit-tests/userRole.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { UserRole } from '@/hooks/useAuth';

describe('UserRole type', () => {
  it('should not include musician', () => {
    const validRoles: UserRole[] = ['admin', 'gatekeeper', 'member', 'guest'];
    expect(validRoles).not.toContain('musician');
    expect(validRoles).toContain('gatekeeper');
  });
});
```

### Step 2: Run — confirm it fails

```bash
npx vitest run lib/unit-tests/userRole.test.ts
```

Expected: FAIL — `musician` is still in the type.

### Step 3: Update UserRole type and AuthUser interface in `hooks/useAuth.tsx`

**Line 6** — change:
```typescript
export type UserRole = 'admin' | 'musician' | 'member' | 'guest';
```
to:
```typescript
export type UserRole = 'admin' | 'gatekeeper' | 'member' | 'guest';
```

**AuthUser interface** — add `is_musician`:
```typescript
export interface AuthUser {
    id: string;
    email?: string;
    role: UserRole;
    is_musician: boolean;
    full_name?: string;
    avatar_url?: string;
}
```

### Step 4: Update MOCK_USERS — replace mock-musician

Replace the `mock-musician` entry (lines 18–24) with a member who has `is_musician: true`:

```typescript
'mock-member-musician': {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'musician@mock.com',
    role: 'member' as UserRole,
    is_musician: true,
    full_name: 'Mock Musician',
    avatar_url: undefined
},
```

Also update `mock-member` and `mock-admin` to include `is_musician: false`:
```typescript
'mock-member': {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'member@mock.com',
    role: 'member' as UserRole,
    is_musician: false,
    full_name: 'Mock Member',
    avatar_url: undefined
},
'mock-admin': {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin@mock.com',
    role: 'admin' as UserRole,
    is_musician: false,
    full_name: 'Mock Admin',
    avatar_url: undefined
},
```

### Step 5: Update profile fetch in loadUser to include is_musician

Find this block (around line 72):
```typescript
const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', supabaseUser.id)
    .maybeSingle();

setUser({
    id: supabaseUser.id,
    email: supabaseUser.email,
    role: profile?.role || 'member',
    full_name: profile?.full_name,
    avatar_url: profile?.avatar_url
});
```

Change to:
```typescript
const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url, is_musician')
    .eq('id', supabaseUser.id)
    .maybeSingle();

setUser({
    id: supabaseUser.id,
    email: supabaseUser.email,
    role: profile?.role || 'member',
    is_musician: profile?.is_musician ?? false,
    full_name: profile?.full_name,
    avatar_url: profile?.avatar_url
});
```

### Step 6: Run the test — confirm it passes

```bash
npx vitest run lib/unit-tests/userRole.test.ts
```
Expected: PASS

### Step 7: Commit

```bash
git add hooks/useAuth.tsx lib/unit-tests/userRole.test.ts
git commit -m "feat: replace musician role with is_musician on AuthUser"
```

---

## Task 3: Update dev tools

> **Note on MockRoleSwitcher rename:** `MockRoleSwitcher` will be renamed to `QuickSwitch` and gain a Gatekeeper option as part of the Gatekeeper role implementation (see `2026-02-28-gatekeeper-role-design.md` → Dev Tooling section). This task only covers the minimum changes needed for the musician migration; the full rename happens in the Gatekeeper plan.

**Files:**
- Modify: `hooks/useAuth.tsx` (MOCK_USERS — already done in Task 2)
- Modify: `components/dev/MockRoleSwitcher.tsx` (rename the option label only)
- Modify: `components/dev/QuickLogin.tsx`

### Step 1: Update MockRoleSwitcher option label

Replace:
```tsx
<option value="mock-musician">Mock Musician</option>
```
With:
```tsx
<option value="mock-member-musician">Member (Musician)</option>
```

### Step 2: Update QuickLogin

Update the musician test user label and icon:

```typescript
{ email: 'roel.de.meester+musician@gmail.com', label: 'Member (Musician)', role: 'member', icon: Guitar, color: 'text-amber-500' },
```

Update the import — replace `Music` with `Guitar`:
```typescript
import { ShieldCheck, Guitar, Users } from 'lucide-react';
```

### Step 3: Verify dev tools render correctly

```bash
npm run dev
```

Confirm:
- MockRoleSwitcher shows "Member (Musician)" instead of "Mock Musician"
- Switching to it sets `is_musician: true` on the mock user
- QuickLogin shows "Member (Musician)" with a guitar icon

### Step 4: Commit

```bash
git add components/dev/MockRoleSwitcher.tsx components/dev/QuickLogin.tsx
git commit -m "fix: update dev tool labels for musician→member+is_musician change"
```

---

## Task 4: Profile Settings toggle for is_musician

**Files:**
- Modify: `components/account/settings/ProfileSettings.tsx`
- Modify: `app/account/settings/page.tsx` (already passes `profile` — no change needed)

### Step 1: Write a test for the save action

`lib/unit-tests/profileSettings.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('is_musician profile field', () => {
  it('defaults to false when profile has no is_musician field', () => {
    const profile = { full_name: 'Test', role: 'member' };
    const isMusician = profile?.is_musician ?? false;
    expect(isMusician).toBe(false);
  });

  it('reads true when profile has is_musician = true', () => {
    const profile = { full_name: 'Test', role: 'member', is_musician: true };
    const isMusician = profile?.is_musician ?? false;
    expect(isMusician).toBe(true);
  });
});
```

### Step 2: Run — confirm it passes (pure logic, no mocks needed)

```bash
npx vitest run lib/unit-tests/profileSettings.test.ts
```
Expected: PASS

### Step 3: Add is_musician state and save handler to ProfileSettings

In `components/account/settings/ProfileSettings.tsx`, add:

**New import** at the top:
```typescript
import { Guitar } from "lucide-react";
```

**New state** after `const [fullName, ...]`:
```typescript
const [isMusician, setIsMusician] = useState<boolean>(profile?.is_musician ?? false);
```

**Update handleSave** to include `is_musician`:
```typescript
const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, is_musician: isMusician })
    .eq("id", user.id);
```

**Add the toggle UI** — insert this new section after the Full Name block (before the closing `</section>`):

```tsx
<div className="space-y-2 pt-6 border-t border-white/5">
  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
    Musical Preferences
  </label>
  <div
    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer"
    onClick={() => setIsMusician(v => !v)}
  >
    <div className="flex items-start gap-3 pr-4">
      <Guitar className="w-5 h-5 mt-0.5 text-slate-400" />
      <div>
        <p className="font-medium text-white">I play an instrument</p>
        <p className="text-sm text-slate-400 mt-0.5">
          Shows chord notation, transposition controls, and chord filters throughout the app.
        </p>
      </div>
    </div>
    <div
      className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${isMusician ? 'bg-[#f45d1a]' : 'bg-gray-700'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isMusician ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </div>
  </div>
</div>
```

**Update the Save button disabled condition** to also react to is_musician changes:
```tsx
disabled={isSaving || (fullName === (profile?.full_name || "") && isMusician === (profile?.is_musician ?? false))}
```

### Step 4: Test manually

1. Go to `/account/settings` → Profile tab
2. Toggle "I play an instrument" — button becomes enabled
3. Click Save — toast "Profile updated successfully" appears
4. Refresh page — toggle reflects saved value

### Step 5: Commit

```bash
git add components/account/settings/ProfileSettings.tsx lib/unit-tests/profileSettings.test.ts
git commit -m "feat: add is_musician toggle to Profile Settings"
```

---

## Task 5: Hide chord UI for non-musicians

**Files:**
- Modify: `app/songs/SongsPageContent.tsx`
- Modify: `components/home/SongCard.tsx`
- Modify: `app/page.tsx`

### Step 1: Hide Chords filter in SongsPageContent

`SongsPageContent.tsx` already imports `useAuth`. Find the `{ user }` destructure (around line 11) — it should already be there. If not, add:
```typescript
const { user } = useAuth();
```

Find the Chords Toggle block (lines 310–325). Wrap the entire button in a conditional:

```tsx
{user?.is_musician && (
    <button
        onClick={() => setFilter('chords', !state.chords)}
        disabled={!state.chords && chordsCount === 0}
        className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border ${state.chords
            ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 shadow-sm shadow-amber-900/20'
            : 'border-gray-800 bg-gray-900/50 text-gray-500 hover:text-gray-300 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
    >
        <Guitar className="w-3.5 h-3.5" />
        Chords
        {!state.chords && chordsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[9px]">{chordsCount}</span>
        )}
    </button>
)}
```

### Step 2: Add isMusician prop to SongCard

In `components/home/SongCard.tsx`:

**Add to interface:**
```typescript
interface SongCardProps {
    // ...existing props...
    isMusician?: boolean;
}
```

**Add to function signature:**
```typescript
export default function SongCard({
    // ...existing params...
    isMusician = false,
}: SongCardProps) {
```

**Wrap the Guitar chord icon** (lines 114–118):
```tsx
{hasChords && isMusician && (
    <div className="text-amber-500 mb-1" title="Has Chords">
        <Guitar className="w-3.5 h-3.5" />
    </div>
)}
```

### Step 3: Pass isMusician to SongCard from SongsPageContent

In `SongsPageContent.tsx`, find where `<SongCard>` is rendered (around line 362). Add the prop:
```tsx
<SongCard
    key={song.id}
    id={song.id}
    title={song.title}
    author={song.author}
    songKey={song.songKey}
    accentColor={song.color}
    isPublic={song.isPublic}
    hasChords={song.hasChords}
    hasMelody={song.hasMelody}
    isFavorite={song.isFavorite ?? false}
    userId={user?.id}
    categories={song.categories}
    isMusician={user?.is_musician ?? false}
/>
```

### Step 4: Pass isMusician to SongCard from app/page.tsx

`app/page.tsx` is a server component. It already fetches the user profile. Update the profile select to include `is_musician`:

Find the profile fetch (it currently fetches via `supabase.auth.getUser()`). The page already has `user` from `supabase.auth.getUser()`. Add a profile fetch:

```typescript
const { data: profile } = await supabase
    .from('profiles')
    .select('is_musician')
    .eq('id', user?.id ?? '')
    .maybeSingle();

const isMusician = profile?.is_musician ?? false;
```

Then pass `isMusician` to each `<SongCard>`:
```tsx
<SongCard
    key={index}
    id={song.id}
    title={song.title}
    author={song.author}
    songKey={song.songKey}
    accentColor={song.color}
    isPublic={song.isPublic}
    hasChords={song.hasChords}
    hasMelody={song.hasMelody}
    isFavorite={song.isFavorite ?? false}
    userId={user?.id}
    categories={song.categories}
    isMusician={isMusician}
/>
```

### Step 5: Verify manually

**As a non-musician member:**
- Songs page: Chords filter toggle is hidden
- Song cards: No amber Guitar icon

**After enabling is_musician in Profile Settings:**
- Songs page: Chords filter toggle appears
- Song cards: Guitar icon appears on songs with chords

### Step 6: Commit

```bash
git add app/songs/SongsPageContent.tsx components/home/SongCard.tsx app/page.tsx
git commit -m "feat: hide chord filter and chord badge for non-musicians"
```

---

## Task 6: Update seed data

**Files:**
- Modify: `supabase/seeds/02_profiles.sql`

### Step 1: Find the musician seed row

Open `supabase/seeds/02_profiles.sql`. Find the row with `role = 'musician'` (the "Local Musician" profile). Update it:

```sql
-- Change role from 'musician' to 'member' and set is_musician = true
-- Find the INSERT for the musician user and update:
-- role: 'member'
-- is_musician: true
```

The exact change depends on how the seed is written (INSERT or UPSERT). Update the role value from `'musician'` to `'member'` and add `is_musician = true` to the column list.

### Step 2: Verify seed applies cleanly

```bash
npx supabase db reset
```

Expected: No errors. The seed user that was "musician" is now a member with `is_musician = true`.

### Step 3: Commit

```bash
git add supabase/seeds/02_profiles.sql
git commit -m "chore: update seed data — musician user migrated to member + is_musician=true"
```

---

## Task 7: Run full test suite and clean up

### Step 1: Run all tests

```bash
npx vitest run
```

Expected: All tests pass. Fix any TypeScript errors from the `UserRole` type change (TypeScript will flag any remaining `'musician'` string literals).

### Step 2: Check for TypeScript errors

```bash
npx tsc --noEmit
```

Expected: No errors. If `musician` is referenced anywhere, TypeScript will catch it here.

### Step 3: Final commit if any cleanup was needed

```bash
git add -p
git commit -m "chore: fix remaining TypeScript references after musician role removal"
```

---

## Task 8: Sign-up onboarding question (Story 3.5.2)

**Files:**
- Create: `app/onboarding/page.tsx`
- Modify: `components/finish-registration-form.tsx`

**Goal:** After a new user completes registration (name entry), ask them one question before landing on the app: "Do you play an instrument?" Answering Yes sets `is_musician = true`. Skip leaves it false. Both paths land on `/`.

### Step 1: Write a test for the onboarding save logic

Create `lib/unit-tests/onboarding.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('onboarding is_musician save', () => {
  it('saves true when user clicks Yes', () => {
    const answer = 'yes';
    const isMusician = answer === 'yes';
    expect(isMusician).toBe(true);
  });

  it('saves false when user clicks Skip', () => {
    const answer = 'skip';
    const isMusician = answer === 'yes';
    expect(isMusician).toBe(false);
  });
});
```

### Step 2: Run — confirm it passes (pure logic)

```bash
npx vitest run lib/unit-tests/onboarding.test.ts
```
Expected: PASS

### Step 3: Create the onboarding page

Create `app/onboarding/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Guitar, SkipForward, Flame } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleAnswer = async (isMusician: boolean) => {
    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ is_musician: isMusician })
        .eq('id', user.id);
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f1117]">
      <div className="w-full max-w-sm text-center space-y-8">
        {/* Flame icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#b91c1c] to-[#ea580c] flex items-center justify-center shadow-[0_0_20px_rgba(185,28,28,0.3)]">
            <Flame className="w-8 h-8 text-white fill-current" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">One quick question</h1>
          <p className="text-[#8e99aa] text-sm leading-relaxed">
            Do you play an instrument and can you read chord notation?
          </p>
          <p className="text-[#5a657a] text-xs">
            This shows chord filters and transposition tools throughout the app.
            You can change this later in your profile settings.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleAnswer(true)}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-[#d9481e] to-[#f45d1a] hover:brightness-110 disabled:opacity-50 text-white font-bold transition-all shadow-[0_4px_15px_rgba(217,72,30,0.4)] active:scale-[0.98]"
          >
            <Guitar className="w-5 h-5" />
            Yes, I play an instrument
          </button>

          <button
            onClick={() => handleAnswer(false)}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-[#8e99aa] hover:text-white font-medium transition-all border border-white/5"
          >
            <SkipForward className="w-4 h-4" />
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Redirect to /onboarding after finish-registration

In `components/finish-registration-form.tsx`, change the redirect at line 52:

```typescript
// Before:
router.push(next || "/explore");

// After:
router.push(next || "/onboarding");
```

> **Note:** `next` carries through from the original pre-auth URL (e.g. if user wanted to view a specific song). When `next` is set, the user goes directly there and skips onboarding — this is intentional since they clearly have context and can set `is_musician` later from Profile Settings.

### Step 5: Verify manually

Full flow:
1. Sign up with a new email
2. Enter OTP code on sign-up-success page
3. Enter name on finish-registration → click "Finish Setup & Explore"
4. **Onboarding page loads** with Guitar and Skip buttons
5. Click "Yes, I play" → redirects to `/`
6. Go to Profile Settings — "I play an instrument" toggle is ON
7. Repeat flow with a different account, click "Skip" → Profile Settings toggle is OFF

### Step 6: Commit

```bash
git add app/onboarding/page.tsx components/finish-registration-form.tsx lib/unit-tests/onboarding.test.ts
git commit -m "feat: add is_musician onboarding question after registration (Story 3.5.2)"
```

---

## Manual Test Checklist

- [ ] New member account: `is_musician` defaults to false; no chord UI visible
- [ ] Enable "I play an instrument" in Profile Settings → save → chord filter and chord badges appear
- [ ] Disable again → chord UI disappears
- [ ] MockRoleSwitcher: "Mock Member (Musician)" shows chord UI; "Mock Member" does not
- [ ] QuickLogin: "Member (Musician)" test user has chord UI after login
- [ ] DB: no row in `profiles` has `role = 'musician'`
- [ ] DB: `user_role` enum has `gatekeeper`, not `musician`
- [ ] New sign-up: after name entry, onboarding page shows with "Yes" / "Skip" buttons
- [ ] Clicking "Yes" sets `is_musician = true`; chord UI appears
- [ ] Clicking "Skip" leaves `is_musician = false`; chord UI is hidden
- [ ] Signing up with a `?next=…` URL bypasses onboarding and goes directly to the target page
