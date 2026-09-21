const STORAGE_KEY = '2ms_verses';

// ── 31 Evergreen Verses for Automatic Daily Fallback Rotation ───────────────
// When no custom verse is scheduled for a given date, the system auto-serves
// a fresh, inspiring scripture stamped with today's date so the live site
// never appears blank, neglected, or outdated.
export const evergreenVerses = [
  {
    verseText: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths.",
    book: "Proverbs",
    chapter: 3,
    verse: "5-6",
    reflection: "When the way forward seems unclear, relinquishing control to God opens the door to divine direction.",
    tags: ["Trust", "Wisdom", "Guidance"]
  },
  {
    verseText: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.",
    book: "2 Timothy",
    chapter: 1,
    verse: "7",
    reflection: "When anxiety tries to define your moment, remember that God has already equipped you with courage, love, and clarity.",
    tags: ["Courage", "Peace", "Mindset"]
  },
  {
    verseText: "The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters.",
    book: "Psalm",
    chapter: 23,
    verse: "1-2",
    reflection: "Rest in the quiet assurance that your Savior provides everything you need for today and leads your steps into peace.",
    tags: ["Provision", "Rest", "Peace"]
  },
  {
    verseText: "And we know that all things work together for good to those who love God, to those who are the called according to His purpose.",
    book: "Romans",
    chapter: 8,
    verse: "28",
    reflection: "Even unexpected detours and delays are being woven into a divine masterpiece for your growth and victory.",
    tags: ["Purpose", "Trust", "Victory"]
  },
  {
    verseText: "I can do all things through Christ who strengthens me.",
    book: "Philippians",
    chapter: 4,
    verse: "13",
    reflection: "Your capability is not limited by your natural energy, but expanded through the resurrecting power of Christ within you.",
    tags: ["Strength", "Empowerment", "Faith"]
  },
  {
    verseText: "Fear not, for I am with you; be not dismayed, for I am your God. I will strengthen you, yes, I will help you, I will uphold you with My righteous right hand.",
    book: "Isaiah",
    chapter: 41,
    verse: "10",
    reflection: "You never walk alone. The Almighty Creator holds your hand through every high mountain and difficult season.",
    tags: ["Comfort", "Presence", "Strength"]
  },
  {
    verseText: "Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God.",
    book: "Philippians",
    chapter: 4,
    verse: "6",
    reflection: "Replace panic with prayer, and watch the supernatural peace of God guard your heart and mind.",
    tags: ["Prayer", "Peace", "Gratitude"]
  },
  {
    verseText: "Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.",
    book: "Isaiah",
    chapter: 40,
    verse: "31",
    reflection: "Waiting on God is never wasted time; it is where spiritual endurance is forged and heavenly perspective is gained.",
    tags: ["Hope", "Endurance", "Strength"]
  },
  {
    verseText: "'For I know the plans I have for you,' declares the Lord, 'plans to prosper you and not to harm you, plans to give you hope and a future.'",
    book: "Jeremiah",
    chapter: 29,
    verse: "11",
    reflection: "God's intentions toward your life are marked by goodness, restoration, and an eternal purpose.",
    tags: ["Hope", "Future", "Promise"]
  },
  {
    verseText: "Come to Me, all you who labor and are heavy laden, and I will give you rest. Take My yoke upon you and learn from Me.",
    book: "Matthew",
    chapter: 11,
    verse: "28-29",
    reflection: "Jesus does not ask you to carry burdens alone. Bring your exhaustion to Him and receive deep spiritual rest.",
    tags: ["Rest", "Grace", "Comfort"]
  },
  {
    verseText: "Have I not commanded you? Be strong and of good courage; do not be afraid, nor be dismayed, for the Lord your God is with you wherever you go.",
    book: "Joshua",
    chapter: 1,
    verse: "9",
    reflection: "True boldness does not come from self-confidence, but from the unwavering certainty of God's presence beside you.",
    tags: ["Courage", "Faith", "Leadership"]
  },
  {
    verseText: "God is our refuge and strength, a very present help in trouble. Therefore we will not fear, even though the earth be removed.",
    book: "Psalm",
    chapter: 46,
    verse: "1-2",
    reflection: "When worldly circumstances feel unstable, run into the shelter of the Most High where your security is unshakable.",
    tags: ["Refuge", "Security", "Peace"]
  },
  {
    verseText: "Cast all your anxiety on Him, because He cares for you.",
    book: "1 Peter",
    chapter: 5,
    verse: "7",
    reflection: "Every worry you hand over to God is a declaration that His loving care is greater than your trouble.",
    tags: ["Trust", "Care", "Peace"]
  },
  {
    verseText: "Peace I leave with you; My peace I give to you; not as the world gives do I give to you. Let not your heart be troubled, neither let it be afraid.",
    book: "John",
    chapter: 14,
    verse: "27",
    reflection: "Christ offers a tranquility the world cannot manufacture and circumstances cannot steal.",
    tags: ["Peace", "Serenity", "Jesus"]
  },
  {
    verseText: "I will lift up my eyes to the hills—from whence comes my help? My help comes from the Lord, who made heaven and earth.",
    book: "Psalm",
    chapter: 121,
    verse: "1-2",
    reflection: "Lift your gaze above the immediate challenge to the Sovereign God who fashioned the universe.",
    tags: ["Help", "Assurance", "Creation"]
  },
  {
    verseText: "Through the Lord's mercies we are not consumed, because His compassions fail not. They are new every morning; great is Your faithfulness.",
    book: "Lamentations",
    chapter: 3,
    verse: "22-23",
    reflection: "Yesterday's shortcomings are erased by fresh morning mercy. Step into today under the canopy of God's faithfulness.",
    tags: ["Mercy", "Faithfulness", "Grace"]
  },
  {
    verseText: "Your word is a lamp to my feet and a light to my path.",
    book: "Psalm",
    chapter: 119,
    verse: "105",
    reflection: "God illuminates our journey one faithful step at a time. Stay rooted in His timeless truth.",
    tags: ["Word", "Guidance", "Truth"]
  },
  {
    verseText: "The fruit of the Spirit is love, joy, peace, longsuffering, kindness, goodness, faithfulness, gentleness, self-control.",
    book: "Galatians",
    chapter: 5,
    verse: "22-23",
    reflection: "As you abide in Christ, His character naturally blossoms within you, blessing everyone you encounter today.",
    tags: ["Holy Spirit", "Character", "Love"]
  },
  {
    verseText: "Now to Him who is able to do exceedingly abundantly above all that we ask or think, according to the power that works in us.",
    book: "Ephesians",
    chapter: 3,
    verse: "20",
    reflection: "Never limit God to what your imagination can conceive; His grace and power surpass every human expectation.",
    tags: ["Power", "Miracles", "Praise"]
  },
  {
    verseText: "Do not be conformed to this world, but be transformed by the renewing of your mind, that you may prove what is that good and acceptable and perfect will of God.",
    book: "Romans",
    chapter: 12,
    verse: "2",
    reflection: "Allow God's truth to reshape your thinking, aligning your heart with His perfect and fulfilling will.",
    tags: ["Mindset", "Transformation", "Purpose"]
  },
  {
    verseText: "Oh, taste and see that the Lord is good; blessed is the man who trusts in Him!",
    book: "Psalm",
    chapter: 34,
    verse: "8",
    reflection: "God invites you into experiential relationship—draw near today and discover the reality of His tender lovingkindness.",
    tags: ["Goodness", "Blessing", "Joy"]
  },
  {
    verseText: "And He said to me, 'My grace is sufficient for you, for My strength is made perfect in weakness.'",
    book: "2 Corinthians",
    chapter: 12,
    verse: "9",
    reflection: "Your human vulnerability is the very canvas upon which God's supernatural strength shines brightest.",
    tags: ["Grace", "Humility", "Strength"]
  },
  {
    verseText: "He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty. I will say of the Lord, 'He is my refuge and my fortress.'",
    book: "Psalm",
    chapter: 91,
    verse: "1-2",
    reflection: "Abiding in God's presence surrounds your mind and soul with an impenetrable shield of divine protection.",
    tags: ["Protection", "Dwelling", "Safety"]
  },
  {
    verseText: "Let the peace of God rule in your hearts, to which also you were called in one body; and be thankful.",
    book: "Colossians",
    chapter: 3,
    verse: "15",
    reflection: "Let divine peace serve as the umpire in your decisions today, always accompanied by a spirit of gratitude.",
    tags: ["Peace", "Gratitude", "Unity"]
  },
  {
    verseText: "Bless the Lord, O my soul; and all that is within me, bless His holy name! Bless the Lord, O my soul, and forget not all His benefits.",
    book: "Psalm",
    chapter: 103,
    verse: "1-2",
    reflection: "Count your blessings today. Remembering God's past faithfulness anchors your current circumstances in praise.",
    tags: ["Worship", "Thanksgiving", "Memory"]
  },
  {
    verseText: "You will keep him in perfect peace, whose mind is stayed on You, because he trusts in You.",
    book: "Isaiah",
    chapter: 26,
    verse: "3",
    reflection: "Perfect peace is not the absence of trouble, but the presence of an unwavering focus on God.",
    tags: ["Peace", "Focus", "Trust"]
  },
  {
    verseText: "Now faith is the substance of things hoped for, the evidence of things not seen.",
    book: "Hebrews",
    chapter: 11,
    verse: "1",
    reflection: "Faith gives substance to spiritual realities before your eyes can see them. Walk by faith today.",
    tags: ["Faith", "Hope", "Belief"]
  },
  {
    verseText: "He has shown you, O man, what is good; and what does the Lord require of you but to do justly, to love mercy, and to walk humbly with your God?",
    book: "Micah",
    chapter: 6,
    verse: "8",
    reflection: "True godliness is beautifully simple: act with integrity, extend tender mercy, and walk in close, humble fellowship with God.",
    tags: ["Justice", "Mercy", "Humility"]
  },
  {
    verseText: "The Lord is my light and my salvation; whom shall I fear? The Lord is the strength of my life; of whom shall I be afraid?",
    book: "Psalm",
    chapter: 27,
    verse: "1",
    reflection: "Light dispels every shadow of doubt. Stand confident today knowing the Lord Himself is your fortress.",
    tags: ["Light", "Salvation", "Courage"]
  },
  {
    verseText: "Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope by the power of the Holy Spirit.",
    book: "Romans",
    chapter: 15,
    verse: "13",
    reflection: "May your heart overflow with expectant joy as the Holy Spirit ignites fresh hope in your spirit today.",
    tags: ["Hope", "Joy", "Holy Spirit"]
  },
  {
    verseText: "This is the day the Lord has made; we will rejoice and be glad in it.",
    book: "Psalm",
    chapter: 118,
    verse: "24",
    reflection: "No matter what challenges this day presents, it is a gift from God. Choose joy, gratitude, and praise.",
    tags: ["Joy", "Gratitude", "Praise"]
  }
];

