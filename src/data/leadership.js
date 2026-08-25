// Ministry Leadership & Organigram Store
// Persisted in localStorage ('2ms_leadership') and synced via Firestore when configured.

import { isFirebaseConfigured, saveDocument } from '../firebase.js';

export const INITIAL_LEADERSHIP = [
  {
    id: 'lead-1',
    name: 'Pastor Anany Kasongo',
    role: 'President & Executive Director',
    tier: 'Executive Leadership',
    tierOrder: 1,
    photoUrl: 'https://ui-avatars.com/api/?name=Anany+Kasongo&background=C62828&color=fff&size=200',
    bio: 'Founder and pastoral visionary spearheading the global mission of 2-Minute Sermon to deliver concise, scripture-rooted truth worldwide.',
    email: 'info2minutesermon@gmail.com'
  },
  {
    id: 'lead-2',
    name: 'Pastoral Advisory & Theological Council',
    role: 'Board of Theological Oversight',
    tier: 'Advisory & Governance',
    tierOrder: 2,
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    bio: 'Senior ordained ministers and biblical scholars ensuring strict doctrinal accuracy, christocentric focus, and liturgical harmony.',
    email: ''
  },
  {
    id: 'lead-3',
    name: 'Global Preachers & Partner Relations',
    role: 'Network Director',
    tier: 'Advisory & Governance',
    tierOrder: 2,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Connecting, vetting, and coordinating contributing ministers from across North America, Europe, Africa, and Asia.',
    email: ''
  },
  {
    id: 'lead-4',
    name: 'Broadcast Media & Digital Stewardship',
    role: 'Media & Production Lead',
    tier: 'Department Directors',
    tierOrder: 3,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Overseeing YouTube broadcasts, audio production, digital streaming, and multi-platform distribution channels.',
    email: ''
  },
  {
    id: 'lead-5',
    name: 'Intercessory Prayer & Ministry Care',
    role: 'Pastoral Care Coordinator',
    tier: 'Department Directors',
    tierOrder: 3,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Reviewing prayer submissions, leading global prayer initiatives, and ministering to submitted requests daily.',
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
