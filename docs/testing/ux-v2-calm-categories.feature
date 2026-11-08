# Version: 1.1 | Date: Nov 8, 2026
# Changelog
# 1.1 | Nov 8, 2026 | Validation of #388: categories are flat rows, not tiles (UXA-069).
# 1.0 | Nov 5, 2026 | Story 6.1.4 / G1.4 (#388): calm monochrome category grid on the home page.
@story-6.1.4
Feature: A calm category grid on the home page
  As a Guest
  I want the category grid in a calm monochrome style
  So that the home page does not shout

  @unit
  Scenario: Monochrome categories
    Given the home page category grid
    Then categories use only greyscale colours except the pressed state
    And every category link is at least 44 px tall

  @unit
  Scenario: Tags are plain text links with a grey count
    Given the home page category grid
    Then the tags are text links with a grey count, not coloured chips

  @e2e
  Scenario: Category links are easy to tap on a phone
    Given a guest on the home page on a 390 px phone
    Then every category and tag link in the grid is at least 44 px tall
