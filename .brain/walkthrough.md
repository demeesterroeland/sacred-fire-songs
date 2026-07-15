## 2026-07-15 (Implement Public Playlist Curation)

### 1. Database Schema & RLS Policy
- Created migration [20260715173000_gatekeeper_public_playlists.sql](file:///home/roeland/projects/sacred-fire-songs/supabase/migrations/20260715173000_gatekeeper_public_playlists.sql) to add `'gatekeeper'` to the database enum type `user_role` and define an update policy for `public.setlists` allowing curators (Admins and Gatekeepers) to edit public playlists.
- Updated the consolidated master schema file [db-schema.sql](file:///home/roeland/projects/sacred-fire-songs/docs/design/db-schema.sql) with the new role and setlist policies.

### 2. Frontend Authentication & Developer Tools
- Updated the frontend role union type `UserRole` and `MOCK_USERS` in [useAuth.tsx](file:///home/roeland/projects/sacred-fire-songs/hooks/useAuth.tsx) to add the `'gatekeeper'` role and its mock user details.
- Registered the `'mock-gatekeeper'` option inside the developer switcher component [MockRoleSwitcher.tsx](file:///home/roeland/projects/sacred-fire-songs/components/dev/MockRoleSwitcher.tsx).
- Updated local seeding files [01_auth_users.sql](file:///home/roeland/projects/sacred-fire-songs/supabase/seeds/01_auth_users.sql) and [02_profiles.sql](file:///home/roeland/projects/sacred-fire-songs/supabase/seeds/02_profiles.sql) to seed the gatekeeper user.

### 3. Server Actions Authorization & Client Integration
- Introduced a `checkPlaylistModifyAccess` helper inside [playlistActions.ts](file:///home/roeland/projects/sacred-fire-songs/app/actions/playlistActions.ts) to authorize modifications on public playlists by curators. Used it in all update/reorder/song list mutation actions.
- Configured [PlaylistDetailClient.tsx](file:///home/roeland/projects/sacred-fire-songs/components/playlists/PlaylistDetailClient.tsx) and [PlaylistDetailHeader.tsx](file:///home/roeland/projects/sacred-fire-songs/components/playlists/PlaylistDetailHeader.tsx) to read and utilize the `isCurator` permission for rendering edit buttons, drag-and-drop handles, and description inputs.
- Modified [PlaylistPicker.tsx](file:///home/roeland/projects/sacred-fire-songs/components/playlists/PlaylistPicker.tsx) to query other users' public playlists if the logged-in user is a curator.

### 4. Testing & Verification
- Created Playwright E2E integration test suite [public-playlist-curation.spec.ts](file:///home/roeland/projects/sacred-fire-songs/e2e/tests/public-playlist-curation.spec.ts) covering Gatekeeper description editing, song addition, private playlist access checks, and Member restriction validations.
- Successfully verified that all unit tests and all Playwright tests pass against the remote test database.
