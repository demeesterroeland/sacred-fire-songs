# Infrastructure & Environment Guide

This guide explains our **3-Tier Architecture** and deployment topology for **Sacred Fire Songs**.

---

## 1. Environment Topology (`_DEV`, `_PREVIEW`, `_PROD`)

We use three separate database & application environments to ensure stability and safety:

| Tier | Environment | Target App Domain | Database | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **`_DEV`** | `http://localhost:3000` | Local Supabase (`127.0.0.1:54321`) | **Local Development**. Fast local iterations and unit testing. |
| **2** | **`_PREVIEW`** | `https://<staging-app>.<your-domain>.com` | Self-Hosted `_PREVIEW` Supabase | **Staging / PR Previews**. Testing feature branches and pull requests. |
| **3** | **`_PROD`** | `https://songbook.<your-domain>.com` | Self-Hosted `_PROD` Supabase | **Production**. Real application used by members. |

---

## 2. Environment Configuration

### Local `.env.local` Setup for `_DEV`

Create a `.env.local` file (gitignored) in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL_DEV=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV=<local_anon_key_from_supabase_status>
```

Start the local Supabase stack and reset seeds:
```bash
supabase start
supabase db reset
```

---

## 3. GitHub Actions & Secrets

Go to **Repo Settings -> Secrets -> Actions** to configure pipeline secrets:

| Secret Name | Purpose |
| :--- | :--- |
| `RELEASE_PLEASE_TOKEN` | Fine-grained GitHub PAT with `contents: write` and `pull-requests: write` permissions for release automation. |
| `GITHUB_TOKEN` | Built-in token for publishing Docker images to GitHub Container Registry (`ghcr.io`). |

---

## 4. Docker Deployment Strategy

- **Standalone Output**: Next.js builds a self-contained Node server (`output: 'standalone'`).
- **Container Registry**: Images are published automatically on `main` push or version tag to `ghcr.io/<owner>/sacred-fire-songs:latest`.
- **Runtime Resolution**: API endpoints and publishable keys are resolved dynamically at runtime inside the container via `app/layout.tsx` and `app/supabase-api/[...path]/route.ts`.
