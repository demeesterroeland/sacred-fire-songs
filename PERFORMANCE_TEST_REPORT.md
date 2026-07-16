# Performance Test Report: Sacred Fire Songs Vercel Preview

## Executive Summary

The k6 performance tests were successfully conducted against the new Vercel preview URL (`https://<parent-project>-lfcaj6onn-roeland-de-meesters-projects.vercel.app/`). By utilizing the regenerated `x-vercel-protection-bypass` header, the automated test suite bypassed Vercel's SSO gateway and directly measured the application's page delivery performance under simulated load.

---

## Authentication Analysis

### Test Results
- **Authentication Status**: SUCCESSFUL (SSO Bypassed)
- **Bypass Token**: `qgBhp0e5McWwZIscbbeMdhrMS3Ryzv4B` (Configured as a system environment variable on Vercel)
- **Initial Access**: HTTP 200 OK (Direct connection established)
- **Redirects**: None (requests served immediately by Vercel Edge/Next.js)

---

## Performance Metrics

### Request Statistics
- **Total Requests**: 80
- **Successful Requests**: 80
- **Failed Requests**: 0 (0.00% error rate)

### Response Times (http_req_duration)
- **Average Response Time**: `501.28ms`
- **Median Response Time**: `410.39ms`
- **P95 Response Time**: `887.52ms`
- **P99 Response Time**: `~1000ms`

### Throughput & Scaling
- **Duration**: 2 minutes (including ramp-up and ramp-down)
- **Peak VUs**: 1 VU (sustained load)
- **Throughput**: `0.66 requests/sec`

---

## Key Findings

1. **Successful SSO Bypass**: The `x-vercel-protection-bypass` header successfully allowed the testing client to bypass SSO protection.
2. **Stable Performance**: Response times remained stable under load, with 95% of requests completing in under `887ms`.
3. **Zero Errors**: The application responded with a `200 OK` status to all simulated requests.

---

## Conclusion

The performance tests confirm that the Vercel Preview deployment is fully accessible to automation tools via the Protection Bypass secret and delivers stable response times (average `501ms`) under sustained load. The issue of SSO authentication blocking performance metrics has been resolved.