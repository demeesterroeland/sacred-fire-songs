# Product Guidelines: Sacred Fire Songs

## Prose Style & Voice
- **The Voice:** Warm, ceremonial, and welcoming. The application should speak as a host of the fire, using community-oriented language that honors the oral traditions.
- **The Tone:** Reverent yet practical. 
- **Example:** Instead of "Registration successful," use "Welcome at the fire, [Name]. Your journey begins here."

## Naming & Metadata
- **Medicine:** Use "Medicine" or "Songs" interchangeably to refer to the core content.
- **Keepers:** Refer to Admins and Curators as "Keepers of the Fire" or "Keepers."
- **The Hearth:** Refer to personal collections (favorites/setlists) as "Your Hearth."
- **The Circle:** Refer to the community or registered users as "The Circle."

## UI & Design Principles
- **Glassmorphism Aesthetic:** Utilize dark mode with semi-transparent backgrounds, subtle blurs, and emerald/amber gradients.
- **High Readability:** Prioritize large, clear typography (sans-serif) with high contrast for use in low-light ceremonial environments.
- **Micro-Interactions:** Implement smooth entrance animations (e.g., "Fire Embers" CSS effects) and tactical feedback for button clicks and toggles.
- **Visual Hierarchy:** Essential song content (Title, Lyrics) must be the primary focus, with metadata and controls secondary.

## UX Rules & Patterns
- **Fast Navigation:** A user should be able to reach any song's lyrics within 2 clicks from the home screen.
- **Offline-First:** All core viewing and navigation actions must be fully functional without an internet connection once the PWA is cached.
- **Contextual Nudges (Soft Gating):** Avoid hard redirects to login. Use modals or toasts to explain the value of an account (e.g., "Join the circle to save this medicine to your hearth").
- **State Preservation:** Always preserve user input (e.g., song edits or search filters) during navigation or login prompts.
