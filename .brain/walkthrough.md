# Walkthrough: VPS Migration, App Standalone Pipelining, and Release v1.0.0

## Accomplishments

1. **Application Modernization & Build Pipeline**:
   - Configured `output: 'standalone'` in `next.config.ts`.
   - Created dynamic runtime route handler `app/supabase-api/[...path]/route.ts` to proxy requests to container environment variables dynamically at runtime.
   - Configured `release-please` and GitHub Actions GHCR Docker build pipeline (`docker.yml`).
   - Tagged and published official **`v1.0.0`** release on GitHub.

2. **<infra-repo> VPS Alignment & Data Migration**:
   - Renamed Supabase stacks: `supabase-prod` (`_PROD` DB) and `supabase-preview` (`_PREVIEW` DB).
   - Standardized application stacks: `stacks/<prod-stack>` (`https://songbook.example.com`) and `stacks/<staging-stack>` (`https://<staging-app>.example.com`).
   - Restored complete production database dataset from Supabase Cloud to self-hosted `supabase-prod-db` (14 auth users, 238 songs, 11 playlists).
   - Fixed Kong API Gateway credential mapping (`kong-runtime.yml`).
   - Secured `songbook-*.example.com` preview subdomains with Traefik `tailscale-only@docker` middleware restricting access to Tailscale VPN (`100.64.0.0/10`).
   - Placed complete stack documentation directly inside `stacks/<prod-stack>/README.md` and `stacks/<staging-stack>/README.md`.

3. **Issue & Branch Cleanup**:
   - Closed completed GitHub Issues: #202, #197, #171, #168, #183, #141.
   - Created & transferred performance benchmark issue to `<infra-repo>#104`.
   - Deleted merged remote branches (`feat/issue-141`, `feat/story-3.4.6-public-playlist-curation`).
   - Audited open-source repository `sacred-fire-songs` — 100% clean and free of secrets or internal deployment information.
