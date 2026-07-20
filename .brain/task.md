# Task: Server Migration, App Standalone Pipelining, and Release v1.0.0

- [x] Modernize Next.js app with `output: 'standalone'` in `next.config.ts`
- [x] Implement dynamic runtime proxy route handler `app/supabase-api/[...path]/route.ts`
- [x] Add `release-please-config.json`, `.release-please-manifest.json`, and GitHub Actions workflows (`release-please.yml` & `docker.yml`)
- [x] Rename Supabase stacks in infrastructure repository
- [x] Rename app stacks in infrastructure repository
- [x] Configure `.env` files for application and database stacks
- [x] Fix Kong API Gateway credential mapping (`kong-runtime.yml`)
- [x] Migrate full production database dataset from Supabase Cloud to self-hosted database stack
- [x] Fix SSL certificate domain rules in Traefik
- [x] Restrict preview subdomains to private VPN using `tailscale-only@docker` middleware
- [x] Move deployment and environment documentation directly into stack `README.md` files in infrastructure repository
- [x] Audit open-source repository `sacred-fire-songs` for secrets / internal server information — 100% clean
- [x] Tag and publish release `v1.0.0` on GitHub
- [x] Close completed GitHub Issues (#202, #197, #171, #168, #183, #141)
- [x] Create and transfer performance benchmark chore issue to infrastructure repository
- [x] Delete merged remote branches (`feat/issue-141`, `feat/story-3.4.6-public-playlist-curation`)
