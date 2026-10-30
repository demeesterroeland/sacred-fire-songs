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
  repoFileExists,
  stepIndex,
  triggerTypes,
  triggersOnAllBranches,
  triggersOnBranch,
  usesEnvironment,
  type Workflow,
} from '../../support/workflowContract';

export interface CiBddState {
  workflows: Workflow[];
  file?: { path: string; text: string };
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
  function (this: SongBddWorld, ...jobs: string[]) {
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

Then('it runs {string} before deploying the app', function (this: SongBddWorld, cmd: string) {
  const wf = byFile(this, 'deploy-staging.yml');
  const migrate = stepIndex(wf, cmd);
  const deploy = stepIndex(wf, 'docker compose');
  assert.ok(migrate >= 0, `${wf.file} never runs "${cmd}"`);
  assert.ok(deploy > migrate, `${wf.file} must run "${cmd}" before "docker compose"`);
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

Then('{string} uses the environment {string}', function (this: SongBddWorld, file: string, env: string) {
  assert.ok(usesEnvironment(byFile(this, file), env), `${file} does not use environment ${env}`);
});

Then('it uses the environment {string}', function (this: SongBddWorld, env: string) {
  const wf = current(this);
  assert.ok(usesEnvironment(wf, env), `${wf.file} does not use environment ${env}`);
});

Then('it deploys the explicit release tag, never {string}', function (this: SongBddWorld, tag: string) {
  const wf = current(this);
  assert.match(wf.raw, /github\.event\.release\.tag_name|release_tag|tag_name/, `${wf.file} does not deploy the release tag`);
  assert.doesNotMatch(wf.raw, new RegExp(`:${tag}\\b`), `${wf.file} references :${tag}`);
});

Then('it opens a pull request from {string} into {string}', function (this: SongBddWorld, head: string, base: string) {
  const wf = current(this);
  const scripts = allSteps(wf).map((s) => `${s.run ?? ''} ${JSON.stringify(s.with ?? {})}`).join('\n');
  assert.ok(
    new RegExp(`--base[= ]${base}`).test(scripts) && new RegExp(`--head[= ]${head}`).test(scripts),
    `${wf.file} does not open a PR ${head} → ${base}`,
  );
});

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

// ── Need artifacts from later stories → pending until then ──────────────────
Given('a pull request from {string} into {string}', function (_head: string, _base: string) {
  return 'pending'; // story 5.1.5: PR policy module used by pr-lint.yml
});

Given('a pull request titled {string}', function (_title: string) {
  return 'pending'; // story 5.1.5
});

When('the {string} workflow runs', function (_name: string) {
  return 'pending'; // story 5.1.5
});

Then('the policy check is {string}', function (_result: string) {
  return 'pending'; // story 5.1.5
});

Then('the title check fails', function () {
  return 'pending'; // story 5.1.5
});

Then('the required checks include the full E2E suite against staging', function () {
  return 'pending'; // story 5.1.8: ruleset contract for PRs into main
});

Then('the required checks include the k6 performance thresholds', function () {
  return 'pending'; // story 5.1.8
});
