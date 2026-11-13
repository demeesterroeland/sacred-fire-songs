# Version: 1.2 | Date: Nov 13, 2026
# Changelog
# 1.2 | Nov 13, 2026 | Story 6.2.14 (#517): "Original" moves to the reader switch Original · Translation · Both; the language switch lists the languages only, with two or more of them. Back to the original goes through that switch.
# 1.1 | Nov 12, 2026 | Review fixes (#535): migration keeps versions with chords in another key/capo/tuning or blank lyrics, appends moved takes after the original's, reports dropped sources; the version-switch step reads the real labels. Re-check: migration keeps a version with its own melody, note, beats, media link or votes, and a lyrics-only version used in a playlist with a transposition when its key differs; reports the contributor; tag fallback needs 2-8 character subtags.
# 1.0 | Nov 12, 2026 | Story 6.2.13 (#516, G3.1): language switch next to the version switch, fed by song_translations; interim `translation` versions move to song_translations.
@ux-v3 @language-switch
Feature: Read a translation without leaving the song
  As a reader
  I want a language switch next to the version switch
  So that I read a translation of the song without leaving it

  # Rules decided for this story (also in docs/design/application-analysis&design.md):
  #  - The switch lists the languages the song has in song_translations (lyrics not blank) and picks the language of
  #    "Translation" / "Both" in the reader switch Original · Translation · Both (#517, docs/testing/ux-v3-translation-both.feature).
  #    "Original" is only in that reader switch. With fewer than two languages the language switch is left out (one
  #    language is not a choice); a song without translations shows no switch and takes no space.
  #  - A translation belongs to the song, not to one version: it replaces the lyrics of the shown version, which stays
  #    selected. Picking another version returns to the original language (the reader asked for that version's own
  #    text); picking a language keeps the version.
  #  - Deep link `?lang=<tag>`; an unknown tag opens the original language. The share link carries the language.
  #  - Guests and members see what the song's row-level security allows (translations follow the song).

  @unit
  Scenario: Reader switches to the English translation
    Given a song with Dutch and English translations
    When I pick "English" in the language switch
    Then the English lyrics are shown

  @unit
  Scenario: Only languages that exist are offered
    Given a song with Dutch and English translations
    Then the language switch offers "Dutch" and "English"

  @unit
  Scenario: A translation without lyrics is not offered
    Given a song with a Dutch translation that has no lyrics
    Then the song has no language switch

  @unit
  Scenario: A song without translations has no switch and takes no space
    Given a song without translations
    Then the song has no language switch

  @unit
  Scenario: The languages are named in my language
    Given a song with Dutch and English translations
    When the app language is set to Dutch
    Then the language switch offers "Engels" and "Nederlands"

  @unit
  Scenario: One translation needs no language switch
    Given a song with an English translation
    Then the song has no language switch

  @unit
  Scenario: Switching version returns to the original language
    Given a song with an English translation
    Given the address says "?lang=en&recording=r1"
    When I pick another version
    Then the address is "?version=v2"

  @unit
  Scenario: Switching language keeps the version
    Given the address says "?version=v2"
    When I pick the language "en"
    Then the address is "?version=v2&lang=en"

  @unit
  Scenario: Back to the original drops the language from the address
    Given the address says "?version=v2&lang=en&view=translation"
    When I pick the original
    Then the address is "?version=v2"

  @unit
  Scenario: A deep link opens the translation
    Given a song with an English translation
    When I open the song with "?lang=EN"
    Then the English lyrics are shown

  @unit
  Scenario: An unknown language in the deep link opens the original
    Given a song with an English translation
    When I open the song with "?lang=xx"
    Then the original lyrics are shown

  @unit
  Scenario: The translated title shows when it differs from the song title
    Given a song titled "Mother Earth" with an English translation titled "Mother Earth" and a Dutch one titled "Moeder Aarde"
    Then the English translation shows no extra title
    And the Dutch translation shows the title "Moeder Aarde"

  @seed
  Scenario: A guest reads the translations of a public song only
    Given a public song and a private song, each with a Dutch translation
    Then a guest reads the Dutch translation of the public song
    And a guest reads no translation of the private song
    And the owner reads the translation of the private song

  @seed
  Scenario: The song page select returns the translations of the song
    Then the select of the song page runs against the local API without error and returns the translations as a list

  Rule: The interim translation versions move to song_translations

    @seed
    Scenario: A translation version moves, with its recordings and playlist items, to the original
      Given a song with an original version and a translation version named "English" with a recording and a playlist item
      When the translation migration runs
      Then the song has an "en" translation with the lyrics of that version
      And the recording and the playlist item are on the original version
      And the translation version is gone

    @seed
    Scenario Outline: The language is read from the version name like the app does
      Given a song with an original version and a translation version named "<name>"
      When the translation migration runs
      Then the song has a "<language>" translation
      And the translation version is gone

      Examples:
        | name    | language |
        | English | en       |
        | Engels  | en       |
        | nl      | nl       |
        | pt-BR   | pt-br    |
        | Español | es       |

    @seed
    Scenario: A translation whose language cannot be determined stays where it is
      Given a song with an original version and a translation version named "Singable"
      When the translation migration runs
      Then the song has no translation
      And the translation version is still there

    @seed
    Scenario: A song without an original version keeps its translation version
      Given a song with only a translation version named "English"
      When the translation migration runs
      Then the song has no translation
      And the translation version is still there

    @seed
    Scenario: A translation that differs from the stored one is not thrown away
      Given a song with an original version, an "en" translation and a translation version named "English" with other lyrics
      When the translation migration runs
      Then the "en" translation still has its own lyrics
      And the translation version is still there

    @seed
    Scenario: A translation version equal to the stored one is removed
      Given a song with an original version, an "en" translation and a translation version named "English" with the same lyrics
      When the translation migration runs
      Then the translation version is gone

    @seed
    Scenario: The title comes from the primary source of the version
      Given a song with an original version and a translation version named "English" printed as "Mother Earth" in a songbook
      When the translation migration runs
      Then the "en" translation has the title "Mother Earth"

    @seed
    Scenario: Recordings go to the first original version
      Given a song with two original versions and a translation version named "English" with a recording
      When the translation migration runs
      Then the recording is on the first original version

    @seed
    Scenario: Running the migration twice changes nothing more
      Given a song with an original version and a translation version named "English" with a recording and a playlist item
      When the translation migration runs
      And the translation migration runs
      Then the song has exactly one "en" translation
      And the recording and the playlist item are on the original version

    @seed
    Scenario: The version switch no longer lists the translation afterwards
      Given a song with an original version, a variant and a translation version named "English"
      When the translation migration runs
      Then the version switch of the song lists "Standard" and "Live" and no translation

    @seed
    Scenario: A translation with chords in another key than the original stays where it is
      Given a song with an original version in key "G" and a translation version named "English" with chords in key "C"
      When the translation migration runs
      Then the song has no translation
      And the translation version is still there
      And the migration explained why the translation version stayed: "the original version has key"

    @seed
    Scenario: A translation with chords and a different capo stays where it is
      Given a song with an original version in key "G" and a translation version named "English" with chords and capo 3
      When the translation migration runs
      Then the translation version is still there

    @seed
    Scenario: A translation with chords in the same key, capo and tuning moves
      Given a song with an original version in key "G" and a translation version named "English" with chords and the same key, capo and tuning
      When the translation migration runs
      Then the song has a "en" translation
      And the translation version is gone

    @seed
    Scenario: A translation without chords moves whatever its key
      Given a song with an original version in key "G" and a translation version named "English" without chords in key "C"
      When the translation migration runs
      Then the song has a "en" translation
      And the translation version is gone

    @seed
    Scenario: A translation with blank lyrics stays where it is
      Given a song with an original version and a translation version named "English" with blank lyrics
      When the translation migration runs
      Then the song has no translation
      And the translation version is still there
      And the migration explained why the translation version stayed: "its lyrics are blank"

    @seed
    Scenario: Moved takes go after the takes of the original version
      Given a song whose original version has two takes and whose translation version named "English" has two takes
      When the translation migration runs
      Then the original version has the takes "original one", "original two", "translation newer" and "translation older" in that order

    @seed
    Scenario Outline: A translation version with its own <field> stays where it is
      Given a song with an original version and a translation version named "English" with its own "<field>"
      When the translation migration runs
      Then the song has no translation
      And the translation version is still there
      And the migration explained why the translation version stayed: "<field>"

      Examples:
        | field           |
        | melody_notation |
        | song_note       |
        | beats           |
        | youtube_url     |
        | spotify_url     |
        | soundcloud_url  |
        | vote_count      |

    @seed
    Scenario: A translation version with the same melody, note, beats and links as the original moves
      Given a song with an original version and a translation version named "English" with the same melody, note, beats and links as the original
      When the translation migration runs
      Then the song has a "en" translation
      And the translation version is gone

    @seed
    Scenario: The contributor of a removed translation version is reported
      Given a song with an original version and a translation version named "English" contributed by a member
      When the translation migration runs
      Then the translation version is gone
      And the migration reported the contributor of the translation version

    @seed
    Scenario: A translation without chords in another key stays where a playlist transposes it
      Given a song with an original version in key "G" and a translation version named "English" without chords in key "C" used in a playlist transposed by 2
      When the translation migration runs
      Then the song has no translation
      And the translation version is still there
      And the migration explained why the translation version stayed: "playlist"

    @seed
    Scenario: A translation without chords in another key moves when no playlist transposes it
      Given a song with an original version in key "G" and a translation version named "English" without chords in key "C" used in a playlist transposed by 0
      When the translation migration runs
      Then the song has a "en" translation
      And the translation version is gone

    @seed
    Scenario: A version name that is not a valid language tag stays where it is
      Given a song with an original version and a translation version named "xx-a"
      When the translation migration runs
      Then the song has no translation
      And the translation version is still there

    @seed
    Scenario: The songbook and page of a removed translation version are reported
      Given a song with an original version and a translation version named "English" printed as "Mother Earth" in a songbook
      When the translation migration runs
      Then the migration reported the source of the translation version: songbook "bdd-lang-book", page "38"
