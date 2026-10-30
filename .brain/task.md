# Tasks: Implement Multi-Language Support (i18n) (#246)

## Overview
Implementation of lightweight custom i18n across the application without heavy external libraries or router rewriting.

---

### Task 1: Core i18n Engine & Architecture
- [x] **FINISHED**: Create core i18n module `lib/i18n/index.ts` with `t()`, `tWithLocale()`, and locale management.
- [x] **FINISHED**: Create primary dictionary `messages/en.ts` and translations in `messages/nl.ts`.
- [x] **FINISHED**: Create client-side `LocaleContext.tsx` with hydration safety and `localStorage` persistence.
- [x] **FINISHED**: Wrap application in `LocaleProvider` inside `app/layout.tsx`.

### Task 2: Auth Components & Pages
- [x] **FINISHED**: Migrate `components/login-form.tsx`
- [x] **FINISHED**: Migrate `components/sign-up-form.tsx`
- [x] **FINISHED**: Migrate `components/update-password-form.tsx`
- [x] **FINISHED**: Migrate `app/auth/error/page.tsx`
- [x] **FINISHED**: Migrate `app/auth/sign-up-success/page.tsx`
- [x] **FINISHED**: Migrate `components/forgot-password-form.tsx`
- [x] **FINISHED**: Migrate `components/finish-registration-form.tsx`

### Task 3: Navigation & Shell Components
- [x] **FINISHED**: Migrate `components/common/navigation/UserProfile.tsx` with Language Switcher (EN / NL)
- [x] **FINISHED**: Migrate `components/common/navigation/ThemeToggle.tsx`
- [x] **FINISHED**: Migrate `components/common/MobileBottomNav.tsx`
- [x] **FINISHED**: Migrate `components/common/Sidebar.tsx`
- [x] **FINISHED**: Migrate `components/common/Header.tsx`

### Task 4: Song Viewing & Display Components
- [x] **FINISHED**: Migrate `app/songs/[id]/page.tsx` (Song detail view, actions, delete dialog)
- [x] **FINISHED**: Migrate `components/song/SongDisplay.tsx`
- [x] **FINISHED**: Migrate `components/song/SongMetadataPills.tsx`
- [x] **FINISHED**: Migrate `components/song/SongTechnicalBadges.tsx`
- [x] **FINISHED**: Migrate `components/song/MediaEmbeds.tsx`
- [x] **FINISHED**: Migrate `components/song/RehearsalDrawer.tsx`
- [x] **FINISHED**: Migrate `components/song/AudioRecorder.tsx`

### Task 5: Song Management & Forms
- [x] **FINISHED**: Migrate `app/songs/SongsPageContent.tsx` (Song list & quick filter pills)
- [x] **FINISHED**: Migrate `app/songs/page.tsx`
- [x] **FINISHED**: Migrate `components/song/SongForm.tsx` (Add/Edit song form, category/status labels)
- [x] **FINISHED**: Migrate `app/songs/add/page.tsx`
- [x] **FINISHED**: Migrate `app/songs/[id]/edit/page.tsx`

### Task 6: Library, Playlists, Explore & Search Modal
- [/] **BUSY**: Migrate `components/library/SearchFiltersModal.tsx`
- [/] **BUSY**: Migrate `components/common/GlobalSearchModal.tsx`
- [/] **BUSY**: Migrate `components/library/TagSelector.tsx`
- [/] **BUSY**: Migrate `app/library/LibraryTabs.tsx`
- [/] **BUSY**: Migrate `app/library/page.tsx` & `app/library/layout.tsx`
- [/] **BUSY**: Migrate `app/library/playlists/page.tsx`
- [/] **BUSY**: Migrate `app/library/recently-viewed/page.tsx`
- [/] **BUSY**: Migrate `app/library/albums/page.tsx`
- [/] **BUSY**: Migrate `app/library/artists/ArtistsPageContent.tsx`
- [/] **BUSY**: Migrate `components/playlists/PlaylistDetailClient.tsx`
- [/] **BUSY**: Migrate `components/playlists/PlaylistDetailHeader.tsx`
- [/] **BUSY**: Migrate `components/playlists/CreatePlaylistInput.tsx`
- [/] **BUSY**: Migrate `components/playlists/PlaylistContextMenu.tsx`
- [/] **BUSY**: Migrate `components/playlists/AddSongsSheet.tsx`
- [/] **BUSY**: Migrate `components/playlists/PlaylistPicker.tsx`
- [/] **BUSY**: Migrate `app/explore/page.tsx`
- [/] **BUSY**: Migrate `app/page.tsx` (Home library summary)

### Task 7: Account Settings
- [x] **FINISHED**: Migrate `components/account/settings/AccountSettings.tsx`
- [x] **FINISHED**: Migrate `components/account/settings/ProfileSettings.tsx`
- [x] **FINISHED**: Migrate `components/account/settings/SecuritySettings.tsx`
- [x] **FINISHED**: Migrate `components/account/settings/PreferencesSettings.tsx`
- [x] **FINISHED**: Migrate `components/account/settings/PrivacySettings.tsx`
- [x] **FINISHED**: Migrate `app/account/settings/page.tsx`

### Task 8: Common Feedback, Modals & Error Pages
- [/] **BUSY**: Migrate `components/common/DeleteConfirmationModal.tsx`
- [/] **BUSY**: Migrate `components/common/feedback/NotFound.tsx`
- [/] **BUSY**: Migrate `components/common/feedback/AccessDenied.tsx`
- [/] **BUSY**: Migrate `components/common/feedback/UnderConstruction.tsx`
- [/] **BUSY**: Migrate `app/not-found.tsx`

### Task 9: Verification, Testing & Artifact Sync
- [ ] **NOT STARTED**: Run unit tests (`npm run test:unit`) & build check (`npm run build`)
- [ ] **NOT STARTED**: Sync logbook artifacts (`master-walkthrough.md`, `master-tasks.md`, `master-timetracking.md`)
