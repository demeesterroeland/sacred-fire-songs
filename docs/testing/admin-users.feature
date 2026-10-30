# Sacred Fire Songs – Admin user overview catalogue (Story 3.6.1, issue #258)
# Version: 1.1 | Date: Oct 30, 2026
#
# Living Gherkin description of the admin users overview, user details and
# contributions (Epic 3.6 #257 / Story 3.6.1 #258). Same layering as
# docs/testing/song.feature:
#   @unit – Cucumber steps in testing/bdd/steps/admin-users.steps.ts driving
#           lib/admin/userOverview.ts and lib/admin/userQueries.ts against the
#           in-memory Supabase double (testing/support/fakeSupabase.ts);
#           mirrored by vitest in testing/unit/tests/adminUserOverview.test.ts
#           and testing/unit/tests/adminQueries.test.ts.
#   @seed – Cucumber steps against the local Supabase database (DATABASE_URL,
#           default postgresql://postgres:postgres@127.0.0.1:54322/postgres):
#           seeded accounts, schema contract, RLS. Writes run in a rolled-back
#           transaction.
#   @e2e  – Playwright spec e2e/tests/admin-users.spec.ts.
#
# Run: npm run test:bdd (all @unit + @seed), npm run test:bdd:unit,
#      npm run test:bdd:seed, npx playwright test e2e/tests/admin-users.spec.ts
#
# Out of scope: the story lists "comments/flags" as an example contribution.
# The data model has no comments or flags yet, so they are not shown or tested.
#
# Changelog
#   1.0 – Oct 30, 2026 – Initial catalogue for Story 3.6.1 acceptance criteria.
#   1.1 – Oct 30, 2026 – Sort by name Z-A and by number of songs, remembered sort (#278),
#                        clickable user rows (#279), listbox-style role/sort pickers.

