# Task: Implement public playlist curation (Story 3.4.6)

- [x] Check out implementation branch `feat/story-3.4.6-public-playlist-curation`
- [x] Create database migration `20260715173000_gatekeeper_public_playlists.sql` to add `'gatekeeper'` value to the `user_role` enum and define the update RLS policy for public setlists
- [x] Apply and verify the database migration on the remote DEV database
- [x] Update frontend role types (`UserRole`) and `MOCK_USERS` in `hooks/useAuth.tsx` to include `'gatekeeper'` and `'mock-gatekeeper'`
- [x] Update `MockRoleSwitcher.tsx` with a mock gatekeeper option for local development
- [x] Update server actions in `playlistActions.ts` with authorization helper `checkPlaylistModifyAccess` to grant curation capabilities on public playlists to Admin and Gatekeeper roles
- [x] Update frontend components `PlaylistDetailClient.tsx` and `PlaylistDetailHeader.tsx` to enable song addition, removal, reordering, and description editing for curators
- [x] Update `PlaylistPicker.tsx` to display and allow curators to select other users' public playlists
- [x] Seed local development auth and profiles seed files (`01_auth_users.sql` and `02_profiles.sql`) with the gatekeeper user details
- [x] Update consolidated schema document `docs/design/db-schema.sql`
- [x] Write E2E integration tests in `e2e/tests/public-playlist-curation.spec.ts` with self-contained pg setup blocks
- [x] Verify all unit tests and Playwright E2E tests pass successfully
- [x] Push the implementation branch and open Pull Request #200
