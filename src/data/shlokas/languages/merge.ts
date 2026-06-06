import type { Language, ShlokaEntry, ShlokaSource } from '../../../types/content';
import { SHLOKA_LANGUAGES } from '../../../types/content';
import { kannadaVerses } from './kannada';
import { malayalamVerses } from './malayalam';
import { tamilVerses } from './tamil';

const SOUTH_INDIAN_SUPPLEMENTS: Partial<Record<Language, Record<string, string[]>>> = {
  tamil: tamilVerses,
  kannada: kannadaVerses,
  malayalam: malayalamVerses,
};

export function completeShlokaLanguages(source: ShlokaSource): ShlokaEntry {
  const languages = {} as Record<Language, string[]>;

  for (const lang of SHLOKA_LANGUAGES) {
    const lines = source.languages[lang] ?? SOUTH_INDIAN_SUPPLEMENTS[lang]?.[source.id];
    if (!lines?.length) {
      throw new Error(`Missing ${lang} verses for shloka "${source.id}"`);
    }
    languages[lang] = lines;
  }

  return { ...source, languages };
}
