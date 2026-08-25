// Admin CMS Portal — Standalone JS (admin.html)
// Sermon data is persisted in localStorage via the CMS store in sermons.js.

import { getSermons, upsertSermon, deleteSermon, extractVideoId, ytThumb, durationToSeconds } from './data/sermons.js';
import { getEvents, upsertEvent, deleteEvent, saveEvents } from './data/events.js';
import { getPreachers, savePreachers } from './data/preachers.js';
import { seasons } from './data/seasons.js';
import { getDailyVerses, saveDailyVerses } from './data/dailyVerse.js';

// ── Runtime state ──────────────────────────────────────────────────────────
// Data arrays are read from localStorage — persistent across all reloads
const preachers = getPreachers();
const scheduledDailyVerses = getDailyVerses();
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
  setupEventsManager();
  setupSettingsPanel();
  setupBackupPanel();
  populateSelects();

  // ── Real-time Cloud Data Sync Listeners for Admin ─────────────────────────
  const refreshAdminView = () => {
    populateSelects();
    renderDashboardStats();
    renderVerseQueue();
    renderPreachersList();
    renderEventsList();
    renderPrayerInbox();
  };

  window.addEventListener('storage', refreshAdminView);
  window.addEventListener('2ms:sermons:updated', refreshAdminView);
  window.addEventListener('2ms:preachers:updated', refreshAdminView);
  window.addEventListener('2ms:verses:updated', refreshAdminView);
  window.addEventListener('2ms:events:updated', refreshAdminView);
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
        renderEventsList();
        renderPrayerInbox();
        toast('✅ Welcome to The Steward');
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
  events:      'Events Manager',
  prayers:     'Prayer Inbox',
  settings:    'Ministry Settings',
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
  set('statSermons',   getSermons().length);
  set('statVerses',    scheduledDailyVerses.length);
  set('statPreachers', preachers.length);
  set('statEvents',    getEvents().length);
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
    saveDailyVerses(scheduledDailyVerses);

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
    saveDailyVerses(scheduledDailyVerses);
    renderVerseQueue();
    renderDashboardStats();
    toast(`⚡ ${added} verses auto-added to queue!`);
  });

  document.getElementById('clearQueueBtn')?.addEventListener('click', () => {
    if (!confirm('Clear all scheduled verses?')) return;
    scheduledDailyVerses.length = 0;
    saveDailyVerses(scheduledDailyVerses);
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
  saveDailyVerses(scheduledDailyVerses);
  renderVerseQueue();
  renderDashboardStats();
  toast('Verse removed from queue.');
};

// ── SERMON PUBLISHER ──────────────────────────────────────────────────────
function setupSermonPublisher() {
  // ── YouTube preview button ──
  const ytUrlInput    = document.getElementById('adminYoutubeUrl');
  const ytPreviewBtn  = document.getElementById('adminYtPreviewBtn');
  const ytPreviewBox  = document.getElementById('adminYtPreview');
  const ytThumbImg    = document.getElementById('adminYtThumb');
  const ytPreviewId   = document.getElementById('adminYtPreviewId');
  const videoIdInput  = document.getElementById('adminVideoId');

  function loadPreview() {
    const vid = extractVideoId(ytUrlInput.value);
    if (!vid) { ytPreviewBox.style.display = 'none'; videoIdInput.value = ''; return; }
    videoIdInput.value = vid;
    ytThumbImg.src     = ytThumb(vid);
    ytPreviewId.textContent = vid;
    ytPreviewBox.style.display = 'flex';
  }

  ytPreviewBtn?.addEventListener('click', loadPreview);
  // Also auto-preview when user stops typing
  let ytDebounce;
  ytUrlInput?.addEventListener('input', () => {
    clearTimeout(ytDebounce);
    ytDebounce = setTimeout(loadPreview, 500);
  });

  // ── Publish form submit ──
  document.getElementById('adminQuickPublishForm')?.addEventListener('submit', e => {
    e.preventDefault();

    const title      = document.getElementById('adminSermonTitle').value.trim();
    const preacher   = document.getElementById('adminPreacher').value;
    const scripture  = document.getElementById('adminScripture').value.trim();
    const season     = document.getElementById('adminSeason').value;
    const duration   = document.getElementById('adminDuration').value.trim();
    const summary    = document.getElementById('adminSummary').value.trim();
    const featured   = document.getElementById('adminFeatured').checked;
    const sermonType = document.querySelector('input[name="sermonType"]:checked')?.value || 'Devotional';
    const topics     = [...document.querySelectorAll('.admin-checkbox-group input:checked')].map(c => c.value);

    const rawUrl = ytUrlInput.value.trim();
    const embedId = videoIdInput.value || extractVideoId(rawUrl);
    if (!embedId) { toast('⚠️ Please enter a valid YouTube URL or video ID.'); return; }
    if (topics.length === 0) { toast('⚠️ Please select at least one topic.'); return; }

    const sermon = {
      id: `sermon-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      preacherId: preachers.find(p => p.name === preacher)?.id || 'p1',
      preacherName: preacher,
      scripture,
      scriptureBook: scripture.split(' ')[0],
      primarySeason: season,
      secondarySeasons: [],
      topics,
      sermonType,
      duration,
      durationSec: durationToSeconds(duration),
      youtubeUrl: `https://www.youtube.com/watch?v=${embedId}`,
      youtubeEmbedId: embedId,
      thumbnailUrl: ytThumb(embedId),
      summary,
      publishDate: new Date().toISOString().split('T')[0],
      views: 0,
      featured,
      transcript: []
    };

    upsertSermon(sermon);
    renderDashboardStats();
    renderSermonsList();
    e.target.reset();
    ytPreviewBox.style.display = 'none';
    videoIdInput.value = '';
    // Reset checkboxes — re-check Faith as default
    document.querySelectorAll('.admin-checkbox-group input').forEach((c, i) => c.checked = i === 0);
    document.querySelector('input[name="sermonType"][value="Devotional"]').checked = true;
    toast(`🚀 "${title}" published!`);
  });

  renderSermonsList();
}

/** Renders the live sermons list in the publisher panel right column. */
function renderSermonsList() {
  const list    = document.getElementById('adminSermonsList');
  const counter = document.getElementById('sermonsCount');
  if (!list) return;

  const all = getSermons();
  counter && (counter.textContent = all.length);

  if (all.length === 0) {
    list.innerHTML = '<p style="color:var(--admin-muted);font-size:0.85rem;text-align:center;padding:24px;">No sermons yet. Publish one!</p>';
    return;
  }

  list.innerHTML = all.map(s => `
    <div class="admin-sermon-row" id="srow-${s.id}">
      <img class="admin-sermon-thumb"
        src="${s.thumbnailUrl}"
        onerror="this.src='https://img.youtube.com/vi/${s.youtubeEmbedId}/hqdefault.jpg'"
        alt="${s.title}">
      <div class="admin-sermon-info">
        <div class="admin-sermon-title" title="${s.title}">${s.title}</div>
        <div class="admin-sermon-meta">
          <span>${s.preacherName}</span>
          <span>${s.duration}</span>
          <span class="admin-sermon-type-badge">${s.sermonType || 'Devotional'}</span>
        </div>
      </div>
      <div class="admin-sermon-actions">
        <button class="feat-btn ${s.featured ? 'featured-on' : ''}" data-id="${s.id}" title="${s.featured ? 'Unfeature' : 'Feature'}">
          ${s.featured ? '★' : '☆'}
        </button>
        <button class="del-btn" data-id="${s.id}" title="Delete">✕</button>
      </div>
    </div>
  `).join('');

  // Feature toggle
  list.querySelectorAll('.feat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const all2 = getSermons();
      const s    = all2.find(x => x.id === btn.dataset.id);
      if (!s) return;
      s.featured = !s.featured;
      upsertSermon(s);
      renderSermonsList();
      renderDashboardStats();
      toast(s.featured ? `⭐ "${s.title}" featured!` : `"${s.title}" unfeatured.`);
    });
  });

  // Delete
  list.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const all2 = getSermons();
      const s    = all2.find(x => x.id === btn.dataset.id);
      if (!s) return;
      if (!confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
      deleteSermon(s.id);
      renderSermonsList();
      renderDashboardStats();
      toast(`🗑️ "${s.title}" deleted.`);
    });
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
    savePreachers(preachers);
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
  savePreachers(preachers);
  populateSelects();
  renderPreachersList();
  renderDashboardStats();
  toast(`${name} removed from directory.`);
};

