/**
 * Workflow contract helpers for the Gitflow CI/CD migration (Epic 5.1).
 *
 * Reads `.github/workflows/*.yml` (and other repo files) as data so that
 * Vitest contract tests and the Cucumber `ci` profile
 * (docs/testing/gitflow-cicd.feature, @ci-contract) can assert the shape of
 * the pipeline without running GitHub Actions.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export const REPO_ROOT = path.resolve(__dirname, '../..');
export const WORKFLOW_DIR = path.join(REPO_ROOT, '.github/workflows');

type Dict = Record<string, unknown>;

export interface WorkflowStep {
  name?: string;
  uses?: string;
  run?: string;
  with?: Dict;
  env?: Dict;
  if?: string;
}

export interface WorkflowJob {
  name?: string;
  needs?: string | string[];
  environment?: string | { name: string };
  permissions?: unknown;
  steps?: WorkflowStep[];
  uses?: string;
  if?: string;
}

export interface Workflow {
  file: string;
  raw: string;
  name?: string;
  on: Dict;
  permissions?: unknown;
  jobs: Record<string, WorkflowJob>;
}

export function workflowExists(file: string, dir = WORKFLOW_DIR): boolean {
  return existsSync(path.join(dir, file));
}

export function loadWorkflow(file: string, dir = WORKFLOW_DIR): Workflow {
  const full = path.join(dir, file);
  if (!existsSync(full)) {
    throw new Error(`Workflow ${file} does not exist in ${path.relative(REPO_ROOT, dir) || dir}`);
  }
  const raw = readFileSync(full, 'utf8');
  return parseWorkflow(file, raw);
}

export function parseWorkflow(file: string, raw: string): Workflow {
  const doc = (parse(raw) ?? {}) as Dict;
  return {
    file,
    raw,
    name: doc.name as string | undefined,
    on: normalizeTriggers(doc.on),
    permissions: doc.permissions,
    jobs: (doc.jobs ?? {}) as Record<string, WorkflowJob>,
  };
}

export function listWorkflows(dir = WORKFLOW_DIR): string[] {
  return readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort();
}

/** `on: push` / `on: [push, pull_request]` / `on: {push: …}` → object form. */
export function normalizeTriggers(on: unknown): Dict {
  if (typeof on === 'string') return { [on]: null };
  if (Array.isArray(on)) return Object.fromEntries(on.map((e) => [String(e), null]));
  return (on ?? {}) as Dict;
}

export function hasTrigger(wf: Workflow, event: string): boolean {
  return Object.prototype.hasOwnProperty.call(wf.on, event);
}

/** Branch filter for an event; `null` means "no filter" (all branches). */
export function triggerBranches(wf: Workflow, event: string): string[] | null {
  if (!hasTrigger(wf, event)) throw new Error(`${wf.file} has no "${event}" trigger`);
  const cfg = wf.on[event] as Dict | null;
  if (!cfg || cfg.branches === undefined) return null;
  return ([] as string[]).concat(cfg.branches as string[]);
}

export function triggersOnBranch(wf: Workflow, event: string, branch: string): boolean {
  if (!hasTrigger(wf, event)) return false;
  const branches = triggerBranches(wf, event);
  if (branches === null) return true;
  return branches.some((pattern) => globMatch(pattern, branch));
}

export function triggersOnAllBranches(wf: Workflow, event: string): boolean {
  if (!hasTrigger(wf, event)) return false;
  const branches = triggerBranches(wf, event);
  return branches === null || branches.includes('**');
}

export function triggerTypes(wf: Workflow, event: string): string[] {
  const cfg = wf.on[event] as Dict | null;
  if (!cfg || cfg.types === undefined) return [];
  return ([] as string[]).concat(cfg.types as string[]);
}

/** GitHub branch-filter glob: `*` matches within a segment, `**` across segments. */
export function globMatch(pattern: string, value: string): boolean {
  const re = pattern
    .split('**')
    .map((part) => part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'))
    .join('.*');
  return new RegExp(`^${re}$`).test(value);
}

export function jobNames(wf: Workflow): string[] {
  return Object.keys(wf.jobs);
}

export function jobEnvironment(job: WorkflowJob): string | undefined {
  if (!job.environment) return undefined;
  return typeof job.environment === 'string' ? job.environment : job.environment.name;
}

export function usesEnvironment(wf: Workflow, env: string): boolean {
  return Object.values(wf.jobs).some((j) => jobEnvironment(j) === env);
}

export function allSteps(wf: Workflow): WorkflowStep[] {
  return Object.values(wf.jobs).flatMap((j) => j.steps ?? []);
}

export function runScripts(wf: Workflow): string[] {
  return allSteps(wf)
    .map((s) => s.run)
    .filter((r): r is string => typeof r === 'string');
}

export function runsCommand(wf: Workflow, needle: string): boolean {
  return runScripts(wf).some((r) => r.includes(needle));
}

/** Index of the first step (over all jobs, in order) whose `run` contains `needle`; -1 if none. */
export function stepIndex(wf: Workflow, needle: string): number {
  return allSteps(wf).findIndex((s) => (s.run ?? '').includes(needle) || (s.uses ?? '').includes(needle));
}

/** Third-party action refs (`owner/repo@ref`), excluding local (`./…`) and `docker://`. */
export function actionRefs(wf: Workflow): string[] {
  const refs = [
    ...allSteps(wf).map((s) => s.uses),
    ...Object.values(wf.jobs).map((j) => j.uses),
  ];
  return refs.filter((u): u is string => !!u && !u.startsWith('./') && !u.startsWith('docker://'));
}

export function isPinnedToSha(ref: string): boolean {
  return /@[0-9a-f]{40}$/.test(ref);
}

export function readRepoFile(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, rel), 'utf8');
}

export function readRepoJson<T = unknown>(rel: string): T {
  return JSON.parse(readRepoFile(rel)) as T;
}

export function readRepoYaml<T = unknown>(rel: string): T {
  return parse(readRepoFile(rel)) as T;
}

export function repoFileExists(rel: string): boolean {
  return existsSync(path.join(REPO_ROOT, rel));
}

export function listRepoFiles(relDir: string, pattern: RegExp): string[] {
  const dir = path.join(REPO_ROOT, relDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => pattern.test(f));
}
