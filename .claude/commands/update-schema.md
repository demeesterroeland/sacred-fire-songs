Sync `doc/db-schema.sql` with the latest Supabase migrations.

## Steps

1. **List Migrations**: List all files in `supabase/migrations/` to identify the current state.

2. **Read Current Schema**: Read `doc/db-schema.sql` to understand the baseline documentation.

3. **Read Recent Migrations**: Read any migration files newer than the last schema update (or all if unsure).

4. **Update Schema Documentation**:
   - Intelligently merge migration logic into `doc/db-schema.sql`.
   - Do NOT just append migration content. Rewrite `CREATE TABLE` / `ALTER TABLE` statements to represent the **final** state as if the table was created that way from the start.
   - For example: if a migration adds a column, update the original `CREATE TABLE` definition to include that column.
   - Update the version and date in the header comment.

5. **Verify**: Confirm the generated SQL is syntactically correct and covers all new features from the migrations.

$ARGUMENTS
