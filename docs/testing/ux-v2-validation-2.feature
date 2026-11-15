# Version: 1.2 | Date: Nov 7, 2026
# Changelog
# 1.2 | Nov 7, 2026 | An admin's favourites (hearts, list, counts) are their own.
# 1.1 | Nov 7, 2026 | Review of PR #477: auth messages by code, auto-scroll while the menu is open, version switch drops the recording link, My Drafts lists what it counts, chord-like labels, right-click on plain text.
# 1.0 | Nov 7, 2026 | UX v2 validation round 2, batch 2 (Part of #375): one Sign In button, floating "+", one heading size, counts in parentheses, version links, full title on a phone, neutral song buttons, "recording" and "Record", the Recordings card, the Screen stays on switch, one song menu, Terms and Privacy pages, own drafts only, one favourites term, one main landmark, specific error messages.
@validation-2
Feature: UX v2 validation round 2, batch 2
  As the owner running the app on a phone and on a desktop
  I want the app to look and speak the same everywhere
  So that the findings of my second run are gone

  # 1 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: Every Sign In button is the accent primary button
    Given a guest on the song list
    Then the Sign In button in the header has the accent fill and the 6 px control radius
    And so does the Sign In button of the login form

  # 2 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: The Library "+" floats at the bottom right
    Given a member on the Library on a phone
    Then the "+" button is fixed at the bottom right, above the bottom bar
    And it stays in place when the page scrolls

  # 3 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: History, Artists and Shared with me share one heading size
    Given a member on each of the three Library sub-pages
    Then their headings have the same font size

  # 4 ─────────────────────────────────────────────────────────────────────────
  @unit
  Scenario: Amounts are written between parentheses
    Given a category "Air" that holds 3 songs
    Then its amount reads "(3)"

  # 5 ─────────────────────────────────────────────────────────────────────────
  @unit
  Scenario: A version has its own link, the first version has the clean one
    Given a song page without parameters
    When I switch the page to the second version
    Then the address ends in "?version=v2"
    When I switch the page to the first version
    Then the address has no parameters

  @e2e
  Scenario: Switching version replaces the address in place and Share shares it
    Given a guest on a song with two versions
    When I choose the second version
    Then the address holds the version and the history has no extra entry
    And Share copies that link
    And opening the link shows that version

  # 6 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: The full title wraps on a phone
    Given a guest on a song with a very long title on a phone
    Then the full title wraps at the top of the page
    And the truncated title in the sticky bar is hidden
    When I scroll past the title
    Then the truncated title shows in the sticky bar with an ellipsis

  # 7 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: Song buttons on a desktop are neutral, Practice is the one accent
    Given an admin on a song page on a 1440 px desktop
    Then Practice has the accent fill
    And Delete and Edit use neither the accent nor the danger colour
    And the delete confirmation is where the danger colour appears

  # 8 ─────────────────────────────────────────────────────────────────────────
  @unit
  Scenario: One noun, "recording", and one verb, "Record", in every language
    Given every interface language
    Then no string says "take" or the old word for it
    And the recorder toggle has the same label as the Practice tab

  # 9 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: The Your recordings card is true
    Given a member on the Library
    Then the card reads "Your recordings" and counts recordings, with public and private
    And it does not say songs or private practice

  # 10 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: Screen stays on is a switch
    Given a guest on a song page whose browser supports the screen wake lock
    Then the switch in the menu is on
    When I turn it off
    Then the wake lock is released and the choice is kept after a reload

  # 11 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: One overflow menu
    Given a guest on a song page
    Then there is one menu button
    And the menu holds Share, the reading tools and the Screen stays on switch
    And Escape closes it and focus returns to its button

  # 12 ─────────────────────────────────────────────────────────────────────────
  @unit
  Scenario: The operator's details come from the server environment
    Given the operator variables are not set
    Then the operator is empty and the page says no contact details are configured
    Given OPERATOR_NAME is "Example Songs Circle" and OPERATOR_CONTACT_EMAIL is "privacy@example.org"
    Then the operator has that name and that email

  @e2e
  Scenario: Terms and Privacy are real pages with a Draft note
    Given a guest on the sign-up page
    When I open the Terms link and the Privacy link
    Then each page is a real page with a Draft note and a "Who runs this server" section

  # 13 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: My Drafts counts only my own drafts, also for an admin
    Given an admin who owns some drafts while others own more
    Then the card counts only the admin's own

  # 14 ─────────────────────────────────────────────────────────────────────────
  @unit
  Scenario: One term for saved songs
    Given every interface language
    Then the heart on the song page uses the word of the user menu's "Your Favorites"

  # 15 ─────────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: One main landmark per page
    Given any page
    Then it has exactly one main landmark

  # 16 ─────────────────────────────────────────────────────────────────────────
  @unit
  Scenario: Section labels are text, not chords
    Given a line that holds only "[Chorus]"
    Then the reader shows it as plain text, with chords on or off

  # 18 ─────────────────────────────────────────────────────────────────────────
  # Covered by Vitest component tests (L3): testing/unit/tests/search/searchFieldFocus.test.tsx
  @component
  Scenario: A still tap on empty space closes the suggestions on an iPhone
    Given the search suggestions are open
    When a finger lands and lifts on empty space without moving
    Then the suggestions close without a click
    But a tap on a song row waits for its click

  # 21 ─────────────────────────────────────────────────────────────────────────
  # Covered by a Vitest hook test (L3): testing/unit/tests/reader/useLyricsBelowFold.test.tsx
  @component
  Scenario: The fold follows the meta line on a desktop
    Given a desktop page that scrolls inside its main area
    When the meta line above the lyrics expands
    Then the lyrics are measured again

  # 22 ─────────────────────────────────────────────────────────────────────────
  @unit
  Scenario: Errors from sign-in and the database are shown by their code
    Given the authentication service answers "invalid_credentials"
    Then the person reads the translated sentence for wrong credentials
    And the raw service message is never shown

  # Review of PR #477 ─────────────────────────────────────────────────────────
  @unit @e2e
  Scenario: Auth pages show translated messages by code
    Given an address with a message parameter that is not a known code
    Then the page shows the default text and not the parameter
    When the message parameter is "login_required"
    Then the page shows the translated sentence

  @e2e
  Scenario: Opening the menu does not stop auto-scroll
    Given auto-scroll is running on a long song
    When I open the menu and press Faster
    Then the scroll keeps running at the new speed

  @unit @e2e
  Scenario: A version switch drops the recording link
    Given a song opened with a recording link
    When I switch to another version
    Then the address holds the version and no recording
    And a reload shows that version

  @e2e
  Scenario: My Drafts opens the drafts it counts
    Given an admin who owns some drafts while others own more
    When they open the My Drafts card
    Then the list shows exactly the admin's own drafts

  @unit
  Scenario: A real chord alone on a line stays a chord
    Given a line holding only "[B♭]" or "[C6/9]"
    Then it stays in the chord row
    And a line holding only "[am]", "[Hm]", "[Re]", "[Do]" shows as text

  @component
  Scenario: A right-click on plain text closes the suggestions
    Given the search suggestions are open
    When I right-click on text outside them and focus leaves the field
    Then they close, and a right-click inside them does not close them

  @unit @e2e
  Scenario: An admin sees their own favourites
    Given several members have a "My Favorites" playlist that an admin can read
    When the admin opens the favourites list
    Then the list, the hearts and the counts are the admin's own favourites
