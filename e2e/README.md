# E2E Tests (Playwright)

End-to-end tests for Sacred Fire Songs. The full coverage plan lives in
[`docs/testing/e2e-test-overview.md`](../docs/testing/e2e-test-overview.md);
this directory is the **Phase 0 foundation** plus the first P0 smoke specs.

## Layout

```
e2e/
  auth.setup.ts        # logs in each seeded role, saves storageState to .auth/
  fixtures/roles.ts    # seeded accounts + storage-state paths
  tests/smoke.spec.ts  # P0 @smoke happy-path checks
  .auth/               # generated per-role sessions (git-ignored)
```

## Running locally

```bash
# 1. Boot a local Supabase stack (applies migrations + seeds: test accounts and
#    200 generated songs from supabase/seeds/03_songs_random_generated.sql)
npx supabase start
#    The Playwright globalSetup re-seeds via scripts/db/setup-test-db.mjs, which runs
#    the generator live (scripts/db/random-seeder.mjs, E2E_RANDOM_SONGS_COUNT, default 80).
#    Regenerate the static file with `npm run seed:generate`. The real song collection lives in
#    ../sacred-fire-songs-collection. See docs/testing/song.feature for what
#    the generated data covers.

# 2. Configure env (see .env.test.example) — grab the key from:
npx supabase status

export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<key from supabase status>
export NEXT_PUBLIC_DEV_TEST_PASSWORD=<test-account-password>
# Optional, for a shared environment where each role has its own password
# (unset roles fall back to NEXT_PUBLIC_DEV_TEST_PASSWORD):
# export E2E_PASSWORD_ADMIN=... E2E_PASSWORD_GATEKEEPER=... E2E_PASSWORD_MUSICIAN=... E2E_PASSWORD_MEMBER=...

# 3. Install Playwright browsers (first time only)
npx playwright install --with-deps chromium

# 4. Run
npm run test:e2e          # headless, builds + starts the app
npm run test:e2e:ui       # interactive UI mode
npx playwright test --grep @smoke   # P0 smoke subset only
```

The config builds a **production** bundle (`next build && next start`) and runs
against it, so timing and bundling match reality. To test an already-running
server, set `E2E_BASE_URL`.

Notes:

- **Database**: the global setup empties and reseeds the local database
  (`scripts/db/setup-test-db.mjs`). Set `E2E_REUSE_DB=1` to skip that.
  Specs that seed data directly use `DATABASE_URL`; against a local Supabase
  stack it defaults to `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.
- **Headed specs**: tests tagged `@headed` in their title (audio recording,
  media focus) run only in the `*-headed` projects and open a real browser
  window. `E2E_FORCE_HEADLESS=1` runs them headless (CI always does).
- **`Executable doesn't exist at .../ffmpeg-linux`**: after a Playwright
  upgrade, run `npx playwright install ffmpeg` (needed for video recording).

## Roles

`auth.setup.ts` signs in every seeded role from `fixtures/roles.ts` (`admin`,
`gatekeeper`, `musician`, `member`) and persists their sessions. A spec opts
into a role with:

```ts
import { ROLES } from '../fixtures/roles';
test.use({ storageState: ROLES.member.storage });
```

Guest specs use no `storageState`.

## CI

`.github/workflows/e2e.yml` (the `e2e` check) is **optional**: it runs the
`@smoke` subset against a remote Supabase project of your own (for example a
staging copy of a self-hosted instance). The full suite runs locally, as
described above. The workflow reads these repository secrets:

- `SUPABASE_PROJECT_ID_STAGING` — project ref (URL = `https://<ref>.supabase.co`), or
- `SUPABASE_URL_STAGING` — full URL of the Supabase API (overrides the derived one)
- `SUPABASE_PUBLISHABLE_KEY_STAGING` — anon/publishable key (public; safe as a secret)
- `SUPABASE_DB_PASSWORD_STAGING` — database password (used to apply migrations)
- `E2E_TEST_PASSWORD` — password of the seeded E2E accounts in that database

When any of them is missing (forks, and this repository itself) the job skips
its steps and still passes. This project does not run E2E against any shared
environment of its own.

If you run the suite against your own environment where each role has its own
password, set `E2E_PASSWORD_ADMIN`, `E2E_PASSWORD_GATEKEEPER`,
`E2E_PASSWORD_MUSICIAN` and `E2E_PASSWORD_MEMBER` (see `passwordFor` in
`fixtures/roles.ts`); unset roles fall back to the shared test password.

> ⚠️ The target database must contain the E2E test accounts from
> `fixtures/roles.ts` (seed data in `supabase/seeds/*.sql`), or `auth.setup.ts`
> will fail. Never use the public seed password on a reachable database. Keep
> remote specs read-only — parallel runs share one database.
