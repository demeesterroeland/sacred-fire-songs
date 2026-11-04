/**
 * Hooks for docs/testing/offline-library.feature (Epic 4.3, #357).
 *
 * Scenarios tagged @wip have no step code yet: every one of their steps is
 * registered below as a pending step, so Cucumber reports them as pending, never
 * as passed (and never as undefined, which would fail the run). When a story is
 * built, it adds real step definitions test-first and removes @wip from its
 * scenarios in the feature file; the pending stand-ins then disappear.
 * Step texts are story specific on purpose: they must not collide with the
 * steps of the other feature files (all steps share one global registry).
 */
import { Before, After, Given } from '@cucumber/cucumber';
import { readFileSync } from 'node:fs';
import { AstBuilder, GherkinClassicTokenMatcher, Parser, compile } from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';
import type { World } from '@cucumber/cucumber';
import type { IDBFactory } from 'fake-indexeddb';
import { installFreshIndexedDb } from '../support/offlineLibraryHarness';

export interface OfflineLibraryState {
  idb: IDBFactory;
}
export type OfflineLibraryWorld = World & { offlineLibrary: OfflineLibraryState };

Before({ tags: '@offline-library' }, function (this: OfflineLibraryWorld) {
  this.offlineLibrary = { idb: installFreshIndexedDb() };
});

After({ tags: '@offline-library' }, function () {
  delete (globalThis as { indexedDB?: unknown }).indexedDB;
});

const FEATURE_PATH = 'docs/testing/offline-library.feature';

/** Unique step texts of the @wip scenarios, with Scenario Outline examples expanded. */
function wipStepTexts(): string[] {
  const ids = IdGenerator.uuid();
  const parser = new Parser(new AstBuilder(ids), new GherkinClassicTokenMatcher());
  const doc = parser.parse(readFileSync(FEATURE_PATH, 'utf8'));
  const pickles = compile(doc, FEATURE_PATH, ids);
  const texts = new Set<string>();
  for (const pickle of pickles) {
    if (!pickle.tags.some((tag) => tag.name === '@wip')) continue;
    for (const step of pickle.steps) texts.add(step.text);
  }
  return [...texts];
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const text of wipStepTexts()) {
  // Given/When/Then are interchangeable keywords in Cucumber's registry.
  Given(new RegExp(`^${escapeRegExp(text)}$`), function () {
    return 'pending';
  });
}
