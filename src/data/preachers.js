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
  },
  {
    id: "p10",
    name: "Pastor Changhyun Kim",
    slug: "changhyun-kim",
    denomination: "Presbyterian",
    country: "South Korea / USA",
    specialties: ["Christmas", "Salvation", "Grace"],
    photoUrl: "https://ui-avatars.com/api/?name=Changhyun+Kim&background=C62828&color=fff&size=200",
    bio: "Guest preacher for the 2-Minute Sermon Christmas series sharing the eternal wonder of Christ's nativity."
  },
  {
    id: "p11",
    name: "Rev. Pastor Hyunjin Cho",
    slug: "hyunjin-cho",
    denomination: "Methodist",
    country: "South Korea / USA",
    specialties: ["Christmas", "Faith", "Hope"],
    photoUrl: "https://ui-avatars.com/api/?name=Hyunjin+Cho&background=1565C0&color=fff&size=200",
    bio: "Contributing pastor ministering on celebrating Christmas with genuine biblical focus and sacrificial love."
  },
  {
    id: "p12",
    name: "Pastor Seulki Choi",
    slug: "seulki-choi",
    denomination: "Evangelical",
    country: "South Korea / USA",
    specialties: ["Christmas", "Waiting on God", "Encouragement"],
    photoUrl: "https://ui-avatars.com/api/?name=Seulki+Choi&background=2E7D32&color=fff&size=200",
    bio: "Contributing pastor reflecting on the holy patience of Advent and the beauty of God's timing."
  },
  {
    id: "p13",
    name: "Evangelist Falone Mbuyi M.",
    slug: "falone-mbuyi",
    denomination: "Evangelical",
    country: "Democratic Republic of Congo",
    specialties: ["Passover", "Sovereignty of God", "Easter"],
    photoUrl: "https://ui-avatars.com/api/?name=Falone+Mbuyi&background=6A1B9A&color=fff&size=200",
    bio: "Contributing minister preaching Christ our Passover Lamb and the almighty sovereignty of God."
  },
  {
    id: "p14",
    name: "Preacher Jeremiah A. Dessources Jr.",
    slug: "jeremiah-dessources",
    denomination: "Baptist",
    country: "Haiti / USA",
    specialties: ["Faith", "Miracles", "Encouragement"],
    photoUrl: "https://ui-avatars.com/api/?name=Jeremiah+Dessources&background=00838F&color=fff&size=200",
    bio: "Dynamic preacher of the Gospel testifying that nothing is impossible with Almighty God."
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

/** Read preachers from localStorage; falls back to seed data if cache is empty. */
export function getPreachers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      const hasLegacy = Array.isArray(parsed) && parsed.some(p => p.name === 'Pastor John Doe' || p.name === 'Rev. Sarah Jenkins');
      if (!hasLegacy && Array.isArray(parsed)) return parsed;
    }
  } catch (_) { /* storage unavailable */ }
  return [...seedPreachers];
}

/** Persist preachers array to localStorage only. */
export function savePreachers(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('2ms:preachers:updated', { detail: arr }));
    window.dispatchEvent(new Event('storage'));
  } catch (_) {}
}

/** Add or update a preacher profile and sync to Firebase */
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

/** Delete a preacher profile and sync to Firebase */
export function deletePreacher(id) {
  const all = getPreachers().filter(p => p.id !== id);
  savePreachers(all);
  if (isFirebaseConfigured()) {
    deleteDocument('preachers', id);
  }
  return all;
}

export const preachers = seedPreachers;
