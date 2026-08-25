const STORAGE_KEY = '2ms_preachers';

const seedPreachers = [
  {
    id: "p1",
    name: "Pastor John Doe",
    slug: "john-doe",
    denomination: "Nondenominational",
    country: "United States",
    specialties: ["Faith", "Encouragement", "Spiritual Growth"],
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bio: "Pastor John has been serving in pastoral ministry for over 15 years, passionate about communicating scripture in concise, actionable daily messages."
  },
  {
    id: "p2",
    name: "Rev. Sarah Jenkins",
    slug: "sarah-jenkins",
    denomination: "Methodist",
    country: "United Kingdom",
    specialties: ["Grace", "Prayer", "Hope"],
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    bio: "Rev. Sarah leads community worship and international prayer initiatives, bringing warm, scripture-rooted encouragement to listeners worldwide."
  },
  {
    id: "p3",
    name: "Dr. Marcus Vance",
    slug: "marcus-vance",
    denomination: "Baptist",
    country: "Canada",
    specialties: ["Discipleship", "Scripture Exposition", "Healing"],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Dr. Vance is a biblical theologian and author dedicated to making deep theological truths accessible in under 2 minutes."
  },
  {
    id: "p4",
    name: "Minister David King",
    slug: "david-king",
    denomination: "Pentecostal",
    country: "South Africa",
    specialties: ["Holy Spirit", "Forgiveness", "Youth Ministry"],
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    bio: "Minister David inspires young believers and families through dynamic, high-energy video devotions rooted in Psalms and the Gospels."
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

/** Read preachers from localStorage; seeds from static data on first run. */
export function getPreachers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
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

