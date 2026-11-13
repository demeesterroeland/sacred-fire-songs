# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.1.35 (#485), group 4: header, user menu, notifications, language and theme pickers, toasts.
@story-6.1.35
Feature: Sober colours in the header, the user menu and the notifications
  As a Member
  I want the header, the user menu and the notifications in the same sober colours
  So that the frame around every page is calm and only the main action stands out

  @unit
  Scenario: The header and its menus use semantic tokens
    Then these header files use no palette classes:
      | file                                            |
      | components/common/Header.tsx                    |
      | components/common/navigation/UserProfile.tsx    |
      | components/common/navigation/NotificationBell.tsx |
      | components/common/navigation/LanguageSwitcher.tsx |
      | components/common/ui/WickSelect.tsx             |
      | components/providers/ThemedToaster.tsx          |
    And the unused coloured header pieces are gone

  @unit
  Scenario: The user menu has no coloured items
    Given the user menu source
    Then no menu item has its own colour
    And every menu item, Admin Portal included, uses the shared menu item style
    And the role is shown in the user's language

  @unit
  Scenario: The chosen theme is shown by inverted greys and announced
    Given the user menu source
    Then the theme buttons announce the chosen theme as pressed

  @unit
  Scenario: Unread notifications are counted, not only coloured
    Given the notification bell source
    Then the bell names the unread count
    And every unread item says "unread" to screen readers
    And the badge uses the inverted greys, not a colour

  @e2e
  Scenario: The user menu and the notifications stay readable in light and dark mode
    Given a member opens the user menu or the notifications
    When I switch between light and dark mode
    Then axe reports no colour-contrast violations