// ── EVENTS MANAGER ────────────────────────────────────────────────────────
function setupEventsManager() {
  document.getElementById('adminAddEventForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const title       = document.getElementById('newEventTitle').value.trim();
    const date        = document.getElementById('newEventDate').value;
    const time        = document.getElementById('newEventTime').value.trim();
    const category    = document.getElementById('newEventCategory').value;
    const location    = document.getElementById('newEventLocation').value.trim();
    const description = document.getElementById('newEventDesc').value.trim();

    const ev = {
      id: `ev-${Date.now()}`,
      title,
      date,
      time,
      category,
      location,
      description
    };

    upsertEvent(ev);
    renderEventsList();
    renderDashboardStats();
    e.target.reset();
    toast(`🗓️ "${title}" published!`);
  });

  renderEventsList();
}

function renderEventsList() {
  const c = document.getElementById('adminEventsList');
  const countEl = document.getElementById('eventsCount');
  const all = getEvents();

  if (countEl) countEl.textContent = all.length;
  if (!c) return;

  if (!all.length) {
    c.innerHTML = '<p style="color:var(--admin-muted);font-size:0.85rem;text-align:center;padding:24px;">No upcoming events. Add one!</p>';
    return;
  }

  c.innerHTML = all.map(ev => `
    <div class="admin-list-item" style="padding:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;flex-wrap:wrap;">
          <span class="admin-tag admin-tag-blue" style="font-size:0.7rem;">${ev.category || 'Event'}</span>
          <span style="font-size:0.75rem;color:var(--admin-muted);">${ev.date}${ev.time ? ` · ${ev.time}` : ''}</span>
        </div>
        <strong style="color:var(--admin-text);display:block;font-size:0.9rem;margin-bottom:4px;">${ev.title}</strong>
        <div style="font-size:0.78rem;color:var(--admin-muted);">${ev.location}</div>
      </div>
      <button class="admin-btn admin-btn-sm admin-btn-danger" data-id="${ev.id}" title="Delete Event">✕</button>
    </div>
  `).join('');

  c.querySelectorAll('.admin-btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const target = getEvents().find(x => x.id === id);
      if (!target) return;
      if (!confirm(`Delete event "${target.title}"?`)) return;
      deleteEvent(id);
      renderEventsList();
      renderDashboardStats();
      toast(`🗑️ "${target.title}" removed.`);
    });
  });
}

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

