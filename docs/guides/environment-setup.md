# Infrastructure & Environment Guide

This guide explains our **3-Tier Architecture** and how **CI/CD** keeps everything in sync.

## 1. The 3-Tier Strategy

We use three separate environments to ensure stability and safety.

| Tier | Environment | URL | Database | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Local** | `localhost:3000` | Local Supabase | **Development**. Where you write code. Fast, offline-capable. |
| **2** | **Preview** | `git-feat-xyz.vercel.app` | **Staging DB** | **Testing**. Created automatically for every Pull Request. Used to verify features in the cloud. |
| **3** | **Production** | `sacred-fire-songs.com` | **Production DB** | **Live**. The real app used by members. Only updated via `main`. |

## 2. Setup Guide (One-Time)

### Step A: Supabase Projects
You need two separate projects in the Supabase Dashboard:
1.  **Sacred Fire Songs (PROD)**: The existing live database.
2.  **Sacred Fire Songs (STAGING)**: A new project for testing.
    *   *Note*: Copy the `Reference ID` and `DB Password` for both.

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
