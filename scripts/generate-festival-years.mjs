/** Generates festival year arrays for 2030–2035. Run: node scripts/generate-festival-years.mjs */

const INDIA_TEMPLATES = [
  {
    key: 'sankranti',
    name: 'Makar Sankranti/Pongal',
    regions: ['all', 'north', 'south'],
    regionalNames: { north: 'Makar Sankranti', south: 'Pongal' },
    description: 'Harvest festival marking the sun’s northward journey.',
  },
  { key: 'vasant', name: 'Vasant Panchami', regions: ['all', 'north', 'east'], description: 'Worship of Goddess Saraswati.' },
  { key: 'shivaratri', name: 'Maha Shivaratri', regions: ['all'], description: 'Sacred night dedicated to Lord Shiva.' },
  { key: 'holi', name: 'Holi', regions: ['all', 'north', 'west'], description: 'Festival of colors and spring joy.' },
  {
    key: 'ugadi',
    name: 'Ugadi/Gudi Padwa',
    regions: ['south', 'west'],
    regionalNames: { south: 'Ugadi', west: 'Gudi Padwa' },
    description: 'Telugu and Marathi New Year.',
  },
  { key: 'ramNavami', name: 'Ram Navami', regions: ['all', 'north'], description: 'Birth anniversary of Lord Rama.' },
  { key: 'hanuman', name: 'Hanuman Jayanti', regions: ['all', 'north', 'south'], description: 'Birth of Lord Hanuman.' },
  { key: 'akshaya', name: 'Akshaya Tritiya', regions: ['all'], description: 'Auspicious day for new ventures.' },
  { key: 'narasimha', name: 'Narasimha Jayanti', regions: ['all', 'south'], description: 'Appearance of Lord Narasimha.' },
  { key: 'guru', name: 'Guru Purnima', regions: ['all'], description: 'Honoring gurus and teachers.' },
  {
    key: 'bonalu',
    name: 'Bonalu',
    regions: ['south'],
    states: ['Telangana'],
    description: 'Festival honoring Goddess Mahakali; grand processions in Hyderabad.',
  },
  { key: 'nag', name: 'Nag Panchami', regions: ['all', 'west'], description: 'Worship of serpent deities.' },
  { key: 'raksha', name: 'Raksha Bandhan', regions: ['all', 'north', 'west'], description: 'Celebration of sibling bond.' },
  { key: 'janmashtami', name: 'Krishna Janmashtami', regions: ['all'], description: 'Birth of Lord Krishna.' },
  { key: 'ganesh', name: 'Ganesh Chaturthi', regions: ['all', 'west', 'south'], description: 'Birth of Lord Ganesha.' },
  {
    key: 'onam',
    name: 'Onam',
    regions: ['south'],
    states: ['Kerala'],
    description: 'Kerala harvest festival.',
  },
  { key: 'navaratri', name: 'Navaratri begins', regions: ['all'], description: 'Nine nights of Devi worship.' },
  { key: 'dussehra', name: 'Dussehra/Vijayadashami', regions: ['all'], description: 'Victory of good over evil.' },
  { key: 'diwali', name: 'Diwali', regions: ['all'], description: 'Festival of lights and Lakshmi Puja.' },
  { key: 'bhai', name: 'Bhai Dooj', regions: ['all', 'north'], description: 'Brother-sister celebration.' },
  {
    key: 'kartik',
    name: 'Kartik Purnima',
    regions: ['all', 'east'],
    states: ['Uttar Pradesh'],
    description: 'Sacred full moon of Kartik.',
  },
  {
    key: 'vaikuntha',
    name: 'Vaikuntha Ekadashi',
    regions: ['all', 'south'],
    states: ['Tamil Nadu', 'Andhra Pradesh', 'Karnataka'],
    description: 'Auspicious Vishnu fast day.',
  },
];

