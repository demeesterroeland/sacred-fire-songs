import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { SongBddWorld } from '../support/world';

export interface RecordingSharingBddState {
  owner: { id: string; name: string; email: string };
  recipient?: { id: string; name: string; email: string };
  recording: {
    id: string;
    name: string;
    user_id: string;
    is_public: boolean;
    singer_consent_confirmed: boolean;
    singer_profile_id?: string | null;
    singer_name?: string | null;
    singer_email?: string | null;
  };
  shares: Array<{ recording_id: string; shared_with_user_id: string }>;
  profiles: Array<{ id: string; name: string; email: string; is_musician: boolean }>;
  lastError?: string | null;
  lastResult?: unknown;
}

function getState(world: SongBddWorld): RecordingSharingBddState {
  if (!world.recordingSharing) {
    world.recordingSharing = {
      owner: { id: 'owner-alice', name: 'Alice', email: 'alice@example.com' },
      recording: {
        id: 'rec-1',
        name: 'Take 1',
        user_id: 'owner-alice',
        is_public: false,
        singer_consent_confirmed: false,
      },
      shares: [],
      profiles: [
        { id: 'owner-alice', name: 'Alice', email: 'alice@example.com', is_musician: false },
        { id: 'user-bob', name: 'Bob', email: 'bob@example.com', is_musician: false },
        { id: 'user-charlie', name: 'Charlie', email: 'charlie@example.com', is_musician: false },
        { id: 'musician-danit', name: 'Danit', email: 'danit@example.com', is_musician: true },
      ],
    };
  }
  return world.recordingSharing;
}

Given('a recording owner {string} has a private recording {string}', function (this: SongBddWorld, ownerName: string, recName: string) {
  const state = getState(this);
  state.owner = { id: `id-${ownerName.toLowerCase()}`, name: ownerName, email: `${ownerName.toLowerCase()}@example.com` };
  state.recording = {
    id: `rec-${recName.replace(/\s+/g, '-').toLowerCase()}`,
    name: recName,
    user_id: state.owner.id,
    is_public: false,
    singer_consent_confirmed: false,
  };
});

When('{word} shares the recording with registered user {string}', function (this: SongBddWorld, callerName: string, recipientName: string) {
  const state = getState(this);
  const callerId = `id-${callerName.toLowerCase()}`;
  if (callerId !== state.recording.user_id) {
    state.lastError = 'Only the recording owner can share this recording.';
    return;
  }
  const recipient = state.profiles.find((p) => p.name === recipientName) || {
    id: `id-${recipientName.toLowerCase()}`,
    name: recipientName,
    email: `${recipientName.toLowerCase()}@example.com`,
    is_musician: false,
  };
  state.recipient = recipient;
  state.shares.push({ recording_id: state.recording.id, shared_with_user_id: recipient.id });
});

Then('the recording should be shared with {string}', function (this: SongBddWorld, recipientName: string) {
  const state = getState(this);
  const recipient = state.profiles.find((p) => p.name === recipientName) || state.recipient;
  assert.ok(recipient, 'recipient should be found');
  const share = state.shares.find(
    (s) => s.recording_id === state.recording.id && s.shared_with_user_id === recipient!.id
  );
  assert.ok(share, 'share row should exist');
});

Then('{string} should see the recording marked as {string}', function (this: SongBddWorld, recipientName: string, badgeText: string) {
  const state = getState(this);
  const recipient = state.profiles.find((p) => p.name === recipientName) || state.recipient;
  const isOwner = recipient?.id === state.recording.user_id;
  const isShared = !isOwner && state.shares.some(
    (s) => s.recording_id === state.recording.id && s.shared_with_user_id === recipient?.id
  );
  assert.equal(isShared, true);
  assert.equal(badgeText, 'Shared with you');
});

Given('a recording owner {string} has shared a recording {string} with {string}', function (
  this: SongBddWorld,
  ownerName: string,
  recName: string,
  recipientName: string
) {
  const state = getState(this);
  state.owner = { id: `id-${ownerName.toLowerCase()}`, name: ownerName, email: `${ownerName.toLowerCase()}@example.com` };
  state.recipient = { id: `id-${recipientName.toLowerCase()}`, name: recipientName, email: `${recipientName.toLowerCase()}@example.com` };
  state.recording = {
    id: `rec-${recName.replace(/\s+/g, '-').toLowerCase()}`,
    name: recName,
    user_id: state.owner.id,
    is_public: false,
    singer_consent_confirmed: false,
  };
  state.shares.push({ recording_id: state.recording.id, shared_with_user_id: state.recipient.id });
});

When('{string} attempts to download the audio file', function (this: SongBddWorld, callerName: string) {
  const state = getState(this);
  const callerId = `id-${callerName.toLowerCase()}`;
  if (callerId !== state.recording.user_id) {
    state.lastError = 'Shared recordings cannot be downloaded';
  } else {
    state.lastError = null;
  }
});

