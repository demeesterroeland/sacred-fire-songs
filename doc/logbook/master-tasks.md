# Tasks

- [x] **Project Foundation (Dec 25-26)**
    - [x] Initialize Next.js Project & Config.
    - [x] Define Core Data Contract (`types.ts`).
    - [x] Create UI Component Architecture (`Header`, `SearchBar`, `SongCard`).
    - [x] Implement Tailwind CSS Design System (Dark Mode, Glassmorphism).
- [x] **Core Feature Sprint (Dec 29)**
    - [x] Implement Search Filter Logic (`useState`, `useEffect`).
    - [x] Integrate Supabase Client & Initial Schema (`compositions`, `song_versions`).
    - [x] Build ChordPro Parser & Renderer logic.
    - [x] Create UX Polish Features (Skeletons, 404 Page, Animations).
    - [x] Implement Offline Support with React Query.
    - [x] Create "Add Song" Mutation Logic.
- [x] **Infrastructure & Roles (Jan 04)**
    - [x] Establish CI/CD Pipeline (`deploy-db.yml`).
    - [x] Refactor Initial Roles (User->Member, Moderator->Musician).
    - [x] Refactor Category Schema (Hierarchical Tree).
- [x] Investigate local `supabase/migrations` directory and compare with reported missing timestamp. <!-- id: 0 -->
- [x] Analyze `.github/workflows` to understand deployment configuration. <!-- id: 1 -->
- [x] Formulate a plan to resolve the migration mismatch (syncing or repairing). <!-- id: 2 -->
- [x] Guide user or apply fixes to local codebase if applicable. <!-- id: 3 -->
- [x] Check if `doc/db-schema.sql` is up to date with recent migrations. <!-- id: 4 -->
- [x] If outdated, generate a new full schema dump and update `doc/db-schema.sql`. <!-- id: 5 -->
- [x] Document the process for fresh installs (using migrations vs schema file). <!-- id: 6 -->
- [x] Create automation plan (Workflow). <!-- id: 7 -->
- [x] Create `.agent/workflows/update-schema.md`. <!-- id: 8 -->
- [x] Test workflow with detailed steps (Dummy migration -> Run Workflow -> Verify). <!-- id: 9 -->
- [x] Create `.agent/rules/schema-migration-policy.md` to instruct agent behavior. <!-- id: 10 -->
- [x] Verify the rule by performing a migration and observing agent behavior (optional/manual). <!-- id: 11 -->
- [x] Resolve RLS warning for `public.setlist_items`. <!-- id: 12 -->
    - [x] Create migration to enable RLS.
    - [x] **RULE CHECK**: Update `doc/db-schema.sql` to reflect this.
- [x] specific verified that this triggers a deploy-db workflow and resolves RLS warning (via push). <!-- id: 13 -->
- [x] Resolve additional security warnings. <!-- id: 14 -->
    - [x] Enable RLS on `setlists`.
    - [x] Fix mutable search_path on `check_is_subcategory`.
    - [x] Harden INSERT policies for `compositions` and `song_versions`.
    - [x] Investigate/Fix SECURITY DEFINER on views.
    - [x] **RULE CHECK**: Sync `doc/db-schema.sql`.
- [x] Resolve 8 performance warnings. <!-- id: 15 -->
    - [x] Optimize `auth.uid()` calls with `(select auth.uid())`.
    - [x] Consolidate "Multiple Permissive Policies" (overlap between Public and Auth roles).
    - [x] **RULE CHECK**: Sync `doc/db-schema.sql`.
- [x] Resolve `setlists` "Multiple Permissive Policies" warning. <!-- id: 16 -->
    - [x] Consolidate overlapping SELECT policies for `setlists`.
    - [x] **RULE CHECK**: Sync `doc/db-schema.sql`.
    - [x] **RE-FIX**: Apply specific Supabase suggestion (TO public / TO authenticated). <!-- id: 17 -->
- [x] Create Roles & Permissions Summary Table. <!-- id: 18 -->
    - [x] Analyze `doc/epic&user stories.md`.
    - [x] Generate table and append to documentation.
- [x] Setup Doc Changelog Automation. <!-- id: 19 -->
    - [x] Analyze file headers in `doc/`.
    - [x] Create `.agent/rules/doc-changelog-policy.md`.
    - [x] Create `.agent/workflows/update-doc-changelog.md`.
    - [x] **VERIFY**: Manually applied changelog update to `doc/epic&user stories.md` (Version 1.4). <!-- id: 20 -->
- [x] Expand Song Management Permissions. <!-- id: 21 -->
    - [x] Plan: Add `owner_id` to `compositions` and update policies.
    - [x] Doc: Update `doc/epic&user stories.md` (Stories + Role Table).
    - [x] Migration: Add column and update RLS.
    - [x] **RULE CHECK**: Sync `doc/db-schema.sql`.
- [x] **CORRECTION**: Apply `doc-changelog-policy` to files from Task 21. <!-- id: 22 -->
    - [x] Update `doc/epic&user stories.md` (v1.5).
    - [x] Update `doc/db-schema.sql` (v2.1).
- [x] Sync Other Docs with Permission Changes. <!-- id: 23 -->
    - [x] Review `test-cases.md`, `user-guide.md`, `screen4_song_upload.html`.
    - [x] Update content to reflect "Users can Create" and "Owners can Edit".
    - [x] **RULE CHECK**: Apply `doc-changelog-policy` to all updated files.
- [x] Refactor "Song Upload" to "Add Song". <!-- id: 24 -->
    - [x] Rename `doc/screen4_song_upload.html` to `doc/screen4_add_song.html`.
    - [x] Update text in `doc/epic&user stories.md`.
    - [x] Update text in `doc/test-cases.md`.
    - [x] Update text in `doc/user-guide.md`.
    - [x] Update text in `doc/screen1_home.html` (Dashboard links).
    - [x] **RULE CHECK**: Apply `doc-changelog-policy` to all updated files.
- [x] Implement "Edit Own Song" Feature. <!-- id: 25 -->
    - [x] Create `components/song/SongForm.tsx` (Create/Edit modes).
    - [x] Delete `components/admin/UploadForm.tsx`.
    - [x] Refactor Route: `app/admin/upload` -> `app/songs/add`.
    - [x] Create `app/songs/[id]/edit/page.tsx`.
    - [x] Update `app/songs/[id]/page.tsx` (Edit Button).
    - [x] Update Navigation Links (`/admin/upload` -> `/songs/add`).
    - [ ] **RULE CHECK**: If docs/mockups are updated, apply changelog policy.
- [x] Sync User Info in UI (Sidebar & MobileMenu). <!-- id: 26 -->
    - [x] Update `Sidebar.tsx` to fetch and show real email.
    - [x] Update `MobileMenu.tsx` to fetch and show real email & ID.
- [x] Restrict Edit Access. <!-- id: 27 -->
    - [x] Create `doc/screen5_access_denied.html` (HTML Mockup).
    - [x] Create `components/common/AccessDenied.tsx` (React Component).
    - [x] Implement server/client-side owner check in `edit/page.tsx`.
    - [x] Implement server/client-side owner check in `edit/page.tsx`.
    - [x] Show Denial page if user is guest or non-owner.
