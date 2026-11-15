# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.8 / G2.3 (#392): the sticky song title truncates at the end.
@story-6.1.8
Feature: UX v2 song page sticky header
  As a reader
  I want the sticky song title to truncate at the end
  So that the first letters are never cut off

  @e2e
  Scenario: Long title in the sticky header
    Given a song whose title is wider than the header
    When the reader scrolls down
    Then the header shows the beginning of the title followed by an ellipsis
