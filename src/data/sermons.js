const STORAGE_KEY = '2ms_sermons';

// ── Seed data (curated real videos from @2MinuteSermonP channel) ─────────────
const seedSermons = [
  {
    id: "sermon-1",
    title: 'Open the Door',
    slug: 'open-the-door',
    preacherId: "p1",
    preacherName: "Pastor Anany Kasongo",
    scripture: "Revelation 3:20",
    scriptureBook: "Revelation",
    primarySeason: "Ordinary Time",
    secondarySeasons: ["Advent"],
    topics: ["Faith", "Salvation", "Prayer"],
    sermonType: "Devotional",
    duration: "2:54",
    durationSec: 174,
    youtubeUrl: "https://www.youtube.com/watch?v=hLcm8-yN9iU",
    youtubeEmbedId: "hLcm8-yN9iU",
    thumbnailUrl: "https://img.youtube.com/vi/hLcm8-yN9iU/hqdefault.jpg",
    summary: "Here I am! I stand at the door and knock. If anyone hears My voice and opens the door, I will come in and eat with that person.",
    publishDate: "2024-06-01",
    views: 2450,
    featured: true,
    transcript: [
      { time: "0:00", text: "Jesus stands at the door of your heart, waiting for your invitation." },
      { time: "0:45", text: "He never forces His way into our lives; He honors our free will and speaks with gentle grace." },
      { time: "1:30", text: "Open the door to Him today in prayer and experience His transformative fellowship." }
    ]
  },
  {
    id: "sermon-2",
    title: 'The Grace of God',
    slug: 'the-grace-of-god',
    preacherId: "p5",
    preacherName: "Evangelist Narcisse Kyakutala",
    scripture: "Ephesians 2:8-9",
    scriptureBook: "Ephesians",
    primarySeason: "Easter",
    secondarySeasons: ["Lent"],
    topics: ["Grace", "Salvation", "Faith"],
    sermonType: "Teaching",
    duration: "2:03",
    durationSec: 123,
    youtubeUrl: "https://www.youtube.com/watch?v=nYIStY63JUc",
    youtubeEmbedId: "nYIStY63JUc",
    thumbnailUrl: "https://img.youtube.com/vi/nYIStY63JUc/hqdefault.jpg",
    summary: "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God, not of works.",
    publishDate: "2024-06-10",
    views: 1890,
    featured: true,
    transcript: [
      { time: "0:00", text: "Grace is God's unmerited favor poured out upon us through Christ." },
      { time: "0:40", text: "You cannot earn it, nor can you lose it when you place your complete trust in His cross." },
      { time: "1:20", text: "Rest in His sufficient grace today and walk in confidence as His beloved child." }
    ]
  },
  {
    id: "sermon-3",
    title: 'Is Anything Too Hard for the Lord?',
    slug: 'is-anything-too-hard-for-the-lord',
    preacherId: "p4",
    preacherName: "Preacher Kerith Meya",
    scripture: "Jeremiah 32:27",
    scriptureBook: "Jeremiah",
    primarySeason: "Pentecost",
    secondarySeasons: ["Ordinary Time"],
    topics: ["Faith", "Hope", "Encouragement"],
    sermonType: "Devotional",
    duration: "1:48",
    durationSec: 108,
    youtubeUrl: "https://www.youtube.com/watch?v=04Dnxdaxphc",
    youtubeEmbedId: "04Dnxdaxphc",
    thumbnailUrl: "https://img.youtube.com/vi/04Dnxdaxphc/hqdefault.jpg",
    summary: "I am the Lord, the God of all mankind. Is anything too hard for Me? A timely encouragement for impossible situations.",
    publishDate: "2024-06-18",
    views: 2140,
    featured: true,
    transcript: [
      { time: "0:00", text: "When life presents hurdles that seem insurmountable, remember who holds tomorrow." },
      { time: "0:35", text: "God posed the question to Abraham and Jeremiah: 'Is anything too hard for Me?'" },
      { time: "1:15", text: "Hand your impossibilities to God today; what is impossible with man is possible with Him." }
    ]
  },
  {
    id: "sermon-4",
    title: 'We Will Land Safely',
    slug: 'we-will-land-safely',
    preacherId: "p2",
    preacherName: "Pastor Bellarmee Milosi",
    scripture: "Acts 27:44",
    scriptureBook: "Acts",
    primarySeason: "Ordinary Time",
    secondarySeasons: ["Lent"],
    topics: ["Hope", "Encouragement", "Faith"],
    sermonType: "Teaching",
    duration: "2:15",
    durationSec: 135,
    youtubeUrl: "https://www.youtube.com/watch?v=NUIU35h0E-c",
    youtubeEmbedId: "NUIU35h0E-c",
    thumbnailUrl: "https://img.youtube.com/vi/NUIU35h0E-c/hqdefault.jpg",
    summary: "Even when the tempest rages and the ship breaks apart, God's promise guarantees that everyone will reach the shore safely.",
    publishDate: "2024-06-25",
    views: 2680,
    featured: true,
    transcript: [
      { time: "0:00", text: "In the middle of the violent storm, Paul declared courage: no life would be lost." },
      { time: "0:50", text: "Your current situation may feel turbulent, but God has already secured your safe landing." },
      { time: "1:40", text: "Trust the Captain of your soul; you will arrive safely at your God-given destination." }
    ]
  },
  {
    id: "sermon-5",
    title: 'I Will Restore You, I Am God',
    slug: 'i-will-restore-you-i-am-god',
    preacherId: "p6",
    preacherName: "Minister Carolyn Kwon",
    scripture: "Joel 2:25",
    scriptureBook: "Joel",
    primarySeason: "Lent",
    secondarySeasons: ["Easter"],
    topics: ["Healing", "Grace", "Hope"],
    sermonType: "Devotional",
    duration: "2:40",
    durationSec: 160,
    youtubeUrl: "https://www.youtube.com/watch?v=BlJg9QPchLc",
    youtubeEmbedId: "BlJg9QPchLc",
    thumbnailUrl: "https://img.youtube.com/vi/BlJg9QPchLc/hqdefault.jpg",
    summary: "I will restore to you the years that the swarming locust has eaten. God's divine promise of total restoration and renewal.",
    publishDate: "2024-07-02",
    views: 1980,
    featured: false,
    transcript: [
      { time: "0:00", text: "No season of loss is beyond God's miraculous power to redeem and restore." },
      { time: "0:55", text: "The Lord promises to repay the years stolen by heartbreak, delay, or grief." },
      { time: "1:50", text: "Lift your head up high; God is releasing fresh vitality and peace over your life." }
    ]
  },
  {
    id: "sermon-6",
    title: "The Good Shepherd",
    slug: "the-good-shepherd-part-1",
    preacherId: "p7",
    preacherName: "Pastor Olalekan",
    scripture: "Psalm 23:1",
    scriptureBook: "Psalms",
    primarySeason: "Ordinary Time",
    secondarySeasons: ["Easter", "Pentecost"],
    topics: ["Faith", "Encouragement", "Hope", "Prayer"],
    sermonType: "Devotional",
    duration: "2:05",
    durationSec: 125,
    youtubeUrl: "https://www.youtube.com/watch?v=o8Z5th2SBL4",
    youtubeEmbedId: "o8Z5th2SBL4",
    thumbnailUrl: "https://img.youtube.com/vi/o8Z5th2SBL4/hqdefault.jpg",
    summary: "Discover the comforting truth of Psalm 23: The Lord is your Shepherd, you lack nothing when He guides your path.",
    publishDate: "2024-03-15",
    views: 1820,
    featured: false,
    transcript: [
      { time: "0:00", text: "The Lord is my shepherd; I shall not want. What a profound declaration of complete provision." },
      { time: "0:30", text: "When life becomes uncertain, the Good Shepherd does not abandon His flock." },
      { time: "1:15", text: "He leads you into green pastures and restores your inner peace." },
      { time: "1:50", text: "Walk with confidence today knowing the Shepherd is watching over your every step." }
    ]
  },
  {
    id: "sermon-7",
    title: "The Good Shepherd's Voice",
    slug: "the-good-shepherds-voice",
    preacherId: "p8",
    preacherName: "Rev. Ivan Milosi",
    scripture: "John 10:27",
    scriptureBook: "John",
    primarySeason: "Easter",
    secondarySeasons: ["Lent"],
    topics: ["Hope", "Faith", "Grace"],
    sermonType: "Teaching",
    duration: "2:10",
    durationSec: 130,
    youtubeUrl: "https://www.youtube.com/watch?v=syFym7O3izo",
    youtubeEmbedId: "syFym7O3izo",
    thumbnailUrl: "https://img.youtube.com/vi/syFym7O3izo/hqdefault.jpg",
    summary: "My sheep hear My voice, and I know them, and they follow Me. Learning to tune out the world and hear Christ clearly.",
    publishDate: "2024-03-22",
    views: 1450,
    featured: false,
    transcript: [
      { time: "0:00", text: "In a world filled with endless noise, whose voice are you giving your attention to?" },
      { time: "0:40", text: "Jesus said, 'My sheep hear My voice, and I know them.' Intimacy with God starts with listening." },
      { time: "1:20", text: "Quiet your heart today and allow His gentle whisper to lead you beside still waters." }
    ]
  },
  {
    id: "sermon-8",
    title: "Be Connected",
    slug: "be-connected",
    preacherId: "p1",
    preacherName: "Pastor Anany Kasongo",
    scripture: "John 15:5",
    scriptureBook: "John",
    primarySeason: "Pentecost",
    secondarySeasons: ["Ordinary Time"],
    topics: ["Prayer", "Faith", "Encouragement"],
    sermonType: "Devotional",
    duration: "2:12",
    durationSec: 132,
    youtubeUrl: "https://www.youtube.com/watch?v=jdPRVBB_3ps",
    youtubeEmbedId: "jdPRVBB_3ps",
    thumbnailUrl: "https://img.youtube.com/vi/jdPRVBB_3ps/hqdefault.jpg",
    summary: "I am the vine; you are the branches. Remaining vital and fruitful requires staying rooted in Christ each day.",
    publishDate: "2024-04-05",
    views: 2340,
    featured: false,
    transcript: [
      { time: "0:00", text: "A branch cannot bear fruit by itself; it must remain connected to the vine." },
      { time: "0:45", text: "Whatever you are facing today, don't try to bear fruit in your own strength." },
      { time: "1:30", text: "Stay connected in prayer, stay connected in His Word, and life will flow through you." }
    ]
  },
  {
    id: "sermon-9",
    title: "God Is Doing Something New",
    slug: "god-is-doing-something-new",
    preacherId: "p9",
    preacherName: "Evangelist Paul Besong",
    scripture: "Isaiah 43:18-19",
    scriptureBook: "Isaiah",
    primarySeason: "New Year",
    secondarySeasons: ["Advent"],
    topics: ["Hope", "Encouragement", "Faith"],
    sermonType: "Evangelistic",
    duration: "2:41",
    durationSec: 161,
    youtubeUrl: "https://www.youtube.com/watch?v=CxvbY7Quvjs",
    youtubeEmbedId: "CxvbY7Quvjs",
    thumbnailUrl: "https://img.youtube.com/vi/CxvbY7Quvjs/hqdefault.jpg",
    summary: "Forget the former things; do not dwell on the past. See, I am doing a new thing! Now it springs up.",
    publishDate: "2024-05-14",
    views: 1910,
    featured: false,
    transcript: [
      { time: "0:00", text: "God is not finished writing your story. Today is a fresh page in His divine purpose." },
      { time: "0:50", text: "Release the disappointment of yesterday so your hands are open to receive what God is doing now." },
      { time: "1:50", text: "He makes a way in the wilderness and streams in the wasteland." }
    ]
  },
  {
    id: "sermon-10",
    title: "Painting Jesus in Your Heart",
    slug: "painting-jesus-in-your-heart",
    preacherId: "p3",
    preacherName: "Preacher Lievin Nsuka",
    scripture: "Galatians 3:1",
    scriptureBook: "Galatians",
    primarySeason: "Lent",
    secondarySeasons: ["Easter"],
    topics: ["Grace", "Salvation", "Faith"],
    sermonType: "Teaching",
    duration: "2:35",
    durationSec: 155,
    youtubeUrl: "https://www.youtube.com/watch?v=Gdi5Saz5voQ",
    youtubeEmbedId: "Gdi5Saz5voQ",
    thumbnailUrl: "https://img.youtube.com/vi/Gdi5Saz5voQ/hqdefault.jpg",
    summary: "Clearly portraying Christ crucified in our daily consciousness so that grace and truth govern our lives.",
    publishDate: "2024-05-14",
    views: 1780,
    featured: false,
    transcript: [
      { time: "0:00", text: "Before whose eyes Jesus Christ was clearly portrayed among you as crucified." },
      { time: "0:50", text: "When Christ is vivid in your thoughts, worry and legalism lose their grip." },
      { time: "1:40", text: "Keep the cross before your eyes, for that is the bedrock of our freedom and peace." }
    ]
  }
];

