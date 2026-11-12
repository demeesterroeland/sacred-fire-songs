# Sacred Fire Songs – Link a song as a version of another song
# Version: 1.0 | Date: Nov 12, 2026
#
# Story 6.2.9 / G1.4 (#512): a gatekeeper or admin links a duplicate song (the source) as
# a version of the song that stays (the target). One database function,
# fn_link_song_as_version (migration 20261112120000_link_song_as_version.sql), moves
# everything in one transaction; fn_preview_song_link shows what would move.
#   @unit – Vitest-free Cucumber steps on lib/songs/linkSong.ts (no database).
#   @seed – Cucumber steps in testing/bdd/steps/ux-v3-link-song-version.steps.ts running
#           as the real database roles against the local Supabase database. Every
#           scenario runs in a transaction that is rolled back, so nothing it creates stays.
#
# Run: npm run test:bdd:unit · npm run test:bdd:seed
#
# Changelog
#   1.0 – Nov 12, 2026 – Initial scenarios (Story 6.2.9, #512).

@story-6.2.9 @linkSongVersion
Feature: Link a song as a version of another song
  As a Contributor (gatekeeper or admin)
  I want to link a song as a version of another song
  So that duplicates become one song with several versions

  Rule: Only gatekeepers and admins see the action

    @unit
    Scenario Outline: The song menu offers "Link as a version of…" by role
      Given a signed-in "<role>"
      Then the link action is <shown> in the song menu

      Examples:
        | role       | shown     |
        | admin      | shown     |
        | gatekeeper | shown     |
        | musician   | not shown |
        | member     | not shown |
        | guest      | not shown |

    @unit
    Scenario: An old song link keeps the version and the take it pointed at
      Given the song "old-song" was linked into "new-song"
      When "/songs/old-song?version=v1&recording=r1" is opened
      Then it continues at "/songs/new-song?version=v1&recording=r1"

    @unit
    Scenario: The confirm dialog lists what moves
      Given a preview with 2 versions, 3 recordings, 1 playlist entry and 1 member who favourited both songs
      Then the preview lists "2 versions", "3 recordings", "1 playlist entry" and "1 shared favorite merged"
      And items with nothing to move are left out

  Rule: Linking merges two songs into one

    Background:
      Given songs "Weyo wey yanna" and "Weyo Wey Yanna (Songbook B)" with one version each

    @seed
    Scenario: Linking merges two songs
      Given the second song has a take and is in a playlist
      When a gatekeeper links the second as a version of the first
      Then the first song has both versions
      And its own version stays first and the moved one is a variant
      And the old link opens the first song
      And recordings and playlist entries of the second still work
      And the first song's aliases include "Weyo Wey Yanna (Songbook B)"
      And the categories of both songs are on the first song
      And an audit entry names the gatekeeper and both titles

    @seed
    Scenario: The preview changes nothing
      When a gatekeeper previews linking the second as a version of the first
      Then the preview counts 1 version to move
      And both songs still exist

    @seed
    Scenario: A member cannot link songs
      When a member links the second as a version of the first
      Then the link is refused as not allowed
      And both songs still exist

    @seed
    Scenario: A song cannot be linked to itself
      When a gatekeeper links the first as a version of the first
      Then the link is refused as invalid

    @seed
    Scenario: A gatekeeper cannot link another member's private song
      Given the second song is private to another member
      When a gatekeeper links the second as a version of the first
      Then the link is refused as not found
      When an admin links the second as a version of the first
      Then the first song has both versions

    @seed
    Scenario: Redirect chains collapse
      Given a third song "Weyo (old spelling)" linked into the second song
      When a gatekeeper links the second as a version of the first
      Then the old link of the third song opens the first song
      And linking the second song again is refused as already linked

    @seed
    Scenario: Linking to an old link follows it to the song it lives in
      Given a third song "Weyo (old spelling)" linked into the first song
      When a gatekeeper links the second as a version of the third
      Then the first song has 3 versions

    @seed
    Scenario: The target takes the source's catalog slug when it has none
      Given the second song is catalogued as "weyo-wey-yanna-b"
      When a gatekeeper links the second as a version of the first
      Then the first song has catalog slug "weyo-wey-yanna-b"
      And catalog slug "weyo-wey-yanna-b" resolves to the first song

    @seed
    Scenario: Both songs have a catalog slug
      Given the first song is catalogued as "weyo-wey-yanna"
      And the second song is catalogued as "weyo-wey-yanna-b"
      When a gatekeeper links the second as a version of the first
      Then the first song has catalog slug "weyo-wey-yanna"
      And catalog slug "weyo-wey-yanna-b" resolves to the first song

    @seed
    Scenario: Two versions from the same songbook do not collide
      Given both songs have a version from songbook "songbook-b"
      When a gatekeeper links the second as a version of the first
      Then the first song has 4 versions
      And only one of them has catalog source "songbook-b"

    @seed
    Scenario: A member who favourited both songs keeps one favourite
      Given a member favourited both songs
      When a gatekeeper links the second as a version of the first
      Then the member has the first song once in their favourites
      And the favourite points at the first song's first version
