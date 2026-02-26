# Account Settings (PR #66) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebase PR #66 onto main, wire the Stay Wake toggle into a new Preferences tab, and add five disabled placeholder toggles.

**Architecture:** The new `/account/settings` page is a Server Component that fetches `user` + `profile` and passes them to `AccountSettings` (client, 4-tab shell). Each tab is its own client component. The Preferences tab reuses the existing `useWakeLock` hook and `UserPreferencesContext` already in `app/layout.tsx` from main.

**Tech Stack:** Next.js 15 App Router, Supabase (server client), React Query, `sonner` (toasts), `useWakeLock` + `UserPreferencesContext` (localStorage), Tailwind CSS.

---

## Context: Branch vs Main

- Branch: `feat/onboarding-settings-ux` (2 commits from Feb 5, never merged)
- Main: 11 commits ahead — added `UserPreferencesProvider` in layout, `useWakeLock` hook, new RLS migration, React Query cache fixes, favorites page
- Conflict zones after rebase:
  1. `app/layout.tsx` — branch adds `<Toaster>`, main adds `<UserPreferencesProvider>`. **Keep both.**
  2. `app/account/settings/page.tsx` — branch's Server Component wins over main's single-toggle page.
  3. `components/common/navigation/UserProfile.tsx` — branch renames label "Personal Settings" → "Account Settings". Keep branch version.
  4. `package-lock.json` — if conflict, accept both then run `npm install`.

---

## Task 1: Rebase onto main

**Files:**
- All conflicting files listed above

**Step 1: Start the rebase**
```bash
git fetch origin
git rebase origin/main
```
Expected: rebase pauses on conflicts.

**Step 2: Resolve `app/layout.tsx`**

Main adds `UserPreferencesProvider` wrapping everything. Branch adds `<Toaster>` inside `<SidebarProvider>`. The final file must have **both**. Keep main's `UserPreferencesProvider` wrapper AND the branch's `<Toaster>` block. The resolved file should look like:

```tsx
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";
// ... other imports

export default function RootLayout(...) {
  return (
    <html ...>
      <body ...>
        <EnvironmentBanner />
        <UserPreferencesProvider>
          <SidebarProvider>
            <QueryProvider>
              <div className="min-h-screen ...">
                <Sidebar />
                <div className="flex-1 ...">
                  <Header />
                  {children}
                </div>
              </div>
            </QueryProvider>
          </SidebarProvider>
          <Toaster
            position="top-center"
            theme="dark"
            icons={{ success: null, error: null, loading: <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> }}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: "bg-[#141b24] border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-[15px] font-medium text-center shadow-inner min-w-[300px] flex justify-center items-center mb-2",
                title: "text-emerald-400",
                success: "border-emerald-500/30",
                error: "bg-[#1a1010] border-red-500/30 text-red-400",
              }
            }}
          />
          <SpeedInsights />
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
```

**Step 3: Resolve `app/account/settings/page.tsx`**

Keep the branch version entirely (the Server Component that fetches user + profile and renders `<AccountSettings>`). Discard main's single-toggle wake lock page.

**Step 4: Resolve `components/common/navigation/UserProfile.tsx`**

Keep main's version as the base (it has the favorites link added later), then apply the branch's label change: `"Personal Settings"` → `"Account Settings"`.

**Step 5: Resolve `package-lock.json` (if conflicted)**
```bash
# Accept both sides, then regenerate
npm install
git add package-lock.json
```

**Step 6: Continue rebase**
```bash
git add .
git rebase --continue
```
Expected: rebase completes cleanly.

**Step 7: Verify build**
```bash
npm run build 2>&1 | tail -20
```
Expected: no TypeScript errors, build succeeds.

**Step 8: Commit note**
The rebase rewrites history — no commit needed here, just `git rebase --continue` completing.

---

## Task 2: Create `PreferencesSettings` component

**Files:**
- Create: `components/account/settings/PreferencesSettings.tsx`

**Step 1: Create the file**

```tsx
"use client";

import { Monitor, FileText, Music2, Type, WifiOff, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useUserPreferences } from "@/context/UserPreferencesContext";

interface PreferenceRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  comingSoon?: boolean;
  notSupported?: boolean;
}

function PreferenceRow({
  icon, label, description, checked, onCheckedChange,
  disabled, comingSoon, notSupported,
}: PreferenceRowProps) {
  return (
    <div className={`flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-opacity ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3 pr-4">
        <div className="mt-0.5 text-slate-400">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{label}</p>
            {comingSoon && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            {description}
            {notSupported && (
              <span className="text-amber-500 block mt-1">Not supported by your browser</span>
            )}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-[#f45d1a] shrink-0"
      />
    </div>
  );
}

