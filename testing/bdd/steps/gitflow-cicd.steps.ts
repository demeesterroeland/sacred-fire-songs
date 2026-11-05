/**
 * Step definitions for docs/testing/gitflow-cicd.feature (@ci-contract).
 * Run with: npm run test:bdd:ci
 *
 * Written test-first (Epic 5.1, Phase 0): scenarios for stories that are not
 * implemented yet fail (missing workflow/file) or are `pending` (they need an
 * artifact that a later story introduces, e.g. pr-lint or rulesets).
 */
/* eslint-disable @typescript-eslint/no-unused-vars -- Cucumber checks step arity, so unused `_param`s must stay */
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { SongBddWorld } from '../support/world';
import {
  actionRefs,
  allSteps,
  hasTrigger,
  isPinnedToSha,
  jobNames,
  listRepoFiles,
  listWorkflows,
  loadWorkflow,
  readRepoFile,
  readRepoJson,
  readRepoYaml,
  runScripts,
  runsCommand,
  repoFileExists,
  triggerTypes,
  triggersOnAllBranches,
  triggersOnBranch,
  type Workflow,
} from '../../support/workflowContract';
import { checkBranches, checkTitle } from '../../../scripts/cicd/lib/prPolicy.mjs';

export interface CiBddState {
  workflows: Workflow[];
  file?: { path: string; text: string };
  pr?: { head: string; base: string; title: string };
  policy?: { ok: boolean; titleOk: boolean; branchesOk: boolean };
}

type CucumberProfile = { paths?: string[] };

function ci(world: SongBddWorld): CiBddState {
  world.ci ??= { workflows: [] };
  return world.ci;
}

function current(world: SongBddWorld): Workflow {
  const [wf] = ci(world).workflows;
  assert.ok(wf, 'no workflow loaded — start the scenario with Given the workflow "…"');
  return wf;
}

function byFile(world: SongBddWorld, file: string): Workflow {
  const wf = ci(world).workflows.find((w) => w.file === file);
  assert.ok(wf, `workflow ${file} not loaded`);
  return wf;
}

// ── Given ───────────────────────────────────────────────────────────────────
Given('the workflow {string}', function (this: SongBddWorld, file: string) {
  ci(this).workflows = [loadWorkflow(file)];
});

Given('the workflows {string} and {string}', function (this: SongBddWorld, a: string, b: string) {
  ci(this).workflows = [loadWorkflow(a), loadWorkflow(b)];
});

Given('every workflow in {string}', function (this: SongBddWorld, _dir: string) {
  ci(this).workflows = listWorkflows().map((f) => loadWorkflow(f));
});

Given('the file {string}', function (this: SongBddWorld, rel: string) {
  assert.ok(repoFileExists(rel), `${rel} does not exist`);
  ci(this).file = { path: rel, text: readRepoFile(rel) };
});

Given('the repository', function () {
  // The repository root is the default context of the contract helpers.
});

// ── Triggers ────────────────────────────────────────────────────────────────
Then('it triggers on {string} for branches {string} and {string}', function (this: SongBddWorld, event: string, a: string, b: string) {
  const wf = current(this);
  for (const branch of [a, b]) {
    assert.ok(triggersOnBranch(wf, event, branch), `${wf.file} does not trigger on ${event} for ${branch}`);
  }
});

Then('it triggers on {string} for all branches', function (this: SongBddWorld, event: string) {
  const wf = current(this);
  assert.ok(triggersOnAllBranches(wf, event), `${wf.file} does not trigger on ${event} for all branches`);
});

Then('it triggers on {string} to {string}', function (this: SongBddWorld, event: string, branch: string) {
  const wf = current(this);
  assert.ok(triggersOnBranch(wf, event, branch), `${wf.file} does not trigger on ${event} to ${branch}`);
});

Then('it triggers on {string} type {string}', function (this: SongBddWorld, event: string, type: string) {
  const wf = current(this);
  assert.ok(hasTrigger(wf, event), `${wf.file} has no ${event} trigger`);
  assert.ok(triggerTypes(wf, event).includes(type), `${wf.file} ${event} trigger lacks type ${type}`);
});

