import type { CalendarLocale, Region, UsaTimezone } from '../../types/content';
import { USA_TIMEZONE_LABELS } from '../../types/content';
import { ALL_INDIA_FESTIVALS, ALL_USA_FESTIVALS } from './display';
import {
  getFestivalViewsForRegion,
  getFestivalsForRegion,
  getMarkedDates,
  getUpcomingFestivals,
} from './display';

export {
  ALL_INDIA_FESTIVALS,
  ALL_USA_FESTIVALS,
  getFestivalViewsForRegion,
  getFestivalsForRegion,
  getMarkedDates,
  getUpcomingFestivals,
};

/** @deprecated Use ALL_INDIA_FESTIVALS */
export const ALL_FESTIVALS = ALL_INDIA_FESTIVALS;

export function getDeviceTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getTodayString(timeZone?: string) {
  if (!timeZone) {
    return new Date().toISOString().slice(0, 10);
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function getCalendarTimezoneLabel(locale: CalendarLocale, usaTimezone: UsaTimezone) {
  if (locale === 'usa') {
    return USA_TIMEZONE_LABELS[usaTimezone];
  }

  return 'India Standard Time (IST)';
}

/** User-facing calendar header suffix (India nationwide, or US timezone). */
export function getCalendarHeaderSubtitle(locale: CalendarLocale, usaTimezone: UsaTimezone): string {
  if (locale === 'usa') {
    return USA_TIMEZONE_LABELS[usaTimezone];
  }

  return 'India · IST';
}

export function formatFestivalDate(date: string, timeZone?: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function resolveUsaTimezone(deviceTimezone: string): UsaTimezone {
  if (deviceTimezone === 'America/Chicago') {
    return 'America/Chicago';
  }
  if (deviceTimezone === 'America/Denver') {
    return 'America/Denver';
  }
  if (deviceTimezone === 'America/Los_Angeles') {
    return 'America/Los_Angeles';
  }
  return 'America/New_York';
}

export function getActiveTimezone(locale: CalendarLocale, usaTimezone: UsaTimezone) {
  return locale === 'usa' ? usaTimezone : undefined;
}

export type { Region };