import { isFirebaseConfigured, subscribeCollection, saveDocument, deleteDocument, seedCollectionIfEmpty } from '../firebase.js';

// ── Real-time Firebase Firestore Sync ───────────────────────────────────────
if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('sermons', seedSermons);
  subscribeCollection('sermons', (remoteSermons) => {
    if (remoteSermons && remoteSermons.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteSermons));
        window.dispatchEvent(new CustomEvent('2ms:sermons:updated', { detail: remoteSermons }));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
    }
  });
}

// ── localStorage & Firebase CMS store ────────────────────────────────────────

const LEGACY_PLACEHOLDER_IDS = ['5qap5aO4i9A', '2Vv-BfVoq4g', '3JZ_D3ELwOQ', 'L_LUpnjgPso', 'e-ORhEE9VVg', 'fJ9rUzIMcZQ'];

/** Read sermons from localStorage; seeds from static data on first run or auto-upgrades placeholders. */
export function getSermons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const hasPlaceholders = Array.isArray(parsed) && parsed.some(s => LEGACY_PLACEHOLDER_IDS.includes(s.youtubeEmbedId));
      if (!hasPlaceholders && Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) { /* storage unavailable */ }
  saveSermons(seedSermons);
  return [...seedSermons];
}

/** Persist sermons array to localStorage and Firebase if configured. */
export function saveSermons(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (_) {}
}

/** Add or update a sermon (matched by id). Returns updated array. */
export function upsertSermon(sermon) {
  const all = getSermons();
  const idx = all.findIndex(s => s.id === sermon.id);
  if (idx >= 0) all[idx] = sermon; else all.unshift(sermon);
  saveSermons(all);
  if (isFirebaseConfigured()) {
    saveDocument('sermons', sermon.id, sermon);
  }
  return all;
}

/** Remove a sermon by id. Returns updated array. */
export function deleteSermon(id) {
  const all = getSermons().filter(s => s.id !== id);
  saveSermons(all);
  if (isFirebaseConfigured()) {
    deleteDocument('sermons', id);
  }
  return all;
}

/** Extract a YouTube video ID from any URL format or bare 11-char ID. */
export function extractVideoId(input) {
  const s = (input || '').trim();
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : (s.length === 11 ? s : null);
}

/** Return the highest-quality YouTube thumbnail URL for a video ID. */
export function ytThumb(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/** Parse a "M:SS" string to total seconds. */
export function durationToSeconds(str) {
  const parts = (str || '0:00').split(':').map(Number);
  return parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
}

// Named export for backwards compatibility
export const sermons = seedSermons;
