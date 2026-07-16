# Task: Media Player UX & E2E Test Lint Fixes

- [x] Fix TypeScript and ESLint type warnings in `e2e/tests/recording.spec.ts` (untyped page parameters and window assertions).
- [x] Correct `@typescript-eslint/ban-ts-comment` error by adding explanation to `@ts-expect-error` comment.
- [x] Align submodule references and push to remote to trigger Vercel build.
- [x] Configure and run performance tests (k6) against the Vercel Preview URL.
- [x] Set up and verify the newly regenerated Vercel Protection Bypass Token.
- [x] Remove cleartext secrets from test scripts and use environment variables.
- [x] Record the results in the performance reports `PERFORMANCE_TEST_REPORT.md` and `RESULTS.md`.
