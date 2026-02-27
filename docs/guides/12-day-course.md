# 11-Day Modern Web Development Curriculum: The Sacred Fire Songs Project

**Version:** 1.4
**Status:** Draft
**Date:** January 10, 2026

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Dec 25, 2025 | Initial Document Creation. Defined 10-day curriculum for Next.js/Supabase. |
| **1.1** | Dec 29, 2025 | Inserted "Day 7: Bringing the Application to Life" (Animations). Merged Parsing logic into Day 6. |
| **1.2** | Dec 29, 2025 | Added "Day 11: Automated Quality & CI/CD" (E2E Testing). |
| **1.3** | Dec 29, 2025 | Inserted "Day 8: Production & Deployment". Renamed to 12-Day Curriculum. |
| **1.4** | Jan 10, 2026 | Changed project name to Sacred Fire Songs. |


**Student Profile:** Physics/IT Master, Exp. Software Engineering Teacher.
**Goal:** Build a PWA (Next.js/Supabase) while updating programming skills.

## Phase 1: The Paradigm Shift (Language & Framework)

### Day 1: TypeScript - The Bridge from Java/.NET

**Concept:** JavaScript is loosely typed (chaos). TypeScript brings back the strict typing, interfaces, and compile-time checks you are used to in Java.

* **Theory:**

  * `var` is dead. Use `const` (immutable reference) and `let`.

  * **Interfaces:** Similar to Java Interfaces but for data shapes (JSON), not just class contracts.

  * **Generics:** You know `<T>` from Java/C#. It works the same here.

* **Action:**

  * Initialize the Next.js project using the terminal (you know Linux, so use `npx create-next-app`).

  * **Task:** Create a `types.ts` file. Define the interfaces for `Song`, `Composition`, and `User` based on the **Design Document Section 5.2**.

  * *Example:* `interface Song { id: string; title: string; key: string; ... }`

### Day 2: React & Next.js - Components vs. Classes

**Concept:** In old OOP, you built Class Hierarchies. In React, you build **Component Trees**. A Component is just a function that returns HTML (JSX).

* **Theory:**

  * **JSX:** It looks like HTML mixed with JS.

  * **Props:** These are just function arguments passed from a Parent to a Child component.

  * **Server vs. Client Components:** Next.js renders code on the server (like PHP/JSP used to) but "hydrates" it on the client.

* **Action:**

  * Analyze the generated `doc/screens/screen1_home.html` code.

  * **Task:** Break Screen 1 into React Components: `Header.tsx`, `SearchBar.tsx`, `SongCard.tsx`.

  * Pass data (Props) into `SongCard` (e.g., `<SongCard title="Grandmother Earth" key="Am" />`).

## Phase 2: The UI & Styling (Visuals)

### Day 3: Tailwind CSS - Utility First

**Concept:** Forget writing separate `.css` files with cascading inheritance hell. Tailwind applies styles directly in HTML classes. It feels like "inline styles" but with a design system constraints.

* **Theory:**

  * Flexbox & Grid: The physics of layout. `flex-row`, `items-center`, `justify-between`.

  * Dark Mode: `dark:bg-gray-900`.

* **Action:**

  * **Task:** Implement the visual layout of **Screen 1** using Tailwind.

  * Use your Linux skills to run the dev server (`npm run dev`) and see changes live (Hot Reloading).

  * *Challenge:* Make the search bar "Sticky" using `sticky top-0`.

### Day 4: State Management - Hooks

**Concept:** In desktop apps, you modify variables directly. In React, variables are immutable. You use "Hooks" (`useState`) to request a re-render.

* **Theory:**

  * `useState`: "Preserve this variable between renders."

  * `useEffect`: "Run this code when the component mounts" (like a Constructor + Destructor combined).

* **Action:**

  * **Task:** Make the Search Bar on Screen 1 functional (locally).

  * Create a list of mock songs. Filter that list based on what you type in the input.

  * *Key Learning:* Input `onChange` events.

## Phase 3: The Backend & Data (Database)

### Day 5: Supabase - Postgres for the Web

**Concept:** You taught databases, so SQL is second nature. Supabase is just PostgreSQL wrapped in a REST/Websocket API.

* **Theory:**

  * RLS (Row Level Security): Security logic lives in the Database, not just the App Code.

* **Action:**

  * Go to Supabase.com, create the project.

  * **Task:** Open the SQL Editor in Supabase. Paste and run the `supabase_schema.sql` provided in our previous chat.

  * Insert 3 dummy rows into the `compositions` and `song_versions` tables using SQL `INSERT` statements.

### Day 6: Connecting Backend & The Logic of Songs

**Concept:** Combining high-level data fetching with low-level parsing. JavaScript is a language of Promises and Patterns.

* **Theory:**
  * `async/await`: Handling database latency gracefully.
  * **ChordPro Parsing:** Using Regular Expressions or Parsers (`chordsheetjs`) to turn text into UI structures.