// Scheduled Daily Verses Queue (initial seed)
export const seedDailyVerses = [
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

import { isFirebaseConfigured, subscribeCollection, saveDocument, deleteDocument, seedCollectionIfEmpty } from '../firebase.js';

// ── Real-time Firebase Firestore Sync ───────────────────────────────────────
if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('dailyVerses', seedDailyVerses);
  subscribeCollection('dailyVerses', (remoteVerses) => {
    if (remoteVerses && Array.isArray(remoteVerses)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteVerses));
        window.dispatchEvent(new CustomEvent('2ms:verses:updated', { detail: remoteVerses }));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
    }
  });
}

/** Read verses from localStorage; falls back to seed data if cache is empty. */
export function getDailyVerses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) { /* storage unavailable */ }
  return [...seedDailyVerses];
}

/** Persist daily verses array to localStorage only. */
export function saveDailyVerses(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('2ms:verses:updated', { detail: arr }));
    window.dispatchEvent(new Event('storage'));
  } catch (_) {}
}

/** Add or update a scheduled daily verse */
export function upsertDailyVerse(verse) {
  const all = getDailyVerses();
  const idx = all.findIndex(v => v.id === verse.id || v.publishDate === verse.publishDate);
  if (idx >= 0) all[idx] = verse; else all.push(verse);
  saveDailyVerses(all);
  if (isFirebaseConfigured()) {
    saveDocument('dailyVerses', verse.id, verse);
  }
  return all;
}

