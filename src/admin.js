// Admin CMS Portal — Standalone JS (admin.html)
// Shared data is stored in sessionStorage so main site & admin can sync
// In production, replace with real API/database calls.

import { sermons as initialSermons } from './data/sermons.js';
import { preachers as initialPreachers } from './data/preachers.js';
import { seasons } from './data/seasons.js';
import { scheduledDailyVerses } from './data/dailyVerse.js';

// ── Runtime state ──────────────────────────────────────────────────────────
const sermons   = [...initialSermons];
const preachers = [...initialPreachers];
let pendingPrayers = [
  { id:'pr-1', name:'Sarah M.', email:'sarah@example.com', urgency:'Health & Healing', msg:'Please pray for my mother recovering from surgery.', date:'2026-08-22' },
  { id:'pr-2', name:'David K.', email:'david@example.com', urgency:'Family', msg:'Praying for guidance and peace during a difficult season.', date:'2026-08-23' }
];

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? '';
let authenticated   = false;
let activePanel     = 'dashboard';

// ── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateTopbarDate();
  setupAuthForm();
  setupSidebarNav();
  setupQuickActions();
  setupVerseScheduler();
  setupSermonPublisher();
  setupPreachersManager();
  setupBackupPanel();
  populateSelects();
});

// ── Topbar date ──────────────────────────────────────────────────────────
function updateTopbarDate() {
  const el = document.getElementById('adminTopbarDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ── AUTH ─────────────────────────────────────────────────────────────────
function setupAuthForm() {
  const form    = document.getElementById('adminAuthForm');
  const overlay = document.getElementById('adminAuthOverlay');
  const dash    = document.getElementById('adminDashboard');

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const pass  = document.getElementById('adminAuthPass').value;
    const errEl = document.getElementById('adminAuthError');

    if (pass === ADMIN_PASSWORD) {
      authenticated = true;
      overlay.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        overlay.hidden = true;
        dash.hidden    = false;
        dash.style.animation = 'fadeIn 0.3s ease';
        renderDashboardStats();
        renderVerseQueue();
        renderPreachersList();
        renderPrayerInbox();
        toast('✅ Signed in to CMS Admin');
      }, 280);
    } else {
      errEl.textContent = 'Incorrect password. Please try again.';
      document.getElementById('adminAuthPass').value = '';
      document.getElementById('adminAuthPass').focus();
      const card = document.querySelector('.admin-auth-card');
      card.style.animation = 'none';
      requestAnimationFrame(() => { card.style.animation = 'shake 0.4s ease'; });
    }
  });

  // Inject fadeOut keyframe
  const st = document.createElement('style');
  st.textContent = `@keyframes fadeOut { to { opacity:0; transform:scale(0.97); } }`;
  document.head.appendChild(st);
}

// Sign out
document.getElementById('adminSignOutBtn')?.addEventListener('click', () => {
  authenticated = false;
  document.getElementById('adminDashboard').hidden = true;
  const overlay = document.getElementById('adminAuthOverlay');
  overlay.hidden = false;
  overlay.style.animation = 'fadeIn 0.25s ease';
  document.getElementById('adminAuthPass').value = '';
});

// ── SIDEBAR NAV ─────────────────────────────────────────────────────────
function setupSidebarNav() {
  document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.getAttribute('data-panel');
      if (panel) switchPanel(panel);
    });
  });
}

function setupQuickActions() {
  document.querySelectorAll('.admin-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.getAttribute('data-panel');
      if (panel) switchPanel(panel);
    });
  });
}

const PANEL_TITLES = {
  dashboard:   'Dashboard',
  'daily-verse': 'Daily Verse Scheduler',
  sermons:     'Sermon Publisher',
  preachers:   'Preachers Manager',
  prayers:     'Prayer Inbox',
  backup:      'Export & Backup'
};

