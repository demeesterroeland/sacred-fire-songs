## 2026-07-14 (Mobile Search UX & Build Pipeline Fixes)

### 1. Mobile Search UX Debounce Safeguard
- Added active element focus check to the search debounce `useEffect` in `components/common/Header.tsx`.
- Prevents next.js routing/unmount transitions from overriding active searches with empty queries.

### 2. Client-Side Query Timeout Protection
- Implemented `withTimeout` utility in `app/songs/[id]/page.tsx` and wrapped database detail fetches.
- Ensures pages fail fast (4.5s in production) and offer Retry UI if connection pools are exhausted, while preserving 15s timeouts for local testing.

### 3. Next.js Compilation & Type Fixes
- Wrapped PostgREST builders with `Promise.resolve` and added type assertions in `app/songs/[id]/page.tsx`.
- Resolves TypeScript compilation crashes regarding PostgrestBuilder Promise interface compatibility.
- Added a fallback placeholder for `supabaseUrl` in `next.config.ts` to prevent empty environments from breaking compilation during production builds.

### 4. Vercel Preview Deployments
- Created `vercel.json` in `<parent-project>` root with custom build command configurations.
- Allows Vercel preview environments to invoke the custom `vercel-prepare.sh` script to check out submodules correctly.

### 5. Git Submodule Tracking Alignment & Clean Up
- Audited all branches of `<parent-project>` and configured `.gitmodules` to align submodule branches with parent branch names.
- Cleaned up obsolete branches (`feat/private-rehearsal` and `chore/agent-rules`) in both repositories.
