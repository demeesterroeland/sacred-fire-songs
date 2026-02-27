# Test Cases: Sacred Fire Songs

**Version:** 1.9
**Status:** Draft
**Date:** February 1, 2026

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Dec 25, 2025 | Initial Document Creation. Derived test cases from Epics/Stories. |
| **1.1** | Dec 29, 2025 | Updated test examples to use real songs from `data/songs` (Agüita, Pachamama, Espíritu del agua). |
| **1.2** | Dec 29, 2025 | Cleaned up song titles in examples (removed file prefixes like "43."). |
| **1.3** | Dec 29, 2025 | Added TC-1.3.4 for Logo Navigation. |
| **1.4** | Dec 29, 2025 | Added TC-1.1.4 for Guest Upload Prompt. |
| **1.5** | Jan 10, 2026 | Changed project name to Sacred Fire Songs. |
| **1.6** | Jan 10, 2026 | Updated cases for Member Uploads and Owner Editing. |
| **1.7** | Jan 10, 2026 | Refactored "Upload" terminology to "Add Song". |
| **1.8** | Jan 10, 2026 | Added test cases for Non-Owner restriction and Admin override. |
| **1.9** | Feb 1, 2026 | Added comprehensive test cases for unified header, environment labels, navigation refactoring, mobile menu, and dynamic filtering. |

This document contains the test cases derived from the project's Epics and User Stories. These cases are intended for both manual verification and as a blueprint for future automated testing.

## Phase 1: MVP - Core Management & Public Library

### 1.1 Song Management (Admin)

#### TC-1.1.1: Member adds valid ChordPro file
- **User Story**: 1.1.1
- **Pre-conditions**: Member is logged in, "Add Song" page is open.
- **Steps**:
    1. Select a valid `.cho` file (e.g., `43_Aguida.cho`).
    2. Click "Add Song".
- **Expected Results**:
    - "Song Added Successfully" message appears.
    - New song entry is created in the database.
    - Song title "Agüita" is visible in the library.

#### TC-1.1.2: Admin deletes a song
- **User Story**: 1.1.2
- **Pre-conditions**: Admin is logged in, viewing the song list.
- **Steps**:
    1. Click the "Delete" icon on a specific song (e.g., "Pachamama").
    2. Confirm the deletion in the modal.
- **Expected Results**:
    - The song is removed from the database.
    - The song no longer appears in the library list.

#### TC-1.1.3: Admin Login
- **User Story**: 1.1.4
- **Pre-conditions**: On the Login page.
- **Steps**:
    1. Enter valid admin credentials.
    2. Click "Sign In".
- **Expected Results**:
    - Redirected to the Home page.
    - Admin controls (Upload, Delete) are visible.

#### TC-1.1.4: Guest tries to add song
- **User Story**: 1.1.5
- **Pre-conditions**: Unauthenticated (Guest).
- **Steps**:
    1. Click the "Add Song" icon in the header.
- **Expected Results**:
    - A prompt appears: "Please join our circle to share medicine."
    - Links to Login/Signup are visible.

### 1.2 Public Library & Discovery

#### TC-1.2.1: Guest views song library
- **User Story**: 1.2.1
- **Pre-conditions**: Unauthenticated guest visits the site.
- **Steps**:
    1. Navigate to the Home page.
- **Expected Results**:
    - List of songs is visible.
    - Each song card shows Title and Author.
    - Infinite scroll/pagination works as expected.
    - Dashboard options "Add Song", "Browse", "Settings" are visible (if on Home).

#### TC-1.2.2: Search for a song
- **User Story**: 1.2.2
- **Pre-conditions**: Songs "Espíritu del agua" and "Pachamama" exist.
- **Steps**:
    1. Type "Espíritu" into the search bar.
- **Expected Results**:
    - "Espíritu del agua" is displayed.
    - "Pachamama" is hidden.

### 1.3 Basic Song Viewer

#### TC-1.3.1: Render ChordPro chords
- **User Story**: 1.3.1
- **Pre-conditions**: View "Agüita" with content `[Bm]Agüitay, [A]agüita`.
- **Steps**:
    1. Open the Song Detail page for "Agüita".
- **Expected Results**:
    - The chord "Bm" is rendered above the word "Agüitay".
    - The chord "A" is rendered above the word "agüita".

