# Walkthrough: Server Migration, App Standalone Pipelining, and Release v1.0.0

## Accomplishments

1. **Application Modernization & Build Pipeline**:
   - Configured `output: 'standalone'` in `next.config.ts`.
   - Created dynamic runtime route handler `app/supabase-api/[...path]/route.ts` to proxy requests to container environment variables dynamically at runtime.
   - Configured `release-please` and GitHub Actions GHCR Docker build pipeline (`docker.yml`).
   - Tagged and published official **`v1.0.0`** release on GitHub.

2. **Infrastructure Realignment & Data Migration**:
   - Renamed Supabase stacks: `stacks/supabase-prod` (`_PROD` DB) and `stacks/supabase-preview` (`_PREVIEW` DB).
   - Standardized application stacks: `stacks/<prod-stack>` and `stacks/<staging-stack>`.
   - Restored complete production database dataset from Supabase Cloud to self-hosted database stack (14 auth users, 238 songs, 11 playlists).
   - Fixed Kong API Gateway credential mapping (`kong-runtime.yml`).
   - Secured preview subdomains with Traefik `tailscale-only@docker` middleware restricting access to private VPN.
   - Placed complete stack documentation directly inside `stacks/<prod-stack>/README.md` and `stacks/<staging-stack>/README.md`.

3. **Issue & Branch Cleanup**:
   - Closed completed GitHub Issues: #202, #197, #171, #168, #183, #141.
   - Created & transferred performance benchmark issue to infrastructure repository.
   - Deleted merged remote branches (`feat/issue-141`, `feat/story-3.4.6-public-playlist-curation`).
   - Audited open-source repository `sacred-fire-songs` — 100% clean and free of secrets or internal deployment information.