/** Dates sourced primarily from Drik Panchang Indian calendars (2030–2035). */
const YEAR_DATES = {
  2030: {
    sankranti: '2030-01-14',
    vasant: '2030-02-07',
    shivaratri: '2030-03-02',
    holi: '2030-03-20',
    ugadi: '2030-04-03',
    ramNavami: '2030-04-12',
    hanuman: '2030-04-18',
    akshaya: '2030-05-05',
    narasimha: '2030-05-22',
    guru: '2030-07-15',
    bonalu: '2030-07-20',
    nag: '2030-08-04',
    raksha: '2030-08-13',
    janmashtami: '2030-08-21',
    ganesh: '2030-09-01',
    onam: '2030-09-09',
    navaratri: '2030-09-28',
    dussehra: '2030-10-06',
    diwali: '2030-10-26',
    bhai: '2030-10-28',
    kartik: '2030-11-10',
    vaikuntha: '2030-12-05',
  },
  2031: {
    sankranti: '2031-01-15',
    vasant: '2031-01-27',
    shivaratri: '2031-02-20',
    holi: '2031-03-09',
    ugadi: '2031-03-24',
    ramNavami: '2031-04-01',
    hanuman: '2031-04-08',
    akshaya: '2031-04-26',
    narasimha: '2031-05-12',
    guru: '2031-07-04',
    bonalu: '2031-07-10',
    nag: '2031-07-24',
    raksha: '2031-08-02',
    janmashtami: '2031-08-09',
    ganesh: '2031-09-20',
    onam: '2031-08-30',
    navaratri: '2031-10-17',
    dussehra: '2031-10-25',
    diwali: '2031-11-14',
    bhai: '2031-11-16',
    kartik: '2031-11-28',
    vaikuntha: '2031-12-20',
  },
  2032: {
    sankranti: '2032-01-15',
    vasant: '2032-02-15',
    shivaratri: '2032-03-10',
    holi: '2032-03-27',
    ugadi: '2032-04-11',
    ramNavami: '2032-04-20',
    hanuman: '2032-04-26',
    akshaya: '2032-05-14',
    narasimha: '2032-05-31',
    guru: '2032-07-22',
    bonalu: '2032-07-28',
    nag: '2032-08-12',
    raksha: '2032-08-20',
    janmashtami: '2032-08-28',
    ganesh: '2032-09-08',
    onam: '2032-08-20',
    navaratri: '2032-10-06',
    dussehra: '2032-10-14',
    diwali: '2032-11-02',
    bhai: '2032-11-04',
    kartik: '2032-11-18',
    vaikuntha: '2032-12-28',
  },
  2033: {
    sankranti: '2033-01-14',
    vasant: '2033-02-04',
    shivaratri: '2033-02-27',
    holi: '2033-03-16',
    ugadi: '2033-03-31',
    ramNavami: '2033-04-09',
    hanuman: '2033-04-15',
    akshaya: '2033-05-03',
    narasimha: '2033-05-20',
    guru: '2033-07-12',
    bonalu: '2033-07-18',
    nag: '2033-08-02',
    raksha: '2033-08-10',
    janmashtami: '2033-08-17',
    ganesh: '2033-08-28',
    onam: '2033-09-06',
    navaratri: '2033-09-25',
    dussehra: '2033-10-03',
    diwali: '2033-10-22',
    bhai: '2033-10-25',
    kartik: '2033-11-08',
    vaikuntha: '2033-12-18',
  },
  2034: {
    sankranti: '2034-01-14',
    vasant: '2034-01-24',
    shivaratri: '2034-02-17',
    holi: '2034-03-05',
    ugadi: '2034-03-21',
    ramNavami: '2034-03-30',
    hanuman: '2034-04-05',
    akshaya: '2034-04-23',
    narasimha: '2034-05-09',
    guru: '2034-07-31',
    bonalu: '2034-08-05',
    nag: '2034-08-19',
    raksha: '2034-08-29',
    janmashtami: '2034-09-05',
    ganesh: '2034-09-16',
    onam: '2034-08-28',
    navaratri: '2034-10-14',
    dussehra: '2034-10-22',
    diwali: '2034-11-10',
    bhai: '2034-11-12',
    kartik: '2034-11-26',
    vaikuntha: '2034-12-28',
  },
  2035: {
    sankranti: '2035-01-15',
    vasant: '2035-02-12',
    shivaratri: '2035-03-08',
    holi: '2035-03-24',
    ugadi: '2035-04-09',
    ramNavami: '2035-04-16',
    hanuman: '2035-04-22',
    akshaya: '2035-05-10',
    narasimha: '2035-05-27',
    guru: '2035-07-20',
    bonalu: '2035-07-26',
    nag: '2035-08-09',
    raksha: '2035-08-18',
    janmashtami: '2035-08-26',
    ganesh: '2035-09-05',
    onam: '2035-09-14',
    navaratri: '2035-10-03',
    dussehra: '2035-10-11',
    diwali: '2035-10-30',
    bhai: '2035-11-01',
    kartik: '2035-11-15',
    vaikuntha: '2035-12-27',
  },
};

