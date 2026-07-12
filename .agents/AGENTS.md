# Verification Rule

- **Preview Deployment Verification**: Always ask the user to verify the finished development on the Vercel Preview website before merging any branch to `main`. Do not merge automatically without explicit user confirmation of verification.

# Database Environment Rule

- **Database Separation**:
  - **Development (DEV)**: Use the locally installed Supabase stack for local development.
  - **Testing (TEST/E2E)**: Use the remote `server` database via Tailscale (as configured in `.env.test`).
  - **Vercel Preview**: Auto-deployed per branch/PR — uses the **staging** Supabase project (`REDACTED_STAGING_PROJECT_ID`).
  - **Beta (`<staging-app>.example.com`)**: VPS Docker build, pinned to a commit SHA — uses **staging** Supabase.
  - **Production (Vercel `main`)**: Uses the **production** Supabase project. Never point preview/test environments at prod.
