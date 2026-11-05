/**
 * Fixed fixture ids shared by specs and e2e/global-teardown.ts, so desktop and
 * mobile projects upsert the same rows and the teardown can remove them.
 */
export const ADMIN_USERS_FIXTURE_IDS = {
  song: 'eeeeeeee-3610-4000-a000-000000000001',
  version: 'eeeeeeee-3610-4000-a000-000000000002',
  playlist: 'eeeeeeee-3610-4000-a000-000000000003',
} as const;

/**
 * Story 6.1.15 / G4.2 (#399): a song with one take owned by the gatekeeper and
 * shared with the member, plus one take owned by the member. Removed by
 * e2e/global-teardown.ts.
 */
export const SHARED_TAKES_FIXTURE_IDS = {
  song: 'eeeeeeee-3615-4000-a000-000000000001',
  version: 'eeeeeeee-3615-4000-a000-000000000002',
  sharedTake: 'eeeeeeee-3615-4000-a000-000000000003',
  ownTake: 'eeeeeeee-3615-4000-a000-000000000004',
} as const;
