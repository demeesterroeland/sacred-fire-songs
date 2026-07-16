import { sleep, group } from 'k6';
import http from 'k6/http';
import { check, fail } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // ramp up to 10 users
    { duration: '1m', target: 10 },  // stay at 10 users
    { duration: '30s', target: 0 },  // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // 95th and 99th percentile response times
    http_req_failed: ['rate<0.01'], // max 1% failure rate
  },
};

export default function () {
  group('Home Page Load', function () {
    const url = __ENV.BASE_URL || 'https://<parent-project>-lfcaj6onn-roeland-de-meesters-projects.vercel.app/';
    const headers = { 
      'Authorization': `Bearer ${__ENV.VERCEL_TOKEN}`,
    };
    if (__ENV.VERCEL_PROTECTION_BYPASS_TOKEN) {
      headers['x-vercel-protection-bypass'] = __ENV.VERCEL_PROTECTION_BYPASS_TOKEN;
    }
    const res = http.get(url, { headers: headers });
    
    check(res, {
      'is status 200': (r) => r.status === 200,
      'response time < 1000ms': (r) => r.timings.duration < 1000,
    });
    
    sleep(1);
  });
}