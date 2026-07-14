## 2026-07-14 (Media Player UX & E2E Test Lint Fixes)

### 1. Rehearsal Recording E2E Test Fixes
- Resolved untyped `page: any` parameter warning by importing and using the `Page` type from `@playwright/test` in [recording.spec.ts](file:///home/roeland/projects/sacred-fire-songs/e2e/tests/recording.spec.ts).
- Fixed `Unexpected any` error on `window` object by casting it to `unknown as { __E2E_FAST_TIMER__: boolean }`.
- Replaced `// @ts-ignore` with `// @ts-expect-error - overriding window.Blob for testing` to satisfy ESLint documentation requirements.

### 2. Parent Repository Sync
- Pinned the `engine` submodule in `<parent-project>` to the latest commit and pushed to `feat/issue-187-media-player-ux` to trigger the Vercel preview deployment.
