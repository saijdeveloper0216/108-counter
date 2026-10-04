import { MALA_BEADS } from '../constants/counter';
import { EMPTY_JAAP_STATE, EMPTY_MALA_STATE, type CounterMode, type PersistedCounters } from '../types/counter';
import type { HistoryEntry } from '../types/history';
import { getLocalDayKey } from './date';
import { normalizeChantCount, incrementChantCount, decrementChantCount, divideChantCount } from './chantCount';

export type LiveCounters = PersistedCounters & { showCompletion: boolean };
export type CounterAction =
  | { type: 'hydrate'; state: PersistedCounters }
  | { type: 'dailyReset'; day: string }
  | { type: 'increment'; mode: CounterMode; at: string; id: string }
  | { type: 'undo' | 'resetCount' | 'resetMalas' | 'resetAll'; mode: CounterMode }
  | { type: 'nextRound' }
  | { type: 'clearHistory'; mode: CounterMode };

export const INITIAL_COUNTERS: LiveCounters = {
  mala: EMPTY_MALA_STATE, jaap: EMPTY_JAAP_STATE, showCompletion: false,
};

function safeCount(value: unknown, max: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(max, Math.floor(value))) : 0;
}

function safeHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry) => entry && typeof entry.id === 'string'
    && typeof entry.completedAt === 'string' && Number.isFinite(Date.parse(entry.completedAt))
    && ((typeof entry.malaNumber === 'number' && Number.isSafeInteger(entry.malaNumber) && entry.malaNumber > 0)
      || (typeof entry.malaNumber === 'string' && /^[1-9]\d*$/.test(entry.malaNumber))));
}

/** Migrates old saved counters without dropping counts or mala history. */
export function sanitizeCounters(raw: Partial<PersistedCounters>): PersistedCounters {
  const totalCount = normalizeChantCount(raw.jaap?.totalCount);
  return {
    mala: {
      count: safeCount(raw.mala?.count, MALA_BEADS),
      completedMalas: safeCount(raw.mala?.completedMalas, Number.MAX_SAFE_INTEGER),
      history: safeHistory(raw.mala?.history),
    },
    jaap: {
      totalCount, completedMalas: divideChantCount(totalCount, MALA_BEADS).quotient,
      history: safeHistory(raw.jaap?.history),
    },
    malaTrackedDay: typeof raw.malaTrackedDay === 'string' ? raw.malaTrackedDay : undefined,
  };
}

/** Pure transitions keep rapid taps, completion, undo, and persistence consistent. */
export function counterReducer(state: LiveCounters, action: CounterAction): LiveCounters {
  switch (action.type) {
    case 'hydrate': return { ...action.state, showCompletion: action.state.mala.count === MALA_BEADS };
    case 'dailyReset': {
      if (state.malaTrackedDay === action.day) return state;
      if (!state.malaTrackedDay) return { ...state, malaTrackedDay: action.day };
      return {
        ...state, malaTrackedDay: action.day, showCompletion: false,
        mala: { count: 0, completedMalas: 0, history: state.mala.history },
      };
    }
    case 'increment': {
      if (action.mode === 'jaap') {
        const totalCount = incrementChantCount(state.jaap.totalCount);
        const { quotient: completedMalas, remainder } = divideChantCount(totalCount, MALA_BEADS);
        const complete = remainder === 0;
        const history = complete
          ? [{ id: action.id, completedAt: action.at, malaNumber: completedMalas }, ...state.jaap.history]
          : state.jaap.history;
        return { ...state, jaap: { totalCount, completedMalas, history } };
      }
      if (state.mala.count >= MALA_BEADS) return state;
      const count = state.mala.count + 1;
      const complete = count === MALA_BEADS;
      const completedMalas = state.mala.completedMalas + (complete ? 1 : 0);
      const history = complete
        ? [{ id: action.id, completedAt: action.at, malaNumber: completedMalas }, ...state.mala.history]
        : state.mala.history;
      return { ...state, mala: { count, completedMalas, history }, showCompletion: complete };
    }
    case 'undo': {
      if (action.mode === 'jaap') {
        if (state.jaap.totalCount === '0') return state;
        const totalCount = decrementChantCount(state.jaap.totalCount);
        return { ...state, jaap: {
          totalCount, completedMalas: divideChantCount(totalCount, MALA_BEADS).quotient,
          history: divideChantCount(state.jaap.totalCount, MALA_BEADS).remainder === 0
            ? state.jaap.history.slice(1) : state.jaap.history,
        } };
      }
      if (state.mala.count === 0) return state;
      const wasComplete = state.mala.count === MALA_BEADS;
      return { ...state, showCompletion: false, mala: {
        count: state.mala.count - 1,
        completedMalas: Math.max(0, state.mala.completedMalas - (wasComplete ? 1 : 0)),
        history: wasComplete ? state.mala.history.slice(1) : state.mala.history,
      } };
    }
    case 'nextRound': return { ...state, showCompletion: false, mala: { ...state.mala, count: 0 } };
    case 'clearHistory': return action.mode === 'jaap'
      ? { ...state, jaap: { ...state.jaap, history: [] } }
      : { ...state, mala: { ...state.mala, history: [] } };
    case 'resetCount': return action.mode === 'jaap'
      ? { ...state, jaap: { ...EMPTY_JAAP_STATE, history: state.jaap.history }, showCompletion: false }
      : { ...state, mala: { ...state.mala, count: 0 }, showCompletion: false };
    case 'resetMalas': return action.mode === 'jaap'
      ? { ...state, jaap: EMPTY_JAAP_STATE, showCompletion: false }
      : { ...state, mala: { ...state.mala, completedMalas: 0, history: [] }, showCompletion: false };
    case 'resetAll': return action.mode === 'jaap'
      ? { ...state, jaap: EMPTY_JAAP_STATE, showCompletion: false }
      : { ...state, mala: EMPTY_MALA_STATE, showCompletion: false };
  }
}

export function getPracticeStats(state: PersistedCounters, now = new Date()) {
  const allHistory = [...state.mala.history, ...state.jaap.history];
  const days = new Set(allHistory.map((entry) => getLocalDayKey(new Date(entry.completedAt))));
  const today = getLocalDayKey(now);
  const todayMalas = allHistory.filter((entry) => getLocalDayKey(new Date(entry.completedAt)) === today).length;
  const cursor = new Date(now);
  // An unfinished day doesn't break a streak that was active yesterday.
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(getLocalDayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { todayMalas, streak };
}