- [x] Implement Mock Role Switcher (Test Feature). <!-- id: 28 -->
    - [x] Create `hooks/useAuth.tsx` (Wraps Supabase + LocalStorage Mock).
    - [x] Refactor `Sidebar.tsx`, `MobileMenu.tsx` to use `useAuth`.
    - [x] Refactor `app/songs/[id]/page.tsx` (Detail) to use `useAuth`.
    - [x] Refactor `app/songs/[id]/edit/page.tsx` (Edit) to use `useAuth`.
    - [x] Refactor `app/songs/[id]/edit/page.tsx` (Edit) to use `useAuth`.
    - [x] Add Role Switcher Dropdown to `Sidebar` and `MobileMenu`.
    - [x] Rename Test users to Mock users and migration DB data. <!-- id: 29 -->
- [x] Implement Logout Functionality. <!-- id: 30 -->
    - [x] Update `useAuth` to include `logout` method.
    - [x] Connect Logout button in `Sidebar` and `MobileMenu`.
    - [x] Connect Logout button in `Sidebar` and `MobileMenu`.
- [x] Refactor 'Musician' Role to 'Expert'. <!-- id: 31 -->
    - [x] Update Documentation (`stories`, `analysis`, `schema`, `user-guide`).
    - [x] Create Database Migration (Rename ENUM, Update Profiles).
    - [x] Update Code (`useAuth`, Components, Types).
    - [x] Update Seed Data (`seed_mock_data.sql`).
- [x] Refactor Code to Next.js Guidelines. <!-- id: 32 -->
    - [x] Convert `Sidebar`, `MobileMenu`, `SongForm`, `useAuth` to Arrow Functions.
    - [x] Ensure event handlers start with `handle`.
- [x] Move `doc/screen*.html` to `doc/screens/` folder.
- [x] **GitHub Issue Migration (Jan 13)**
    - [x] Create script to convert `doc/logbook/epic&user stories.md` to GitHub Issues.
    - [x] Link historical commits to new issues.
    - [x] Reconcile Stories vs Issues (Identified missing/duplicates).
    - [x] Fix Duplicates (Removed dupes for 1.2.1 and 2.3.2).
    - [x] **RULE CHECK**: Ensure `doc/logbook/epic&user stories.md` is updated (Version 1.7).
- [x] Create Pull Request Template (`.github/pull_request_template.md`).
- [x] **User Implementation (Jan 14)**
    - [x] Redesign Add Song Screen (Story 1.1.2).
        - [x] Create Expandable Upload UI.
        - [x] Implement File Parsing Logic (.cho).
        - [x] Verify Import Flow (Browser Subagent).
