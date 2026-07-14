# Task: Mobile Search UX & Build Pipeline Fixes

- [x] Implement Header search input focus check safeguard to prevent query reset race conditions in `Header.tsx`
- [x] Add client-side database query timeout protection in `app/songs/[id]/page.tsx`
- [x] Resolve Next.js compilation/TypeScript errors by wrapping builders in `Promise.resolve` and adding assertions in `app/songs/[id]/page.tsx`
- [x] Fix Vercel preview builds by adding `vercel.json` configuration in `<parent-project>`
- [x] Align submodule branch tracking across all active branches and delete obsolete branches
