/**
 * Fixed fixture ids shared by specs and e2e/global-teardown.ts, so desktop and
 * mobile projects upsert the same rows and the teardown can remove them.
 */
export const ADMIN_USERS_FIXTURE_IDS = {
  song: 'eeeeeeee-3610-4000-a000-000000000001',
  version: 'eeeeeeee-3610-4000-a000-000000000002',
  playlist: 'eeeeeeee-3610-4000-a000-000000000003',
} as const;
