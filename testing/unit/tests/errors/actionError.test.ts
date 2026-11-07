// Validation 1 review, M4: server actions answer with English strings (and sometimes a raw database message).
// The person never sees those: they get a message in their language, or the generic one.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { DICTIONARIES } from '@/lib/i18n';
import { actionErrorMessage, ACTION_ERROR_KEYS } from '@/lib/errors/actionError';

const t = (k: string) => `T:${k}`;

describe('actionErrorMessage', () => {
  it.each([
    ['Not authenticated', 'errors.notSignedIn'],
    ['Unauthorized', 'errors.notSignedIn'],
    ['Access denied: not your playlist or unauthorized', 'errors.accessDenied'],
    ['Access denied', 'errors.accessDenied'],
    ['Not your playlist', 'errors.accessDenied'],
    ['Forbidden: Admins only', 'errors.accessDenied'],
    ['Playlist not found', 'errors.playlistNotFound'],
    ['Song version not found', 'errors.songNotFound'],
    ['Cannot rename smart playlists', 'errors.smartPlaylistLocked'],
    ['Cannot delete smart playlists', 'errors.smartPlaylistLocked'],
    ['Cannot modify smart playlists', 'errors.smartPlaylistLocked'],
    ['Title required', 'errors.titleRequired'],
    ['Title too long', 'errors.titleTooLong'],
    ['Description too long', 'errors.descriptionTooLong'],
    ['Please log in to export a PDF songbook', 'errors.notSignedIn'],
    ['Export limit exceeded: maximum 200 songs allowed per PDF export', 'errors.exportLimit'],
    ['User not logged in. Please sign in again.', 'errors.notSignedIn'],
    ['Song not found', 'errors.songNotFound'],
    ['Take not found.', 'errors.takeNotFound'],
    ['Recording not found', 'errors.takeNotFound'],
    ['Only the recording owner can share this recording.', 'errors.notTakeOwner'],
    ['This song is private. You must make the song lyrics public before sharing recordings.', 'errors.shareSongPrivate'],
    ['Cannot share recording with yourself.', 'errors.shareWithSelf'],
    ['Only the song owner or an admin can publish this song.', 'errors.notSongOwner'],
    ['Singer consent must be explicitly confirmed before publishing publicly.', 'errors.consentRequired'],
    ['This song is private, so this take has no audience yet. Make the song public first, then publish the take.', 'recording.publish.errorSongPrivate'],
  ])('%s → %s', (error, key) => {
    expect(actionErrorMessage(error, t)).toBe(`T:${key}`);
  });

  it('never shows an unknown or raw database message: the generic one instead', () => {
    for (const raw of [
      'duplicate key value violates unique constraint "setlists_pkey"',
      'JWT expired',
      'Insert returned no data',
      'Invalid playlist ID',
      '',
      undefined,
    ]) {
      expect(actionErrorMessage(raw, t)).toBe('T:errors.generic');
    }
  });

  it('accepts a site specific fallback key', () => {
    expect(actionErrorMessage('boom', t, 'settings.profile.error')).toBe('T:settings.profile.error');
  });

  it('knows a key for every message and the message files have them all, in every language', () => {
    for (const key of [...new Set([...Object.values(ACTION_ERROR_KEYS), 'errors.generic'])]) {
      for (const [locale, dict] of Object.entries(DICTIONARIES)) {
        expect((dict as Record<string, string>)[key], `${locale}:${key}`).toBeTruthy();
      }
    }
  });
});

describe('no raw error text reaches a toast', () => {
  const ROOT = path.resolve(__dirname, '../../../..');
  function walk(dir: string, out: string[] = []) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full, out);
      else if (/\.tsx?$/.test(full)) out.push(full);
    }
    return out;
  }

  it('toast.error / toast descriptions never print result.error, res.error or error.message', () => {
    const raw = /toast\.error\(\s*(?:result|res|addResult)\.error\b|toast\.error\(\s*(?:err|error)\.message\b|toast\.error\(\s*(?:result|res)\.error\s*\|\||description:\s*result\.error|\berror:\s*String\(/;
    const offenders: string[] = [];
    for (const dir of ['app', 'components', 'hooks']) {
      for (const f of walk(path.join(ROOT, dir))) {
        if (/app\/actions\//.test(f)) continue;
        if (raw.test(fs.readFileSync(f, 'utf8'))) offenders.push(path.relative(ROOT, f));
      }
    }
    expect(offenders).toEqual([]);
  });
});

// Review round: `getRecordingDownloadUrl` has no caller, so its answer has no key of its own (it falls back to the
// generic message if anything ever calls it). The key was removed from every locale.
describe('unused download message', () => {
  it('has no key in any language and no mapping', () => {
    expect(ACTION_ERROR_KEYS['Shared recordings cannot be downloaded']).toBeUndefined();
    for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
      expect(Object.keys(dictionary as object), locale).not.toContain('errors.sharedTakeNoDownload');
    }
  });
});

