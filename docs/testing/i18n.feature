# Sacred Fire Songs – Interface language (i18n) behaviour catalogue
# Version: 1.2 | Date: Oct 30, 2026
#
# Living Gherkin description of Story 3.7.1 (issue #246) – acceptance criteria
# I18N-01 … I18N-12 in docs/logbook/epic&user stories.md. Each scenario names
# the test that covers it, following the testing pyramid of docs/testing/song.feature:
#   @unit   – Cucumber steps in testing/bdd/steps/i18n.steps.ts (npm run test:bdd)
#             mirrored by vitest in testing/unit/tests/i18n.test.ts and
#             testing/unit/tests/localePersistence.test.ts (npm run test:unit)
#   @e2e    – Playwright spec e2e/tests/i18n.spec.ts (npm run test:e2e -- i18n)
#   @static – enforced by the TypeScript compiler (npx tsc --noEmit)
# There are no @seed scenarios: the language choice lives in the browser
# (localStorage + cookie), not in the database.
#
# Changelog
#   1.0 – Oct 30, 2026 – Initial catalogue for Story 3.7.1 (#246).
#   1.1 – Oct 30, 2026 – I18N-11: playlist PDF export (#220) labels and messages.
#   1.2 – Oct 30, 2026 – I18N-12: Spanish, Italian, Russian, Quechua, French, Portuguese.

