import { describe, expect, it } from 'vitest';
import {
  actionRefs,
  globMatch,
  isPinnedToSha,
  jobNames,
  listWorkflows,
  loadWorkflow,
  parseWorkflow,
  runsCommand,
  stepIndex,
  triggerTypes,
  triggersOnAllBranches,
  triggersOnBranch,
  usesEnvironment,
  workflowExists,
} from '../../../support/workflowContract';

// Contract-test helpers for Epic 5.1 (Gitflow CI/CD). Story-specific contracts
// live in docs/testing/gitflow-cicd.feature (Cucumber profile "ci").

const FIXTURE = `
name: Fixture
on:
  push:
    branches: ["main", "feat/**"]
  pull_request:
    branches: [develop]
  release:
    types: [published]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@0123456789abcdef0123456789abcdef01234567
      - run: npm ci
  deploy:
    needs: build
    environment: Production
    runs-on: ubuntu-latest
    steps:
      - uses: docker/login-action@v3
      - uses: ./.github/actions/local
      - run: supabase db push --include-all
      - run: docker compose up -d
`;

describe('workflowContract helpers', () => {
  const wf = parseWorkflow('fixture.yml', FIXTURE);

  it('reads triggers and branch filters', () => {
    expect(triggersOnBranch(wf, 'push', 'main')).toBe(true);
    expect(triggersOnBranch(wf, 'push', 'feat/300-x')).toBe(true);
    expect(triggersOnBranch(wf, 'push', 'develop')).toBe(false);
    expect(triggersOnBranch(wf, 'pull_request', 'develop')).toBe(true);
    expect(triggersOnAllBranches(wf, 'push')).toBe(false);
    expect(triggerTypes(wf, 'release')).toEqual(['published']);
  });

  it('treats a trigger without branch filter as all branches', () => {
    const all = parseWorkflow('all.yml', 'on: [push, pull_request]\njobs: {}\n');
    expect(triggersOnAllBranches(all, 'push')).toBe(true);
    expect(triggersOnBranch(all, 'pull_request', 'anything/at-all')).toBe(true);
  });

  it('matches GitHub branch globs', () => {
    expect(globMatch('feat/*', 'feat/300-x')).toBe(true);
    expect(globMatch('feat/*', 'feat/a/b')).toBe(false);
    expect(globMatch('**', 'feat/a/b')).toBe(true);
    expect(globMatch('main', 'main')).toBe(true);
    expect(globMatch('main', 'mainline')).toBe(false);
  });

  it('reads jobs, environments and run commands in order', () => {
    expect(jobNames(wf)).toEqual(['build', 'deploy']);
    expect(usesEnvironment(wf, 'Production')).toBe(true);
    expect(usesEnvironment(wf, 'Staging')).toBe(false);
    expect(runsCommand(wf, 'supabase db push')).toBe(true);
    expect(stepIndex(wf, 'supabase db push')).toBeLessThan(stepIndex(wf, 'docker compose up'));
  });

  it('detects SHA-pinned third-party actions and ignores local actions', () => {
    const refs = actionRefs(wf);
    expect(refs).toEqual([
      'actions/checkout@0123456789abcdef0123456789abcdef01234567',
      'docker/login-action@v3',
    ]);
    expect(refs.map(isPinnedToSha)).toEqual([true, false]);
  });
});

describe('current repository workflows', () => {
  it('all parse as YAML with triggers and jobs', () => {
    const files = listWorkflows();
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const wf = loadWorkflow(file);
      expect(Object.keys(wf.on).length, `${file} triggers`).toBeGreaterThan(0);
      expect(jobNames(wf).length, `${file} jobs`).toBeGreaterThan(0);
    }
  });

  it('runs Release Please only on main (Gitflow: releases are cut from main)', () => {
    const wf = loadWorkflow('release-please.yml');
    expect(triggersOnBranch(wf, 'push', 'main')).toBe(true);
    expect(triggersOnBranch(wf, 'push', 'develop')).toBe(false);
  });

  it('runs the E2E smoke on pull requests into develop and main', () => {
    const wf = loadWorkflow('e2e.yml');
    expect(triggersOnBranch(wf, 'pull_request', 'develop')).toBe(true);
    expect(triggersOnBranch(wf, 'pull_request', 'main')).toBe(true);
  });

  it('reports missing workflows instead of crashing', () => {
    expect(workflowExists('does-not-exist.yml')).toBe(false);
    expect(() => loadWorkflow('does-not-exist.yml')).toThrow(/does not exist/);
  });
});
