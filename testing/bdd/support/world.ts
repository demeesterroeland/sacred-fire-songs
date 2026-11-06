import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import type { ChordProSection } from '@/lib/chordUtils';
import type { ParsedChordPro } from '@/lib/chordProParsing';
import type { AdminBddState } from '../steps/admin-users.steps';
import type { CiBddState } from '../steps/gitflow-cicd.steps';
import type { AccessBddState } from '../steps/access-policies.steps';

export class SongBddWorld extends World {
  public rawContent = '';
  public convertedContent = '';
  public parsedMetadata?: ParsedChordPro;
  public displaySections: ChordProSection[] = [];
  /** Scenario state for docs/testing/admin-users.feature (see admin-users.steps.ts). */
  public admin?: AdminBddState;
  /** Scenario state for docs/testing/gitflow-cicd.feature (see gitflow-cicd.steps.ts). */
  public ci?: CiBddState;
  /** Scenario state for docs/testing/access-policies.feature (see access-policies.steps.ts). */
  public access?: AccessBddState;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(SongBddWorld);
