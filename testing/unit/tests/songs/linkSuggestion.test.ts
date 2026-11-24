// Story 6.2.26 / G1.5 (#598): the pure helpers around song link suggestions (L2).
import { describe, expect, it } from 'vitest';
import {
  SUGGESTION_ERROR_KEYS,
  SUGGESTION_NOTE_MAX,
  SUGGESTION_STATUS_KEYS,
  canDecideSuggestion,
  canReopenSuggestion,
  canSuggestLink,
  canWithdrawSuggestion,
  isSuggestionNotification,
  normalizeNote,
  rowsForSegment,
  suggestionError,
  suggestionHints,
  suggestionNotificationText,
  suggestionSegments,
  type LinkSuggestion,
} from '@/lib/songs/linkSuggestion';

const row = (over: Partial<LinkSuggestion> = {}): LinkSuggestion => ({
  id: 'r1',
  source_id: 's1',
  target_id: 't1',
  source_title: 'Source',
  target_title: 'Target',
  suggested_by: 'u1',
  suggester_name: 'Anna',
  note: null,
  status: 'open',
  decision_note: null,
  reviewed_by: null,
  reviewer_name: null,
  reviewed_at: null,
  reopened_at: null,
  created_at: '2026-11-20T10:00:00Z',
  ...over,
});

describe('canSuggestLink', () => {
  it.each([
    ['member', true],
    ['musician', true],
    ['expert', true],
    ['gatekeeper', true],
    ['admin', false],
  ])('%s on a public song of someone else: %s', (role, shown) => {
    expect(canSuggestLink({ id: 'u1', role }, { isPublic: true, ownerId: 'other' })).toBe(shown);
  });
  it('a gatekeeper on their own song sees both actions: the database refuses an own–own pair', () => {
    expect(canSuggestLink({ id: 'u1', role: 'gatekeeper' }, { isPublic: true, ownerId: 'u1' })).toBe(true);
    expect(canSuggestLink({ id: 'u1', role: 'member' }, { isPublic: true, ownerId: 'u1' })).toBe(true);
  });
  it('is never offered to a guest or on a private song', () => {
    expect(canSuggestLink(null, { isPublic: true, ownerId: 'x' })).toBe(false);
    expect(canSuggestLink({ id: 'u1', role: null }, { isPublic: true, ownerId: 'x' })).toBe(false);
    expect(canSuggestLink({ id: 'u1', role: 'member' }, { isPublic: false, ownerId: 'x' })).toBe(false);
  });
});

describe('who acts on a row', () => {
  it('gatekeepers and admins decide open rows, nobody else', () => {
    expect(canDecideSuggestion({ id: 'dana', role: 'gatekeeper' }, row())).toBe(true);
    expect(canDecideSuggestion({ id: 'dana', role: 'admin' }, row())).toBe(true);
    expect(canDecideSuggestion({ id: 'dana', role: 'member' }, row())).toBe(false);
    expect(canDecideSuggestion({ id: 'dana', role: 'admin' }, row({ status: 'accepted' }))).toBe(false);
  });
  it('fails closed without a user id', () => {
    expect(canDecideSuggestion({ role: 'gatekeeper' }, row({ suggested_by: null }))).toBe(false);
    expect(rowsForSegment('review', [row()], '')).toEqual([]);
    expect(rowsForSegment('review', [row()], null)).toEqual([]);
  });
  it('a reviewer never decides their own suggestion', () => {
    expect(canDecideSuggestion({ id: 'u1', role: 'gatekeeper' }, row({ suggested_by: 'u1' }))).toBe(false);
  });
  it('the suggester withdraws their own open row', () => {
    expect(canWithdrawSuggestion({ id: 'u1' }, row())).toBe(true);
    expect(canWithdrawSuggestion({ id: 'u2' }, row())).toBe(false);
    expect(canWithdrawSuggestion({ id: 'u1' }, row({ status: 'declined' }))).toBe(false);
  });
  it('only admins reopen, and only declined rows', () => {
    expect(canReopenSuggestion({ role: 'admin' }, row({ status: 'declined' }))).toBe(true);
    expect(canReopenSuggestion({ role: 'gatekeeper' }, row({ status: 'declined' }))).toBe(false);
    expect(canReopenSuggestion({ role: 'admin' }, row({ status: 'open' }))).toBe(false);
  });
});

describe('normalizeNote', () => {
  it('trims, turns an empty text into no note and refuses more than 280 characters', () => {
    expect(normalizeNote('  Same song  ')).toEqual({ ok: true, value: 'Same song' });
    expect(normalizeNote('   ')).toEqual({ ok: true, value: null });
    expect(normalizeNote(null)).toEqual({ ok: true, value: null });
    expect(normalizeNote('x'.repeat(SUGGESTION_NOTE_MAX))).toMatchObject({ ok: true });
    expect(normalizeNote('x'.repeat(SUGGESTION_NOTE_MAX + 1))).toEqual({ ok: false, error: 'tooLong' });
  });
});

