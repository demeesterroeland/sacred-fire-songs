import { sleep } from 'k6';
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,
  duration: '10s',
};

export default function () {
  const headers = {};
  if (__ENV.VERCEL_PROTECTION_BYPASS_TOKEN) {
    headers['x-vercel-protection-bypass'] = __ENV.VERCEL_PROTECTION_BYPASS_TOKEN;
  }
  const params = { headers };
  const res = http.get(__ENV.BASE_URL || 'https://<parent-project>-lfcaj6onn-roeland-de-meesters-projects.vercel.app/', params);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  
  sleep(1);
}