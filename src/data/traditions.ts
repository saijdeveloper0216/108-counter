export const TRADITION_TIPS = [
  {
    id: '108-sacred',
    title: 'Why 108?',
    body: '108 is sacred in Sanatana Dharma — 108 Upanishads, 108 marma points, and 108 beads on a japa mala. One full round aligns breath, mind, and devotion.',
    icon: '108',
  },
  {
    id: 'mala-japa',
    title: 'Mala Japa',
    body: 'Hold the mala at heart level. Use the middle finger and thumb; do not cross the meru (guru) bead. Chant softly with each count.',
    icon: 'mala',
  },
  {
    id: 'parikrama',
    title: 'Parikrama',
    body: 'Circumambulating a temple or deity 108 times expresses surrender — each step a prayer, each round deepening bhakti.',
    icon: 'walk',
  },
  {
    id: 'harathi',
    title: 'Harathi / Aarti',
    body: 'Waving the lamp before the deity symbolizes offering light to dispel inner darkness. The flame represents knowledge and divine presence.',
    icon: 'flame',
  },
  {
    id: 'masam',
    title: 'Lunar Masams',
    body: 'Hindu months follow the moon. Shravana is dear to Shiva; Kartika for lamps and Vishnu; Ashadha for Guru Purnima and rains.',
    icon: 'moon',
  },
] as const;

export const LUNAR_CALENDAR_INFO = {
  title: 'Hindu lunar calendar',
  body: 'Masams follow the moon, not the Gregorian calendar. Festivals and vratas often align with Purnima (full moon) or Amavasya (new moon) within each masam.',
};

export const APP_TRADITION_PROMISE = {
  title: 'Our commitment',
  body: '108 Counter is here for your daily sadhana — one full mala at a time, or continuous naam jaap when you wish to keep chanting.\n\nWe aim to present Hindu festivals, masams, and shlokas with care and respect, and to keep the app simple, calm, and useful every day. Festival dates can differ by temple or locality; we show India and US calendars and note states where observance is especially common.\n\nWe will keep improving this app. If something should be clearer, more accurate, or newly added, please share your feedback.',
};

export const MASAM_SIGNIFICANCE: Record<string, string> = {
  Chaitra: 'Spring month; Ram Navami and Ugadi. New beginnings and harvest blessings.',
  Vaishakha: 'Akshaya Tritiya and Narasimha Jayanti. Auspicious for dana and new ventures.',
  Jyeshtha: 'Hot month; Vat Savitri vrat. Honouring devotion and marital bond.',
  Ashadha: 'Guru Purnima and start of Chaturmasya. Guru worship and monsoon rains.',
  Shravana: 'Sacred to Lord Shiva. Kanwar yatra, Mangala Gauri, and fasting on Mondays.',
  Bhadrapada: 'Krishna Janmashtami and Ganesh Chaturthi. Bhakti peaks with Ganesha and Krishna.',
  Ashwin: 'Navaratri and Durga Puja. Nine nights of Devi worship across India.',
  Kartika: 'Diwali, Kartik Snan, and Dev Deepavali. Month of lamps and dharma.',
  Margashirsha: 'Bhagavad Gita month; worship of Krishna. Early mornings are especially sacred.',
  Pausha: 'Winter solstice period; Sun worship and Makar Sankranti approach.',
  Magha: 'Maha Shivaratri and Magha Snan. Holy dips and Shiva devotion.',
  Phalguna: 'Holi and end of lunar year festivities. Colours of spring and Holika dahan.',
};

export function getMasamSignificance(masamName: string) {
  const key = masamName.replace(' Masam', '');
  return MASAM_SIGNIFICANCE[key] ?? 'A sacred lunar month in the Hindu calendar for puja, fasting, and festivals.';
}
