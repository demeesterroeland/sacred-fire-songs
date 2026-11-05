# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.1 / G1.1 (#385): design tokens are the single source of colour and type.
@story-6.1.1
Feature: UX v2 design tokens and component sheet
  As a Contributor
  I want design tokens and a component sheet
  So that every screen is restyled from one sober greyscale system instead of page by page

  @unit
  Scenario: Tokens are the single source of colour and type
    Given the design tokens file in docs/design
    When the Tailwind theme is loaded
    Then every colour, font size and spacing value in the theme exists in the tokens file
    And exactly one accent colour is defined

  @unit
  Scenario: No text smaller than 12 px
    Given any component in the component sheet
    Then its smallest text style is at least 12 px
    And body text contrast against its background is at least 4.5:1
