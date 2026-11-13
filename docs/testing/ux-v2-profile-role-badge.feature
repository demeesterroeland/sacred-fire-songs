# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.1.38 (#534): one badge per role on a profile page.
#
# Layering:
#   @unit – Cucumber steps over lib/users/roleBadge.ts
#           (testing/bdd/steps/ux-v2-profile-role-badge.steps.ts); the badge itself is covered by
#           testing/unit/tests/profile/roleBadge.test.tsx (Vitest, RTL).
#   @e2e  – e2e/tests/ux-v2-profile-role-badge.spec.ts (member, 390 px).
#
# Decision (Nov 12, 2026): every signed-in member sees every role; a guest gets no role
# from public_profiles (the profile page itself is members-only).
@story-6.1.38
Feature: Role badge on a profile page

  @unit
  Scenario Outline: Each role has its own badge
    Given a user whose role is "<role>"
    When the profile badge for that user is chosen
    Then the badge shows the "<label>" label
    And the badge shows the "<icon>" icon

    Examples:
      | role       | label      | icon      |
      | admin      | Admin      | Shield    |
      | gatekeeper | Gatekeeper | KeyRound  |
      | expert     | Expert     | Award     |
      | musician   | Musician   | Music     |
      | member     | Member     | UserCheck |

  @unit
  Scenario: An unknown or hidden role shows the member badge
    Given a user whose role is ""
    When the profile badge for that user is chosen
    Then the badge shows the "Member" label
    And the badge shows the "UserCheck" icon

  @unit
  Scenario: The badge label follows the chosen language
    Given a user whose role is "gatekeeper"
    When the profile badge for that user is chosen in "nl"
    Then the badge shows the "Poortwachter" label

  @e2e
  Scenario: A member sees an admin's role and nothing private
    Given a signed-in member
    When the member opens the profile page of an admin
    Then the page shows the name and the "Admin" badge
    And the page does not show the admin's e-mail address
