// Import the user's supplied edition. Keep the original script and every repeated line.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const folder = path.join(root, 'src/data/shlokas');
const text = fs.readFileSync(path.join(root, 'assets/texts/supplied-lyrics.txt'), 'utf8');
const entries = [
  ['Manidweepa Varnanam', 'manidweepa-varnanam', 'stotra', 'Goddess Bhuvaneshwari'],
  ['Govinda Namaavali', 'govinda-namavali', 'stotra', 'Lord Venkateswara'],
  ['Navagraha Chalisa', 'navagraha-chalisa', 'chalisa', 'Navagraha', 'gods'],
  ['Sri Venkateswara Suprabhatam', 'venkateswara-suprabhatam', 'stotra', 'Lord Venkateswara'],
  ['Durga Chalisa', 'durga-chalisa', 'chalisa', 'Goddess Durga', 'goddesses'],
  ['Sree Annapurna Stotram', 'annapurna-stotram', 'stotra', 'Goddess Annapurna'],
  ['Durga Mata Aarti — Ambe Tu Hai Jagdambe Kali', 'durga-aarti', 'harathi', 'Goddess Durga'],
  ['Shiva Panchakshari Stotram', 'shiva-panchakshari-stotram', 'stotra', 'Lord Shiva'],
  ['Sai Baba Aarti — Guruvaar — Aarti Shri Sai Guruvar Ki', 'sai-guruvara-aarti', 'harathi', 'Sai Baba'],
  ['Sai Baba Kakad Aarti — complete ceremony, including all hymns in order', 'sai-kakad-aarti', 'harathi', 'Sai Baba'],
  ['Sai Baba Dhoop Aarti — complete ceremony, including all hymns in order', 'sai-dhoop-aarti', 'harathi', 'Sai Baba'],
  ['Sai Baba Shej Aarti — complete ceremony, including all hymns in order', 'sai-shej-aarti', 'harathi', 'Sai Baba'],
  ['Chandrasekhara Ashtakam', 'chandrasekhara-ashtakam', 'ashtakam', 'Lord Shiva'],
  ['Anjaneya Dandakam', 'anjaneya-dandakam', 'stotra', 'Lord Hanuman'],
  ['Nava Graha Stotram', 'navagraha-stotram', 'stotra', 'Navagraha'],
];
const headings = [...text.matchAll(/^-\s*([A-Za-z][^\n]+)\n/gm)];
const sectionLabels = new Set(['GODDESSES CHALISA', 'AARTIS AND COMPLETE SAI CEREMONIES']);
if (headings.length !== entries.length) throw Error('Unexpected number of supplied readings');
const supplied = headings.map((match, i) => {
  const [heading, id, category, deity, group] = entries[i];
  if (match[1].trim() !== heading) throw Error(`Unexpected heading: ${match[1]}`);
  const body = text.slice(match.index + match[0].length, headings[i + 1]?.index ?? text.length);
  const lines = body.split(/\r?\n/).map(line => line.trim()).filter(line => line && !/^-+$/.test(line) && !sectionLabels.has(line));
  if (!lines.length || lines.some(line => /[A-Za-z]/.test(line))) throw Error(`Invalid chant body: ${id}`);
  const sourceScript = id === 'durga-aarti' ? 'devanagari' : 'telugu';
  const title = id === 'durga-aarti' ? 'Durga Mata Aarti'
    : id === 'sai-guruvara-aarti' ? 'Sai Baba Aarti — Guruvaar'
    : heading.replace(/ — complete ceremony, including all hymns in order$/, '');
  const description = id === 'sai-kakad-aarti'
    ? 'Aarti Shri Sai Guruvar Ki — supplied Kakad reading.'
    : id === 'durga-aarti' ? 'Ambe Tu Hai Jagdambe Kali.'
    : id === 'sai-guruvara-aarti' ? 'Aarti Shri Sai Guruvar Ki.'
    : id === 'sai-dhoop-aarti' || id === 'sai-shej-aarti' ? 'Ceremony hymns in their supplied order.'
    : 'Devotional reading in seven scripts.';
  return { id, title, category, deity, ...(group && { group }), description, sourceScript, supplied: true, lines };
});
// The earlier four complete chalisas and all other unrelated readings remain.
// Omitted pending chalisas/aartis are never synthesized from the old catalogue.
const ids = new Set(supplied.map(entry => entry.id));
const original = JSON.parse(fs.readFileSync(path.join(folder, 'canonical.json'), 'utf8'));
const retained = original.filter(entry => !entry.supplied && !ids.has(entry.id));
fs.writeFileSync(path.join(folder, 'canonical.json'), JSON.stringify([...retained, ...supplied], null, 2) + '\n');
fs.writeFileSync(path.join(folder, 'catalog.json'), JSON.stringify([...retained, ...supplied].filter(entry => entry.category === 'chalisa').map(({ lines, ...meta }) => meta), null, 2) + '\n');
console.log(`Imported ${supplied.length} supplied readings; retained ${retained.length} existing readings.`);
