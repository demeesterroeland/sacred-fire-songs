import { sleep, group } from 'k6';
import http from 'k6/http';
import { check, fail } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 1 }, // ramp up to 1 user for testing
    { duration: '1m', target: 1 },  // stay at 1 user
    { duration: '30s', target: 0 }, // ramp down to 0 users
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
      'Authorization': 'Bearer ' + 'vca_0GhSxjyJQg24Rk5J27F39Q78P13N45B67C89D01E23F45G67H89I01J23K45L67M89N01O23P45Q67R89S01T23U45V67W89X01Y23Z45',
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