# Issue 239: Rehearsal Proxy API Key Missing (Kong 401)

## 🕵️ The Problem & Root Cause

**Issue:** 
Rehearsal audio playback and downloading worked perfectly in local development but failed on the `songbook-preview` server. The browser's native `<audio>` element was failing to load the stream, and clicking download resulted in downloading a `.json` file containing `{"message":"No API key found in request"}` instead of an audio file.

**Root Cause Investigation:**
1. The preview environment (`songbook-preview`) runs its own self-hosted Supabase stack, which includes the **Kong API Gateway**.
2. Kong acts as the front door for Supabase storage requests. It strictly enforces the presence of the `apikey` header and the `Authorization: Bearer <key>` header.
3. Our application uses a Next.js proxy route (`app/supabase-api/[...path]/route.ts`) to hide the Supabase URL and bypass CORS/Auth issues.
4. When the browser's native HTML5 `<audio src="...">` or `<a download>` makes a request to our Next.js proxy, the browser **does not** automatically attach any custom `apikey` headers.
5. Our Next.js proxy was blindly forwarding the incoming headers. Because the browser omitted the `apikey`, the proxy forwarded a request without it.
6. Kong intercepted the request and immediately rejected it with `HTTP 401 Unauthorized: No API key found in request`.

*(Note: In local development, the local Supabase CLI is slightly more permissive for public buckets on direct proxy hits, masking the issue).*

## 🛠️ The Fix

We implemented two critical fixes on the `fix/239-rehearsal-proxy-apikey` branch:

1. **Proxy Header Injection (`app/supabase-api/[...path]/route.ts`)**:
   We updated the proxy to automatically inject the API key if it's missing from the incoming request.
   ```typescript
   const apiKey = isDev ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
   if (apiKey) {
     if (!headers.has('apikey')) {
       headers.set('apikey', apiKey);
     }
     if (!headers.has('authorization')) {
       headers.set('authorization', `Bearer ${apiKey}`);
     }
   }
   ```

2. **CI Pipeline Trigger (`.github/workflows/docker.yml`)**:
   We discovered the `branches: ["*"]` trigger was ignoring branches with slashes in their name (like `fix/239-rehearsal-proxy-apikey`). We updated it to `branches: ["**"]` to correctly trigger builds for all feature branches.

## 🚀 Current Status

- Both fixes have been committed and pushed to `origin/fix/239-rehearsal-proxy-apikey`.
- GitHub Actions has successfully built the branch-specific Docker image: 
  `ghcr.io/demeesterroeland/sacred-fire-songs:fix-239-rehearsal-proxy-apikey`
- The worktree is fully prepped at `.worktrees/issue-239` (with `.env.local` symlinked).

## 📋 Next Steps (For the Next Session)

When you resume work, follow these steps to deploy and verify the fix:

1. **Deploy to Preview:**
   - Connect to `bluette` via SSH.
   - Edit the stack configuration: `/opt/dockge/stacks/songbook-preview/docker-compose.yaml`
   - Temporarily change the `app` service image to use the branch tag:
     `image: ghcr.io/demeesterroeland/sacred-fire-songs:fix-239-rehearsal-proxy-apikey`
   - Run: `docker compose pull app && docker compose up -d`

2. **Verify on Preview:**
   - Navigate to `https://songbook-beta.bluette.be`.
   - Test playing a rehearsal audio file.
   - Test downloading a rehearsal audio file.

3. **Promote to Production:**
   - Once verified, return to the `.worktrees/issue-239` local directory.
   - Run the hybrid release script: `scripts/promote-to-production.sh`
   - Provide a user-facing release summary for self-hosters.
   - Update the production environment (`songbook-prod`) with the newly generated `v1.x.x` tag.
