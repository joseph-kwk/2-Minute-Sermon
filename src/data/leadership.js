// Ministry Leadership & Who is Who Store
// Persisted in localStorage ('2ms_leadership') and synced via Firestore when configured.

import { isFirebaseConfigured, saveDocument, deleteDocument, subscribeCollection, seedCollectionIfEmpty } from '../firebase.js';


export const INITIAL_LEADERSHIP = [
  {
    id: 'lead-1',
    name: 'Pastor Anany Kasongo',
    role: "Board's President (Founder)",
    tier: 'Board of Directors',
    tierOrder: 1,
    order: 1,
    photoUrl: 'https://ui-avatars.com/api/?name=Anany+Kasongo&background=C62828&color=fff&size=200',
    bio: 'Assistant Pastor at Allington Baptist Church, Accredited Preacher in the Britain Methodist Church, Co-founder of Crossover Project UK. Served as a missionary in Brazil.',
    email: 'info2minutesermon@gmail.com'
  },
  {
    id: 'lead-2',
    name: 'Pastor Bellarmee Milosi',
    role: 'Executive Director (Co-Founder)',
    tier: 'Executive Director',
    tierOrder: 2,
    order: 2,
    photoUrl: 'https://ui-avatars.com/api/?name=Bellarmee+Milosi&background=C62828&color=fff&size=200',
    bio: 'Local (Licensed) Pastor in the United Methodist Church. Gospel Singer/Songwriter & Worship Leader. Served as a missionary in the Philippines.',
    email: ''
  },
  {
    id: 'lead-3',
    name: 'Brenda Massana',
    role: 'Treasurer & Head of Intercession Department',
    tier: 'Ministry Department',
    tierOrder: 3,
    order: 3,
    photoUrl: 'https://ui-avatars.com/api/?name=Brenda+Massana&background=1565C0&color=fff&size=200',
    bio: 'Overseeing financial stewardship and leading the platform intercessory prayer network.',
    email: ''
  },
  {
    id: 'lead-4',
    name: 'Lievin Nsuka',
    role: 'Senior Ministry Coordinator',
    tier: 'Ministry Department',
    tierOrder: 3,
    order: 4,
    photoUrl: 'https://ui-avatars.com/api/?name=Lievin+Nsuka&background=2E7D32&color=fff&size=200',
    bio: 'Facilitating connection, theme discernment, and theological coordination across contributing ministry members.',
    email: ''
  },
  {
    id: 'lead-5',
    name: 'Kerith Nsuka-Meya',
    role: 'Associate Ministry Coordinator',
    tier: 'Ministry Department',
    tierOrder: 3,
    order: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Kerith+Nsuka&background=6A1B9A&color=fff&size=200',
    bio: 'Supporting preacher onboarding, sermon schedule management, and partner relations.',
    email: ''
  },
  {
    id: 'lead-6',
    name: 'Falone Mbuyi',
    role: 'Associate to the Office of Intercession',
    tier: 'Ministry Department',
    tierOrder: 3,
    order: 6,
    photoUrl: 'https://ui-avatars.com/api/?name=Falone+Mbuyi&background=D84315&color=fff&size=200',
    bio: 'Ministering to incoming prayer requests and coordinating daily intercession.',
    email: ''
  },
  {
    id: 'lead-7',
    name: 'Evangelist Narcisse Kyakutala',
    role: 'Associate to the Office of Intercession',
    tier: 'Ministry Department',
    tierOrder: 3,
    order: 7,
    photoUrl: 'https://ui-avatars.com/api/?name=Narcisse+Kyakutala&background=00838F&color=fff&size=200',
    bio: 'Passionate evangelist supporting the spiritual and prayer needs of our global community.',
    email: ''
  },
  {
    id: 'lead-8',
    name: 'Pastor Charles Mutumpa',
    role: 'Contributing Minister',
    tier: 'Ministry Department',
    tierOrder: 3,
    order: 8,
    photoUrl: 'https://ui-avatars.com/api/?name=Charles+Mutumpa&background=37474F&color=fff&size=200',
    bio: 'Pastor in the United Methodist Church, contributing weekly scripture reflections and sermon messages.',
    email: ''
  },
  {
    id: 'lead-9',
    name: 'Julien Myles',
    role: 'Contributing Minister',
    tier: 'Ministry Department',
    tierOrder: 3,
    order: 9,
    photoUrl: 'https://ui-avatars.com/api/?name=Julien+Myles&background=4E342E&color=fff&size=200',
    bio: 'Contributing minister and speaker sharing concise, scripture-rooted devotions.',
    email: ''
  },
  {
    id: 'lead-10',
    name: 'Nyasha Matswayi',
    role: 'Contributing Minister',
    tier: 'Ministry Department',
    tierOrder: 3,
    order: 10,
    photoUrl: 'https://ui-avatars.com/api/?name=Nyasha+Matswayi&background=00695C&color=fff&size=200',
    bio: 'Contributing teacher and minister delivering biblically rich 2-minute sermon messages.',
    email: ''
  },
  {
    id: 'lead-11',
    name: 'Merveille Bupe',
    role: 'Contributing Minister',
    tier: 'Ministry Department',
    tierOrder: 3,
    order: 11,
    photoUrl: 'https://ui-avatars.com/api/?name=Merveille+Bupe&background=AD1457&color=fff&size=200',
    bio: 'Minister and contributor dedicated to preaching Christ across digital platforms.',
    email: ''
  }
];

