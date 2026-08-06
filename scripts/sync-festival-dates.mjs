/**
 * Sync Hindu festival dates from Drik Panchang.
 * - India: indiancalendar + hinducalendar (IST)
 * - USA: hinducalendar for New York City (geoname 5128581, US Eastern)
 *
 * Run: node scripts/sync-festival-dates.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const START_YEAR = 2025;
const END_YEAR = 2035;

/** Drik Panchang geoname for New York City — matches app default America/New_York. */
const USA_GEONAME_ID = '5128581';

const MONTHS = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

/** App festival name -> ordered Drik event names (first match wins). */
const FESTIVAL_MAP = [
  { name: 'Makar Sankranti/Pongal', drik: ['Makara Sankranti', 'Makar Sankranti', 'Pongal'] },
  { name: 'Vasant Panchami', drik: ['Vasant Panchami'] },
  { name: 'Maha Shivaratri', drik: ['Maha Shivaratri'] },
  { name: 'Holi', drik: ['Holi'] },
  { name: 'Ugadi/Gudi Padwa', drik: ['Ugadi', 'Gudi Padwa'] },
  { name: 'Ram Navami', drik: ['Rama Navami', 'Rama Navami *Smarta', 'Rama Navami *ISKCON'] },
  { name: 'Hanuman Jayanti', drik: ['Hanuman Jayanti'] },
  { name: 'Akshaya Tritiya', drik: ['Akshaya Tritiya'] },
  { name: 'Narasimha Jayanti', drik: ['Narasimha Jayanti'] },
  { name: 'Ganga Dussehra', drik: ['Ganga Dussehra'] },
  { name: 'Guru Purnima', drik: ['Guru Purnima'] },
  { name: 'Nag Panchami', drik: ['Nag Panchami'] },
  { name: 'Raksha Bandhan', drik: ['Raksha Bandhan'] },
  {
    name: 'Krishna Janmashtami',
    drik: ['Krishna Janmashtami', 'Janmashtami *Smarta', 'Janmashtami *ISKCON'],
  },
  { name: 'Ganesh Chaturthi', drik: ['Ganesh Chaturthi'] },
  { name: 'Onam', drik: ['Onam'] },
  { name: 'Navaratri begins', drik: ['Navratri Begins', 'Sharad Navratri', 'Ghatasthapana'] },
  { name: 'Dussehra/Vijayadashami', drik: ['Dussehra'] },
  { name: 'Karwa Chauth', drik: ['Karwa Chauth'] },
  { name: 'Kartik Purnima', drik: ['Kartika Purnima', 'Kartik Purnima'] },
  { name: 'Vaikuntha Ekadashi', drik: ['Vaikuntha Ekadashi', 'Mokshada Ekadashi'] },
];

function parseGregDate(raw, year) {
  const match = raw.match(/^([A-Za-z]+) (\d{1,2}), (\d{4})/);
  if (!match) {
    return null;
  }
  const month = MONTHS[match[1]];
  if (!month) {
    return null;
  }
  const parsedYear = Number(match[3]);
  if (parsedYear !== year) {
    return null;
  }
  return `${parsedYear}-${String(month).padStart(2, '0')}-${match[2].padStart(2, '0')}`;
}

async function fetchCalendarEvents(calendar, year, geonameId) {
  let url;
  if (calendar === 'indian') {
    url = `https://www.drikpanchang.com/calendars/indian/indiancalendar.html?year=${year}`;
  } else {
    url = geonameId
      ? `https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?year=${year}&geoname-id=${geonameId}`
      : `https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?year=${year}`;
  }

  const html = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then((response) =>
    response.text(),
  );

  const re = /dpEventName[^>]*>([^<]+)<\/div><div class="dpEventGregDate">([^<]+)</g;
  const events = new Map();
  let match;
  while ((match = re.exec(html))) {
    const name = match[1].trim();
    const date = parseGregDate(match[2].trim(), year);
    if (date && !events.has(name)) {
      events.set(name, date);
    }
  }
  return events;
}

