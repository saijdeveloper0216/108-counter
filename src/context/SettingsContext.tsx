import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cancelFestivalReminders, scheduleFestivalReminders, schedulePracticeReminder } from '../services/notifications';
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
  const settingsRef = useRef(DEFAULT_SETTINGS);
  const saveQueue = useRef(Promise.resolve());
  const reminderQueue = useRef<Promise<ScheduleResult>>(Promise.resolve({ scheduled: 0 }));
  const lastFestivalResult = useRef<ScheduleResult>({ scheduled: 0 });

  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && active) {
          const parsed = sanitizeSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) });
          settingsRef.current = parsed;
          setSettings(parsed);
          if (parsed.remindersEnabled) {
            lastFestivalResult.current = await scheduleFestivalReminders(parsed);
          }
          if (parsed.practiceReminderEnabled) await schedulePracticeReminder(parsed);
        }
      } catch {
        // A damaged settings file or unavailable notification service must not block startup.
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
    saveQueue.current = saveQueue.current.catch(() => undefined).then(
      () => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)),
    );
    void saveQueue.current.catch(() => undefined);
  }, [settings, isHydrated]);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const previous = settingsRef.current;
    const next = sanitizeSettings({ ...previous, ...patch });
    settingsRef.current = next;
    setSettings(next);
    const festivalChanged = (['remindersEnabled', 'reminderTime', 'reminderTiming', 'calendarLocale', 'region', 'usaTimezone'] as const)
      .some((key) => previous[key] !== next[key]);
    const practiceChanged = (['practiceReminderEnabled', 'practiceReminderTime', 'dailyMalaGoal'] as const)
      .some((key) => previous[key] !== next[key]);
    if (!festivalChanged && !practiceChanged) return lastFestivalResult.current;
    const job = reminderQueue.current.catch(() => ({ scheduled: 0 })).then(async () => {
      let result = lastFestivalResult.current;
      if (festivalChanged) {
        if (next.remindersEnabled) result = await scheduleFestivalReminders(next);
        else { await cancelFestivalReminders(); result = { scheduled: 0 }; }
        lastFestivalResult.current = result;
      }
      if (practiceChanged) {
        const practice = await schedulePracticeReminder(next);
        if (practice.permissionDenied) result = { ...result, permissionDenied: true };
      }
      return result;
    });
    reminderQueue.current = job;
    return job;
  }, []);

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
