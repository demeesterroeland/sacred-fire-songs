# Sacred Fire Songs – Agent Instructions

Canonical instructions for every AI coding agent (Codex, Copilot, Cursor, OpenCode, Gemini, Claude, ...).
`CLAUDE.md` imports this file and `GEMINI.md` is a symlink to it: edit **this** file only.

## Public Repo Isolation (CRITICAL)

This repository is **public open source**. Anyone may self-host it. The maintainer's own preview and production environments are private examples and are **not part of this project**.

- **Never** write private hostnames, domains, IPs, server paths, stack names, hosting-provider names or the private infra repo's name anywhere in this repo: code, workflows, tests, docs, logbook, plans, issues, PR text or commit messages. Use placeholders (`<staging-host>`, `<server>`).
- **Never** add deploy workflows, SSH keys, GitHub Environments or deployment secrets here. CI only builds, tests and publishes public images to GHCR.
- Ops work (server changes, deploys, stack config, deploy decisions) is documented in the maintainer's **private infra repo**, not in `docs/logbook/` or `docs/plans/`. If a session touches both, write the ops part there.
- **Allowed**: unit tests, Playwright E2E tests, local Supabase dev setup, generic self-hosting documentation.
- Enforcement is automated and fails closed: `scripts/dev/isolation-guard.sh` runs as `.githooks/pre-commit` and `.githooks/commit-msg` (enable with `git config core.hooksPath .githooks`), as a Claude Code `PreToolUse` hook, and as the required `isolation` CI job. It reads its pattern list from `~/.config/sfs/denylist` (CI: the `ISOLATION_DENYLIST` secret) — that list must never be committed here. If the guard blocks you, do not work around it; move the content to the private repo.

## Branches and Merging (CRITICAL)

- **Never** commit directly to `main` or `develop`. For **every** change (including typos and one-liners), create a branch: `feat/…`, `fix/…`, `chore/…`, or `docs/…` from `origin/develop`, and open a PR into `develop`. No exceptions, even for "just fix it quickly".
- `main` is updated **only** by promoting `develop` (merge commit) or a `hotfix/*` branch.
- **Never** merge a PR without explicit, unambiguous permission from the user. Ask the user to verify the change before it is promoted to `main`.
- **Never** close issues unless the user explicitly says so.

## Documentation Sync Policy

All project artifacts must stay 100% synchronized with the codebase.

- Every code change must be reflected in `application-analysis&design.md`.
- Before completing a task, verify the implementation against acceptance criteria in `epic&user stories.md`.
- If a UI screen is modified, compare against the visual description in `docs/design/screens/screen*.html` mockups.
- Propose specific edits to inconsistent files as soon as discrepancies are found.
- Update version status in `application-analysis&design.md` and related docs if significant changes are made.
- **Definition of Done**: A task is not "Done" until documentation, tests, and code are in 100% alignment.

## Artifact Synchronization Policy

Agents do NOT retain memory across conversations. To avoid data loss:

| Artifact | Strategy |
| :--- | :--- |
| `master-walkthrough.md` | **APPEND** only – safe |
| `master-tasks.md` | **READ first**, then append/merge |
| `master-timetracking.md` | **READ first**, then update totals |

Implementation plans live in `docs/plans/YYYY-MM-DD-<feature>.md`.

- At the start of a session, **READ** files in `docs/logbook/` to initialize context.
- Commit logbook updates on the feature branch **before** opening the PR; never push them directly to `develop` or `main`.
- Never overwrite any of those files with an empty or partial list.

## Glob-Triggered Rules

### When modifying `docs/**/*.{md,sql,html}`
1. Increment the version number in the file header.
2. Update the date to today.
3. Add a new changelog entry.

### When modifying `supabase/migrations/*.sql`
1. Update `docs/design/db-schema.sql` to reflect the changes.
2. Keep `docs/design/db-schema.sql` valid as a single-file fresh-install setup script.

## Database Environments

- **Development**: the local Supabase CLI stack (`npx supabase start`, `http://127.0.0.1:54321`) via `.env.local` (`NEXT_PUBLIC_SUPABASE_URL_DEV`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV`).
- **Testing (E2E)**: the isolated test database configured in `.env.test`.
- Never point development or test tooling at a production database.

## Supabase Patterns

- Use `.maybeSingle()` (not `.single()`) when a row may not exist — `.single()` returns 406 if zero rows match.
- Server-side queries belong in `lib/*/serverQueries.ts`; import `createClient` from `@/lib/supabase/server`.
- Only import server queries from Server Components or Server Actions (never from client components).

## Testing Pyramid, TDD & BDD

Always follow **Test-Driven Development (TDD)** and **Behavior-Driven Development (BDD)** structured by the project's **Testing Pyramid**:

- **TDD First:** Write the failing test or executable specification before writing implementation code.
- **BDD Gherkin Specifications:** Feature files in `docs/testing/*.feature` define user-visible behavior. Scenarios are tagged `@unit` (L2, in-memory/test-doubles via `npm run test:bdd:unit`), `@seed` (L2/L3 against local Supabase via `npm run test:bdd:seed`), or `@e2e` (L5 Playwright).
- **Testing Pyramid Layers:**
  1. **Layer 1 (L1) Static Quality:** TypeScript typecheck (`npx tsc --noEmit`) and ESLint (`npm run lint`).
  2. **Layer 2 (L2) Unit & Service Contract Tests:** Fast, in-memory Vitest unit tests in `testing/unit/tests/` and fast BDD steps.
  3. **Layer 3 (L3) Component Tests:** RTL / Vitest component-level interaction tests where applicable.
  4. **Layer 4 (L4) Integration & API / Contract Tests:** Subsystem contracts, migrations, server actions.
  5. **Layer 5 (L5) End-to-End (E2E):** Real-browser Playwright specs in `e2e/tests/` verifying user journeys and smoke paths.
- Unit tests live in **one** tree: `testing/unit/tests/` (Vitest only collects that folder). Playwright specs live in `e2e/` and never run under Vitest.
- BDD: `npm run test:bdd:unit` (no database), `npm run test:bdd:seed` (local Supabase). Gitflow pipeline contracts: `npm run test:bdd:ci` / `test:bdd:ci-gate`, bats via `npm run test:scripts`.
- CI (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, `unit`, `bdd`, `build`, `pipeline` and `isolation` on every push and PR. `pr-lint.yml` (`pr-policy`) checks every PR into `develop`/`main`: Conventional Commit title and Gitflow head → base (work branches → `develop`; `develop`/`hotfix/*` → `main`). Branch rulesets live in `.github/rulesets/*.json`. `npm run lint` caps warnings (`--max-warnings`); never raise the cap, lower it when you remove warnings.

## Internationalization (i18n) Policy

- **Zero Hardcoded UX Strings:** Never hardcode user-facing copy in components, dialogs, forms, toasts, badges, or buttons.
- **Immediate Translation Sync:** When adding or updating UX copy, **always** register the keys using `useLocale()` / `t(...)` and update **all 8 locale files** in `messages/` (`en.json`, `es.json`, `pt.json`, `fr.json`, `de.json`, `nl.json`, `it.json`, `he.json`).
- Ensure fallback behavior is clean and date/time formatters use `LOCALE_DATE_TAGS[locale]`.
