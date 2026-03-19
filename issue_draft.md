# Fix Settings Page Mobile UX

**Description:**
> As a mobile user, I want the Settings page to be fully usable on a small screen so that I can manage my profile, account security, and preferences without UI elements being clipped or misaligned.

**Problems identified (from real-device screenshots):**

1. **Tab bar overflows** — 4 tabs don't fit on a mobile viewport; last tabs are clipped off-screen.
2. **Profile: Save button half-visible** — The Full Name input + Save button are side-by-side with a fixed width; the button is cut off on narrow screens.
3. **Account: three sub-issues:**
   - **3a** Change Email and Update Password buttons are not consistently aligned relative to their inputs on mobile.
   - **3b** The eye 👁 toggle is shared between both password fields — tapping it reveals/hides both instead of each independently.
   - **3c** Change Email and Update Password buttons use a muted ghost style regardless of state; they should use the primary brand color (`#f45d1a`) when actionable, consistent with the Save button in the Profile tab.

**Acceptance Criteria (Gherkin):**

```gherkin
Feature: Settings page is fully mobile-friendly

  Scenario: Tab bar is scrollable on mobile
    Given I open Settings on a mobile device
    Then all tabs are accessible by scrolling horizontally
    And a visual fade gradient on the right hints that more tabs exist

  Scenario: Profile Save button is fully visible on mobile
    Given I am on the Profile tab on a narrow screen
    When I view the Full Name field
    Then the Save button is stacked below the input and is full-width
    And on tablet/desktop the Save button is beside the input at fixed width

  Scenario: Account buttons are aligned consistently on mobile
    Given I am on the Account tab on a narrow screen
    When I view the Email section and the Password section
    Then each action button is stacked below its input(s) and is full-width

  Scenario: Eye toggles work independently per password field
    Given I am on the Account tab with both password fields empty
    When I type in the New Password field and tap its eye icon
    Then only the New Password field reveals its text
    And the Confirm Password field remains masked (or vice versa)

  Scenario: Action buttons use primary color when active
    Given I am on the Account tab
    Then the Change Email button always displays the primary orange brand color
    And the Update Password button displays the primary orange color only when a new password has been typed
    And both buttons revert to the muted style when disabled
```