/** Delete a daily verse from localStorage and Firebase */
export function deleteDailyVerse(id) {
  const all = getDailyVerses().filter(v => v.id !== id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch (_) {}
  if (isFirebaseConfigured()) {
    deleteDocument('dailyVerses', id);
  }
  return all;
}

export function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns an evergreen rotating verse for any given date string (YYYY-MM-DD).
 * Each calendar day reliably maps to a specific scripture so all visitors
 * see the same daily verse even without manual admin scheduling.
 */
export function getEvergreenVerseForDate(dateStr) {
  const targetDate = dateStr || getLocalDateStr();
  let dayNumber = 1;
  try {
    const parts = targetDate.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0])) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const start = new Date(parts[0], 0, 0);
      dayNumber = Math.floor((d - start) / (1000 * 60 * 60 * 24));
    }
  } catch (_) {}

  const idx = Math.abs(dayNumber) % evergreenVerses.length;
  const v = evergreenVerses[idx];
  return {
    ...v,
    id: `evergreen-${targetDate}`,
    publishDate: targetDate,
    isFallback: true
  };
}

/**
 * Gets the active daily verse for a date.
 * If the admin scheduled a custom verse for this date, it returns that verse.
 * If no custom verse was scheduled, it returns an evergreen daily verse stamped
 * with this date. Never returns null/undefined or an outdated past date.
 */
export function getVerseForDate(dateStr) {
  const targetDate = dateStr || getLocalDateStr();
  const all = getDailyVerses();
  const scheduled = all.find(v => v.publishDate === targetDate);
  if (scheduled) {
    return { ...scheduled, isFallback: false };
  }
  return getEvergreenVerseForDate(targetDate);
}

/** Checks whether a custom verse is scheduled for the specified date */
export function hasCustomVerseForDate(dateStr) {
  const targetDate = dateStr || getLocalDateStr();
  return getDailyVerses().some(v => v.publishDate === targetDate);
}

export const scheduledDailyVerses = seedDailyVerses;
export const dailyVerseToday = scheduledDailyVerses[0];
export const dailyVerseArchive = scheduledDailyVerses;