function switchPanel(panelId) {
  activePanel = panelId;

  document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.toggle('active', b.getAttribute('data-panel') === panelId));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${panelId}`));

  const titleEl = document.getElementById('adminTopbarTitle');
  if (titleEl) titleEl.textContent = PANEL_TITLES[panelId] || panelId;
}

// ── DASHBOARD STATS ───────────────────────────────────────────────────────
function renderDashboardStats() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('statSermons',   sermons.length);
  set('statVerses',    scheduledDailyVerses.length);
  set('statPreachers', preachers.length);
  set('statPrayers',   pendingPrayers.length);
  updatePrayerBadge();
}

function updatePrayerBadge() {
  const b = document.getElementById('prayerBadge');
  if (b) b.textContent = pendingPrayers.length;
}

// ── DAILY VERSE SCHEDULER ─────────────────────────────────────────────────
function setupVerseScheduler() {
  const dateInput = document.getElementById('adminDvDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  document.getElementById('adminScheduleVerseForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const dateStr    = document.getElementById('adminDvDate').value;
    const ref        = document.getElementById('adminDvBook').value;
    const verseText  = document.getElementById('adminDvText').value;
    const reflection = document.getElementById('adminDvReflection').value;

    const colonIdx = ref.lastIndexOf(':');
    const bookChap = colonIdx > 0 ? ref.substring(0, colonIdx).trim() : ref;
    const verse    = colonIdx > 0 ? ref.substring(colonIdx + 1).trim() : '1';
    const parts    = bookChap.split(' ');
    const chapter  = parts.pop() || '1';
    const book     = parts.join(' ') || bookChap;

    const entry = { id:`dv-${dateStr}`, publishDate:dateStr, verseText, book, chapter, verse, reflection, tags:['Scheduled'] };
    const idx   = scheduledDailyVerses.findIndex(v => v.publishDate === dateStr);
    if (idx >= 0) scheduledDailyVerses[idx] = entry;
    else {
      scheduledDailyVerses.push(entry);
      scheduledDailyVerses.sort((a,b) => new Date(a.publishDate) - new Date(b.publishDate));
    }

    e.target.reset();
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    renderVerseQueue();
    renderDashboardStats();
    toast(`📅 Verse scheduled for ${dateStr}`);
  });

  document.getElementById('autoGen30Btn')?.addEventListener('click', () => {
    const pool = [
      { text:"The Lord is my light and my salvation; whom shall I fear?",       book:"Psalm",       chapter:"27",verse:"1",  r:"Light dispels every shadow of doubt. Stand confident today." },
      { text:"Trust in the Lord with all your heart.",                           book:"Proverbs",    chapter:"3", verse:"5",  r:"Surrendering control opens the door to divine wisdom." },
      { text:"Cast all your anxiety on Him because He cares for you.",           book:"1 Peter",     chapter:"5", verse:"7",  r:"Your heavenly Father is attentive to your every burden." },
      { text:"Peace I leave with you; my peace I give to you.",                  book:"John",        chapter:"14",verse:"27", r:"Christ offers a tranquility the world cannot manufacture." }
    ];

    const start = new Date();
    let added = 0;
    for (let i = 1; i <= 30; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      if (scheduledDailyVerses.some(v => v.publishDate === dateStr)) continue;
      const s = pool[i % pool.length];
      scheduledDailyVerses.push({ id:`dv-${dateStr}`, publishDate:dateStr, verseText:s.text, book:s.book, chapter:s.chapter, verse:s.verse, reflection:s.r, tags:['Auto-Queue'] });
      added++;
    }
    scheduledDailyVerses.sort((a,b) => new Date(a.publishDate) - new Date(b.publishDate));
    renderVerseQueue();
    renderDashboardStats();
    toast(`⚡ ${added} verses auto-added to queue!`);
  });

  document.getElementById('clearQueueBtn')?.addEventListener('click', () => {
    if (!confirm('Clear all scheduled verses?')) return;
    scheduledDailyVerses.length = 0;
    renderVerseQueue();
    renderDashboardStats();
    toast('Queue cleared.');
  });
}

function renderVerseQueue() {
  const c = document.getElementById('adminVerseQueueList');
  const countEl = document.getElementById('verseQueueCount');
  if (countEl) countEl.textContent = scheduledDailyVerses.length;
  if (!c) return;

  if (!scheduledDailyVerses.length) {
    c.innerHTML = `<p style="color:rgba(255,255,255,0.3);text-align:center;padding:32px 0;">No verses scheduled yet.</p>`;
    return;
  }

  c.innerHTML = scheduledDailyVerses.map((v, idx) => `
    <div class="admin-list-item">
      <div class="admin-list-item-header">
        <strong style="color:var(--admin-gold);">${v.publishDate}</strong>
        <span class="admin-tag admin-tag-blue">${v.book} ${v.chapter}:${v.verse}</span>
      </div>
      <p style="margin:4px 0;">"${v.verseText}"</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
        <span style="font-size:0.75rem;color:rgba(255,255,255,0.3);">${v.reflection.substring(0,55)}…</span>
        <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="removeVerse(${idx})">✕ Remove</button>
      </div>
    </div>`).join('');
}

window.removeVerse = idx => {
  scheduledDailyVerses.splice(idx, 1);
  renderVerseQueue();
  renderDashboardStats();
  toast('Verse removed from queue.');
};

// ── SERMON PUBLISHER ──────────────────────────────────────────────────────
function setupSermonPublisher() {
  document.getElementById('adminQuickPublishForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const title    = document.getElementById('adminSermonTitle').value;
    const preacher = document.getElementById('adminPreacher').value;
    const scripture= document.getElementById('adminScripture').value;
    const season   = document.getElementById('adminSeason').value;
    const duration = document.getElementById('adminDuration').value;
    const raw      = document.getElementById('adminYoutubeUrl').value;
    const summary  = document.getElementById('adminSummary').value;

    let embedId = raw.trim();
    if (raw.includes('v=')) embedId = raw.split('v=')[1].split('&')[0];
    else if (raw.includes('youtu.be/')) embedId = raw.split('youtu.be/')[1].split('?')[0];

    sermons.unshift({
      id:`sermon-${Date.now()}`, title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      preacherId:'p1', preacherName:preacher,
      scripture, scriptureBook:scripture.split(' ')[0],
      primarySeason:season, secondarySeasons:[], topics:['Faith'],
      duration, durationSec:120, youtubeUrl:raw, youtubeEmbedId:embedId,
      thumbnailUrl:`https://img.youtube.com/vi/${embedId}/hqdefault.jpg`,
      summary, publishDate:new Date().toISOString().split('T')[0], views:1, featured:true,
      transcript:[{ time:'0:00', text:summary },{ time:'1:00', text:"Walk boldly in God's promises." }]
    });

    renderDashboardStats();
    e.target.reset();
    toast(`🚀 "${title}" published to the live feed!`);
  });
}

