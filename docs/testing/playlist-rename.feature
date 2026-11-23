# Sacred Fire Songs – Setlist → playlist rename (schema)
# Version: 1.0 | Date: Nov 24, 2026
#
# Living Gherkin description of chore #573: the database says "playlist" wherever the app does.
# Access rules are covered by access-policies.feature; this file only pins the names.
#   @seed – Cucumber steps in testing/bdd/steps/playlist-rename.steps.ts run against the local
#           Supabase database (DATABASE_URL), read-only catalog queries.
#
# Run: npm run test:bdd:seed

Feature: The schema uses playlist names

  @seed
  Scenario: The tables, column and function use playlist names
    Given the playlist rename migration has run
    Then the tables "playlists" and "playlist_items" exist
    And "playlist_items" has the column "playlist_id"
    And the function "fn_can_edit_playlist" exists

  @seed
  Scenario: No table, column, function, policy, index or constraint name contains "setlist"
    Given the playlist rename migration has run
    Then nothing in the public schema carries the old name "setlist"

  @seed
  Scenario: The 12 row-level security policies kept their rules under new names
    Given the playlist rename migration has run
    Then "playlists" has 7 policies and "playlist_items" has 5 policies
