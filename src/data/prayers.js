// Prayer Requests Store — Persisted in localStorage ('2ms_prayers')
// and synchronized in real-time via Firestore across the public site and admin portal.

import { isFirebaseConfigured, subscribeCollection, saveDocument, deleteDocument } from '../firebase.js';

const STORAGE_KEY = '2ms_prayers';

// IDs pending deletion — filter from incoming Firestore snapshots until confirmed
const _pendingDeletes = new Set();

// ── Real-time Firebase Firestore Sync ───────────────────────────────────────
if (isFirebaseConfigured()) {
  subscribeCollection('prayers', (remotePrayers) => {
    if (Array.isArray(remotePrayers)) {
      const filtered = _pendingDeletes.size > 0
        ? remotePrayers.filter(p => !_pendingDeletes.has(p.id))
        : remotePrayers;
      savePrayers(filtered);
    }
  });
}

export function getPrayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

export function savePrayers(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:prayers:updated', { detail: list }));
  } catch (_) {}
}

export function addPrayer({ name, email, urgency, msg }) {
  const list = getPrayers();
  const entry = {
    id: `pr-${Date.now()}`,
    name: (name || '').trim() || 'Anonymous',
    email: (email || '').trim(),
    urgency: urgency || 'General',
    msg: (msg || '').trim(),
    status: 'New',
    date: new Date().toISOString().split('T')[0]
  };
  _pendingDeletes.delete(entry.id);
  list.unshift(entry);
  savePrayers(list);

  if (isFirebaseConfigured()) {
    saveDocument('prayers', entry.id, entry);
  }
  return entry;
}

export function deletePrayer(id) {
  _pendingDeletes.add(id);
  const list = getPrayers().filter(p => p.id !== id);
  savePrayers(list);
  if (isFirebaseConfigured()) {
    deleteDocument('prayers', id).then(() => {
      _pendingDeletes.delete(id);
    }).catch(() => {
      _pendingDeletes.delete(id);
    });
  } else {
    _pendingDeletes.delete(id);
  }
}
