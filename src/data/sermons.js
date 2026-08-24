const STORAGE_KEY = '2ms_sermons';

// ── Seed data (used only if localStorage is empty) ──────────────────────────
const seedSermons = [
  {
    id: "sermon-1",
    title: "When Fear Meets Faith",
    slug: "when-fear-meets-faith",
    preacherId: "p1",
    preacherName: "Pastor John Doe",
    scripture: "Matthew 14:22-33",
    scriptureBook: "Matthew",
    primarySeason: "Easter",
    secondarySeasons: ["Lent", "Holy Week"],
    topics: ["Faith", "Encouragement", "Hope"],
    sermonType: "Devotional",
    duration: "1:58",
    durationSec: 118,
    youtubeUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    youtubeEmbedId: "5qap5aO4i9A",
    thumbnailUrl: "https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg",
    summary: "A 2 minute reminder to step out of the boat and fix your eyes on Jesus when life's waves begin to rise around you.",
    publishDate: "2026-08-20",
    views: 4520,
    featured: true,
    transcript: [
      { time: "0:00", text: "Have you ever felt like the winds of life were blowing so hard that keeping your footing felt impossible?" },
      { time: "0:25", text: "In Matthew 14, Peter was in the middle of a storm. Jesus invited him to walk on water." },
      { time: "0:55", text: "Notice what happened: Peter didn't sink when the storm raged; he sank when he shifted his eyes from Jesus to the waves." },
      { time: "1:25", text: "Fear is real, but faith is greater. Keep your focus on the Savior, who stretches out His hand to lift you up." },
      { time: "1:50", text: "Step out with confidence today. God is with you in every storm." }
    ]
  },
  {
    id: "sermon-2",
    title: "The Power of Small Steps",
    slug: "the-power-of-small-steps",
    preacherId: "p2",
    preacherName: "Rev. Sarah Jenkins",
    scripture: "Zechariah 4:10",
    scriptureBook: "Zechariah",
    primarySeason: "New Year",
    secondarySeasons: ["Advent"],
    topics: ["Encouragement", "Faith", "Hope"],
    sermonType: "Devotional",
    duration: "1:45",
    durationSec: 105,
    youtubeUrl: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    youtubeEmbedId: "2Vv-BfVoq4g",
    thumbnailUrl: "https://img.youtube.com/vi/2Vv-BfVoq4g/maxresdefault.jpg",
    summary: "Do not despise small beginnings. God delights in watching the work begin in your life step by faithful step.",
    publishDate: "2026-08-15",
    views: 3180,
    featured: true,
    transcript: [
      { time: "0:00", text: "We often wait for grand breakthroughs before we celebrate God's presence in our journey." },
      { time: "0:30", text: "Zechariah 4:10 reminds us: 'Do not despise these small beginnings, for the Lord rejoices to see the work begin.'" },
      { time: "1:00", text: "Every faithful choice, every silent prayer, every small act of love compounds under God's grace." },
      { time: "1:35", text: "Trust that small steps taken in obedience lead to grand divine destinations." }
    ]
  },
  {
    id: "sermon-3",
    title: "Anchored in Unshakable Hope",
    slug: "anchored-in-unshakable-hope",
    preacherId: "p3",
    preacherName: "Dr. Marcus Vance",
    scripture: "Hebrews 6:19",
    scriptureBook: "Hebrews",
    primarySeason: "Lent",
    secondarySeasons: ["Easter"],
    topics: ["Hope", "Healing", "Prayer"],
    sermonType: "Teaching",
    duration: "2:00",
    durationSec: 120,
    youtubeUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    youtubeEmbedId: "3JZ_D3ELwOQ",
    thumbnailUrl: "https://img.youtube.com/vi/3JZ_D3ELwOQ/maxresdefault.jpg",
    summary: "Discover how the promise of God acts as a firm, secure anchor for your soul in times of trial and waiting.",
    publishDate: "2026-08-10",
    views: 2890,
    featured: false,
    transcript: [
      { time: "0:00", text: "An anchor isn't tested in calm waters; it is proven when the currents roar." },
      { time: "0:35", text: "Hebrews 6:19 calls our hope in Christ 'an anchor of the soul, firm and secure.'" },
      { time: "1:15", text: "Your anchor isn't your circumstances or your feelings—it is the unchangeable character of God." },
      { time: "1:50", text: "Rest easy today knowing your anchor holds firm behind the veil." }
    ]
  },
  {
    id: "sermon-4",
    title: "Walking in Daily Grace",
    slug: "walking-in-daily-grace",
    preacherId: "p4",
    preacherName: "Minister David King",
    scripture: "2 Corinthians 12:9",
    scriptureBook: "2 Corinthians",
    primarySeason: "Pentecost",
    secondarySeasons: ["Lent"],
    topics: ["Grace", "Forgiveness", "Encouragement"],
    sermonType: "Devotional",
    duration: "1:52",
    durationSec: 112,
    youtubeUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    youtubeEmbedId: "L_LUpnjgPso",
    thumbnailUrl: "https://img.youtube.com/vi/L_LUpnjgPso/maxresdefault.jpg",
    summary: "God's grace is not just for salvation; it is daily empowerment when your own strength runs dry.",
    publishDate: "2026-08-05",
    views: 1940,
    featured: false,
    transcript: [
      { time: "0:00", text: "When Paul asked God to remove his thorn, Jesus replied: 'My grace is sufficient for you.'" },
      { time: "0:40", text: "Grace means God gives you strength right where you are weakest." },
      { time: "1:20", text: "Stop trying to carry tomorrow's burden with today's strength. God's grace renews morning by morning." }
    ]
  },
  {
    id: "sermon-5",
    title: "Light in the Darkness",
    slug: "light-in-the-darkness",
    preacherId: "p1",
    preacherName: "Pastor John Doe",
    scripture: "John 1:5",
    scriptureBook: "John",
    primarySeason: "Christmas",
    secondarySeasons: ["Advent"],
    topics: ["Salvation", "Hope", "Faith"],
    sermonType: "Evangelistic",
    duration: "1:59",
    durationSec: 119,
    youtubeUrl: "https://www.youtube.com/watch?v=e-ORhEE9VVg",
    youtubeEmbedId: "e-ORhEE9VVg",
    thumbnailUrl: "https://img.youtube.com/vi/e-ORhEE9VVg/maxresdefault.jpg",
    summary: "The light shines in the darkness, and the darkness can never extinguish it. A message of victory.",
    publishDate: "2026-07-28",
    views: 5120,
    featured: true,
    transcript: [
      { time: "0:00", text: "Light doesn't have to argue with darkness; it simply shines, and darkness vanishes." },
      { time: "0:45", text: "John 1:5 declares that Christ's light overcome every shadow of defeat." },
      { time: "1:30", text: "Be a light bearer in your home, community, and workplace today." }
    ]
  },
  {
    id: "sermon-6",
    title: "The Good Shepherd's Voice",
    slug: "the-good-shepherds-voice",
    preacherId: "p2",
    preacherName: "Rev. Sarah Jenkins",
    scripture: "John 10:27",
    scriptureBook: "John",
    primarySeason: "Easter",
    secondarySeasons: ["Pentecost"],
    topics: ["Prayer", "Healing", "Faith"],
    sermonType: "Expository",
    duration: "1:48",
    durationSec: 108,
    youtubeUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    youtubeEmbedId: "fJ9rUzIMcZQ",
    thumbnailUrl: "https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
    summary: "In a world filled with noisy opinions, tune your heart to hear the gentle guidance of the Good Shepherd.",
    publishDate: "2026-07-14",
    views: 2310,
    featured: false,
    transcript: [
      { time: "0:00", text: "My sheep hear My voice, and I know them, and they follow Me." },
      { time: "0:35", text: "Silence the clutter of social media and daily anxiety to listen to His whisper." },
      { time: "1:20", text: "He leads you beside still waters and restores your soul." }
    ]
  }
];

// ── localStorage-backed CMS store ───────────────────────────────────────────

/** Read sermons from localStorage; seeds from static data on first run. */
export function getSermons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* storage unavailable */ }
  saveSermons(seedSermons);
  return [...seedSermons];
}

/** Persist sermons array to localStorage. */
export function saveSermons(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (_) {}
}

/** Add or update a sermon (matched by id). Returns updated array. */
export function upsertSermon(sermon) {
  const all = getSermons();
  const idx = all.findIndex(s => s.id === sermon.id);
  if (idx >= 0) all[idx] = sermon; else all.unshift(sermon);
  saveSermons(all);
  return all;
}

/** Remove a sermon by id. Returns updated array. */
export function deleteSermon(id) {
  const all = getSermons().filter(s => s.id !== id);
  saveSermons(all);
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