async function fetchDiwaliClusterFromPage(year, geonameId) {
  const url = geonameId
    ? `https://www.drikpanchang.com/diwali/diwali-puja-calendar.html?year=${year}&geoname-id=${geonameId}`
    : `https://www.drikpanchang.com/diwali/diwali-puja-calendar.html?year=${year}`;

  const html = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then((response) =>
    response.text(),
  );

  const re =
    /Deepawali Day (\d+)[\s\S]*?dpEventDay dpEventDayExt">(\d+)<sup>th<\/sup><\/div><div class="dpSmallDate">([A-Za-z]+) (\d{4})/g;
  const keys = { 2: 'dhanteras', 3: 'choti', 4: 'diwali', 5: 'govardhan', 6: 'bhai' };
  const dates = {};
  let match;
  while ((match = re.exec(html))) {
    const key = keys[Number(match[1])];
    if (!key) {
      continue;
    }
    const month = String(MONTHS[match[3]]).padStart(2, '0');
    dates[key] = `${match[4]}-${month}-${match[2].padStart(2, '0')}`;
  }
  return dates;
}

function diwaliClusterFromEvents(events) {
  const pick = (...names) => {
    for (const name of names) {
      if (events.has(name)) {
        return events.get(name);
      }
    }
    return undefined;
  };

  return {
    dhanteras: pick('Dhanteras'),
    choti: pick('Narak Chaturdashi', 'Chhoti Diwali'),
    diwali: pick('Diwali', 'Lakshmi Puja'),
    govardhan: pick('Govardhan Puja'),
    bhai: pick('Bhaiya Dooj', 'Bhai Dooj'),
  };
}

async function fetchDiwaliCluster(year, fallbackEvents, geonameId) {
  const fromPage = await fetchDiwaliClusterFromPage(year, geonameId);
  const fromEvents = diwaliClusterFromEvents(fallbackEvents);
  return {
    dhanteras: fromPage.dhanteras ?? fromEvents.dhanteras,
    choti: fromPage.choti ?? fromEvents.choti,
    diwali: fromPage.diwali ?? fromEvents.diwali,
    govardhan: fromPage.govardhan ?? fromEvents.govardhan,
    bhai: fromPage.bhai ?? fromEvents.bhai,
  };
}

function resolveDates(primaryEvents, fallbackEvents) {
  const dates = {};
  for (const festival of FESTIVAL_MAP) {
    for (const drikName of festival.drik) {
      const date = primaryEvents.get(drikName) ?? fallbackEvents.get(drikName);
      if (date) {
        dates[festival.name] = date;
        break;
      }
    }
  }
  return dates;
}

function patchFestivalDate(source, festivalName, newDate) {
  const escaped = festivalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(\\{ id: '[^']+', name: '${escaped}', date: ')[^']+(')`, 'g');
  const before = source;
  const next = source.replace(re, `$1${newDate}$2`);
  return next === before ? source : next;
}

const KARWA_CHAUTH = {
  india: {
    regions: "['all', 'north', 'west']",
    description: 'Karva Chauth fast for husband’s wellbeing; moonrise puja.',
  },
  usa: {
    regions: "['all']",
    description: 'Karwa Chauth fast and moonrise puja; popular in North Indian diaspora communities.',
  },
};

function ensureKarwaChauth(block, year, date, locale) {
  if (block.includes("name: 'Karwa Chauth'")) {
    return block;
  }

  const yy = String(year).slice(2);
  const prefix = locale === 'usa' ? `usa-${yy}` : yy;
  const meta = KARWA_CHAUTH[locale];
  const entry = `  { id: '${prefix}-karwa', name: 'Karwa Chauth', date: '${date}', regions: ${meta.regions}, description: '${meta.description}' },\n`;

  return block.replace(new RegExp(`(\\{ id: '${prefix}-dhanteras')`), `${entry}$1`);
}

function patchYearBlock(block, year, dates, diwaliCluster, locale) {
  let next = block;

  if (dates['Karwa Chauth']) {
    next = ensureKarwaChauth(next, year, dates['Karwa Chauth'], locale);
  }

  for (const [name, date] of Object.entries(dates)) {
    next = patchFestivalDate(next, name, date);
  }

  const yy = String(year).slice(2);
  const prefixes = block.includes(`usa-${yy}`) ? [`usa-${yy}`] : [yy];

  for (const prefix of prefixes) {
    if (diwaliCluster.dhanteras) {
      next = next.replace(
        new RegExp(`(\\{ id: '${prefix}-dhanteras', name: 'Dhanteras', date: ')[^']+(')`),
        `$1${diwaliCluster.dhanteras}$2`,
      );
    }
    if (diwaliCluster.choti) {
      next = next.replace(
        new RegExp(`(\\{ id: '${prefix}-choti-diwali', name: 'Narak Chaturdashi', date: ')[^']+(')`),
        `$1${diwaliCluster.choti}$2`,
      );
    }
    if (diwaliCluster.govardhan) {
      next = next.replace(
        new RegExp(`(\\{ id: '${prefix}-govardhan', name: 'Govardhan Puja', date: ')[^']+(')`),
        `$1${diwaliCluster.govardhan}$2`,
      );
    }
    if (diwaliCluster.diwali) {
      next = next.replace(
        new RegExp(`(\\{ id: '${prefix}-(?:\\d+|diwali)', name: 'Diwali', date: ')[^']+(')`),
        `$1${diwaliCluster.diwali}$2`,
      );
    }
    if (diwaliCluster.bhai) {
      next = next.replace(
        new RegExp(`(\\{ id: '${prefix}-\\d+', name: 'Bhai Dooj', date: ')[^']+(')`),
        `$1${diwaliCluster.bhai}$2`,
      );
    }
  }

  return next;
}

