import { TOTAL_COUNT } from './theme';

export const MALA_BEADS = TOTAL_COUNT;

/** One crore (1,00,00,000) — used in copy and formatting context. */
export const ONE_CRORE = 10_000_000;

/** Upper limit for continuous naam jaap counting (10 crore). */
export const MAX_JAAP_COUNT = 10 * ONE_CRORE;

export const COUNTERS_STORAGE_KEY = '@108counter/counters';
export const LEGACY_COUNTER_STORAGE_KEY = '@108counter/state';

export const COUNTER_MODE_LABELS = {
  mala: '108 Mala',
  jaap: 'Naam jaap',
} as const;
