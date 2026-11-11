# Version: 1.2 | Date: Nov 11, 2026
# Changelog
# 1.2 | Nov 11, 2026 | #488 owner review: rows start at the same x on every tab (no leading icon on playlist rows).
# 1.1 | Nov 9, 2026 | Validation 4: five tabs Playlists | Smart | History | New | Artists; the row scrolls on a phone.
# 1.0 | Nov 5, 2026 | Story 6.1.23 / G5.2 (#407): Library tabs fit a phone, Albums hidden (UXD-4).
@story-6.1.23
Feature: UX v2 Library tab row
  As a Member
  I want the Library tab row to fit my phone with no dead tab
  So that every tab I see works

  @e2e
  Scenario: Library tabs on a phone
    Given the Library on a 390 px viewport
    Then the tabs are Playlists, Smart, History, New and Artists, in that order
    And every tab label is fully visible once the row is scrolled to it
    And the open tab is scrolled into view
    And no tab leads to a "Coming soon" page

  @e2e
  Scenario: Rows start at the same x on every tab
    Given I am a signed-in member on a phone
    When I open Playlists, Smart, History, New and Artists in turn
    Then the first row title starts at the same x on all five tabs
