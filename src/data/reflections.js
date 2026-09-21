// Daily Scripture Reflections & Community Comments Store
// Persisted in localStorage ('2ms_reflections') and synced via Firestore when configured.

import { isFirebaseConfigured, subscribeCollection, saveDocument, deleteDocument, seedCollectionIfEmpty } from '../firebase.js';

export const INITIAL_REFLECTIONS = [
  {
    id: 'ref-1',
    verseDate: new Date().toISOString().split('T')[0],
    author: 'Grace M.',
    content: 'This scripture reminds me that even in moments of deep uncertainty, God is working quietly behind the scenes. Resting in His promises today.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes: 7
  },
  {
    id: 'ref-2',
    verseDate: new Date().toISOString().split('T')[0],
    author: 'Minister David',
    content: 'Amen! Two minutes in God’s Word can shift the trajectory of an entire 24-hour day. Thankful for this ministry and daily fellowship.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    likes: 12
  }
];

const STORAGE_KEY = '2ms_reflections';

if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('reflections', INITIAL_REFLECTIONS);
  subscribeCollection('reflections', (remoteList) => {
    if (remoteList && remoteList.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteList));
        window.dispatchEvent(new CustomEvent('2ms:reflections:updated', { detail: remoteList }));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
    }
  });
}

export function getAllReflections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [...INITIAL_REFLECTIONS];
}

export function getReflectionsForDate(dateStr) {
  const all = getAllReflections();
  return all.filter(r => r.verseDate === dateStr || !r.verseDate);
}

export function saveReflections(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:reflections:updated', { detail: list }));
  } catch (_) {}
}

export function addReflection({ verseDate, author, content }) {
  const list = getAllReflections();
  const trimmedContent = (content || '').trim().slice(0, 500);
  if (!trimmedContent) return null;

  const newRef = {
    id: `ref-${Date.now()}`,
    verseDate: verseDate || new Date().toISOString().split('T')[0],
    author: (author || '').trim() || 'Fellow Believer',
    content: trimmedContent,
    timestamp: new Date().toISOString(),
    likes: 0
  };

  list.unshift(newRef);
  saveReflections(list);

  if (isFirebaseConfigured()) {
    saveDocument('reflections', newRef.id, newRef);
  }
  return newRef;
}

export function toggleLikeReflection(id) {
  const list = getAllReflections();
  const item = list.find(r => r.id === id);
  if (!item) return;

  const likedKey = `2ms_liked_${id}`;
  const alreadyLiked = localStorage.getItem(likedKey) === '1';

  if (alreadyLiked) {
    item.likes = Math.max(0, (item.likes || 1) - 1);
    localStorage.removeItem(likedKey);
  } else {
    item.likes = (item.likes || 0) + 1;
    localStorage.setItem(likedKey, '1');
  }

  saveReflections(list);
  if (isFirebaseConfigured()) {
    saveDocument('reflections', item.id, item);
  }
}

export function deleteReflection(id) {
  const list = getAllReflections().filter(r => r.id !== id);
  saveReflections(list);
  if (isFirebaseConfigured()) {
    deleteDocument('reflections', id);
  }
}
