# Sacred Fire Songs – Profile and playlist item access rules
# Version: 1.2 | Date: Nov 10, 2026
#
# Living Gherkin description of who may read profile fields, who may read or
# change playlist items, and who may write profile fields, categories, playlists
# and song versions.
#   @seed – Cucumber steps in testing/bdd/steps/access-policies.steps.ts running
#           as the real database roles (anon / authenticated with auth.uid())
#           against the local Supabase database (DATABASE_URL). Writes run in a
#           rolled-back transaction.
#
# Run: npm run test:bdd:seed
#
# Changelog
#   1.0 – Nov 6, 2026 – Initial catalogue.
#   1.1 – Nov 6, 2026 – Protected profile fields, category, playlist ownership
#         and song version write rules.
#   1.2 – Nov 10, 2026 – public_profiles carries the musician badge; user
#         search and singer attribution never reveal e-mail addresses.

@accessPolicies
Feature: Profile and playlist item access

  Background:
    Given a second plain member account
    And the member owns a private and a public playlist with one song each
    And the other member owns a private playlist with one song
    And the member and the other member each own a public song with one version

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

  Rule: Sharing and singer attribution never reveal e-mail addresses

    @seed
    Scenario: The member finds another member by name without an address
      Then the member's user search for "Other Mem" finds the other member
      And the user search returns no e-mail column

    @seed
    Scenario: Only a complete address finds a member
      Then the member's user search for part of the other member's address finds nobody
      And the member's user search for the other member's full address finds the other member

    @seed
    Scenario: A guest cannot search users
      Then a guest is refused the user search

    @seed
    Scenario Outline: Only the owner reads the address of an unregistered singer
      Given the member's take credits an unregistered singer with an address
      Then a <reader> cannot select the singer e-mail column of takes
      And the <reader> reads <result> singer address through the owner lookup

      Examples:
        | reader       | result |
        | guest        | no     |
        | other member | no     |
        | member       | the    |

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

  Rule: Role and e-mail change only through an admin or a trusted server context

    @seed
    Scenario Outline: A <account> cannot change their own <field>
      Then the <account> account is refused changing their own <field>

      Examples:
        | account    | field |
        | member     | role  |
        | member     | email |
        | gatekeeper | role  |
        | gatekeeper | email |
        | admin      | email |

    @seed
    Scenario: A member cannot create or overwrite profile rows
      Then the member is refused inserting a second profile row
      And the member is refused upserting their own profile with another role
      And the member cannot change the role of another account
      And a guest is refused changing any profile

    @seed
    Scenario: A member keeps updating their own editable fields
      Then the member can update their own name, avatar and last seen time

    @seed
    Scenario: An admin changes the role of another account
      Then the admin can change the role of the other member
      And the gatekeeper cannot change the role of the other member

    @seed
    Scenario: The service role changes role and e-mail
      Then the service role can change the role and e-mail of the other member

    @seed
    Scenario: A new registration always gets the default role
      When a new auth user registers asking for the admin role in their metadata
      Then the new profile has the member role and the registered e-mail

  Rule: Categories change only through admins, except for artist sub-categories of a song

    @seed
    Scenario Outline: A <account> adding an artist sub-category
      Then a <account> <result> add an artist sub-category

      Examples:
        | account    | result |
        | guest      | cannot |
        | member     | can    |
        | gatekeeper | can    |
        | admin      | can    |

    @seed
    Scenario: A member can create the Artists parent when it does not exist yet
      Given the Artists parent category does not exist
      Then a member can add the Artists parent category

    @seed
    Scenario Outline: A <account> adding any other category
      Then a <account> <result> add a category outside the artists group

      Examples:
        | account    | result |
        | guest      | cannot |
        | member     | cannot |
        | gatekeeper | cannot |
        | admin      | can    |

    @seed
    Scenario Outline: A <account> trying to <action> an existing category
      Then a <account> <result> <action> an existing category

      Examples:
        | account    | action | result |
        | member     | rename | cannot |
        | member     | delete | cannot |
        | gatekeeper | rename | cannot |
        | gatekeeper | delete | cannot |
        | admin      | rename | can    |
        | admin      | delete | can    |

  Rule: Nobody hands a playlist to another owner

    @seed
    Scenario Outline: A <account> cannot change the owner of a playlist
      Then a <account> is refused changing the owner of the member's <visibility> playlist

      Examples:
        | account    | visibility |
        | member     | private    |
        | member     | public     |
        | gatekeeper | public     |
        | admin      | public     |
        | admin      | private    |

    @seed
    Scenario: An upsert cannot change the owner of a playlist
      Then a gatekeeper is refused upserting the member's public playlist with another owner

    @seed
    Scenario Outline: A <account> keeps editing playlist details
      Then a <account> <result> rename the member's <visibility> playlist

      Examples:
        | account      | visibility | result |
        | member       | private    | can    |
        | member       | public     | can    |
        | gatekeeper   | public     | can    |
        | gatekeeper   | private    | cannot |
        | other member | public     | cannot |

    @seed
    Scenario: An owner keeps publishing their own playlist
      Then the member can publish their own private playlist

  Rule: Versions are added only to songs the caller may manage and stay on their song

    @seed
    Scenario Outline: A <account> adding a version to <song> song
      Then a <account> <result> add a version to <song> song

      Examples:
        | account      | song               | result |
        | guest        | the member's       | cannot |
        | member       | the member's       | can    |
        | member       | the other member's | cannot |
        | other member | the member's       | cannot |
        | gatekeeper   | the member's       | cannot |
        | admin        | the member's       | can    |

    @seed
    Scenario: A member cannot add a version in another contributor's name
      Then the member is refused adding a version to their song as the other member

    @seed
    Scenario Outline: A <account> cannot move a version to another song
      Then a <account> is refused moving the member's version to <target> song

      Examples:
        | account | target             |
        | member  | the other member's |
        | admin   | the other member's |

    @seed
    Scenario: A contributor cannot move their version to a song of their own
      Then the member is refused moving the other member's version they contributed to their own song

    @seed
    Scenario Outline: A <account> keeps editing version content
      Then a <account> <result> edit the content of the member's version

      Examples:
        | account      | result |
        | member       | can    |
        | admin        | can    |
        | other member | cannot |