@adminUsers
Feature: Admin users overview, details and contributions
  As an Admin, I want an overview of all users, their details and their
  contributions, so that I can monitor community activity and keep account
  information accurate and up to date.

  Background:
    Given the seeded test accounts exist
      | role       | email                                | profile role |
      | admin      | roel.de.meester+admin@gmail.com      | admin        |
      | musician   | roel.de.meester+expert@gmail.com     | expert       |
      | member     | roel.de.meester+member@gmail.com     | member       |
      | gatekeeper | roel.de.meester+gatekeeper@gmail.com | gatekeeper   |

  # ---------------------------------------------------------------------------
  # AC 3 – Non-admin access restricted
  Rule: Only administrators can open the admin area

    @unit @adminAccess
    Scenario Outline: Admin access is decided by the profile role
      Given the signed-in user has the profile role "<profile role>"
      When admin access is checked
      Then admin access is <decision>
      And the users overview query returns <result>

      Examples:
        | profile role | decision | result      |
        | admin        | granted  | the users   |
        | member       | denied   | nothing     |
        | gatekeeper   | denied   | nothing     |
        | expert       | denied   | nothing     |

    @unit @adminAccess
    Scenario: A visitor without a session is denied
      Given nobody is signed in
      When admin access is checked
      Then admin access is denied
      And the users overview query returns nothing
      And the user details query returns nothing

    @seed @adminAccess
    Scenario: The database recognises only the admin account as admin
      Then fn_is_admin() is true for the admin account only

    @seed @adminAccess
    Scenario: Row-level security lets only the admin read other users' private playlists
      Given the member owns a private playlist
      Then the admin account can read that playlist
      And the musician account cannot read that playlist
      And the gatekeeper account cannot read that playlist

    @e2e @adminAccess
    Scenario Outline: A <role> is shown an unauthorized notice
      Given I am logged in as the <role>
      When I open /admin/users
      Then I see the "Access Denied" notice
      And no user list is shown

      Examples:
        | role       |
        | member     |
        | gatekeeper |
        | musician   |

    @e2e @adminAccess
    Scenario: A guest is sent to the login page
      When a guest opens /admin/users
      Then they are redirected to the login page
      # proxy.ts redirects before the admin layout runs (no next= parameter)

    @e2e @adminAccess
    Scenario: Only the admin sees the Admin Portal entry in the account menu
      Given I am logged in as the admin
      When I open the account menu
      Then I see an "Admin Portal" link to /admin/users
      Given I am logged in as the member
      When I open the account menu
      Then I do not see an "Admin Portal" link

  # ---------------------------------------------------------------------------
  # AC 1 – View user list overview
  Rule: The users overview lists every registered user with summary details

    @unit @adminUsersList
    Scenario: Every registered user is listed, most recently joined first
      Given the registered users
        | email             | name       | role       | joined     | last seen  |
        | admin@test.com    | Ada Admin  | admin      | 2026-01-01 | 2026-10-29 |
        | gk@test.com       | Gus Keeper | gatekeeper | 2026-02-01 |            |
        | expert@test.com   | Eve Expert | expert     | 2026-03-01 | 2026-08-01 |
        | member@test.com   |            | member     | 2026-05-01 |            |
      And today is 2026-10-30
      When the admin loads the users overview
      Then the overview lists 4 users in this order with these summary details
        | email           | role       | joined     | status       |
        | member@test.com | member     | 2026-05-01 | never        |
        | expert@test.com | expert     | 2026-03-01 | inactive     |
        | gk@test.com     | gatekeeper | 2026-02-01 | never        |
        | admin@test.com  | admin      | 2026-01-01 | active       |

    @unit @adminUsersList
    Scenario Outline: Status reflects the last activity
      Given today is 2026-10-30
      When a user was last seen <last seen>
      Then their status is "<status>"

      Examples:
        | last seen             | status   |
        | on 2026-10-29         | active   |
        | on 2026-09-30         | active   |
        | on 2026-09-29         | inactive |
        | never                 | never    |

    @unit @adminUsersList
    Scenario: Contribution counts are shown per user
      Given the registered users
        | email           | name       | role   | joined     | last seen |
        | expert@test.com | Eve Expert | expert | 2026-03-01 |           |
        | member@test.com |            | member | 2026-05-01 |           |
      And "expert@test.com" created 2 songs, submitted 3 versions and created 2 playlists of which 1 is public
      And "member@test.com" created 0 songs, submitted 0 versions and created 1 playlists of which 0 is public
      When the admin loads the users overview
      Then "expert@test.com" shows 2 songs, 3 versions, 2 playlists and 1 public playlist
      And "member@test.com" shows 0 songs, 0 versions, 1 playlists and 0 public playlist

    @unit @adminUsersList
    Scenario: Searching, filtering and sorting the overview
      Given the registered users
        | email           | name       | role       | joined     | last seen |
        | admin@test.com  | Ada Admin  | admin      | 2026-01-01 |           |
        | gk@test.com     | Gus Keeper | gatekeeper | 2026-02-01 |           |
        | expert@test.com | Eve Expert | expert     | 2026-03-01 |           |
        | mo@test.com     | Mo Strings | musician   | 2026-04-01 |           |
        | member@test.com |            | member     | 2026-05-01 |           |
      And "expert@test.com" created 3 songs, submitted 0 versions and created 0 playlists of which 0 is public
      And "admin@test.com" created 1 songs, submitted 0 versions and created 0 playlists of which 0 is public
      When the admin loads the users overview
      And the admin searches for "  EVE "
      Then only "expert@test.com" is listed
      When the admin searches for "member@"
      Then only "member@test.com" is listed
      When the admin clears the search and filters on role "musician"
      Then "expert@test.com, mo@test.com" are listed
      When the admin clears the search and filters on role "gatekeeper"
      Then only "gk@test.com" is listed
      When the admin sorts by "contributions"
      Then the first listed users are "expert@test.com, admin@test.com"
      When the admin sorts by "name"
      Then the first listed users are "admin@test.com, expert@test.com, gk@test.com"

    @unit @adminUsersList @adminUsersSort
    Scenario Outline: Sorting by name and by number of songs (#278)
      Given the registered users
        | email           | name       | role       | joined     | last seen |
        | admin@test.com  | Ada Admin  | admin      | 2026-01-01 |           |
        | gk@test.com     | Gus Keeper | gatekeeper | 2026-02-01 |           |
        | expert@test.com | Eve Expert | expert     | 2026-03-01 |           |
        | member@test.com |            | member     | 2026-05-01 |           |
      And "expert@test.com" created 3 songs, submitted 0 versions and created 0 playlists of which 0 is public
      And "gk@test.com" created 1 songs, submitted 0 versions and created 0 playlists of which 0 is public
      When the admin loads the users overview
      And the admin sorts by "<sort>"
      Then the first listed users are "<order>"

      Examples:
        | sort       | order                                                       |
        | name       | admin@test.com, expert@test.com, gk@test.com, member@test.com |
        | name_desc  | member@test.com, gk@test.com, expert@test.com, admin@test.com |
        | songs_desc | expert@test.com, gk@test.com, admin@test.com, member@test.com |
        | songs_asc  | admin@test.com, member@test.com, gk@test.com, expert@test.com |

    @unit @adminUsersList
    Scenario: A search without matches shows the empty state
      Given the registered users
        | email          | name      | role  | joined     | last seen |
        | admin@test.com | Ada Admin | admin | 2026-01-01 |           |
      When the admin loads the users overview
      And the admin searches for "nobody-here"
      Then no users are listed

    @seed @adminUsersList
    Scenario: The admin queries match the database schema
      Then every column the admin queries rely on exists in the database
      And the admin account can read every profile and every playlist in the database

    @e2e @adminUsersList
    Scenario: The admin sees every seeded account with summary details
      Given I am logged in as the admin
      When I open /admin/users
      Then the "Registered users" list shows the admin, musician, member and gatekeeper e-mail addresses
      And each row shows a role badge, a "Joined" date and a status

    @e2e @adminUsersList
    Scenario: Searching and filtering in the browser
      Given I am logged in as the admin
      When I open /admin/users
      And I search for "+gatekeeper@"
      Then only the gatekeeper row is listed
      When I search for "no-such-user-xyz"
      Then I see "No users found"
      When I clear the search and filter on "Musician / Expert"
      Then only the musician row is listed

    @e2e @adminUsersSort
    Scenario: The chosen sort is remembered (#278)
      Given I am logged in as the admin
      When I open /admin/users and pick "Most songs" in the sort picker
      Then the rows are ordered by number of songs, most first
      When I reload the page
      Then the sort picker still shows "Most songs"

    @e2e @adminUsersList
    Scenario: Clicking anywhere on a row opens the user's details (#279)
      Given I am logged in as the admin
      When I open /admin/users and click the gatekeeper row outside the "Details" button
      Then I am on the gatekeeper's detail page

  # ---------------------------------------------------------------------------
  # AC 2 – View user detail and contributions
  Rule: The user detail page shows profile details and contributions

    @unit @adminUserDetails
    Scenario: Selecting a user shows their profile details
      Given the registered users
        | email           | name       | role   | joined     | last seen  |
        | expert@test.com | Eve Expert | expert | 2026-03-01 | 2026-10-20 |
      And today is 2026-10-30
      When the admin opens the details of "expert@test.com"
      Then the details show the email "expert@test.com", role "expert" and last active "2026-10-20"
      And the musician status is "yes"
      And the status is "active"

    @unit @adminUserDetails
    Scenario: Selecting a user shows their contributions
      Given the registered users
        | email           | name       | role   | joined     | last seen |
        | expert@test.com | Eve Expert | expert | 2026-03-01 |           |
      And "expert@test.com" owns the song "Medicine Song" by "Curandero"
      And "expert@test.com" submitted the version "Guitar Tab" of "Medicine Song"
      And "expert@test.com" created the public playlist "Night Ceremony" and the private playlist "Practice"
      When the admin opens the details of "expert@test.com"
      Then the songs added are "Medicine Song" by "Curandero"
      And the versions submitted are "Guitar Tab" of "Medicine Song"
      And the playlists are "Practice, Night Ceremony" of which 1 is public

    @unit @adminUserDetails
    Scenario: A user without contributions has empty contribution lists
      Given the registered users
        | email           | name | role   | joined     | last seen |
        | member@test.com |      | member | 2026-05-01 |           |
      When the admin opens the details of "member@test.com"
      Then the musician status is "no"
      And the user has no songs, versions or playlists

    @unit @adminUserDetails
    Scenario: An unknown user id is not found
      Given the registered users
        | email          | name      | role  | joined     | last seen |
        | admin@test.com | Ada Admin | admin | 2026-01-01 |           |
      When the admin opens the details of an unknown user id
      Then no user details are returned

    @e2e @adminUserDetails
    Scenario: The admin opens a user and browses their contributions
      Given the gatekeeper owns the song "E2E Admin Overview Song" with the version "E2E Arrangement" and the public playlist "E2E Admin Playlist"
      And I am logged in as the admin
      When I open /admin/users and click "View details" for the gatekeeper
      Then I see the gatekeeper's e-mail, the "Gatekeeper" role, "Musician: No", "Joined" and "Last Active"
      And the "Songs" tab lists "E2E Admin Overview Song"
      When I open the "Versions" tab
      Then it lists "E2E Arrangement" for "E2E Admin Overview Song"
      When I open the "Playlists" tab
      Then it lists "E2E Admin Playlist" as public
      When I click "Users" in the breadcrumb
      Then I am back on /admin/users

    @e2e @adminUserDetails
    Scenario: The musician is shown with musician status
      Given I am logged in as the admin
      When I open the details of the musician account
      Then I see the "Expert" role and "Musician: Yes"

    @e2e @adminUserDetails
    Scenario: An unknown user id shows the not-found page
      Given I am logged in as the admin
      When I open /admin/users/00000000-0000-4000-a000-000000000000
      Then I see the "User Not Found" page with a link back to all users
