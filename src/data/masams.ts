import transitions from './masamTransitions.json';

export type MasamPeriod = {
  id: string;
  name: string;
  baseName: string;
  teluguName: string;
  startDate: string;
  endDate: string;
  startAt: string;
  endAt: string;
  adhika: boolean;
};

const TELUGU: Record<string, string> = {
  Chaitra: 'చైత్ర', Vaishakha: 'వైశాఖ', Jyeshtha: 'జ్యేష్ఠ', Ashadha: 'ఆషాఢ',
  Shravana: 'శ్రావణ', Bhadrapada: 'భాద్రపద', Ashwina: 'ఆశ్వయుజ', Kartika: 'కార్తీక',
  Margashirsha: 'మార్గశిర', Pausha: 'పుష్య', Magha: 'మాఘ', Phalguna: 'ఫాల్గుణ',
};
const INDIA = 'Asia/Kolkata';
const FIRST_DATE = '2025-01-01';
const LAST_DATE = '2035-12-31';
const formatters = new Map<string, Intl.DateTimeFormat>();
function partsAt(instant: number, timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    formatters.set(timeZone, formatter);
  }
  return Object.fromEntries(formatter.formatToParts(new Date(instant)).map(p => [p.type, p.value]));
}
/** Resolve a civil date at noon in the selected region, including US daylight saving. */
export function zonedNoon(date: string, timeZone = INDIA): number {
  const desired = Date.parse(`${date}T12:00:00Z`);
  let instant = desired;
  for (let i = 0; i < 3; i++) {
    const p = partsAt(instant, timeZone);
    const local = Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);
    instant += desired - local;
  }
  return instant;
}
function shiftDate(date: string, days: number) {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}
function localDate(instant: number, timeZone: string) {
  const p = partsAt(instant, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}
function periodAt(index: number, timeZone: string): MasamPeriod {
  const t = transitions[index];
  const start = Date.parse(t.startAt), end = Date.parse(t.endAt);
  let startDate = localDate(start, timeZone), endDate = localDate(end, timeZone);
  if (zonedNoon(startDate, timeZone) < start) startDate = shiftDate(startDate, 1);
  if (zonedNoon(endDate, timeZone) >= end) endDate = shiftDate(endDate, -1);
  const baseName = `${t.month === 'Ashwina' ? 'Ashwin' : t.month} Masam`;
  return { id: `${t.startAt}-${t.month}`, name: `${t.adhika ? 'Adhika ' : ''}${baseName}`, baseName,
    teluguName: `${t.adhika ? 'అధిక ' : ''}${TELUGU[t.month]} మాసం`, startDate, endDate,
    startAt: t.startAt, endAt: t.endAt, adhika: t.adhika };
}
export const MASAM_PERIODS: MasamPeriod[] = transitions.map((_, i) => periodAt(i, INDIA));
export function getMasamForDate(date: string, timeZone = INDIA): MasamPeriod | undefined {
  if (date < FIRST_DATE || date > LAST_DATE || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  const noon = zonedNoon(date, timeZone);
  const i = transitions.findIndex(t => noon >= Date.parse(t.startAt) && noon < Date.parse(t.endAt));
  return i < 0 ? undefined : periodAt(i, timeZone);
}
export function getMasamsForMonth(monthKey: string, timeZone = INDIA): MasamPeriod[] {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return [];
  const [year, month] = monthKey.split('-').map(Number);
  if (year < 2025 || year > 2035 || month < 1 || month > 12) return [];
  const first = zonedNoon(`${monthKey}-01`, timeZone);
  const last = zonedNoon(`${monthKey}-${new Date(Date.UTC(year, month, 0)).getUTCDate()}`, timeZone);
  return transitions.flatMap((t, i) => Date.parse(t.startAt) <= last && Date.parse(t.endAt) > first ? [periodAt(i, timeZone)] : []);
}
export function getMasamMarkedDates(monthKey: string, timeZone = INDIA) {
  const marks: Record<string, { customStyles: { container: object; text: object } }> = {};
  getMasamsForMonth(monthKey, timeZone).forEach((masam, i) => {
    for (let date = masam.startDate; date <= masam.endDate; date = shiftDate(date, 1)) {
      if (date.slice(0, 7) === monthKey) marks[date] = { customStyles: {
        container: { backgroundColor: ['rgba(255,153,51,0.12)', 'rgba(255,215,0,0.1)'][i % 2], borderRadius: 8 },
        text: { color: '#FFF8E7', fontWeight: '600' },
      } };
    }
  });
  return marks;
}
