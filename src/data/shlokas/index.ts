import { hanumanChalisa } from './hanumanChalisa';
import { otherShlokas } from './otherMantras';
import { additionalShlokas } from './additionalMantras';
import { harathiShlokas } from './harathiShlokas';
import { completeShlokaLanguages } from './languages/merge';
import type { ShlokaEntry, ShlokaSource } from '../../types/content';

const MANTRA_META: Record<string, Pick<ShlokaEntry, 'description' | 'deity'>> = {
  'mrityunjaya-mantra': {
    deity: 'Lord Shiva',
    description: 'Maha Mrityunjaya — healing, protection, and liberation from fear of death.',
  },
  'krishna-mantra': {
    deity: 'Lord Krishna',
    description: 'Salutations to Vasudeva Krishna, supreme soul and refuge of devotees.',
  },
  'kubera-mantra': {
    deity: 'Lord Kubera',
    description: 'Invoked for prosperity, abundance, and righteous wealth.',
  },
  'navagraha-mantra': {
    deity: 'Nine Planets',
    description: 'Honours Surya, Chandra, Mangal, Budha, Guru, Shukra, Shani, Rahu, and Ketu.',
  },
  'gayatri-mantra': {
    deity: 'Savitr / Sun',
    description: 'Universal Vedic mantra for illumination of intellect and spiritual light.',
  },
  'om-namah-shivaya': {
    deity: 'Lord Shiva',
    description: 'Panchakshari — five-syllable mantra of peace and inner transformation.',
  },
  'ganesh-mantra': {
    deity: 'Lord Ganesha',
    description: 'Removes obstacles before puja, travel, or new beginnings.',
  },
  'durga-mantra': {
    deity: 'Goddess Durga',
    description: 'Protection from harm and strength through the Divine Mother.',
  },
  'vishnu-mantra': {
    deity: 'Lord Vishnu',
    description: 'Praise of the preserver who sustains the cosmos in yogic sleep.',
  },
  'saraswati-vandana': {
    deity: 'Goddess Saraswati',
    description: 'Sung on Vasant Panchami and before study — wisdom and learning.',
  },
  'shanti-mantra': {
    deity: 'Universal',
    description: 'Peace prayer from the Upanishads for all beings.',
  },
  'lalitha-panchakshari': {
    deity: 'Goddess Lalita',
    description: 'Five-syllable mantra of Tripura Sundari — beauty and grace.',
  },
};

type MantraDraft = Omit<ShlokaSource, 'category' | 'description'> &
  Partial<Pick<ShlokaSource, 'description' | 'deity'>>;

function enrichMantras(entries: MantraDraft[]): ShlokaEntry[] {
  return entries.map((entry) =>
    completeShlokaLanguages({
      ...entry,
      category: 'mantra',
      description:
        MANTRA_META[entry.id]?.description ??
        entry.description ??
        'Sacred mantra for daily japa and devotion.',
      deity: MANTRA_META[entry.id]?.deity ?? entry.deity,
    }),
  );
}

export const allShlokas: ShlokaEntry[] = [
  completeShlokaLanguages(hanumanChalisa),
  ...enrichMantras(otherShlokas),
  ...enrichMantras(additionalShlokas),
  ...harathiShlokas.map(completeShlokaLanguages),
];

export const shlokasByCategory = {
  harathi: allShlokas.filter((s) => s.category === 'harathi'),
  chalisa: allShlokas.filter((s) => s.category === 'chalisa'),
  mantra: allShlokas.filter((s) => s.category === 'mantra'),
};
