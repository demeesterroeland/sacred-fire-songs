## October 30, 2026 (Cucumber Runner Setup for BDD - Issue #263)

### 1. Cucumber & TypeScript Runner Configuration
- Installed `@cucumber/cucumber` and `tsx` in `package.json` to execute TypeScript step definitions and resolve `@/*` path aliases directly against `tsconfig.json` without browser dependencies.
- Created `cucumber.json` targeting `docs/testing/song.feature` with `default` (`@unit or @seed`), `unit` (`@unit`), and `seed` (`@seed`) profiles using `strict: false` so pending scenarios in downstream sub-issues (#264, #265) do not fail the runner.
- Added `test:bdd`, `test:bdd:unit`, and `test:bdd:seed` scripts to `package.json`.

### 2. Support Code & Initial Smoke Step Definitions
- Created `testing/bdd/support/world.ts` defining `SongBddWorld` for scenario state across BDD steps.
- Created `testing/bdd/steps/smoke.steps.ts` implementing the Background steps (offline no-op for unit runs), the full step definitions for the first `@unit @chordProParsing` scenario (`Inline chords in square brackets`), and explicit pending stubs for the remaining `@unit` and `@seed` scenarios.
