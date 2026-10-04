// Sermon Series Store — Persisted in localStorage ('2ms_series')
// and synchronized in real-time via Firestore across the public site and admin portal.

import { isFirebaseConfigured, subscribeCollection, saveDocument, deleteDocument, seedCollectionIfEmpty } from '../firebase.js';

const STORAGE_KEY = '2ms_series';

export const INITIAL_SERIES = [
  {
    id: 'series-great-commission',
    title: 'The Great Commission in Daily Life',
    slug: 'the-great-commission-in-daily-life',
    preacherName: 'Pastor Moses Emuze',
    preacherId: 'p-moses-emuze',
    description: 'An empowering expository study on Jesus’ command to go into your own world—your workplace, family, and atmosphere—to make an eternal impact for the Kingdom of God.',
    bannerUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80',
    scriptureFoundation: 'Matthew 28:18-20 & Matthew 16:18',
    createdAt: '2026-10-04'
  },
  {
    id: 'series-unshakable-hope',
    title: 'Anchored in Unshakable Hope',
    slug: 'anchored-in-unshakable-hope',
    preacherName: 'Pastor Anany Kasongo',
    preacherId: 'p1',
    description: 'A multi-part devotional journey walking through the promises of God during seasons of trial, wilderness, and new beginnings.',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    scriptureFoundation: 'Hebrews 6:19 & Romans 15:13',
    createdAt: '2026-09-15'
  }
];

const _pendingDeletes = new Set();
const _pendingUpserts = new Map();

// ── Real-time Firebase Firestore Sync ───────────────────────────────────────
if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('series', INITIAL_SERIES);
  subscribeCollection('series', (remoteSeries) => {
    if (remoteSeries && remoteSeries.length > 0) {
      let merged = _pendingDeletes.size > 0
        ? remoteSeries.filter(s => !_pendingDeletes.has(s.id))
        : [...remoteSeries];
      if (_pendingUpserts.size > 0) {
        _pendingUpserts.forEach((item, id) => {
          if (merged.some(s => s.id === id)) {
            _pendingUpserts.delete(id);
          } else {
            merged.unshift(item);
          }
        });
      }
      if (merged.length > 0) saveSeries(merged);
    }
  });
}

export function getSeries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [...INITIAL_SERIES];
}

export function saveSeries(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:series:updated', { detail: list }));
  } catch (_) {}
}

export function upsertSeries(item) {
  _pendingDeletes.delete(item.id);
  if (isFirebaseConfigured()) {
    _pendingUpserts.set(item.id, item);
    setTimeout(() => _pendingUpserts.delete(item.id), 30000);
  }
  const list = getSeries();
  const index = list.findIndex(s => s.id === item.id);
  if (index >= 0) {
    list[index] = { ...list[index], ...item };
  } else {
    list.unshift(item);
  }
  saveSeries(list);
  if (isFirebaseConfigured()) {
    saveDocument('series', item.id, item);
  }
  return list;
}

export function deleteSeries(id) {
  _pendingDeletes.add(id);
  const list = getSeries().filter(s => s.id !== id);
  saveSeries(list);
  if (isFirebaseConfigured()) {
    deleteDocument('series', id).then(() => {
      _pendingDeletes.delete(id);
    }).catch(() => {
      _pendingDeletes.delete(id);
    });
  } else {
    _pendingDeletes.delete(id);
  }
  return list;
}