const STORAGE_KEY = '2ms_leadership';

// IDs pending deletion — filter these out of any incoming Firestore snapshot
// until Firestore confirms the delete (prevents ghost re-appearance).
const _pendingDeletes = new Set();
// Leaders locally upserted but not yet confirmed by Firestore
const _pendingUpserts = new Map(); // id → leader object

// ── Real-time Firestore Sync ─────────────────────────────────────────────────
if (isFirebaseConfigured()) {
  seedCollectionIfEmpty('leadership', INITIAL_LEADERSHIP);
  subscribeCollection('leadership', (remoteTeam) => {
    if (Array.isArray(remoteTeam)) {
      let merged = _pendingDeletes.size > 0
        ? remoteTeam.filter(m => !_pendingDeletes.has(m.id))
        : [...remoteTeam];
      if (_pendingUpserts.size > 0) {
        _pendingUpserts.forEach((leader, id) => {
          if (merged.some(m => m.id === id)) {
            _pendingUpserts.delete(id);
          } else {
            merged.push(leader);
          }
        });
      }
      saveLeadershipTeam(merged);
    }
  });
}

/** Retrieve leadership roster with auto-migration of legacy tiers/roles and sorted by order */
export function getLeadershipTeam() {
  let list = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
    }
  } catch (_) {}

  if (!list.length) {
    list = JSON.parse(JSON.stringify(INITIAL_LEADERSHIP));
  }

  let modified = false;
  list.forEach((m, idx) => {
    if (typeof m.order !== 'number' || isNaN(m.order)) {
      m.order = idx + 1;
      modified = true;
    }
    // Migrate legacy tiers
    if (m.tier === 'Executive Board') {
      m.tier = 'Board of Directors';
      m.tierOrder = 1;
      modified = true;
    } else if (m.tier === 'Department Coordinators' || m.tier === 'Network Preachers') {
      m.tier = 'Ministry Department';
      m.tierOrder = 3;
      modified = true;
    }
    // Migrate legacy roles referencing Preacher Network
    if (m.role && m.role.toLowerCase().includes("preacher's network")) {
      m.role = m.role.replace(/preacher's network/gi, 'Ministry');
      modified = true;
    }
    if (m.role === 'Network Preacher') {
      m.role = 'Contributing Minister';
      modified = true;
    }
  });

  // Sort ascending by position order
  list.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  if (modified) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  }

  return list;
}

export function saveLeadershipTeam(team) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:leadership:updated', { detail: team }));
  } catch (_) {}
}

/** Move a team member up or down by 1 position and sync orders */
export function moveLeader(id, direction) {
  const team = getLeadershipTeam();
  const currentIndex = team.findIndex(m => m.id === id);
  if (currentIndex < 0) return team;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= team.length) return team;

  // Swap positions
  const item = team.splice(currentIndex, 1)[0];
  team.splice(targetIndex, 0, item);

  // Renumber all orders sequentially (1-indexed)
  team.forEach((m, idx) => {
    m.order = idx + 1;
  });

  saveLeadershipTeam(team);

  if (isFirebaseConfigured()) {
    team.forEach(m => {
      saveDocument('leadership', m.id, m);
    });
  }

  return team;
}

export function upsertLeader(leader) {
  _pendingDeletes.delete(leader.id); // re-adding clears any pending delete
  if (isFirebaseConfigured()) {
    _pendingUpserts.set(leader.id, leader);
    setTimeout(() => _pendingUpserts.delete(leader.id), 30000);
  }

  const team = getLeadershipTeam();
  const existingIdx = team.findIndex(m => m.id === leader.id);

  // Determine requested rank order
  let requestedOrder = (typeof leader.order === 'number' && !isNaN(leader.order)) ? leader.order : null;

  if (existingIdx >= 0) {
    if (requestedOrder === null) {
      requestedOrder = team[existingIdx].order || (existingIdx + 1);
    }
    team.splice(existingIdx, 1);
  } else {
    if (requestedOrder === null) {
      requestedOrder = team.length + 1;
    }
  }

  const insertIndex = Math.min(Math.max(0, requestedOrder - 1), team.length);
  const updatedLeader = {
    ...leader,
    order: insertIndex + 1
  };
  team.splice(insertIndex, 0, updatedLeader);

  // Renumber all items to maintain continuous 1..N order
  team.forEach((m, idx) => {
    m.order = idx + 1;
  });

  saveLeadershipTeam(team);

  if (isFirebaseConfigured()) {
    team.forEach(m => {
      saveDocument('leadership', m.id, m);
    });
  }
}

export function deleteLeader(id) {
  _pendingDeletes.add(id);
  const team = getLeadershipTeam().filter(m => m.id !== id);

  // Renumber remaining items
  team.forEach((m, idx) => {
    m.order = idx + 1;
  });

  saveLeadershipTeam(team);

  if (isFirebaseConfigured()) {
    deleteDocument('leadership', id).then(() => {
      setTimeout(() => _pendingDeletes.delete(id), 5000);
    }).catch(() => {
      setTimeout(() => _pendingDeletes.delete(id), 5000);
    });
  } else {
    _pendingDeletes.delete(id);
  }
}
