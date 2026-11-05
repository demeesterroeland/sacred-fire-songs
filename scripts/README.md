# Scripts

Helper scripts for **Sacred Fire Songs**, grouped by purpose. Run them from the **repository root**.

```
scripts/
├── cicd/     # Issue worktrees, preview/production promotion, benchmarks, GitHub roadmap & story sync
├── db/       # Migrations, test-database setup, random seeding, staging clone, Supabase settings
├── dev/      # Local development helpers (icons, ChordPro debugging, sample audio, isolation guard, UX screenshot capture)
└── README.md
```

Every script lives in exactly one category folder; only this README sits directly in `scripts/`. `testing/scripts/scripts-layout.bats` (`npm run test:scripts`) enforces this and checks that every script is listed below. When you add a script, put it in a category and add a row here. The ChordPro song collection and the songbook/PDF scripts live in the sibling repository `sacred-fire-songs-collection`.

## `scripts/cicd/`: workflow, delivery and GitHub sync

| Script | Purpose | Usage |
| --- | --- | --- |
| `cicd/start-issue.sh` | Creates worktree `.worktrees/issue-<n>` and branch `<type>/<n>-<desc>` from `origin/develop` (`hotfix` from `origin/main`), symlinks `.env.local`, adds an empty commit holding the Conventional Commit PR title. Rejects unknown types (allowed: `feat`, `fix`, `chore`, `docs`, `hotfix`) and non-numeric issue numbers (exit 2). | `scripts/cicd/start-issue.sh <issue> <type> <description...>` |
| `cicd/restart.sh` | Builds the worktree of an issue and starts the production server on port `4<issue>`. | `scripts/cicd/restart.sh <issue>` |
| `cicd/dev2preview.sh` | Pushes the current work branch, triggers the Docker build (branch tag + rolling `:preview`) and prints the `sacred-fire-songs-app` / `-migrator` image names. Refuses `main`/`develop`. `--dry-run` only prints the names. | `scripts/cicd/dev2preview.sh [--force] [--dry-run]` |
| `cicd/develop2main.sh` | Gitflow promotion: opens/reuses the PR `develop` → `main`, waits for checks, asks for confirmation and merges with a **merge commit** (never `--squash`/`--admin`), then merges the Release Please PR and prints the explicit `vX.Y.Z` images. Deploying is outside this repo. `--dry-run` calls no `gh` command. | `scripts/cicd/develop2main.sh [--yes] [--skip-release] [--notes-file <f>] [--dry-run]` |
| `cicd/run-performance-benchmark.sh` | Runs the performance benchmark against a URL, lists saved runs or builds a comparison report. | `npm run test:perf` or `scripts/cicd/run-performance-benchmark.sh [url] [--sample N] [--reuse <runId>]` |
| `cicd/setup_github_roadmap.py` | Idempotently creates the Epic 5.1 GitHub issue tree from `docs/testing/gitflow-cicd.feature`. | `python3 scripts/cicd/setup_github_roadmap.py [--dry-run]` |
| `cicd/sync-stories-to-gh.mjs` | Pushes the user stories in `docs/logbook/epic&user stories.md` to GitHub Issues (Claude Code `PostToolUse` hook in `.claude/settings.json`, or manually). | `node scripts/cicd/sync-stories-to-gh.mjs "<path to epic&user stories.md>"` |
| `cicd/sync-stories-from-gh.mjs` | Marks stories whose GitHub issue is closed as `[Implemented]` in the epic document. | `node scripts/cicd/sync-stories-from-gh.mjs` (or `/sync-stories`) |
| `cicd/lib/parseStories.mjs` | Shared parser used by the story-sync scripts (tested by `testing/unit/tests/parseStories.test.mjs`). | Imported, not run directly |
| `cicd/lib/prPolicy.mjs` | Gitflow PR policy: Conventional Commit title + allowed head → base branches. Run by `.github/workflows/pr-lint.yml`; tested by `testing/unit/tests/ci/prPolicy.test.ts`. | `PR_TITLE=… PR_HEAD=… PR_BASE=… node scripts/cicd/lib/prPolicy.mjs` |

## `scripts/db/`: database and seed data

