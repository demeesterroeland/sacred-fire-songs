# Version: 1.0 | Date: Nov 23, 2026
# Changelog
# 1.0 | Nov 23, 2026 | Story 6.1.35 (#485), group 7: Add / Edit song form, media embeds, YouTube embed and song skeleton.
@story-6.1.35
Feature: Sober colours in the song form
  As a Member
  I want the Add Song form in the same sober colours as the rest of the app
  So that one accent button stands out and the fields look like every other field

  @unit
  Scenario: Song form files use semantic tokens
    Then these files use no palette classes:
      | file                                    |
      | components/song/SongForm.tsx            |
      | components/song/MediaEmbeds.tsx         |
      | components/song/YouTubeEmbed.tsx        |
      | components/song/SongDetailSkeleton.tsx  |

  @unit
  Scenario: Publish is the only accent button and link icons are neutral
    Given the song form source
    Then Publish Song is the single accent button and Save as private is a neutral outline button
    And the YouTube, Spotify and SoundCloud icons carry no brand colour

  @e2e
  Scenario: Add Song stays readable in light and dark mode
    Given a member opens Add Song
    When they open the metadata, tags and links sections
    And they switch between light and dark mode
    Then axe reports no colour-contrast violations
