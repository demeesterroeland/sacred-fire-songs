# Testing Overview

## Directory Structure

```
testing/
├── unit/           # Unit tests (Vitest)
│   ├── doc/        # Documentation
│   ├── tests/      # Test files
│   ├── output/     # Generated reports
│   ├── data/       # Fixtures & mocks
│   └── other/      # Config & utilities
├── e2e/            # E2E tests (Playwright)
│   ├── doc/        # Documentation
│   ├── tests/      # Test files
│   ├── output/     # Generated reports
│   ├── data/       # Auth states & fixtures
│   └── other/      # Config & setup
└── performance/    # Load tests (k6)
    ├── doc/        # Documentation
    ├── tests/      # Test scripts
    ├── output/     # Results & reports
    ├── data/       # Test scenarios
    └── other/      # Config & utilities
```

## Quick Start

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
npm run test:e2e          # All E2E tests
npm run test:e2e:smoke    # Smoke tests only
npm run test:e2e:ui       # Interactive UI mode
```

### Performance Tests
```bash
npm run test:perf          # Run all performance tests
npm run test:perf:load     # Load test against URL
```

## Test Results

- Unit tests: `testing/unit/output/`
- E2E reports: `testing/e2e/output/playwright-report/`
- Performance results: `testing/performance/output/results/`