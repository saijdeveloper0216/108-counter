const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
const { getMasamForDate, getMasamsForMonth, zonedNoon } = require('../src/data/masams.ts');
const { allShlokas, shlokasByCategory } = require('../src/data/shlokas/index.ts');
const transitions = require('../src/data/masamTransitions.json');

test('2026 Drik Panchang Amanta fixtures include Ugadi and the extra Jyeshtha month', () => {
  assert.equal(getMasamForDate('2026-03-18').baseName, 'Phalguna Masam');
  assert.equal(getMasamForDate('2026-03-19').baseName, 'Chaitra Masam');
  assert.equal(getMasamForDate('2027-04-07').baseName, 'Chaitra Masam');
  assert.equal(getMasamForDate('2026-05-17').name, 'Adhika Jyeshtha Masam');
  assert.equal(getMasamForDate('2026-06-15').name, 'Jyeshtha Masam');
  assert.equal(getMasamForDate('2026-10-04').name, 'Bhadrapada Masam');
  assert.deepEqual(getMasamsForMonth('2026-06').map(m => m.name), ['Adhika Jyeshtha Masam', 'Jyeshtha Masam']);
});
test('months use local noon; the same civil day can differ across India and US', () => {
  assert.equal(getMasamForDate('2026-05-16', 'Asia/Kolkata').name, 'Vaishakha Masam');
  assert.equal(getMasamForDate('2026-05-16', 'America/Los_Angeles').name, 'Vaishakha Masam');
  assert.equal(getMasamForDate('2026-04-17', 'Asia/Kolkata').name, 'Chaitra Masam');
  assert.equal(getMasamForDate('2026-04-17', 'America/New_York').name, 'Vaishakha Masam');
  assert.equal(new Date(zonedNoon('2026-07-01', 'America/New_York')).toISOString(), '2026-07-01T16:00:00.000Z');
  assert.equal(new Date(zonedNoon('2026-01-01', 'America/New_York')).toISOString(), '2026-01-01T17:00:00.000Z');
});
test('every supported civil day has a lunar month; boundaries are continuous', () => {
  for (let i = 1; i < transitions.length; i++) assert.equal(transitions[i].startAt, transitions[i-1].endAt);
  for (let t = Date.parse('2025-01-01T12:00:00Z'); t <= Date.parse('2035-12-31T12:00:00Z'); t += 86400000) {
    const date = new Date(t).toISOString().slice(0,10);
    const period = getMasamForDate(date);
    assert.ok(period, date);
    assert.ok(date >= period.startDate && date <= period.endDate, date);
  }
  assert.equal(getMasamForDate('2040-01-01'), undefined);
  assert.deepEqual(getMasamsForMonth('2040-01'), []);
});
test('supplied catalogue replaces pending entries while unrelated readings remain', () => {
  assert.equal(allShlokas.length, 42);
  assert.equal(new Set(allShlokas.map(s => s.id)).size, 42);
  assert.equal(shlokasByCategory.chalisa.length, 6);
  assert.equal(shlokasByCategory.stotra.length, 7);
  assert.equal(shlokasByCategory.harathi.length, 13);
  assert.deepEqual(shlokasByCategory.ashtakam.map(s => s.id), ['lingashtakam','rudrashtakam','kalabhairava-ashtakam','chandrasekhara-ashtakam']);
  const addedChalisas = allShlokas.filter(s => s.category === 'chalisa' && s.supplied);
  assert.deepEqual(addedChalisas.map(s => s.id), ['navagraha-chalisa', 'durga-chalisa']);
  for (const id of ['shani-chalisa','shani-chalisa-sumiron','krishna-chalisa','gopala-chalisa','rama-chalisa','surya-chalisa','vishnu-chalisa','brahma-chalisa','batuka-bhairava-chalisa','bhairava-chalisa','vishwakarma-chalisa','parashurama-chalisa','balaji-chalisa','giriraj-chalisa','ramdev-chalisa','kubera-chalisa','narasimha-chalisa','gayatri-chalisa','lakshmi-chalisa','mahalakshmi-chalisa','ganga-chalisa','saraswati-chalisa','lalita-chalisa','tulasi-chalisa','shitala-chalisa','vindhyeshwari-chalisa','kali-chalisa','mahakali-chalisa','radha-chalisa','vaishno-devi-chalisa','santoshi-chalisa','parvati-chalisa','bagalamukhi-chalisa','annapurna-chalisa','narmada-chalisa','sharda-chalisa','shakambhari-chalisa','sai-baba-chalisa']) assert.ok(!allShlokas.some(s => s.id === id), id);
  const hashes = require('./retained-reading-hashes.json');
  const crypto = require('node:crypto');
  assert.equal(Object.keys(hashes).length, 27);
  for (const [id, hash] of Object.entries(hashes)) {
    const entry = allShlokas.find(s => s.id === id);
    assert.equal(crypto.createHash('sha256').update(entry.languages.hindi.join('\n')).digest('hex'), hash, id);
  }
});
test('every supplied verse and repeated refrain is preserved in its original script', () => {
  const text = fs.readFileSync(require('node:path').join(__dirname, '../assets/texts/supplied-lyrics.txt'), 'utf8');
  const blocks = text.split(/^-\s*[A-Za-z][^\n]*\n/m).slice(1);
  const supplied = allShlokas.filter(s => s.supplied);
  assert.equal(blocks.length, 15);
  assert.equal(supplied.length, 15);
  const counts = [144,116,61,112,42,47,49,24,19,19,230,122,38,54,38];
  blocks.forEach((block, i) => {
    const lines = block.split(/\r?\n/).map(s => s.trim()).filter(s => s && !/^-+$/.test(s) && !/^[A-Z ]+$/.test(s));
    const original = supplied[i].sourceScript === 'telugu' ? 'telugu' : 'hindi';
    assert.equal(lines.length, counts[i], supplied[i].id);
    assert.deepEqual(supplied[i].languages[original], lines, supplied[i].id);
  });
  const kakad = supplied.find(s => s.id === 'sai-kakad-aarti');
  assert.deepEqual(kakad.languages.telugu, supplied.find(s => s.id === 'sai-guruvara-aarti').languages.telugu);
  assert.ok(!/complete ceremony/i.test(kakad.title + kakad.description));
});
test('all readings work offline and each option contains the selected script throughout', () => {
  const ranges = { sanskrit: /[\u0900-\u0963\u0966-\u097f]/, hindi: /[\u0900-\u0963\u0966-\u097f]/, telugu: /[\u0c00-\u0c7f]/, tamil: /[\u0b80-\u0bff]/, kannada: /[\u0c80-\u0cff]/, malayalam: /[\u0d00-\u0d7f]/ };
  for (const entry of allShlokas) {
    assert.ok(!entry.online && !entry.sourceUrl && !entry.ceremonyLinks, entry.id);
    assert.ok(entry.languages.english.length > 0, entry.id);
    assert.ok(entry.languages.english.every(line => /[A-Za-z]/.test(line) && !/[\u0c00-\u0c7f]/.test(line)), entry.id);
    for (const [language, range] of Object.entries(ranges)) {
      const lines = entry.languages[language];
      assert.equal(lines.length, entry.languages.english.length, `${entry.id}:${language}`);
      for (const line of lines) {
        assert.ok(range.test(line), `${entry.id}:${language}:${line}`);
        assert.ok(!/[A-Za-z]/.test(line), `${entry.id}:${language}:${line}`);
        if (language !== 'telugu') assert.ok(!/[\u0c00-\u0c7f]/.test(line), `${entry.id}:${language}:${line}`);
      }
    }
  }
});
