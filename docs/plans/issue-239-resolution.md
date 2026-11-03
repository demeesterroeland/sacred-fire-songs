# Issue #239 - rehearsal playback on a self-hosted preview (resolved)

Root cause: the browser's native `<audio>` element does not send the Supabase `apikey` header, so signed storage URLs behind a Kong gateway returned 401. Fix: the app proxies storage requests through `/supabase-api/[...path]`, which injects the key (see `docs/design/application-analysis&design.md`).

The environment-specific rollout notes live in the maintainer's private infra repository.