- [x] **Story 1.1.3: Delete Song (Issue #2)**
    - [x] Create Feature Branch.
    - [x] Create Implementation Plan.
    - [x] Implement Backend (Delete Action/API).
    - [x] Implement UI (Delete Button + Confirmation Modal).
    - [x] Verify Access Control (Admin only).
    - [x] Verify with Test Case (Browser Subagent).

- [ ] **Infrastructure Enhancements**
    - [x] Create `code-review` skill.

- [ ] **Critical Bugs**
    - [x] **Bug #30: RLS Violation on Add Song**
        - [x] Create Fix Branch (`fix/issue-30-rls-add-song`).
        - [x] Investigate RLS Policy for `INSERT` on `compositions`.
        - [x] Apply Fix (Created Migration `allow_public_inserts.sql`).

    - [x] **Bug #31: Song Update Failure**
        - [x] Create Issue & Branch.
        - [x] Reproduce Bug (Confirmed RLS blocking Mock Mode).
        - [x] Fix & Verify (Applied public update policy).

- [x] **Session Jan 17: SongForm Styling & Sync**
    - [x] Update SoundCloud icon in `song_add_expanded.html`
    - [x] Add "Save Draft" button to Footer
    - [x] Align Cancel/Upload buttons right
    - [x] Sync `song_add_collapsed.html`
    - [x] Update `SongForm.tsx`:
        - [x] Add Language, Tags, Links fields
        - [x] Add Save Draft button
    - [x] Fix Styling Regressions:
        - [x] Update mockups primary color to Red
        - [x] Verify global CSS and Tailwind config
        - [x] Restore exact colors from mockup
    - [x] **Documentation Sync**:
        - [x] Run `/sync-artifacts` (Task Restore)
        - [x] Run `/sync-doc-and-code` (Audit & Rectify)




- [x] **Issue #33: Auto-convert "Chords over Lyrics" to ChordPro** <!-- id: 31 -->
    - [x] Create Feature Branch `feat/issue-33-chords-over-lyrics` <!-- id: 32 -->
    - [x] Create Implementation Plan <!-- id: 33 -->
    - [x] Install `ongsongtxt-2-chordpro` (or port logic) <!-- id: 34 -->
    - [x] Refactor `SongForm` and `chordProParsing.ts` <!-- id: 35 -->
    - [x] Verify with Browser Subagent (Paste Simulation) <!-- id: 36 -->
- [x] **Bug: Parser fails on "Down to the River"** <!-- id: 37 -->
    - [x] Create reproduction script <!-- id: 38 -->
    - [x] Debug and Fix `isChordLine` logic (Added robustness for comments) <!-- id: 39 -->
    - [x] Verify fix <!-- id: 40 -->
- [x] **Refactor: Move Code to Lib** <!-- id: 41 -->
    - [x] Move `chordProParsing` to `lib/` <!-- id: 42 -->
    - [x] Move `utils/supabase` to `lib/supabase` (consolidated) <!-- id: 43 -->
    - [x] Update imports in `SongForm`, `deleteSong`, etc. <!-- id: 44 -->
    - [x] Move tests to `lib/unit-tests` <!-- id: 45 -->
- [x] **Refactor: Deduplicate Chord Parsing** <!-- id: 46 -->
    - [x] Analyze `chordUtils.ts` vs `chordProParsing.ts` <!-- id: 47 -->
    - [x] Consolidate into `lib/chordProParsing.ts` <!-- id: 48 -->
    - [x] Update `chordUtils` to use shared parser <!-- id: 49 -->
    - [x] Verify functionality <!-- id: 50 -->
- [x] **Bug: "Error loading song" on Edit** <!-- id: 51 -->
    - [x] Investigate `app/songs/[id]/edit/page.tsx` <!-- id: 52 -->
    - [x] Create reproduction/test case <!-- id: 53 -->
    - [x] Fix data fetching/permissions (Created Migration) <!-- id: 54 -->
    - [x] Verify fix (User executed SQL) <!-- id: 55 -->

- [x] **Refinement: Paste Logic & Test Coverage** <!-- id: 56 -->
    - [x] Add `DonneRicche` unit test (Chords over Lyrics) <!-- id: 57 -->
    - [x] Fix `SongForm` paste detection (Allow multi-line without tags) <!-- id: 58 -->
    - [x] Verify Fix <!-- id: 59 -->
- [x] **UI Polish: Standardize Submit Button** <!-- id: 60 -->
    - [x] Create branch `ui/standardize-button-text` <!-- id: 61 -->
    - [x] Update `SongForm.tsx` to use "Publish Song" <!-- id: 62 -->
    - [x] Merge to main <!-- id: 63 -->
- [x] **Story 1.1.7: Media Links** <!-- id: 64 -->
    - [x] Create `MediaEmbeds.tsx` <!-- id: 65 -->
    - [x] Update `SongForm.tsx` persistence <!-- id: 66 -->
    - [x] Update `app/songs/[id]/page.tsx` fetching & display <!-- id: 67 -->
    - [x] Merge fix `ui/publish-button-color` <!-- id: 68 -->
- [x] Initialize Time Tracking Log <!-- id: 0 -->
- [x] Refactor Base Path from `/songbook` to `/` <!-- id: 1 -->
    - [x] Search for hardcoded `/songbook` strings <!-- id: 2 -->
    - [x] Update documentation links if necessary <!-- id: 3 -->
    - [x] Verify `middleware.ts` logic <!-- id: 4 -->
    - [x] Verify `next.config.ts` correctness <!-- id: 5 -->
- [x] Push changes to remote `main` <!-- id: 6 -->
- [x] Audit Active Branches <!-- id: 7 -->
    - [x] List all branches <!-- id: 8 -->
    - [x] Check merged status of each branch <!-- id: 9 -->
    - [x] Report findings to user <!-- id: 10 -->
- [x] Verify Story 1.1.6 (Auto-convert Chords) Implementation <!-- id: 11 -->
- [x] Plan Extended Metadata Feature (Story 1.1.7) <!-- id: 12 -->
    - [x] Analyze Schema & UI gaps <!-- id: 13 -->
    - [x] Create GitHub Issue Draft <!-- id: 14 -->
    - [x] Plan UI Mockup Updates <!-- id: 15 -->
    - [x] Present Plan to User <!-- id: 16 -->
- [x] Create GitHub Issue [Story 1.1.7] <!-- id: 17 -->
- [x] Create UI Mockup for Validation <!-- id: 18 -->
    - [x] Consolidate into `song_add.html` <!-- id: 21 -->
    - [x] Replicate 'Upload' UI inside details <!-- id: 22 -->
    - [x] Reorder: Key, Capo, Tuning <!-- id: 23 -->
- [x] Create Workflow: `create-issue` <!-- id: 19 -->
- [x] Create Feature Branch `feat/extended-metadata-1.1.7` <!-- id: 29 -->
- [x] Commit & Push `.agent` configuration <!-- id: 20 -->
- [x] Database Migration (Add `tuning` column) <!-- id: 24 -->
    - [x] Create migration file <!-- id: 25 -->
    - [x] Update `doc/db-schema.sql` <!-- id: 26 -->
- [x] Frontend Implementation (`SongForm.tsx`) <!-- id: 27 -->
- [x] Refine Dashboard Display Logic (Dynamic Key) <!-- id: 30 -->
- [x] Enhance ChordPro Parsing (Extract Key/Capo) <!-- id: 31 -->
- [x] Update Unit Tests for Parsing (Refactored to Vitest) <!-- id: 32 -->
- [x] Refine Metadata Logic (Defaults & Edit Mode) <!-- id: 33 -->
- [x] Polish UI (Left-align Metadata) <!-- id: 34 -->
- [x] Verify Implementation <!-- id: 28 -->
- [x] **Story 1.1.4: Advanced Authentication (Issue #3)** <!-- id: 69 -->
    - [x] Implement Auth Routes (/login, /signup, etc.) <!-- id: 70 -->
    - [x] Implement Auth Proxy for secure session validation <!-- id: 71 -->
    - [x] Harden RLS policies for Compositions and Profiles <!-- id: 72 -->
    - [x] Optimize Middleware for performance <!-- id: 73 -->
    - [x] Implement glassmorphism UI for all Auth forms <!-- id: 74 -->
    - [x] Documentation Sync & Time Tracking <!-- id: 75 -->

- [x] **Chord Detection & Melody Feature (Issue #5)** <!-- id: 84 -->
    - [x] Implement `hasChords` detection logic in `lib/chordProParsing.ts` <!-- id: 85 -->
    - [x] Add `has_chords` and `has_melody` SQL migration and backfill <!-- id: 86 -->
    - [x] Update `Song` interface and `fetchSongs` utility <!-- id: 87 -->
    - [x] Implement auto-detection in `SongForm.tsx` <!-- id: 88 -->
    - [x] Add vibrant badges to `SongCard.tsx` (Guitar & Music icons) <!-- id: 89 -->
    - [x] Implement dual filters (Chords & Melody) on `/songs` page <!-- id: 90 -->
    - [x] Enhance Song Detail page with badges <!-- id: 91 -->
- [x] **Private Song Aesthetic Polish (Issue #6)** <!-- id: 92 -->
    - [x] Implement dashed-border and dark theme for private song cards <!-- id: 93 -->
    - [x] Apply consistent dashed styling to library filter tabs <!-- id: 94 -->
- [x] **Session Jan 29: Auth Redesign & Rate Limits**
    - [x] **Email Templates**
        - [x] Design email-safe patterns for dark theme & flame aesthetic.
        - [x] Generate templates for Magic Link, Signup, and Password Reset.
        - [x] Persist templates to `doc/emails/` as standalone HTML files.
    - [x] **Auth UI Redesign**
        - [x] Create mockups for Login (Magic/Password), Signup, and Forgot/Update Password.
        - [x] Implement glassmorphism & flame aesthetic across all auth pages.
        - [x] Add password confirmation validation to Signup and Update Password.
    - [x] **Infrastructure & Scripts**
        - [x] Create `supabase_rate_limits.sh` helper script.
        - [x] Implement secure environment variable loading for scripts.
- [ ] **Verification**
    - [ ] Perform full E2E test of magic link flow in production.
# Task: Redesigned Login Flow

- [x] **Email Templates**
    - [x] Design email-safe patterns for dark theme & flame aesthetic.
    - [x] Generate templates for Magic Link, Signup, and Password Reset.
    - [x] Persist templates to `doc/emails/` as standalone HTML files.

- [x] **Migration Cleanup**
    - [x] Identify correct creation times for today's migrations.
    - [x] Rename files to use standard `YYYYMMDDHHMMSS` format (17:57 slot).

- [x] **Planning & Design**
    - [x] Research existing screen mockups.
    - [x] Create design proposal for Magic Link & Password flow.
    - [x] Update `app/auth/forgot-password/page.tsx`:
        - Match `screen3d_forgot_password.html` design.
        - Use the same glassmorphism design and icons.
    - [x] Update `app/auth/update-password/page.tsx`:
        - Match `screen3e_update_password.html` design.
        - Add confirm password field.
    - [ ] Update logout logic/UI if needed.
- [ ] **Favorites Feature (Rolled Back)**
    - [ ] Re-implement `toggleFavorite` server action.
    - [ ] Update `SongCard` with heart icon.
    - [ ] Update `app/songs/[id]/page.tsx` toggle.
    - [ ] Add "Favorites" filter to Library.
- [ ] **Infrastructure**
    - [x] Implement Vercel Speed Insights.
- [x] **Debug: Persistent Loading Hang**
    - [x] Investigate cause (Supabase client/session stall).
    - [x] Implement request timeout in `fetchSongs` to prevent UI freeze.
- [ ] **Debug: Update Password Stall**
    - [ ] Investigate `update-password/page.tsx`.
    - [ ] Add safety timeout and error handling.
- [ ] **Verification**
    - [x] Verify heart icons load promptly in song lists.
    - [ ] Perform full E2E test of magic link flow in production.
    - [ ] Verify Magic Link sends email.
    - [ ] Verify Password login works.
    - [ ] Verify Signup works with just Email/Password.
# Task: Redesigned Login Flow

- [x] **Email Templates**
    - [x] Design email-safe patterns for dark theme & flame aesthetic.
    - [x] Generate templates for Magic Link, Signup, and Password Reset.
    - [x] Persist templates to `doc/emails/` as standalone HTML files.

- [x] **Migration Cleanup**
    - [x] Identify correct creation times for today's migrations.
    - [x] Rename files to use standard `YYYYMMDDHHMMSS` format (17:57 slot).

- [x] **Planning & Design**
    - [x] Research existing screen mockups.
    - [x] Create design proposal for Magic Link & Password flow.
    - [x] Update `app/auth/forgot-password/page.tsx`:
        - Match `screen3d_forgot_password.html` design.
        - Use the same glassmorphism design and icons.
    - [x] Update `app/auth/update-password/page.tsx`:
        - Match `screen3e_update_password.html` design.
        - Add confirm password field.
    - [ ] Update logout logic/UI if needed.
- [ ] **Favorites Feature (Rolled Back)**
    - [ ] Re-implement `toggleFavorite` server action.
    - [ ] Update `SongCard` with heart icon.
    - [ ] Update `app/songs/[id]/page.tsx` toggle.
    - [ ] Add "Favorites" filter to Library.
- [ ] **Infrastructure**
    - [x] Implement Vercel Speed Insights.
- [x] **Debug: Persistent Loading Hang**
    - [x] Investigate cause (Supabase client/session stall).
    - [x] Implement request timeout in `fetchSongs` to prevent UI freeze.
- [ ] **Debug: Update Password Stall**
    - [ ] Investigate `update-password/page.tsx`.
    - [ ] Add safety timeout and error handling.
- [x] **Fix: Migration Payload**
    - [x] Split `rename_musician_to_expert.sql` to avoid enum transaction error.
    - [x] Make policy migrations idempotent (`DROP POLICY IF EXISTS`).
    - [x] Fix idempotency for `add_is_public` and subsequent migrations.
- [ ] **Verification**
    - [x] Verify heart icons load promptly in song lists.
    - [ ] Perform full E2E test of magic link flow in production.
    - [ ] Verify Magic Link sends email.
    - [ ] Verify Password login works.
    - [ ] Verify Signup works with just Email/Password.

- [x] **Session Jan 30: Environment & Deployment Fixes**
    - [x] Implement dynamic Environment Banner & Tab Title Logic.
    - [x] Detect Vercel `preview` vs `production` environments.
    - [x] Automate `public.profiles` creation via Auth Triggers.
    - [x] Fix RLS policies blocking `song_versions` insertions.
    - [x] Restore "Trash" icon visibility for song owners.
    - [x] Link orphaned songs to correct user UIDs.
    - [x] Finalize `change-email.html` template variables.
    - [x] Cleanup documentation (mockups deletion).
# Task: Redesigned Login Flow

- [x] **Email Templates**
    - [x] Design email-safe patterns for dark theme & flame aesthetic.
    - [x] Generate templates for Magic Link, Signup, and Password Reset.
    - [x] Persist templates to `doc/emails/` as standalone HTML files.

- [x] **Verification & Output**
    - [x] Create Walkthrough Artifact
    - [x] Synchronize Logbook
    - [x] Prepare Pull Request (`feat/test-preview` -> `main`)

- [x] **Migration Cleanup**
    - [x] Identify correct creation times for today's migrations.
    - [x] Rename files to use standard `YYYYMMDDHHMMSS` format (17:57 slot).

## Maintenance & Optimization
- [x] Generate TypeScript Types (`types/supabase.ts`)
- [x] Database Performance Analysis
    - [x] Check for Index Advisor
    - [x] Analyze Missing Foreign Key Indexes
    - [x] Apply Foreign Key Indexes (`compositions`, `song_versions`, etc.)
    - [x] Check Cache Hit Ratios

## Bug Fixes (Preview)
- [x] Debug "Invalid API Key" on Signup
    - [x] Verify Client Initialization (`lib/supabase/client.ts`)
    - [x] Check Vercel Environment Variables for Preview
    - [x] Fix: Reverted to strict `PUBLISHABLE_KEY` (User confirmed `ANON_KEY` is deprecated)

- [x] Debug Redirect URL (Preview)
    - [x] Informed user about Supabase Redirect URL Allow List requirement.
- [x] **Environment Indicator**
    - [x] Create `components/common/EnvironmentBanner.tsx`
    - [x] Integrate into `app/layout.tsx`
    - [x] Integrate into `Sidebar.tsx` and `Header.tsx`
    - [x] Verify detection of `preview` vs `production`

- [x] **Planning & Design**
    - [x] Research existing screen mockups.
    - [x] Create design proposal for Magic Link & Password flow.
    - [x] Update `app/auth/forgot-password/page.tsx`:
        - Match `screen3d_forgot_password.html` design.
        - Use the same glassmorphism design and icons.
    - [x] Update `app/auth/update-password/page.tsx`:
        - Match `screen3e_update_password.html` design.
        - Add confirm password field.
    - [ ] Update logout logic/UI if needed.
- [ ] **Favorites Feature (Rolled Back)**
    - [ ] Re-implement `toggleFavorite` server action.
    - [ ] Update `SongCard` with heart icon.
    - [ ] Update `app/songs/[id]/page.tsx` toggle.
    - [ ] Add "Favorites" filter to Library.
- [ ] **Infrastructure**
    - [x] Implement Vercel Speed Insights.
- [x] **Infrastructure: 3-Tier Environment**
    - [x] Define strategy: Local (dev), Staging (Preview), Prod (Live).
    - [x] Create `doc/guides/environment-setup.md` for manual user steps.
    - [x] Update `deploy-db.yml` to support Staging vs Prod deployments.
- [x] **Debug: Persistent Loading Hang**
    - [x] Investigate cause (Supabase client/session stall).
    - [x] Implement request timeout in `fetchSongs` to prevent UI freeze.
- [ ] **Debug: Update Password Stall**
    - [ ] Investigate `update-password/page.tsx`.
    - [ ] Add safety timeout and error handling.
- [x] **Fix: Migration Payload**
    - [x] Split `rename_musician_to_expert.sql` to avoid enum transaction error.
    - [x] Make policy migrations idempotent (`DROP POLICY IF EXISTS`).
    - [x] Fix idempotency for `add_is_public` and subsequent migrations.
- [x] **Fix: UI bugs**
    - [x] Sidebar active state for `/songs` and `/songs/add`.
- [x] **Fix: Song Deletion Permissions** (Added during execution)
- [ ] **Verification**
    - [x] Verify heart icons load promptly in song lists.
    - [x] Verify Magic Link flow.
    - [x] Verify Password login works.
    - [x] Verify Signup works with automatic Profile creation.
    - [x] Verify song owners can edit/delete their songs.

## Session Jan 31, 2026 (Auth Fixes & Role Switcher)

# Task: Address PR Feedback (Role Switcher)

## Repository State
- **Branch**: `chore/role-switcher`
- **Current Status**: All changes verified, including local Quick Login, Database Identities, and Redirects.

- [x] Fix "Connection Refused" by updating site_url to localhost <!-- id: 9 -->
- [x] Research PR comments (Check emails and security concerns) <!-- id: 0 -->
- [x] Configure Supabase email settings (Confirmations & Rate limits) <!-- id: 8 -->
- [x] Fix GoTrue Scan errors (NULL tokens) in `seed.sql` <!-- id: 7 -->
- [x] Fix "Database error querying schema" by linking auth identities <!-- id: 6 -->
- [x] Refactor mock data to `supabase/seed.sql` with randomization <!-- id: 3 -->
- [x] Create permanent cleanup migration for Production <!-- id: 4 -->

## Session Feb 1, 2026 (Category Browsing Design)

# Task: Design Explore by Category Screen (#44)

- [x] Create `screen7_explore_categories.html` with category grid <!-- id: 1 -->
- [x] Implement glassmorphism and flame aesthetic in the mockup <!-- id: 2 -->
- [x] Add subcategory tag cloud for each category <!-- id: 3 -->
- [x] Verify responsivity and visual consistency <!-- id: 4 -->
- [x] Create `screen8_category_detail.html` for filtered song list <!-- id: 6 -->
- [x] Implement category-specific header and active filter pills <!-- id: 7 -->
- [x] Integrate SongCard grid for results <!-- id: 8 -->
- [x] Run `/sync-artifacts` to update logbook <!-- id: 5 -->

# Task: Design 404 Error Screen

- [x] Research existing design system from `screen5_access_denied.html` <!-- id: 0 -->
- [x] Create `screen9_404_not_found.html` with mystical 404 theme <!-- id: 1 -->
- [x] Implement ambient glow and ember animations <!-- id: 2 -->
- [x] Add "Path Lost" copy and navigation back to home <!-- id: 3 -->
- [x] Verify visual consistency with the error screen set <!-- id: 4 -->
- [x] Run `/sync-artifacts` to update logbook <!-- id: 5 -->

# Task: Design Error Suite Mockups

- [x] Planning & Background Research <!-- id: 0 -->
    - [x] Analyze `screen9_404_not_found.html` for reusable components <!-- id: 1 -->
    - [x] Define thematic copy for each error state <!-- id: 2 -->
- [x] Implement Error Screens (Mockups) <!-- id: 3 -->
    - [x] `screen10_500_server_error.html` ("The Fire has Flickered") <!-- id: 4 -->
    - [x] `screen11_401_unauthorized.html` ("Approach the Hearth") <!-- id: 5 -->
    - [x] `screen12_429_too_many_requests.html` ("The Winds are Too Strong") <!-- id: 6 -->
    - [x] `screen13_503_maintenance.html` ("Tending the Sacred Fire") <!-- id: 7 -->
    - [x] `screen14_offline.html` ("Lost in the Wilderness") <!-- id: 8 -->
- [x] Verification & Documentation <!-- id: 9 -->
    - [x] Visually verify each screen via browser subagent <!-- id: 10 -->
    - [x] Update `master-walkthrough.md` with the new suite <!-- id: 11 -->
    - [x] Run `/sync-artifacts` <!-- id: 12 -->

# Task: Refine Song Detail Mockup

- [x] Planning & UI Analysis <!-- id: 13 -->
    - [x] Compare `screen2_song_detail.html` with provided screenshot <!-- id: 14 -->
    - [x] Create implementation plan for responsive layout <!-- id: 15 -->
- [x] Implement UI Updates <!-- id: 16 -->
    - [x] Create responsive container (sidebar + content) <!-- id: 17 -->
    - [x] Update title and badge styling <!-- id: 18 -->
    - [x] Add metadata (Key, Capo, Tuning) <!-- id: 19 -->
    - [x] Refine lyrics/chord display <!-- id: 20 -->
- [x] Verification & Documentation <!-- id: 21 -->
    - [x] Verify widescreen vs mobile view <!-- id: 22 -->
    - [x] Update walkthrough and sync artifacts <!-- id: 23 -->

# Task: Refine Song Detail Layout (Admin Navigation)

- [x] Planning & UI Adjustment <!-- id: 24 -->
    - [x] Analyze current header/sidebar structure <!-- id: 25 -->
    - [x] Update implementation plan for layout swap <!-- id: 26 -->
- [x] Implement Structural Changes <!-- id: 27 -->
    - [x] Move User Badge section to top of sidebar <!-- id: 28 -->
    - [x] Move Logo/Site Title to main page header <!-- id: 29 -->
    - [x] Clean up sidebar footer and mobile header alignment <!-- id: 30 -->
- [x] Verification <!-- id: 31 -->
    - [x] Verify layout on widescreen and mobile <!-- id: 32 -->
    - [x] Sync walkthrough and logbook <!-- id: 33 -->


# Task: Interlink and Refine Administrative Screens (Feb 1, 2026)

- [x] Planning & Audit <!-- id: 0 -->
    - [x] Read `screen1`, `screen2`, `screen7`, and `screen8` <!-- id: 1 -->
    - [x] Identify all navigation points needing inter-linking <!-- id: 2 -->
    - [x] Create implementation plan <!-- id: 3 -->
- [x] Rename "Settings" to "Playlists" <!-- id: 4 -->
    - [x] Update `screen1_home.html` <!-- id: 5 -->
    - [x] Update `screen2_song_detail.html` <!-- id: 6 -->
    - [x] Update `screen7_explore_categories.html` <!-- id: 7 -->
    - [x] Update `screen8_category_detail.html` <!-- id: 8 -->
- [x] Implement Inter-screen Links <!-- id: 9 -->
    - [x] Link Home -> Explore & Song Detail <!-- id: 10 -->
    - [x] Link Song Detail -> Home & Explore <!-- id: 11 -->
    - [x] Link Explore -> Category Detail <!-- id: 12 -->
    - [x] Link Category Detail -> Song Detail & Explore <!-- id: 13 -->
- [x] Verification & Sync <!-- id: 14 -->
    - [x] Verify links and renaming via browser <!-- id: 15 -->
    - [x] Update walkthrough and sync artifacts <!-- id: 16 -->
# Task: Interlink and Refine Administrative Screens

- [x] Planning & Audit <!-- id: 0 -->
    - [x] Read `screen1`, `screen2`, `screen7`, and `screen8` <!-- id: 1 -->
    - [x] Identify all navigation points needing inter-linking <!-- id: 2 -->
    - [x] Create implementation plan <!-- id: 3 -->
- [x] Rename "Settings" to "Playlists" <!-- id: 4 -->
    - [x] Update `screen1_home.html` <!-- id: 5 -->
    - [x] Update `screen2_song_detail.html` <!-- id: 6 -->
    - [x] Update `screen7_explore_categories.html` <!-- id: 7 -->
    - [x] Update `screen8_category_detail.html` <!-- id: 8 -->
- [x] Implement Inter-screen Links <!-- id: 9 -->
    - [x] Link Home -> Explore & Song Detail <!-- id: 10 -->
    - [x] Link Song Detail -> Home & Explore <!-- id: 11 -->
    - [x] Link Explore -> Category Detail <!-- id: 12 -->
    - [x] Link Category Detail -> Song Detail & Explore <!-- id: 13 -->
- [x] Verification & Sync <!-- id: 14 -->
    - [x] Verify links and renaming via browser <!-- id: 15 -->
    - [x] Update walkthrough and sync artifacts <!-- id: 16 -->
- [x] Refine Specific Navigation Links <!-- id: 17 -->
    - [x] Update `screen7_explore_categories.html` tags <!-- id: 18 -->
    - [x] Update `screen1_home.html` song cards <!-- id: 19 -->
    - [x] Update `screen8_category_detail.html` song cards <!-- id: 20 -->
# Task: Refine Sidebar and Create Library/Playlist Screens (Feb 1, 2026)

- [x] Planning & UI Audit <!-- id: 0 -->
    - [x] Analyze new menu requirements <!-- id: 1 -->
    - [x] Analyze "Library" screenshot <!-- id: 2 -->
    - [x] Create implementation plan <!-- id: 3 -->
- [x] Sidebar Menu Standardization <!-- id: 4 -->
    - [x] Update `screen1_home.html` <!-- id: 5 -->
    - [x] Update `screen2_song_detail.html` <!-- id: 6 -->
    - [x] Update `screen7_explore_categories.html` <!-- id: 7 -->
    - [x] Update `screen8_category_detail.html` <!-- id: 8 -->
    - [x] Update `actions/screen4_song_add.html` <!-- id: 9 -->
    - [x] Update auth and error screens (Minimalist - no sidebar needed) <!-- id: 10 -->
- [x] New Screen Implementation <!-- id: 11 -->
    - [x] Create `screen15_library.html` (Merge of screenshot + screen8) <!-- id: 12 -->
    - [x] Create `screen16_playlists.html` <!-- id: 13 -->
- [x] Final Interlinking and Verification <!-- id: 14 -->
    - [x] Verify all sidebar links <!-- id: 15 -->
    - [x] Sync artifacts and walkthrough <!-- id: 16 -->

- [x] Enhance Library Hub (Replace Screen 8) <!-- id: 17 -->
    - [x] Audit Screen 8 and Screen 15 differences <!-- id: 18 -->
    - [x] Update Library Hub (`screen15_library.html`) with category filters <!-- id: 19 -->
    - [x] Update Explore Category (`screen7_explore_categories.html`) links <!-- id: 20 -->
    - [x] Deprecate/Update references to `screen8_category_detail.html` <!-- id: 21 -->

# Task: Category Navigation & Library Refinement

- [x] Create `screen17_category_library.html` (Duplicate of Screen 15)
- [x] Implement Active Sidebar State for Categories
- [x] Implement Active Filter Pills for Categories
- [x] Populate Screen 17 with category-specific mock songs
- [x] Update `screen7_explore_categories.html`:
    - [x] Make entire category cards clickable
    - [x] Ensure sub-tags remain interactive (z-index fix)
    - [x] Link cards to `screen17_category_library.html`
- [x] Perform final artifact sync

# Task: Visual Polish & Mechanics (Feb 1, 2026)

- [x] **Song Detail Typography**:
    - [x] Import "JetBrains Mono" from Google Fonts.
    - [x] Apply fixed-width font to both Chords and Lyrics in `screen2_song_detail.html`.
    - [x] Ensure distinct `.font-lyrics` class usage.
- [x] **Category Logic Visuals**:
    - [x] Reset hardcoded highlighting in `screen17_category_library.html`.
    - [x] Implement "Match Any" badge in the sidebar header to explain OR logic.
- [x] **Artifact Sync**: Update logbooks and commit.
# Session Feb 1, 2026 (Sidebar & Library Implementation)

# Task: Align Mobile and Desktop design
- [x] Adapt Sidebar Menu Structure
    - [x] Rename "Browse Songs" to "Library"
    - [x] Add "Explore", "Playlist", "Add Song" links
    - [x] Correct Icons (Compass, Library, ListMusic, PlusCircle)
    - [x] Move User Profile to top (matching Design)
- [x] Enhance Library Hub (`/songs`)
    - [x] Implement Tag display in SongCards as colored pills
    - [x] Ensure Dynamic Filters appear in sidebar
    - [x] Pass category data to SongCard
- [x] Implement Static Playlists Page (`/playlists`)
    - [x] Create page with static placeholder data
    - [x] Apply consistent Fire/Water/Heart icons logic
- [x] Refine UI Styling
    - [x] Centralize category styling in `lib/uiUtils.ts`
    - [x] Update SongCard layout to match layout in Design
- [x] **Library Filter Design Refinement (Feb 1, 2026)**
    - [x] Implement Sticky Header with centered search bar.
    - [x] Implement multi-pill filter display for categories and tags.
    - [x] Add individual removal logic for filter pills.
    - [x] Restructure controls row with Sort, Visibility, and Chords/Melody filters.
    - [x] Remove notification bell from header.
- [x] **Simplified Navigation Refinement (Feb 1, 2026)**
    - [x] Implement fixed-width (260px) desktop sidebar.
    - [x] Remove collapse toggle for consistent identity.
    - [x] Hide site title on mobile header (logo only).
    - [x] Update mobile drawer to hover over content.
    - [x] Add close icon (PanelLeftClose) to mobile drawer.
    - [x] Adjust breakpoint from `md` to `lg` for navigation transition.
    - [x] Verify responsive transitions and song grid alignment.

## Session Feb 1, 2026 - Evening (UI & Guest Access)
- [x] **UI Polish: Song Detail Action Buttons**
    - [x] Relocate Action buttons to title row (Fixes overlap with User Menu).
    - [x] Integrate UserProfile fix for build success.
- [x] **Middleware: Guest Access Fix**
    - [x] Allow guest access to `/explore` and `/playlists` in `lib/supabase/proxy.ts`.
- [x] **Infrastructure: Production Repair**
    - [x] Repair production migration history (Remove ghost migration `20260201053000`).
    - [x] Apply `icon_name` column to production `categories` table.
- [x] **Documentation & Issue Tracking**
    - [x] Create GitHub Issue #50 for guest access fix.
    - [x] Update Epic & User Stories documentation.
- [x] **Final Sync**: Reconciled migration history manually via CLI.

- [x] **Session Feb 2, 2026 - Filters & Rebranding**
    - [x] **Rebranding: "Private" to "Draft"**
        - [x] Update `SongsPageContent.tsx` tabs and types.
        - [x] Update `SongCard.tsx` badge.
        - [x] Update `SongForm.tsx` action button.
        - [x] Update `user-guide.md` (v2.1).
    - [x] **Logic: Combinable URL Filters**
        - [x] Synchronize filter state with `useSearchParams`.
        - [x] Update `updateQuery` helper for URL persistence.
        - [x] Verify filter mixing (Category + Chords + Status).

- [x] **Session Feb 2, 2026 - Filters & Required Categories**
    - [x] Create migration script `20260202013000_add_required_categories.sql`
    - [x] Update consolidated `doc/design/db-schema.sql` (v2.5)
    - [x] Rebrand "Private" to "Draft" in UI and code
    - [x] Implement URL-driven combinable filters in `SongsPageContent.tsx`
    - [x] Verify categories and filters on staging
    - [x] Merge and push to `main`

- [x] **Refactor: Rename 'espanol' slug to 'spanish'**
    - [x] Create migration script.
    - [x] Update seed scripts.
    - [x] Update documentation (`db-schema.sql`).
- [x] **UI:** Style User Profile Pill to match Song Detail (Session: UI Polish)
- [x] **Feat:** Implement Draft Auto-Save (Story 1.1.7)
- [x] **Fix:** Update Song Detail page header to use shared UserProfile component (Session: UI Consistency)


- [x] **Session Feb 3, 2026 (Draft Auto-Save & User Profile)**

# Task: Implement Tag Editing in Song Form

- [x] **Planning**
    - [x] Analyze `SongForm.tsx` and submission logic
    - [x] Identify optimal UI for category selection
    - [x] Create implementation plan
- [x] **Execution**
    - [x] Create API/Action to fetch categories (`lib/actions/category.ts`)
    - [x] Update `SongForm.tsx` with category selector (`CategorySelector.tsx`)
    - [x] Update persistence logic to save `song_category_map`
    - [x] Handle `check_is_subcategory` constraint (Filtered query)
    - [x] **Fix RLS Policies**:- [x] Debug RLS Policy for `song_category_map` <!-- id: 4 -->
- [x] Make "Categories / Tags" section collapsible (default collapsed on Add, expanded if data exists) <!-- id: 5 -->
- [x] Implement Chord Highlighting in Lyrics Editor <!-- id: 6 -->
- [x] Refine Song Form Layout (Align upload link) <!-- id: 7 -->
- [x] Implement Draft Auto-Save <!-- id: 8 -->ssions.
- [x] **Verification**
    - [x] Verify adding a new song with tags
    - [x] Verify editing an existing song's tags
    - [x] Ensure validation passes (Browser UI check success)

- [x] **Creating GitHub Issue & Archiving Stories**
    - [x] Draft Issue content from `doc/design/epic&user stories.md`
    - [x] Create GitHub Issue for Story 1.1.7 (Issue #56)
    - [x] Append story to `doc/logbook/epic&user stories.md`
    - [x] Clear `doc/design/epic&user stories.md`


- [x] **Production Updates**
    - [x] Apply Migration `20260201135800_add_icon_name_to_categories.sql` (Verified Already Applied)
    - [x] Execute Seed `06_random_chords_melody.sql`
    - [x] Execute Seed `05_random_ownership.sql` (Adjusted for Prod IDs)

## Session Feb 4, 2026 (Production Sync & Database Reset)

- [x] **Audit and Sync Production Songs**
    - [x] Audit production songs against seed files
    - [x] Batch `supabase/seeds/04_songs_nina_urku.sql` for easier dashboard import
    - [x] Perform full production database reset and sync

### Session Feb 4, 2026 (Seed Refactor & Deterministic Visibility)

- [x] **Refactor Seed Data Visibility**
    - [x] Identify user IDs and roles
    - [x] Create implementation plan
    - [x] Update `supabase/seeds/03_songs_initial.sql` (42 private songs)
    - [x] Update `supabase/seeds/04_songs_nina_urku.sql` (179 public songs)
    - [x] Remove randomization from `05_random_ownership.sql` and `06_check_chords_melody.sql`
    - [x] Perform full database reset and verify counts (179 public / 42 private / 221 total)
# Task: Refactor Seed Data Visibility

- [/] **Planning**
    - [x] Identify user IDs and roles
    - [x] Create implementation plan
- [x] **Execution: Initial Songs (Private/Member)**
    - [x] Update `supabase/seeds/03_songs_initial.sql`
- [x] **Execution: Nina Urku Songs (Public/Musician)**
    - [x] Update `supabase/seeds/04_songs_nina_urku.sql`
- [x] **Execution: Remove Randomization**
    - [x] Refactor `supabase/seeds/05_random_ownership.sql`
    - [x] Refactor `supabase/seeds/06_check_chords_melody.sql` (Melody detection enabled)
- [x] **Verification**
    - [x] Run local database reset
    - [x] Verify composition counts by visibility
    - [x] Verify owner assignments
    - [x] Verify Library display on local dev
- [x] **Staging & PR**
    - [x] Resynchronize Git branches (switched to main)
    - [x] Repair Staging Database link (ghost migrations)
    - [x] Create GitHub PR for Seed Refactoring
    - [x] Create GitHub Issue for Caching Problem (#62)
# Task: Create Issue for ChordPro Spacing Bug

- [x] **Planning**
    - [x] Analyze bug report and screenshots
    - [x] Create issue draft
    - [x] Get user approval
    - [x] Create issue on GitHub
- [x] **Execution**
    - [x] Create GitHub Issue via CLI (#63)
    - [x] Clean up temporary files
- [x] **Documentation**
    - [x] Update master logbooks
# Task: Fix ChordPro Stanza Spacing Bug

- [x] **Planning**
    - [x] Research current ChordPro rendering implementation
    - [x] Create implementation plan
    - [x] Verify bug with local dev server
- [x] **Execution**
    - [x] Implement fix for whitespace preservation
    - [x] Verify fix visually in song detail view
- [/] **Documentation**
    - [ ] Update master logbooks
    - [ ] Create walkthrough
# Task: Implement Melody Badge Logic (#60)

- [x] **Planning**
    - [x] Research `has_melody` calculation in `SongForm.tsx`
    - [x] Create implementation plan
    - [x] Verify existing behavior on local dev
- [x] **Execution**
    - [x] Update `SongForm.tsx` to dynamically set `has_melody`
    - [x] Update any other relevant components (e.g., song list fetching)
    - [x] Verify fix visually in library and detail views

- [/] **Documentation**
    - [x] Update master logbooks
    - [x] Create walkthrough
    - [ ] Create Pull Request

# Task: Nina Urku Media Integration
- [x] Analyze category page structure and single page extraction logic
- [x] Create and run scraper for SoundCloud URLs (Found 34)
- [x] Update scraper to include YouTube ID extraction (Found 21+)
- [x] Generate and append SQL UPDATE seeds to `04_songs_nina_urku.sql`
- [x] Verify media linking for "Abuelito Tatewari" and "Abuelo (adida, adide)"

# Task: Song-Circle Scraping & Searchbar Refinement
- [x] Audit Song-Circle categories for Rainbow, Beija-flor, Condor, Halleluyah, Sufi, Bhajans
- [x] Create and refine `scripts/scrape_song_to_sql.js` for dynamic single song scraping
- [x] Extract Title, Author, Category, YouTube, and Lyrics from Song-Circle
- [x] Handle image download and SQL generation for Supabase import
- [x] Refactor `SearchBar` component to match library design
- [x] Unify search bar across Dashboard and Library pages
- [x] Update placeholder to "Search 200+ medicine songs..."
- [x] Handle TypeScript type mismatches for search state
- [x] Sync documentation to master logbooks
- [x] **Tag Filtering UI Improvements (Feb 7, 2026)**
    - [x] Implement dynamic tag search field with pills
    - [x] Implement autocompletion logic for tags
    - [x] Implement tag addition and removal logic
    - [x] Verify UI aesthetics and functionality in browser
- [x] **Refine Tag Filtering Layout (Feb 7, 2026)**
    - [x] Separate Tag Field from Search Bar
    - [x] Adjust height and placement of Tag Field
    - [x] Update JavaScript logic for separate fields
    - [x] Verify refined UI in browser
- [x] **Port Refined Tag Layout to Library Hub (Feb 7, 2026)**
    - [x] Port CSS Styles and Logic
    - [x] Implement 3-row header in screen15_library.html
    - [x] Sync Sidebar and Autocomplete interactions
    - [x] Verify in browser
- [x] **Sync Tag UI across Library Screens (Feb 7, 2026)**
    - [x] Port Tag UI to screen17_category_library.html
    - [x] Implement universal "Clear All" button across all relevant screens
    - [x] Ensure 3-row layout consistency
    - [x] Verify total synchronization in browser
- [x] **Implement Tag Filtering in React Code (Feb 7, 2026)**
    - [x] Create reusable `TagSelector.tsx` component
    - [x] Refactor `SongsPageContent.tsx` to 3-row header layout
    - [x] Integrate `TagSelector` and `fetchCategoryTree`
    - [x] **Granular Color Synchronization**: Mapped ALL tags (e.g. Fire, Water, Air) to a 12-color system in `uiUtils.ts`, ensuring unique colors within categories and exact parity with the sidebar indicators.
    - [x] Verify individual tag color consistency in browser
- [x] **Mobile Refinement & Tag Cleanup (Feb 7, 2026)**
    - [x] Fix vertical spacing between search and tag filter on mobile.
    - [x] Create and apply migration to remove deprecated tags (`andean`, `amazonian`, `native-american`, `medicine-songs`).
    - [x] Update `uiUtils.ts` to remove deprecated tag mappings.
    - [x] Implement "Enter to select top suggestion" in `TagSelector.tsx`.
    - [x] Verify all changes in the browser (Spacing, Cleanup, UX).

- [x] Implement Backspace-to-remove in `TagSelector.tsx` (Remove tags, then category)
- [x] Update `sync-artifacts` workflow to exclude Evidence sections
- [x] Verify Backspace behavior in browser
- [x] Update `sync-artifacts.md` to restrict execution to PR creation or pre-merge.

- [x] **Mobile Layout Refinement (Feb 17, 2026)**
    - [x] Fix mobile header overflow (title truncation & button spacing)
    - [x] Reorder mobile meta information (Title/Author grouping)
    - [x] Implement robust lyrics hanging indent (Flexbox approach)
    - [x] Update ChordPro parser with lyric atomization for better wrapping
- [x] Create issue for screen wake lock <!-- id: 0 -->
    - [x] Identify Epic and Story ID <!-- id: 1 -->
    - [x] Draft issue content with Gherkin AC <!-- id: 2 -->
    - [x] Review with user <!-- id: 3 -->
    - [x] Create GitHub issue <!-- id: 4 -->
    - [x] Sync `epic&user stories.md` <!-- id: 5 -->
- [x] Plan Screen Wake Lock solution <!-- id: 6 -->
    - [x] Research API and structure <!-- id: 7 -->
    - [x] Draft implementation plan <!-- id: 8 -->
- [x] Implement UserPreferencesContext <!-- id: 9 -->
- [x] Implement useWakeLock hook <!-- id: 10 -->
- [x] Implement Settings page with toggle <!-- id: 11 -->
- [x] Integrate with Song Detail page <!-- id: 12 -->
- [x] Fix local network connectivity issue <!-- id: 14 -->
- [x] Verify persistence and behavior <!-- id: 13 -->
- [x] Refine Settings UI for mobile <!-- id: 14 -->
    - [x] Replace manual toggle with standard `Switch` component <!-- id: 15 -->
- [x] Implement Sidebar Auto-Close on Mobile <!-- id: 16 -->
    - [x] Add close handler to main NavLinks
    - [x] Add close handler to Library browse filters
- [x] Merge `feat/72-screen-wake-lock` into `main` <!-- id: 17 -->

# Task: Simplify Home Page and Rename Links (Feb 23, 2026)
- [x] Remove Search box from Home page <!-- id: 18 -->
- [x] Rename "Browse Songs" card on Home to "Search Songs" <!-- id: 19 -->
- [x] Rename "Library" sidebar link to "Search Songs" <!-- id: 20 -->
- [x] Update documentation (User Guide, Analysis & Design, Stories) <!-- id: 21 -->
- [x] Update project walkthrough <!-- id: 22 -->


## Session: Feb 23, 2026
- [x] Fix ChordPro Editor vertical and horizontal scrolling misalignment.
- [x] Refactor ChordProEditor to use a unified scroll container to physically prevent scroll drift between textarea and backdrop.
- [x] Adjust SongDisplay chorus margin/padding for premium spacing on mobile and desktop.
- [x] Orient the 'Chorus' label vertically on mobile screens for visual consistency.
- [x] Remove excess margin on inline comments to ensure flush left alignment.


---

## Session Feb 26, 2026 — Server Components Migration & Audit

- [x] Discuss architecture: API routes vs Server Components vs Server Actions
- [x] Create `lib/songs/serverQueries.ts` — `fetchSongsServer()` and `fetchCategoryTreeServer()` using cookie-aware server Supabase client
- [x] Convert `app/page.tsx` to async Server Component — remove `useQuery`/`useAuth`/skeleton, fetch songs server-side
- [x] Convert `app/songs/page.tsx` to async Server Component — pre-fetch songs + taxonomy with `Promise.all`, pass as props
- [x] Update `SongsPageContent.tsx` — accept `initialSongs`/`initialTaxonomy` props, wire as `initialData` in React Query
- [x] Open PR #74 (`feat/server-components-data-fetching`)
- [x] Fix 406 Not Acceptable in `useAuth` — `.single()` → `.maybeSingle()` for profile fetch (handles missing profile row gracefully)
- [x] Audit implementation status of stories 1.1.4, 1.1.5, 1.1.6
- [x] Update `doc/logbook/epic&user stories.md` v1.22 — mark 1.1.4 [Partial], 1.1.5 [Not Implemented], 1.1.6 [Implemented]
## Session: Onboarding & Account Settings (Feb 5, 2026)
- [x] Update `app/auth/confirm/route.ts` defaults for signup/recovery
- [x] Update `SignUpForm.tsx` success redirect
- [x] Design "Finish Registration" mockup (`screen3f_finish_registration.html`)
- [x] Sync `doc/design/db-schema.sql` with `full_name` and `avatar_url`
- [x] Implement `FinishRegistrationForm.tsx` component
- [x] Create `/auth/finish-registration` page
- [x] Refine onboarding visuals (Embers, Alert style, Flame logo)
- [x] Finalize onboarding copy ("Welcome at the Fire")
- [ ] Design Account Settings mockup (`screen4_settings.html`) [/]
    - [x] Profile Tab (Removed Display Name, added Avatar controls)
    - [x] Account Tab (Email, Password, Logout)
    - [x] Privacy & Data Tab (Privacy, Data Takeout, Delete)
- [ ] Sync `application-analysis&design.md` with new settings architecture