describe('suggestionError', () => {
  it.each([
    ['42501', 'Sign in to suggest a link', 'signIn'],
    ['42501', 'You can link or review these songs yourself', 'reviewer'],
    ['42501', 'Only gatekeepers and admins can review suggestions', 'notReviewer'],
    ['42501', 'Only admins can reopen suggestions', 'notAdmin'],
    ['42501', 'You cannot decide your own suggestion', 'ownSuggestion'],
    ['42501', 'You can only withdraw your own suggestions', 'notAllowed'],
    ['P0002', 'Song not found', 'notFound'],
    ['23505', 'This suggestion already exists', 'duplicate'],
    ['22023', 'A song cannot be linked to itself', 'self'],
    ['22023', 'This song is already linked to another song', 'alreadyLinked'],
    ['22023', 'Both songs must be public, or both private', 'visibility'],
    ['22023', 'Only public songs can be suggested', 'notPublic'],
    ['22023', 'Too many open suggestions', 'tooMany'],
    ['22023', 'This suggestion was already decided', 'decided'],
    ['22023', 'Only declined suggestions can be reopened', 'notDeclined'],
    ['22023', 'The note is too long', 'tooLong'],
    ['22023', 'something else', 'invalid'],
    ['XX000', 'boom', 'failed'],
  ])('%s %s -> %s', (code, message, expected) => {
    expect(suggestionError({ code, message })).toBe(expected);
    expect(SUGGESTION_ERROR_KEYS[expected as keyof typeof SUGGESTION_ERROR_KEYS]).toMatch(/^suggest\.error\./);
  });
  it('never returns the raw message for an unknown failure', () => {
    expect(suggestionError(null)).toBe('failed');
  });
  it('has a label key for every status', () => {
    expect(Object.keys(SUGGESTION_STATUS_KEYS).sort()).toEqual(['accepted', 'declined', 'open', 'superseded', 'withdrawn']);
  });
});

describe('suggestionHints', () => {
  it('says "declined before" for the same pair in either direction', () => {
    const declined = row({ id: 'd', status: 'declined', source_id: 't1', target_id: 's1', reviewed_at: '2026-11-09T10:00:00Z' });
    expect(suggestionHints(row(), [row(), declined]).declinedBefore).toBe('2026-11-09T10:00:00Z');
    expect(suggestionHints(row(), [row()]).declinedBefore).toBeNull();
  });
  it('lists the other targets suggested for the same source, without repeats', () => {
    const a = row({ id: 'a' });
    const b = row({ id: 'b', target_id: 't2', target_title: 'Other' });
    const c = row({ id: 'c', target_id: 't3', target_title: 'Other' });
    expect(suggestionHints(a, [a, b, c]).alsoSuggested).toEqual(['Other']);
  });
  it('a reopened row says it was declined before', () => {
    const reopened = row({ reopened_at: '2026-11-12T10:00:00Z', reviewed_at: '2026-11-10T10:00:00Z' });
    expect(suggestionHints(reopened, [reopened]).declinedBefore).toBe('2026-11-10T10:00:00Z');
  });
});

describe('segments', () => {
  it('reviewers get three tabs, others only their own list', () => {
    expect(suggestionSegments('admin')).toEqual(['review', 'reviewed', 'mine']);
    expect(suggestionSegments('gatekeeper')).toEqual(['review', 'reviewed', 'mine']);
    expect(suggestionSegments('member')).toEqual(['mine']);
  });
  it('splits the rows', () => {
    const rows = [
      row({ id: '1' }),
      row({ id: '2', status: 'accepted' }),
      row({ id: '3', status: 'withdrawn', suggested_by: 'u2' }),
      row({ id: '4', status: 'declined', suggested_by: 'u2' }),
    ];
    expect(rowsForSegment('review', rows, 'u2').map((r) => r.id)).toEqual(['1']);
    // Their own open suggestions are not theirs to decide: they wait under "Mine".
    expect(rowsForSegment('review', rows, 'u1')).toEqual([]);
    expect(rowsForSegment('reviewed', rows, 'u1').map((r) => r.id)).toEqual(['2', '4']);
    expect(rowsForSegment('mine', rows, 'u1').map((r) => r.id)).toEqual(['1', '2']);
    expect(rowsForSegment('mine', rows, null)).toEqual([]);
  });
});

describe('notifications', () => {
  it('knows its two types', () => {
    expect(isSuggestionNotification('link_suggestion_accepted')).toBe(true);
    expect(isSuggestionNotification('link_suggestion_declined')).toBe(true);
    expect(isSuggestionNotification('recording_shared')).toBe(false);
  });
  it('builds the bell text parameters', () => {
    expect(suggestionNotificationText('link_suggestion_accepted', { source_title: 'A', target_title: 'B' })).toEqual({
      key: 'notifications.linkSuggestionAccepted',
      params: { source: 'A', target: 'B' },
    });
    expect(suggestionNotificationText('link_suggestion_declined', { source_title: 'A', reason: 'Different songs.' })).toEqual({
      key: 'notifications.linkSuggestionDeclinedReason',
      params: { source: 'A', reason: 'Different songs' },
    });
    expect(suggestionNotificationText('link_suggestion_declined', { source_title: 'A', reason: '  ' }).key).toBe(
      'notifications.linkSuggestionDeclined'
    );
  });
});

describe('the pair text', () => {
  it('is a translation key in every locale, so a language can order or mirror it', async () => {
    const { DICTIONARIES, SUPPORTED_LOCALES } = await import('@/lib/i18n');
    for (const locale of SUPPORTED_LOCALES) {
      const text = (DICTIONARIES[locale] as Record<string, string>)['suggest.pair'];
      expect(text, locale).toContain('{source}');
      expect(text, locale).toContain('{target}');
    }
  });
});
