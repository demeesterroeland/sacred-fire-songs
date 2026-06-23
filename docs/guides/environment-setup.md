# Infrastructure & Environment Guide

This guide explains our **4-Tier Architecture** and how **CI/CD** keeps everything in sync.

## 1. The 3-Tier Strategy

We use three separate environments to ensure stability and safety.

| Tier | Environment | URL | Database | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Local Frontend** | `localhost:3000` | — | **Development UI**. Fast, runs on your machine. |
| **2** | **DEV** | `dev.songbook.example.com` | <server> DEV Supabase | **Development DB**. Isolated DB for local dev. |
| **3** | **Preview** | `git-feat-xyz.vercel.app` | <server> Staging Supabase | **Testing**. Created for every PR. |
| **4** | **Production** | `sacred-fire-songs.com` | Supabase.com Production | **Live**. Real app used by members. |

## 2. Setup Guide (One-Time)

### Step A: Supabase Projects
You need three separate projects in the Supabase Dashboard:
1.  **Sacred Fire Songs (PROD)**: The existing live database (Supabase.com).
2.  **Sacred Fire Songs (STAGING)**: Hosted on <server> (`<staging-app>.example.com`).
3.  **Sacred Fire Songs (DEV)**: New DEV DB on <server> (`user@server`).
    *   *Note*: Copy the `Reference ID` and `DB Password` for each.

### Step B: GitHub Secrets
Go to **Repo Settings -> Secrets -> Actions** and set these exact keys:

| Secret Name | Value |
| :--- | :--- |
| `SUPABASE_ACCESS_TOKEN` | Your Personal Access Token (works for both projects) |
| `SUPABASE_PROJECT_ID` | Reference ID for **PROD** project |
| `SUPABASE_DB_PASSWORD` | DB Password for **PROD** project |
| `SUPABASE_PROJECT_ID_STAGING` | Reference ID for **STAGING** project |
| `SUPABASE_DB_PASSWORD_STAGING` | DB Password for **STAGING** project |

### Step C: Vercel Environment Variables
Go to **Vercel -> Settings -> Environment Variables**:

1.  **Production Environment**:
    *   `NEXT_PUBLIC_SUPABASE_URL`: (Your **PROD** URL)
    *   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: (Your **PROD** Key)

2.  **Preview Environment** (Uncheck Production/Development):
    *   `NEXT_PUBLIC_SUPABASE_URL`: (Your **STAGING** URL)
    *   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: (Your **STAGING** Key)

3.  **Development Environment** (optional, for `npm run dev`):
    *   `NEXT_PUBLIC_SUPABASE_URL_DEV`: (Your **DEV** URL)
    *   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV`: (Your **DEV** Key)

## 3. Automated CI/CD Pipelines

We use **GitHub Actions** to manage the Database and **Vercel** to manage the App.

### How it works
1.  **Feature Push (`feat/*`)**:
    *   **GitHub**: Deploys migrations to **Supabase STAGING**.
    *   **Vercel**: Deploys app to **Preview URL**.
    *   *Result*: You can test your new database changes on a live URL without breaking Production.

2.  **Merge to `main`**:
    *   **GitHub**: Deploys migrations to **Supabase PROD**.
    *   **Vercel**: Deploys app to **Production URL**.
    *   *Result*: The live site is updated.

## 4. Troubleshooting
*   **"Migration failed on Staging"**: Check the GitHub Action logs. Often caused by conflicting migrations or missing `DROP POLICY IF EXISTS`.
*   **"Preview app shows old data"**: Ensure the `NEXT_PUBLIC_SUPABASE_URL` in Vercel Preview settings is actually pointing to Staging, not Prod.
