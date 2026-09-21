// Newsletter Subscribers Store
// Persisted in localStorage ('2ms_subscribers') and synced via Firestore when configured.

import { isFirebaseConfigured, subscribeCollection, saveDocument, seedCollectionIfEmpty } from '../firebase.js';

export const INITIAL_SUBSCRIBERS = [
  {
    id: 'sub-sample-1',
    email: 'fellowship@2minutesermon.org',
    subscribedAt: '2024-01-15T10:00:00.000Z',
    source: 'Website Footer'
  }
];

const STORAGE_KEY = '2ms_subscribers';

if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('subscribers', INITIAL_SUBSCRIBERS);
  subscribeCollection('subscribers', (remoteList) => {
    if (remoteList && remoteList.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteList));
        window.dispatchEvent(new CustomEvent('2ms:subscribers:updated', { detail: remoteList }));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
    }
  });
}

export function getSubscribers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [...INITIAL_SUBSCRIBERS];
}

export function saveSubscribers(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:subscribers:updated', { detail: list }));
  } catch (_) {}
}

export function addSubscriber(email, source = 'Website Newsletter Form') {
  if (!email || !email.includes('@')) return null;
  const list = getSubscribers();
  const normalized = email.trim().toLowerCase();

  // Check if already subscribed
  const existing = list.find(s => s.email.toLowerCase() === normalized);
  if (existing) return existing;

  const newSub = {
    id: `sub-${Date.now()}`,
    email: normalized,
    subscribedAt: new Date().toISOString(),
    source
  };

  list.unshift(newSub);
  saveSubscribers(list);

  if (isFirebaseConfigured()) {
    saveDocument('subscribers', newSub.id, newSub);
  }
  return newSub;
}

export function exportSubscribersToCsv() {
  const list = getSubscribers();
  if (!list.length) return '';

  const headers = ['Email', 'Subscription Date', 'Source'];
  const rows = list.map(s => [
    `"${s.email.replace(/"/g, '""')}"`,
    `"${s.subscribedAt || ''}"`,
    `"${(s.source || 'Website').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}
