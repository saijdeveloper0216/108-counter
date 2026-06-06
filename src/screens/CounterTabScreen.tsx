import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CounterScreen } from '../components/CounterScreen';
import { HistoryModal } from '../components/HistoryModal';
import { useSettings } from '../context/SettingsContext';
import { copy } from '../constants/theme';
import { useCounter } from '../hooks/useCounter';
import type { CounterMode } from '../types/counter';
import { triggerActionHaptic, triggerCountHaptic } from '../utils/haptics';

export function CounterTabScreen() {
  const { settings, updateSettings } = useSettings();
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const counter = useCounter(settings.counterMode, settings.malaDailyReset);
  const isJaap = settings.counterMode === 'jaap';

  const handleCount = useCallback(async () => {
    if (isJaap) {
      if (counter.isJaapMaxed) {
        return;
      }
      const nextBead = (counter.count + 1) % 108 || 108;
      if (hapticsEnabled) {
        await triggerCountHaptic(nextBead, settings.vibrationIntensity);
      }
      counter.increment();
      return;
    }

    if (counter.count >= 108) {
      return;
    }

    const nextCount = counter.count + 1;
    if (hapticsEnabled) {
      await triggerCountHaptic(nextCount, settings.vibrationIntensity);
    }
    counter.increment();
  }, [counter, hapticsEnabled, isJaap, settings.vibrationIntensity]);

  const handleUndo = useCallback(async () => {
    if (hapticsEnabled) {
      await triggerActionHaptic('light', settings.vibrationIntensity);
    }
    counter.undo();
  }, [counter, hapticsEnabled, settings.vibrationIntensity]);

  const handleResetCount = useCallback(async () => {
    const title = isJaap ? copy.resetJaap : copy.resetCount;
    const message = isJaap
      ? copy.resetJaapConfirm
      : 'Reset the current count to zero?';

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: title,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (hapticsEnabled) {
              await triggerActionHaptic('medium', settings.vibrationIntensity);
            }
            counter.resetCount();
          })();
        },
      },
    ]);
  }, [counter, hapticsEnabled, isJaap, settings.vibrationIntensity]);

  const handleResetMalas = useCallback(() => {
    Alert.alert(copy.resetMalas, 'Reset the mala count and clear all history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: copy.resetMalas,
        style: 'destructive',
        onPress: () => {
          void triggerActionHaptic('medium', settings.vibrationIntensity);
          counter.resetMalas();
        },
      },
    ]);
  }, [counter, settings.vibrationIntensity]);

  const handleNextRound = useCallback(async () => {
    if (hapticsEnabled) {
      await triggerActionHaptic('success', settings.vibrationIntensity);
    }
    counter.startNextRound();
  }, [counter, hapticsEnabled, settings.vibrationIntensity]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(copy.clearHistory, 'Remove all history entries?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: copy.clearHistory,
        style: 'destructive',
        onPress: () => {
          void triggerActionHaptic('light', settings.vibrationIntensity);
          counter.clearHistory();
        },
      },
    ]);
  }, [counter, settings.vibrationIntensity]);

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

      Alert.alert(copy.switchModeTitle, copy.switchModeMessage, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            void updateSettings({ counterMode: next });
          },
        },
      ]);
    },
    [settings.counterMode, updateSettings],
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <CounterScreen
        counterMode={settings.counterMode}
        count={counter.count}
        ringCount={counter.ringCount}
        completedMalas={counter.completedMalas}
        showCompletion={counter.showCompletion}
        isJaapMaxed={counter.isJaapMaxed}
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
      {!isJaap && (
        <HistoryModal
          visible={historyOpen}
          history={counter.history}
          onClose={() => setHistoryOpen(false)}
          onClearHistory={handleClearHistory}
        />
      )}
    </SafeAreaView>
  );
}
