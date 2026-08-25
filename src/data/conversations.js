// The Conversation Episodes Store
// Persisted in localStorage ('2ms_conversations') and synced via Firestore when configured.

import { isFirebaseConfigured, saveDocument } from '../firebase.js';

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
    title: 'Should Women be Allowed to Preach?',
    slug: 'should-women-be-allowed-to-preach',
    youtubeUrl: 'https://www.youtube.com/watch?v=SJFqqNvTeh8',
    youtubeEmbedId: 'SJFqqNvTeh8',
    thumbnailUrl: 'https://img.youtube.com/vi/SJFqqNvTeh8/hqdefault.jpg',
    panelists: 'Pastor Anany Kasongo, Pastor Bellarmee Milosi & Guest Ministers',
    category: 'Biblical Leadership',
    scriptures: '1 Timothy 2:11–12, Galatians 3:28, Romans 16:1–7',
    duration: '28:45',
    durationSec: 1725,
    publishDate: '2026-08-15',
    status: 'Published',
    featured: true,
    summary: 'A deep biblical dialogue examining historical context, apostolic teachings, and cultural interpretations regarding women in pastoral and pulpit leadership.'
  },
  {
    id: 'conv-2',
    title: 'Is Speaking in Tongues Biblical for Today?',
    slug: 'is-speaking-in-tongues-biblical',
    youtubeUrl: 'https://www.youtube.com/watch?v=SJFqqNvTeh8',
    youtubeEmbedId: 'SJFqqNvTeh8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
    panelists: 'Lievin Nsuka & Evangelist Narcisse Kyakutala',
    category: 'Spiritual Gifts',
    scriptures: '1 Corinthians 12–14, Acts 2:1–11, Mark 16:17',
    duration: '34:10',
    durationSec: 2050,
    publishDate: '2026-08-01',
    status: 'Published',
    featured: false,
    summary: 'Exploring the purpose, theological distinction between private prayer language and public prophetic tongues, and the role of the Holy Spirit in contemporary believers.'
  },
  {
    id: 'conv-3',
    title: 'Is Tithing a Mandatory Law for Us Christians?',
    slug: 'is-tithing-a-mandatory-law-for-christians',
    youtubeUrl: 'https://www.youtube.com/watch?v=SJFqqNvTeh8',
    youtubeEmbedId: 'SJFqqNvTeh8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80',
    panelists: 'Pastor Anany Kasongo & Guest Panelists',
    category: 'Christian Living & Giving',
    scriptures: 'Malachi 3:8–10, Genesis 14:20, 2 Corinthians 9:6–8',
    duration: 'Coming Up',
    durationSec: 0,
    publishDate: '2026-09-05',
    status: 'Upcoming',
    featured: false,
    summary: 'If the tithe is rooted in the Old Covenant, do Christians still have an obligation to give a tenth? An honest panel conversation on grace-based giving vs. legalistic requirement.'
  }
];

const STORAGE_KEY = '2ms_conversations';

export function getConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (_) {}
  return INITIAL_CONVERSATIONS;
}

export function saveConversations(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:conversations:updated', { detail: list }));
  } catch (_) {}
  if (isFirebaseConfigured()) {
    list.forEach(c => {
      saveDocument('conversations', c.id, c);
    });
  }
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
}

export function deleteConversation(id) {
  const list = getConversations().filter(c => c.id !== id);
  saveConversations(list);
}