* **Action:**
  * **Task:** Fetch the list of songs from Supabase and display them on Screen 1.
  * **Task:** Implement the `SongDisplay` component. Use the algorithm to map bracketed chords `[Am]` above the correct lyrics.

## Phase 4: The Experience & Persistence

### Day 7: Bringing the Application to Life 🌟

**Concept:** Soul over Syntax. Moving from a "tool" to an "experience" using animations and micro-interactions.

* **Theory:**
  * **Framer Motion:** High-performance declarative animations for React.
  * **Micro-interactions:** Subtle transitions, loading skeletons, and "Ceremony Mode" aesthetics.

* **Action:**
  * **Task:** Install `framer-motion`. Implement smooth page transitions between the list and detail views.
  * **Task:** Create "Loading Skeletons" so the app feels fast even when the database is slow.
  * **Task:** Design a custom 404 "Song Not Found" page that keeps the medicine-song theme.

### Day 8: React Query & Caching (The PWA Part)

**Concept:** Stale-While-Revalidate. Don't fetch data every time. Fetch it, cache it, show the cache, update in background. Crucial for offline apps.

**Concept:** Stale-While-Revalidate. Don't fetch data every time. Fetch it, cache it, show the cache, update in background. Crucial for offline apps.

* **Theory:**

  * TanStack Query: The standard library for async state.

  * `localStorage`: The browser's tiny SQL-lite/Key-Value store.

* **Action:**

  * **Task:** Wrap your Supabase fetch (Day 6) in a `useQuery` hook.

  * Turn off your WiFi. See if the app still shows the songs (simulating the forest ceremony environment).

### Day 9: Deployment & CI/CD

**Concept:** "It works on my machine" is solved by containers and serverless functions. Vercel handles the DevOps.

* **Theory:**

  * Git: You likely know this.

  * CI/CD: Automated build pipeline.

* **Action:**

  * Push your code to GitHub.

  * Connect GitHub to Vercel.

  * **Task:** Deploy the live URL. Open it on your actual mobile phone. Add it to your Home Screen (PWA install).

## Phase 6: The Modern Developer Workflow

### Day 10: AI-Assisted Debugging & Review

**Concept:** You are the pilot; AI is the co-pilot. Learning to prompt for code is a skill you already taught for Linux, now apply it to code generation.

* **Action:**

  * **Task:** Use Cursor/AI to refactor a messy component.

  * **Task:** Intentionally break your SQL query. Use the Browser DevTools (Network Tab) to find the error.

  * **Retrospective:** Review the roadmap. Plan Phase 2 (Melody/ABC notation).

## Phase 7: Automated Quality & Infrastructure

### Day 11: Automated UI Testing & CI/CD 🛡️

**Concept:** Reliability at Scale. Ensuring that new changes don't break existing features (Regression Testing) and automating the verification process in the cloud.

* **Theory:**
  * **E2E Testing (Playwright):** Testing the app like a real user—clicking buttons, filling forms, and verifying transitions.
  * **Unit vs. Integration vs. E2E:** Understanding the Testing Pyramid.
  * **Browserless Testing:** Running tests in a "headless" environment for speed and CI compatibility.

* **Action:**
  * **Task:** Install **Playwright**. Write a test that visits the Home page, types into the Search bar, and verifies that the correct `SongCard` remains.
  * **Task:** Write a "Navigation" test that clicks a card and ensures the URL changes to `/songs/[id]`.
  * **Task:** Integrate tests into GitHub Actions (or Vercel Checks). Ensure that a "Pull Request" cannot be merged if tests fail.

### Day 12: The Musician's Toolkit & PWA Polish 🎸

**Concept:** The "Love" in MLP. Adding the features that make the app truly useful for a musician in a ceremony.

* **Action:**
  * **Task:** Implement **Audio Player** (SoundCloud/MP3) for song reference (Story 1.3.2).
  * **Task:** Implement **Transposition Logic**. Create a helper function to shift chords (+1/-1 semitone) and update the UI (Story 2.1.1).
  * **Task:** Final Polish: Generate proper PWA icons/splash screens and ensure "Add to Home Screen" looks professional.

### Day 13: Users, Roles & The Community 👥

**Concept:** Authentication vs. Authorization. Who are you, and what can you do?

* **Action:**
  * **Task:** Implement **Social Login** (Google/GitHub) using Supabase Auth Helpers (Story 3.1.1).
  * **Task:** Create **Protected Routes**. Ensure `/admin` is only accessible by users with the `admin` role.
  * **Task:** Implement **"My Favorites"**. A personal collection for logged-in users (Story 3.1.2).

## Recommended Tools for You

1. **Cursor (IDE):** It allows you to query your codebase. "Where is the logic for transposition?" -> It takes you there.

2. **Chrome DevTools:** Press F12. The "Console" is your stdout. The "Network" tab is your traffic monitor.

3. **TypeScript Playground:** A website to test pure logic without React overhead.
