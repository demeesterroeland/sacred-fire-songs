# Verification Rule

- **Preview Deployment Verification**: Always ask the user to verify the finished development on the Vercel Preview website before merging any branch to `main`. Do not merge automatically without explicit user confirmation of verification.

# Database Environment Rule

- **Database Separation**:
  - **Development (DEV)**: Use the locally installed Supabase stack for local development (dev environment).
  - **Testing (TEST/E2E)**: Use the remote `server` database via Tailscale for E2E tests and test environments (as configured in `.env.test`).
