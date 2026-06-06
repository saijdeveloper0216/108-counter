import type { CalendarLocale, Festival, FestivalView, Region } from '../../types/content';
import { ALL_USA_FESTIVALS } from './usaYears';
import { ALL_FESTIVALS as ALL_INDIA_FESTIVALS } from './years';

export { ALL_INDIA_FESTIVALS, ALL_USA_FESTIVALS };

export function getAllFestivals(locale: CalendarLocale): Festival[] {
  return locale === 'usa' ? ALL_USA_FESTIVALS : ALL_INDIA_FESTIVALS;
}

function toFestivalView(festival: Festival, name: string): FestivalView {
  return {
    id: festival.id,
    date: festival.date,
    name,
    description: festival.description,
    stateTags: festival.states ?? [],
  };
}

function nameForSpecificRegion(festival: Festival, region: Exclude<Region, 'all'>): string {
  return festival.regionalNames?.[region] ?? festival.name;
}

export function getFestivalsForRegion(locale: CalendarLocale, region: Region): Festival[] {
  const festivals = getAllFestivals(locale);

  if (locale === 'usa' || region === 'all') {
    return festivals;
  }

  return festivals.filter((festival) => festival.regions.includes('all') || festival.regions.includes(region));
}

export function getFestivalViewsForRegion(
  locale: CalendarLocale,
  region: Region,
  festivals: Festival[] = getFestivalsForRegion(locale, region),
): FestivalView[] {
  if (region === 'all') {
    return festivals.map((festival) => toFestivalView(festival, festival.name));
  }

  return festivals.map((festival) => toFestivalView(festival, nameForSpecificRegion(festival, region)));
}

export function getUpcomingFestivals(locale: CalendarLocale, region: Region, fromDate = new Date()): Festival[] {
  const today = fromDate.toISOString().slice(0, 10);
  return getFestivalsForRegion(locale, region)
    .filter((festival) => festival.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getMarkedDates(festivals: Festival[] | FestivalView[]) {
  return festivals.reduce<Record<string, { marked: boolean; dotColor: string }>>((acc, festival) => {
    acc[festival.date] = { marked: true, dotColor: '#FFD700' };
    return acc;
  }, {});
}
