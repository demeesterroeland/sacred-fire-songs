import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import type { ChordProSection } from '@/lib/chordUtils';
import type { ParsedChordPro } from '@/lib/chordProParsing';

export class SongBddWorld extends World {
  public rawContent = '';
  public convertedContent = '';
  public parsedMetadata?: ParsedChordPro;
  public displaySections: ChordProSection[] = [];

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(SongBddWorld);
