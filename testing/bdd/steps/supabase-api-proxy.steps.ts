// #623 — docs/testing/supabase-api-proxy.feature
import { Given, When, Then, After } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET } from '../../../app/supabase-api/[...path]/route';

interface ProxyWorld {
  upstream?: () => Response;
  calls?: Array<{ url: string; init?: RequestInit }>;
  response?: Response;
  restore?: () => void;
}

const UPSTREAM = 'http://auth-upstream.test';

function stubUpstream(world: ProxyWorld, make: () => Response) {
  const calls: ProxyWorld['calls'] = [];
  const realFetch = globalThis.fetch;
  const realEnv = process.env.SUPABASE_INTERNAL_URL;
  process.env.SUPABASE_INTERNAL_URL = UPSTREAM;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return make();
  }) as typeof fetch;
  world.calls = calls;
  world.restore = () => {
    globalThis.fetch = realFetch;
    if (realEnv === undefined) delete process.env.SUPABASE_INTERNAL_URL;
    else process.env.SUPABASE_INTERNAL_URL = realEnv;
  };
}

async function viaProxy(world: ProxyWorld, path: string[], search = '') {
  const req = new NextRequest(`http://app.test/supabase-api/${path.join('/')}${search}`);
  world.response = await GET(req, { params: Promise.resolve({ path }) });
}

After(function (this: ProxyWorld) {
  this.restore?.();
  this.restore = undefined;
});

Given('the auth server answers a verify request with 303 and a Location to {string}', function (this: ProxyWorld, location: string) {
  stubUpstream(this, () => new Response(null, { status: 303, headers: { location } }));
});

Given('the auth server answers 200 with the JSON body {string}', function (this: ProxyWorld, body: string) {
  stubUpstream(this, () => new Response(body, { status: 200, headers: { 'content-type': 'application/json' } }));
});

When("the browser opens the verify link through the app's proxy", async function (this: ProxyWorld) {
  await viaProxy(this, ['auth', 'v1', 'verify'], '?token=t&type=magiclink');
});

When("a request goes through the app's proxy", async function (this: ProxyWorld) {
  await viaProxy(this, ['rest', 'v1', 'songs']);
});

Then('the proxy answers 303 with the Location {string}', function (this: ProxyWorld, location: string) {
  assert.equal(this.response!.status, 303);
  assert.equal(this.response!.headers.get('location'), location);
});

Then('the proxy does not request the Location itself', function (this: ProxyWorld) {
  assert.equal(this.calls!.length, 1);
  assert.equal(this.calls![0].init?.redirect, 'manual');
});

Then('the proxy answers 200 with the JSON body {string}', async function (this: ProxyWorld, body: string) {
  assert.equal(this.response!.status, 200);
  assert.deepEqual(await this.response!.json(), JSON.parse(body));
});
