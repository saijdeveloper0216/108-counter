import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cancelFestivalReminders, scheduleFestivalReminders } from '../services/notifications';
import type { CalendarLocale, Region } from '../types/content';
import { DEFAULT_SETTINGS, sanitizeSettings, type AppSettings, type VibrationIntensity } from '../types/settings';

const STORAGE_KEY = '@108counter/settings';

type ScheduleResult = { scheduled: number; permissionDenied?: boolean };

type SettingsContextValue = {
  settings: AppSettings;
  isHydrated: boolean;
  updateSettings: (patch: Partial<AppSettings>) => Promise<ScheduleResult>;
  setRegion: (region: Region) => Promise<ScheduleResult>;
  setVibrationIntensity: (intensity: VibrationIntensity) => Promise<ScheduleResult>;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && active) {
          const parsed = sanitizeSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) });
          setSettings(parsed);
          if (parsed.remindersEnabled) {
            await scheduleFestivalReminders(parsed);
          }
        }
      } finally {
        if (active) {
          setIsHydrated(true);
        }
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
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, isHydrated]);

  const syncReminders = useCallback(async (next: AppSettings): Promise<ScheduleResult> => {
    if (!next.remindersEnabled) {
      await cancelFestivalReminders();
      return { scheduled: 0 };
    }
    return scheduleFestivalReminders(next);
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const merged = { ...settings, ...patch };
      const next = sanitizeSettings(merged);
      setSettings(next);
      return syncReminders(next);
    },
    [settings, syncReminders],
  );

  const setRegion = useCallback(
    async (region: Region) => updateSettings({ region }),
    [updateSettings],
  );

  const setVibrationIntensity = useCallback(
    async (vibrationIntensity: VibrationIntensity) => updateSettings({ vibrationIntensity }),
    [updateSettings],
  );

  const value = useMemo(
    () => ({ settings, isHydrated, updateSettings, setRegion, setVibrationIntensity }),
    [settings, isHydrated, updateSettings, setRegion, setVibrationIntensity],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
