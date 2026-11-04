# Sacred Fire Songs – Offline library behaviour catalogue
# Version: 1.0 | Date: Nov 4, 2026
#
# Living Gherkin specification of Epic 4.3 (#357): a signed-in musician keeps
# their whole text library (songs, setlists, favourites, recently viewed) on the
# device in IndexedDB and can read it without any network. Offline the app is
# read-only; media shows a "Not available offline" notice. Covers Story 4.3.1
# (#20) and Stories 4.3.3 to 4.3.8 (#359 to #364). Story 4.3.2 (#358) is this
# spec and its test harness.
#
# Each scenario names the layer that covers it, following the testing pyramid of
# docs/testing/song.feature (epic #262):
#   @unit – Cucumber steps in testing/bdd/steps (npm run test:bdd:offline-library,
#           part of the CI bdd job via npm run test:bdd:unit), mirrored by vitest
#           in testing/unit/tests. IndexedDB runs in Node with fake-indexeddb
#           (testing/bdd/support/offlineLibraryHarness.ts, a fresh database per
#           scenario); public/sw.js runs in a Node vm sandbox
#           (testing/bdd/support/offlineHarness.ts): no browser, milliseconds.
#   @e2e  – Playwright spec e2e/tests/offline-library.spec.ts (Story 4.3.8),
#           run locally or with the remote E2E workflow, never in the CI bdd job.
#
# Scenarios start without step code. Cucumber reports their steps as undefined,
# never as passed; each story adds its steps test-first (failing first, then code).
#
# Changelog
#   1.0 – Nov 4, 2026 – Initial catalogue for Epic 4.3 (#357), Story 4.3.2 (#358).

