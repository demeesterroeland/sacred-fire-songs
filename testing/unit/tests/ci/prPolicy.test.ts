import { describe, expect, it } from 'vitest';
import { checkBranches, checkPullRequest, checkTitle } from '../../../../scripts/cicd/lib/prPolicy.mjs';

// Gitflow PR policy enforced by .github/workflows/pr-lint.yml (Epic 5.1, Story 5.1.5).
// Spec: docs/testing/gitflow-cicd.feature (@story-5.1.5).

describe('checkBranches (head → base policy)', () => {
  it.each([
    // work branches → develop
    ['feat/300-new-thing', 'develop', true],
    ['fix/301-bug', 'develop', true],
    ['chore/tooling', 'develop', true],
    ['docs/guide', 'develop', true],
    ['dependabot/npm_and_yarn/next-16.1.0', 'develop', true],
    ['main', 'develop', true], // back-merge after a release or hotfix
    ['random-branch', 'develop', false],
    ['feature/300-x', 'develop', false],
    ['hotfix/302-prod-crash', 'develop', false],
    ['feat/', 'develop', false],
    // promotion / hotfix / release → main
    ['develop', 'main', true],
    ['hotfix/302-prod-crash', 'main', true],
    ['release-please--branches--main', 'main', true],
    ['release-please--branches--main--components--sacred-fire-songs', 'main', true],
    ['feat/300-new-thing', 'main', false],
    ['fix/301-bug', 'main', false],
    ['dependabot/npm_and_yarn/next-16.1.0', 'main', false],
    // stacked PRs into other branches are not policed
    ['feat/300-part-2', 'feat/300-new-thing', true],
  ])('%s → %s is allowed: %s', (head, base, ok) => {
    expect(checkBranches(head, base).ok).toBe(ok);
  });

  it('explains why a work branch may not target main', () => {
    expect(checkBranches('feat/300-new-thing', 'main').reason).toMatch(/work branches must target develop/);
  });

  it('explains which head branches develop accepts', () => {
    expect(checkBranches('random-branch', 'develop').reason).toMatch(/feat\/, fix\/, chore\/, docs\//);
  });
});

describe('checkTitle (Conventional Commits)', () => {
  it.each([
    'feat: add setlist export',
    'feat(admin): sort users by name (#278)',
    'fix!: drop legacy route',
    'chore(main): release 1.7.0',
    'chore(deps): bump next from 16.0.0 to 16.1.0',
    'ci: bump the github-actions group with 2 updates',
    'docs(plan): record owner decisions',
    'refactor(lib): extract listbox helpers',
    'perf: cache playlist PDFs',
    'test(ci): add contract harness',
    'build: pin node 22',
    'revert: "feat: x"',
    'chore(scripts): reorganize scripts/ into cicd/, db/ and dev/ (#274)',
  ])('accepts %j', (title) => {
    expect(checkTitle(title).ok).toBe(true);
  });

  it.each([
    'added stuff',
    'Feat: capitalised type',
    'feature: unknown type',
    'feat:missing space',
    'feat: ',
    'feat(): empty scope',
    'Merge branch develop into main',
    '',
  ])('rejects %j', (title) => {
    expect(checkTitle(title).ok).toBe(false);
  });

  it('names the allowed types in the failure reason', () => {
    expect(checkTitle('added stuff').reason).toMatch(/feat, fix, perf, docs, chore/);
  });
});

describe('checkPullRequest', () => {
  it('passes only when both the title and the branches pass', () => {
    expect(checkPullRequest({ title: 'feat: x', head: 'feat/1-x', base: 'develop' }).ok).toBe(true);
    expect(checkPullRequest({ title: 'added stuff', head: 'feat/1-x', base: 'develop' }).ok).toBe(false);
    expect(checkPullRequest({ title: 'feat: x', head: 'feat/1-x', base: 'main' }).ok).toBe(false);
  });

  it('reports every failed check', () => {
    const result = checkPullRequest({ title: 'nope', head: 'random', base: 'develop' });
    expect(result.errors).toHaveLength(2);
  });
});
