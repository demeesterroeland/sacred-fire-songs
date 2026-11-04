import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import type { ChordProSection } from '@/lib/chordUtils';
import type { ParsedChordPro } from '@/lib/chordProParsing';
import type { AdminBddState } from '../steps/admin-users.steps';
import type { CiBddState } from '../steps/gitflow-cicd.steps';

export class SongBddWorld extends World {
  public rawContent = '';
  public convertedContent = '';
  public parsedMetadata?: ParsedChordPro;
  public displaySections: ChordProSection[] = [];
  /** Scenario state for docs/testing/admin-users.feature (see admin-users.steps.ts). */
  public admin?: AdminBddState;
  /** Scenario state for docs/testing/gitflow-cicd.feature (see gitflow-cicd.steps.ts). */
  public ci?: CiBddState;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(SongBddWorld);
