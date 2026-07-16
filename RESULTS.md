# Performance Test Results

---

## ⚡ Performance Tests (k6)

### Target
URL: https://<parent-project>-lfcaj6onn-roeland-de-meesters-projects.vercel.app/

### Results
July 16, 2026 17:17:30 (Local Time)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| p95 Response Time | 887.52ms | <1000ms | ✅ |
| p99 Response Time | ~1000ms | <2000ms | ✅ |
| Average Response Time | 501.28ms | - | ✅ |
| Error Rate | 0.00% | <1% | ✅ |
| Total Requests | 80 | - | - |
| Throughput | 0.66 req/s | - | - |

### Verdict
PASS - Performance tests executed successfully against the Vercel Preview URL. All requests completed with a 0% error rate, and response times remained well within acceptable limits.

### Detailed Output
The k6 performance test ran for 2 minutes using `simple-load-test.js` with VUs ramping up to simulated load. Thanks to the newly configured Vercel Protection Bypass header (`x-vercel-protection-bypass: qgBhp0e5McWwZIscbbeMdhrMS3Ryzv4B`), requests were able to bypass Vercel's SSO gateway and directly access the application home page. 

- **All requests** returned `200 OK`.
- **Response times** were stable, with an average of `501.28ms` and a median of `410.39ms`.
- **Threshold checks** for HTTP request success rate and response times passed.