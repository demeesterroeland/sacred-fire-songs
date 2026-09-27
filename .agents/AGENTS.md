# Verification Rule

- **Preview Deployment Verification**: Always ask the user to verify the finished development on the preview website before merging any branch to `main`. Do not merge automatically without explicit user confirmation of verification.
- **NEVER Auto-Merge**: NEVER merge a Pull Request to `main` without explicit, unambiguous permission from the user.
- **NEVER Auto-Close Issues**: NEVER use the GitHub CLI or APIs to close issues without explicit instruction from the user. Only the user should decide when an issue is fully verified and ready to be closed.

# Artifact Synchronization Rule

- **Feature Branch Logbook Sync**: Always commit logbook artifact updates (`master-walkthrough.md`, `master-tasks.md`, `master-timetracking.md`) directly on the feature branch **before** opening a Pull Request or merging to `main`. Never push artifact updates directly to `main`.

# Database Environment Rule

- **Database Separation**:
  - **Development (DEV)**: Use the locally installed Supabase CLI stack (`npx supabase start` at `http://127.0.0.1:54321`) for local development via `.env.local` (`NEXT_PUBLIC_SUPABASE_URL_DEV` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV`).
  - **Testing (TEST/E2E)**: Use the isolated testing database (configured in `.env.test`).
  - **Preview**: Auto-deployed per branch/PR — uses the **staging** Supabase project.
  - **Beta**: Self-hosted Docker build, pinned to a commit SHA — uses **staging** Supabase.
  - **Production**: Uses the **production** Supabase project. Never point preview/test environments at prod.

- **Staging Database Activity Check**: If Preview, Beta, or any DEV environment using Supabase staging returns zero songs, **always check first if the staging Supabase project is running** (as it may have been automatically paused due to inactivity).

# Repository Isolation Rule

`sacred-fire-songs` is a **public open-source project**. It must NEVER contain references to private deployment infrastructure. Specifically:

- **No private hostnames**: Do not mention `app.songbook.rocks`, `songbook.bluette.be`, `songbook-beta.bluette.be`, or any VPS/Hetzner domain.
- **No parent project references**: Do not mention `songbook-rocks` in issues, comments, docs, or code.
- **No Vercel project names or URLs**: Keep all Vercel-specific deployment config out of this repo.
- **No deployment performance scripts**: Benchmark scripts targeting live production/staging endpoints belong in `songbook-rocks/testing/performance/`, not here.
- **Allowed**: Unit tests, Playwright E2E tests, local Supabase dev setup, and generic open-source documentation.
