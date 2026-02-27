# Technology Stack: Sacred Fire Songs

## Core Frontend
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (PostCSS)
- **Animations:** Framer Motion

## Backend & Persistence
- **Platform:** Supabase (Backend-as-a-Service)
- **Database:** PostgreSQL (with Row Level Security)
- **Authentication:** Supabase Auth (Magic Links + Email/Password)
- **Storage:** Supabase Storage (for Avatars/Assets)
- **Client SDK:** @supabase/supabase-js, @supabase/ssr

## Data Management
- **State & Fetching:** TanStack React Query v5
- **Persistence:** @tanstack/react-query-persist-client (localStorage)
- **Forms:** React Hook Form
- **Caching:** Stale-While-Revalidate (SWR) patterns for offline PWA support

## Musical Toolkit
- **Parsing:** chordsheetjs (ChordPro & Text conversion)
- **Notation:** abcjs (Planned for melody rendering)

## Infrastructure & UI
- **Components:** Radix UI (Primitives)
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions (for Database migrations)