// ── BACKUP & RESTORE ──────────────────────────────────────────────────────
function setupBackupPanel() {
  // Export
  document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        scheduledDailyVerses,
        sermons: getSermons(),
        preachers,
        events: getEvents(),
        pendingPrayers
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `2ms-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const label = document.getElementById('lastExportLabel');
      if (label) label.textContent = `Last exported: ${new Date().toLocaleTimeString()}`;
      toast('📥 CMS backup downloaded!');
    } catch (err) {
      toast('⚠️ Failed to export backup. Please check browser permissions.');
    }
  });

  // Import / Restore
  const importBtn   = document.getElementById('importJsonBtn');
  const importInput = document.getElementById('importJsonInput');

  importBtn?.addEventListener('click', () => importInput?.click());

  importInput?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const raw = evt.target?.result;
        if (typeof raw !== 'string') throw new Error('Invalid file format');
        const parsed = JSON.parse(raw);

        // Validate structure
        if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON structure');

        let restoredItems = [];

        if (Array.isArray(parsed.sermons) && parsed.sermons.length) {
          saveSermons(parsed.sermons);
          restoredItems.push(`${parsed.sermons.length} sermons`);
        }

        if (Array.isArray(parsed.preachers) && parsed.preachers.length) {
          preachers.length = 0;
          preachers.push(...parsed.preachers);
          restoredItems.push(`${parsed.preachers.length} ministers`);
        }

        if (Array.isArray(parsed.scheduledDailyVerses) && parsed.scheduledDailyVerses.length) {
          scheduledDailyVerses.length = 0;
          scheduledDailyVerses.push(...parsed.scheduledDailyVerses);
          restoredItems.push(`${parsed.scheduledDailyVerses.length} verses`);
        }

        if (Array.isArray(parsed.events) && parsed.events.length) {
          saveEvents(parsed.events);
          restoredItems.push(`${parsed.events.length} events`);
        }

        if (Array.isArray(parsed.pendingPrayers)) {
          pendingPrayers.length = 0;
          pendingPrayers.push(...parsed.pendingPrayers);
        }

        if (!restoredItems.length) {
          toast('⚠️ File parsed, but no recognizable CMS records were found.');
          return;
        }

        // Re-render all views
        renderDashboardStats();
        renderSermonsList();
        renderPreachersList();
        renderEventsList();
        renderVerseQueue();
        renderPrayerInbox();
        populateSelects();

        toast(`✅ Successfully restored: ${restoredItems.join(', ')}!`);
      } catch (err) {
        toast(`⚠️ Backup import error: ${err.message || 'Corrupted or invalid JSON file.'}`);
      } finally {
        importInput.value = '';
      }
    };
    reader.onerror = () => {
      toast('⚠️ Could not read selected file.');
      importInput.value = '';
    };
    reader.readAsText(file);
  });
}

import { isFirebaseConfigured, saveDocument, seedCollectionIfEmpty } from './firebase.js';

// ── MINISTRY SETTINGS ─────────────────────────────────────────────────────
const SETTINGS_KEY = '2ms_settings';
const DEFAULT_YT_CHANNEL = 'https://www.youtube.com/c/2MinuteSermonP';

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-migrate generic or empty youtubeUrl to official channel
      if (!parsed.youtubeUrl || parsed.youtubeUrl === 'https://youtube.com' || parsed.youtubeUrl === 'https://youtube.com/') {
        parsed.youtubeUrl = DEFAULT_YT_CHANNEL;
      }
      return parsed;
    }
  } catch (_) {}
  return {
    contactEmail: 'pastor@2minutesermon.org',
    newsletterEmail: 'newsletter@2minutesermon.org',
    endpointUrl: '',
    youtubeUrl: DEFAULT_YT_CHANNEL,
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    twitterUrl: 'https://twitter.com',
    spotifyUrl: 'https://spotify.com'
  };
}

export function saveSettings(s) {
  try {
    // Ensure valid youtubeUrl
    if (!s.youtubeUrl || s.youtubeUrl === 'https://youtube.com' || s.youtubeUrl === 'https://youtube.com/') {
      s.youtubeUrl = DEFAULT_YT_CHANNEL;
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('2ms:settings:updated', { detail: s }));
  } catch (_) {}
  if (isFirebaseConfigured()) {
    saveDocument('settings', 'ministry', s);
  }
}

function setupSettingsPanel() {
  const contactInput    = document.getElementById('settingContactEmail');
  const newsletterInput = document.getElementById('settingNewsletterEmail');
  const endpointInput   = document.getElementById('settingEndpointUrl');
  const ytInput         = document.getElementById('settingYoutubeUrl');
  const fbInput         = document.getElementById('settingFacebookUrl');
  const igInput         = document.getElementById('settingInstagramUrl');
  const twInput         = document.getElementById('settingTwitterUrl');
  const spInput         = document.getElementById('settingSpotifyUrl');
  const form            = document.getElementById('adminSettingsForm');

  const current = getSettings();
  if (contactInput)    contactInput.value    = current.contactEmail || '';
  if (newsletterInput) newsletterInput.value = current.newsletterEmail || '';
  if (endpointInput)   endpointInput.value   = current.endpointUrl || '';
  if (ytInput)         ytInput.value         = current.youtubeUrl || DEFAULT_YT_CHANNEL;
  if (fbInput)         fbInput.value         = current.facebookUrl || '';
  if (igInput)         igInput.value         = current.instagramUrl || '';
  if (twInput)         twInput.value         = current.twitterUrl || '';
  if (spInput)         spInput.value         = current.spotifyUrl || '';

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const updated = {
      contactEmail: contactInput?.value.trim() || '',
      newsletterEmail: newsletterInput?.value.trim() || '',
      endpointUrl: endpointInput?.value.trim() || '',
      youtubeUrl: ytInput?.value.trim() || DEFAULT_YT_CHANNEL,
      facebookUrl: fbInput?.value.trim() || 'https://facebook.com',
      instagramUrl: igInput?.value.trim() || 'https://instagram.com',
      twitterUrl: twInput?.value.trim() || 'https://twitter.com',
      spotifyUrl: spInput?.value.trim() || 'https://spotify.com'
    };
    saveSettings(updated);
    toast('💾 Ministry settings & social channel links saved!');
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
