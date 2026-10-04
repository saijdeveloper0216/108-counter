import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { COUNTERS_STORAGE_KEY, LEGACY_COUNTER_STORAGE_KEY, MALA_BEADS } from '../constants/counter';
import type { CounterMode } from '../types/counter';
import type { CounterState } from '../types/history';
import { counterReducer, getPracticeStats, INITIAL_COUNTERS, sanitizeCounters } from '../utils/counterState';
import { getLocalDayKey } from '../utils/date';
import { divideChantCount } from '../utils/chantCount';

export function useCounter(counterMode: CounterMode, malaDailyResetEnabled = false) {
  const [state, dispatch] = useReducer(counterReducer, INITIAL_COUNTERS);
  const [isHydrated, setIsHydrated] = useState(false);
  const [day, setDay] = useState(getLocalDayKey());
  const writeQueue = useRef(Promise.resolve());
  const tapSequence = useRef(0);

  useEffect(() => {
    let active = true;
    async function hydrate() {
      let persisted = sanitizeCounters({});
      try {
        const stored = await AsyncStorage.getItem(COUNTERS_STORAGE_KEY);
        if (stored) persisted = sanitizeCounters(JSON.parse(stored));
        else {
          const legacy = await AsyncStorage.getItem(LEGACY_COUNTER_STORAGE_KEY);
          if (legacy) persisted = sanitizeCounters({ mala: JSON.parse(legacy) as CounterState });
        }
      } catch { /* A corrupt save must not prevent the counter from opening. */ }
      if (active) {
        dispatch({ type: 'hydrate', state: persisted });
        setIsHydrated(true);
      }
    }
    void hydrate();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const refreshDay = () => setDay(getLocalDayKey());
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') refreshDay();
    });
    const timer = setInterval(refreshDay, 15000);
    return () => { subscription.remove(); clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (isHydrated && malaDailyResetEnabled) dispatch({ type: 'dailyReset', day });
  }, [isHydrated, malaDailyResetEnabled, day]);

  useEffect(() => {
    if (!isHydrated) return;
    const { showCompletion: _, ...payload } = state;
    // Serialize writes so an older save cannot overwrite a newer rapid tap.
    writeQueue.current = writeQueue.current.catch(() => undefined).then(
      () => AsyncStorage.setItem(COUNTERS_STORAGE_KEY, JSON.stringify(payload)),
    );
    void writeQueue.current.catch(() => undefined);
  }, [state, isHydrated]);

  const increment = useCallback(() => {
    if (!isHydrated) return;
    const now = new Date();
    if (malaDailyResetEnabled) dispatch({ type: 'dailyReset', day: getLocalDayKey(now) });
    dispatch({ type: 'increment', mode: counterMode, at: now.toISOString(), id: `${now.getTime()}-${++tapSequence.current}` });
  }, [counterMode, isHydrated, malaDailyResetEnabled]);
  const undo = useCallback(() => dispatch({ type: 'undo', mode: counterMode }), [counterMode]);
  const resetCount = useCallback(() => dispatch({ type: 'resetCount', mode: counterMode }), [counterMode]);
  const resetMalas = useCallback(() => dispatch({ type: 'resetMalas', mode: counterMode }), [counterMode]);
  const resetAll = useCallback(() => dispatch({ type: 'resetAll', mode: counterMode }), [counterMode]);
  const startNextRound = useCallback(() => dispatch({ type: 'nextRound' }), []);
  const clearHistory = useCallback(() => dispatch({ type: 'clearHistory', mode: counterMode }), [counterMode]);

  const isJaap = counterMode === 'jaap';
  const count = isJaap ? state.jaap.totalCount : String(state.mala.count);
  const ringCount = isJaap ? divideChantCount(count, MALA_BEADS).remainder : state.mala.count;
  const stats = useMemo(() => getPracticeStats(state), [state.mala.history, state.jaap.history, day]);
  return {
    counterMode, count, ringCount,
    completedMalas: state.mala.completedMalas,
    history: isJaap ? state.jaap.history : state.mala.history, remaining: MALA_BEADS - state.mala.count,
    progress: ringCount / MALA_BEADS, isComplete: !isJaap && state.mala.count === MALA_BEADS,
    showCompletion: !isJaap && state.showCompletion, isHydrated,
    hasProgress: state.mala.count > 0 || state.mala.completedMalas > 0 || state.jaap.totalCount !== '0',
    increment, undo, resetCount, resetMalas, resetAll, startNextRound, clearHistory,
    malaState: state.mala, jaapState: state.jaap, ...stats,
  };
}