| Script | Purpose | Usage |
| --- | --- | --- |
| `db/run-migrations.sh` | Supabase-compatible migration runner (`psql`, advisory lock, `supabase_migrations` tracking); entrypoint of the migrator image. | Copied by `Dockerfile.migrator`; `POSTGRES_HOST=… POSTGRES_PASSWORD=… scripts/db/run-migrations.sh` |
| `db/setup-test-db.mjs` | Wipes the test database and seeds the fixed accounts plus random songs, playlists and recordings (`E2E_RANDOM_SONGS_COUNT`, default 80). | Run by the Playwright `globalSetup` (`e2e/global-setup.ts`); `node scripts/db/setup-test-db.mjs` |
| `db/random-seeder.mjs` | Database-side (PL/pgSQL) random seeder with deterministic anchor songs covering every song shape in `docs/testing/song.feature`. | Imported by `setup-test-db.mjs` and `export-random-seed.mjs` |
| `db/export-random-seed.mjs` | Writes `supabase/seeds/03_songs_random_generated.sql` from the random seeder (needs a local database). | `npm run seed:generate` or `node scripts/db/export-random-seed.mjs [count]` |
| `db/upload-sample-recordings.mjs` | Uploads the sample MP3s from `supabase/seeds/audio/` to the `rehearsals` bucket for every seeded `user_recordings` row, round-robin, and stores each file's real duration (`ffprobe`, 30 s fallback). Local stack only; refuses non-localhost URLs. Run after `npx supabase db reset`. | `npm run seed:audio` |
| `db/clone-prod-to-staging.sh` | Copies production data to the staging database in one transaction (asks for confirmation). | `scripts/db/clone-prod-to-staging.sh [--yes] [--delete-backup]` |
| `db/supabase_rate_limits.sh` | Reads and updates the Supabase Auth rate limits through the Management API (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID` from `.env.local`). | `scripts/db/supabase_rate_limits.sh` |

## `scripts/dev/`: local development helpers

| Script | Purpose | Usage |
| --- | --- | --- |
| `dev/generate-icons.mjs` | Generates the PWA icon sizes from `public/icons/icon.svg` with `sharp`. | `node scripts/dev/generate-icons.mjs` |
| `dev/debug_chordpro.js` | Prints the ChordSheetJS parse tree of a small ChordPro sample. | `node scripts/dev/debug_chordpro.js` |
| `dev/test_chord_parsing.ts` | Prints the parse result of a ChordPro sample in TypeScript (manual check, not a Vitest test). | `npx tsx scripts/dev/test_chord_parsing.ts` |
| `dev/generate-sample-recordings.py` | Synthesizes the deterministic 30 s, 140 BPM sample recordings (frame drum, rattle, hummed melody with group answer, fire crackle) in `supabase/seeds/audio/`. Needs `numpy` and `ffmpeg`. | `python3 scripts/dev/generate-sample-recordings.py` |
| `dev/isolation-guard.sh` | Blocks private deployment details from this public repo, using a denylist kept outside the repo (`~/.config/sfs/denylist`, CI: `ISOLATION_DENYLIST`). Runs as git hooks, Claude Code hook and the `isolation` CI job. | `scripts/dev/isolation-guard.sh --tree` (or `--staged`, `--claude-hook`, `FILE…`) |
| `dev/ux/capture-routes.mjs` | Captures every route per role (guest, member, admin) and viewport as PNG into `docs/ux-research/screenshots/` (Playwright; needs the app on `http://localhost:3000` against the seeded local Supabase). | `node scripts/dev/ux/capture-routes.mjs [mobile\|desktop]` |
| `dev/ux/capture-flows.mjs` | Captures interactive states (menus, drawer, recorder with fake microphone, share / publish / attribution modals) for the UX research. | `node scripts/dev/ux/capture-flows.mjs [mobile\|desktop]` |
| `dev/ux/capture-story.sh` | UX v2 per-story before/after set: runs `capture-routes.mjs` at 390 px in light and dark for selected routes/roles and re-encodes as 390 px WebP into `docs/ux-research/screenshots/ux-v2/<issue>/`. | `scripts/dev/ux/capture-story.sh <issue> <before\|after> <base-url> [routes] [roles]` |
| `dev/ux/lib.mjs` | Shared helpers for the UX capture scripts (viewports, test accounts, seeded song IDs, `shot()`). See `docs/ux-research/README.md`. | Imported, not run directly |
