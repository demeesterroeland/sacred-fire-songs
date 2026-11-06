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

/**
 * Story 6.1.16 / G4.3 (#400): a song with one public take of the member, shared with
 * two people and attributed to a singer without an account. Removed by
 * e2e/global-teardown.ts.
 */
export const TAKE_STATUS_FIXTURE_IDS = {
  song: 'eeeeeeee-3616-4000-a000-000000000001',
  version: 'eeeeeeee-3616-4000-a000-000000000002',
  take: 'eeeeeeee-3616-4000-a000-000000000003',
} as const;

/**
 * Story 6.1.17 / G4.4 (#401): a song with one private take of the member, for the
 * take action sheet. Removed by e2e/global-teardown.ts.
 */
export const TAKE_ACTIONS_FIXTURE_IDS = {
  song: 'eeeeeeee-3617-4000-a000-000000000001',
  version: 'eeeeeeee-3617-4000-a000-000000000002',
  take: 'eeeeeeee-3617-4000-a000-000000000003',
} as const;

/**
 * Story 6.1.18 / G4.5 (#402): a private song owned by the member with one take of the member.
 * The spec makes the song public while it runs and resets it first. Removed by
 * e2e/global-teardown.ts.
 */
export const SHARE_EXPLAIN_FIXTURE_IDS = {
  song: 'eeeeeeee-3618-4000-a000-000000000001',
  version: 'eeeeeeee-3618-4000-a000-000000000002',
  take: 'eeeeeeee-3618-4000-a000-000000000003',
} as const;

/**
 * Story 6.1.19 / G4.6 (#403): a song with one take owned by the gatekeeper and shared with
 * the member, for the "Shared with me" journey. Removed by e2e/global-teardown.ts.
 */
export const SHARED_WITH_ME_FIXTURE_IDS = {
  song: 'eeeeeeee-3619-4000-a000-000000000001',
  version: 'eeeeeeee-3619-4000-a000-000000000002',
  take: 'eeeeeeee-3619-4000-a000-000000000003',
} as const;

/**
 * Story 6.1.11 / G2.6 (#395): a public song with two versions (Original, Simplified) and a public
 * song with a single version, for the version switch under the title. Removed by
 * e2e/global-teardown.ts.
 */
export const VARIANT_SLOT_FIXTURE_IDS = {
  song: 'eeeeeeee-3611-4000-a000-000000000001',
  original: 'eeeeeeee-3611-4000-a000-000000000002',
  simplified: 'eeeeeeee-3611-4000-a000-000000000003',
  singleSong: 'eeeeeeee-3611-4000-a000-000000000004',
  singleVersion: 'eeeeeeee-3611-4000-a000-000000000005',
  // Edit round trip: "Original" has chords, "Simplified" is lyrics only.
  flagsSong: 'eeeeeeee-3611-4000-a000-000000000006',
  flagsOriginal: 'eeeeeeee-3611-4000-a000-000000000007',
  flagsSimplified: 'eeeeeeee-3611-4000-a000-000000000008',
} as const;
