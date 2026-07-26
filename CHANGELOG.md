# Changelog

## [1.1.0](https://github.com/demeesterroel/sacred-fire-songs/compare/v1.0.1...v1.1.0) (2026-07-26)


### ✨ New features

* **categories:** implement TagPill component and useTaxonomy hook ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([dbc5bb0](https://github.com/demeesterroel/sacred-fire-songs/commit/dbc5bb0598a6f463f15c8969974bd1a52398d71c))
* **tags:** display cached song count badges on TagPills ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([0433980](https://github.com/demeesterroel/sacred-fire-songs/commit/0433980102e1bce1fa8d9ee6ac58eb13df41c4fd))
* **tags:** display database category emojis in TagPill components across detail, form, and search ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([5e26538](https://github.com/demeesterroel/sacred-fire-songs/commit/5e265389b9719b6b81c4d64626f7748d6a403ce9))
* **tags:** implement Hybrid Tag Selector and align Song Detail badges ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([c488dc2](https://github.com/demeesterroel/sacred-fire-songs/commit/c488dc279a4b6db33046082179969f242b92067b))
* **tags:** unify CategoryGrid and SongCard tag pills with TagPill component ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([7b32ac7](https://github.com/demeesterroel/sacred-fire-songs/commit/7b32ac7e5198a3fd47a5198560504216016c1ed3))


### 🐛 Bug fixes

* **seeds:** update 02_profiles.sql seed role to expert ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([8d9083c](https://github.com/demeesterroel/sacred-fire-songs/commit/8d9083c29045c877a3de94c0a136ef26daa91aa7))
* **seeds:** update expert email address to roel.de.meester+expert@gmail.com ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([9ccc0bb](https://github.com/demeesterroel/sacred-fire-songs/commit/9ccc0bb5732860baaf6b1d324e0755c04a7c4dbb))
* **song-detail:** select emoji column in categories query ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([bf850ab](https://github.com/demeesterroel/sacred-fire-songs/commit/bf850abf2dec4f2b0d1fd7bb46078b119e6df4f8))
* **tags:** apply vibrant category colors to selectable TagPill variant in edit and search ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([4644c66](https://github.com/demeesterroel/sacred-fire-songs/commit/4644c6656a49c8ab293b3f7672ef4bff98948629))
* **tags:** use dynamic category colors in TagPill component ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([ff193b1](https://github.com/demeesterroel/sacred-fire-songs/commit/ff193b178e591c1a8a0931099faba01ff36510f2))
* **types:** add optional emoji to SongCardProps categories ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([7089543](https://github.com/demeesterroel/sacred-fire-songs/commit/7089543cc26a743bf6c25f330ced697885ccab15))


### 📖 Documentation

* **logbook:** sync session walkthrough for July 25 2026 category fixes, E2E suite, and release v1.0.1 ([08b9f1c](https://github.com/demeesterroel/sacred-fire-songs/commit/08b9f1c40e6260d4e20a27fef79400e790700598))
* **logbook:** update master-tasks.md and master-timetracking.md ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([9c4a305](https://github.com/demeesterroel/sacred-fire-songs/commit/9c4a30539673ec2f026bfccf9fd406d378e99b24))
* **logbook:** update master-walkthrough.md for July 26 session ([#210](https://github.com/demeesterroel/sacred-fire-songs/issues/210)) ([66c2629](https://github.com/demeesterroel/sacred-fire-songs/commit/66c2629c0f8462252c391b39ad54536f16bf904b))

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
