# Sacred Fire Songs – Suggest a song as a version of another song
# Version: 1.2 | Date: Nov 24, 2026
#
# Story 6.2.26 / G1.5 (#598): a member suggests "this song is a version of that song"; a
# gatekeeper or admin reviews it and links (fn_link_song_as_version core) or declines.
# Migration: supabase/migrations/20261124150000_song_link_suggestions.sql. Plan:
# docs/plans/2026-11-23-598-version-suggestion.md. Owner answers: issue #598, Nov 24, 2026.
#   @unit – Cucumber steps on lib/songs/linkSuggestion.ts (no database).
#   @seed – Cucumber steps in testing/bdd/steps/ux-v3-suggest-song-link.steps.ts running as
#           the real database roles against the local Supabase database. Every scenario runs
#           in a transaction that is rolled back, so nothing it creates stays.
#   @e2e  – Playwright journey in e2e/tests/suggest-song-link.spec.ts (CI only).
#
# Run: npm run test:bdd:unit · npm run test:bdd:seed
#
# Changelog
#   1.0 – Nov 24, 2026 – Initial scenarios (Story 6.2.26, #598). A gatekeeper reviews every
#         suggestion, also on songs they own neither (owner answer 3); public songs only
#         (answer 5); gatekeepers and admins review instead of suggesting (answer 4).
#   1.2 – Nov 24, 2026 – Owner decision (PR #658): gatekeepers suggest too, on songs they cannot link directly (not
#         when they own both songs; never an admin); a reviewer never decides their own suggestion, and it is not
#         counted in their badge.
#   1.1 – Nov 24, 2026 – Review fixes (Opus): a song that goes private closes its open suggestions; a
#         reopened suggestion counts against the limit of ten; the internal functions, the table and the badge
#         are closed to the API roles; reviewers only preview; a decided suggestion cannot be withdrawn.