Feature: Interface language
  The interface (navigation, pages, buttons, messages) is available in English,
  Dutch, Spanish, Italian, Russian, Southern Quechua, French and Brazilian Portuguese. The language is resolved from the visitor's explicit choice
  (localStorage, then the locale cookie), then the browser language, then
  English. Song content (titles, lyrics, chords, artists, tags) is never translated.

  Background:
    Given the supported interface languages are "en, nl, es, it, ru, qu, fr, pt"
    And the default interface language is "en"

  # ---------------------------------------------------------------------------
  Rule: The language is the explicit choice, else the browser language, else English

    @unit @i18n @localeResolution
    Scenario: I18N-01 English is the default when nothing is known
      Given no language has been chosen
      And the browser prefers the languages "de-DE, ja"
      When the interface language is resolved
      Then the interface language is "en"
      # vitest: resolveLocale › falls back to English when no browser language is supported

    @unit @i18n @localeResolution
    Scenario Outline: I18N-02 A supported browser language is the default
      Given no language has been chosen
      And the browser prefers the languages "<languages>"
      When the interface language is resolved
      Then the interface language is "<locale>"

      Examples:
        | languages     | locale |
        | nl-BE         | nl     |
        | NL-nl, en     | nl     |
        | de-DE, nl, en | nl     |
        | pt-BR, en     | pt     |
        | es-419        | es     |
        | quz-PE        | qu     |
        | ru-RU         | ru     |
        | en-US, nl     | en     |

    @unit @i18n @localeResolution
    Scenario: I18N-02 The server uses the Accept-Language header when no cookie is set
      Given no locale cookie is sent
      And the request header Accept-Language is "de-DE,de;q=0.9,nl;q=0.8,en;q=0.7"
      When the server resolves the interface language
      Then the interface language is "nl"
      # lib/i18n/server.ts getServerLocale(); vitest: parseAcceptLanguage

    @unit @i18n @localeResolution
    Scenario: I18N-04 The locale cookie overrides the browser language on the server
      Given the locale cookie is "en"
      And the request header Accept-Language is "nl-BE,nl;q=0.9"
      When the server resolves the interface language
      Then the interface language is "en"

    @unit @i18n @localeResolution
    Scenario: I18N-04 The stored choice wins over the cookie and the browser language
      Given the stored language is "nl"
      And the locale cookie is "en"
      And the browser prefers the languages "en-US"
      When the interface language is resolved in the browser
      Then the interface language is "nl"

    @unit @i18n @localeResolution
    Scenario Outline: I18N-07 An unknown or tampered stored language is ignored
      Given the stored language is "<stored>"
      And the locale cookie is "<cookie>"
      And the browser prefers the languages "<languages>"
      When the interface language is resolved in the browser
      Then the interface language is "<locale>"

      Examples:
        | stored   | cookie | languages | locale |
        | de       | xx     | nl-BE     | nl     |
        | <script> |        | de        | en     |
        | klingon  | nl     | en        | nl     |

  # ---------------------------------------------------------------------------
  Rule: The choice is stored in localStorage and a cookie and survives reloads

    @unit @i18n @localePersistence
    Scenario: I18N-04 A chosen language survives a reload and overrides the browser
      Given the browser prefers the languages "en-US"
      When the visitor chooses the language "nl"
      Then localStorage key "sacred-fire-songs-locale" holds "nl"
      And the locale cookie is set to "nl" for one year on path "/"
      And the html lang attribute is "nl"
      When the page is reloaded
      Then the interface language is "nl"
      # vitest: persistLocale › round-trips

    @unit @i18n @localePersistence
    Scenario: I18N-04 Blocked localStorage falls back to the cookie
      Given localStorage is unavailable
      And the locale cookie is "nl"
      When the interface language is resolved in the browser
      Then the interface language is "nl"

    @unit @i18n @localePersistence
    Scenario: I18N-02 The browser default never becomes a stored choice
      Given no language has been chosen
      And the browser prefers the languages "nl-NL"
      When the app mounts in the browser
      Then the interface language is "nl"
      And no locale cookie is written
      And nothing is stored in localStorage

    @unit @i18n @localePersistence
    Scenario: I18N-05 A stored choice without a cookie re-syncs the cookie for the next server render
      Given the stored language is "nl"
      And there is no locale cookie
      When the app mounts in the browser
      Then the locale cookie is set to "nl" for one year on path "/"
      And the html lang attribute is "nl"

  # ---------------------------------------------------------------------------
  Rule: Every key translates; missing translations fall back, placeholders interpolate

    @unit @i18n @translate
    Scenario: I18N-03 Switching the language changes the translated text
      Given the interface language is set to "en"
      Then the key "nav.recentlyViewed" translates to "Recently Viewed"
      When the interface language is set to "nl"
      Then the key "nav.recentlyViewed" translates to "Recent bekeken"
      And with an explicit locale "en" the key "nav.recentlyViewed" still translates to "Recently Viewed"

    @unit @i18n @fallback
    Scenario: I18N-06 A key missing in Dutch falls back to English
      Given an English dictionary where "greeting" is "Hello"
      And a Dutch dictionary without "greeting"
      When "greeting" is translated with the Dutch dictionary active
      Then the text is "Hello"

    @unit @i18n @fallback
    Scenario: I18N-06 An empty Dutch translation falls back to English
      Given an English dictionary where "greeting" is "Hello"
      And a Dutch dictionary where "greeting" is ""
      When "greeting" is translated with the Dutch dictionary active
      Then the text is "Hello"

    @unit @i18n @fallback
    Scenario: I18N-06 A key missing everywhere shows the key name
      Given the interface language is set to "nl"
      When the unknown key "does.not.exist" is translated
      Then the text is "does.not.exist"

    @unit @i18n @interpolation
    Scenario Outline: I18N-08 Placeholders are interpolated
      When the template "<template>" is interpolated with "<params>"
      Then the text is "<result>"

      Examples:
        | template                | params      | result               |
        | {count} songs           | count=3     | 3 songs              |
        | {count} songs           | count=0     | 0 songs              |
        | {a} and {a}             | a=x         | x and x              |
        | Hello {name}, {missing} | name=Ana    | Hello Ana, {missing} |

    @unit @i18n @interpolation
    Scenario: I18N-08 Real dictionary messages interpolate in both languages
      Given the interface language is set to "nl"
      When the key "playlists.picker.addedToNew" is translated with "name=Morning"
      Then the text contains "Morning"
      And the text does not contain "{name}"

  # ---------------------------------------------------------------------------
  Rule: Dictionaries stay in sync

    @unit @i18n @dictionaries
    Scenario: I18N-09 Dutch has exactly the same keys and placeholders as English
      Then the "nl" dictionary has exactly the keys of the "en" dictionary
      And every "nl" translation uses the same placeholders as its English source
      And no translation in any dictionary is empty

    @static @i18n
    Scenario: I18N-09 An unknown key fails the TypeScript build
      Given a component calls t with a key that is not in messages/en.ts
      When the project is type-checked
      Then the type checker reports the key as not assignable to TranslationKey
      # covered by npx tsc --noEmit – TranslationKey = keyof typeof en

  # ---------------------------------------------------------------------------
  Rule: Every additional language is complete and selectable

    @unit @i18n @dictionaries
    Scenario Outline: I18N-12 The <locale> dictionary is complete
      Then the "<locale>" dictionary has exactly the keys of the "en" dictionary
      And every "<locale>" translation uses the same placeholders as its English source
      And the key "nav.recentlyViewed" in "<locale>" is "<recentlyViewed>"

      Examples:
        | locale | recentlyViewed         |
        | es     | Vistas recientemente   |
        | it     | Visti di recente       |
        | ru     | Недавно просмотренные  |
        | qu     | Qhipa qhawasqakuna     |
        | fr     | Vus récemment          |
        | pt     | Vistas recentemente    |

  # ---------------------------------------------------------------------------
  Rule: The playlist PDF export follows the interface language

    @unit @i18n @pdfExport
    Scenario Outline: I18N-11 PDF document labels are translated
      When the PDF labels are built for the language "<locale>"
      Then the page footer for page 1 of 3 reads "<page>"
      And the key label for "Am" reads "<key>"
      And the subtitle for 2 songs generated on "<date>" reads "<subtitle>"
      And dates are formatted with "<dateLocale>"
      # vitest: testing/unit/tests/pdfExport.test.ts › document labels follow the interface language

      Examples:
        | locale | page           | key           | date         | subtitle                                | dateLocale |
        | en     | Page 1 of 3    | Key: Am       | Oct 30, 2026 | 2 songs   •   Generated Oct 30, 2026    | en-US      |
        | nl     | Pagina 1 van 3 | Toonsoort: Am | 30 okt 2026  | 2 liederen   •   Gemaakt op 30 okt 2026 | nl-NL      |

    @unit @i18n @pdfExport
    Scenario: I18N-11 Export messages and the login prompt are translated
      Given the interface language is set to "nl"
      Then the key "playlists.export.menu" translates to "PDF exporteren"
      And the key "playlists.export.login.title" translates to "Meld je aan om een PDF te exporteren"
      And the key "playlists.export.empty" translates to "Een lege afspeellijst kan niet worden geëxporteerd. Voeg eerst liederen toe."

  # ---------------------------------------------------------------------------
  Rule: The interface follows the choice in the browser

    @e2e @i18n
    Scenario: I18N-01 An unsupported browser language shows English
      Given a guest whose browser language is "de-DE" and who never chose a language
      When the guest opens "/songs"
      Then the sidebar shows "Recently Viewed"
      And the html lang attribute is "en"
      # e2e/tests/i18n.spec.ts

    @e2e @i18n
    Scenario: I18N-02 A Dutch browser gets Dutch from the first server render
      Given a guest whose browser language is "nl-BE" and who never chose a language
      When the guest requests "/songs"
      Then the server HTML has lang "nl" and contains "Recent bekeken"

    @e2e @i18n
    Scenario: I18N-03 A guest switches to Dutch from the sidebar
      Given a guest whose browser language is "en-US"
      When the guest opens "/songs" and presses "NL" in the sidebar language switcher
      Then the sidebar shows "Recent bekeken" without a full page reload
      And the html lang attribute is "nl"
      And "NL" is marked as pressed

    @e2e @i18n
    Scenario: I18N-04 The choice survives a reload and navigation
      Given a guest who switched to Dutch
      When the guest reloads the page and opens "/library/playlists"
      Then the interface is still Dutch

    @e2e @i18n
    Scenario: I18N-04 A member's choice survives signing out and in again
      Given a member who switched to Dutch in Account, Preferences
      When the member signs out and signs in again
      Then the interface is still Dutch

    @e2e @i18n
    Scenario: I18N-05 No hydration mismatch with Dutch selected
      Given a guest who switched to Dutch
      When the guest reloads "/songs"
      Then the browser console shows no hydration error

    @e2e @i18n
    Scenario: I18N-10 Song content is not translated
      Given a guest who switched to Dutch
      When the guest opens a song from the list
      Then the song title is the same as in English