function populateSelects() {
  const preacherSel = document.getElementById('adminPreacher');
  const seasonSel   = document.getElementById('adminSeason');

  if (preacherSel)
    preacherSel.innerHTML = preachers.map(p => `<option value="${p.name}">${p.name}</option>`).join('');

  if (seasonSel)
    seasonSel.innerHTML = seasons.filter(s => s.slug !== 'all')
      .map(s => `<option value="${s.name}">${s.name}</option>`).join('');
}

// ── PREACHERS MANAGER ─────────────────────────────────────────────────────
function setupPreachersManager() {
  document.getElementById('adminAddPreacherForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name         = document.getElementById('newPreacherName').value;
    const denomination = document.getElementById('newPreacherDenomination').value;
    const country      = document.getElementById('newPreacherCountry').value;
    const photoUrl     = document.getElementById('newPreacherPhoto').value;
    const bio          = document.getElementById('newPreacherBio').value;

    preachers.push({ id:`p-${Date.now()}`, name, denomination, country, photoUrl, bio });
    populateSelects();
    renderPreachersList();
    renderDashboardStats();
    e.target.reset();
    toast(`🎙️ ${name} added to the directory!`);
  });
}

function renderPreachersList() {
  const c = document.getElementById('adminPreachersList');
  const countEl = document.getElementById('preachersCount');
  if (countEl) countEl.textContent = preachers.length;
  if (!c) return;

  c.innerHTML = preachers.map((p, idx) => `
    <div class="admin-list-item admin-preacher-item">
      <img src="${p.photoUrl}" alt="${p.name}"
           onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=C62828&color=fff&size=88'">
      <div class="admin-preacher-info">
        <strong>${p.name}</strong>
        <span>${p.denomination} · ${p.country}</span>
      </div>
      <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="removePreacher(${idx})">✕</button>
    </div>`).join('');
}

window.removePreacher = idx => {
  const name = preachers[idx]?.name;
  preachers.splice(idx, 1);
  populateSelects();
  renderPreachersList();
  renderDashboardStats();
  toast(`${name} removed from directory.`);
};

// ── PRAYER INBOX ──────────────────────────────────────────────────────────
function renderPrayerInbox() {
  const c = document.getElementById('adminPrayerInboxList');
  if (!c) return;

  if (!pendingPrayers.length) {
    c.innerHTML = `<p style="color:rgba(255,255,255,0.3);text-align:center;padding:32px;">No pending prayer requests. 🙌</p>`;
    return;
  }

  c.innerHTML = pendingPrayers.map((pr, idx) => `
    <div class="admin-prayer-item">
      <div class="admin-prayer-header">
        <strong>${pr.name} · ${pr.email}</strong>
        <span class="admin-tag">${pr.urgency}</span>
      </div>
      <p style="font-size:0.9rem;color:var(--admin-muted);margin-bottom:10px;">"${pr.msg}"</p>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:0.75rem;color:rgba(255,255,255,0.25);">Submitted: ${pr.date}</span>
        <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="markPrayed(${idx})">✓ Prayed For</button>
      </div>
    </div>`).join('');
}

window.markPrayed = idx => {
  pendingPrayers.splice(idx, 1);
  renderPrayerInbox();
  renderDashboardStats();
  updatePrayerBadge();
  toast('✓ Prayer marked as prayed for!');
};

// ── BACKUP ────────────────────────────────────────────────────────────────
function setupBackupPanel() {
  document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
    const data = {
      exportedAt: new Date().toISOString(),
      scheduledDailyVerses,
      sermons,
      preachers,
      pendingPrayers
    };
    const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.href = url;
    a.download = `2ms-cms-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); a.remove();

    const label = document.getElementById('lastExportLabel');
    if (label) label.textContent = `Last exported: ${new Date().toLocaleTimeString()}`;
    toast('📥 CMS backup downloaded!');
  });
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function toast(msg, duration = 3500) {
  const c = document.getElementById('adminToastContainer');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'admin-toast';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  }, duration);
}
