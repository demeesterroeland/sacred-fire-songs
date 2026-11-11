// Story 6.1.37 (#490) — docs/testing/ux-v2-profile-playback.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { signedUrlByPath, type SignedUrlResult } from '../../../lib/users/profileRecordings';

interface State {
  signed: SignedUrlResult[];
  urls: Map<string, string>;
}
const states = new WeakMap<object, State>();
const st = (w: object): State => {
  let s = states.get(w);
  if (!s) {
    s = { signed: [], urls: new Map() };
    states.set(w, s);
  }
  return s;
};

Given('the storage signed {string} and could not sign {string}', function (this: object, ok: string, failed: string) {
  st(this).signed = [
    { path: ok, signedUrl: `https://storage.test/${ok}?token=x`, error: null },
    { path: failed, signedUrl: null, error: 'Object not found' },
  ];
});

When('the profile recordings get their play URLs', function (this: object) {
  st(this).urls = signedUrlByPath(st(this).signed);
});

Then('{string} has a play URL', function (this: object, path: string) {
  assert.ok(st(this).urls.get(path));
});

Then('{string} has no play URL', function (this: object, path: string) {
  assert.equal(st(this).urls.get(path), undefined);
});
