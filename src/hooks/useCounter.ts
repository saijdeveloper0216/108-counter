import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { COUNTERS_STORAGE_KEY, LEGACY_COUNTER_STORAGE_KEY, MAX_JAAP_COUNT, MALA_BEADS } from '../constants/counter';
import { TOTAL_COUNT } from '../constants/theme';
import type { CounterMode, JaapCounterState, MalaCounterState, PersistedCounters } from '../types/counter';
import { EMPTY_JAAP_STATE, EMPTY_MALA_STATE } from '../types/counter';
import type { CounterState, HistoryEntry } from '../types/history';
import { getLocalDayKey } from '../utils/date';

function createHistoryEntry(malaNumber: number): HistoryEntry {
  return {
    id: `${Date.now()}-${malaNumber}`,
    malaNumber,
    completedAt: new Date().toISOString(),
  };
}

function sanitizeMalaState(raw: Partial<MalaCounterState> | undefined): MalaCounterState {
  return {
    count: Math.max(0, Math.min(MALA_BEADS, Math.floor(raw?.count ?? 0))),
    completedMalas: Math.max(0, Math.floor(raw?.completedMalas ?? 0)),
    history: Array.isArray(raw?.history) ? raw.history : [],
  };
}

function sanitizeJaapState(raw: Partial<JaapCounterState> | undefined): JaapCounterState {
  const totalCount = Math.max(0, Math.min(MAX_JAAP_COUNT, Math.floor(raw?.totalCount ?? 0)));
  return {
    totalCount,
    completedMalas: Math.floor(totalCount / MALA_BEADS),
  };
}

function applyMalaDailyReset(
  mala: MalaCounterState,
  malaTrackedDay: string | undefined,
  enabled: boolean,
): { mala: MalaCounterState; malaTrackedDay: string | undefined; didReset: boolean } {
  const today = getLocalDayKey();
  if (!enabled) {
    return { mala, malaTrackedDay, didReset: false };
  }
  if (!malaTrackedDay) {
    return { mala, malaTrackedDay: today, didReset: false };
  }
  if (malaTrackedDay !== today) {
    return { mala: EMPTY_MALA_STATE, malaTrackedDay: today, didReset: true };
  }
  return { mala, malaTrackedDay, didReset: false };
}

