// Ministry Partners Store
// Persisted in localStorage ('2ms_partners') and synced via Firestore when configured.

import { isFirebaseConfigured, saveDocument } from '../firebase.js';

export const INITIAL_PARTNERS = [
  {
    id: 'partner-1',
    name: 'Crossover Project Ministries',
    category: 'Spiritual Revival & Discipleship',
    logoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://www.crossoverproject.org',
    scriptureAnchor: 'Matthew 28:19–20 & John 5:24',
    description: 'The Crossover Project exists as an answer to the call of Jesus in Matthew 28:19–20 to make disciples and teach them to obey His commands. Central to this are the words of Jesus in John 5:24 that make it plain that for anyone to cross over from death to life, they must hear and believe Jesus. For this reason, the Crossover Project gives anyone the opportunity to do so as we meet together in person and on Zoom to worship, study the Bible, and pray.'
  }
];

const STORAGE_KEY = '2ms_partners';

export function getPartners() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (_) {}
  return INITIAL_PARTNERS;
}

export function savePartners(partners) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:partners:updated', { detail: partners }));
  } catch (_) {}
  if (isFirebaseConfigured()) {
    partners.forEach(p => {
      saveDocument('partners', p.id, p);
    });
  }
}

export function upsertPartner(partner) {
  const partners = getPartners();
  const index = partners.findIndex(p => p.id === partner.id);
  if (index >= 0) {
    partners[index] = { ...partners[index], ...partner };
  } else {
    partners.push(partner);
  }
  savePartners(partners);
}

export function deletePartner(id) {
  const partners = getPartners().filter(p => p.id !== id);
  savePartners(partners);
}
