# Task: Set up Cucumber runner and TypeScript test execution for BDD (#263)

- [x] Create isolated git worktree `.worktrees/issue-263` on branch `chore/263-cucumber-runner` from `chore/move-song-collection-out`.
- [x] Install `@cucumber/cucumber` and `tsx` as devDependencies in `package.json`.
- [x] Create `cucumber.json` targeting `docs/testing/song.feature` with `default` (`@unit or @seed`), `unit` (`@unit`), and `seed` (`@seed`) profiles.
- [x] Configure Cucumber support code and custom World in `testing/bdd/support/world.ts`.
- [x] Wire smoke step definitions for the initial `@unit @chordProParsing` scenario ("Inline chords in square brackets") and pending stubs for remaining `@unit` (#264) and `@seed` (#265) scenarios in `testing/bdd/steps/smoke.steps.ts`.
- [x] Add `test:bdd`, `test:bdd:unit`, and `test:bdd:seed` npm scripts in `package.json`.
- [x] Verify `npm run test:unit`, `npm run test:bdd`, and `npm run build` succeed cleanly in under 10 seconds (BDD runner executes in ~0.15s).
