// The Conversation Episodes Store
// Persisted in localStorage ('2ms_conversations') and synced via Firestore when configured.

import { isFirebaseConfigured, subscribeCollection, saveDocument, deleteDocument, seedCollectionIfEmpty } from '../firebase.js';

export function extractVideoId(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : trimmed;
}

export function ytThumb(videoId) {
  if (!videoId) return 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: 'Meeting Jesus Without Meeting Jesus',
    slug: 'meeting-jesus-without-meeting-jesus',
    youtubeUrl: 'https://www.youtube.com/watch?v=gdxWYvV7hkg',
    youtubeEmbedId: 'gdxWYvV7hkg',
    thumbnailUrl: 'https://img.youtube.com/vi/gdxWYvV7hkg/hqdefault.jpg',
    panelists: 'Pastor Bellarmee Milosi',
    category: 'Theology & Christian Walk',
    scriptures: 'Acts 9:1–9, John 20:29, 2 Corinthians 5:7',
    duration: '32:35',
    durationSec: 1955,
    publishDate: '2024-05-10',
    status: 'Published',
    featured: true,
    summary: 'An in-depth 2-Minute PLUS dialogue exploring how believers encounter the transformational presence of the living Christ beyond physical sight.'
  },
  {
    id: 'conv-2',
    title: "2-Minute Sermon PLUS: God's Response",
    slug: 'gods-response',
    youtubeUrl: 'https://www.youtube.com/watch?v=w9EIlMTPRn4',
    youtubeEmbedId: 'w9EIlMTPRn4',
    thumbnailUrl: 'https://img.youtube.com/vi/w9EIlMTPRn4/hqdefault.jpg',
    panelists: 'Esther Gomes',
    category: 'Prayer & Faith',
    scriptures: 'Jeremiah 33:3, Psalm 91:15, Isaiah 65:24',
    duration: '11:22',
    durationSec: 682,
    publishDate: '2024-09-12',
    status: 'Published',
    featured: true,
    summary: 'A powerful teaching examining how God responds to our petitions in seasons of silence, waiting, and unexpected grace.'
  },
  {
    id: 'conv-3',
    title: "Gospel Proclamation: The Lord's Prayer",
    slug: 'the-lords-prayer',
    youtubeUrl: 'https://www.youtube.com/watch?v=803r0P8kW7g',
    youtubeEmbedId: '803r0P8kW7g',
    thumbnailUrl: 'https://img.youtube.com/vi/803r0P8kW7g/hqdefault.jpg',
    panelists: 'Pastor Anany Kasongo',
    category: 'Kingdom Teaching',
    scriptures: 'Matthew 6:9–13, Luke 11:1–4',
    duration: '3:44',
    durationSec: 224,
    publishDate: '2024-10-23',
    status: 'Published',
    featured: false,
    summary: 'A biblical exposition of the model prayer Christ gave His followers, unpacking the majesty of God\'s kingdom and daily provision.'
  }
];

const STORAGE_KEY = '2ms_conversations';

// ── Real-time Firebase Firestore Sync ───────────────────────────────────────
if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('conversations', INITIAL_CONVERSATIONS);
  subscribeCollection('conversations', (remoteConversations) => {
    if (remoteConversations && remoteConversations.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteConversations));
        window.dispatchEvent(new CustomEvent('2ms:conversations:updated', { detail: remoteConversations }));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
    }
  });
}

export function getConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      const hasPlaceholders = Array.isArray(parsed) && parsed.some(c => c.youtubeEmbedId === 'SJFqqNvTeh8');
      if (!hasPlaceholders && Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [...INITIAL_CONVERSATIONS];
}

export function saveConversations(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:conversations:updated', { detail: list }));
  } catch (_) {}
}

export function upsertConversation(item) {
  const list = getConversations();
  const index = list.findIndex(c => c.id === item.id);
  if (index >= 0) {
    list[index] = { ...list[index], ...item };
  } else {
    list.unshift(item);
  }
  saveConversations(list);
  if (isFirebaseConfigured()) {
    saveDocument('conversations', item.id, item);
  }
}

export function deleteConversation(id) {
  const list = getConversations().filter(c => c.id !== id);
  saveConversations(list);
  if (isFirebaseConfigured()) {
    deleteDocument('conversations', id);
  }
}
