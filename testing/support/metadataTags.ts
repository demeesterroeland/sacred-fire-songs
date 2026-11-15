/**
 * Model of the tags `docker/metadata-action` generates for a workflow step (#602).
 *
 * The contract tests used to search docker.yml for the text `value=latest`. That
 * missed the real cause: with the default flavor `latest=auto`, metadata-action
 * adds `latest` on its own for a tag ref when the step has a `type=ref,event=tag`
 * (or semver / pep440 / match) entry. This model reproduces the rules for the
 * entry types docker.yml uses, so the tests check the tags a run would push.
 */
import { allSteps, type Workflow, type WorkflowStep } from './workflowContract';

export interface RunContext {
  event: 'push' | 'release' | 'workflow_dispatch';
  /** Full ref, e.g. refs/heads/develop or refs/tags/v1.9.1. */
  ref: string;
  sha: string;
  inputs?: Record<string, string>;
}

const TAG_PREFIX = 'refs/tags/';
const BRANCH_PREFIX = 'refs/heads/';
const LATEST_AUTO_TYPES = new Set(['semver', 'pep440', 'match', 'ref:tag']);

export function refName(ref: string): string {
  return ref.replace(/^refs\/(heads|tags)\//, '');
}

/** Outputs of earlier steps that docker.yml reads (only `steps.semver`). */
function stepOutputs(ctx: RunContext): Record<string, string> {
  return {
    'steps.semver.outputs.value': ctx.event === 'release' || ctx.ref.startsWith(`${TAG_PREFIX}v`) ? refName(ctx.ref).replace(/^v/, '') : '',
  };
}

/** Evaluates the small subset of GitHub expressions docker.yml uses. */
export function evalExpression(expr: string, ctx: RunContext): unknown {
  const outputs = stepOutputs(ctx);
  const values: Record<string, string> = {
    'github.event_name': ctx.event,
    'github.ref': ctx.ref,
    'github.ref_name': refName(ctx.ref),
    'steps.semver.outputs.value': outputs['steps.semver.outputs.value'],
  };
  let js = expr.replace(/inputs\.([A-Za-z_][\w-]*)/g, (_m, k: string) => JSON.stringify(ctx.inputs?.[k] ?? ''));
  for (const [k, v] of Object.entries(values)) js = js.split(k).join(JSON.stringify(v));
  js = js.replace(/!=/g, '!==').replace(/([^!=])==/g, '$1===');
  if (/[^\s\w"'().,|&!=/*-]/.test(js.replace(/"[^"]*"|'[^']*'/g, ''))) throw new Error(`unsupported expression: ${expr}`);
  return new Function('startsWith', `return (${js});`)((s: string, p: string) => String(s).startsWith(p));
}

function interpolate(text: string, ctx: RunContext): string {
  return text.replace(/\$\{\{\s*([\s\S]*?)\s*\}\}/g, (_m, e: string) => String(evalExpression(e, ctx) ?? ''));
}

function parseAttrs(line: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const part of line.split(',')) {
    const i = part.indexOf('=');
    if (i > 0) attrs[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return attrs;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
}

/** Flavor `latest` setting of a metadata step (default `auto`). */
export function latestFlavor(step: WorkflowStep): 'auto' | 'true' | 'false' {
  const flavor = String(step.with?.flavor ?? '');
  const m = flavor.match(/^\s*latest\s*=\s*(auto|true|false)\s*$/m);
  return (m?.[1] as 'auto' | 'true' | 'false') ?? 'auto';
}

/** Tag names (without image) the metadata step generates for `ctx`. */
export function generatedTags(step: WorkflowStep, ctx: RunContext): string[] {
  const lines = String(step.with?.tags ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  const isTag = ctx.ref.startsWith(TAG_PREFIX);
  const isBranch = ctx.ref.startsWith(BRANCH_PREFIX);
  const tags: string[] = [];
  let latestCandidate = false;
  for (const line of lines) {
    const raw = interpolate(line, ctx);
    const a = parseAttrs(raw);
    if (a.enable !== undefined && a.enable !== 'true') continue;
    let value = '';
    let kind = a.type;
    if (a.type === 'sha') value = a.format === 'long' ? ctx.sha : ctx.sha.slice(0, 7);
    else if (a.type === 'ref' && a.event === 'branch') value = isBranch ? slug(refName(ctx.ref)) : '';
    else if (a.type === 'ref' && a.event === 'tag') { value = isTag ? refName(ctx.ref) : ''; kind = 'ref:tag'; }
    else if (a.type === 'raw') value = (a.value ?? '').replace('{{tag}}', isTag ? refName(ctx.ref) : '');
    else throw new Error(`metadataTags: unsupported entry "${line}"`);
    if (a.prefix && value) value = a.prefix + value;
    if (!value) continue;
    tags.push(value);
    if (isTag && LATEST_AUTO_TYPES.has(kind)) latestCandidate = true;
  }
  const flavor = latestFlavor(step);
  if (flavor === 'true' || (flavor === 'auto' && latestCandidate)) tags.push('latest');
  return [...new Set(tags)];
}

export function metadataSteps(wf: Workflow): WorkflowStep[] {
  return allSteps(wf).filter((s) => s.uses?.startsWith('docker/metadata-action@'));
}

/** Events docker.yml runs on. Job and step `if:` conditions are not modelled: every metadata step is checked for every event. */
export const RUN_CONTEXTS: Record<string, RunContext> = {
  'push to develop': { event: 'push', ref: 'refs/heads/develop', sha: 'abcdef1234567890' },
  'push to main': { event: 'push', ref: 'refs/heads/main', sha: 'abcdef1234567890' },
  'push of tag v1.9.1': { event: 'push', ref: 'refs/tags/v1.9.1', sha: 'abcdef1234567890' },
  'release v1.9.1 published': { event: 'release', ref: 'refs/tags/v1.9.1', sha: 'abcdef1234567890' },
  'manual run with version preview': { event: 'workflow_dispatch', ref: 'refs/heads/develop', sha: 'abcdef1234567890', inputs: { version: 'preview' } },
};
