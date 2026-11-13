import path from 'path';

/**
 * Storage-state directory for per-role authenticated sessions.
 * Populated by e2e/auth.setup.ts and git-ignored.
 * Resolved from the repo root (Playwright runs from there).
 */
export const STORAGE_DIR = path.join(process.cwd(), 'e2e', '.auth');

/**
 * Seeded local-dev accounts (see supabase/seeds/01_auth_users.sql &
 * 02_profiles.sql). Locally they all share the same dev password; a shared
 * environment can give each role its own password via `passwordEnv`
 * (see passwordFor).
 *
 * NOTE: there is no seeded Gatekeeper account yet. When gatekeeper seed data
 * lands (Epic 3.4), add it here and to auth.setup.ts so GK-* specs can run.
 */
export const ROLES = {
  admin: {
    email: 'admin@sfs.example',
    storage: path.join(STORAGE_DIR, 'admin.json'),
    passwordEnv: 'E2E_PASSWORD_ADMIN',
  },
  gatekeeper: {
    email: 'gatekeeper@sfs.example',
    storage: path.join(STORAGE_DIR, 'gatekeeper.json'),
    passwordEnv: 'E2E_PASSWORD_GATEKEEPER',
  },
  musician: {
    email: 'expert@sfs.example',
    storage: path.join(STORAGE_DIR, 'musician.json'),
    passwordEnv: 'E2E_PASSWORD_MUSICIAN',
  },
  member: {
    email: 'member@sfs.example',
    storage: path.join(STORAGE_DIR, 'member.json'),
    passwordEnv: 'E2E_PASSWORD_MEMBER',
  },
} as const;

export type RoleKey = keyof typeof ROLES;

/** Shared dev password from env, with the seeded default as a fallback. */
export const TEST_PASSWORD =
  process.env.NEXT_PUBLIC_DEV_TEST_PASSWORD ?? 'sacred-fire-dev';

/** Password for one role: its own env var if set, else the shared one. */
export function passwordFor(role: RoleKey): string {
  return process.env[ROLES[role].passwordEnv] || TEST_PASSWORD;
}