Then('both have a {string} trigger', function (this: SongBddWorld, event: string) {
  for (const wf of ci(this).workflows) {
    assert.ok(hasTrigger(wf, event), `${wf.file} has no ${event} trigger`);
  }
});

Then('both target the staging URL', function (this: SongBddWorld) {
  for (const wf of ci(this).workflows) {
    assert.match(wf.raw, /STAGING/, `${wf.file} does not reference staging configuration`);
  }
});

// ── Jobs & steps ────────────────────────────────────────────────────────────
Then(
  'it defines the jobs {string}, {string}, {string}, {string} and {string}',
  function (this: SongBddWorld, a: string, b: string, c: string, d: string, e: string) {
    const jobs = [a, b, c, d, e];
    const wf = current(this);
    const names = jobNames(wf);
    const missing = jobs.filter((j) => !names.includes(j));
    assert.deepEqual(missing, [], `${wf.file} is missing jobs: ${missing.join(', ')}`);
  },
);

Then('it runs Playwright with {string}', function (this: SongBddWorld, args: string) {
  const wf = current(this);
  assert.ok(
    allSteps(wf).some((s) => /playwright test/.test(s.run ?? '') && (s.run ?? '').includes(args)),
    `${wf.file} has no "playwright test … ${args}" step`,
  );
});

Then('it reads the Supabase URL from the staging secrets', function (this: SongBddWorld) {
  const wf = current(this);
  assert.match(wf.raw, /secrets\.SUPABASE_(PROJECT_ID|URL)_STAGING/, `${wf.file} does not read the staging Supabase URL from secrets`);
});

Then('it does not contain {string} followed by {string}', function (this: SongBddWorld, first: string, second: string) {
  const wf = current(this);
  const i = wf.raw.indexOf(first);
  assert.ok(i === -1 || wf.raw.indexOf(second, i) === -1, `${wf.file} still contains "${first}" followed by "${second}"`);
});

Then('it only runs after the {string} checks succeeded for the same commit', function (this: SongBddWorld, ciFile: string) {
  const wf = current(this);
  const ciName = loadWorkflow(ciFile).name ?? ciFile;
  const run = wf.on.workflow_run as { workflows?: string[] } | undefined;
  const viaWorkflowRun = !!run?.workflows?.includes(ciName) && /workflow_run\.conclusion\s*==\s*'success'/.test(wf.raw);
  const viaReusable = Object.values(wf.jobs).some((j) => j.uses?.endsWith(ciFile));
  assert.ok(viaWorkflowRun || viaReusable, `${wf.file} is not gated on a successful ${ciFile} run`);
});

// ── Images & environments ───────────────────────────────────────────────────
Then('a push to {string} builds images tagged {string} and the short SHA', function (this: SongBddWorld, branch: string, tag: string) {
  const wf = byFile(this, 'docker.yml');
  assert.ok(triggersOnBranch(wf, 'push', branch), `docker.yml does not build on push to ${branch}`);
  assert.match(wf.raw, /type=ref,event=branch|type=raw,value=develop/, `docker.yml does not tag the ${tag} branch image`);
  assert.match(wf.raw, /type=sha/, 'docker.yml does not tag the short SHA');
});

Then('no image is tagged {string}', function (this: SongBddWorld, tag: string) {
  for (const wf of ci(this).workflows) {
    assert.doesNotMatch(wf.raw, new RegExp(`value=${tag}\\b`), `${wf.file} still tags "${tag}"`);
  }
});

Then('it tags release images with the release version', function (this: SongBddWorld) {
  const wf = current(this);
  assert.match(wf.raw, /type=raw,value=\{\{tag\}\},enable=\$\{\{ github\.event_name == 'release' \}\}/, `${wf.file} does not tag the vX.Y.Z release tag`);
  assert.match(wf.raw, /type=raw,value=\$\{\{ steps\.semver\.outputs\.value \}\}/, `${wf.file} does not tag the X.Y.Z version`);
});

