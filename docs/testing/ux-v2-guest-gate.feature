# Version: 1.3 | Date: Nov 15, 2026
# Changelog
# 1.3 | Nov 15, 2026 | #600: Favorites gate for guests on /songs?favorites=true; every sign-in link and the proxy redirect keep next= (path and query). Drafts (?status=draft) waits for an owner decision (#232).
# 1.2 | Nov 6, 2026 | Story 6.1.5 (#389): the deep-link example uses ?tab=preferences, because ?tab=privacy now opens Profile (hidden tab).
# 1.1 | Nov 5, 2026 | #410 review fixes: hardened next= validation at every consumer; favourites gate on the heart; add-to-playlist gets its own feature key.
# 1.0 | Nov 5, 2026 | Story 6.1.26 / G6.1 (#410): one GuestGate pattern on every members-only screen; UXD-2 guests hear consented public takes only.
@story-6.1.26
Feature: UX v2 GuestGate on every members-only screen
  As a Guest
  I want every members-only screen to show the same locked preview with a reason and a sign-in button
  So that gating feels consistent and I land back where I was after signing in

  @unit
  Scenario Outline: A guest sees the reason and a Sign in link that carries the screen back
    Given a signed-out guest
    When they open the members-only screen "<path>"
    Then a locked preview explains the "<feature>" feature and offers "Sign in"
    And the sign-in link is "<href>"

    Examples:
      | path                        | feature        | href                                                  |
      | /library/recently-viewed    | history        | /auth/login?next=%2Flibrary%2Frecently-viewed          |
      | /library/playlists/add      | newPlaylist    | /auth/login?next=%2Flibrary%2Fplaylists%2Fadd          |
      | /account/settings?tab=preferences | settings | /auth/login?next=%2Faccount%2Fsettings%3Ftab%3Dpreferences |
      | /songs/abc/edit             | edit           | /auth/login?next=%2Fsongs%2Fabc%2Fedit                 |
      | /songs/abc?ref=heart        | favourites     | /auth/login?next=%2Fsongs%2Fabc%3Fref%3Dheart          |
      | /songs/abc                  | addToPlaylist  | /auth/login?next=%2Fsongs%2Fabc                        |

  @unit @bug-600
  Scenario: A guest on Favorites sees the gate and returns there
    Given a signed-out guest
    When they open the songs view "/songs?favorites=true"
    Then the songs view shows the GuestGate for "favourites"
    And the sign-in link is "/auth/login?next=%2Fsongs%3Ffavorites%3Dtrue"

  @unit @bug-600
  Scenario: Drafts for a guest are not gated yet (owner decision pending, #232)
    Given a signed-out guest
    When they open the songs view "/songs?status=draft"
    Then the songs view shows no GuestGate

  @unit @bug-600
  Scenario Outline: Every sign-in link returns to its origin (path and query)
    Given a signed-out guest
    When they follow the sign-in link of the <origin> on "<page>"
    Then the login URL has next= "<page>"

    Examples:
      | origin          | page                                  |
      | proxy redirect  | /admin/users?tab=roles                |
      | admin layout    | /admin/catalog-edits?page=2           |
      | playlist header | /library/playlists/p1?view=grid       |
      | user profile    | /songs?favorites=true                 |
      | Add Song form   | /songs/add?next=%2Flibrary%2Fplaylists |

  @unit
  Scenario: A sign-in link never leaves the site
    Given a signed-out guest
    When the screen asks to return to "https://other.example/phish"
    Then the sign-in link is "/auth/login?next=%2F"

  @unit
  Scenario Outline: A hostile next= target is never followed by any sign-in redirect
    When a sign-in redirect receives the next target "<target>"
    Then it redirects to "<result>"

    Examples:
      | target                  | result        |
      | //evil.example          | /             |
      | /\\evil.example         | /             |
      | /%2F%2Fevil.example     | /             |
      | /%5Cevil.example        | /             |
      | @evil.example           | /             |
      | https://evil.example/x  | /             |
      | javascript:alert(1)     | /             |
      | /songs/1?x=1#y          | /songs/1?x=1#y |

  @unit
  Scenario: Every gate has a reason in every language
    Then every GuestGate feature has a title and a reason in all supported locales

  @seed
  Scenario: Guests see public takes only when the singer consented
    Given a consented public take and a public take without singer consent
    When a guest lists the public takes
    Then the guest sees the consented take
    And the guest does not see the take without singer consent

  @seed
  Scenario: Guests cannot stream the audio of a public take without singer consent
    Given a consented public take and a public take without singer consent
    When a guest lists the audio files of public takes
    Then the guest can read the audio file of the consented take only
