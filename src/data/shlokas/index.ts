import readings from './readings.json';
import type { ShlokaEntry } from '../../types/content';

export const allShlokas = readings as ShlokaEntry[];
export const shlokasByCategory = {
  harathi: allShlokas.filter(s => s.category === 'harathi'),
  chalisa: allShlokas.filter(s => s.category === 'chalisa'),
  mantra: allShlokas.filter(s => s.category === 'mantra'),
  ashtakam: allShlokas.filter(s => s.category === 'ashtakam'),
  stotra: allShlokas.filter(s => s.category === 'stotra'),
};
