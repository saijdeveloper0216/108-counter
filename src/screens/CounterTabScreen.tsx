import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CounterScreen } from '../components/CounterScreen';
import { HistoryModal } from '../components/HistoryModal';
import { useSettings } from '../context/SettingsContext';
import { copy } from '../constants/theme';
import { useCounter } from '../hooks/useCounter';
import type { CounterMode } from '../types/counter';
import { confirmAction } from '../utils/confirmAction';
import { triggerActionHaptic, triggerCountHaptic } from '../utils/haptics';

export function CounterTabScreen() {
  const { settings, updateSettings, isHydrated: settingsHydrated } = useSettings();
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const counter = useCounter(settings.counterMode, settings.malaDailyReset);
  const isJaap = settings.counterMode === 'jaap';

  const handleCount = useCallback(() => {
    if (!counter.isHydrated || (!isJaap && counter.ringCount >= 108)) return;
    const nextBead = (counter.ringCount + 1) % 108 || 108;
    counter.increment();
    if (hapticsEnabled) {
      void triggerCountHaptic(nextBead, settings.vibrationIntensity).catch(() => undefined);
    }
  }, [counter, hapticsEnabled, isJaap, settings.vibrationIntensity]);

  const handleUndo = useCallback(async () => {
    counter.undo();
    if (hapticsEnabled) void triggerActionHaptic('light', settings.vibrationIntensity).catch(() => undefined);
  }, [counter, hapticsEnabled, settings.vibrationIntensity]);

  const handleResetCount = useCallback(() => {
    const title = isJaap ? copy.resetJaap : copy.resetCount;
    const message = isJaap ? copy.resetJaapConfirm : 'Reset the current count to zero?';
    confirmAction(title, message, title, () => {
      counter.resetCount();
      if (hapticsEnabled) void triggerActionHaptic('medium', settings.vibrationIntensity).catch(() => undefined);
    }, true);
  }, [counter, hapticsEnabled, isJaap, settings.vibrationIntensity]);

  const handleResetMalas = useCallback(() => {
    confirmAction(copy.resetMalas, 'Reset the mala count and clear its history?', copy.resetMalas, () => {
      counter.resetMalas();
      if (hapticsEnabled) void triggerActionHaptic('medium', settings.vibrationIntensity).catch(() => undefined);
    }, true);
  }, [counter, hapticsEnabled, settings.vibrationIntensity]);

  const handleNextRound = useCallback(async () => {
    counter.startNextRound();
    if (hapticsEnabled) void triggerActionHaptic('success', settings.vibrationIntensity).catch(() => undefined);
  }, [counter, hapticsEnabled, settings.vibrationIntensity]);

  const handleClearHistory = useCallback(() => {
    confirmAction(copy.clearHistory, 'Remove this mode’s history entries? Daily goals and streaks use this history.', copy.clearHistory, () => {
      counter.clearHistory();
      if (hapticsEnabled) void triggerActionHaptic('light', settings.vibrationIntensity).catch(() => undefined);
    }, true);
  }, [counter, hapticsEnabled, settings.vibrationIntensity]);

  const handleToggleHaptics = useCallback(async () => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    setHapticsEnabled((value) => !value);
  }, []);

  const handleModeChange = useCallback(
    (next: CounterMode) => {
      if (next === settings.counterMode) {
        return;
      }

      confirmAction(copy.switchModeTitle, copy.switchModeMessage, 'Switch', () => {
        void updateSettings({ counterMode: next });
      });
    },
    [settings.counterMode, updateSettings],
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <CounterScreen
        isReady={counter.isHydrated && settingsHydrated}
        todayMalas={counter.todayMalas}
        streak={counter.streak}
        dailyMalaGoal={settings.dailyMalaGoal}
        animationsEnabled={settings.animationsEnabled}
        counterMode={settings.counterMode}
        count={counter.count}
        ringCount={counter.ringCount}
        completedMalas={counter.completedMalas}
        showCompletion={counter.showCompletion}
        hapticsEnabled={hapticsEnabled}
        historyCount={counter.history.length}
        onCount={() => {
          void handleCount();
        }}
        onUndo={() => {
          void handleUndo();
        }}
        onResetCount={() => {
          void handleResetCount();
        }}
        onResetMalas={handleResetMalas}
        onNextRound={() => {
          void handleNextRound();
        }}
        onToggleHaptics={() => {
          void handleToggleHaptics();
        }}
        onOpenHistory={() => setHistoryOpen(true)}
        onModeChange={handleModeChange}
      />
      <HistoryModal
          title={isJaap ? 'Naam Jaap History' : undefined}
          subtitle={`${counter.todayMalas} malas today · ${counter.streak} day${counter.streak === 1 ? '' : 's'} of practice`}
          onResetMalas={!isJaap ? handleResetMalas : undefined}
          visible={historyOpen}
          history={counter.history}
          onClose={() => setHistoryOpen(false)}
          onClearHistory={handleClearHistory}
        />
    </SafeAreaView>
  );
}
