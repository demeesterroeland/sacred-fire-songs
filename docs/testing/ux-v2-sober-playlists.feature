# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.1.35 (#485), group 6: playlist surfaces and actions.
@story-6.1.35
Feature: Sober colours in playlists
  As a Member
  I want playlist menus, sheets and details in the same sober colours
  So that playlist actions feel consistent and stay readable

  @unit
  Scenario: Playlist surfaces use semantic tokens
    Then these files use no palette classes:
      | file                                        |
      | components/playlists/PlaylistContextMenu.tsx |
      | components/playlists/AddSongsSheet.tsx       |
      | components/playlists/PlaylistDetailHeader.tsx |

  @e2e
  Scenario: Playlist details, menus, add-songs sheet and export dialog stay readable in light and dark mode
    Given a member opens one of their playlists
    When they view the playlist menu and Add Songs sheet, and a guest opens the export sign-in dialog
    And they switch between light and dark mode
    Then axe reports no colour-contrast violations
