import http from 'k6/http';
import { check, sleep } from 'k6';

const token = __ENV.VERCEL_TOKEN || '';

const headers = {
  'Authorization': `Bearer ${token}`,
};
if (__ENV.VERCEL_PROTECTION_BYPASS_TOKEN) {
  headers['x-vercel-protection-bypass'] = __ENV.VERCEL_PROTECTION_BYPASS_TOKEN;
}
const params = { headers };

export default function () {
  const res = http.get(__ENV.BASE_URL, params);
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  sleep(1);
}