# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.23 / G5.2 (#407): Library tabs fit a phone, Albums hidden (UXD-4).
@story-6.1.23
Feature: UX v2 Library tab row
  As a Member
  I want the Library tab row to fit my phone with no dead tab
  So that every tab I see works

  @e2e
  Scenario: Library tabs on a phone
    Given the Library on a 390 px viewport
    Then every tab label is fully visible
    And no tab leads to a "Coming soon" page
