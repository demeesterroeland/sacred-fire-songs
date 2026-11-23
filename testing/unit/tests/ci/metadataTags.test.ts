// #602: the tags docker.yml would push, per event (model of docker/metadata-action).
import { describe, expect, it } from 'vitest';
import { loadWorkflow, parseWorkflow } from '../../../support/workflowContract';
import { generatedTags, metadataSteps, RUN_CONTEXTS } from '../../../support/metadataTags';

const docker = loadWorkflow('docker.yml');
const steps = metadataSteps(docker);

describe('metadata-action tag model', () => {
  it('reproduces the latest=auto rule for type=ref,event=tag on a tag ref', () => {
    const wf = parseWorkflow('x.yml', `
on: push
jobs:
  b:
    steps:
      - uses: docker/metadata-action@abc
        with:
          tags: |
            type=ref,event=tag
            type=ref,event=branch
`);
    const [step] = metadataSteps(wf);
    expect(generatedTags(step, RUN_CONTEXTS['release v1.9.1 published'])).toEqual(['v1.9.1', 'latest']);
    expect(generatedTags(step, RUN_CONTEXTS['push to develop'])).toEqual(['develop']);
    step.with = { ...step.with, flavor: 'latest=false' };
    expect(generatedTags(step, RUN_CONTEXTS['release v1.9.1 published'])).toEqual(['v1.9.1']);
  });
});

describe('docker.yml tags (#602)', () => {
  it('has two metadata steps (app and migrator)', () => {
    expect(steps).toHaveLength(2);
  });

  it.each(Object.keys(RUN_CONTEXTS))('%s: no image is tagged latest', (name) => {
    for (const step of steps) expect(generatedTags(step, RUN_CONTEXTS[name]), step.name).not.toContain('latest');
  });

  it('a published release is tagged v1.9.1 and 1.9.1 only', () => {
    for (const step of steps) {
      expect(generatedTags(step, RUN_CONTEXTS['release v1.9.1 published']).sort(), step.name).toEqual(['1.9.1', 'v1.9.1']);
    }
  });

  it('a push to develop is tagged with the short SHA and develop', () => {
    for (const step of steps) {
      expect(generatedTags(step, RUN_CONTEXTS['push to develop']).sort(), step.name).toEqual(['abcdef1', 'develop']);
    }
  });
});
