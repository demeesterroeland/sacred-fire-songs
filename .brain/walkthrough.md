## 2026-07-15 (Add Guaraní and Camino Rojo categories)

### 1. Database Seed Updates
- Directly updated the production and staging databases to insert "Guaraní" (Languages category) and "Camino Rojo" (Lineage & Tradition category) subcategories.
- Updated the consolidated database schema setup [db-schema.sql](file:///home/roeland/projects/sacred-fire-songs/docs/design/db-schema.sql) to include the new categories in the master seed block and bumped the file version to `2.7`.
- Updated the programmatic database seeder [random-seeder.mjs](file:///home/roeland/projects/sacred-fire-songs/scripts/random-seeder.mjs) and legacy category script [categories.sql](file:///home/roeland/projects/sacred-fire-songs/data/scripts/legacy/categories.sql) to include the new category insertions.

### 2. Story 3.4.6 / Issue #197 Creation
- Created GitHub issue #197 for Story 3.4.6 (Admin and Gatekeeper curation of Public Playlists).
- Updated [epic&user stories.md](file:///home/roeland/projects/sacred-fire-songs/docs/logbook/epic&user stories.md) with the new story's description, Gherkin scenarios, and updated the Roles & Permissions table to reflect the new capabilities.
