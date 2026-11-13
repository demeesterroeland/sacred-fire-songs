# Version: 1.0 | Date: Nov 12, 2026
# Changelog
# 1.0 | Nov 12, 2026 | Story 6.1.35 (#485), group 3: the Practice drawer and the singer attribution dialog use tokens.
@story-6.1.35
Feature: Sober colours in the Practice drawer and the singer attribution dialog
  As a Member
  I want the Practice drawer and the singer attribution dialog in the same sober colours
  So that practising looks like the rest of the app and only the main action stands out

  @unit
  Scenario: The Practice drawer uses semantic tokens
    Given the Practice drawer source
    Then it uses no palette classes
    And the accent fill is only on what is playing
    And the overlay uses the scrim token

  @unit
  Scenario: The singer attribution dialog has one primary action
    Given the singer attribution dialog source
    Then it uses no palette classes
    And Save is the only primary button
    And the control that clears the chosen singer has a translated name in every locale

  @e2e
  Scenario: The dialogs stay readable in light and dark mode
    Given a member opens the Practice drawer or the singer attribution dialog
    When I switch between light and dark mode
    Then axe reports no colour-contrast violations