@offline-library
Feature: Offline library
  A signed-in musician opens the installed app without any network and still has
  their whole text library: songs with all versions, setlists with order and
  transposition, favourites and recently viewed. The copy belongs to one user,
  is built while online and is wiped on sign-out, user switch and when Offline
  Mode is turned off. Online, the app behaves exactly as before.

  # ---------------------------------------------------------------------------
  # Story 4.3.1 (#20) – Setlists offline
  # ---------------------------------------------------------------------------

  @unit @wip @offline-library @story-4.3.1
  Scenario: Offline access to a setlist
    Given I have previously viewed "Full Moon Setlist" while online
    And I am currently disconnected from the internet
    When I navigate to "Full Moon Setlist"
    Then the setlist and its songs should load from the cache
    And I should see an "Offline Mode" indicator

  # ---------------------------------------------------------------------------
  # Story 4.3.3 (#359) – Local library store
  # ---------------------------------------------------------------------------

  @unit @wip @offline-library @story-4.3.3
  Scenario: Library copy is scoped to one user
    Given the local library belongs to user "A"
    When the store is opened for user "B"
    Then the store is wiped before anything is written or read for "B"

  @unit @wip @offline-library @story-4.3.3
  Scenario: Reading the library
    Given a stored library with songs, categories, setlists with items, favourite ids and recently viewed ids
    When the offline UI asks for songs, a song by id, setlists or a setlist by id
    Then it gets the same Song shape the online app uses (mapCompositionToSong), all versions included
    And a setlist returns its items in order_index order with transposition overrides

  @unit @wip @offline-library @story-4.3.3
  Scenario: Wiping the library store
    When the library is wiped
    Then all object stores and the meta record are empty

  @unit @wip @offline-library @story-4.3.3
  Scenario: Schema upgrade discards the old copy
    Given a library stored with an older schema version
    When the app opens the store with a newer schema version
    Then the old copy is discarded and a full sync is requested

  # ---------------------------------------------------------------------------
  # Story 4.3.4 (#360) – Sync engine and Offline Mode switch
  # ---------------------------------------------------------------------------

  @unit @wip @offline-library @story-4.3.4
  Scenario: First sync after sign-in
    Given I am signed in, online, and Offline Mode is on
    And there is no local library
    When the app starts
    Then my setlists, then the songs in them, then the rest of the catalogue, then favourites and recently viewed are stored
    And Preferences shows the last synced time, the number of songs and the storage used

  @unit @wip @offline-library @story-4.3.4
  Scenario: Stale library is refreshed in the background
    Given the local library is older than 1 hour
    When the app starts or the device comes back online
    Then the library is refreshed in the background without blocking the page

  @unit @wip @offline-library @story-4.3.4
  Scenario: Sync now
    When I press "Sync now" in Preferences
    Then the library is refreshed and the last synced time updates

  @unit @wip @offline-library @story-4.3.4
  Scenario: Offline Mode is on by default and can be turned off
    Given I never changed the Offline Mode preference
    Then Offline Mode is on
    When I turn Offline Mode off
    Then the local library is wiped and no further sync runs

  @unit @wip @offline-library @story-4.3.4
  Scenario Outline: The library is wiped on identity change
    Given the local library belongs to me
    When <event>
    Then the local library is wiped

    Examples:
      | event                                                 |
      | I sign out                                            |
      | another user signs in on this device                  |
      | the app is online and the server says I am signed out |

  @unit @wip @offline-library @story-4.3.4
  Scenario: Guests get no local library
    Given I am not signed in
    Then no local library is created

  @unit @wip @offline-library @story-4.3.4
  Scenario: Storage full keeps the setlist songs
    Given the browser refuses to store the whole catalogue
    Then the songs of my setlists are kept and Preferences says the library is partial

  # ---------------------------------------------------------------------------
  # Story 4.3.5 (#361) – Service worker and anonymous offline shell
  # ---------------------------------------------------------------------------

  @unit @wip @offline-library @story-4.3.5
  Scenario: The shell is precached without user data
    When the service worker installs
    Then it stores the offline shell page and the static chunks it needs in a cache named with the build id
    And the stored shell HTML contains no user id, e-mail, name or private content

  @unit @wip @offline-library @story-4.3.5
  Scenario Outline: Offline navigation gets the shell
    Given the shell is cached and the device is offline
    When I navigate to "<path>"
    Then the service worker answers with the shell and the address bar keeps the requested URL

    Examples:
      | path                    |
      | /                       |
      | /songs                  |
      | /songs/<id>             |
      | /library/playlists      |
      | /library/playlists/<id> |

  @unit @wip @offline-library @story-4.3.5
  Scenario: The offline page stays the fallback without a shell
    Given the shell is not cached and the device is offline
    When I navigate to any page
    Then I get /offline.html as today (#353)

  @unit @wip @offline-library @story-4.3.5
  Scenario: Online requests are not answered by the service worker
    Given the device is online
    When I navigate or load assets
    Then the service worker leaves every request to the browser

  @unit @wip @offline-library @story-4.3.5
  Scenario: A new deploy replaces the old caches
    When a new build activates
    Then old sfs-* caches are deleted and the new shell is precached

  # ---------------------------------------------------------------------------
  # Story 4.3.6 (#362) – Offline views
  # ---------------------------------------------------------------------------

  @unit @wip @offline-library @story-4.3.6
  Scenario: The song list offline
    Given my library is stored and I am offline
    When I open "/songs"
    Then I see all stored songs with the same cards, search, category/tag filters and sort as online

  @unit @wip @offline-library @story-4.3.6
  Scenario: A song offline
    When I open a stored song
    Then I see its lyrics and chords, can switch versions and transpose
    And media embeds are replaced by the offline notice (4.3.7)

  @unit @wip @offline-library @story-4.3.6
  Scenario: A song that is not in the library
    When I open a song that is not stored
    Then I see "This song is not saved on this device" with a link to the song list

  @unit @wip @offline-library @story-4.3.6
  Scenario: Home and library offline
    When I open "/" or "/library/playlists"
    Then I see my favourites, drafts, recently viewed and playlists from the local copy

  # ---------------------------------------------------------------------------
  # Story 4.3.7 (#363) – Read-only mode, indicators, media notice
  # ---------------------------------------------------------------------------

  @unit @wip @offline-library @story-4.3.7
  Scenario: The offline indicator follows the connection
    Given I am offline
    Then a banner says "Offline · library saved <time>" and the header shows an offline badge
    When the device comes back online
    Then the banner disappears

  @unit @wip @offline-library @story-4.3.7
  Scenario Outline: Save actions are disabled, not hidden
    Given I am offline
    Then <action> is shown greyed out with the hint "Not available offline" and does nothing

    Examples:
      | action                                       |
      | create, edit or delete a song                |
      | create, rename, delete or reorder a playlist |
      | add or remove a song to a playlist           |
      | favourite (heart)                            |
      | record or delete a recording                 |
      | every setting in account settings            |

  @unit @wip @offline-library @story-4.3.7
  Scenario: Media shows a notice offline
    Given I am offline
    When a song has YouTube, Spotify or SoundCloud links or recordings
    Then each media block shows "Not available offline" instead of an embed or spinner

  # ---------------------------------------------------------------------------
  # Story 4.3.8 (#364) – End-to-end proof and preview build
  # ---------------------------------------------------------------------------

  @e2e @wip @offline-library @story-4.3.8
  Scenario: Forest journey
    Given I signed in, the library synced, and the app is reloaded with the network off
    When I open "/library/playlists/<id>", then a song from it, then "/songs" and search
    Then everything renders from the local copy, media shows the offline notice and save actions are disabled

  @e2e @wip @offline-library @story-4.3.8
  Scenario: No leak between accounts
    Given user A synced a library and signed out
    When user B signs in, syncs and goes offline
    Then B never sees A's private songs or playlists

  @e2e @wip @offline-library @story-4.3.8
  Scenario: Signed out or Offline Mode off
    Given I signed out, or turned Offline Mode off
    When I go offline and navigate
    Then I get the offline page and no library

  @e2e @wip @offline-library @story-4.3.8
  Scenario: Preview build
    When the integration branch is complete
    Then an image tagged offline-preview is built from feat/offline-library with the docker workflow
