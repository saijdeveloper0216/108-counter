// Build chant scripts from one clean original. These are transliterations, not translations.
const fs = require('node:fs');
const path = require('node:path');
const Sanscript = require('@indic-transliteration/sanscript');
const folder = path.join(__dirname, '../src/data/shlokas');
const sources = JSON.parse(fs.readFileSync(path.join(folder, 'canonical.json'), 'utf8'));
const schemes = { sanskrit: 'devanagari', hindi: 'devanagari', english: 'iast', telugu: 'telugu', tamil: 'tamil', kannada: 'kannada', malayalam: 'malayalam' };
const rows = sources.map(({ lines, sourceScript = 'devanagari', sourceUrl, ceremonyLinks, online, ...meta }) => {
 if (!['devanagari', 'telugu'].includes(sourceScript) || !lines.length) throw Error(`Invalid original: ${meta.id}`);
 // Telugu U+0C00 is the combining candrabindu variant absent from Sanscript's map.
 // Normalize only conversion input; the user's original Telugu remains unchanged.
 return { ...meta, sourceScript, languages: Object.fromEntries(Object.entries(schemes).map(([language, scheme]) => [language, lines.map(line => {
  if (scheme === sourceScript) return line;
  let input = sourceScript === 'telugu' ? line.replace(/\u0c00/g, '\u0c01') : line;
  // Tamil lacks a separate candrabindu; use its nasal equivalent rather than
  // letting Sanscript leave a Telugu combining mark in the Tamil text.
  if (sourceScript === 'telugu' && scheme === 'tamil') input = input.replace(/\u0c01/g, '\u0c02');
  return Sanscript.t(input, sourceScript, scheme);
 })])) };
});
const titles = { 'lingashtakam': 'Shri Lingashtakam', 'rudrashtakam': 'Shri Rudrashtakam', 'kalabhairava-ashtakam': 'Shri Kalabhairava Ashtakam', 'ganesha-aarti': 'Shree Ganesh Aarti', 'hanuman-aarti': 'Shree Hanuman Aarti', 'rama-aarti': 'Shree Rama Aarti', 'devi-aarti': 'Devi Aarti — Jai Ambe Gauri' };
for (const row of rows) {
 if (titles[row.id]) row.title = titles[row.id];
 if (row.category === 'ashtakam') row.deity = 'Lord Shiva';
}
if (new Set(rows.map(x => x.id)).size !== rows.length) throw Error('Duplicate reading IDs');
fs.writeFileSync(path.join(folder, 'readings.json'), JSON.stringify(rows, null, 2) + '\n');
console.log(`Generated ${rows.length} offline readings in seven reading scripts.`);
