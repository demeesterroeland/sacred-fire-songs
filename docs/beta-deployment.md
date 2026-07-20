# Beta & Self-Hosted Deployment Guide

**Version:** 1.0
**Status:** Living Document
**Date:** July 20, 2026

How to deploy Sacred Fire Songs to self-hosted and beta environments.

---

## Two Environments

| | Production | Beta / Preview |
| --- | --- | --- |
| URL | `https://songbook.<your-domain>.com` | `https://<staging-app>.<your-domain>.com` |
| App Host | **VPS** / Self-Hosted (Docker + Traefik) | **VPS** / Self-Hosted (Docker + Traefik) |
| Supabase | **prod** project / stack | **preview / staging** project / stack |
| App Deploy Trigger | Tagged Release / Push to `main` | Automatic GHCR build / branch trigger |
| DB Schema Deploy | Migrations applied to `_PROD` | Migrations applied to `_PREVIEW` |

Production and beta share **no data** — preview runs against the staging/preview Supabase stack.

---

## How the Application is Built

This repository outputs a standalone, environment-agnostic Docker image:

1. GitHub Actions (`.github/workflows/docker.yml`) builds the Next.js standalone application on push to `main` or release tag.
2. The Docker image is published to GitHub Container Registry (GHCR): `ghcr.io/<owner>/sacred-fire-songs:latest`.
3. The self-hosted Docker Compose stacks run the image behind Traefik.
4. Runtime API resolution resolves the Supabase connection keys dynamically at runtime without rebuilding the container.

---

## Deploying Code Changes

1. **Land your change on `main`** via pull request.
2. **GitHub Actions automatically builds and pushes** the updated Docker image to GHCR.
3. **On the host server**, pull the latest image and restart the container:
   ```bash
   docker compose pull && docker compose up -d
   ```

---

## Deploying Database Schema Changes

Schema changes are managed via `supabase/migrations/**`:

- Apply migrations to local `_DEV` environment: `supabase db reset`
- Apply migrations to `_PREVIEW` or `_PROD`: `supabase db push --db-url <target_db_url>`

---

## Refreshing Staging Data from Production

To synchronize staging data with production:

```bash
scripts/clone-prod-to-staging.sh          # interactive confirmation
scripts/clone-prod-to-staging.sh --yes    # skip the prompt
```

- Reads credentials from `.env.infrastructure` (gitignored).
- Copies `auth.users` + `auth.identities` + all `public` app data in a single atomic transaction.
- Skips transient auth sessions.
