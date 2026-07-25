# Changelog

## [1.0.1](https://github.com/demeesterroel/sacred-fire-songs/compare/v1.0.0...v1.0.1) (2026-07-25)


### 🐛 Bug fixes

* **categories:** group tags under correct parent headers in song form ([#205](https://github.com/demeesterroel/sacred-fire-songs/issues/205)) ([#206](https://github.com/demeesterroel/sacred-fire-songs/issues/206)) ([14b0529](https://github.com/demeesterroel/sacred-fire-songs/commit/14b05298bd81768b8c919e899007a7aa61650feb))
* **e2e:** update mobile viewports and iframe selectors for test suite ([#207](https://github.com/demeesterroel/sacred-fire-songs/issues/207)) ([#208](https://github.com/demeesterroel/sacred-fire-songs/issues/208)) ([2c2dc59](https://github.com/demeesterroel/sacred-fire-songs/commit/2c2dc59f70d5f319bda9d470d11aecc031c9a2bd))


### 📖 Documentation

* **infra:** remove environment and deployment docs from engine repo (moved to <infra-repo>) ([9d344e2](https://github.com/demeesterroel/sacred-fire-songs/commit/9d344e2d46bfd71c9345d4e034344cb4111d278a))
* **logbook:** sync session walkthrough for July 20 VPS migration & release v1.0.0 ([598d353](https://github.com/demeesterroel/sacred-fire-songs/commit/598d35313efd13b56c9efb1005bad2b27e482277))
* **release:** sanitize v1.0.0 release notes and changelog ([130692c](https://github.com/demeesterroel/sacred-fire-songs/commit/130692c100325698a385016a8f4b2e9f80db5fce))
* **security:** sanitize all logbook walkthroughs, task files, agent rules, and configs to remove private deployment info ([8313923](https://github.com/demeesterroel/sacred-fire-songs/commit/8313923f5df2b60fec53490705582726229c8130))
* **security:** sanitize environment guides and deployment docs to remove internal domain names ([ae56a0d](https://github.com/demeesterroel/sacred-fire-songs/commit/ae56a0db5c305c613144fc577fcc97ef6a884712))

## [1.0.0](https://github.com/demeesterroel/sacred-fire-songs/releases/tag/v1.0.0) (2026-07-20)

### ✨ Features

* **standalone build**: Enabled Next.js `output: 'standalone'` Docker container image generation.
* **runtime proxy**: Introduced dynamic runtime proxy route handler for `/supabase-api` resolving environment variables dynamically.
* **release automation**: Integrated `release-please` semantic versioning and GitHub Container Registry (GHCR) publishing workflow.
* **multi-tenancy & envs**: Support for isolated development, staging, and production database environments.
* **playlist curation**: Admin and Gatekeeper public playlist curation capabilities.
