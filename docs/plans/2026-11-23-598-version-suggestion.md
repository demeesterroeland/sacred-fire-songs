# Plan: suggest a song as a version of another song (Story 6.2.26, #598)

**Version:** 2.1 | **Date:** Nov 24, 2026 | **Status:** BUILT (PR into `develop`, #598) after the owner's answers of Nov 24, 2026 (see "Owner answers"). Where the text below still says "gatekeeper only where they own both songs" or "private songs", the owner answers win.

| Version | Date | Change |
| :--- | :--- | :--- |
| 2.1 | Nov 24, 2026 | Owner decision on PR #658 (while the "change proposals" story was discussed): **gatekeepers suggest too**, on songs they cannot link directly (not when they own both songs; never an admin). A reviewer never decides their own suggestion: a gatekeeper's suggestion is decided by another gatekeeper or an admin, and it is not counted in their badge. Supersedes the reading of answer 4 in 2.0. |
| 2.0 | Nov 24, 2026 | Owner answers to the 12 questions applied. **Changed vs the plan: a gatekeeper reviews and acts on EVERY suggestion, also on songs they own neither, like an admin** (answer 3); gatekeepers and admins review instead of suggesting (answer 4); public songs only (answer 5); the split (answer 1) created #655 and #656. Sections 3.3, 3.4, 3.5, 4.1, 4.2 and 7 corrected below; built as `supabase/migrations/20261124150000_song_link_suggestions.sql`. |
| 1.1 | Nov 23, 2026 | Review round (Claude Opus): grants of the core and helper functions, reopen re-checks, lock order, swap and direct-link notification rules, advisory lock for the cap, trigger privileges, hint visibility, section number §6.22, question 5 reasoning. Mockup: 44 px targets, Segmented pattern, more screens. |
| 1.0 | Nov 23, 2026 | First plan: data model, row-level security, queue UX, notifications, audit, Gherkin, test and build order, open questions. Mockup: `docs/design/screens/v2/screen26_suggest_version_link.html`. |

**Goal:** a member who spots a duplicate suggests "this song is a version of that song". A gatekeeper or admin looks at it, sees what a link would move, and either links (the existing `fn_link_song_as_version`) or declines. The member never changes anything irreversible.

**Decided already (owner, Nov 13, 2026, option A):** members suggest, gatekeepers and admins confirm. The merge itself stays in `fn_link_song_as_version` with its role checks (admin any song; gatekeeper only songs they own, source and target). Members linking directly (options B/C) and undo of a link are out of scope.

## 0. Owner answers (issue #598, Nov 24, 2026) and how they were built

| # | Answer | Built as |
| :--- | :--- | :--- |
| 1 | Split #598 | New sub-issues of #499: #655 "contributors keep editing their own version", #656 "unlink my version". Not built here. |
| 2 | Delete `feat/ux-v3` after the sign-off | Left alone; the owner deletes it. |
| 3 | **A gatekeeper reviews and acts on every suggestion**, also on songs they own neither, like an admin. Accepting through the suggestion flow is allowed for gatekeepers and admins, though a direct link (#512) still needs ownership. | `fn_assert_can_review_link` (no ownership rule) is used by the accept and preview functions; the policy "Reviewers read every link suggestion" lets both roles read all rows; the badge counts all open rows for both. `fn_can_review_link_suggestion` of section 3.3 is not needed and was not built. |
| 4 | Everyone signed in who cannot link the pair directly may suggest, never an admin. | Built as written, after the owner confirmed on PR #658: **gatekeepers suggest on songs they cannot link directly**; an admin, and a gatekeeper who owns both songs, are refused with "You can link or review these songs yourself" (the menu hides the item). A reviewer never decides their own suggestion ("You cannot decide your own suggestion"), so a gatekeeper's suggestion needs another gatekeeper or an admin; the badge does not count it. |
| 5 | Public songs only in v1 | Both songs must be public; two private songs: "Only public songs can be suggested"; one of each: "Both songs must be public, or both private". Accept and reopen check it again. |
| 6 | Pair rules as written | Unique index on `LEAST/GREATEST` of the pair where `status = 'open'`; "Declined before" hint. |
| 7 | Reviewer chooses which song stays | `p_swap` on accept and preview; the "Keep … instead" switch. |
| 8 | Withdraw, admin Reopen, `withdrawn` and `superseded` | Built. |
| 9 | Count badge on the user menu, in-app only, no bell row per reviewer; the member gets a bell item | Built (`useOpenSuggestionCount`, `link_suggestion_accepted` / `link_suggestion_declined`). |
| 10 | Max 10 open per member; note and reason at most 280 characters | Built (advisory lock for the cap; `CHECK` and function checks for the length). |
| 11 | Queue at `/suggestions` from the user menu | Built. |
| 12 | Decline reason: optional free text | Built. |

Follow-up, not built: #650 (show similar songs while adding a song).

## 1. Branch target (checked)

- **Base: `develop`.** UX v3 reached `develop` through #585 (Nov 13, 2026); #498 says so ("UX v3 reached `develop` via #585"), and its "Remaining" list is only #598 plus the owner's preview sign-off.
- No open PR targets `feat/ux-v3` (`gh pr list --base feat/ux-v3` is empty). The last ten PRs, open and merged, all target `develop`. #598 and #499 name no integration branch.
- The remote branch `feat/ux-v3` still exists but is 34 commits behind `develop`. #498's "Non-negotiables" still say "G1–G5 branch from `origin/feat/ux-v3`": that text is historical. `AGENTS.md` and `pr-policy` (work branch → `develop`) apply.
- So: branch `feat/598-version-suggestion` from `origin/develop`, PRs into `develop`. (Open question 2 asks whether the owner wants `feat/ux-v3` deleted.)

## 2. Scope: what this plan covers and what it leaves out

The issue body bundles three stories (the owner's Nov 14 comment already suggests splitting):

| Part | In this plan? |
| :--- | :--- |
| **A.** Suggest + review queue + notifications (the original 6.2.26) | **Yes.** |
| **B.** "Contributors keep editing their own version after a link" (Addition 1: `canEditVersion`, guards, redirect `version_id`, My Songs) | **No.** Separate story. |
| **C.** "Unlink my version" (Addition 2: `fn_unlink_song_version`, `related_songs`) | **No.** Separate story. |

Hooks kept open for B and C, nothing built: the review row and the link preview have room for a one-line note (for example "the contributor made this version its own song on <date>", Addition 2); the suggestion dialog shows the line "Contributors keep editing their own version" only after B ships. Open question 1 asks to confirm the split.

## 3. Data model

### 3.1 New table `song_link_suggestions`

Migration: `supabase/migrations/20261123120000_song_link_suggestions.sql` (safe to run twice, like the other migrations).

```sql
CREATE TABLE IF NOT EXISTS public.song_link_suggestions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     uuid REFERENCES public.compositions(id) ON DELETE SET NULL,  -- the duplicate
  target_id     uuid REFERENCES public.compositions(id) ON DELETE SET NULL,  -- the song that stays
  source_title  text NOT NULL,   -- snapshots: the source is deleted when the suggestion is accepted
  target_title  text NOT NULL,
  is_public     boolean NOT NULL, -- visibility of both songs when suggested
  suggested_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note          text CHECK (note IS NULL OR char_length(note) <= 280),
  status        text NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'accepted', 'declined', 'withdrawn', 'superseded')),
  decision_note text CHECK (decision_note IS NULL OR char_length(decision_note) <= 280),
  reviewed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  reopened_at   timestamptz,   -- set when an admin reopens a declined row; reviewed_* keep the last decision
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT song_link_suggestions_open_has_songs CHECK (status <> 'open' OR (source_id IS NOT NULL AND target_id IS NOT NULL)),
  CONSTRAINT song_link_suggestions_not_self CHECK (source_id <> target_id),
  CONSTRAINT song_link_suggestions_decided CHECK (status NOT IN ('accepted', 'declined') OR reviewed_at IS NOT NULL)
);
-- One open suggestion per pair of songs, in either direction (open question 6).
CREATE UNIQUE INDEX IF NOT EXISTS uq_song_link_suggestions_open_pair
  ON public.song_link_suggestions (LEAST(source_id, target_id), GREATEST(source_id, target_id)) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_song_link_suggestions_queue ON public.song_link_suggestions (status, created_at);
CREATE INDEX IF NOT EXISTS idx_song_link_suggestions_member ON public.song_link_suggestions (suggested_by, created_at DESC);
```

Status meaning: `open` waiting; `accepted` the songs were linked from this suggestion; `declined` a reviewer said no; `withdrawn` the member took it back; `superseded` closed by the system because a link or a song delete made it moot (nobody decided). The issue names three statuses; `withdrawn` and `superseded` are the honest names for the two other ways a suggestion ends (open questions 8 and 6).

Rows are history: they are never deleted by the app. `ON DELETE SET NULL` on the song columns keeps the row (and its title snapshots) after the source song is deleted by an accepted link; the check `open_has_songs` makes sure only closed rows lose their song ids.

### 3.2 Audit link

`ALTER TABLE public.song_link_audit ADD COLUMN IF NOT EXISTS suggestion_id uuid REFERENCES public.song_link_suggestions(id) ON DELETE SET NULL;` The audit entry of an accepted suggestion points at it, and the suggestion carries the suggester, note, reviewer and times. (Addition 2 of the issue plans a second audit column `action`; it can add itself later.)

### 3.3 Functions (all `SECURITY DEFINER`, `SET search_path = ''`, `authenticated` only, like #512)

| Function | Who | What |
| :--- | :--- | :--- |
| `fn_suggest_song_link(p_source, p_target, p_note)` | signed in, **not able to link these songs directly** (a member, musician, expert; a gatekeeper unless they own both songs; never an admin) | Guard rails of section 3.5, then insert. Returns `{ id }`. |
| `fn_withdraw_song_link_suggestion(p_id)` | the suggester, while `open` | status `withdrawn`. |
| `fn_decline_song_link_suggestion(p_id, p_reason)` | reviewer (3.4) | status `declined`, `reviewed_by/at`, optional reason; notifies the suggester. |
| `fn_accept_song_link_suggestion(p_id, p_swap default false)` | reviewer (3.4) | Locks the suggestion, requires `open`, calls the link core (3.6), sets `accepted`, notifies the suggester. Returns the link summary (same shape as `fn_preview_song_link`). |
| `fn_reopen_song_link_suggestion(p_id)` | admin, only `declined` | Back to `open` (a decline is reversible, a link is not), **after re-running guard rails 2–5 of 3.5 on the stored ids**: the songs may have been linked or deleted since, and a refusal must read like the others ("already linked", "Song not found", "This suggestion already exists"), never a raw `23514` / `23505`. `reviewed_by`, `reviewed_at` and `decision_note` keep the last decision (the row still shows "Declined before"); `reopened_at` is set. |
| `fn_open_song_link_suggestion_count()` | signed in | Number of open suggestions the caller may review: the badge. `0` for everyone else. |
| ~~`fn_can_review_link_suggestion`~~ | not built (owner answer 3) | Replaced by `fn_assert_can_review_link(p_source, p_target)` (internal, no API grant): admin or gatekeeper, no ownership rule, public songs of the same visibility. The policy reads the caller's role directly, like `song_link_audit`. |
| `fn_preview_song_link_suggestion(p_id, p_swap)` | reviewer | The same summary as `fn_preview_song_link`, for a suggestion, without changing anything. |

Errors reuse the #512 vocabulary so `songLinkError()` and the translated messages carry over: `42501` forbidden, `P0002` not found, `22023` self / already linked / "Both songs must be public, or both private", plus new `23505` "This suggestion already exists", `22023` "Too many open suggestions" and `22023` "This suggestion was already decided".

### 3.4 Row-level security

`ENABLE ROW LEVEL SECURITY`; `REVOKE INSERT, UPDATE, DELETE, TRUNCATE ... FROM anon, authenticated`; `REVOKE ALL ... FROM anon`; `GRANT SELECT TO authenticated`. Every write goes through the functions above (the guard rails need to read songs the caller may not read, follow redirects and lock rows, which a plain INSERT policy cannot do; the issue's "no direct UPDATE/DELETE by members" holds, and so does "no direct INSERT").

| Who | Can read | Can do |
| :--- | :--- | :--- |
| Guest | nothing | nothing |
| Member / musician / expert | their own suggestions (`suggested_by = auth.uid()`), any status | suggest, withdraw their own open one |
| Gatekeeper | **every** suggestion, any status (owner answer 3) | accept / decline every open suggestion (not suggest, answer 4) |
| Admin | all | accept, decline, reopen a declined one |

Policies: `Members read their own link suggestions`, `Reviewers read every link suggestion` (admin or gatekeeper → all rows).

### 3.5 Guard rails on create (`fn_suggest_song_link`)

In this order, each with its own message:

1. Signed in, not an admin, and not a gatekeeper who owns both songs ("You can link or review these songs yourself"). `42501`.
2. Both ids present; the target follows `composition_redirects` (a target that was itself linked earlier stands for the song it lives in), like `fn_assert_can_link_song`.
3. Not the same song (`22023`); the source is not already linked away (`22023`, "already linked"); both songs exist and are **readable by the caller** (`is_public` or `owner_id = auth.uid()`), otherwise `P0002` "Song not found" (no hint that a private song exists).
4. Same visibility: "Both songs must be public, or both private" (`22023`). Whether both-private is allowed at all is open question 5.
5. No open suggestion for the pair, either direction: `23505` "This suggestion already exists".
6. At most 10 open suggestions per member (open question 10), counted under `pg_advisory_xact_lock(hashtext(auth.uid()::text))` so two parallel sends cannot both pass.
7. Note trimmed, empty becomes `NULL`, at most 280 characters. Shown as plain text everywhere, never as markup.

### 3.6 How a merge moves `song_versions` between `compositions`

A suggestion moves nothing. Accepting calls the existing merge, which in one transaction (both songs locked in id order):

1. `UPDATE song_versions SET composition_id = <target>` for the source's versions; an `original` becomes a `variant` so the target's original stays first; a `catalog_source_id` the target already has is cleared on the moved version.
2. Recordings and playlist items point at versions, so they follow without changes. Categories, views and translations are merged, favourites are re-pointed to the target's first version (a member who favourited both keeps one), the target's aliases gain the source title, the source row is deleted, `composition_redirects` sends the old id to the target, `song_link_audit` records the link.

What this story adds around the merge, inside the same transaction:

- **Grants:** `fn_link_song_as_version_core` is `REVOKE ALL ... FROM PUBLIC, anon, authenticated, service_role` (only the two public functions call it); otherwise any signed-in caller could pass a suggestion id and mark it accepted. The core keeps calling `fn_assert_can_link_song` (before and after the locks) for every caller.
- The link body becomes a **core** function `fn_link_song_as_version_core(p_source, p_target, p_suggestion uuid)`; `fn_link_song_as_version(p_source, p_target)` stays with the same signature, checks and grants and calls the core with `NULL`. `fn_accept_song_link_suggestion` calls the core with the suggestion id (and the swapped pair when `p_swap`). The existing tests (`schemaSongLink.test.ts`, `ux-v3-link-song-version.feature`) stay green: this is a move of the body, not a change of it.
- **Before the source row is deleted**, the core handles every other open suggestion that touches the source:
  - the suggestion being accepted → `accepted`, `reviewed_by = auth.uid()`, `reviewed_at = now()`, and `song_link_audit.suggestion_id` set;
  - open suggestions that **point at** the source (`target_id = source`) are **re-pointed** to the song that stays (`target_id = v_target`, title snapshot updated), unless that would make a self-link or duplicate an open pair; then they become `superseded`;
  - open suggestions that start **from** the source (other targets) become `superseded` (the song is gone; the work is done by the link).
  This also runs for a direct link by an admin or gatekeeper with no suggestion, so no open suggestion ever points at a deleted song (the issue's last scenario).
- A `BEFORE DELETE` trigger on `compositions` closes (`superseded`) open suggestions of any song deleted another way (the owner deletes it), so the `open_has_songs` check cannot fail a delete. The trigger function is `SECURITY DEFINER` with `search_path = ''` (owners have no UPDATE grant on the table). Order is safe: the BEFORE trigger flips the status before the `ON DELETE SET NULL` action runs after the row is gone.
- **A direct link of the exact suggested pair** (either direction, no suggestion id passed) closes that suggestion as `accepted` too, sets `song_link_audit.suggestion_id`, and notifies the suggester, so the member is not told nothing.
- **Lock order** (no deadlock with a direct link, which locks `compositions` first): accept reads the suggestion without a lock, lets the core lock the songs, then `SELECT ... FOR UPDATE` the suggestion and re-checks it is `open`. Withdraw and decline use `UPDATE ... WHERE status = 'open'` and check the row count.
- Owner answer 3: accepting a suggestion does **not** need ownership, for gatekeepers too (`fn_assert_can_review_link`); a direct link keeps the ownership rule. Same visibility and public-only still apply.

### 3.7 Types, helpers

- `lib/songs/linkSuggestion.ts` (pure): `canSuggestLink(user, ownerId)` = signed in and not `canLinkSong(user, ownerId)`; status and error mapping (`songLinkError` extended); list-row view model; `canReviewSuggestion(user, suggestion, ownership)` for UI hints (the database stays the authority).
- `app/actions/linkSuggestion.ts`: server actions `suggestSongLink`, `withdrawSuggestion`, `declineSuggestion`, `acceptSuggestion`, `reopenSuggestion`, `searchSongsToSuggest`, `listSuggestions`, `openSuggestionCount`. They validate input (`uuid`, note length), call the functions with the caller's session, and map refusals to translatable reasons, like `app/actions/linkSong.ts`.
- `lib/notifications/queries.ts`: `NotificationType` gains two members (see 5).

## 4. UX

Mockup: `docs/design/screens/v2/screen26_suggest_version_link.html` (suggest sheet, review queue, review sheet with preview, member's own list, bell). Sober greys, one accent, flat rows, 44 px targets, no colour-only status (`docs/design/design-tokens.md`). Existing patterns reused: the ⋮ song menu (`SongMenuSheet`), the bottom sheet and the two-step pick → preview flow of `LinkSongSheet`.

### 4.1 Suggest (member)

- ⋮ menu of a song: **Suggest as a version of…** shown when `canSuggestLink` (everyone signed in who cannot link directly). Next to it, for admins and gatekeepers on their own songs, the existing **Link as a version of…** stays. A member never sees the direct item.
- Sheet step 1 "pick": search field (same debounce and 2-character minimum as `LinkSongSheet`), results show title, author and version count so look-alikes ("Pipe song 58" vs "65") can be told apart; each result has **Open song** (new tab) to compare lyrics. Results are only songs the member can read with the same visibility; the song itself is left out.
- Step 2 "confirm": "*Siento la medica* is a version of *Siento la medicina*", an optional note field (280 characters, counter), a plain explanation ("Nothing changes now. A gatekeeper or admin looks at it and decides. You get a message either way."), primary button **Send suggestion**, secondary **Back**.
- After sending: the sheet closes and a toast says "Suggestion sent". A pair the member already suggested shows **Suggested** (disabled) in the pick results of step 1 (the menu belongs to one song, so it cannot carry a per-pair state); the server still refuses a duplicate.
- Refusals show as inline text with the translated reason ("This suggestion already exists", "Both songs must be public, or both private", "Too many open suggestions").

### 4.2 Review queue (gatekeeper / admin)

- **Where:** a page `/suggestions` (open question 11). Entry in the user menu: **Link suggestions**, with the count of open suggestions the person may review as a badge (a number, not only a dot). It is not in the admin portal (admin-only; gatekeepers have no access there) and not a Library tab (keeps the three-item bottom bar and the Library tabs calm).
- **Reviewers (gatekeepers and admins, every suggestion) see three segments:** *To review (n)* and *Reviewed*. Flat rows, newest first. A row: `Siento la medica → Siento la medicina`, below it in muted text: suggester name, relative date, note (quoted, 2 lines, expandable), plus quiet hints when they apply: "Declined before on <date>" (same pair), "Also suggested: <other target>" (same source). Hints are built only from rows the caller may read (RLS), so a gatekeeper never learns a title from a suggestion hidden from them.
- **Review sheet** (tap a row): the existing link preview (`fn_preview_song_link`: versions, recordings, playlist entries, favourites, catalog keys, aliases) in the same wording as the link sheet, two **Open song** links, the suggester's note, and a **Keep <source> instead** toggle (swap direction, open question 7). Buttons: primary **Link** (an irreversible-action confirm line: "There is no undo."), secondary **Decline…** which asks for an optional reason (280 characters) and then declines.
- After Link or Decline the row leaves *To review*; focus moves to the next row (as in the catalog-edits screen); a toast says what happened.
- **Empty state:** "Nothing to review." plus "New suggestions from members show up here." (owner answer 3: gatekeepers see every suggestion, so no gatekeeper-only line).
- *Reviewed* lists accepted, declined and superseded rows with the reviewer and date; an admin sees **Reopen** on declined ones.

### 4.3 Member's own list

The same page for everyone signed in without review rights shows **My suggestions** (open · linked · declined · withdrawn), each with the status as a text label, the reviewer's decline reason when given, and **Withdraw** on open ones. Reviewers get a third segment *Mine* for their own suggestions (a gatekeeper can suggest).

### 4.4 States and a11y

Loading skeleton rows; error row with retry; every status is a word plus icon; sheet focus trap and `Esc` as in the existing bottom sheet; all copy through `t(...)`.

## 5. Notifications

- **Member:** a bell notification when their suggestion is linked or declined. Types `link_suggestion_accepted` / `link_suggestion_declined` (the `notifications.type` check is widened; today only `recording_shared`). Rows are written by the decide functions (`SECURITY DEFINER`, like the share trigger). `composition_id` = the song that **stays after the link** (the core's `v_target`, which is the suggestion's source when `p_swap` is set) for accepted, the source for declined, so tapping opens a song that exists; the titles live in `metadata` too, because `notifications.composition_id` is `ON DELETE CASCADE` and the row disappears if that song is deleted later (accepted, and the plan lives with it); `metadata` carries `source_title`, `target_title`, `reviewer_name`, `reason`. Copy: "*Siento la medica* was linked as a version of *Siento la medicina*." / "Your suggestion for *Pipe song 58* was declined: <reason>."
- **Reviewers:** no row per reviewer (every admin would get a row for every suggestion). The signal is the **count badge** on the user-menu entry (`fn_open_song_link_suggestion_count`), refreshed with the existing user query and after each decide action. If the owner prefers bell items, a single "N suggestions to review" digest item is the alternative (open question 9).
- No e-mail in this story.

## 6. Undo and audit

- **Link: no undo** (§6.19 "Confirm, not undo", owner decision). Safety nets: the review sheet shows the preview first; only reviewers decide; swap direction before confirming.
- **Decline: reversible.** An admin can *Reopen* a declined suggestion. A reopened suggestion keeps its original suggester and note and the last decision (shown as "Declined before"); it is refused when the songs were linked or deleted meanwhile.
- **Withdraw:** the member can take back an open suggestion.
- **Audit trail:** every suggestion row keeps suggester, note, status, reviewer, decision note and times (never deleted by the app). `song_link_audit.suggestion_id` ties the irreversible link to the suggestion that caused it. Admins and gatekeepers already read `song_link_audit`.
- Contributor-side repair (unlink) is story C.

## 7. Gherkin scenarios

Executable spec: `docs/testing/ux-v3-suggest-song-link.feature` (to be written test-first; `@unit` on the pure helpers, `@seed` as the real roles on local Supabase in rolled-back transactions, `@e2e` documented against one Playwright spec). The issue's eight scenarios stay as written (member suggests, cannot link directly, no duplicate, public/private refused, admin accepts, admin declines, gatekeeper sees only own, suggestions on a linked song are closed). Added by this plan:

```gherkin
Feature: Members suggest linking a song as a version of another song (additions)

  Background:
    Given the public songs "Siento la medicina" and "Siento la medica"

  @seed
  Scenario: A guest cannot suggest
    Given I am a guest
    When I try to suggest "Siento la medica" as a version of "Siento la medicina"
    Then it is refused and nothing is saved

  @seed
  Scenario: A member cannot read or write other members' suggestions
    Given member Anna has an open suggestion
    And I am signed in as another member
    Then I do not see Anna's suggestion
    And a direct update or delete of the suggestions table is refused

  @seed
  Scenario: A member cannot suggest a song they cannot read
    Given a private song of another member
    When I suggest "Siento la medica" as a version of that song
    Then it is refused with "Song not found"

  @seed
  Scenario: An admin links directly instead of suggesting
    Given I am signed in as an admin
    Then the song menu offers "Link as a version of…" and not "Suggest as a version of…"
    And a direct call to fn_suggest_song_link is refused

  @seed
  Scenario: A gatekeeper suggests a link for songs they do not own
    Given I am signed in as a gatekeeper who owns neither song
    When I suggest "Siento la medica" as a version of "Siento la medicina"
    Then an open suggestion is saved with me as the suggester

  @seed
  Scenario: The reverse suggestion is not stored twice
    Given an open suggestion "Siento la medica" → "Siento la medicina"
    When a member suggests "Siento la medicina" → "Siento la medica"
    Then no second open suggestion is created

  @seed
  Scenario: A member has at most ten open suggestions
    Given I have ten open suggestions
    When I suggest another pair
    Then it is refused with "Too many open suggestions"

  @seed
  Scenario: A member withdraws their suggestion
    Given an open suggestion of mine
    When I withdraw it
    Then its status is "withdrawn" and both songs are unchanged

  @seed
  Scenario: A decided suggestion cannot be decided twice
    Given an accepted suggestion
    When another admin declines it
    Then it is refused with "This suggestion was already decided"

  @seed
  Scenario: A decline carries an optional reason to the member
    Given an open suggestion "Pipe song 58" → "Pipe song 65" by a member
    When an admin declines it with the reason "Different songs"
    Then the member's notification says it was declined and shows "Different songs"

  @seed
  Scenario: An admin reopens a declined suggestion
    Given a declined suggestion
    When an admin reopens it
    Then it is open again with the same suggester and note

  @seed
  Scenario: Accepting records the suggestion on the audit entry
    Given an open suggestion by a member
    When an admin links the songs from it
    Then the link audit entry points at the suggestion
    And the suggestion keeps both titles after the source song is deleted

  @seed
  Scenario: A direct link also closes open suggestions
    Given an open suggestion "Siente la medicina nai" → "Siento la medica"
    When an admin links "Siento la medica" directly into "Siento la medicina"
    Then the suggestion now points at "Siento la medicina"

  @seed
  Scenario: A suggestion that would become a self-link is superseded
    Given open suggestions "Siento la medica" → "Siento la medicina" and "Siento la medicina" → "Siento la medica"
    When an admin links "Siento la medica" into "Siento la medicina" directly
    Then neither suggestion is open

  @seed
  Scenario: Deleting a song closes its open suggestions
    Given an open suggestion about "Siento la medica"
    When its owner deletes "Siento la medica"
    Then the suggestion is "superseded" and the delete succeeds

  @seed
  Scenario: An admin accepts with the direction swapped
    Given an open suggestion "Siento la medica" → "Siento la medicina"
    When an admin links it with "Siento la medica" kept
    Then "Siento la medica" has the versions of both songs
    And the old link of "Siento la medicina" opens "Siento la medica"

  @unit
  Scenario Outline: Who sees which menu item
    Given I am signed in as a <role> and <owner> the song
    Then the song menu offers <item>
    Examples:
      | role       | owner | item                          |
      | member     | not   | "Suggest as a version of…"   |
      | expert     | not   | "Suggest as a version of…"   |
      | gatekeeper | not   | "Suggest as a version of…"   |
      | gatekeeper | owns  | "Link as a version of…"      |
      | admin      | not   | "Link as a version of…"      |

  @e2e
  Scenario: The review badge counts only what I may act on
    Given three open suggestions, one on songs a gatekeeper owns
    Then the admin's menu badge shows 3 and the gatekeeper's shows 1

  @e2e
  Scenario: The reviewer is told what moves before linking
    Given an open suggestion
    When an admin opens it
    Then the sheet lists versions, recordings, playlist entries and favourites
    And says there is no undo
```

## 8. Test plan (testing pyramid, TDD)

| Layer | What | Where |
| :--- | :--- | :--- |
| L1 | `npx tsc --noEmit`, `npm run lint` (warning cap unchanged) | CI |
| L2 | `canSuggestLink`, error mapping, row view model, i18n key presence in 8 locales | `testing/unit/tests/songs/linkSuggestion*.test.ts` |
| L2 | Migration contract (function names, grants, `SECURITY DEFINER`, `search_path`, RLS enabled, no write grants, table in `db-schema.sql`) | `testing/unit/tests/schemaSongLinkSuggestions.test.ts` |
| L3 | Suggest sheet (pick → confirm → sent, refusal text), queue row and review sheet with RTL | `testing/unit/tests/songs/SuggestSongSheet.test.tsx`, `SuggestionQueue.test.tsx` |
| L4 | `@seed`: the scenarios above as the real database roles in rolled-back transactions (no `supabase db reset`) | `testing/bdd/steps/ux-v3-suggest-song-link.steps.ts` |
| L5 | One Playwright spec: member suggests, admin accepts, member sees the notification. **CI only; not run locally.** | `e2e/tests/suggest-song-link.spec.ts` |

TDD order: feature file and failing helpers test → helpers → failing schema contract + `@seed` scenarios → migration → failing component tests → UI → i18n (8 locales) → docs.

## 9. Files (when built)

| Layer | File | Change |
| :--- | :--- | :--- |
| DB | `supabase/migrations/20261123120000_song_link_suggestions.sql` | table, indexes, RLS, functions, link core refactor, delete trigger, notification types, `song_link_audit.suggestion_id` |
| DB doc | `docs/design/db-schema.sql` | same, valid as a fresh install; version bump + changelog |
| Server | `app/actions/linkSuggestion.ts`, `lib/songs/linkSuggestion.ts`, `lib/songs/linkSong.ts` | actions and helpers; error map extended |
| UI | `components/song/SuggestSongSheet.tsx`, `app/suggestions/page.tsx`, `components/suggestions/*`, `components/song/SongMenuSheet.tsx`, `app/songs/[id]/page.tsx`, `components/common/navigation/UserProfile.tsx`, `NotificationBell.tsx` | menu item, sheet, queue page, badge, notification rows |
| i18n | `messages/{en,nl,es,it,ru,qu,fr,pt}.ts` | all new copy in all 8 locales |
| Spec/tests | see section 8 | |
| Docs | `docs/design/application-analysis&design.md` (§5.1, §5.2, new §6.22 "Suggest a version link" (§6.21 is Songbook pages), §6.19 cross-link), `docs/logbook/epic&user stories.md` (row 6.2.26), `docs/design/screens/v2/screen26_suggest_version_link.html` | version bump, today's date, changelog entry |

Definition of Done: code, tests and docs aligned; acceptance criteria of #598 part A checked; mockup compared with the built screens; cross-review by Claude Opus (author Sonnet).

## 10. Open questions for the owner

The numbered list below is the same as in the PR description. Each has a recommended default; the build starts only after answers.

1. **Split #598?** Part A (this plan) as the story; "Contributors keep editing their own version" and "Unlink my version" as two new sub-issues of #499. *Recommended: split*, as your Nov 14 comment suggests.
2. **Integration branch:** work goes to `develop` (checked in section 1). Should `feat/ux-v3` be deleted now that #585 promoted it? *Recommended: delete after the preview sign-off.*
3. **Gatekeeper scope:** a gatekeeper reviews only suggestions where they own both songs (the #512 rule). Imported songs are usually owned by an admin and member songs by members, so a gatekeeper's queue will often be empty and admins do the work. Keep it, or let a gatekeeper act when they own the target? *Recommended: keep for now; revisit with real numbers.*
4. **Who may suggest:** every signed-in person who cannot link the pair directly, so also a gatekeeper on songs they do not own; never an admin. *Recommended: yes.*
5. **Private songs:** allow both-private suggestions (as the issue's guard rail implies), where a reviewer (admin, or a gatekeeper who owns both) opens a member's private songs, or allow public songs only in v1? A member can only read their own private songs, so nothing new is exposed to other members; the reviewers who would see them are admins (who read all songs today) and a gatekeeper who owns both. The question is whether a draft should reach a reviewer through a suggestion at all. *Recommended: public only in v1* (simplest rule; widen later).
6. **Pair rules:** one open suggestion per pair in either direction (the issue says per source→target), and a declined pair may be suggested again (the review row shows "Declined before"). *Recommended: as written.*
7. **Swap direction on accept** ("keep the other title"): a reviewer can choose which song stays. *Recommended: include; it is one parameter.*
8. **Extras beyond the issue:** member **Withdraw**, admin **Reopen** a declined one, statuses `withdrawn` and `superseded`. *Recommended: include.*
9. **Reviewer signal:** count badge on the user-menu entry, no per-reviewer notification rows; in-app only, no e-mail. Or a digest item in the bell? *Recommended: badge.*
10. **Limits:** 10 open suggestions per member, note and reason at most 280 characters. *Recommended: yes.*
11. **Where the queue lives:** `/suggestions` from the user menu (members: "My suggestions", reviewers: queue). Alternatives: a Library tab, or inside the admin portal (admins only). *Recommended: `/suggestions`.*
12. **Decline reason:** optional short free text, shown to the member and kept in the history. Or fixed choices ("Different songs", "Not sure")? *Recommended: free text.*
