# Tasks: Move Song Collection Out & Establish Testing Pyramid

## Move Song Collection Out of App Repo
- [x] **FINISHED**: Extract ChordPro song collection (`data/songs`, `data/extracted_songs`, `data/scripts`) and songbook generation scripts to `../sacred-fire-songs-collection` with full git history.
- [x] **FINISHED**: Remove `data/` and Python songbook scripts from app repository.
- [x] **FINISHED**: Extract SQL seed songs 03 through 10 to collection repo under `seeds/`.
- [x] **FINISHED**: Retire `E2E_RANDOM_SEED` and hardcoded demo counts from workflows and specs.

## Test Seeder & Living Specification
- [x] **FINISHED**: Rewrite `scripts/random-seeder.mjs` with 20 deterministic anchor songs covering every tested shape across unit, e2e, and manual tests.
- [x] **FINISHED**: Write living Gherkin catalogue `docs/testing/song.feature` documenting all tested song shapes.
- [x] **FINISHED**: Generate static 200-song snapshot `supabase/seeds/03_songs_random_generated.sql` via `npm run seed:generate`.
- [x] **FINISHED**: Verify unit test suite (`npm run test:unit`: 162/162 passing).
- [x] **FINISHED**: Verify Next.js production build (`npm run build`: 0 errors).

## Testing Pyramid & Orchestrator
- [x] **FINISHED**: Create Master Orchestrator Epic #262: `[Epic] Introduce Cucumber Tests Driven by docs/testing/song.feature (Testing Pyramid)`.
- [x] **FINISHED**: Create sub-issues #263, #264, #265, #266, #267, #268 with Gherkin acceptance criteria and Model Tier assignments.
- [x] **FINISHED**: Document Multi-Agent SOP and Handoff Protocol on Epic #262.