#### TC-1.3.2: Audio reference playback
- **User Story**: 1.3.2
- **Pre-conditions**: Song has a valid `audio_url`.
- **Steps**:
    1. Open the Song Detail page.
- **Expected Results**:
    - Embedded audio player (SoundCloud/Spotify) is visible and playable.

#### TC-1.3.3: Navigate back to Home (Back Arrow)
- **User Story**: 1.3.3
- **Pre-conditions**: On the Song Detail page.
- **Steps**:
    1. Click the "Back" arrow in the header.
- **Expected Results**:
    - Redirected to the Home page.

#### TC-1.3.4: Navigate Home via Logo
- **User Story**: 1.3.3
- **Pre-conditions**: On any page (e.g., /admin/upload or /songs/123).
- **Steps**:
    1. Click the "Sacred Fire Songs" logo or the text title in the header.
- **Expected Results**:
    - Redirected to the Home page (`/`).

#### TC-1.3.5: YouTube Video
- **User Story**: 1.3.3 (New)
- **Pre-conditions**: Song has `youtube_url`.
- **Steps**:
    1. View Song Detail.
- **Expected Results**:
    - Embedded YouTube player is visible.

## Phase 2: MLP - Music Tools & rich Editing

### 2.1 Music Tools

#### TC-2.1.1: Transpose chords
- **User Story**: 2.1.1
- **Steps**:
    1. Open Song Detail.
    2. Click "Transpose +1".
- **Expected Results**:
    - Chords shift up by one semitone (e.g., Bm -> Cm).

#### TC-2.1.2: Render Sheet Music (ABC Notation)
- **User Story**: 2.1.2
- **Pre-conditions**: Song has ABC notation data.
- **Steps**:
    1. View Song Detail.
- **Expected Results**:
    - A musical staff is rendered.

#### TC-2.1.3: Play melody synthesizer
- **User Story**: 2.1.3
- **Steps**:
    1. Click "Play Melody".
- **Expected Results**:
    - Synthesized audio plays.
    - Visual cursor follows the notes.

### 2.2 Rich Editing

#### TC-2.2.1: Member edits their own song
- **User Story**: 2.2.1
- **Pre-conditions**: Member is logged in and is the owner of the song.
- **Steps**:
    1. Click "Edit" on a song.
    2. Modify lyrics/chords in the text area.
    3. Save.
- **Expected Results**:
    - Changes saved to database and reflected in viewer.

#### TC-2.2.2: Non-owner cannot edit
- **User Story**: 2.2.1
- **Pre-conditions**: Member is logged in but is NOT the owner of the song.
- **Steps**:
    1. View a song owned by another user.
- **Expected Results**:
    - The "Edit Song" button is NOT visible.
    - Direct access to `/songs/[id]/edit` shows an error or redirects.

#### TC-2.2.3: Admin can edit any song
- **User Story**: 2.2.1
- **Pre-conditions**: User is logged in as Admin.
- **Steps**:
    1. View a song owned by a Member.
    2. Click "Edit Song".
- **Expected Results**:
    - Edit form opens.
    - Changes can be saved successfully.

### 2.3 Taxonomy

#### TC-2.3.1: Filter by Category
- **User Story**: 2.3.1
- **Steps**:
    1. Select "Water" from filter menu.
- **Expected Results**:
    - Only "Water" themed songs are shown.

#### TC-2.3.2: Open Filter Menu (Hamburger)
- **User Story**: 2.3.2
- **Pre-conditions**: On Song List page.
- **Steps**:
    1. Click hamburger menu.
- **Expected Results**:
    - Side drawer opens with filter options.

### 2.4 Desktop Experience

#### TC-4.4.1: Desktop Layout
- **User Story**: 4.4.1
- **Pre-conditions**: Viewport width > 1024px.
- **Steps**:
    1. View Song List.
- **Expected Results**:
    - Grid layout or multi-column view.
    - Permanent sidebar navigation.


### 2.5 Navigation & UI Components

#### TC-2.5.1: Unified Header Display
- **User Story**: Navigation Refactoring
- **Pre-conditions**: User is on any page of the application.
- **Steps**:
    1. Navigate to Dashboard (`/`).
    2. Navigate to Library (`/songs`).
    3. Navigate to Explore (`/explore`).
