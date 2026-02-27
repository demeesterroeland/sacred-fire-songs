# Plan: Database Schema & Index Alignment (2026-02-27)

This plan addresses discrepancies found between the Supabase migrations and the consolidated `docs/design/db-schema.sql` file, ensuring it remains valid for fresh installations. It also fixes an inconsistent index in the latest migration.

## Goal
-   Restore "Single-File Fresh Install" validity to `docs/design/db-schema.sql`.
-   Align `categories` and `compositions` table definitions with existing migrations.
-   Fix the `idx_compositions_title_alphabetical` index to be consistent with other partial public indexes.

## Proposed Changes

### 1. Unified Schema Update (`/docs/design/db-schema.sql`)
- [MODIFY] Add missing columns to `compositions` and `categories`.
- [MODIFY] Update the alphabetical title index to include the `is_public = true` filter.

### 2. Migration Fix (`/supabase/migrations/20260227000000_add_partial_public_indexes.sql`)
- [MODIFY] Rename the "Composite index" comment to "Partial index".
- [MODIFY] Add `WHERE is_public = true` to `idx_compositions_title_alphabetical`.

## Verification Plan
1. **Consistency Check**: Run `/update-schema` if necessary, or manually verify that the columns match the migration history precisely.
2. **Fresh Install Test**: Ensure that running `db-schema.sql` no longer produces the "column does not exist" error for `is_public`.
