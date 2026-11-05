/**
 * Demo-data hygiene (Epic 6.1, Story 6.1.33 / G9.1, #417): titles that mark
 * rows created by E2E or smoke tests. Such rows must never be in the demo seed
 * and E2E specs must delete the ones they create.
 */
export const TEST_TITLE_MARKERS = ['E2E', 'Smoke Test'] as const;

/** True when a playlist/song title looks like a test fixture (case-insensitive, whole word for "E2E"). */
export function isTestFixtureTitle(title: string): boolean {
  return /\bE2E\b/i.test(title) || /\bsmoke test\b/i.test(title);
}