export default function PreferencesSettings() {
  const { preferences, setPreference } = useUserPreferences();
  const { isSupported } = useWakeLock();

  return (
    <section className="bg-slate-800/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl space-y-4">
      <h2 className="text-xl font-bold text-white mb-6">App Preferences</h2>

      {/* Keep Screen Awake — functional */}
      <PreferenceRow
        icon={<Monitor className="w-5 h-5" />}
        label="Keep Screen Awake"
        description="Prevent the screen from dimming while viewing lyrics."
        checked={preferences.keepScreenAwake && isSupported}
        onCheckedChange={(v) => setPreference("keepScreenAwake", v)}
        disabled={!isSupported}
        notSupported={!isSupported}
      />

      {/* Auto-scroll Lyrics — disabled */}
      <PreferenceRow
        icon={<FileText className="w-5 h-5" />}
        label="Auto-scroll Lyrics"
        description="Automatically scroll through a song during performance."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Default Chord Display — disabled */}
      <PreferenceRow
        icon={<Music2 className="w-5 h-5" />}
        label="Show Chords by Default"
        description="Always show chord annotations when opening a song."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Font Size — disabled */}
      <PreferenceRow
        icon={<Type className="w-5 h-5" />}
        label="Large Stage Font"
        description="Increase text size for better readability on stage."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Offline Mode — disabled */}
      <PreferenceRow
        icon={<WifiOff className="w-5 h-5" />}
        label="Offline Mode"
        description="Cache songs locally for use without an internet connection."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Browser Theme Color — disabled */}
      <PreferenceRow
        icon={<Palette className="w-5 h-5" />}
        label="Use Browser Theme Color"
        description="Tint the browser chrome to match the app's color on mobile."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />
    </section>
  );
}
```

**Step 2: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep -i "PreferencesSettings\|useWakeLock\|useUserPreferences"
```
Expected: no errors.

**Step 3: Commit**
```bash
git add components/account/settings/PreferencesSettings.tsx
git commit -m "feat: add PreferencesSettings component with Stay Wake + 5 coming-soon toggles"
```

---

## Task 3: Wire Preferences tab into `AccountSettings`

**Files:**
- Modify: `components/account/settings/AccountSettings.tsx`

**Step 1: Add the import and tab**

In `components/account/settings/AccountSettings.tsx`:

1. Add import at top:
```tsx
import PreferencesSettings from "@/components/account/settings/PreferencesSettings";
```

2. Update `TabType`:
```tsx
type TabType = "profile" | "account" | "preferences" | "privacy";
```

3. Update `tabs` array (insert before `privacy`):
```tsx
const tabs = [
  { id: "profile" as const,      label: "Profile" },
  { id: "account" as const,      label: "Account" },
  { id: "preferences" as const,  label: "Preferences" },
  { id: "privacy" as const,      label: "Privacy & Data" },
];
```

4. Add render in Tab Content block (after the `account` line):
```tsx
{activeTab === "preferences" && <PreferencesSettings />}
```

**Step 2: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep -i "AccountSettings\|TabType"
```
Expected: no errors.

**Step 3: Commit**
```bash
git add components/account/settings/AccountSettings.tsx
git commit -m "feat: add Preferences tab to Account Settings"
```

---

## Task 4: Final type check + build

**Step 1: Full type check**
```bash
npx tsc --noEmit 2>&1 | tail -20
```
Expected: no errors.

**Step 2: Build**
```bash
npm run build 2>&1 | tail -30
```
Expected: ✓ compiled successfully.

**Step 3: Run tests**
```bash
npm test 2>&1 | tail -15
```
Expected: 2 test files pass, 1 pre-existing failure in `chordUtils.test.ts` (unrelated to this PR).

---

## Task 5: Force-push to update PR #66

**Step 1: Push (force required because of rebase)**
```bash
git push --force-with-lease origin feat/onboarding-settings-ux
```
Expected: branch updated on GitHub, PR #66 shows new commits.

**Step 2: Verify PR**
```bash
gh pr view 66 --json title,state,commits | jq '.commits | length'
```
Expected: more commits than before the rebase.

---

## Manual Test Checklist

After deploying / running `npm run dev`:

- [ ] `/auth/confirm?type=signup&token_hash=...` redirects to `/auth/finish-registration`
- [ ] Finish Registration form saves `full_name` to `profiles` and redirects to `/explore`
- [ ] `/account/settings` shows 4 tabs: Profile, Account, Preferences, Privacy & Data
- [ ] Profile tab: update display name → toast success → name persists on refresh
- [ ] Profile tab: upload avatar → preview updates → persists on refresh
- [ ] Account tab: update password → toast success
- [ ] Account tab: "Log out from all devices" → redirects to login
- [ ] Preferences tab: Keep Screen Awake toggle is functional (orange when on)
- [ ] Preferences tab: all other toggles are grayed out with "Coming soon" badge
- [ ] Privacy & Data tab renders without errors (scaffolding only)
- [ ] Sidebar "Account Settings" link (not "Personal Settings") navigates correctly