Then('it opens a pull request from {string} into {string}', function (this: SongBddWorld, head: string, base: string) {
  const wf = current(this);
  const scripts = allSteps(wf).map((s) => `${s.run ?? ''} ${JSON.stringify(s.with ?? {})}`).join('\n');
  assert.ok(
    new RegExp(`--base[= ]${base}`).test(scripts) && new RegExp(`--head[= ]${head}`).test(scripts),
    `${wf.file} does not open a PR ${head} → ${base}`,
  );
});

// ── Back-merge main → develop (story 5.1.9) ──────────────────────────────────
Then(
  'it opens the pull request with the secret {string} and fails when it is missing',
  function (this: SongBddWorld, secret: string) {
    const wf = current(this);
    assert.match(wf.raw, new RegExp(`GH_TOKEN:\\s*\\$\\{\\{\\s*secrets\\.${secret}\\s*\\}\\}`), `${wf.file} does not use ${secret} as GH_TOKEN`);
    const script = runScripts(wf).join('\n');
    assert.match(script, /if \[ -z "\$GH_TOKEN" \]; then[\s\S]*?exit 1/, `${wf.file} does not fail closed without ${secret}`);
  },
);

Then(
  'it labels the pull request {string} when main does not merge cleanly',
  function (this: SongBddWorld, label: string) {
    const script = runScripts(current(this)).join('\n');
    assert.match(script, /git merge --no-commit --no-ff/, 'no test merge before labelling');
    assert.match(script, new RegExp(`--add-label ${label}\\b`), `does not add the label "${label}"`);
  },
);

Then('it never merges the pull request itself', function (this: SongBddWorld) {
  const wf = current(this);
  assert.doesNotMatch(runScripts(wf).join('\n'), /gh pr merge/, `${wf.file} merges the back-merge PR itself`);
});

Then(
  '{string} only runs after a successful {string} run on {string}',
  function (this: SongBddWorld, file: string, buildName: string, branch: string) {
    const wf = byFile(this, file);
    const run = wf.on.workflow_run as { workflows?: string[]; types?: string[]; branches?: string[] } | undefined;
    assert.ok(run?.workflows?.includes(buildName), `${file} is not triggered by the "${buildName}" workflow`);
    assert.ok(run?.types?.includes('completed'), `${file} must trigger on completed "${buildName}" runs`);
    assert.ok(run?.branches?.includes(branch), `${file} is not limited to "${branch}" builds`);
    assert.match(wf.raw, /workflow_run\.conclusion\s*==\s*'success'/, `${file} does not require a successful build`);
  },
);

// ── No deployment from this public repo (story 5.1.7) ───────────────────────────────────
const sshCommands = (wf: Workflow) =>
  runScripts(wf)
    .flatMap((r) => r.split('\n'))
    .map((l) => l.trim())
    .filter((l) => /(^|\s)ssh\s/.test(l));

Then('no workflow opens an SSH connection', function (this: SongBddWorld) {
  for (const wf of ci(this).workflows) {
    assert.deepEqual(sshCommands(wf), [], `${wf.file} opens an SSH connection`);
  }
});

Then('no workflow uses a deployment environment', function (this: SongBddWorld) {
  for (const wf of ci(this).workflows) {
    assert.doesNotMatch(wf.raw, /^\s+environment:/m, `${wf.file} uses a GitHub deployment environment`);
  }
});

Then('no workflow file name starts with {string}', function (this: SongBddWorld, prefix: string) {
  const deploys = ci(this).workflows.map((w) => w.file).filter((f) => f.startsWith(prefix));
  assert.deepEqual(deploys, [], `deployment workflows belong outside this public repo: ${deploys.join(', ')}`);
});

