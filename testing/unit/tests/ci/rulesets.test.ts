import { describe, expect, it } from 'vitest';
import { jobNames, loadWorkflow, readRepoJson } from '../../../support/workflowContract';

// Branch rulesets as code (Epic 5.1, Story 5.1.4). The JSON files are applied with
//   gh api -X PUT  repos/<owner>/<repo>/rulesets/<id> --input .github/rulesets/main.json
//   gh api -X POST repos/<owner>/<repo>/rulesets       --input .github/rulesets/develop.json
// These tests keep the required checks in sync with the workflow job ids.

type Rule = { type: string; parameters?: Record<string, unknown> };
type Ruleset = {
  enforcement: string;
  bypass_actors: unknown[];
  conditions: { ref_name: { include: string[] } };
  rules: Rule[];
};

const load = (name: string) => readRepoJson<Ruleset>(`.github/rulesets/${name}.json`);
const rule = (rs: Ruleset, type: string) => rs.rules.find((r) => r.type === type);
const requiredChecks = (rs: Ruleset) =>
  ((rule(rs, 'required_status_checks')?.parameters?.required_status_checks ?? []) as { context: string }[]).map(
    (c) => c.context,
  );
const mergeMethods = (rs: Ruleset) => rule(rs, 'pull_request')?.parameters?.allowed_merge_methods as string[];

describe.each([
  ['main', 'refs/heads/main'],
  ['develop', 'refs/heads/develop'],
])('%s ruleset', (name, ref) => {
  const rs = load(name);

  it(`targets ${ref}, is active and has no bypass actors`, () => {
    expect(rs.conditions.ref_name.include).toEqual([ref]);
    expect(rs.enforcement).toBe('active');
    expect(rs.bypass_actors).toEqual([]);
  });

  it('blocks force pushes and deletion, requires a PR with resolved threads', () => {
    expect(rule(rs, 'non_fast_forward')).toBeDefined();
    expect(rule(rs, 'deletion')).toBeDefined();
    expect(rule(rs, 'pull_request')?.parameters?.required_review_thread_resolution).toBe(true);
  });

  it('requires every ci.yml job plus pr-policy and e2e', () => {
    const expected = [...jobNames(loadWorkflow('ci.yml')), ...jobNames(loadWorkflow('pr-lint.yml')), 'e2e'];
    expect(requiredChecks(rs).sort()).toEqual(expected.sort());
  });

  it('never allows rebase merges', () => {
    expect(mergeMethods(rs)).not.toContain('rebase');
  });
});

describe('merge methods (Gitflow)', () => {
  it('main allows a merge commit for develop → main and squash for hotfixes', () => {
    expect(mergeMethods(load('main')).sort()).toEqual(['merge', 'squash']);
  });

  it('develop allows squash for work branches and a merge commit for the main → develop back-merge', () => {
    expect(mergeMethods(load('develop')).sort()).toEqual(['merge', 'squash']);
  });
});
