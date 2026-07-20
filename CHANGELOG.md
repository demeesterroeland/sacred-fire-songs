# Changelog

## [1.0.0](https://github.com/demeesterroel/sacred-fire-songs/releases/tag/v1.0.0) (2026-07-20)

### ⚠️ BREAKING CHANGES

* **deployment**: Production infrastructure migrated to VPS with self-hosted Supabase stack and automated GitHub Actions pipelines.

### ✨ Features

* **standalone build**: Enabled Next.js `output: 'standalone'` Docker container image generation.
* **runtime proxy**: Introduced dynamic runtime proxy route handler for `/supabase-api` resolving internal container environment variables dynamically.
* **release automation**: Integrated `release-please` semantic versioning and GitHub Container Registry (GHCR) publishing workflow (`ghcr.io/demeesterroel/sacred-fire-songs`).
* **multi-tenancy & envs**: Fully isolated `_DEV`, `_PREVIEW`, and `_PROD` Supabase database environments with production database restoration.
