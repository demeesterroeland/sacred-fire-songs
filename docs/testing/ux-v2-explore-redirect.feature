# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | #574: old /explore links redirect permanently to /songs, query string kept.
@issue-574
Feature: Old Explore links
  As a visitor with an old bookmark
  I want /explore to open the song list
  So that old links keep working

  @unit
  Scenario: The redirect is permanent
    Given the app's redirect rules
    Then "/explore" redirects permanently to "/songs"

  @e2e
  Scenario: Old link
    Given a visitor opens /explore
    Then they land on /songs with a permanent redirect

  @e2e
  Scenario: Old link with a query
    Given a visitor opens /explore?category=ceremony
    Then they land on /songs?category=ceremony
