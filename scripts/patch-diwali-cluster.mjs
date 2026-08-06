/** Adds Dhanteras / Choti Diwali / Govardhan Puja and fixes Diwali + Bhai Dooj dates. Run: node scripts/patch-diwali-cluster.mjs */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const START_YEAR = 2025;
const END_YEAR = 2035;

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

async function fetchDiwaliCluster(year) {
  const html = await fetch(`https://www.drikpanchang.com/diwali/diwali-puja-calendar.html?year=${year}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  }).then((response) => response.text());

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

function clusterTemplates(year, dates, locale) {
  const yy = String(year).slice(2);
  const prefix = locale === 'usa' ? `usa-${yy}` : yy;
  const usa = locale === 'usa';
  return [
    {
      id: `${prefix}-dhanteras`,
      name: 'Dhanteras',
      date: dates.dhanteras,
      description: usa
        ? 'First day of Diwali; Lakshmi-Kuber puja and buying gold or utensils.'
        : 'Diwali begins; Dhanteras and Lakshmi-Kuber puja.',
    },
    {
      id: `${prefix}-choti-diwali`,
      name: 'Narak Chaturdashi',
      date: dates.choti,
      description: usa
        ? 'Choti Diwali; abhyang snan and lighting diyas at home.'
        : 'Choti Diwali; abhyang snan and early morning diyas.',
    },
    {
      id: `${prefix}-govardhan`,
      name: 'Govardhan Puja',
      date: dates.govardhan,
      description: usa
        ? 'Annakut and Govardhan worship; Gujarati New Year in many communities.'
        : 'Govardhan Puja and Annakut; Gujarati New Year in Gujarat.',
    },
  ];
}

function formatEntry(entry) {
  return `  { id: '${entry.id}', name: '${entry.name}', date: '${entry.date}', regions: ['all'], description: '${entry.description}' },`;
}

function patchYearBlock(block, year, dates, locale) {
  let next = block;
  const yy = String(year).slice(2);
  const prefix = locale === 'usa' ? `usa-${yy}` : yy;

  next = next.replace(
    new RegExp(`(\\{ id: '${prefix}-\\d+', name: 'Diwali', date: ')[^']+(')`),
    `$1${dates.diwali}$2`,
  );
  next = next.replace(
    new RegExp(`(\\{ id: '${prefix}-\\d+', name: 'Bhai Dooj', date: ')[^']+(')`),
    `$1${dates.bhai}$2`,
  );

  for (const entry of clusterTemplates(year, dates, locale)) {
    if (next.includes(`id: '${entry.id}'`)) {
      next = next.replace(
        new RegExp(`(\\{ id: '${entry.id}', name: '[^']+', date: ')[^']+(')`),
        `$1${entry.date}$2`,
      );
    }
  }

  const missing = clusterTemplates(year, dates, locale).filter((entry) => !next.includes(`id: '${entry.id}'`));
  if (missing.length > 0) {
    const insert = missing.map(formatEntry).join('\n') + '\n';
    next = next.replace(
      new RegExp(`(\\{ id: '${prefix}-\\d+', name: 'Diwali', date: '${dates.diwali}')`),
      `${insert}$1`,
    );
  }

  return next;
}

function patchFile(relativePath, locale) {
  const path = join(root, relativePath);
  let source = readFileSync(path, 'utf8');

  for (let year = START_YEAR; year <= END_YEAR; year += 1) {
    const exportName = locale === 'usa' ? `usaFestivals${year}` : `festivals${year}`;
    if (!source.includes(`export const ${exportName}`)) {
      continue;
    }
    const blockRe = new RegExp(`export const ${exportName}: Festival\\[\\] = \\[[\\s\\S]*?\\n\\];`);
    const block = source.match(blockRe)?.[0];
    if (!block) {
      continue;
    }
    source = source.replace(blockRe, patchYearBlock(block, year, clusterByYear[year], locale));
  }

  writeFileSync(path, source);
  console.log('Patched', relativePath);
}

const clusterByYear = {};
for (let year = START_YEAR; year <= END_YEAR; year += 1) {
  clusterByYear[year] = await fetchDiwaliCluster(year);
  console.log(year, clusterByYear[year]);
}

patchFile('src/data/festivals/years.ts', 'india');
patchFile('src/data/festivals/usaYears.ts', 'usa');
patchFile('src/data/festivals/years2030to2035.ts', 'india');
patchFile('src/data/festivals/usaYears2030to2035.ts', 'usa');
