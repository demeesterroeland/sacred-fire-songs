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
├── e2e/            # E2E docs/config (Playwright specs live in /e2e)
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

### BDD (Cucumber, non-browser)
Feature files live in `docs/testing/*.feature`, steps in `testing/bdd/steps/`,
shared fakes in `testing/support/`.
```bash
npm run test:bdd          # @unit and @seed scenarios of every feature
npm run test:bdd:unit     # @unit only
npm run test:bdd:seed     # @seed only (needs the seeded local database)
npm run test:bdd:i18n     # @unit scenarios of docs/testing/i18n.feature
```

### E2E Tests
```bash
npm run test:e2e          # All E2E tests
npm run test:e2e:smoke    # Smoke tests only
npm run test:e2e:ui       # Interactive UI mode
```

### Pipeline Contract Tests (Epic 5.1, Gitflow CI/CD)
```bash
npx vitest run testing/unit/tests/ci   # workflow contract helper + current invariants
npm run test:bdd:ci                    # @ci-contract scenarios of docs/testing/gitflow-cicd.feature (red until each story lands)
npm run test:scripts                   # bats tests for scripts/ (testing/scripts/*.bats)
npm run typecheck                      # tsc --noEmit
npm run lint                           # eslint . --max-warnings 181 (ratchet: never raise the cap)
npm run test:bdd:ci-gate               # strict contract scenarios of implemented stories (CI job `pipeline`)
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