- **Expected Results**:
    - Header displays "Sacred Fire Songs" logo and title on all pages.
    - Dynamic subtitle changes based on current page (e.g., "DASHBOARD", "LIBRARY", "EXPLORE").
    - Header is responsive and visible on both desktop and mobile.

#### TC-2.5.2: Environment Label Display
- **User Story**: Environment Awareness
- **Pre-conditions**: Application running in development or preview environment.
- **Steps**:
    1. Run application locally (`npm run dev`).
    2. Check header and mobile menu.
- **Expected Results**:
    - Blue pill with "(local)" label appears next to site title in development.
    - Amber pill with "(preview)" label appears in Vercel preview deployments.
    - No label appears in production environment.

#### TC-2.5.3: Desktop Sidebar Navigation
- **User Story**: Navigation Refactoring
- **Pre-conditions**: Desktop viewport (width > 768px), user is logged in.
- **Steps**:
    1. View the sidebar on the left side of the screen.
    2. Click each navigation item (Dashboard, Explore, Library, Playlist, Add Song).
- **Expected Results**:
    - User profile (avatar, email, logout button) is visible at the top of sidebar.
    - All navigation items are visible with correct icons.
    - Active navigation item is highlighted with red icon and gray background.
    - Clicking each item navigates to the correct page.
    - LibrarySidebar filters appear when on `/songs` or `/explore` pages.

#### TC-2.5.4: Mobile Menu Navigation
- **User Story**: Mobile Menu Synchronization
- **Pre-conditions**: Mobile viewport (width ≤ 768px), user is logged in.
- **Steps**:
    1. Click the hamburger menu icon in the header.
    2. Verify menu contents.
    3. Click each navigation item.
- **Expected Results**:
    - Mobile menu slides in from the right.
    - User profile is visible at the top of the menu.
    - Environment label appears next to "Menu" title.
    - All navigation items match desktop sidebar (same icons, labels, order).
    - Active item is highlighted consistently with desktop.
    - Menu closes after clicking a navigation item.

#### TC-2.5.5: User Profile Display
- **User Story**: Navigation Refactoring
- **Pre-conditions**: User is logged in.
- **Steps**:
    1. View user profile in desktop sidebar.
    2. View user profile in mobile menu.
- **Expected Results**:
    - Avatar displays first letter of user's email in uppercase.
    - User's email (or username) is displayed.
    - Logout button is visible and functional.
    - Profile appearance is consistent between desktop and mobile.

#### TC-2.5.6: Navigation Active State
- **User Story**: Navigation Refactoring
- **Pre-conditions**: User navigates between pages.
- **Steps**:
    1. Navigate to Dashboard (`/`).
    2. Navigate to Library (`/songs`).
    3. Navigate to Add Song (`/songs/add`).
    4. Navigate to a specific song detail page.
- **Expected Results**:
    - Dashboard is active only on `/` (exact match).
    - Library is active on `/songs` but NOT on `/songs/add`.
    - Add Song is active on `/songs/add`.
    - Library remains active when viewing song detail pages.

### 2.6 Dynamic Filtering & Taxonomy

#### TC-2.6.1: Category Filter (OR Logic)
- **User Story**: 2.3.1
- **Pre-conditions**: User is on Library (`/songs`) or Explore (`/explore`) page.
- **Steps**:
    1. Click "Nature" category in the LibrarySidebar.
    2. Verify URL updates to `?category=nature`.
    3. Click a different category (e.g., "The Elements").
- **Expected Results**:
    - Only songs with the selected category are displayed.
    - URL updates to reflect the active category.
    - Selecting a new category replaces the previous one (OR logic).
    - Active category is highlighted in the sidebar.

#### TC-2.6.2: Tag Filter (AND Logic)
- **User Story**: 2.3.1
- **Pre-conditions**: User is on Library (`/songs`) page with category selected.
- **Steps**:
    1. Select "Nature" category.
    2. Click "Water" tag.
    3. Click "Plantas" tag.
- **Expected Results**:
    - URL updates to `?category=nature&tag=water,plantas`.
    - Only songs matching the category AND all selected tags are displayed.
    - Multiple tags can be selected (AND logic).
    - Active tags are highlighted as pills in the sidebar.

