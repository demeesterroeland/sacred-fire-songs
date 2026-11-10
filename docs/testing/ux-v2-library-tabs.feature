# Version: 1.1 | Date: Nov 9, 2026
# Changelog
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
