# Sacred Fire Songs – Song behaviour catalogue
# Version: 1.0 | Date: Oct 30, 2026
#
# Living Gherkin description of every song situation that the automated tests
# exercise. Each scenario names the test that covers it (unit = vitest files in
# lib/unit-tests and testing/unit/tests; e2e = Playwright specs in e2e/tests;
# manual = docs/design/test-cases.md). The test database is seeded by
# scripts/random-seeder.mjs, whose deterministic "anchor" songs are referenced
# by title below; the seeder must keep producing every shape listed here.
#
# Changelog
#   1.0 – Oct 30, 2026 – Initial catalogue derived from the unit, e2e and manual tests.

Feature: Songs
  Songs are compositions (title, author, visibility, owner, has_chords, has_melody)
  with one or more versions (ChordPro content, key, capo, tuning, media links,
  optional ABC melody notation), tags, artists, playlists, favorites and private
  rehearsal recordings.

  Background:
    Given the seeded test accounts exist
      | role       | email                              | profile role |
      | admin      | roel.de.meester+admin@gmail.com      | admin        |
      | musician   | roel.de.meester+expert@gmail.com     | expert       |
      | member     | roel.de.meester+member@gmail.com     | member       |
      | gatekeeper | roel.de.meester+gatekeeper@gmail.com | gatekeeper   |
    And the category taxonomy exists with parents "The Elements", "Nature", "Languages", "Lineage & Tradition", "Medicine & Healing", "Spiritual Concepts" and "Artists"
    And the database is seeded with the anchor songs and at least 80 songs in total

  # ---------------------------------------------------------------------------
  Rule: ChordPro content is parsed into title, author, key, capo and chord/lyric lines

    @unit @chordProParsing
    Scenario: Inline chords in square brackets
      Given a song whose content is "{title: Test Song}\n[Am]Hello [G]World"
      When the content is parsed for display
      Then there is one section with one line
      And the line contains the chord "Am" with lyrics "Hello " and the chord "G" with lyrics "World"
      And the "{title:}" directive does not render as a line
      # Seeded as anchor "Test Song"

    @unit @chordProParsing
    Scenario: Metadata directives are read and stripped, case-insensitively
      Given a song whose content starts with "{title: Morning Sunrise}", "{artist: Shimshai}", "{key: C}" and "{Capo: 2}"
      And the content ends with a blank line and "{subtitle: Another song}"
      When the content is parsed
      Then the title is "Morning Sunrise" and the author is "Shimshai"
      And the key is "C" and the capo is "2"
      And the cleaned content contains no "{key:" or "{capo:" directive
      # Seeded as anchor "Morning Sunrise"

    @unit @chordProParsing
    Scenario Outline: Author directive aliases
      Given a song whose content declares the author with "<directive>"
      When the content is parsed
      Then the author is "<author>"

      Examples:
        | directive          | author      |
        | {artist: Shimshai} | Shimshai    |
        | {author: Shimshai} | Shimshai    |
        | {a: Tester}        | Tester      |
      # Anchor "Test Key Capo" uses {t:} {a:} {k:} and {capo: 3}; anchor "Eu sou Santa Maria" uses {author:}

    @unit @chordProParsing
    Scenario: Chords written on the line above the lyrics (English)
      Given a song whose content has chord names such as "G", "D" and "C" aligned above lyric lines
      And the content contains whitespace-only separator lines and "Page 1/2" markers
      And a lyric line contains the curly apostrophe in "don’t"
      And the final stanza has a lyric line without a chord line above it
      When the content is converted to ChordPro
      Then the converted content contains "As I went [G]down in the river to pray"
      And the converted content contains "[D]Studying about that [G]good old way"
      And the page marker "Page 1/2" is kept
      And the song counts as having chords
      # Fixture DownToTheRiver-chordsOverLyrics.txt; seeded as anchor "Down to the River"

    @unit @chordProParsing
    Scenario: Chords above lyrics with complex chord names and accented Italian lyrics
      Given a song whose chord lines contain "Gbmaj7", "Dbmaj7", "Ebmaj7", "Bbm", "Fm" and "Ab"
      And a chord line holds several chords such as "Gbmaj7  Dbmaj7  Ebmaj7"
      And the lyrics contain accented words such as "è", "Andrè" and "Raffaè" and hyphenated syllables such as "Comprami-"
      When the content is converted to ChordPro
      Then the converted content contains "[Gbmaj7]Mia nonna quando è morta"
      And the converted content contains "[Db]Non mi ha lasciato niente"
      And the converted content contains "[Gbmaj7]Comprami-"
      # Fixture DonneRiccheChordsOverLyrics.txt; seeded as anchor "Donne Ricche"

    @unit @chordProParsing
    Scenario: A line is treated as a chord line when most of its tokens are chord names
      Given a line whose tokens match the pattern letter A-G, optional # or b, optional m/min/maj/dim/aug/sus/add, optional number and optional slash bass
      And tokens in parentheses and the "|" character are ignored
      When more than half of the tokens are chords
      Then the line is merged as chords into the lyric line below it

    @seed
    Scenario: Content shapes the seeder must keep producing
      Then the seeded songs include content with comment directives "{c:}" and "{ci:}" that are kept, not treated as capo
      And content with chorus sections delimited by "{soc}" and "{eoc}"
      And content with a "{tag: Santa Maria}" directive
      And content with slash chords such as "[D/F#]" and sharp chords such as "[C#m7]" and "[F#m]"
      And content with blank-line stanza breaks and more than twenty stanzas
      And lyrics-only content without any chord
      And an empty content string
      And a composition without any version at all
      # Anchors "Pachamama", "Inan Tonanzin", "Grandmother's Song of the Thousand Rivers…", "Grandmother Earth", "Silent Prayer", "Luz Divina"

  # ---------------------------------------------------------------------------
  Rule: Song metadata flags describe chords, melody and media

    @unit @queries
    Scenario: A composition is mapped to a song with its first version
      Given a composition "Test Song" by "Test Author" that is public with has_chords true and has_melody false
      And its first version has content "[Am]Hello" and key "Am"
      When the composition is mapped to a song
      Then the song has key "Am", content "[Am]Hello", isPublic true, hasChords true and hasMelody false

    @unit @queries
    Scenario: A composition without versions maps to an empty song body
      Given a composition that has no versions
      When the composition is mapped to a song
      Then the song key is null and the content is an empty string
      # Seeded as anchor "Luz Divina"

    @unit @queries
    Scenario: Missing booleans fall back to defaults
      Given a composition whose is_public, has_chords and has_melody are null
      When the composition is mapped to a song
      Then isPublic is true, hasChords is false and hasMelody is false

    @seed
    Scenario Outline: has_chords and has_melody are consistent with the content and media
      Given a seeded song of shape "<shape>"
      Then has_chords is <has_chords> and has_melody is <has_melody>

      Examples:
        | shape                                        | has_chords | has_melody |
        | inline chords, no media                      | true       | false      |
        | inline chords, YouTube link                  | true       | true       |
        | lyrics only, no media                        | false      | false      |
        | lyrics only, YouTube link                    | false      | true       |
        | inline chords, ABC melody notation, no links | true       | true       |
      # Anchors "Espíritu del agua", "Pachamama", "Grandmother Earth", "Wakan Tanka", "Canto Sem Fim"

    @e2e @media-player @recording
    Scenario: A song with YouTube, Spotify and SoundCloud references
      Given the song "Danza del Cielo Curandero" by "Herbert Quinteros" with key "E", capo 3 and tuning "Standard"
      And it links to "https://www.youtube.com/watch?v=dbbZGLR_e20", "https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH" and "https://soundcloud.com/user-778401370/la-curandera"
      When a guest opens the song
      Then a YouTube iframe titled "YouTube video player" with an embed URL is shown
      And a Spotify embed iframe is shown
      And the YouTube, Spotify and SoundCloud buttons are present
      When the member plays the YouTube reference
      Then the mini player shows the song title and "YouTube Reference"
      And the source switcher lists YouTube and SoundCloud but Spotify has no mini player

    @e2e @timeouts
    Scenario: A song with YouTube and Spotify but no SoundCloud
      Given a song with key "G", capo 0, a YouTube link and a Spotify link and no SoundCloud link
      When the page loads while authentication is slow
      Then the skeleton resolves after the guest fallback timeout and the song renders

    @e2e @recording
    Scenario: The Reference Tracks tab only exists when the song has media
      Given a song without any media link
      When a member opens the rehearsal drawer
      Then there is no "Reference Tracks" tab
      Given a song with at least one media link
      When a guest opens the rehearsal drawer
      Then the default tab is "Reference Tracks"

    @seed
    Scenario: Keys, capos and tunings
      Then seeded songs use keys including "Am", "Em", "C", "G", "D", "Dm", "F", "A", "E", "Bm", "F#m", "Gb", "Bb", "C#m" and no key
      And capos range from 0 to 5 and some content carries a "{capo:}" directive
      And tunings include "Standard", "Half-Step Down", "Drop D" and "DADGAD"
      And some songs have a second version such as "Temazcal version", "Live version" or "Capo version"
      # Anchor "Agüita que Vienes" has two versions

  # ---------------------------------------------------------------------------
  Rule: Authors may name several artists and are normalised for filtering

    @unit @artistUtils
    Scenario Outline: Parsing an author string into artists
      Given the author string "<author>"
      When the artists are parsed
      Then the result is <artists>

      Examples:
        | author                                   | artists                                        |
        | Herbert Quinteros                        | ["Herbert Quinteros"]                          |
        | Herbert Quinteros, Cari El               | ["Herbert Quinteros", "Cari El"]               |
        | Herbert Quinteros, Cari El, Shimshai     | ["Herbert Quinteros", "Cari El", "Shimshai"]   |
        | Herbert Quinteros / Cari El              | ["Herbert Quinteros", "Cari El"]               |
        | Herbert Quinteros & Cari El              | ["Herbert Quinteros", "Cari El"]               |
        | Herbert Quinteros and Cari El            | ["Herbert Quinteros", "Cari El"]               |
        | Shimshai, shimshai, Cari El              | ["Shimshai", "Cari El"]                        |
        |                                          | []                                             |
      # Seeded: anchors "Donne Ricche" (&) and "Grandmother's Song…" (", " "/" "and"); random songs use ", " " / " " & " " and " " &amp; "

    @unit @artistUtils
    Scenario: Formatting artists for storage
      Given the artists [" Herbert Quinteros ", "Cari El", "Herbert Quinteros"]
      When they are formatted
      Then the stored author is "Herbert Quinteros, Cari El"

    @unit @artistUtils
    Scenario: Artist suggestions are sorted by song count, then name
      Given artists Cari El (5 songs), Danit (12), Herbert Quinteros (5) and Ayla Nereo (2)
      When the suggestions are sorted
      Then the order is Danit, Cari El, Herbert Quinteros, Ayla Nereo

    @unit @artistNormalization
    Scenario: The same artist written in different ways counts once
      Given songs by "FirstName SecondName", "FirstName  SecondName", "firstname secondname" and "  FirstName SecondName  "
      When the artist list is built
      Then there is one artist with 4 songs
      And the canonical spelling is the one with more capital letters
      # Seeded: "Herbert  Quinteros" (double space), "shimshai" (lower case) and padded variants in random songs

    @unit @artistNormalization
    Scenario: Songs without an author are grouped as "No Artist" and listed last
      Given songs by "Traditional", null, "" and "Danit"
      When the artist list is built
      Then the order is Danit, Traditional, No Artist
      And "No Artist" has 2 songs
      And the filter values "No Artist" and "unspecified" match songs with an empty or missing author
      # Seeded: anchor "Luz Divina" has author "" ; random songs include "" and null authors

    @unit @artistNormalization
    Scenario: Artist filter ignores case and spacing
      Given a song whose author is "First  Last"
      Then filtering by "First Last" and by "first   last" both match it

    @e2e @search
    Scenario: Searching by the author shown on the first card
      Given the first song card shows an author that is not "Unknown"
      When the author is typed in lower case into the search box
      Then the song is found

    @seed
    Scenario: Artist categories mirror the stored authors
      Then every distinct parsed artist has a subcategory under "Artists" with slug "artist-<slugified name>" and emoji "👤"
      And the song is linked to each of its artists' subcategories

  # ---------------------------------------------------------------------------
  Rule: Songs are tagged with categories

    @unit @queries
    Scenario: Category mapping keeps the parent name
      Given a song mapped to the category "Healing" (slug "healing") under parent "Theme"
      When the composition is mapped to a song
      Then the song's first category has parent "Theme"
      And a song without mappings has an empty category list

    @unit @filterConfig
    Scenario: Category filter is OR, tag filter is AND
      Given songs with various tags
      When filtering by two parent categories
      Then songs in either parent match
      When filtering by two tag slugs
      Then only songs carrying both tags match

    @manual @test-cases
    Scenario Outline: Filtering by taxonomy URL parameters
      When a user opens "<url>"
      Then only songs matching the parameters are listed

      Examples:
        | url                                       |
        | /songs?category=the-elements              |
        | /songs?category=nature                    |
        | /songs?category=nature&tag=water,plantas  |

    @e2e @performance
    Scenario: The filter modal offers at least one category checkbox
      When the search options modal is opened on /songs
      Then the first checkbox can be toggled and the list refreshes within the performance budget

    @seed
    Scenario: Tag distribution
      Then every non-artist subcategory is used by at least one song
      And songs carry between 1 and 5 tags, normally distributed around 3
      And about one song in twenty carries no tag at all
      And language tags include Spanish, English, Portuguese, Italian and Nahuatl content

  # ---------------------------------------------------------------------------
  Rule: Visibility, ownership and roles

    @e2e @smoke
    Scenario: A guest sees public songs only
      When a guest opens /songs
      Then at least one song link other than /songs/add is shown
      And private songs are not listed
      When the guest opens /account/settings
      Then they are redirected to the login page

    @unit @filterConfig
    Scenario: Status filter distinguishes drafts
      Given songs that are public and songs that are private
      When the status filter is "draft"
      Then only songs with isPublic false are returned
      When the status filter is "public"
      Then only public songs are returned

    @seed
    Scenario: Ownership spread
      Then songs are owned by the admin, the musician, the member and the gatekeeper accounts, and some songs have no owner
      And about 15% of songs are private drafts
      # Anchors: "Eu sou Santa Maria" (member draft), "Wakan Tanka" (admin draft), "Grandmother's Song…" (gatekeeper), "Donne Ricche" / "Test Key Capo" / "Inan Tonanzin" (no owner)

    @manual @test-cases
    Scenario: Only the owner or an admin can edit a song
      Given a song owned by the member
      Then the member can edit it
      And the musician cannot edit it
      And the admin can edit it

    @e2e @auth-hydration
    Scenario: A signed-in member never sees a "Sign In" flash on /songs
      When the member opens /songs
      Then the header shows the account state without flashing the sign-in button

  # ---------------------------------------------------------------------------
  Rule: Private rehearsal recordings belong to a user and a song version

    @e2e @recording
    Scenario: Recording, playing, downloading and deleting a take on the first song
      Given the first song on /songs has no recordings for the member
      When the member records a take and saves it
      Then the header recordings pill shows "1"
      When the member re-opens the drawer
      Then the take can be played, downloaded as ".webm" and deleted
      # The seeder keeps the newest song ("Morning Sunrise") free of recordings so the count is exactly 1

    @e2e @recording
    Scenario: Uploading an audio file as a recording
      When the member uploads "dummy-audio.wav"
      Then the recording name defaults to "dummy-audio"
      And it downloads with the ".wav" extension

    @e2e @recording
    Scenario Outline: Recording limits
      When <action>
      Then <outcome>

      Examples:
        | action                                   | outcome                                             |
        | a recording reaches 03:00                | it stops automatically                              |
        | a file larger than 10 MB is uploaded     | the message "File size exceeds the 10 MB limit." is shown |

    @e2e @recording
    Scenario: A guest cannot record
      When a guest opens the rehearsal drawer
      Then "Personal Rehearsal Recorder" and "Sign In to Record" are shown

    @e2e @media-player
    Scenario: The mini player keeps playing while the drawer is toggled
      Given a recording is playing in the mini player
      When the drawer is closed and reopened
      Then playback continues from the same position

    @seed
    Scenario: Recording distribution
      Then about half of the songs have 2 to 5 takes, about 30% have exactly one and about 20% have none
      And recordings exist for the member, the admin, the musician and the gatekeeper
      And storage paths follow "<user id>/<version id>/<recording id>.<webm|wav>" with both extensions present
      And every recording has a position, a file size in bytes and a duration in seconds
      # Anchors: "Danza del Cielo Curandero" (5 member takes "Rehearsal Take 1..5"), "Mother I Feel You" (12 member takes), "Hey Yamayo" (admin and member takes)

  # ---------------------------------------------------------------------------
  Rule: Playlists and favorites

    @e2e @public-playlist-curation
    Scenario: A gatekeeper curates public playlists of other users
      Given the member's public playlist "Water Ceremony" with id aaaaaaaa-0001-4000-a000-000000000001
      When the gatekeeper opens it
      Then they can edit its description and add songs through the "Add Songs" sheet
      Given the member's private playlist "My Healing Practice" with id aaaaaaaa-0003-4000-a000-000000000003
      When the gatekeeper opens it
      Then "Song Not Found" is shown

    @e2e @public-playlist-curation
    Scenario: A member can view but not curate an admin's public playlist
      Given the admin's public playlist "Admin Fire Circle" with id aaaaaaaa-0002-4000-a000-000000000002
      When the member opens it
      Then the songs are listed but there is no "Add Songs" button and the description is not editable

    @e2e @smoke
    Scenario: A member creates a playlist
      When the member creates a playlist named "Smoke Test Playlist <timestamp>"
      Then it appears in their playlists

    @unit @schemas @playlistActions
    Scenario Outline: Playlist validation
      When a playlist is saved with title "<title>" and a description of <description length> characters
      Then the result is <result>

      Examples:
        | title            | description length | result                 |
        | Water Ceremony   | 10                 | valid                  |
        |                  | 0                  | invalid (blank title)  |
        | 201 characters   | 0                  | invalid (title length) |
        | Fire Songs       | 2001               | invalid (description)  |

    @unit @playlistActions
    Scenario: Smart playlists are recognised by exact title
      Then "My Favorites", "My Songs", "My Drafts" and "My Recordings" are smart playlists
      And "my favorites" is not

    @unit @queries @useGuestFavorites
    Scenario: Favorites for members and guests
      Given the member owns a playlist titled "My Favorites"
      Then songs in it are mapped with isFavorite true
      Given a guest
      Then favorites are stored under the localStorage key "sfs_guest_favorites"
      And toggling adds and removes ids, and corrupt JSON yields an empty list

    @seed
    Scenario: Seeded playlists
      Then the playlists with ids aaaaaaaa-0001 … aaaaaaaa-0007 exist with the titles "Water Ceremony", "Admin Fire Circle", "My Healing Practice", "New Moon Ceremony", "Work in Progress", "Fire Songs" and "Gatekeeper Circle"
      And "Work in Progress" is empty
      And "Water Ceremony" prefers songs tagged "water" and "Admin Fire Circle" prefers songs tagged "fire"
      And the member, the admin and the musician each own a "My Favorites" playlist
      And the member and the admin have recently viewed songs

  # ---------------------------------------------------------------------------
  Rule: Search, sorting, pagination and performance

    @unit @songUtils
    Scenario Outline: Filtering songs by text
      Given the songs "Grandmother Earth" (Traditional, Am), "Aguita de la Vida" (Danit, Em) and "Pachamama" (Medicine Family, G)
      When the search text is "<query>"
      Then <count> songs match

      Examples:
        | query | count |
        | GRAND | 1     |
        | Danit | 1     |
        |       | 3     |
        | xyz   | 0     |
      # Seeded as anchors with the same titles and authors

    @unit @filterConfig
    Scenario: Search matches title, author, content, category and parent category, ignoring accents
      Given the song "Espíritu del agua"
      When the search text is "espiritu"
      Then the song matches

    @manual @test-cases
    Scenario: Accented titles render and search correctly
      Given the song "Agüita que Vienes" with the line "[Bm]Agüitay, [A]agüita"
      Then the chords render above "Agüitay" and "agüita"
      When "Espíritu" is searched
      Then "Espíritu del agua" is shown and "Pachamama" is hidden

    @e2e @search
    Scenario: Search feedback
      When "vuela" is typed into the search box
      Then a spinner appears after the debounce and the list dims while loading
      When "NonExistentSongName123" is typed
      Then "No songs found" is shown and the URL carries "search=NonExistentSongName123"

    @e2e @performance
    Scenario: Search for "test" returns within budget
      When "test" is typed into the search box
      Then results render within the performance budget
      # Anchor "Test Song" guarantees at least one hit

    @unit @serverQueries
    Scenario: Default ordering and pagination
      Then songs are ordered by created_at descending, then id descending
      And pages contain 20 songs using a keyset cursor
      # The seeder spreads created_at over 400 days, with the anchors as the newest songs

    @e2e @performance
    Scenario Outline: Page load budgets
      Given the database holds <songs> songs
      When "<page>" is loaded
      Then DOMContentLoaded is under <dcl> ms, load under <load> ms and first contentful paint under <fcp> ms

      Examples:
        | songs   | page            | dcl  | load | fcp  |
        | 80      | /songs          | 2000 | 3000 | 1000 |
        | 80      | /songs/[id]     | 2000 | 3000 | 1000 |
        | 500     | /songs          | 3000 | 5000 | 2000 |
        | 1000    | /songs          | 5000 | 8000 | 3000 |
      # E2E_RANDOM_SONGS_COUNT controls the seeded count

    @seed
    Scenario: Search edge cases the seeder provides
      Then there are titles that differ only by an accent ("Agüita que Vienes" vs "Aguita de la Vida")
      And a title longer than 100 characters containing an apostrophe and an emoji
      And titles containing "Pachamama" both alone and inside longer titles
      And content in Spanish, English, Portuguese, Italian, Nahuatl and Lakota
