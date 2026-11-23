// #574 — docs/testing/ux-v2-explore-redirect.feature (@unit)
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import nextConfig from '../../../next.config';

type Rule = { source: string; destination: string; permanent?: boolean };
const state = new WeakMap<object, Rule[]>();

Given("the app's redirect rules", async function (this: object) {
  state.set(this, ((await nextConfig.redirects?.()) ?? []) as Rule[]);
});

Then('{string} redirects permanently to {string}', function (this: object, source: string, destination: string) {
  const rule = state.get(this)!.find((r) => r.source === source);
  assert.ok(rule, `no redirect for ${source}`);
  assert.equal(rule.destination, destination);
  assert.equal(rule.permanent, true);
});