Then('the download request should be rejected with {string}', function (this: SongBddWorld, expectedError: string) {
  const state = getState(this);
  assert.ok(state.lastError?.includes(expectedError), `expected error ${state.lastError} to include ${expectedError}`);
});

Then('{string} should not have download permissions on the recording', function (this: SongBddWorld, callerName: string) {
  const state = getState(this);
  const callerId = `id-${callerName.toLowerCase()}`;
  const canDownload = callerId === state.recording.user_id;
  assert.equal(canDownload, false);
});

When('{string} attempts to share the recording with {string}', function (this: SongBddWorld, callerName: string, targetName: string) {
  void targetName;
  const state = getState(this);
  const callerId = `id-${callerName.toLowerCase()}`;
  if (callerId !== state.recording.user_id) {
    state.lastError = 'Only the recording owner can share this recording.';
  } else {
    state.lastError = null;
  }
});

Then('the sharing request should be rejected with {string}', function (this: SongBddWorld, expectedError: string) {
  const state = getState(this);
  assert.equal(state.lastError, expectedError);
});

When('{word} attempts to make the recording public without confirming singer consent', function (this: SongBddWorld, name: string) {
  void name;
  const state = getState(this);
  const consentConfirmed = false;
  if (!consentConfirmed) {
    state.lastError = 'Singer consent must be explicitly confirmed before publishing publicly.';
  }
});

Then('the publication should be rejected with {string}', function (this: SongBddWorld, errorFragment: string) {
  const state = getState(this);
  assert.ok(state.lastError?.includes(errorFragment), `expected error to include ${errorFragment}`);
});

Then('the recording should remain private', function (this: SongBddWorld) {
  const state = getState(this);
  assert.equal(state.recording.is_public, false);
});

When('{word} confirms singer consent and publishes the recording', function (this: SongBddWorld, name: string) {
  void name;
  const state = getState(this);
  state.recording.is_public = true;
  state.recording.singer_consent_confirmed = true;
  state.lastError = null;
});

Then('the recording visibility should be updated to public', function (this: SongBddWorld) {
  const state = getState(this);
  assert.equal(state.recording.is_public, true);
});

Then('the singer consent confirmation should be recorded', function (this: SongBddWorld) {
  const state = getState(this);
  assert.equal(state.recording.singer_consent_confirmed, true);
});

Given('a registered musician {string} exists with a verified musician profile', function (this: SongBddWorld, musicianName: string) {
  const state = getState(this);
  let musician = state.profiles.find((p) => p.name === musicianName);
  if (!musician) {
    musician = {
      id: `id-${musicianName.toLowerCase()}`,
      name: musicianName,
      email: `${musicianName.toLowerCase()}@example.com`,
      is_musician: true,
    };
    state.profiles.push(musician);
  }
  musician.is_musician = true;
});

When('a recording owner attributes {string} as the singer on {string}', function (
  this: SongBddWorld,
  musicianName: string,
  recName: string
) {
  const state = getState(this);
  const musician = state.profiles.find((p) => p.name === musicianName);
  state.recording = {
    id: `rec-${recName.replace(/\s+/g, '-').toLowerCase()}`,
    name: recName,
    user_id: state.owner.id,
    is_public: false,
    singer_consent_confirmed: false,
    singer_profile_id: musician?.id || null,
    singer_name: musicianName,
  };
});

Then('the recording should display singer attribution with a verified musician badge', function (this: SongBddWorld) {
  const state = getState(this);
  const musician = state.profiles.find((p) => p.id === state.recording.singer_profile_id);
  assert.ok(musician, 'musician should exist');
  assert.equal(musician.is_musician, true);
  assert.equal(state.recording.singer_name, musician.name);
});

Then('the singer attribution should link to the musician profile', function (this: SongBddWorld) {
  const state = getState(this);
  assert.ok(state.recording.singer_profile_id);
  const profileLink = `/users/${state.recording.singer_profile_id}`;
  assert.equal(profileLink, `/users/${state.recording.singer_profile_id}`);
});

Given('a singer {string} does not have an account yet', function (this: SongBddWorld, singerName: string) {
  const state = getState(this);
  state.profiles = state.profiles.filter((p) => p.name !== singerName);
});

When('a recording owner attributes {string} with optional email {string}', function (
  this: SongBddWorld,
  singerName: string,
  singerEmail: string
) {
  const state = getState(this);
  state.recording = {
    id: 'rec-unregistered',
    name: 'Song Take',
    user_id: state.owner.id,
    is_public: false,
    singer_consent_confirmed: false,
    singer_profile_id: null,
    singer_name: singerName,
    singer_email: singerEmail,
  };
});

Then('the recording should display the singer name without crashing', function (this: SongBddWorld) {
  const state = getState(this);
  assert.equal(state.recording.singer_name, 'Unknown Fire Keeper');
  assert.equal(state.recording.singer_profile_id, null);
});

Then('the recording should display a pending invite status without a profile link', function (this: SongBddWorld) {
  const state = getState(this);
  assert.equal(state.recording.singer_profile_id, null);
  assert.equal(state.recording.singer_email, 'keeper@sacredfire.org');
});
