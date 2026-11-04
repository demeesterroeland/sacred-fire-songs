# Sacred Fire Songs – Offline navigation fallback behaviour catalogue
# Version: 1.0 | Date: Nov 4, 2026
#
# Living Gherkin description of issue #353: a page navigation without a network
# connection showed the browser's own error page ("No internet" / page not found)
# instead of an app message. Root cause: Next.js falls back to a full browser
# navigation when the RSC request fails, and the service worker had no fetch
# handler, so nothing could answer that navigation offline.
#
# Each scenario names the test that covers it, following the testing pyramid of
# docs/testing/song.feature (epic #262):
#   @unit – Cucumber steps in testing/bdd/steps/offline.steps.ts (npm run test:bdd)
#           mirrored by vitest in testing/unit/tests/offlineFallback.test.ts
#           (npm run test:unit). Both run public/sw.js and the script of
#           public/offline.html in a Node vm sandbox: no browser, milliseconds.
#   @e2e  – Playwright spec e2e/tests/offline.spec.ts (npm run test:e2e -- offline)
#
# Out of scope: reading songs offline (cached content) – the second scenario of
# Story 4.5.1.
#
# Changelog
#   1.0 – Nov 4, 2026 – Initial catalogue for issue #353.

Feature: Offline navigation fallback
  When the device has no network connection, opening a page shows an offline
  message in the visitor's interface language with a Retry action, instead of
  the browser's error page. While online, the service worker stays out of the way.

  # ---------------------------------------------------------------------------
  # Service worker (public/sw.js)
  # ---------------------------------------------------------------------------

  @unit @offline @serviceWorker
  Scenario: Installing the service worker stores the offline page
    When the service worker is installed
    Then the offline page "/offline.html" is stored in the offline cache

  @unit @offline @serviceWorker
  Scenario: A page navigation while offline gets the offline page
    Given the service worker is installed
    And the browser is offline
    When the browser navigates to "/songs/some-song"
    Then the service worker answers with the stored offline page

  @unit @offline @serviceWorker
  Scenario: A page navigation while online is left to the browser
    Given the service worker is installed
    And the browser is online
    When the browser navigates to "/songs/some-song"
    Then the service worker does not answer the request

  @unit @offline @serviceWorker
  Scenario: Requests that are not page navigations are never answered
    Given the service worker is installed
    And the browser is offline
    When the page fetches "/rest/v1/compositions"
    Then the service worker does not answer the request

  @unit @offline @serviceWorker
  Scenario: Activating a new service worker removes outdated offline caches
    Given an outdated offline cache "sfs-offline-v0" exists
    And an unrelated cache "other-app" exists
    When the service worker is installed
    And the service worker is activated
    Then the cache "sfs-offline-v0" is removed
    And the cache "other-app" is kept

  # ---------------------------------------------------------------------------
  # Offline page (public/offline.html)
  # ---------------------------------------------------------------------------

  @unit @offline @offlinePage
  Scenario Outline: The offline page uses the visitor's interface language
    Given the visitor's stored language choice is "<stored>"
    And the visitor's locale cookie is "<cookie>"
    And the visitor's browser languages are "<browser>"
    When the offline page is shown
    Then the offline page is in "<locale>"
    And it shows the "<locale>" texts for the offline title, description and Retry button

    Examples:
      | stored | cookie | browser      | locale |
      | nl     |        | en-US        | nl     |
      |        | fr     | en-US        | fr     |
      |        |        | pt-BR, en    | pt     |
      |        |        | quz-PE       | qu     |
      |        |        | de-DE        | en     |
      | xx     |        | es-ES        | es     |

  @unit @offline @offlinePage
  Scenario: The offline page texts match the app's dictionaries
    Then the offline page contains the "offline.title", "offline.description" and "offline.retry" texts of every interface language

  @unit @offline @offlinePage
  Scenario: Pressing Retry reloads the page
    Given the offline page is shown
    When I press Retry
    Then the browser reloads the page

  @unit @offline @offlinePage
  Scenario: Coming back online reloads the page by itself
    Given the offline page is shown
    When the connection comes back
    Then the browser reloads the page

  # ---------------------------------------------------------------------------
  # End-to-end journeys (real browser)
  # ---------------------------------------------------------------------------

  @e2e @offline
  Scenario: Opening a song while offline
    Given I am on the songs list
    And my device goes offline
    When I open a song
    Then I see the offline message with a Retry button, not the browser's error page
    When I press Retry while still offline
    Then I still see the offline message
    When my connection is restored
    Then the song loads by itself

  @e2e @offline
  Scenario: A signed-in session survives the offline page
    Given I am signed in and on the songs list
    And my device goes offline
    When I open a song
    Then I see the offline message, which shows no account data and no sign-in link
    When my connection is restored
    Then the song loads and I am still signed in

  @e2e @offline
  Scenario: A song that really does not exist still shows "not found"
    Given I am online
    When I open a song id that does not exist
    Then I see the "Song Not Found" page