Then(
  'it has a job {string} that fails when the secret {string} is missing',
  function (this: SongBddWorld, job: string, secret: string) {
    const wf = current(this);
    assert.ok(wf.jobs[job], `${wf.file} has no job "${job}"`);
    const script = runScripts({ ...wf, jobs: { [job]: wf.jobs[job] } } as Workflow).join('\n');
    assert.match(wf.raw, new RegExp(`secrets\\.${secret}\\b`), `${wf.file} does not read ${secret}`);
    assert.match(script, /if \[ -z "\$DENYLIST" \]; then[\s\S]*?exit 1/, `job "${job}" does not fail closed`);
  },
);

// ── Fail-closed E2E (story 5.1.2) ───────────────────────────────────────────
When('the required staging secrets are absent', function () {
  // Static contract: inspected in the Then step below.
});

Then('the job fails with a clear {string} error instead of being skipped', function (this: SongBddWorld, message: string) {
  const wf = current(this);
  const check = allSteps(wf).find((s) => /MISSING/.test(s.run ?? ''));
  assert.ok(check, `${wf.file} has no secret availability check`);
  assert.match(check.run ?? '', new RegExp(message, 'i'), `${wf.file} secret check does not report "${message}"`);
  assert.match(check.run ?? '', /exit 1/, `${wf.file} secret check does not fail the job`);
  assert.doesNotMatch(check.run ?? '', /secrets_available=false/, `${wf.file} still skips instead of failing`);
});

// ── Supply chain (story 5.1.12) ─────────────────────────────────────────────
Then('every {string} reference to a third-party action is pinned to a 40-character commit SHA', function (this: SongBddWorld, _uses: string) {
  const unpinned = ci(this).workflows.flatMap((wf) => actionRefs(wf).filter((r) => !isPinnedToSha(r)).map((r) => `${wf.file}: ${r}`));
  assert.deepEqual(unpinned, [], `unpinned actions:\n${unpinned.join('\n')}`);
});

Then('every workflow declares top-level {string}', function (this: SongBddWorld, key: string) {
  const missing = ci(this).workflows.filter((wf) => key === 'permissions' && wf.permissions === undefined).map((wf) => wf.file);
  assert.deepEqual(missing, [], `workflows without top-level ${key}: ${missing.join(', ')}`);
});

Then('it has update entries for {string} and {string} targeting {string}', function (this: SongBddWorld, a: string, b: string, branch: string) {
  const file = ci(this).file;
  assert.ok(file, 'no file loaded');
  const cfg = readRepoYaml<{ updates?: { 'package-ecosystem': string; 'target-branch'?: string }[] }>(file.path);
  for (const eco of [a, b]) {
    const entry = cfg.updates?.find((u) => u['package-ecosystem'] === eco);
    assert.ok(entry, `${file.path} has no ${eco} entry`);
    assert.equal(entry['target-branch'], branch, `${file.path} ${eco} does not target ${branch}`);
  }
});

// ── Test tree & Cucumber wiring (story 5.1.3) ───────────────────────────────
Then('no {string} file exists in {string}', function (this: SongBddWorld, glob: string, dir: string) {
  const suffix = glob.replace(/^\*/, '');
  const found = listRepoFiles(dir, new RegExp(`${suffix.replace(/\./g, '\\.')}$`));
  assert.deepEqual(found, [], `${dir} still contains: ${found.join(', ')}`);
});

Then('{string} runs {string}', function (this: SongBddWorld, script: string, target: string) {
  const pkg = readRepoJson<{ scripts: Record<string, string> }>('package.json');
  const name = script.replace(/^npm (run )?/, '');
  assert.ok(pkg.scripts[name]?.includes(target), `"${script}" (${pkg.scripts[name]}) does not run ${target}`);
});

Then('the default profile includes {string}', function (this: SongBddWorld, feature: string) {
  const cfg = readRepoJson<Record<string, CucumberProfile>>('cucumber.json');
  assert.ok(cfg.default?.paths?.includes(feature), `cucumber.json default profile does not include ${feature}`);
});

Then('it includes {string}', function (this: SongBddWorld, feature: string) {
  const cfg = readRepoJson<Record<string, CucumberProfile>>('cucumber.json');
  const included = Object.values(cfg).some((p) => p.paths?.includes(feature));
  assert.ok(included, `no cucumber.json profile includes ${feature}`);
});

