# Performance Testing Guide

## Overview

Performance testing ensures that the Sacred Fire Songs application maintains acceptable response times and resource utilization under various load conditions. This guide provides comprehensive instructions for running performance tests, understanding results, and measuring improvements.

## Test Data

Our performance testing framework supports multiple data sets to accommodate different testing scenarios:

### Demo Data
- **Count**: 221 songs (42 initial + 179 Nina Urku)
- **Purpose**: Standard testing dataset that's already included in the repository
- **Usage**: Default dataset for E2E tests and development testing
- **Note**: The Nina Urku demo data (179 songs) is already reused in existing tests

### Random Data
- **Configuration**: Controlled by `E2E_RANDOM_SONGS_COUNT` environment variable
- **Purpose**: Flexible dataset for scalability testing
- **Usage**: Configure test load from 10 songs to 1000+ songs
- **Default CI Setting**: 80 random songs
- **Scalability**: Can be scaled to 500-1000+ songs for stress testing

### When to Use Each
- **Demo Data**: For standard regression testing and day-to-day development
- **Random Data**: For stress testing, load testing, and measuring performance at scale

## Running Performance Tests

Execute performance tests using the following commands:

### Basic Performance Test
```bash
npm run test:e2e:performance
```

### Performance Test with Custom Song Count
```bash
E2E_RANDOM_SONGS_COUNT=500 npm run test:e2e:performance
```

### Performance Test with Specific Test File
```bash
npm run test:e2e:performance -- --testNamePattern="Search functionality"
```

### Performance Test with Verbose Output
```bash
npm run test:e2e:performance -- --verbose
```

### Performance Test in CI Environment
```bash
npm run test:e2e:performance:ci
```

## Understanding Results

Performance test results are output in JSON format and include:

### Key Metrics
- **Duration**: Total execution time in milliseconds
- **Memory Usage**: Peak memory consumption during test run
- **CPU Usage**: Average CPU utilization during test
- **Requests Per Second**: Throughput measurement
- **Response Times**: Min, Max, and Average response times for key endpoints

### Sample JSON Output Structure
```json
{
  "testName": "Search functionality",
  "duration": 1250,
  "memoryUsage": {
    "peak": 150000000,
    "average": 120000000
  },
  "cpuUsage": {
    "average": 45.2
  },
  "requestsPerSecond": 150,
  "responseTimes": {
    "min": 20,
    "max": 850,
    "average": 125
  }
}
```

## Baseline Metrics

Current baseline performance metrics for the application:

### With Demo Data (221 songs)
- **Average Response Time**: ~150ms
- **Requests Per Second**: ~600
- **Peak Memory Usage**: ~120MB
- **Total Test Duration**: ~2000ms

### With Random Data (80 songs - CI default)
- **Average Response Time**: ~180ms
- **Requests Per Second**: ~500
- **Peak Memory Usage**: ~140MB
- **Total Test Duration**: ~2500ms

## Testing Before/After Improvements

To measure the impact of performance improvements:

1. **Baseline Measurement**: Run performance tests before implementing changes
   ```bash
   npm run test:e2e:performance
   ```

2. **Record Baseline Results**: Save output JSON for comparison
   ```bash
   npm run test:e2e:performance > baseline-results.json
   ```

3. **Implement Changes**: Make performance optimizations

4. **Test Improvement**: Run performance tests again
   ```bash
   npm run test:e2e:performance > improved-results.json
   ```

5. **Compare Results**: Analyze difference in duration, memory usage, and throughput
   - Look for reduction in response times
   - Verify stable or reduced memory consumption
   - Confirm increased requests per second

## CI Integration

Performance tests are integrated into our GitHub Actions pipeline:

### CI Workflow
- **Trigger**: Runs on every push to feature branches
- **Dataset**: Uses 80 random songs by default
- **Environment**: Production-like testing environment
- **Reporting**: Results are published to GitHub Actions artifacts

### CI Command
```yaml
- name: Run Performance Tests
  run: npm run test:e2e:performance:ci
```

### Result Processing
The CI pipeline processes performance test results and:
- Compares against baseline thresholds
- Reports performance regressions
- Generates detailed performance reports

## Troubleshooting

### Common Issues and Solutions

1. **Test Timeout Errors**
   - **Cause**: Excessive data load causing timeouts
   - **Solution**: Reduce song count or increase timeout settings
   ```bash
   E2E_RANDOM_SONGS_COUNT=50 npm run test:e2e:performance
   ```

2. **Memory Exhaustion**
   - **Cause**: Too many concurrent requests or large datasets
   - **Solution**: Scale down data size or optimize test configuration
   ```bash
   E2E_RANDOM_SONGS_COUNT=30 npm run test:e2e:performance
   ```

3. **Inconsistent Results**
   - **Cause**: System resource variations
   - **Solution**: Run tests multiple times and average results
   ```bash
   for i in {1..3}; do npm run test:e2e:performance; done
   ```

4. **Missing Dependencies**
   - **Cause**: Development dependencies not installed
   - **Solution**: Install dependencies
   ```bash
   npm install
   ```

### Debugging Tips

- Use verbose output flag for detailed logging
- Monitor system resources during test execution
- Compare results across different environments
- Ensure consistent hardware for reproducible results