const USA_DESCRIPTIONS = {
  sankranti: 'Harvest festival; widely celebrated in temples and community halls across the US.',
  vasant: 'Saraswati Puja; popular in schools and cultural centers.',
  shivaratri: 'All-night Shiva worship at temples nationwide.',
  holi: 'Community color festivals hosted by temples and cultural groups.',
  ugadi: 'Telugu and Marathi New Year gatherings in diaspora communities.',
  ramNavami: 'Birth of Lord Rama; bhajan and Ramayana recitals at temples.',
  hanuman: 'Hanuman worship; especially vibrant in Tuesday satsang groups.',
  akshaya: 'Auspicious day for new ventures and gold purchases.',
  narasimha: 'Appearance of Lord Narasimha; observed at Vishnu temples.',
  guru: 'Honoring spiritual teachers; common in ashrams and yoga centers.',
  bonalu: 'Festival honoring Goddess Mahakali; Telangana community celebrations.',
  nag: 'Serpent worship; more common in traditional temple calendars.',
  raksha: 'Sibling bond celebration in homes and community events.',
  janmashtami: 'Midnight Krishna birth celebrations; major temple event nationwide.',
  ganesh: 'Grand Ganesha celebrations at temples and community centers.',
  onam: 'Kerala harvest festival; celebrated in diaspora communities nationwide.',
  navaratri: 'Nine nights of Devi worship; garba and dandiya events across the US.',
  dussehra: 'Victory of good over evil; Ravan dahan at many community events.',
  diwali: 'Festival of lights; Lakshmi Puja and community fireworks.',
  bhai: 'Brother-sister celebration following Diwali.',
  kartik: 'Sacred full moon; Dev Deepavali observances at select temples.',
  vaikuntha: 'Auspicious Vishnu fast day at temples nationwide.',
};

function buildYear(year, locale) {
  const dates = YEAR_DATES[year];
  const yy = String(year).slice(2);
  const prefix = locale === 'usa' ? `usa-${yy}` : yy;

  return INDIA_TEMPLATES.map((template, index) => {
    const parts = [
      `{ id: '${prefix}-${index + 1}', name: '${template.name}', date: '${dates[template.key]}', regions: [${template.regions.map((r) => `'${r}'`).join(', ')}]`,
    ];
    if (template.regionalNames) {
      const names = Object.entries(template.regionalNames)
        .map(([region, name]) => `${region}: '${name}'`)
        .join(', ');
      parts.push(`, regionalNames: { ${names} }`);
    }
    if (template.states) {
      parts.push(`, states: [${template.states.map((s) => `'${s}'`).join(', ')}]`);
    }
    const description = locale === 'usa' ? USA_DESCRIPTIONS[template.key] : template.description;
    parts.push(`, description: '${description}' }`);
    return parts.join('');
  });
}

function emitFile(kind) {
  const locale = kind === 'usa' ? 'usa' : 'india';
  const exportPrefix = kind === 'usa' ? 'usaFestivals' : 'festivals';
  const lines = ["import type { Festival } from '../../types/content';", ''];

  for (const year of Object.keys(YEAR_DATES)) {
    lines.push(`export const ${exportPrefix}${year}: Festival[] = [`);
    for (const entry of buildYear(Number(year), locale)) {
      lines.push(`  ${entry},`);
    }
    lines.push('];', '');
  }

  const exports = Object.keys(YEAR_DATES).map((year) => `...${exportPrefix}${year}`).join(', ');
  lines.push(`export const ALL_${kind === 'usa' ? 'USA_' : ''}FESTIVALS_${year}_RANGE: Festival[] = [${exports}];`);
  return lines.join('\n');
}

console.log('// INDIA');
for (const year of Object.keys(YEAR_DATES)) {
  console.log(`// festivals${year}: ${buildYear(Number(year), 'india').length} entries`);
}

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const indiaBlock = Object.keys(YEAR_DATES)
  .map((year) => {
    const lines = [`export const festivals${year}: Festival[] = [`];
    for (const entry of buildYear(Number(year), 'india')) lines.push(`  ${entry},`);
    lines.push('];');
    return lines.join('\n');
  })
  .join('\n\n');

const usaBlock = Object.keys(YEAR_DATES)
  .map((year) => {
    const lines = [`export const usaFestivals${year}: Festival[] = [`];
    for (const entry of buildYear(Number(year), 'usa')) lines.push(`  ${entry},`);
    lines.push('];');
    return lines.join('\n');
  })
  .join('\n\n');

writeFileSync(
  join(root, 'src/data/festivals/years2030to2035.ts'),
  `import type { Festival } from '../../types/content';\n\n${indiaBlock}\n`,
);
writeFileSync(
  join(root, 'src/data/festivals/usaYears2030to2035.ts'),
  `import type { Festival } from '../../types/content';\n\n${usaBlock}\n`,
);

console.log('Wrote years2030to2035.ts and usaYears2030to2035.ts');