function patchFile(relativePath, datesByYear, diwaliByYear, exportPrefix, locale) {
  const path = join(root, relativePath);
  let source = readFileSync(path, 'utf8');

  for (let year = START_YEAR; year <= END_YEAR; year += 1) {
    const exportName = `${exportPrefix}${year}`;
    if (!source.includes(`export const ${exportName}`)) {
      continue;
    }
    const blockRe = new RegExp(`export const ${exportName}: Festival\\[\\] = \\[[\\s\\S]*?\\n\\];`);
    const block = source.match(blockRe)?.[0];
    if (!block) {
      continue;
    }
    const patched = patchYearBlock(block, year, datesByYear[year], diwaliByYear[year], locale);
    source = source.replace(blockRe, patched);
  }

  writeFileSync(path, source);
  console.log('Updated', relativePath);
}

const indiaDatesByYear = {};
const usaDatesByYear = {};
const indiaDiwaliByYear = {};
const usaDiwaliByYear = {};

for (let year = START_YEAR; year <= END_YEAR; year += 1) {
  const [indianEvents, indiaHinduEvents, usaHinduEvents] = await Promise.all([
    fetchCalendarEvents('indian', year),
    fetchCalendarEvents('hindu', year),
    fetchCalendarEvents('hindu', year, USA_GEONAME_ID),
  ]);

  const [indiaDiwali, usaDiwali] = await Promise.all([
    fetchDiwaliCluster(year, indianEvents, undefined),
    fetchDiwaliCluster(year, usaHinduEvents, USA_GEONAME_ID),
  ]);

  indiaDatesByYear[year] = resolveDates(indianEvents, indiaHinduEvents);
  usaDatesByYear[year] = resolveDates(usaHinduEvents, indiaHinduEvents);
  indiaDiwaliByYear[year] = indiaDiwali;
  usaDiwaliByYear[year] = usaDiwali;

  console.log(
    `${year} India: Raksha=${indiaDatesByYear[year]['Raksha Bandhan']}, Holi=${indiaDatesByYear[year]['Holi']}`,
  );
  console.log(
    `${year} USA:   Raksha=${usaDatesByYear[year]['Raksha Bandhan']}, Holi=${usaDatesByYear[year]['Holi']}, Janmashtami=${usaDatesByYear[year]['Krishna Janmashtami']}`,
  );
}

patchFile('src/data/festivals/years.ts', indiaDatesByYear, indiaDiwaliByYear, 'festivals', 'india');
patchFile(
  'src/data/festivals/years2030to2035.ts',
  indiaDatesByYear,
  indiaDiwaliByYear,
  'festivals',
  'india',
);
patchFile('src/data/festivals/usaYears.ts', usaDatesByYear, usaDiwaliByYear, 'usaFestivals', 'usa');
patchFile(
  'src/data/festivals/usaYears2030to2035.ts',
  usaDatesByYear,
  usaDiwaliByYear,
  'usaFestivals',
  'usa',
);

console.log('Done syncing India + USA festival dates from Drik Panchang.');
