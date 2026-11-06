# Sacred Fire Songs – Profile and playlist item access rules
# Version: 1.0 | Date: Nov 6, 2026
#
# Living Gherkin description of who may read profile fields and who may read
# or change playlist items.
#   @seed – Cucumber steps in testing/bdd/steps/access-policies.steps.ts running
#           as the real database roles (anon / authenticated with auth.uid())
#           against the local Supabase database (DATABASE_URL). Writes run in a
#           rolled-back transaction.
#
# Run: npm run test:bdd:seed
#
# Changelog
#   1.0 – Nov 6, 2026 – Initial catalogue.

@accessPolicies
Feature: Profile and playlist item access

  Background:
    Given a second plain member account
    And the member owns a private and a public playlist with one song each
    And the other member owns a private playlist with one song

  Rule: Profile e-mail addresses are visible to their owner and to admins only

    @seed
    Scenario: A guest cannot read any e-mail address
      Then a guest cannot select the email column of profiles
      And a guest cannot select all columns of profiles
      And a guest cannot read e-mail addresses through an embedded playlist owner

    @seed
    Scenario Outline: A signed-in <account> reads only permitted e-mail addresses
      Then the <account> account reads <own> own e-mail address
      And the <account> account reads <others> other e-mail addresses

      Examples:
        | account    | own | others |
        | member     | one | no     |
        | gatekeeper | one | no     |
        | admin      | one | all    |

    @seed
    Scenario: The admin reads every profile with all fields
      Then the admin account can read every profile and every playlist in the database

  Rule: Public profile fields are readable by everyone

    @seed
    Scenario Outline: A <reader> reads public profile fields
      Then a <reader> reads the name and avatar of the member through public_profiles
      And public_profiles has no e-mail or activity columns
      And a <reader> cannot write through public_profiles

      Examples:
        | reader |
        | guest  |
        | member |

    @seed
    Scenario: A member keeps reading and updating their own profile
      Then the member can read all fields of their own profile
      And the member can update their own name

  Rule: Playlist items are readable when the parent playlist is

    @seed
    Scenario Outline: A <reader> reading the items of the member's <visibility> playlist
      Then a <reader> <result> read the items of the member's <visibility> playlist

      Examples:
        | reader       | visibility | result |
        | guest        | public     | can    |
        | guest        | private    | cannot |
        | member       | public     | can    |
        | member       | private    | can    |
        | other member | public     | can    |
        | other member | private    | cannot |
        | gatekeeper   | public     | can    |
        | gatekeeper   | private    | cannot |
        | admin        | public     | can    |
        | admin        | private    | can    |

  Rule: Playlist items change only for the owner, admins and, on public playlists, gatekeepers

    @seed
    Scenario Outline: A <writer> trying to <action> an item on the member's <visibility> playlist
      Then a <writer> <result> <action> an item on the member's <visibility> playlist

      Examples:
        | writer       | action | visibility | result |
        | guest        | add    | public     | cannot |
        | guest        | change | public     | cannot |
        | guest        | remove | public     | cannot |
        | guest        | add    | private    | cannot |
        | guest        | change | private    | cannot |
        | guest        | remove | private    | cannot |
        | member       | add    | private    | can    |
        | member       | change | private    | can    |
        | member       | remove | private    | can    |
        | member       | add    | public     | can    |
        | member       | change | public     | can    |
        | member       | remove | public     | can    |
        | other member | add    | private    | cannot |
        | other member | change | private    | cannot |
        | other member | remove | private    | cannot |
        | other member | add    | public     | cannot |
        | other member | change | public     | cannot |
        | other member | remove | public     | cannot |
        | gatekeeper   | add    | public     | can    |
        | gatekeeper   | change | public     | can    |
        | gatekeeper   | remove | public     | can    |
        | gatekeeper   | add    | private    | cannot |
        | gatekeeper   | change | private    | cannot |
        | gatekeeper   | remove | private    | cannot |
        | admin        | add    | private    | can    |
        | admin        | change | private    | can    |
        | admin        | remove | private    | can    |
        | admin        | add    | public     | can    |
        | admin        | change | public     | can    |
        | admin        | remove | public     | can    |

    @seed
    Scenario Outline: A <writer> moving an item stays within playlists they may edit
      Then a <writer> <result> move <source> item to <target> playlist

      Examples:
        | writer       | source                  | target                  | result |
        | member       | the member's private    | the member's public     | can    |
        | member       | the member's private    | the other member's      | cannot |
        | other member | the other member's      | the member's private    | cannot |
        | other member | the member's private    | the other member's      | cannot |
        | gatekeeper   | the member's public     | the member's private    | cannot |
        | admin        | the member's private    | the other member's      | can    |
