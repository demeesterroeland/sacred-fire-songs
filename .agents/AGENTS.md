# Verification Rule

- **Preview Deployment Verification**: Always ask the user to verify the finished development on the Vercel Preview website before merging any branch to `main`. Do not merge automatically without explicit user confirmation of verification.

# Database Environment Rule

- **Database Separation**:
  - **Development (DEV)**: Use the locally installed Supabase stack for local development.
  - **Testing (TEST/E2E)**: Use the remote `server` database via Tailscale (as configured in `.env.test`).
  - **Vercel Preview**: Auto-deployed per branch/PR — uses the **staging** Supabase project (`REDACTED_STAGING_PROJECT_ID`).
  - **Beta (`<staging-app>.example.com`)**: VPS Docker build, pinned to a commit SHA — uses **staging** Supabase.
  - **Production (Vercel `main`)**: Uses the **production** Supabase project. Never point preview/test environments at prod.

- **Staging Database Activity Check**: If Vercel Preview, Beta, or any DEV environment using Supabase staging returns zero songs, **always check first if the staging Supabase project (`REDACTED_STAGING_PROJECT_ID`) is running** (as it may have been automatically paused due to inactivity).

# Git Submodule Management Rule

- **Submodule Branch Alignment**: The `branch` configuration key in `.gitmodules` for the `engine` submodule inside `<parent-project>` must **always match** the active branch name of the parent `<parent-project>` repository (e.g. branch `feat/xyz` tracks `feat/xyz` in `.gitmodules`, with `main` tracking `main`).
- **Submodule URL Mapping**: The submodule URL must always be a relative path pointing to `../sacred-fire-songs.git` to ensure compatibility across all remote and staging build environments.
