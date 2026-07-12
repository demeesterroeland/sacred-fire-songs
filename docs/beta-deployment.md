# Beta Deployment Guide

**Version:** 1.0
**Status:** Living Document
**Date:** June 9, 2026

How to deploy Sacred Fire Songs to the **beta** environment at
**https://<staging-app>.example.com**.

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Jun 9, 2026 | Initial guide. Beta self-hosted on the VPS (<infra-repo>) against the staging Supabase project. |

---

## Two environments

| | Production | Beta |
| --- | --- | --- |
| URL | (Vercel domain) | `<staging-app>.example.com` |
| App host | **Vercel** (git auto-deploy) | **VPS** via the private `<infra-repo>` repo (Docker + Traefik) |
| Supabase | **prod** project | **staging** project (`REDACTED_STAGING_PROJECT_ID`) |
| App deploy trigger | push/merge to `main` | bump a pinned commit SHA in `<infra-repo>` + rebuild |
| DB schema deploy | migrations pushed on `main` | migrations pushed on a `feat/**` / `fix/**` / `chore/**` branch |

Production and beta share **no data** — beta runs against staging Supabase.

## How beta is built

This repository is the single source of truth. The infra repo
(`<infra-repo>/stacks/songbook/`) holds a `Dockerfile` that:

1. Clones this **public** repo at a pinned `SONGS_SHA`.
2. Runs `npm ci` → `next build` → `next start` on port 3000.
3. Is published behind Traefik at `<staging-app>.example.com`.

The Supabase connection values (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, pointing at **staging**) are **baked in at
build time** — they ship in the client bundle, so changing them requires a
**rebuild**, not just a restart.

> The stack is named `songbook` but the public hostname keeps the `-beta` suffix.

---

## Deploying an app (code) change to beta

App code reaches beta by pinning the infra build to a newer commit of this repo.

1. **Land your change on `main`** (via a verified feature branch — direct commits
   to `main` are forbidden). Note the resulting commit SHA, e.g. `git rev-parse origin/main`.
   *(Any pushed commit SHA works; `main` is just the convention for beta.)*
2. **In the `<infra-repo>` repo**, edit `stacks/songbook/Dockerfile`:
   ```dockerfile
   ARG SONGS_SHA=<new-commit-sha>
   ```
   Commit on a branch, open a PR, merge.
3. **On the VPS**, pull the infra repo and **rebuild** the `songbook` stack — via the
   <stack-manager> UI (Build → Restart) or `docker compose up -d --build`.
   *(VPS / SSH specifics live in the private `<infra-repo>` repo.)*
4. **Verify:** open `https://<staging-app>.example.com` and confirm your change is live.

A plain restart will **not** pick up new code — the image must be rebuilt at the new SHA.

---

## Deploying a database (schema) change to beta

Schema is handled by the `Deploy Database Schema` GitHub Action
(`.github/workflows/deploy-db.yml`), triggered by changes under `supabase/migrations/**`:

- **Push to a `feat/**` / `fix/**` / `chore/**` branch → deploys to STAGING** (= beta).
- **Push/merge to `main` → deploys to PRODUCTION.**

So the normal flow is:

1. Add a migration under `supabase/migrations/` on your feature branch (also update
   `docs/design/db-schema.sql` per the repo's doc-sync rules).
2. Push the branch → the action runs `supabase db push` against **staging** automatically.
   Confirm success in the **Actions** tab.
3. When you later merge to `main`, the same migration is pushed to **prod**.

Required GitHub Actions secrets (already configured): `SUPABASE_ACCESS_TOKEN`,
`SUPABASE_DB_PASSWORD_STAGING`, `SUPABASE_PROJECT_ID_STAGING` (and the non-`_STAGING`
variants for prod).

---

## Refreshing staging data from production

Schema migrations don't copy **content**. To make staging a faithful copy of prod
(accounts + all app data):

```bash
scripts/clone-prod-to-staging.sh          # interactive confirmation
scripts/clone-prod-to-staging.sh --yes    # skip the prompt
```

- Reads credentials from `.env.infrastructure` (gitignored).
- Copies `auth.users` + `auth.identities` + all `public` app data in a single
  transaction (safe: on any error staging is left untouched).
- Skips transient auth tables (sessions/tokens) — users simply re-authenticate with
  their existing passwords.
- Does **not** transfer `storage` objects — staging keeps its own bucket.

> ⚠️ **PII / exposure:** after a clone, staging holds **real user accounts** (emails,
> password hashes), and beta is **publicly reachable**. If that is not acceptable,
> use seeded test accounts instead, or enable the BasicAuth gate provided in
> `<infra-repo>/stacks/songbook/docker-compose.yaml`.

---

## Gotchas & checklist

- [ ] `NEXT_PUBLIC_*` are build-time — changing them needs a **rebuild**.
- [ ] New app code needs a **SHA bump + rebuild**, not a restart.
- [ ] Supabase **auth redirect URLs** for the staging project must include
      `https://<staging-app>.example.com/**`, or magic-link / OTP / password-reset
      logins fail with `redirect_to is not allowed`.
- [ ] Staging `storage` bucket may be empty (avatars won't render) until recreated.
- [ ] DNS for `<staging-app>.example.com` is covered by a `*.example.com` wildcard — no
      per-host record needed.

## Related

- Infra stack + VPS specifics: `<infra-repo>/stacks/songbook/README.md` (private repo).
- DB CI: `.github/workflows/deploy-db.yml`.
- Staging clone: `scripts/clone-prod-to-staging.sh`.
