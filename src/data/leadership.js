// Ministry Leadership & Who is Who Store
// Persisted in localStorage ('2ms_leadership') and synced via Firestore when configured.

import { isFirebaseConfigured, saveDocument } from '../firebase.js';

export const INITIAL_LEADERSHIP = [
  {
    id: 'lead-1',
    name: 'Pastor Anany Kasongo',
    role: "Board's President (Founder)",
    tier: 'Executive Board',
    tierOrder: 1,
    photoUrl: 'https://ui-avatars.com/api/?name=Anany+Kasongo&background=C62828&color=fff&size=200',
    bio: 'Assistant Pastor at Allington Baptist Church, Accredited Preacher in the Britain Methodist Church, Co-founder of Crossover Project UK. Served as a missionary in Brazil.',
    email: 'info2minutesermon@gmail.com'
  },
  {
    id: 'lead-2',
    name: 'Pastor Bellarmee Milosi',
    role: 'Executive Coordinator (Co-Founder)',
    tier: 'Executive Board',
    tierOrder: 1,
    photoUrl: 'https://ui-avatars.com/api/?name=Bellarmee+Milosi&background=C62828&color=fff&size=200',
    bio: 'Local (Licensed) Pastor in the United Methodist Church. Gospel Singer/Songwriter & Worship Leader. Served as a missionary in the Philippines.',
    email: ''
  },
  {
    id: 'lead-3',
    name: 'Brenda Massana',
    role: 'Treasurer & Head of Intercession Department',
    tier: 'Department Coordinators',
    tierOrder: 2,
    photoUrl: 'https://ui-avatars.com/api/?name=Brenda+Massana&background=1565C0&color=fff&size=200',
    bio: 'Overseeing financial stewardship and leading the platform intercessory prayer network.',
    email: ''
  },
  {
    id: 'lead-4',
    name: 'Lievin Nsuka',
    role: "Senior Preacher's Network Coordinator",
    tier: 'Department Coordinators',
    tierOrder: 2,
    photoUrl: 'https://ui-avatars.com/api/?name=Lievin+Nsuka&background=2E7D32&color=fff&size=200',
    bio: 'Facilitating connection, theme discernment, and theological coordination across contributing network ministers.',
    email: ''
  },
  {
    id: 'lead-5',
    name: 'Kerith Nsuka-Meya',
    role: "Associate Preacher's Network Coordinator",
    tier: 'Department Coordinators',
    tierOrder: 2,
    photoUrl: 'https://ui-avatars.com/api/?name=Kerith+Nsuka&background=6A1B9A&color=fff&size=200',
    bio: 'Supporting preacher onboarding, sermon schedule management, and partner relations.',
    email: ''
  },
  {
    id: 'lead-6',
    name: 'Falone Mbuyi',
    role: 'Associate to the Office of Intercession',
    tier: 'Department Coordinators',
    tierOrder: 2,
    photoUrl: 'https://ui-avatars.com/api/?name=Falone+Mbuyi&background=D84315&color=fff&size=200',
    bio: 'Ministering to incoming prayer requests and coordinating daily intercession.',
    email: ''
  },
  {
    id: 'lead-7',
    name: 'Evangelist Narcisse Kyakutala',
    role: 'Associate to the Office of Intercession',
    tier: 'Department Coordinators',
    tierOrder: 2,
    photoUrl: 'https://ui-avatars.com/api/?name=Narcisse+Kyakutala&background=00838F&color=fff&size=200',
    bio: 'Passionate evangelist supporting the spiritual and prayer needs of our global community.',
    email: ''
  },
  {
    id: 'lead-8',
    name: 'Pastor Charles Mutumpa',
    role: 'Network Preacher',
    tier: 'Network Preachers',
    tierOrder: 3,
    photoUrl: 'https://ui-avatars.com/api/?name=Charles+Mutumpa&background=37474F&color=fff&size=200',
    bio: 'Pastor in the United Methodist Church, contributing weekly scripture reflections and sermon messages.',
    email: ''
  },
  {
    id: 'lead-9',
    name: 'Julien Myles',
    role: 'Network Preacher',
    tier: 'Network Preachers',
    tierOrder: 3,
    photoUrl: 'https://ui-avatars.com/api/?name=Julien+Myles&background=4E342E&color=fff&size=200',
    bio: 'Contributing minister and speaker sharing concise, scripture-rooted devotions.',
    email: ''
  },
  {
    id: 'lead-10',
    name: 'Nyasha Matswayi',
    role: 'Network Preacher',
    tier: 'Network Preachers',
    tierOrder: 3,
    photoUrl: 'https://ui-avatars.com/api/?name=Nyasha+Matswayi&background=00695C&color=fff&size=200',
    bio: 'Contributing teacher and minister delivering biblically rich 2-minute sermon messages.',
    email: ''
  },
  {
    id: 'lead-11',
    name: 'Merveille Bupe',
    role: 'Network Preacher',
    tier: 'Network Preachers',
    tierOrder: 3,
    photoUrl: 'https://ui-avatars.com/api/?name=Merveille+Bupe&background=AD1457&color=fff&size=200',
    bio: 'Minister and contributor dedicated to preaching Christ across digital platforms.',
    email: ''
  }
];

const STORAGE_KEY = '2ms_leadership';

export function getLeadershipTeam() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (_) {}
  return INITIAL_LEADERSHIP;
}

export function saveLeadershipTeam(team) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:leadership:updated', { detail: team }));
  } catch (_) {}
  if (isFirebaseConfigured()) {
    team.forEach(member => {
      saveDocument('leadership', member.id, member);
    });
  }
}

export function upsertLeader(leader) {
  const team = getLeadershipTeam();
  const index = team.findIndex(m => m.id === leader.id);
  if (index >= 0) {
    team[index] = { ...team[index], ...leader };
  } else {
    team.push(leader);
  }
  saveLeadershipTeam(team);
}

export function deleteLeader(id) {
  const team = getLeadershipTeam().filter(m => m.id !== id);
  saveLeadershipTeam(team);
}