// ── PR policy (story 5.1.5): pr-lint.yml runs scripts/cicd/lib/prPolicy.mjs ──
Given('a pull request from {string} into {string}', function (this: SongBddWorld, head: string, base: string) {
  ci(this).pr = { head, base, title: 'chore: placeholder title' };
});

Given('a pull request titled {string}', function (this: SongBddWorld, title: string) {
  ci(this).pr = { head: 'feat/1-placeholder', base: 'develop', title };
});

When('the {string} workflow runs', function (this: SongBddWorld, name: string) {
  const wf = loadWorkflow(`${name}.yml`);
  for (const base of ['develop', 'main']) {
    assert.ok(triggersOnBranch(wf, 'pull_request', base), `${wf.file} does not run on PRs into ${base}`);
  }
  assert.ok(runsCommand(wf, 'scripts/cicd/lib/prPolicy.mjs'), `${wf.file} does not run the PR policy module`);
  assert.doesNotMatch(wf.raw, /run:[^\n]*\$\{\{\s*github\.event\.pull_request/, `${wf.file} inlines untrusted PR data into run:`);
  const pr = ci(this).pr;
  assert.ok(pr, 'no pull request in this scenario');
  const titleOk = checkTitle(pr.title).ok;
  const branchesOk = checkBranches(pr.head, pr.base).ok;
  ci(this).policy = { ok: titleOk && branchesOk, titleOk, branchesOk };
});

Then('the policy check is {string}', function (this: SongBddWorld, result: string) {
  const { pr, policy } = ci(this);
  assert.ok(pr && policy, 'the pr-lint workflow did not run');
  assert.equal(policy.branchesOk ? 'pass' : 'fail', result, `${pr.head} → ${pr.base}`);
});

Then('the title check fails', function (this: SongBddWorld) {
  const { pr, policy } = ci(this);
  assert.ok(pr && policy, 'the pr-lint workflow did not run');
  assert.equal(policy.titleOk, false, `title "${pr.title}" unexpectedly passed`);
});

// ── Documentation describes Gitflow (story 5.1.13) ──────────────────────────
/** File text without the changelog table rows (they keep historic wording). */
function bodyText(world: SongBddWorld): { path: string; body: string } {
  const file = ci(world).file;
  assert.ok(file, 'no file loaded — start the scenario with Given the file "…"');
  const body = file.text
    .split('\n')
    .filter((l) => !/^\|\s*\*\*\d+\.\d+\*\*\s*\|/.test(l))
    .join('\n');
  return { path: file.path, body };
}

Then(
  'outside its changelog it mentions {string}, {string}, {string} and {string}',
  function (this: SongBddWorld, a: string, b: string, c: string, d: string) {
    const { path, body } = bodyText(this);
    for (const term of [a, b, c, d]) assert.ok(body.includes(term), `${path} does not mention "${term}"`);
  },
);

Then(
  'outside its changelog it never says {string} or {string}',
  function (this: SongBddWorld, a: string, b: string) {
    const { path, body } = bodyText(this);
    for (const term of [a, b]) {
      assert.ok(!body.toLowerCase().includes(term.toLowerCase()), `${path} still says "${term}"`);
    }
  },
);

Then('it has a {string} header and a changelog table', function (this: SongBddWorld, header: string) {
  const { path } = bodyText(this);
  const text = ci(this).file?.text ?? '';
  assert.ok(text.includes(header), `${path} has no ${header} header`);
  assert.match(text, /^\|\s*\*\*\d+\.\d+\*\*\s*\|/m, `${path} has no changelog table`);
});

// ── Need artifacts from later stories → pending until then ──────────────────
Then('the required checks include the full E2E suite against staging', function () {
  return 'pending'; // story 5.1.8: ruleset contract for PRs into main
});

Then('the required checks include the k6 performance thresholds', function () {
  return 'pending'; // story 5.1.8
});
