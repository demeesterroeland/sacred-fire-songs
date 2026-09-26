# Task: Fix Kong API Gateway 401 Missing API Key Error for Rehearsal Audio Proxy

- [x] Investigate preview server Kong API Gateway (`songbook-preview-kong-1`) rejecting rehearsal proxy requests with "No API key found in request".
- [x] SSH to `root@bluette` and verify the `apikey` enforcement on Kong.
- [x] Modify Next.js proxy route handler (`app/supabase-api/[...path]/route.ts`) to inject the `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` into `apikey` and `Authorization: Bearer` headers if missing.
- [ ] Push to GitHub to trigger a build for `ghcr.io/demeesterroeland/sacred-fire-songs:fix-239-rehearsal-proxy-apikey`.
- [ ] Deploy new preview docker container (`docker compose pull app && docker compose up -d`) on preview server.
- [ ] Verify fix by listening to/downloading rehearsal audio on preview environment.
