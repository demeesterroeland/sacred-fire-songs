# Version: 1.0 | Date: Nov 12, 2026
# Changelog
# 1.0 | Nov 12, 2026 | Story 6.1.35 (#485), group 1: neutral tags and categories, ratchet scans lib/.
@story-6.1.35
Feature: One sober colour language
  As a Member
  I want every screen, popup and tag in the same sober colours (greyscale plus one accent)
  So that the app looks like one product and nothing shouts

  @unit
  Scenario: Category tags are neutral
    Given tag pills for the categories "fire", "water", "ayahuasca" and "spanish"
    Then every tag uses the same neutral tag style
    And no tag has its own category colour

  @unit
  Scenario: A selected tag shows inverted greys and a check, not a colour
    Given a selected tag pill and an unselected tag pill
    Then the selected tag uses the selected chip tokens
    And the selected tag has a check and is announced as pressed
    And the unselected tag is not announced as pressed

  @unit
  Scenario: Author pills share the neutral tag style
    Given an author pill and a tag pill
    Then both use the same neutral tag style

  @unit
  Scenario: The tag editors use semantic tokens
    Then these files use no palette classes:
      | file                                 |
      | components/ui/BasePill.tsx           |
      | components/ui/TagPill.tsx            |
      | components/ui/AuthorPill.tsx         |
      | components/song/CategorySelector.tsx |
      | components/song/ArtistTagInput.tsx   |
      | lib/design/tagStyles.ts              |
    And no file gives a category its own colour

  @unit
  Scenario: The palette ratchet scans lib/
    Given the palette audit
    Then it counts palette classes in app/, components/ and lib/

  @e2e
  Scenario: Category tags look the same in the browser, light and dark
    Given a member on the Add song page with the tag picker open
    Then every unselected tag has the same background and text colour
    And a selected tag shows the inverted greys and is announced as pressed
