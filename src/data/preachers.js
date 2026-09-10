const STORAGE_KEY = '2ms_preachers';

const seedPreachers = [
  {
    id: "p1",
    name: "Pastor Anany Kasongo",
    slug: "anany-kasongo",
    denomination: "Baptist / Methodist",
    country: "United Kingdom",
    specialties: ["Faith", "Kingdom Authority", "Prayer"],
    photoUrl: "https://ui-avatars.com/api/?name=Anany+Kasongo&background=C62828&color=fff&size=200",
    bio: "Board's President & Founder. Assistant Pastor at Allington Baptist Church, Accredited Preacher in the Britain Methodist Church, Co-founder of Crossover Project UK."
  },
  {
    id: "p2",
    name: "Pastor Bellarmee Milosi",
    slug: "bellarmee-milosi",
    denomination: "United Methodist",
    country: "United States / Philippines",
    specialties: ["Hope", "Spiritual Growth", "Worship"],
    photoUrl: "https://ui-avatars.com/api/?name=Bellarmee+Milosi&background=C62828&color=fff&size=200",
    bio: "Executive Coordinator & Co-Founder. Licensed Pastor in the United Methodist Church, Gospel Singer/Songwriter & Worship Leader."
  },
  {
    id: "p3",
    name: "Preacher Lievin Nsuka",
    slug: "lievin-nsuka",
    denomination: "Evangelical",
    country: "Democratic Republic of Congo",
    specialties: ["Grace", "Salvation", "Discipleship"],
    photoUrl: "https://ui-avatars.com/api/?name=Lievin+Nsuka&background=2E7D32&color=fff&size=200",
    bio: "Senior Preacher's Network Coordinator. Passionate about communicating Christ crucified with clarity and depth."
  },
  {
    id: "p4",
    name: "Preacher Kerith Meya",
    slug: "kerith-meya",
    denomination: "Evangelical",
    country: "United States",
    specialties: ["Faith", "Hope", "Encouragement"],
    photoUrl: "https://ui-avatars.com/api/?name=Kerith+Meya&background=6A1B9A&color=fff&size=200",
    bio: "Associate Preacher's Network Coordinator. Dedicated to helping believers trust God through impossible situations."
  },
  {
    id: "p5",
    name: "Evangelist Narcisse Kyakutala",
    slug: "narcisse-kyakutala",
    denomination: "Pentecostal",
    country: "United States",
    specialties: ["Grace", "Salvation", "Holy Spirit"],
    photoUrl: "https://ui-avatars.com/api/?name=Narcisse+Kyakutala&background=1565C0&color=fff&size=200",
    bio: "Contributing minister preaching the transformative power of God's unmerited grace."
  },
  {
    id: "p6",
    name: "Minister Carolyn Kwon",
    slug: "carolyn-kwon",
    denomination: "Nondenominational",
    country: "United States",
    specialties: ["Healing", "Restoration", "Grace"],
    photoUrl: "https://ui-avatars.com/api/?name=Carolyn+Kwon&background=EF6C00&color=fff&size=200",
    bio: "Contributing minister bringing hope and divine restoration messages to hurting hearts worldwide."
  },
  {
    id: "p7",
    name: "Pastor Olalekan",
    slug: "pastor-olalekan",
    denomination: "Nondenominational",
    country: "Nigeria",
    specialties: ["Faith", "Encouragement", "Prayer"],
    photoUrl: "https://ui-avatars.com/api/?name=Pastor+Olalekan&background=00838F&color=fff&size=200",
    bio: "Contributing preacher delivering the foundational 'Good Shepherd' devotions for 2-Minute Sermon."
  },
  {
    id: "p8",
    name: "Rev. Ivan Milosi",
    slug: "rev-ivan-milosi",
    denomination: "Methodist",
    country: "United States",
    specialties: ["Teaching", "Hope", "Spiritual Discipline"],
    photoUrl: "https://ui-avatars.com/api/?name=Ivan+Milosi&background=4527A0&color=fff&size=200",
    bio: "Contributing minister exploring discipleship, hearing God's voice, and Christian living."
  },
  {
    id: "p9",
    name: "Evangelist Paul Besong",
    slug: "paul-besong",
    denomination: "Evangelical",
    country: "Cameroon / UK",
    specialties: ["Evangelism", "Hope", "Encouragement"],
    photoUrl: "https://ui-avatars.com/api/?name=Paul+Besong&background=D84315&color=fff&size=200",
    bio: "Contributing minister delivering the Freestyle Sermon series on God's new seasons."
  }
];

import { isFirebaseConfigured, subscribeCollection, saveDocument, deleteDocument, seedCollectionIfEmpty } from '../firebase.js';

// ── Real-time Firebase Firestore Sync ───────────────────────────────────────
if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('preachers', seedPreachers);
  subscribeCollection('preachers', (remotePreachers) => {
    if (remotePreachers && remotePreachers.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remotePreachers));
        window.dispatchEvent(new CustomEvent('2ms:preachers:updated', { detail: remotePreachers }));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
    }
  });
}

/** Read preachers from localStorage; seeds from static data on first run or auto-upgrades legacy placeholders. */
export function getPreachers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const hasLegacy = Array.isArray(parsed) && parsed.some(p => p.name === 'Pastor John Doe' || p.name === 'Rev. Sarah Jenkins');
      if (!hasLegacy && Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) { /* storage unavailable */ }
  savePreachers(seedPreachers);
  return [...seedPreachers];
}

/** Persist preachers array to localStorage and Firebase if configured. */
export function savePreachers(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (_) {}
  if (isFirebaseConfigured()) {
    arr.forEach(p => saveDocument('preachers', p.id, p));
  }
}

/** Add or update a preacher profile */
export function upsertPreacher(preacher) {
  const all = getPreachers();
  const idx = all.findIndex(p => p.id === preacher.id);
  if (idx >= 0) all[idx] = preacher; else all.push(preacher);
  savePreachers(all);
  if (isFirebaseConfigured()) {
    saveDocument('preachers', preacher.id, preacher);
  }
  return all;
}

/** Delete a preacher profile */
export function deletePreacher(id) {
  const all = getPreachers().filter(p => p.id !== id);
  savePreachers(all);
  if (isFirebaseConfigured()) {
    deleteDocument('preachers', id);
  }
  return all;
}

export const preachers = seedPreachers;

