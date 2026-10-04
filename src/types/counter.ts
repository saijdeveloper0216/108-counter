import type { HistoryEntry } from './history';

export type CounterMode = 'mala' | 'jaap';

export type MalaCounterState = {
  count: number;
  completedMalas: number;
  history: HistoryEntry[];
};

export type JaapCounterState = {
  totalCount: string;
  completedMalas: string;
  history: HistoryEntry[];
};

export type PersistedCounters = {
  mala: MalaCounterState;
  jaap: JaapCounterState;
  /** Last local calendar day (YYYY-MM-DD) the mala counter was tracked for daily reset. */
  malaTrackedDay?: string;
};

export const EMPTY_MALA_STATE: MalaCounterState = {
  count: 0,
  completedMalas: 0,
  history: [],
};

export const EMPTY_JAAP_STATE: JaapCounterState = {
  totalCount: '0',
  completedMalas: '0',
  history: [],
};
