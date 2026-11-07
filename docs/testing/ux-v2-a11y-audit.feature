# Version: 1.1 | Date: Nov 7, 2026
# Changelog
# 1.1 | Nov 7, 2026 | Validation round 2, item 8: quoted UI strings say "recording" instead of "take".
# 1.0 | Nov 6, 2026 | Story 6.1.34 / G9.2 (#418): the song page and the Practice panel pass an axe-core audit (zero violations of any impact); dialogs hold focus and give it back; the delete confirmation is a real dialog; Escape while renaming; the embedded player is reachable; the Practice tabs follow the tab pattern; the recorder announces its state; the delete confirmation is a real dialog; Escape during a keyboard drag only cancels the drag; dialogs opened from a menu return focus.
@story-6.1.34
Feature: UX v2 accessibility audit of the song page and the Practice panel
  As a reader using assistive technology
  I want the song page and the Practice panel to pass an accessibility audit
  So that the app works with a screen reader and with the keyboard

  @unit
  Scenario: Tab inside a modal never leaves it
    Given a modal with 4 tabbable controls
    When focus is on the last control and the user presses Tab
    Then focus moves to the first control
    When focus is on the first control and the user presses Shift+Tab
    Then focus moves to the last control

  @unit
  Scenario: Focus is pulled into a modal from outside
    Given a modal with 4 tabbable controls
    When focus is outside the modal and the user presses Tab
    Then focus moves to the first control

  @unit
  Scenario: Tabs follow the arrow-key pattern
    Given a tab list with 2 tabs
    When the user presses "ArrowRight" on the first tab
    Then the second tab is selected
    When the user presses "ArrowRight" on the second tab
    Then the first tab is selected
    When the user presses "End" on the first tab
    Then the second tab is selected

  @e2e
  Scenario: Automated audit
    Given the song page with the Practice drawer open
    When axe-core runs
    Then there are no serious or critical violations

  @e2e
  Scenario: Every state a guest or member can reach is audited, light and dark
    Given a guest and a member on a phone, in light and in dark
    When axe-core runs on the song page, the Practice Listen tab, the Practice Record tab and the recorder
    And axe-core runs on the take actions sheet, the playlist sheet, the Make public dialog, the share and singer dialogs, the delete confirmation, the reading tools sheet and the song menu
    Then there are no serious, critical, moderate or minor violations and no rule is excluded

  @e2e
  Scenario: Practice is a modal dialog that gives focus back
    Given the song page on a phone with a keyboard
    When the user opens Practice with Enter
    Then Practice is a modal dialog named after the song
    And Tab and Shift+Tab stay inside it
    When the user presses Escape
    Then Practice closes and focus is back on the Practice button

  @e2e
  Scenario: Sheets and dialogs return focus to their opener
    Given a take with the actions sheet, the playlist sheet and the song menu
    When each one is closed with Escape
    Then focus is back on the control that opened it

  @e2e
  Scenario: The recorder announces what it does
    Given the recorder is open
    When the user starts, pauses, resumes and stops a take
    Then a status message announces each state
    And every control has an accessible name

  @e2e
  Scenario: The delete confirmation is a real dialog
    Given the Practice panel is open on the Record tab with a take
    When the user chooses Delete recording from the take's actions sheet
    Then an alert dialog named "Delete recording?" opens and focus is on Cancel
    And Tab and Shift+Tab move between Cancel and Yes, Delete and never leave the dialog
    When the user presses Escape
    Then only the confirmation closes, the Practice panel stays open and the take is kept
    And focus is back on the take's More actions button

  @e2e
  Scenario: Escape while renaming a take only ends the edit
    Given the user is renaming a take in the Practice panel
    When the user presses Escape
    Then the name field closes and the Practice panel stays open

  @e2e
  Scenario: Escape while moving a take with the keyboard only cancels the move
    Given the user picked up a take with Space and moved it with an arrow key
    When the user presses Escape
    Then the take is back where it was and the Practice panel stays open
    And the next Escape closes the Practice panel

  @e2e
  Scenario: Dialogs opened from a menu give focus back to the control that opened the menu
    Given the user opened Delete from the song menu, or Share or Singer Attribution from a take's actions
    When the user presses Escape
    Then only the dialog closes
    And focus is on the song menu button, or on the take's More actions button

  @e2e
  Scenario: Tab goes on to the embedded player and focus never stays outside the panel
    Given the Listen tab shows a reference video
    When the user presses Tab past the last control
    Then focus goes on to the player instead of wrapping to the first control
    And within a few more presses focus is back inside the Practice panel
