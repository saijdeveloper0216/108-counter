export type Language =
  | 'sanskrit'
  | 'hindi'
  | 'english'
  | 'telugu'
  | 'tamil'
  | 'kannada'
  | 'malayalam';

export const SHLOKA_LANGUAGES: Language[] = [
  'sanskrit',
  'hindi',
  'english',
  'telugu',
  'tamil',
  'kannada',
  'malayalam',
];

export type CalendarLocale = 'india' | 'usa';

export type UsaTimezone =
  | 'America/New_York'
  | 'America/Chicago'
  | 'America/Denver'
  | 'America/Los_Angeles';

export const USA_TIMEZONE_OPTIONS: UsaTimezone[] = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
];

export const USA_TIMEZONE_LABELS: Record<UsaTimezone, string> = {
  'America/New_York': 'Eastern (ET)',
  'America/Chicago': 'Central (CT)',
  'America/Denver': 'Mountain (MT)',
  'America/Los_Angeles': 'Pacific (PT)',
};

export type IndiaRegion = 'all' | 'north' | 'south' | 'east' | 'west';
export type Region = IndiaRegion;

export type ShlokaCategory = 'mantra' | 'chalisa' | 'harathi' | 'ashtakam' | 'stotra';

export type ShlokaLanguages = Partial<Record<Language, string[]>>;

export type ShlokaEntry = {
  id: string;
  title: string;
  category: ShlokaCategory;
  description: string;
  deity?: string;
  languages: Record<Language, string[]>;
  sourceScript?: 'devanagari' | 'telugu';
  group?: 'gods' | 'goddesses';
};

/** Shloka data before south-Indian language verses are merged in. */
export type ShlokaSource = Omit<ShlokaEntry, 'languages'> & {
  languages: ShlokaLanguages;
};

export const SHLOKA_CATEGORY_LABELS: Record<ShlokaCategory, string> = {
  mantra: 'Mantras',
  chalisa: 'Chalisa',
  harathi: 'Harathi / Aarti',
  ashtakam: 'Shiva Ashtakam',
  stotra: 'Stotras & Namavali',
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  sanskrit: 'Devanagari',
  hindi: 'Hindi',
  english: 'English / Roman',
  telugu: 'Telugu',
  tamil: 'Tamil',
  kannada: 'Kannada',
  malayalam: 'Malayalam',
};

export const CALENDAR_LOCALE_LABELS: Record<CalendarLocale, string> = {
  india: 'India',
  usa: 'USA',
};

export const INDIA_REGION_LABELS: Record<IndiaRegion, string> = {
  all: 'All India',
  north: 'North India',
  south: 'South India',
  east: 'East India',
  west: 'West India',
};

/** @deprecated Use getRegionLabelsForLocale instead */
export const REGION_LABELS: Record<IndiaRegion, string> = INDIA_REGION_LABELS;

export const INDIA_REGIONS: IndiaRegion[] = ['all', 'north', 'south', 'east', 'west'];

export function getRegionLabelsForLocale(locale: CalendarLocale): Record<string, string> {
  return INDIA_REGION_LABELS;
}

export function getRegionsForLocale(locale: CalendarLocale): Region[] {
  return locale === 'india' ? [...INDIA_REGIONS] : [];
}

export function showsRegionFilter(locale: CalendarLocale): boolean {
  return locale === 'india';
}

export function getCalendarRegionLabel(locale: CalendarLocale, region: Region): string {
  return locale === 'usa' ? 'USA' : INDIA_REGION_LABELS[region];
}

export function isRegionValidForLocale(region: Region, locale: CalendarLocale): boolean {
  if (locale === 'usa') {
    return region === 'all';
  }
  return INDIA_REGIONS.includes(region);
}

export function normalizeRegionForLocale(region: Region, locale: CalendarLocale): Region {
  if (locale === 'usa') {
    return 'all';
  }
  return INDIA_REGIONS.includes(region) ? region : 'all';
}

export type Festival = {
  id: string;
  name: string;
  date: string;
  regions: Region[];
  description: string;
  /** When the same date is celebrated under different names by region */
  regionalNames?: Partial<Record<Exclude<Region, 'all'>, string>>;
  /** Indian state(s) where this festival is primarily observed */
  states?: string[];
};

export type FestivalView = {
  id: string;
  date: string;
  name: string;
  description: string;
  stateTags: string[];
};
