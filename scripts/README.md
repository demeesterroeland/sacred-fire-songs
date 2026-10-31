# Scripts

Helper scripts for **Sacred Fire Songs**, grouped by purpose. Run them from the **repository root**.

```
scripts/
├── cicd/     # Issue worktrees, preview/production promotion, benchmarks, GitHub roadmap & story sync
├── db/       # Migrations, test-database setup, random seeding, staging clone, Supabase settings
├── dev/      # Local development helpers (icons, ChordPro debugging)
└── README.md
```

Every script lives in exactly one category folder; only this README sits directly in `scripts/`. `testing/scripts/scripts-layout.bats` (`npm run test:scripts`) enforces this and checks that every script is listed below. When you add a script, put it in a category and add a row here. The ChordPro song collection and the songbook/PDF scripts live in the sibling repository `sacred-fire-songs-collection`.

## `scripts/cicd/`: workflow, delivery and GitHub sync

| Script | Purpose | Usage |
| --- | --- | --- |
| `cicd/start-issue.sh` | Creates worktree `.worktrees/issue-<n>` and branch `<type>/<n>-<desc>` from `origin/develop` (`hotfix` from `origin/main`), symlinks `.env.local`, adds an empty commit holding the Conventional Commit PR title. | `scripts/cicd/start-issue.sh <issue> <type> <description...>` |
| `cicd/restart.sh` | Builds the worktree of an issue and starts the production server on port `4<issue>`. | `scripts/cicd/restart.sh <issue>` |
| `cicd/dev2preview.sh` | Pushes the current branch, tracks the Docker build workflow and prints the image tag to deploy on the preview server. | `scripts/cicd/dev2preview.sh [--force]` |
| `cicd/preview2prod.sh` | Promotes a verified preview to production (merge, Release Please, release notes, Docker build). **Not Gitflow-ready yet** (Epic 5.1 Phase 4), see `docs/guides/git-workflow.md`. | `scripts/cicd/preview2prod.sh --verified [options]` |
| `cicd/run-performance-benchmark.sh` | Runs the performance benchmark against a URL, lists saved runs or builds a comparison report. | `npm run test:perf` or `scripts/cicd/run-performance-benchmark.sh [url] [--sample N] [--reuse <runId>]` |
| `cicd/setup_github_roadmap.py` | Idempotently creates the Epic 5.1 GitHub issue tree from `docs/testing/gitflow-cicd.feature`. | `python3 scripts/cicd/setup_github_roadmap.py [--dry-run]` |
| `cicd/sync-stories-to-gh.mjs` | Pushes the user stories in `docs/logbook/epic&user stories.md` to GitHub Issues (Claude Code `PostToolUse` hook in `.claude/settings.json`, or manually). | `node scripts/cicd/sync-stories-to-gh.mjs "<path to epic&user stories.md>"` |
| `cicd/sync-stories-from-gh.mjs` | Marks stories whose GitHub issue is closed as `[Implemented]` in the epic document. | `node scripts/cicd/sync-stories-from-gh.mjs` (or `/sync-stories`) |
| `cicd/lib/parseStories.mjs` | Shared parser used by the story-sync scripts (tested by `testing/unit/tests/parseStories.test.mjs`). | Imported, not run directly |

## `scripts/db/`: database and seed data

| Script | Purpose | Usage |
| --- | --- | --- |
| `db/run-migrations.sh` | Supabase-compatible migration runner (`psql`, advisory lock, `supabase_migrations` tracking); entrypoint of the migrator image. | Copied by `Dockerfile.migrator`; `POSTGRES_HOST=… POSTGRES_PASSWORD=… scripts/db/run-migrations.sh` |
| `db/setup-test-db.mjs` | Wipes the test database and seeds the fixed accounts plus random songs, playlists and recordings (`E2E_RANDOM_SONGS_COUNT`, default 80). | Run by the Playwright `globalSetup` (`e2e/global-setup.ts`); `node scripts/db/setup-test-db.mjs` |
| `db/random-seeder.mjs` | Database-side (PL/pgSQL) random seeder with deterministic anchor songs covering every song shape in `docs/testing/song.feature`. | Imported by `setup-test-db.mjs` and `export-random-seed.mjs` |
| `db/export-random-seed.mjs` | Writes `supabase/seeds/03_songs_random_generated.sql` from the random seeder (needs a local database). | `npm run seed:generate` or `node scripts/db/export-random-seed.mjs [count]` |
| `db/clone-prod-to-staging.sh` | Copies production data to the staging database in one transaction (asks for confirmation). | `scripts/db/clone-prod-to-staging.sh [--yes] [--delete-backup]` |
| `db/supabase_rate_limits.sh` | Reads and updates the Supabase Auth rate limits through the Management API (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID` from `.env.local`). | `scripts/db/supabase_rate_limits.sh` |

## `scripts/dev/`: local development helpers

| Script | Purpose | Usage |
| --- | --- | --- |
| `dev/generate-icons.mjs` | Generates the PWA icon sizes from `public/icons/icon.svg` with `sharp`. | `node scripts/dev/generate-icons.mjs` |
| `dev/debug_chordpro.js` | Prints the ChordSheetJS parse tree of a small ChordPro sample. | `node scripts/dev/debug_chordpro.js` |
| `dev/test_chord_parsing.ts` | Prints the parse result of a ChordPro sample in TypeScript (manual check, not a Vitest test). | `npx tsx scripts/dev/test_chord_parsing.ts` |