async function loadPersistedCounters(): Promise<PersistedCounters> {
  try {
    const stored = await AsyncStorage.getItem(COUNTERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<PersistedCounters>;
      return {
        mala: sanitizeMalaState(parsed.mala),
        jaap: sanitizeJaapState(parsed.jaap),
        malaTrackedDay: typeof parsed.malaTrackedDay === 'string' ? parsed.malaTrackedDay : undefined,
      };
    }

    const legacy = await AsyncStorage.getItem(LEGACY_COUNTER_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as CounterState;
      const migrated: PersistedCounters = {
        mala: sanitizeMalaState(parsed),
        jaap: EMPTY_JAAP_STATE,
      };
      await AsyncStorage.setItem(COUNTERS_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    // Ignore corrupt storage.
  }

  return { mala: EMPTY_MALA_STATE, jaap: EMPTY_JAAP_STATE, malaTrackedDay: undefined };
}

export function useCounter(counterMode: CounterMode, malaDailyResetEnabled = false) {
  const [malaState, setMalaState] = useState<MalaCounterState>(EMPTY_MALA_STATE);
  const [jaapState, setJaapState] = useState<JaapCounterState>(EMPTY_JAAP_STATE);
  const [malaTrackedDay, setMalaTrackedDay] = useState<string | undefined>(undefined);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const malaDailyResetRef = useRef(malaDailyResetEnabled);
  const malaTrackedDayRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    malaDailyResetRef.current = malaDailyResetEnabled;
  }, [malaDailyResetEnabled]);

  useEffect(() => {
    malaTrackedDayRef.current = malaTrackedDay;
  }, [malaTrackedDay]);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const persisted = await loadPersistedCounters();
      const resetResult = applyMalaDailyReset(
        persisted.mala,
        persisted.malaTrackedDay,
        malaDailyResetEnabled,
      );
      if (active) {
        setMalaState(resetResult.mala);
        setJaapState(persisted.jaap);
        setMalaTrackedDay(resetResult.malaTrackedDay);
        if (resetResult.didReset) {
          setShowCompletion(false);
        }
        setIsHydrated(true);
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const result = applyMalaDailyReset(malaState, malaTrackedDay, malaDailyResetEnabled);
    if (result.didReset) {
      setMalaState(result.mala);
      setMalaTrackedDay(result.malaTrackedDay);
      setShowCompletion(false);
      return;
    }
    if (malaDailyResetEnabled && result.malaTrackedDay !== malaTrackedDay) {
      setMalaTrackedDay(result.malaTrackedDay);
    }
  }, [malaDailyResetEnabled, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !malaDailyResetEnabled) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        return;
      }

      setMalaState((prev) => {
        const result = applyMalaDailyReset(
          prev,
          malaTrackedDayRef.current,
          malaDailyResetRef.current,
        );
        if (result.didReset) {
          setShowCompletion(false);
          setMalaTrackedDay(result.malaTrackedDay);
          return result.mala;
        }
        return prev;
      });
    });

    return () => subscription.remove();
  }, [isHydrated, malaDailyResetEnabled]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const payload: PersistedCounters = {
      mala: malaState,
      jaap: jaapState,
      malaTrackedDay: malaDailyResetEnabled ? malaTrackedDay ?? getLocalDayKey() : malaTrackedDay,
    };
    void AsyncStorage.setItem(COUNTERS_STORAGE_KEY, JSON.stringify(payload));
  }, [malaState, jaapState, malaTrackedDay, malaDailyResetEnabled, isHydrated]);

  const isJaap = counterMode === 'jaap';

  const count = isJaap ? jaapState.totalCount : malaState.count;
  const ringCount = isJaap ? jaapState.totalCount % MALA_BEADS : malaState.count;
  const completedMalas = isJaap ? jaapState.completedMalas : malaState.completedMalas;
  const history = malaState.history;

  const remaining = TOTAL_COUNT - malaState.count;
  const progress = isJaap
    ? ringCount / MALA_BEADS
    : malaState.count / TOTAL_COUNT;
  const isComplete = !isJaap && malaState.count >= TOTAL_COUNT;
  const isJaapMaxed = isJaap && jaapState.totalCount >= MAX_JAAP_COUNT;

  const incrementMala = useCallback(() => {
    setMalaState((prev) => {
      if (prev.count >= MALA_BEADS) {
        return prev;
      }

      const next = prev.count + 1;
      if (next >= MALA_BEADS) {
        const malaNumber = prev.completedMalas + 1;
        setShowCompletion(true);
        return {
          count: MALA_BEADS,
          completedMalas: malaNumber,
          history: [createHistoryEntry(malaNumber), ...prev.history],
        };
      }
      return { ...prev, count: next };
    });
  }, []);

  const incrementJaap = useCallback(() => {
    setJaapState((prev) => {
      if (prev.totalCount >= MAX_JAAP_COUNT) {
        return prev;
      }

      const nextTotal = prev.totalCount + 1;
      const nextMalas = Math.floor(nextTotal / MALA_BEADS);
      return {
        totalCount: nextTotal,
        completedMalas: nextMalas,
      };
    });
  }, []);

  const increment = useCallback(() => {
    if (isJaap) {
      incrementJaap();
    } else {
      incrementMala();
    }
  }, [isJaap, incrementJaap, incrementMala]);

  const undo = useCallback(() => {
    setShowCompletion(false);
    if (isJaap) {
      setJaapState((prev) => {
        if (prev.totalCount <= 0) {
          return prev;
        }
        const nextTotal = prev.totalCount - 1;
        return {
          totalCount: nextTotal,
          completedMalas: Math.floor(nextTotal / MALA_BEADS),
        };
      });
      return;
    }

    setMalaState((prev) => {
      if (prev.count <= 0) {
        return prev;
      }

      const next = prev.count - 1;
      if (prev.count >= MALA_BEADS) {
        return {
          count: next,
          completedMalas: Math.max(0, prev.completedMalas - 1),
          history: prev.history.slice(1),
        };
      }
      return { ...prev, count: next };
    });
  }, [isJaap]);

  const resetCount = useCallback(() => {
    setShowCompletion(false);
    if (isJaap) {
      setJaapState(EMPTY_JAAP_STATE);
      return;
    }
    setMalaState((prev) => ({ ...prev, count: 0 }));
  }, [isJaap]);

  const resetMalas = useCallback(() => {
    setShowCompletion(false);
    if (isJaap) {
      setJaapState(EMPTY_JAAP_STATE);
      return;
    }
    setMalaState((prev) => ({ ...prev, completedMalas: 0, history: [] }));
  }, [isJaap]);

  const resetAll = useCallback(() => {
    setShowCompletion(false);
    if (isJaap) {
      setJaapState(EMPTY_JAAP_STATE);
    } else {
      setMalaState(EMPTY_MALA_STATE);
    }
  }, [isJaap]);

  const startNextRound = useCallback(() => {
    setShowCompletion(false);
    setMalaState((prev) => ({ ...prev, count: 0 }));
  }, []);

  const clearHistory = useCallback(() => {
    setMalaState((prev) => ({ ...prev, history: [] }));
  }, []);

  const hasProgress = useMemo(() => {
    if (malaState.count > 0 || malaState.completedMalas > 0) {
      return true;
    }
    return jaapState.totalCount > 0;
  }, [malaState, jaapState]);

  return useMemo(
    () => ({
      counterMode,
      count,
      ringCount,
      completedMalas,
      history,
      remaining,
      progress,
      isComplete,
      isJaapMaxed,
      showCompletion: !isJaap && showCompletion,
      isHydrated,
      hasProgress,
      increment,
      undo,
      resetCount,
      resetMalas,
      resetAll,
      startNextRound,
      clearHistory,
      malaState,
      jaapState,
    }),
    [
      counterMode,
      count,
      ringCount,
      completedMalas,
      history,
      remaining,
      progress,
      isComplete,
      isJaapMaxed,
      isJaap,
      showCompletion,
      isHydrated,
      hasProgress,
      increment,
      undo,
      resetCount,
      resetMalas,
      resetAll,
      startNextRound,
      clearHistory,
      malaState,
      jaapState,
    ],
  );
}
