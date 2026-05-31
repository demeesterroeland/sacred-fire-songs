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
# 1. Boot a local Supabase stack (applies migrations + seeds)
npx supabase start

# 2. Configure env (see .env.test.example) — grab the key from:
npx supabase status

export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<key from supabase status>
export NEXT_PUBLIC_DEV_TEST_PASSWORD=sacred-fire-dev

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

## Roles

`auth.setup.ts` signs in the seeded `admin`, `musician`, and `member` accounts
and persists their sessions. A spec opts into a role with:

```ts
import { ROLES } from '../fixtures/roles';
test.use({ storageState: ROLES.member.storage });
```

Guest specs use no `storageState`. There is **no seeded Gatekeeper account yet**
— add one (seed + `fixtures/roles.ts` + `auth.setup.ts`) when GK-* specs are
implemented.

## CI

`.github/workflows/e2e.yml` runs the `@smoke` subset on PRs. See that file for
the Supabase bootstrap + key extraction steps.
