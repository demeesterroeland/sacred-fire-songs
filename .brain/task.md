# Task: VPS Migration, App Standalone Pipelining, and Release v1.0.0

- [x] Modernize Next.js app with `output: 'standalone'` in `next.config.ts`
- [x] Implement dynamic runtime proxy route handler `app/supabase-api/[...path]/route.ts`
- [x] Add `release-please-config.json`, `.release-please-manifest.json`, and GitHub Actions workflows (`release-please.yml` & `docker.yml`)
- [x] Rename Supabase stacks in `<infra-repo>` (`supabase-prod` and `supabase-preview`)
- [x] Rename app stacks in `<infra-repo>` (`stacks/<prod-stack>` and `stacks/<staging-stack>`)
- [x] Configure `.env` files for all 4 stacks on VPS (`user@server`)
- [x] Fix Kong API Gateway credential mapping (`kong-runtime.yml`)
- [x] Migrate full production database dataset from Supabase Cloud to VPS `supabase-prod-db` (14 auth users, 238 songs, 11 setlists)
- [x] Fix SSL certificate domain rules in Traefik for `songbook.example.com` and `<staging-app>.example.com`
- [x] Restrict `songbook-*.example.com` preview subdomains to Tailscale VPN (`100.64.0.0/10`) using `tailscale-only@docker` middleware
- [x] Move deployment and environment documentation directly into stack `README.md` files in `<infra-repo>`
- [x] Audit open-source repository `sacred-fire-songs` for secrets / internal server information — 100% clean
- [x] Tag and publish release `v1.0.0` on GitHub
- [x] Close completed GitHub Issues (#202, #197, #171, #168, #183, #141)
- [x] Create and transfer performance benchmark chore issue to `<infra-repo>#104`
- [x] Delete merged remote branches (`feat/issue-141`, `feat/story-3.4.6-public-playlist-curation`)
