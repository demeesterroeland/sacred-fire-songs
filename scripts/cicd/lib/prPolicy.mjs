#!/usr/bin/env node
/**
 * Gitflow pull-request policy (Epic 5.1, Story 5.1.5).
 *
 * - Title: Conventional Commit (Release Please derives the version bump and
 *   changelog from the squashed PR title).
 * - Branches: work branches → develop; develop / hotfix/* / Release Please → main;
 *   main → develop is the back-merge after a release or hotfix.
 *
 * Used by .github/workflows/pr-lint.yml (CLI below) and tested by
 * testing/unit/tests/ci/prPolicy.test.ts and docs/testing/gitflow-cicd.feature.
 *
 * CLI: PR_TITLE=… PR_HEAD=… PR_BASE=… node scripts/cicd/lib/prPolicy.mjs
 *      exits 1 and prints the reasons when the pull request breaks the policy.
 */
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const TITLE_TYPES = ['feat', 'fix', 'perf', 'docs', 'chore', 'refactor', 'test', 'build', 'ci', 'style', 'revert'];
export const WORK_PREFIXES = ['feat/', 'fix/', 'chore/', 'docs/'];

const TITLE_RE = new RegExp(`^(${TITLE_TYPES.join('|')})(\\([a-z0-9._/-]+\\))?!?: \\S`);

const DEVELOP_HEADS = [
  ...WORK_PREFIXES.map((p) => (head) => head.startsWith(p) && head.length > p.length),
  (head) => head.startsWith('dependabot/'),
  (head) => head === 'main',
];

const MAIN_HEADS = [
  (head) => head === 'develop',
  (head) => head.startsWith('hotfix/') && head.length > 'hotfix/'.length,
  (head) => head.startsWith('release-please--branches--main'),
];

/** @returns {{ ok: boolean, reason?: string }} */
export function checkTitle(title) {
  if (TITLE_RE.test(title ?? '')) return { ok: true };
  return {
    ok: false,
    reason:
      `PR title "${title ?? ''}" is not a Conventional Commit. Use "<type>(<optional scope>): <description>" ` +
      `with type one of: ${TITLE_TYPES.join(', ')} (lower case), e.g. "feat(admin): sort users by name".`,
  };
}

/** @returns {{ ok: boolean, reason?: string }} */
export function checkBranches(head, base) {
  if (base === 'develop') {
    if (DEVELOP_HEADS.some((allowed) => allowed(head))) return { ok: true };
    return {
      ok: false,
      reason:
        `"${head}" may not be merged into develop. Allowed head branches: ${WORK_PREFIXES.join(', ')}<name>, ` +
        'dependabot/…, or main (back-merge). Hotfixes go to main first.',
    };
  }
  if (base === 'main') {
    if (MAIN_HEADS.some((allowed) => allowed(head))) return { ok: true };
    return {
      ok: false,
      reason:
        `"${head}" may not be merged into main: work branches must target develop. ` +
        'main only accepts develop (release), hotfix/<name> or the Release Please branch.',
    };
  }
  // Stacked PRs into other branches are not policed.
  return { ok: true };
}

/** @returns {{ ok: boolean, errors: string[] }} */
export function checkPullRequest({ title, head, base }) {
  const errors = [checkTitle(title), checkBranches(head, base)].filter((r) => !r.ok).map((r) => r.reason);
  return { ok: errors.length === 0, errors };
}

function main() {
  const pr = { title: process.env.PR_TITLE ?? '', head: process.env.PR_HEAD ?? '', base: process.env.PR_BASE ?? '' };
  const result = checkPullRequest(pr);
  const lines = result.ok
    ? [`✅ PR policy passed: "${pr.title}" (${pr.head} → ${pr.base})`]
    : ['❌ PR policy failed:', ...result.errors.map((e) => `- ${e}`)];
  console.log(lines.join('\n'));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
  if (!result.ok) {
    for (const e of result.errors) console.log(`::error title=PR policy::${e}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