#### TC-2.6.3: Clear Filters
- **User Story**: 2.3.1
- **Pre-conditions**: User has active category and tag filters.
- **Steps**:
    1. Click the "X" button on an active filter pill in the main content area.
    2. Click "Clear All" if available.
- **Expected Results**:
    - Clicking "X" on a category pill clears the category filter.
    - Clicking "X" on a tag pill removes that specific tag.
    - URL updates to reflect removed filters.
    - All songs are displayed when all filters are cleared.

#### TC-2.6.4: Filter Persistence Across Navigation
- **User Story**: 2.3.1
- **Pre-conditions**: User has active filters on Library page.
- **Steps**:
    1. Apply category "Nature" and tag "Water" filters.
    2. Navigate to a song detail page.
    3. Click back to Library.
- **Expected Results**:
    - Filters are preserved in the URL.
    - Same filtered results are displayed upon return.
    - LibrarySidebar shows the same active filters.

#### TC-2.6.5: Explore Page Category Grid
- **User Story**: 2.3.1
- **Pre-conditions**: User is on Explore (`/explore`) page.
- **Steps**:
    1. View the category grid.
    2. Click on a category card (e.g., "The Elements").
- **Expected Results**:
    - All top-level categories are displayed as cards with icons and colors.
    - Clicking a category navigates to `/songs?category=the-elements`.
    - LibrarySidebar appears showing subcategories and tags.

#### TC-2.6.6: LibrarySidebar Visibility
- **User Story**: 2.3.2
- **Pre-conditions**: User navigates between different pages.
- **Steps**:
    1. Navigate to Dashboard (`/`).
    2. Navigate to Library (`/songs`).
    3. Navigate to Explore (`/explore`).
    4. Navigate to Playlists (`/playlists`).
- **Expected Results**:
    - LibrarySidebar is NOT visible on Dashboard.
    - LibrarySidebar IS visible on Library page.
    - LibrarySidebar IS visible on Explore page.
    - LibrarySidebar is NOT visible on Playlists page.

#### TC-2.6.7: Filter Pills Styling
- **User Story**: UI/UX Consistency
- **Pre-conditions**: User has active filters.
- **Steps**:
    1. Apply multiple category and tag filters.
    2. Observe the visual styling of active vs inactive filters.
- **Expected Results**:
    - Active filters have colored backgrounds matching their category color.
    - Active filters have white text and are more prominent.
    - Inactive filters have transparent backgrounds with colored borders.
    - Hover states provide visual feedback.

### 2.7 Responsive Design & Mobile Experience

#### TC-2.7.1: Mobile Header Responsiveness
- **User Story**: Header Unification
- **Pre-conditions**: Mobile viewport (width ≤ 768px).
- **Steps**:
    1. View header on mobile device.
    2. Navigate between pages.
- **Expected Results**:
    - Logo and title are visible and properly sized.
    - Hamburger menu icon is visible on the right.
    - Dynamic subtitle updates based on current page.
    - Environment label is visible if in dev/preview mode.

#### TC-2.7.2: Desktop Sidebar Persistence
- **User Story**: Desktop Experience
- **Pre-conditions**: Desktop viewport (width > 768px).
- **Steps**:
    1. Navigate between different pages.
    2. Scroll down on a long page.
- **Expected Results**:
    - Sidebar remains visible and sticky on the left.
    - Sidebar does not scroll with page content.
    - Navigation items remain accessible at all times.

#### TC-2.7.3: Mobile Menu Overlay
- **User Story**: Mobile Menu
- **Pre-conditions**: Mobile viewport, menu is open.
- **Steps**:
    1. Open mobile menu.
    2. Click on the backdrop (dark overlay).
    3. Click the X button.
- **Expected Results**:
    - Dark backdrop appears behind the menu.
    - Clicking backdrop closes the menu.
    - Clicking X button closes the menu.
    - Body scroll is disabled when menu is open.

#### TC-2.7.4: Suspense Boundaries
- **User Story**: Performance & UX
- **Pre-conditions**: User navigates to pages with dynamic data.
- **Steps**:
    1. Navigate to Library (`/songs`) page.
    2. Observe loading states.
- **Expected Results**:
    - "Loading filters..." message appears briefly while LibrarySidebar loads.
    - Page content loads without blocking on filter data.
    - No console errors related to useSearchParams.

## Phase 3: Community & Evolution
