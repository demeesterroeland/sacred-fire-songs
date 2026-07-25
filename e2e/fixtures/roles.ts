import path from 'path';

/**
 * Storage-state directory for per-role authenticated sessions.
 * Populated by e2e/auth.setup.ts and git-ignored.
 * Resolved from the repo root (Playwright runs from there).
 */
export const STORAGE_DIR = path.join(process.cwd(), 'e2e', '.auth');

/**
 * Seeded local-dev accounts (see supabase/seeds/01_auth_users.sql &
 * 02_profiles.sql). All share the same dev password.
 *
 * NOTE: there is no seeded Gatekeeper account yet. When gatekeeper seed data
 * lands (Epic 3.4), add it here and to auth.setup.ts so GK-* specs can run.
 */
export const ROLES = {
  admin: {
    email: 'roel.de.meester+admin@gmail.com',
    storage: path.join(STORAGE_DIR, 'admin.json'),
  },
  gatekeeper: {
    email: 'roel.de.meester+gatekeeper@gmail.com',
    storage: path.join(STORAGE_DIR, 'gatekeeper.json'),
  },
  musician: {
    email: 'roel.de.meester+expert@gmail.com',
    storage: path.join(STORAGE_DIR, 'musician.json'),
  },
  member: {
    email: 'roel.de.meester+member@gmail.com',
    storage: path.join(STORAGE_DIR, 'member.json'),
  },
} as const;

export type RoleKey = keyof typeof ROLES;

/** Dev password from env, with the seeded default as a fallback. */
export const TEST_PASSWORD =
  process.env.NEXT_PUBLIC_DEV_TEST_PASSWORD ?? 'sacred-fire-dev';
