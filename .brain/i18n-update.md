### Objective
Prepare and implement multi-language support (i18n) across the application. 

### Phase 1: Audit & Overview
Before implementing the technical solution, please create a comprehensive overview/document listing all the hardcoded English strings currently used in the application. This will serve as our baseline for extraction.

### Phase 2: Technical Proposal
Create a brief technical proposal detailing how we should handle internationalization. 

*Hint/Direction:* Review how i18n is implemented in our other internal Next.js projects. They use a very lightweight, custom TypeScript implementation rather than relying on heavy third-party libraries like \`next-intl\` or \`react-i18next\`. 

Their pattern typically includes:
- A simple \`lib/i18n/index.ts\` module exporting a custom \`t(key, params)\` string interpolation function.
- Strict TypeScript typing derived directly from the primary language dictionary keys.
- A \`LocaleProvider\` that handles setting the locale dynamically from \`localStorage\` post-hydration (to prevent React hydration mismatches on the server).
- Simple dictionary files (e.g., \`messages/en.ts\`, \`messages/nl.ts\`) exported as pure objects.

**Why this approach is often preferred over next-intl / react-i18next:**
1. **Zero React Hooks:** By using a pure TypeScript \`t()\` function instead of a \`useTranslation()\` hook, the translation function can be used *anywhere*—inside Server Components, Client Components, API routes, or generic utility scripts—without forcing components to become Client Components (\`"use client"\`).
2. **Minimal Bundle Size & Complexity:** Heavy libraries rely on complex Next.js middleware and URL rewrites (e.g., \`/en/dashboard\`) for server-side locale negotiation. This lightweight approach skips routing overhead, renders a default language on the server, and swaps to the user's \`localStorage\` preference purely on the client side post-hydration.
3. **Native Type Safety:** Because the custom \`t()\` lives directly next to the dictionary files, TypeScript perfectly infers every valid key without needing global type declarations or extra build steps. 

You can use that lightweight custom approach as a strong baseline/inspiration for doing i18n here, but it is not strictly enforced. Please outline the best approach for this app in your proposal!
