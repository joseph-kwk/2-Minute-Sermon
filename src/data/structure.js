// Ministry Structure & Framework Store
// Persisted in localStorage ('2ms_ministry_structure') and synced via Firestore when configured.

import { isFirebaseConfigured, saveDocument, subscribeCollection, seedCollectionIfEmpty } from '../firebase.js';

export const DEFAULT_STRUCTURE = {
  header: {
    tag: 'Governance & Framework',
    title: '2-Minute Sermon Structure',
    subtitle: 'Our platform operates through three foundational pillars ensuring faithful governance, pastoral leadership, and dynamic ministry operations.'
  },
  pillars: [
    {
      id: 'board-of-directors',
      badge: 'Governance & Oversight',
      icon: '🏛️',
      title: 'Board of Directors',
      description: 'The platform is governed by the Board of Directors, entrusted with strategic decision-making, spiritual stewardship, and organizational accountability. The Board comprises visionary pastoral leaders and executive trustees who ensure the mission and core values remain biblically rooted and sustainably guided.'
    },
    {
      id: 'executive-director',
      badge: 'Executive Leadership',
      icon: '🧭',
      title: 'Executive Director',
      description: 'The Executive Director provides visionary leadership and day-to-day administrative oversight for the 2-Minute Sermon global outreach. Working closely with the Board, the Executive Director directs organizational strategies, operational alignment, and partnership development across all broadcast and ministerial avenues.'
    },
    {
      id: 'ministry-department',
      badge: 'Ministry & Operations',
      icon: '👥',
      title: 'Ministry Department',
      description: 'The Ministry Department serves as the operational heart of our outreach, encompassing our pastoral contributors, intercessory prayer network, creative media production, and community engagement. This dedicated department facilitates weekly message curation, prayer ministry, digital broadcasting, and platform logistics.'
    }
  ]
};

const STORAGE_KEY = '2ms_ministry_structure';

// ── Real-time Firestore Sync ─────────────────────────────────────────────────
if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('structure', [{ id: 'main', ...DEFAULT_STRUCTURE }]);
  subscribeCollection('structure', (remoteItems) => {
    if (Array.isArray(remoteItems)) {
      const mainDoc = remoteItems.find(item => item.id === 'main');
      if (mainDoc) {
        const { id, ...data } = mainDoc;
        if (data.pillars || data.header) {
          // Check if remote doc contains legacy pillars
          const isLegacy = Array.isArray(data.pillars) && data.pillars.some(p =>
            p.id === 'preachers-network' || p.id === 'board' || (p.title && p.title.toLowerCase().includes('preacher'))
          );
          if (isLegacy) {
            saveMinistryStructure(DEFAULT_STRUCTURE, true);
          } else {
            saveMinistryStructure(data, false);
          }
        }
      }
    }
  });
}

/** Retrieve current structure with safe fallback to defaults & migration of legacy pillars */
export function getMinistryStructure() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const pillars = Array.isArray(parsed.pillars) && parsed.pillars.length > 0
          ? parsed.pillars
          : DEFAULT_STRUCTURE.pillars;

        // Auto-upgrade if cache still contains legacy "preachers-network" or "The Board"
        const hasLegacy = pillars.some(p =>
          p.id === 'preachers-network' ||
          p.id === 'board' ||
          (p.title && p.title.toLowerCase().includes('preacher'))
        );
        if (hasLegacy) {
          const upgraded = JSON.parse(JSON.stringify(DEFAULT_STRUCTURE));
          saveMinistryStructure(upgraded, true);
          return upgraded;
        }

        return {
          header: {
            tag: parsed.header?.tag || DEFAULT_STRUCTURE.header.tag,
            title: parsed.header?.title || DEFAULT_STRUCTURE.header.title,
            subtitle: parsed.header?.subtitle || DEFAULT_STRUCTURE.header.subtitle
          },
          pillars
        };
      }
    }
  } catch (_) {}
  return JSON.parse(JSON.stringify(DEFAULT_STRUCTURE));
}

/** Save updated structure to localStorage and Firestore */
export function saveMinistryStructure(data, syncToCloud = true) {
  try {
    const sanitized = {
      header: {
        tag: data?.header?.tag || DEFAULT_STRUCTURE.header.tag,
        title: data?.header?.title || DEFAULT_STRUCTURE.header.title,
        subtitle: data?.header?.subtitle || DEFAULT_STRUCTURE.header.subtitle
      },
      pillars: Array.isArray(data?.pillars) ? data.pillars : DEFAULT_STRUCTURE.pillars
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:structure:updated', { detail: sanitized }));

    if (syncToCloud && isFirebaseConfigured()) {
      saveDocument('structure', 'main', sanitized);
    }
    return sanitized;
  } catch (err) {
    console.warn('Failed to save ministry structure:', err);
    return data;
  }
}

/** Reset structure back to original ministry defaults */
export function resetMinistryStructure() {
  return saveMinistryStructure(DEFAULT_STRUCTURE, true);
}
