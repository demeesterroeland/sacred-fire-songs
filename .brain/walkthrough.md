## 2026-07-15 (Add Guaraní and Camino Rojo categories)

### 1. Database Seed Updates
- Directly updated the production and staging databases to insert "Guaraní" (Languages category) and "Camino Rojo" (Lineage & Tradition category) subcategories.
- Updated the consolidated database schema setup [db-schema.sql](file:///home/roeland/projects/sacred-fire-songs/docs/design/db-schema.sql) to include the new categories in the master seed block and bumped the file version to `2.7`.
- Updated the programmatic database seeder [random-seeder.mjs](file:///home/roeland/projects/sacred-fire-songs/scripts/random-seeder.mjs) and legacy category script [categories.sql](file:///home/roeland/projects/sacred-fire-songs/data/scripts/legacy/categories.sql) to include the new category insertions.

### 2. Story 3.4.6 / Issue #197 Creation
- Created GitHub issue #197 for Story 3.4.6 (Admin and Gatekeeper curation of Public Playlists).
- Updated [epic&user stories.md](file:///home/roeland/projects/sacred-fire-songs/docs/logbook/epic&user stories.md) with the new story's description, Gherkin scenarios, and updated the Roles & Permissions table to reflect the new capabilities.

## 2026-07-16 (Song Reorganization & Production DB Sync)

### 1. Reorganization of Extracted Songs
- Moved tracked songbook folders (`Campfire_Songs`, `More_Ceremony_Songs`, and `World_Music_Songs`) from `doc/extracted_songs` to `data/extracted_songs` using `git mv` to preserve git file history.

### 2. Production Database Synchronization & PDF Generation
- Created Python script [prod_songs_2_pdf.py](file:///home/roeland/projects/sacred-fire-songs/scripts/prod_songs_2_pdf.py) to connect to the read-only Production DB, fetch all 238 songs in alphabetical order, format them as clean ChordPro `.cho` files (consolidating metadata and resolving duplicate inline headers), and automatically compile them into a single PDF (`production_songbook.pdf`).
- Synced files are written to the local-only `data/extracted_songs/production_db/` folder.
- Configured `.gitignore` to ignore the `production_db/` folder and generated root PDFs, ensuring they are not checked into Git.

### 3. PDF Compilation Utility
- Created Python utility [compile_songbook.py](file:///home/roeland/projects/sacred-fire-songs/scripts/compile_songbook.py) that invokes the system-installed `chordpro` CLI tool to compile a folder of `.cho` files into a single, consolidated PDF songbook with a Table of Contents (`--toc`), A4 page size (`--page-size=a4`), and clean chord grid suppression (`--no-chord-grids`).
