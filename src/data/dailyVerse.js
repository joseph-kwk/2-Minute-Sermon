const STORAGE_KEY = '2ms_verses';

// Scheduled Daily Verses Queue (Keyed by YYYY-MM-DD)
const seedDailyVerses = [
  {
    id: "dv-2026-08-23",
    publishDate: "2026-08-23",
    verseText: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.",
    book: "2 Timothy",
    chapter: 1,
    verse: "7",
    reflection: "When anxiety tries to define your moment, remember that God has already equipped you with courage, divine strength, and clarity.",
    tags: ["Courage", "Peace", "Mindset"]
  },
  {
    id: "dv-2026-08-24",
    publishDate: "2026-08-24",
    verseText: "The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters.",
    book: "Psalm",
    chapter: 23,
    verse: "1-2",
    reflection: "Rest in the quiet assurance that your Savior provides everything you need for today and leads your steps into peace.",
    tags: ["Provision", "Rest", "Peace"]
  },
  {
    id: "dv-2026-08-25",
    publishDate: "2026-08-25",
    verseText: "And we know that all things work together for good to those who love God, to those who are the called according to His purpose.",
    book: "Romans",
    chapter: 8,
    verse: "28",
    reflection: "Even delayed answers and unexpected turns are being woven into a divine masterpiece for your victory.",
    tags: ["Purpose", "Trust", "Victory"]
  },
  {
    id: "dv-2026-08-26",
    publishDate: "2026-08-26",
    verseText: "I can do all things through Christ who strengthens me.",
    book: "Philippians",
    chapter: 4,
    verse: "13",
    reflection: "Your capability is not limited by your natural energy, but expanded through the resurrecting power of Christ within you.",
    tags: ["Strength", "Empowerment"]
  },
  {
    id: "dv-2026-08-27",
    publishDate: "2026-08-27",
    verseText: "Fear not, for I am with you; be not dismayed, for I am your God. I will strengthen you, yes, I will help you, I will uphold you with My righteous right hand.",
    book: "Isaiah",
    chapter: 41,
    verse: "10",
    reflection: "You never walk alone. The Almighty Creator holds your hand through every high mountain and dark valley.",
    tags: ["Comfort", "Presence"]
  },
  {
    id: "dv-2026-08-28",
    publishDate: "2026-08-28",
    verseText: "Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God.",
    book: "Philippians",
    chapter: 4,
    verse: "6",
    reflection: "Replace panic with prayer, and watch the supernatural peace of God guard your heart and mind.",
    tags: ["Prayer", "Peace"]
  }
];

/** Read verses from localStorage; seeds from static data on first run. */
export function getDailyVerses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* storage unavailable */ }
  saveDailyVerses(seedDailyVerses);
  return [...seedDailyVerses];
}

/** Persist daily verses array to localStorage. */
export function saveDailyVerses(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (_) {}
}

export const scheduledDailyVerses = seedDailyVerses;


export const dailyVerseToday = scheduledDailyVerses[0];
export const dailyVerseArchive = scheduledDailyVerses;
