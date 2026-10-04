import type { CounterMode } from './counter';
import type { CalendarLocale, Region, UsaTimezone } from './content';
import { normalizeRegionForLocale, USA_TIMEZONE_OPTIONS } from './content';

export type VibrationIntensity = 'none' | 'gentle' | 'balanced' | 'strong';

/** When to fire the single festival reminder, at reminderTime. */
export type FestivalReminderTiming = 'day_before' | 'on_day';

export type AppSettings = {
  calendarLocale: CalendarLocale;
  region: Region;
  usaTimezone: UsaTimezone;
  remindersEnabled: boolean;
  reminderTime: string;
  reminderTiming: FestivalReminderTiming;
  vibrationIntensity: VibrationIntensity;
  counterMode: CounterMode;
  /** When true, 108 mala counts reset at the start of each local calendar day. */
  malaDailyReset: boolean;
  dailyMalaGoal: number;
  practiceReminderEnabled: boolean;
  practiceReminderTime: string;
  animationsEnabled: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  calendarLocale: 'india',
  region: 'all',
  usaTimezone: 'America/New_York',
  remindersEnabled: false,
  reminderTime: '19:00',
  reminderTiming: 'day_before',
  vibrationIntensity: 'balanced',
  counterMode: 'mala',
  malaDailyReset: false,
  dailyMalaGoal: 1,
  practiceReminderEnabled: false,
  practiceReminderTime: '07:00',
  animationsEnabled: true,
};

export const FESTIVAL_REMINDER_TIMING_LABELS: Record<FestivalReminderTiming, string> = {
  day_before: 'Day before',
  on_day: 'On festival day',
};

export const VIBRATION_LABELS: Record<VibrationIntensity, string> = {
  none: 'None',
  gentle: 'Gentle',
  balanced: 'Balanced',
  strong: 'Strong',
};

export function sanitizeSettings(raw: Partial<AppSettings>): AppSettings {
  const calendarLocale = raw.calendarLocale === 'usa' ? 'usa' : 'india';
  const region = normalizeRegionForLocale('all', calendarLocale);
  const usaTimezone = USA_TIMEZONE_OPTIONS.includes(raw.usaTimezone as UsaTimezone)
    ? (raw.usaTimezone as UsaTimezone)
    : DEFAULT_SETTINGS.usaTimezone;

  const counterMode = raw.counterMode === 'jaap' ? 'jaap' : 'mala';
  const reminderTiming = raw.reminderTiming === 'on_day' ? 'on_day' : 'day_before';
  const malaDailyReset = raw.malaDailyReset === true;

  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    calendarLocale,
    region,
    usaTimezone,
    counterMode,
    reminderTiming,
    malaDailyReset,
    dailyMalaGoal: [1, 3, 5, 11].includes(raw.dailyMalaGoal ?? 1) ? raw.dailyMalaGoal ?? 1 : 1,
    practiceReminderEnabled: raw.practiceReminderEnabled === true,
    practiceReminderTime: typeof raw.practiceReminderTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw.practiceReminderTime)
      ? raw.practiceReminderTime : DEFAULT_SETTINGS.practiceReminderTime,
    animationsEnabled: raw.animationsEnabled !== false,
  };
}
