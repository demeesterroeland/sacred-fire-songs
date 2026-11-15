# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.1.35 (#485), group 5: account settings (AccountSettings, ProfileSettings, SecuritySettings, PreferencesSettings, PrivacySettings).
@story-6.1.35
Feature: Sober colours in account settings
  As a Member
  I want the account settings tabs and forms in the same sober colours
  So that managing my profile, security and preferences looks like the rest of the app

  @unit
  Scenario: Account settings files use semantic tokens
    Then these account settings files use no palette classes:
      | file                                                 |
      | app/account/settings/page.tsx                        |
      | components/account/settings/AccountSettings.tsx      |
      | components/account/settings/ProfileSettings.tsx      |
      | components/account/settings/SecuritySettings.tsx     |
      | components/account/settings/PreferencesSettings.tsx  |
      | components/account/settings/PrivacySettings.tsx      |

  @unit
  Scenario: Each settings tab has at most one primary button
    Given the account settings source
    Then Profile settings uses Button with Save as the single primary action
    And Security settings uses Button with Update Password as the single primary action, Change Email as outline and Sign Out All in danger text
    And Security settings translates the email heading, button, hint and password visibility labels in all languages

  @unit
  Scenario: Settings tabs and theme buttons announce their state
    Given the account settings source
    Then the settings tab buttons are 44 px pills with inverted greys when active
    And the Preferences theme buttons are 44 px targets that announce the chosen theme as pressed

  @e2e
  Scenario: Account settings tabs stay readable in light and dark mode
    Given a member opens each visible account settings tab
    When I switch between light and dark mode
    Then axe reports no colour-contrast violations
