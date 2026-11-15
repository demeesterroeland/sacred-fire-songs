# Plan: role badge per role on a profile (Story 6.1.38, #534)

**Version:** 1.0 | **Date:** Nov 13, 2026

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0 | Nov 13, 2026 | First plan. |

**Goal:** `/users/<id>` shows one badge with the user's own role (admin, gatekeeper, expert, musician, member), each with its own label and icon, in every locale.

**Decisions (owner, Nov 12, 2026):** every signed-in member may see every role; the URL stays `/users/<id>`; `is_musician` stays for existing callers.

## Files

| Layer | File | Change |
| :--- | :--- | :--- |
| DB | `supabase/migrations/20261113120000_public_profiles_role.sql` | `public_profiles` appends `role`: the role for a signed-in caller, `NULL` for a guest (`auth.uid() IS NULL`). `is_musician` unchanged. Grants re-applied. |
| DB doc | `docs/design/db-schema.sql` | Same view; version bump + changelog. |
| Server | `lib/users/serverQueries.ts` | `MusicianProfileData.role: UserRole \| null`; select `role`; unknown values fall back to `member`. |
| UI | `components/profile/RoleBadge.tsx` (new) | One badge, map role → lucide icon (`Shield`, `KeyRound`, `Award`, `Music`, `UserCheck`) + label. |
| UI | `components/profile/UserProfileView.tsx` | Uses `RoleBadge` instead of the two hard-coded badges. |
| i18n | `messages/*.ts` (8) | Reuse the existing `admin.role.*` labels (already in all 8 locales); drop `user.profile.verifiedMusician` / `user.profile.member` if nothing else uses them. |
| Spec | `docs/testing/profile-role-badge.feature` | The issue's Gherkin, tagged `@unit` (badge mapping) and `@e2e`. |
| Tests | `testing/unit/tests/profile/roleBadge.test.tsx` | RTL: 5 roles → label + icon (`data-icon`), Dutch label. |
| Tests | `e2e/tests/profile-role-badge.spec.ts` | Member opens an admin's and a musician's profile: right badge, no e-mail on the page. |
| Docs | `docs/logbook/epic&user stories.md` | Story 6.1.38 row + text; version bump + changelog. |
| Docs | `application-analysis&design.md` | Profile page section: role badge; version bump + changelog. |

## Order (TDD)

1. Feature file + failing RTL test for `RoleBadge` → implement badge.
2. Migration + schema doc; check on local Supabase (no reset): a signed-in select returns `role`, a guest select returns `NULL`.
3. Server query + view wiring; failing e2e first, then green.
4. Docs, i18n check, `tsc`, lint (cap untouched), vitest, BDD unit, Playwright (`E2E_REUSE_DB=1`, port 4534).

## Verification

- Manual: dev server on 3534, open `/users/<id>` of a seeded admin, gatekeeper, expert, musician and member, in English and Dutch.
- Automated: as above. Review by a different Claude model than the author.
