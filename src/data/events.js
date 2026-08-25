const STORAGE_KEY = '2ms_events';

// ── Seed data (used only if localStorage is empty) ──────────────────────────
const seedEvents = [
  {
    id: "ev-1",
    title: "Global 2-Minute Prayer & Reflection Summit",
    date: "2026-09-15",
    time: "7:00 PM EST",
    category: "Prayer & Worship",
    location: "Online Broadcast & YouTube Live",
    description: "Join ministers and believers across 40 countries for an uplifting 45-minute live stream session of prayer and brief scripture reflections."
  },
  {
    id: "ev-2",
    title: "Preachers & Content Creators Workshop",
    date: "2026-10-10",
    time: "10:00 AM EST",
    category: "Workshop",
    location: "Virtual Live Masterclass",
    description: "A focused session on distilling profound biblical truths into engaging 2-minute video messages for digital ministry outreach."
  }
];

import { isFirebaseConfigured, subscribeCollection, saveDocument, deleteDocument, seedCollectionIfEmpty } from '../firebase.js';

// ── Real-time Firebase Firestore Sync ───────────────────────────────────────
if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('events', seedEvents);
  subscribeCollection('events', (remoteEvents) => {
    if (remoteEvents && remoteEvents.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteEvents));
        window.dispatchEvent(new CustomEvent('2ms:events:updated', { detail: remoteEvents }));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
    }
  });
}

// ── localStorage-backed CMS store ───────────────────────────────────────────

/** Read events from localStorage; seeds from static data on first run. */
export function getEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* storage unavailable */ }
  saveEvents(seedEvents);
  return [...seedEvents];
}

/** Persist events array to localStorage and Firebase if configured. */
export function saveEvents(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (_) {}
  if (isFirebaseConfigured()) {
    arr.forEach(e => saveDocument('events', e.id, e));
  }
}

/** Add or update an event (matched by id). Returns updated array. */
export function upsertEvent(event) {
  const all = getEvents();
  const idx = all.findIndex(e => e.id === event.id);
  if (idx >= 0) all[idx] = event; else all.unshift(event);
  saveEvents(all);
  if (isFirebaseConfigured()) {
    saveDocument('events', event.id, event);
  }
  return all;
}

/** Remove an event by id. Returns updated array. */
export function deleteEvent(id) {
  const all = getEvents().filter(e => e.id !== id);
  saveEvents(all);
  if (isFirebaseConfigured()) {
    deleteDocument('events', id);
  }
  return all;
}

// Named export for backwards compatibility
export const events = seedEvents;

