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

// IDs pending deletion — filter from incoming Firestore snapshots until confirmed
const _pendingDeletes = new Set();
// Events locally upserted but not yet confirmed by Firestore
const _pendingUpserts = new Map(); // id → event object

// ── Real-time Firebase Firestore Sync ───────────────────────────────────────
if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('events', seedEvents);
  subscribeCollection('events', (remoteEvents) => {
    if (Array.isArray(remoteEvents)) {
      let merged = _pendingDeletes.size > 0
        ? remoteEvents.filter(e => !_pendingDeletes.has(e.id))
        : [...remoteEvents];
      if (_pendingUpserts.size > 0) {
        _pendingUpserts.forEach((event, id) => {
          if (merged.some(e => e.id === id)) {
            _pendingUpserts.delete(id);
          } else {
            merged.unshift(event);
          }
        });
      }
      saveEvents(merged);
    }
  });
}

// ── localStorage-backed CMS store ───────────────────────────────────────────

/** Read events from localStorage; falls back to seed data if cache is empty. */
export function getEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) { /* storage unavailable */ }
  return [...seedEvents];
}

/** Persist events array to localStorage only. */
export function saveEvents(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('2ms:events:updated', { detail: arr }));
    window.dispatchEvent(new Event('storage'));
  } catch (_) {}
}

/** Add or update an event (matched by id). Returns updated array. */
export function upsertEvent(event) {
  _pendingDeletes.delete(event.id);
  if (isFirebaseConfigured()) {
    _pendingUpserts.set(event.id, event);
  }
  const all = getEvents();
  const idx = all.findIndex(e => e.id === event.id);
  if (idx >= 0) all[idx] = event; else all.unshift(event);
  saveEvents(all);
  if (isFirebaseConfigured()) {
    saveDocument('events', event.id, event).then(() => {
      _pendingUpserts.delete(event.id);
    }).catch(() => {
      _pendingUpserts.delete(event.id);
    });
  }
  return all;
}

/** Remove an event by id. Returns updated array. */
export function deleteEvent(id) {
  _pendingDeletes.add(id);
  const all = getEvents().filter(e => e.id !== id);
  saveEvents(all);
  if (isFirebaseConfigured()) {
    deleteDocument('events', id).then(() => {
      _pendingDeletes.delete(id);
    }).catch(() => {
      _pendingDeletes.delete(id);
    });
  } else {
    _pendingDeletes.delete(id);
  }
  return all;
}

// Named export for backwards compatibility
export const events = seedEvents;

