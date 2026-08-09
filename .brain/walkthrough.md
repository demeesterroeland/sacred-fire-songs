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
4. **Email Service & Authentication Migration Fix**:
   - **Root Cause Identified**: GoTrue Auth containers in `supabase-prod` and `supabase-preview` were missing SMTP credentials (`SMTP_HOST=`, `SMTP_USER=`) and were isolated on bridge networks with `internal: true`, preventing outbound DNS resolution and TCP traffic to external SMTP servers (`smtp.gmail.com:587`).
   - **Network & Gateway Fix**: Added the `proxy` network to `auth` service definitions in `stacks/supabase-prod/docker-compose.yaml` and `stacks/supabase-preview/docker-compose.yaml`.
   - **Environment Configuration**: Configured Gmail SMTP settings (`smtp.gmail.com:587`), `SITE_URL`, `API_EXTERNAL_URL`, and `ADDITIONAL_REDIRECT_URLS` in `.env` files for both `supabase-prod` and `supabase-preview`.
   - **Traefik v3 Routing**: Updated `<staging-stack>` Traefik routing rule to support `Host(`staging.example.com`) || HostRegexp(`songbook-[a-z0-9-]+\\.<server>\\.be`)`.
   - **Preview Verification**: Verified that `<staging-stack>` runs the latest release container (`ghcr.io/demeesterroel/sacred-fire-songs:latest`), `supabase-preview-db` is loaded with the 80-song randomized preview/beta dataset and 4 seed users (`roel.de.meester+admin@gmail.com`, etc.), and both magic link and password recovery emails execute cleanly with HTTP 200 responses.
