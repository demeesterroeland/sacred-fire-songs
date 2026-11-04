# Implementation Plan: Private Song Sharing & Recording Attribution

**Date:** November 4, 2026  
**Branch:** `feat/private-recording-sharing-attribution`  
**Target:** `develop`  
**Related Epic:** Epic 4.6 (Private Rehearsal & Audio Storage)  

---

## 1. Context & Objectives

Expand upon Epic 4.6 (Private Rehearsal & Audio Storage) to enable controlled private song recording sharing and singer attribution within the Sacred Fire Songs application.

### Key Capabilities
1. **User-to-User Private Sharing:**
   - Recording owners can share a private rehearsal recording with specific registered users by email or username search.
   - **Strict Permissions / DRM-lite:** Shared recipients can stream/listen to the recording, but are strictly prohibited from downloading the audio file and cannot reshare it with others.
2. **Public Publication with Singer Consent Disclaimer:**
   - Recording owners can transition a private recording to public visibility.
   - An explicit confirmation modal and disclaimer requires acknowledgement that the user has obtained consent/permission from the singer/musician before publishing.
3. **Singer Attribution & Musician Profile Linking:**
   - Optional attribution of the singer on a recording.
   - If the singer has a user account: display their verified musician badge and link to their musician profile (`/users/:id`).
   - If the singer is unregistered: display the attribution name and pending invite badge gracefully without crashing.

---

## 2. Architecture & Data Model

### Database Changes
Migration: `supabase/migrations/20261104160000_recording_sharing_and_attribution.sql`

- **Extended `public.user_recordings`:**
  - `is_public boolean NOT NULL DEFAULT false`
  - `singer_consent_confirmed boolean NOT NULL DEFAULT false`
  - `singer_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL`
  - `singer_name text`
  - `singer_email text`

- **New `public.recording_shares` table:**
  - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  - `recording_id uuid NOT NULL REFERENCES public.user_recordings(id) ON DELETE CASCADE`
  - `shared_with_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
  - `created_at timestamptz NOT NULL DEFAULT now()`
  - Unique constraint on `(recording_id, shared_with_user_id)`

- **Indexes:**
  - `idx_user_recordings_singer_profile_id`
  - `idx_user_recordings_public`
  - `idx_recording_shares_user`
  - `idx_recording_shares_recording`

- **Search RPC:**
  - `public.search_users_for_sharing(search_term text)`: returns registered user ID, email, and display name for sharing search autocomplete.

- **RLS & Security Policies:**
  - `recording_shares`:
    - Owners of recordings can SELECT, INSERT, and DELETE shares.
    - Recipients can SELECT rows where `shared_with_user_id = auth.uid()`.
  - `user_recordings`:
    - SELECT allowed for:
      1. Recording owner (`user_id = auth.uid()`)
      2. Recipients in `recording_shares`
      3. Anyone when `is_public = true` (including anonymous users)
    - UPDATE / DELETE strictly restricted to owner (`user_id = auth.uid()`).
  - Storage bucket (`storage.objects` for `rehearsals` bucket):
    - SELECT allows owners, recipients with shared records, or public recordings.
  - Profiles:
    - Limited read policies for attributed singers and shared recording contacts.

---

## 3. DRM-lite Protection Strategy

- **Download Enforcement:**
  - `getRecordingDownloadUrl` action verifies ownership (`user_id = auth.uid()`). If caller is only a recipient or guest, download is rejected with an error.
  - UI hides download buttons, edit/rename, and delete controls for non-owners.
- **Reshare Enforcement:**
  - `shareRecording` and `unshareRecording` actions verify ownership of the underlying recording before permitting changes to `recording_shares`.

---

## 4. Internationalization (i18n)

Dot-namespaced keys added to all 8 locales (`en`, `nl`, `es`, `fr`, `it`, `pt`, `qu`, `ru`) in `messages/*.ts`:
- `recording.sharing.*`: search, share button, shared with list, revoke, DRM-lite notices.
- `recording.publish.*`: modal title, description, singer consent disclaimer, confirm/cancel buttons, badges.
- `recording.attribution.*`: modal, autocomplete, unregistered toggle, verified/pending badges.
- `user.profile.*`: musician profile view and attributed recordings.

---

## 5. UI Components & Routing

- `components/song/RecordingShareModal.tsx`: User lookup autocomplete, current share list, revocation, DRM notices.
- `components/song/RecordingPublishModal.tsx`: Explicit singer consent disclaimer modal with required checkbox.
- `components/song/RecordingAttributionModal.tsx`: Registered musician autocomplete vs unregistered singer name/email.
- `components/song/RehearsalDrawer.tsx`: Integrated badges, DRM-lite action restrictions, and modal triggers into `SortableRecordingItem`.
- `components/profile/UserProfileView.tsx` & `app/users/[id]/page.tsx`: Public view for attributed musicians showing verified badges and attributed recordings.

---

## 6. Testing & Quality Verification

- **Unit Tests:** `testing/unit/tests/recordingSharing.test.ts` (12 tests) verifying permissions, consent enforcement, and DRM download rejection.
- **BDD Acceptance Scenarios:** `docs/testing/recording-sharing.feature` and `testing/bdd/steps/recording-sharing.steps.ts` (7 scenarios).
- **TypeScript:** `npx tsc --noEmit` cleanly passing.
- **Linting:** `npm run lint` cleanly passing at 201 warnings (below ratchet cap of 202).
- **CI & Policies:** Branch follows `feat/*` convention, ready for PR against `develop`.