@story-6.2.26 @suggestSongLink
Feature: Members suggest linking a song as a version of another song
  As a Member
  I want to suggest that a song is a version of another song
  So that duplicates get merged by a gatekeeper or admin, without me making an irreversible change

  Rule: Who sees "Suggest as a version of…"

    @unit
    Scenario Outline: The song menu offers a suggestion by role
      Given a signed-in "<role>" on a public song <owner>
      Then the suggest action is <shown> in the song menu

      Examples:
        | role       | owner               | shown     |
        | member     | of someone else     | shown     |
        | musician   | of someone else     | shown     |
        | expert     | of someone else     | shown     |
        | gatekeeper | of someone else     | shown     |
        | gatekeeper | they own            | not shown |
        | admin      | of someone else     | not shown |
        | guest      | of someone else     | not shown |

    @unit
    Scenario: A private song cannot be suggested
      Given a signed-in "member" on a private song
      Then the suggest action is not shown in the song menu

    @unit
    Scenario Outline: Gatekeepers and admins review every suggestion but their own
      Given a signed-in "<role>" looking at an open suggestion by <by>
      Then the review actions are <shown>

      Examples:
        | role       | by           | shown     |
        | admin      | someone else | shown     |
        | gatekeeper | someone else | shown     |
        | gatekeeper | themselves   | not shown |
        | member     | someone else | not shown |

  Rule: The note and the reason are plain short text

    @unit
    Scenario Outline: A note is trimmed, emptied or refused
      When the note "<note>" is checked
      Then the note becomes "<saved>"

      Examples:
        | note             | saved        |
        | Same song        | Same song    |
        |                  | nothing      |

    @unit
    Scenario: A note of more than 280 characters is refused
      When a note of 281 characters is checked
      Then the suggestion note is refused as too long

  Rule: A refusal reads as its reason

    @unit
    Scenario Outline: A refusal of the database reads as its reason
      Given the suggestion database refuses with code "<code>" and message "<message>"
      Then the suggestion sheet shows "<reason>"

      Examples:
        | code  | message                                      | reason                                                           |
        | 23505 | This suggestion already exists               | This suggestion already exists.                                  |
        | 22023 | Both songs must be public, or both private   | Both songs must be public, or both private.                      |
        | 22023 | Only public songs can be suggested           | Only public songs can be suggested.                              |
        | 22023 | Too many open suggestions                    | You have too many open suggestions. Wait for an answer first.    |
        | 22023 | This suggestion was already decided          | This suggestion was already decided.                             |
        | 42501 | You can link or review these songs yourself  | You can link or review these songs yourself.                     |
        | P0002 | Song not found                               | Not found. It may have been removed.                             |

  Rule: The review list shows the history around a pair

    @unit
    Scenario: A pair that was declined before says so
      Given a declined suggestion "Pipe song 58" → "Pipe song 65" and an open one for the same pair
      Then the open row shows "Declined before"

    @unit
    Scenario: A song with another open suggestion says so
      Given open suggestions "Siente la medicina nai" → "Siento la medica" and "Siente la medicina nai" → "Siento la medicina"
      Then the first row shows "Also suggested: Siento la medicina"

  Rule: The member is told what happened

    @unit
    Scenario: A linked suggestion reads as a bell item
      Given a bell item "link_suggestion_accepted" for "Siento la medica" and "Siento la medicina"
      Then the bell item reads "Siento la medica was linked as a version of Siento la medicina."

    @unit
    Scenario Outline: A declined suggestion reads as a bell item
      Given a bell item "link_suggestion_declined" for "Pipe song 58" with the reason "<reason>"
      Then the bell item reads "<text>"

      Examples:
        | reason         | text                                                                  |
        | Different songs | Your suggestion for Pipe song 58 was declined: Different songs.      |
        |                | Your suggestion for Pipe song 58 was declined.                        |

  Rule: A member suggests, nothing changes yet

    Background:
      Given the public songs "Siento la medicina" and "Siento la medica" of another member

    @seed
    Scenario: A member suggests a link
      When the member suggests "Siento la medica" as a version of "Siento la medicina"
      Then an open suggestion "Siento la medica" → "Siento la medicina" is saved with the member as the suggester
      And both songs are unchanged

    @seed
    Scenario: A member cannot link directly
      When the member links "Siento la medica" directly into "Siento la medicina"
      Then it is refused with "Only gatekeepers and admins can link songs"
      And both songs are unchanged

    @seed
    Scenario: The same suggestion is not stored twice
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      When the expert suggests "Siento la medica" as a version of "Siento la medicina"
      Then it is refused with "This suggestion already exists"

    @seed
    Scenario: The reverse suggestion is not stored twice
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      When the expert suggests "Siento la medicina" as a version of "Siento la medica"
      Then it is refused with "This suggestion already exists"

    @seed
    Scenario: A declined pair may be suggested again
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      And the admin declined it
      When the expert suggests "Siento la medica" as a version of "Siento la medicina"
      Then an open suggestion "Siento la medica" → "Siento la medicina" is saved with the expert as the suggester

    @seed
    Scenario: A suggestion between a public and a private song is refused
      Given the member's private song "Siento (draft)"
      When the member suggests "Siento (draft)" as a version of "Siento la medicina"
      Then it is refused with "Both songs must be public, or both private"

    @seed
    Scenario: Two private songs are refused too (public songs only)
      Given the member's private song "Siento (draft)"
      And the member's private song "Siento (second draft)"
      When the member suggests "Siento (draft)" as a version of "Siento (second draft)"
      Then it is refused with "Only public songs can be suggested"

    @seed
    Scenario: A member cannot suggest a song they cannot read
      Given a private song "Secret song" of another member
      When the member suggests "Siento la medica" as a version of "Secret song"
      Then it is refused with "Song not found"

    @seed
    Scenario: A song cannot be a version of itself
      When the member suggests "Siento la medica" as a version of "Siento la medica"
      Then it is refused with "A song cannot be linked to itself"

    @seed
    Scenario: A guest cannot suggest
      When a guest suggests "Siento la medica" as a version of "Siento la medicina"
      Then it is refused as not allowed for a guest
      And no suggestion is saved

    @seed
    Scenario: An admin links or reviews instead of suggesting
      When the admin suggests "Siento la medica" as a version of "Siento la medicina"
      Then it is refused with "You can link or review these songs yourself"

    @seed
    Scenario: A gatekeeper suggests a link for songs they own neither
      When the gatekeeper suggests "Siento la medica" as a version of "Siento la medicina"
      Then an open suggestion "Siento la medica" → "Siento la medicina" is saved with the gatekeeper as the suggester

    @seed
    Scenario: A gatekeeper who owns both songs links directly instead
      Given the gatekeeper's public songs "Gate one" and "Gate two"
      When the gatekeeper suggests "Gate one" as a version of "Gate two"
      Then it is refused with "You can link or review these songs yourself"

    @seed
    Scenario: A member has at most ten open suggestions
      Given the member has 10 open suggestions
      When the member suggests "Siento la medica" as a version of "Siento la medicina"
      Then it is refused with "Too many open suggestions"

    @seed
    Scenario: A note longer than 280 characters is refused
      When the member suggests "Siento la medica" as a version of "Siento la medicina" with a note of 281 characters
      Then it is refused with "The note is too long"

    @seed
    Scenario: A suggestion points at the song a linked target lives in
      Given the public song "Siento (old spelling)" of another member was linked into "Siento la medicina"
      When the member suggests "Siento la medica" as a version of "Siento (old spelling)"
      Then an open suggestion "Siento la medica" → "Siento la medicina" is saved with the member as the suggester

  Rule: Members see their own suggestions only, and cannot write the table

    Background:
      Given the public songs "Siento la medicina" and "Siento la medica" of another member

    @seed
    Scenario: A member does not see another member's suggestion
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      Then the member sees 1 suggestion
      And the expert sees 0 suggestions

    @seed
    Scenario: Nobody writes the suggestions table directly
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      Then a direct insert, update and delete as the member is refused
      And a direct update as the admin is refused

    @seed
    Scenario: A member withdraws their suggestion
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      When the member withdraws it
      Then its status is "withdrawn"
      And both songs are unchanged

    @seed
    Scenario: A member cannot withdraw someone else's suggestion
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      When the expert withdraws it
      Then it is refused as not allowed

    @seed
    Scenario: A decided suggestion cannot be withdrawn
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      And the admin declined the suggestion without a reason
      When the member withdraws it
      Then it is refused with "This suggestion was already decided"

  Rule: The internal functions and the table are closed to the API roles

    Background:
      Given the public songs "Siento la medicina" and "Siento la medica" of another member
      And an open suggestion "Siento la medica" → "Siento la medicina" by the member

    @seed
    Scenario Outline: <who> cannot call <function>
      When <who> calls "<function>" directly
      Then it is refused as not allowed

      Examples:
        | who        | function                     |
        | the member | fn_link_song_as_version_core |
        | a guest    | fn_link_song_as_version_core |
        | the member | fn_assert_can_review_link    |
        | a guest    | fn_assert_can_review_link    |
        | the admin  | fn_link_song_as_version_core |
        | the admin  | fn_assert_can_review_link    |

    @seed
    Scenario: A guest cannot read the table or the badge
      When a guest reads the suggestions table
      Then it is refused as not allowed
      When a guest asks for the open count
      Then it is refused as not allowed

  Rule: Gatekeepers and admins review every suggestion

    Background:
      Given the public songs "Siento la medicina" and "Siento la medica" of another member
      And an open suggestion "Siento la medica" → "Siento la medicina" by the member

    @seed
    Scenario: The review list of a gatekeeper and an admin
      Then the admin sees 1 suggestion
      And the gatekeeper sees 1 suggestion
      And the open count is 1 for the admin, 1 for the gatekeeper and 0 for the member

    @seed
    Scenario: A reviewer sees what a link would move, and nothing changes
      When the gatekeeper previews the suggestion
      Then the suggestion preview counts 1 version to move
      And both songs are unchanged

    @seed
    Scenario: An admin accepts a suggestion
      When the admin accepts the suggestion
      Then "Siento la medicina" has the versions of both songs
      And the old link of "Siento la medica" opens "Siento la medicina"
      And the suggestion is accepted with the admin as the reviewer
      And the audit entry of the link points at the suggestion
      And the member is notified that the songs were linked

    @seed
    Scenario: A gatekeeper accepts a suggestion on songs they own neither
      When the gatekeeper accepts the suggestion
      Then "Siento la medicina" has the versions of both songs
      And the suggestion is accepted with the gatekeeper as the reviewer

    @seed
    Scenario: A gatekeeper still cannot link those songs directly
      When the gatekeeper links "Siento la medica" directly into "Siento la medicina"
      Then it is refused with "Gatekeepers can only link songs they own"

    @seed
    Scenario: The reviewer keeps the other song
      When the admin accepts the suggestion and keeps "Siento la medica"
      Then "Siento la medica" has the versions of both songs
      And the old link of "Siento la medicina" opens "Siento la medica"
      And the member is notified that the songs were linked

    @seed
    Scenario: An admin declines a suggestion with a reason
      When the admin declines the suggestion with the reason "Different songs"
      Then both songs are unchanged
      And the suggestion is declined with the admin as the reviewer
      And the member is notified that it was declined with the reason "Different songs"

    @seed
    Scenario: A decline without a reason
      When the gatekeeper declines the suggestion without a reason
      Then the member is notified that it was declined without a reason

    @seed
    Scenario: A reason longer than 280 characters is refused
      When the admin declines the suggestion with a reason of 281 characters
      Then it is refused with "The reason is too long"

    @seed
    Scenario Outline: A <role> cannot decide a suggestion
      When the <role> accepts the suggestion
      Then it is refused with "Only gatekeepers and admins can review suggestions"
      When the <role> declines the suggestion without a reason
      Then it is refused with "Only gatekeepers and admins can review suggestions"

      Examples:
        | role   |
        | member |
        | expert |

    @seed
    Scenario: A decided suggestion cannot be decided twice
      Given the admin accepted the suggestion
      When the gatekeeper declines the suggestion without a reason
      Then it is refused with "This suggestion was already decided"

    @seed
    Scenario: A song that goes private closes its open suggestions
      Given "Siento la medica" was made private
      Then the suggestion is superseded
      And the open count is 0 for the admin, 0 for the gatekeeper and 0 for the member
      When the admin accepts the suggestion
      Then it is refused with "This suggestion was already decided"
      And both songs are unchanged

    @seed
    Scenario: An admin reopens a declined suggestion
      Given the admin declined the suggestion with the reason "Different songs"
      When the admin reopens the suggestion
      Then it is open again with the member as the suggester and the same note
      And it still says it was declined before by the admin

    @seed
    Scenario: A gatekeeper cannot reopen
      Given the admin declined the suggestion without a reason
      When the gatekeeper reopens the suggestion
      Then it is refused with "Only admins can reopen suggestions"

    @seed
    Scenario: A suggestion cannot be reopened once the songs were linked
      Given the admin declined the suggestion without a reason
      And an admin linked "Siento la medica" directly into "Siento la medicina"
      When the admin reopens the suggestion
      Then it is refused with "Song not found"

    @seed
    Scenario: A reopened suggestion counts against the limit of ten
      Given the admin declined the suggestion without a reason
      And the member has 10 open suggestions
      When the admin reopens the suggestion
      Then it is refused with "Too many open suggestions"

    @seed
    Scenario Outline: A <role> cannot preview a suggestion
      When the <role> previews the suggestion
      Then it is refused with "Only gatekeepers and admins can review suggestions"

      Examples:
        | role   |
        | member |
        | expert |

  Rule: A gatekeeper's suggestion is decided by someone else

    Background:
      Given the public songs "Siento la medicina" and "Siento la medica" of another member
      And an open suggestion "Siento la medica" → "Siento la medicina" by the gatekeeper

    @seed
    Scenario: A gatekeeper cannot decide their own suggestion
      When the gatekeeper accepts the suggestion
      Then it is refused with "You cannot decide your own suggestion"
      When the gatekeeper declines the suggestion without a reason
      Then it is refused with "You cannot decide your own suggestion"
      And both songs are unchanged

    @seed
    Scenario: Their own suggestion is not counted in their badge
      Then the open count is 1 for the admin, 0 for the gatekeeper and 0 for the member

    @seed
    Scenario: An admin decides a gatekeeper's suggestion
      When the admin accepts the suggestion
      Then "Siento la medicina" has the versions of both songs
      And the suggestion is accepted with the admin as the reviewer

    @seed
    Scenario: A gatekeeper withdraws their own suggestion
      When the gatekeeper withdraws it
      Then its status is "withdrawn"

  Rule: A link closes or re-points the open suggestions around it

    Background:
      Given the public songs "Siento la medicina" and "Siento la medica" of another member
      And the public song "Siente la medicina nai" of another member

    @seed
    Scenario: Suggestions on a linked song are re-pointed
      Given an open suggestion "Siente la medicina nai" → "Siento la medica" by the member
      And an open suggestion "Siento la medica" → "Siento la medicina" by the expert
      When the admin links "Siento la medica" directly into "Siento la medicina"
      Then the suggestion "Siente la medicina nai" → "Siento la medicina" is open
      And the suggestion of the expert is accepted by the direct link
      And no open suggestion points from or to a deleted song

    @seed
    Scenario: A suggestion that would repeat an open pair is superseded
      Given an open suggestion "Siente la medicina nai" → "Siento la medica" by the expert
      And an open suggestion "Siente la medicina nai" → "Siento la medicina" by the member
      When the admin links "Siento la medica" directly into "Siento la medicina"
      Then the suggestion "Siente la medicina nai" → "Siento la medica" is superseded
      And the suggestion "Siente la medicina nai" → "Siento la medicina" is open
      And no open suggestion points from or to a deleted song

    @seed
    Scenario: A direct link of the suggested pair also closes the suggestion
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      When the admin links "Siento la medica" directly into "Siento la medicina"
      Then the suggestion is accepted with the admin as the reviewer
      And the audit entry of the link points at the suggestion
      And the member is notified that the songs were linked

    @seed
    Scenario: Open suggestions starting from a linked song are superseded
      Given an open suggestion "Siento la medica" → "Siente la medicina nai" by the member
      When the admin links "Siento la medica" directly into "Siento la medicina"
      Then the suggestion "Siento la medica" → "Siente la medicina nai" is superseded

    @seed
    Scenario: Deleting a song closes its open suggestions
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      When the owner deletes "Siento la medica"
      Then the delete succeeds
      And the suggestion is superseded
      And the suggestion keeps both titles

    @seed
    Scenario: Accepting keeps both titles on the suggestion
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      When the admin accepts the suggestion
      Then the suggestion keeps both titles

  Rule: Reviewers see how many suggestions wait

    Background:
      Given the public songs "Siento la medicina" and "Siento la medica" of another member

    @seed
    Scenario: The count follows the open suggestions
      Given an open suggestion "Siento la medica" → "Siento la medicina" by the member
      Then the open count is 1 for the admin, 1 for the gatekeeper and 0 for the member
      When the admin declines the suggestion without a reason
      Then the open count is 0 for the admin, 0 for the gatekeeper and 0 for the member

  Rule: The journey in the browser

    @e2e
    Scenario: A member suggests, an admin links, the member is told
      Given I am signed in as a member on the public song "Siento la medica"
      When I choose "Suggest as a version of…" and pick "Siento la medicina"
      And I send the suggestion
      Then I see "Suggestion sent"
      When an admin opens "Link suggestions" from the user menu
      Then the admin sees the suggestion and what a link would move
      When the admin chooses "Link"
      Then the member has a notification that the songs were linked

    @e2e
    Scenario: The review badge counts what is waiting
      Given three open suggestions
      Then the admin's user menu shows the number of open suggestions next to "Link suggestions"
      And a gatekeeper's user menu shows the same number
      And a member's menu shows "My suggestions" without a number
