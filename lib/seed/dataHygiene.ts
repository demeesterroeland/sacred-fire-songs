/**
 * Demo-data hygiene (Epic 6.1, Story 6.1.33 / G9.1, #417): titles that mark
 * rows created by E2E or smoke tests. Such rows must never be in the demo seed
 * and E2E runs must delete the ones they create (e2e/global-teardown.ts).
 */
export const TEST_TITLE_MARKERS = ['E2E', 'Smoke Test'] as const;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True when `title` contains one of `markers` as whole words (case-insensitive). */
export function isTestFixtureTitle(
  title: string,
  markers: readonly string[] = TEST_TITLE_MARKERS,
): boolean {
  return markers.some((m) => new RegExp(`\\b${escapeRegExp(m)}\\b`, 'i').test(title));
}
