# Scripts Directory Structure

This directory contains development, database, songbook compilation, and CI/CD utility scripts for **Sacred Fire Songs**.

```
scripts/
├── cicd/       # DEV CI/CD, issue workflow, preview/production deployment & story sync
├── db/         # Database migrations, seeding, cloning & management
├── dev/        # Local frontend/asset helpers and chord debug utilities
├── songbook/   # ChordPro compilation and production PDF exports
└── README.md   # Directory documentation
```

---

## 🚀 `scripts/cicd/` — Developer CI/CD & Workflow

Scripts for feature branch lifecycle, preview deployment, production promotion, benchmarking, and issue sync.

| Script | Description | Usage |
|---|---|---|
| [`start-issue.sh`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/cicd/start-issue.sh) | Creates an isolated git worktree (`.worktrees/issue-<NUM>`) and branch (`<type>/<NUM>-<desc>`), symlinks `.env.local`, and creates an initial Conventional Commit. | `./scripts/cicd/start-issue.sh <issue> <type> <description...>` |
| [`restart.sh`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/cicd/restart.sh) | Rebuilds the worktree project, frees up the convention port (`4<issue>`), and boots the production Next.js server locally. | `./scripts/cicd/restart.sh <issue>` |
| [`dev2preview.sh`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/cicd/dev2preview.sh) | Pushes the active feature branch, triggers the GitHub Actions Docker build workflow, and outputs the preview Docker image tag. | `./scripts/cicd/dev2preview.sh [--force]` |
| [`preview2prod.sh`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/cicd/preview2prod.sh) | Enforces the Preview Verification Gate, merges the PR to `main`, triggers Release Please, injects AI release notes, and monitors the release Docker build. | `./scripts/cicd/preview2prod.sh --verified [options]` |
| [`run-performance-benchmark.sh`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/cicd/run-performance-benchmark.sh) | Executes the automated lighthouse/k6/load performance benchmark suite against local or preview URLs. | `npm run test:perf` or `./scripts/cicd/run-performance-benchmark.sh [url]` |
| [`sync-stories-to-gh.mjs`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/cicd/sync-stories-to-gh.mjs) | Synchronizes user stories from markdown documents to GitHub Issues (triggered automatically or manually). | `node scripts/cicd/sync-stories-to-gh.mjs <file>` |
| [`sync-stories-from-gh.mjs`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/cicd/sync-stories-from-gh.mjs) | Pulls closed status from GitHub Issues and marks user stories as `[Implemented]` in markdown. | `node scripts/cicd/sync-stories-from-gh.mjs` |

---

## 🗄️ `scripts/db/` — Database Operations & Seeding

Scripts for Supabase database management, E2E test database setups, and migrations.

| Script | Description | Usage |
|---|---|---|
| [`run-migrations.sh`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/db/run-migrations.sh) | Production-grade Supabase-compatible migration runner using `psql`, advisory locking, and `supabase_migrations` tracking. | `DATABASE_URL=... ./scripts/db/run-migrations.sh` |
| [`setup-test-db.mjs`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/db/setup-test-db.mjs) | Wipes and seeds the isolated E2E test database before Playwright test execution. Supports `E2E_RANDOM_SEED=1` and `E2E_REUSE_DB=1`. | `node scripts/db/setup-test-db.mjs` |
| [`random-seeder.mjs`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/db/random-seeder.mjs) | Programmatic database-side randomized seeder generating realistic medicine songs, setlists, and rehearsal recordings. | Imported by `setup-test-db.mjs` |
| [`clone-prod-to-staging.sh`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/db/clone-prod-to-staging.sh) | Safely mirrors production data to the staging database within a single transaction without needing superuser privileges. | `./scripts/db/clone-prod-to-staging.sh [--yes]` |
| [`supabase_rate_limits.sh`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/db/supabase_rate_limits.sh) | Inspects and updates Supabase Management API authentication rate limits. | `./scripts/db/supabase_rate_limits.sh` |

---

## 📖 `scripts/songbook/` — Songbook & PDF Compilation

Scripts for generating ChordPro and PDF songbooks.

| Script | Description | Usage |
|---|---|---|
| [`compile_songbook.py`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/songbook/compile_songbook.py) | Compiles a directory of ChordPro `.cho` files into a consolidated PDF songbook with a Table of Contents using the `chordpro` CLI. | `python3 scripts/songbook/compile_songbook.py <input_dir> <output_pdf>` |
| [`prod_songs_2_pdf.py`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/songbook/prod_songs_2_pdf.py) | Extracts all songs from the production database, formats them into standard ChordPro files, and generates `production_songbook.pdf`. | `PROD_DB_URL=... python3 scripts/songbook/prod_songs_2_pdf.py` |

---

## 🛠️ `scripts/dev/` — Local Development Utilities

Helpers for asset generation and chord format verification.

| Script | Description | Usage |
|---|---|---|
| [`generate-icons.mjs`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/dev/generate-icons.mjs) | Uses `sharp` to generate all required PWA icon sizes (16, 32, 180, 192, 512) from `public/icons/icon.svg`. | `node scripts/dev/generate-icons.mjs` |
| [`debug_chordpro.js`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/dev/debug_chordpro.js) | Standalone debug script to verify ChordPro regex matching against sample songs. | `node scripts/dev/debug_chordpro.js` |
| [`test_chord_parsing.ts`](file:///home/meester1/projects/prive/sacred-fire-songs/scripts/dev/test_chord_parsing.ts) | Verification script testing TypeScript chord transposition and parsing functions. | `npx tsx scripts/dev/test_chord_parsing.ts` |
