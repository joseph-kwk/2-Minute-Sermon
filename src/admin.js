// Admin CMS Portal — Standalone JS (admin.html)
// Sermon data is persisted in localStorage via the CMS store in sermons.js.

import { getSermons, upsertSermon, deleteSermon, extractVideoId, ytThumb, durationToSeconds } from './data/sermons.js';
import { getEvents, upsertEvent, deleteEvent, saveEvents } from './data/events.js';
import { getPreachers, savePreachers } from './data/preachers.js';
import { seasons } from './data/seasons.js';
import { getDailyVerses, saveDailyVerses } from './data/dailyVerse.js';
import { getLeadershipTeam, saveLeadershipTeam, upsertLeader, deleteLeader } from './data/leadership.js';
import { getPartners, savePartners, upsertPartner, deletePartner } from './data/partners.js';
import { getConversations, saveConversations, upsertConversation, deleteConversation } from './data/conversations.js';

// ── Runtime state ──────────────────────────────────────────────────────────
// Data arrays are read from localStorage — persistent across all reloads
const preachers = getPreachers();
const scheduledDailyVerses = getDailyVerses();
let pendingPrayers = [
  { id:'pr-1', name:'Sarah M.', email:'sarah@example.com', urgency:'Health & Healing', msg:'Please pray for my mother recovering from surgery.', date:'2026-08-22' },
  { id:'pr-2', name:'David K.', email:'david@example.com', urgency:'Family', msg:'Praying for guidance and peace during a difficult season.', date:'2026-08-23' }
];

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Steward2026!';
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
  setupLeadershipManager();
  setupConversationsManager();
  setupPartnersManager();
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
    renderLeadershipList();
    renderConversationsList();
    renderPartnersList();
    renderEventsList();
    renderPrayerInbox();
  };

  window.addEventListener('storage', refreshAdminView);
  window.addEventListener('2ms:sermons:updated', refreshAdminView);
  window.addEventListener('2ms:preachers:updated', refreshAdminView);
  window.addEventListener('2ms:conversations:updated', refreshAdminView);
  window.addEventListener('2ms:verses:updated', refreshAdminView);
  window.addEventListener('2ms:events:updated', refreshAdminView);
  window.addEventListener('2ms:leadership:updated', refreshAdminView);
});

// ── Topbar date ──────────────────────────────────────────────────────────
function updateTopbarDate() {
  const el = document.getElementById('adminTopbarDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ── AUTH ─────────────────────────────────────────────────────────────────
function setupAuthForm() {
  const form      = document.getElementById('adminAuthForm');
  const overlay   = document.getElementById('adminAuthOverlay');
  const dash      = document.getElementById('adminDashboard');
  const passInput = document.getElementById('adminAuthPass');
  const errEl     = document.getElementById('adminAuthError');
  const noticeEl  = document.getElementById('adminLogoutNotice');

  passInput?.addEventListener('input', () => {
    if (noticeEl) {
      noticeEl.hidden = true;
      noticeEl.classList.remove('visible');
    }
    if (errEl) errEl.textContent = '';
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const pass = passInput?.value || '';

    if (pass === ADMIN_PASSWORD) {
      authenticated = true;
      if (noticeEl) {
        noticeEl.hidden = true;
        noticeEl.classList.remove('visible');
      }
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
      if (errEl) errEl.textContent = 'Incorrect password. Please try again.';
      if (passInput) {
        passInput.value = '';
        passInput.focus();
      }
      const card = document.querySelector('.admin-auth-card');
      if (card) {
        card.style.animation = 'none';
        requestAnimationFrame(() => { card.style.animation = 'shake 0.4s ease'; });
      }
    }
  });

  // Inject fadeOut keyframe
  const st = document.createElement('style');
  st.textContent = `@keyframes fadeOut { to { opacity:0; transform:scale(0.97); } }`;
  document.head.appendChild(st);
}

// Sign out (Modernized & Smooth)
document.getElementById('adminSignOutBtn')?.addEventListener('click', () => {
  authenticated = false;
  const dash      = document.getElementById('adminDashboard');
  const overlay   = document.getElementById('adminAuthOverlay');
  const passInput = document.getElementById('adminAuthPass');
  const errEl     = document.getElementById('adminAuthError');
  const noticeEl  = document.getElementById('adminLogoutNotice');

  dash.style.animation = 'fadeOut 0.25s ease forwards';
  setTimeout(() => {
    dash.hidden = true;
    dash.style.animation = '';

    if (errEl) errEl.textContent = '';
    if (passInput) {
      passInput.value = '';
      passInput.focus();
    }

    if (noticeEl) {
      noticeEl.hidden = false;
      noticeEl.classList.add('visible');
      noticeEl.style.animation = 'fadeIn 0.3s ease';
    }

    overlay.hidden = false;
    overlay.style.animation = 'fadeIn 0.25s ease forwards';
    toast('🔒 Signed out. Session closed.');
  }, 220);
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
  const form = document.getElementById('adminAddPreacherForm');
  const nameInput = document.getElementById('newPreacherName');
  const denomInput = document.getElementById('newPreacherDenomination');
  const countryInput = document.getElementById('newPreacherCountry');
  const photoUrlInput = document.getElementById('newPreacherPhoto');
  const photoFileInput = document.getElementById('newPreacherPhotoFile');
  const bioInput = document.getElementById('newPreacherBio');
  const previewImg = document.getElementById('adminPreacherPhotoPreview');
  const btnTriggerUpload = document.getElementById('btnTriggerPhotoUpload');
  const btnDefaultAvatar = document.getElementById('btnDefaultAvatar');

  function updateAvatarPreview() {
    const customUrl = photoUrlInput?.value.trim();
    const name = nameInput?.value.trim() || 'Minister';
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;

    if (previewImg) {
      if (customUrl) {
        previewImg.src = customUrl;
        previewImg.onerror = () => { previewImg.src = fallback; };
      } else {
        previewImg.src = fallback;
      }
    }
  }

  nameInput?.addEventListener('input', () => {
    if (!photoUrlInput?.value) updateAvatarPreview();
  });

  photoUrlInput?.addEventListener('input', updateAvatarPreview);

  btnTriggerUpload?.addEventListener('click', () => {
    photoFileInput?.click();
  });

  photoFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('⚠️ Image is large (>2MB). Please select a smaller photo.');
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      if (photoUrlInput) photoUrlInput.value = dataUrl;
      if (previewImg) previewImg.src = dataUrl;
      toast('🖼️ Preacher photo uploaded!');
    };
    reader.readAsDataURL(file);
  });

  btnDefaultAvatar?.addEventListener('click', () => {
    const name = nameInput?.value.trim() || 'Minister';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;
    if (photoUrlInput) photoUrlInput.value = avatarUrl;
    if (previewImg) previewImg.src = avatarUrl;
    toast('⚡ Default initials avatar set.');
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name         = nameInput?.value.trim() || '';
    const denomination = denomInput?.value.trim() || '';
    const country      = countryInput?.value.trim() || '';
    let photoUrl       = photoUrlInput?.value.trim();
    const bio          = bioInput?.value.trim() || '';

    if (!photoUrl) {
      photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;
    }

    const newPreacher = { 
      id: `p-${Date.now()}`, 
      name, 
      denomination, 
      country, 
      photoUrl, 
      bio 
    };

    preachers.push(newPreacher);
    savePreachers(preachers);
    populateSelects();
    renderPreachersList();
    renderDashboardStats();
    form.reset();
    updateAvatarPreview();
    toast(`🎙️ ${name} added to the preacher directory!`);
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

// ── LEADERSHIP & TEAM MANAGER ─────────────────────────────────────────────
function setupLeadershipManager() {
  const form = document.getElementById('adminAddLeadershipForm');
  const nameInput = document.getElementById('newLeaderName');
  const roleInput = document.getElementById('newLeaderRole');
  const tierInput = document.getElementById('newLeaderTier');
  const photoUrlInput = document.getElementById('newLeaderPhoto');
  const photoFileInput = document.getElementById('newLeaderPhotoFile');
  const bioInput = document.getElementById('newLeaderBio');
  const previewImg = document.getElementById('adminLeaderPhotoPreview');
  const btnTriggerUpload = document.getElementById('btnTriggerLeaderPhotoUpload');
  const btnDefaultAvatar = document.getElementById('btnDefaultLeaderAvatar');

  function updateLeaderAvatarPreview() {
    const customUrl = photoUrlInput?.value.trim();
    const name = nameInput?.value.trim() || 'Leader';
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;

    if (previewImg) {
      if (customUrl) {
        previewImg.src = customUrl;
        previewImg.onerror = () => { previewImg.src = fallback; };
      } else {
        previewImg.src = fallback;
      }
    }
  }

  nameInput?.addEventListener('input', () => {
    if (!photoUrlInput?.value) updateLeaderAvatarPreview();
  });

  photoUrlInput?.addEventListener('input', updateLeaderAvatarPreview);

  btnTriggerUpload?.addEventListener('click', () => {
    photoFileInput?.click();
  });

  photoFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('⚠️ Image is large (>2MB). Please select a smaller photo.');
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      if (photoUrlInput) photoUrlInput.value = dataUrl;
      if (previewImg) previewImg.src = dataUrl;
      toast('🖼️ Leader photo uploaded!');
    };
    reader.readAsDataURL(file);
  });

  btnDefaultAvatar?.addEventListener('click', () => {
    const name = nameInput?.value.trim() || 'Leader';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;
    if (photoUrlInput) photoUrlInput.value = avatarUrl;
    if (previewImg) previewImg.src = avatarUrl;
    toast('⚡ Default initials avatar set.');
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name     = nameInput?.value.trim() || '';
    const role     = roleInput?.value.trim() || '';
    const tier     = tierInput?.value || 'Executive Board';
    let photoUrl   = photoUrlInput?.value.trim();
    const bio      = bioInput?.value.trim() || '';

    let tierOrder = 1;
    if (tier === 'Department Coordinators' || tier.includes('Department')) tierOrder = 2;
    if (tier === 'Network Preachers' || tier.includes('Network') || tier.includes('Preacher')) tierOrder = 3;

    if (!photoUrl) {
      photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;
    }

    const newLeader = {
      id: `lead-${Date.now()}`,
      name,
      role,
      tier,
      tierOrder,
      photoUrl,
      bio,
      email: ''
    };

    upsertLeader(newLeader);
    renderLeadershipList();
    form.reset();
    updateLeaderAvatarPreview();
    toast(`👥 "${name}" added to Who is Who (Team)!`);
  });

  renderLeadershipList();
}

function renderLeadershipList() {
  const c = document.getElementById('adminLeadersList');
  const countEl = document.getElementById('leadersCount');
  const team = getLeadershipTeam();

  if (countEl) countEl.textContent = team.length;
  if (!c) return;

  if (!team.length) {
    c.innerHTML = '<p style="color:var(--admin-muted);font-size:0.85rem;text-align:center;padding:24px;">No leaders configured. Add one!</p>';
    return;
  }

  c.innerHTML = team.map((m) => `
    <div class="admin-list-item" style="display:flex;align-items:center;gap:14px;padding:12px 14px;">
      <img src="${m.photoUrl}" alt="${m.name}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid var(--admin-red);"
           onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=C62828&color=fff&size=88'">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
          <strong style="color:#fff;font-size:0.92rem;">${m.name}</strong>
          <span class="admin-tag" style="font-size:0.68rem;">${m.tier || 'Team'}</span>
        </div>
        <span style="font-size:0.78rem;color:var(--admin-muted);">${m.role}</span>
      </div>
      <button class="admin-btn admin-btn-sm admin-btn-danger" data-id="${m.id}" title="Remove from leadership">✕</button>
    </div>
  `).join('');

  c.querySelectorAll('.admin-btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const target = getLeadershipTeam().find(x => x.id === id);
      if (!target) return;
      if (!confirm(`Remove "${target.name}" from the leadership roster?`)) return;
      deleteLeader(id);
      renderLeadershipList();
      toast(`🗑️ "${target.name}" removed from leadership.`);
    });
  });
}

// ── THE CONVERSATION MANAGER ──────────────────────────────────────────────
function setupConversationsManager() {
  const form = document.getElementById('addConversationForm');
  const cancelBtn = document.getElementById('btnCancelConvEdit');
  const heading = document.getElementById('convFormHeading');
  const submitBtn = document.getElementById('btnSubmitConv');
  const dateInput = document.getElementById('newConvDate');

  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  cancelBtn?.addEventListener('click', () => {
    form.reset();
    document.getElementById('editConvId').value = '';
    if (heading) heading.textContent = 'Publish Conversation Episode';
    if (submitBtn) submitBtn.textContent = '➕ Publish Conversation';
    cancelBtn.style.display = 'none';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const editId = document.getElementById('editConvId').value;
    const title = document.getElementById('newConvTitle').value.trim();
    const rawUrl = document.getElementById('newConvYoutubeUrl').value.trim();
    const category = document.getElementById('newConvCategory').value;
    const duration = document.getElementById('newConvDuration').value.trim() || '25:00';
    const panelists = document.getElementById('newConvPanelists').value.trim();
    const scriptures = document.getElementById('newConvScriptures').value.trim();
    const status = document.getElementById('newConvStatus').value;
    const publishDate = document.getElementById('newConvDate').value || new Date().toISOString().split('T')[0];
    const summary = document.getElementById('newConvSummary').value.trim();
    const featured = document.getElementById('newConvFeatured').checked;

    const embedId = extractVideoId(rawUrl) || 'SJFqqNvTeh8';
    const finalUrl = rawUrl.startsWith('http') ? rawUrl : `https://www.youtube.com/watch?v=${embedId}`;
    const thumbnailUrl = ytThumb(embedId);

    const episode = {
      id: editId || `conv-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      youtubeUrl: finalUrl,
      youtubeEmbedId: embedId,
      thumbnailUrl,
      panelists,
      category,
      scriptures,
      duration,
      durationSec: durationToSeconds(duration) || 1500,
      publishDate,
      status,
      featured,
      summary
    };

    upsertConversation(episode);
    renderConversationsList();
    form.reset();
    document.getElementById('editConvId').value = '';
    if (heading) heading.textContent = 'Publish Conversation Episode';
    if (submitBtn) submitBtn.textContent = '➕ Publish Conversation';
    cancelBtn.style.display = 'none';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    toast(`🎙️ Episode "${title}" saved successfully!`);
  });

  renderConversationsList();
}

function renderConversationsList() {
  const c = document.getElementById('adminConversationsList');
  const countEl = document.getElementById('convCount');
  const list = getConversations();

  if (countEl) countEl.textContent = list.length;
  if (!c) return;

  if (!list.length) {
    c.innerHTML = '<p style="color:var(--admin-muted);font-size:0.85rem;text-align:center;padding:24px;">No conversation episodes found.</p>';
    return;
  }

  c.innerHTML = list.map(item => `
    <div class="admin-list-item" style="display:flex;align-items:flex-start;gap:14px;padding:14px;">
      <div style="position:relative;width:96px;aspect-ratio:16/9;border-radius:6px;overflow:hidden;background:#000;flex-shrink:0;">
        <img src="${item.thumbnailUrl}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;"
             onerror="this.src='https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80'">
        <span style="position:absolute;bottom:3px;right:3px;background:rgba(0,0,0,0.85);color:#fff;font-size:0.65rem;font-weight:700;padding:1px 4px;border-radius:3px;">
          ${item.duration}
        </span>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;">
          <strong style="color:#fff;font-size:0.92rem;">${item.title}</strong>
          <span class="admin-tag" style="font-size:0.66rem;">${item.category}</span>
          ${item.featured ? '<span class="admin-tag" style="font-size:0.66rem;background:rgba(217,119,6,0.2);color:#FBBF24;">⭐ Featured</span>' : ''}
          <span class="admin-tag" style="font-size:0.66rem;background:${item.status === 'Published' ? 'rgba(46,125,50,0.2)' : 'rgba(217,119,6,0.2)'};color:${item.status === 'Published' ? '#4CAF50' : '#FBBF24'};">
            ${item.status}
          </span>
        </div>
        <div style="font-size:0.78rem;color:var(--admin-muted);margin-bottom:4px;">
          <strong>Panelists:</strong> ${item.panelists}
        </div>
        ${item.scriptures ? `<div style="font-size:0.75rem;color:var(--admin-red);margin-bottom:4px;">📖 ${item.scriptures}</div>` : ''}
        <p style="font-size:0.8rem;color:var(--admin-muted);margin:0 0 8px 0;line-height:1.4;">${item.summary.substring(0, 95)}...</p>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="admin-btn admin-btn-sm admin-btn-outline edit-conv-btn" data-id="${item.id}">✏️ Edit</button>
          <a href="${item.youtubeUrl}" target="_blank" rel="noopener" class="admin-btn admin-btn-sm admin-btn-outline" style="text-decoration:none;">▶️ Watch</a>
          <button class="admin-btn admin-btn-sm admin-btn-danger del-conv-btn" data-id="${item.id}" title="Delete Episode">✕</button>
        </div>
      </div>
    </div>
  `).join('');

  // Hook Edit buttons
  c.querySelectorAll('.edit-conv-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = getConversations().find(x => x.id === id);
      if (!item) return;

      document.getElementById('editConvId').value = item.id;
      document.getElementById('newConvTitle').value = item.title;
      document.getElementById('newConvYoutubeUrl').value = item.youtubeUrl || item.youtubeEmbedId;
      document.getElementById('newConvCategory').value = item.category || 'Biblical Leadership';
      document.getElementById('newConvDuration').value = item.duration || '25:00';
      document.getElementById('newConvPanelists').value = item.panelists || '';
      document.getElementById('newConvScriptures').value = item.scriptures || '';
      document.getElementById('newConvStatus').value = item.status || 'Published';
      document.getElementById('newConvDate').value = item.publishDate || '';
      document.getElementById('newConvSummary').value = item.summary || '';
      document.getElementById('newConvFeatured').checked = !!item.featured;

      const heading = document.getElementById('convFormHeading');
      const submitBtn = document.getElementById('btnSubmitConv');
      const cancelBtn = document.getElementById('btnCancelConvEdit');
      if (heading) heading.textContent = `Edit: "${item.title}"`;
      if (submitBtn) submitBtn.textContent = '💾 Update Episode';
      if (cancelBtn) cancelBtn.style.display = 'inline-block';

      document.getElementById('addConversationForm')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Hook Delete buttons
  c.querySelectorAll('.del-conv-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const target = getConversations().find(x => x.id === id);
      if (!target) return;
      if (!confirm(`Delete conversation episode "${target.title}"?`)) return;
      deleteConversation(id);
      renderConversationsList();
      toast(`🗑️ "${target.title}" deleted.`);
    });
  });
}

// ── MINISTRY PARTNERS MANAGER ─────────────────────────────────────────────
function setupPartnersManager() {
  const form = document.getElementById('addPartnerForm');
  const fileInput = document.getElementById('partnerLogoFile');
  const uploadBtn = document.getElementById('btnTriggerPartnerLogoUpload');
  const previewImg = document.getElementById('partnerLogoPreview');
  const logoUrlInput = document.getElementById('newPartnerLogo');

  uploadBtn?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        if (previewImg) previewImg.src = ev.target.result;
        if (logoUrlInput) logoUrlInput.value = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  logoUrlInput?.addEventListener('input', () => {
    if (logoUrlInput.value.trim() && previewImg) {
      previewImg.src = logoUrlInput.value.trim();
    }
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('newPartnerName')?.value.trim();
    const category = document.getElementById('newPartnerCategory')?.value.trim() || 'Ministry Partner';
    const scriptureAnchor = document.getElementById('newPartnerScripture')?.value.trim() || '';
    const websiteUrl = document.getElementById('newPartnerWebsite')?.value.trim() || '';
    const description = document.getElementById('newPartnerDesc')?.value.trim();
    let logoUrl = logoUrlInput?.value.trim();

    if (!name || !description) {
      toast('⚠️ Please provide the partner name and description.');
      return;
    }

    if (!logoUrl) {
      logoUrl = `https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80`;
    }

    const partner = {
      id: `partner-${Date.now()}`,
      name,
      category,
      scriptureAnchor,
      websiteUrl,
      description,
      logoUrl
    };

    upsertPartner(partner);
    renderPartnersList();
    form.reset();
    if (previewImg) previewImg.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80';
    toast(`🤝 "${name}" added to Ministry Partners!`);
  });

  renderPartnersList();
}

function renderPartnersList() {
  const c = document.getElementById('adminPartnersList');
  const countEl = document.getElementById('partnersCount');
  const list = getPartners();

  if (countEl) countEl.textContent = list.length;
  if (!c) return;

  if (!list.length) {
    c.innerHTML = '<p style="color:var(--admin-muted);font-size:0.85rem;text-align:center;padding:24px;">No ministry partners added yet.</p>';
    return;
  }

  c.innerHTML = list.map(p => `
    <div class="admin-list-item" style="display:flex;align-items:flex-start;gap:14px;padding:14px;">
      <img src="${p.logoUrl}" alt="${p.name}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;flex-shrink:0;border:1px solid var(--admin-border);"
           onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=D97706&color=fff&size=100'">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
          <strong style="color:#fff;font-size:0.95rem;">${p.name}</strong>
          <span class="admin-tag" style="font-size:0.68rem;">${p.category || 'Partner'}</span>
        </div>
        ${p.scriptureAnchor ? `<span style="display:block;font-size:0.78rem;color:var(--admin-red);margin-bottom:4px;">📖 ${p.scriptureAnchor}</span>` : ''}
        <p style="font-size:0.82rem;color:var(--admin-muted);line-height:1.5;margin:0 0 6px 0;">${p.description.substring(0, 110)}...</p>
        ${p.websiteUrl ? `<a href="${p.websiteUrl}" target="_blank" rel="noopener" style="font-size:0.78rem;color:var(--admin-gold);text-decoration:none;">🌐 ${p.websiteUrl}</a>` : ''}
      </div>
      <button class="admin-btn admin-btn-sm admin-btn-danger" data-id="${p.id}" title="Remove partner">✕</button>
    </div>
  `).join('');

  c.querySelectorAll('.admin-btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const target = getPartners().find(x => x.id === id);
      if (!target) return;
      if (!confirm(`Remove "${target.name}" from ministry partners?`)) return;
      deletePartner(id);
      renderPartnersList();
      toast(`🗑️ "${target.name}" removed from partners.`);
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
const DEFAULT_MINISTRY_EMAIL = 'info2minutesermon@gmail.com';
const DEFAULT_YT_CHANNEL = 'https://www.youtube.com/c/2MinuteSermonP';
const DEFAULT_FB_PAGE    = 'https://www.facebook.com/2minutesermon';
const DEFAULT_IG_PAGE    = 'https://www.instagram.com/2_minutesermon/';

export function normalizeUrl(url) {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-migrate generic/placeholder values to verified ministry values
      if (!parsed.contactEmail || parsed.contactEmail.includes('@2minutesermon.org')) {
        parsed.contactEmail = DEFAULT_MINISTRY_EMAIL;
      }
      if (!parsed.newsletterEmail || parsed.newsletterEmail.includes('@2minutesermon.org')) {
        parsed.newsletterEmail = DEFAULT_MINISTRY_EMAIL;
      }
      if (!parsed.youtubeUrl || parsed.youtubeUrl === 'https://youtube.com' || parsed.youtubeUrl === 'https://youtube.com/') {
        parsed.youtubeUrl = DEFAULT_YT_CHANNEL;
      }
      if (!parsed.facebookUrl || parsed.facebookUrl === 'https://facebook.com' || parsed.facebookUrl === 'https://facebook.com/') {
        parsed.facebookUrl = DEFAULT_FB_PAGE;
      }
      if (!parsed.instagramUrl || parsed.instagramUrl === 'https://instagram.com' || parsed.instagramUrl === 'https://instagram.com/') {
        parsed.instagramUrl = DEFAULT_IG_PAGE;
      }
      return parsed;
    }
  } catch (_) {}
  return {
    contactEmail: DEFAULT_MINISTRY_EMAIL,
    newsletterEmail: DEFAULT_MINISTRY_EMAIL,
    endpointUrl: '',
    youtubeUrl: DEFAULT_YT_CHANNEL,
    facebookUrl: DEFAULT_FB_PAGE,
    instagramUrl: DEFAULT_IG_PAGE,
    twitterUrl: '',
    spotifyUrl: ''
  };
}

export function saveSettings(s) {
  try {
    // Ensure valid emails and normalized social links
    s.contactEmail = s.contactEmail?.trim() || DEFAULT_MINISTRY_EMAIL;
    s.newsletterEmail = s.newsletterEmail?.trim() || DEFAULT_MINISTRY_EMAIL;

    if (!s.youtubeUrl || s.youtubeUrl === 'https://youtube.com' || s.youtubeUrl === 'https://youtube.com/') {
      s.youtubeUrl = DEFAULT_YT_CHANNEL;
    } else {
      s.youtubeUrl = normalizeUrl(s.youtubeUrl);
    }
    s.facebookUrl = normalizeUrl(s.facebookUrl) || DEFAULT_FB_PAGE;
    s.instagramUrl = normalizeUrl(s.instagramUrl) || DEFAULT_IG_PAGE;
    if (s.endpointUrl) s.endpointUrl = normalizeUrl(s.endpointUrl);

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
  const form            = document.getElementById('adminSettingsForm');

  const current = getSettings();
  if (contactInput)    contactInput.value    = current.contactEmail || DEFAULT_MINISTRY_EMAIL;
  if (newsletterInput) newsletterInput.value = current.newsletterEmail || DEFAULT_MINISTRY_EMAIL;
  if (endpointInput)   endpointInput.value   = current.endpointUrl || '';
  if (ytInput)         ytInput.value         = current.youtubeUrl || DEFAULT_YT_CHANNEL;
  if (fbInput)         fbInput.value         = current.facebookUrl || DEFAULT_FB_PAGE;
  if (igInput)         igInput.value         = current.instagramUrl || DEFAULT_IG_PAGE;

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const updated = {
      contactEmail: contactInput?.value.trim() || DEFAULT_MINISTRY_EMAIL,
      newsletterEmail: newsletterInput?.value.trim() || DEFAULT_MINISTRY_EMAIL,
      endpointUrl: normalizeUrl(endpointInput?.value),
      youtubeUrl: normalizeUrl(ytInput?.value) || DEFAULT_YT_CHANNEL,
      facebookUrl: normalizeUrl(fbInput?.value) || DEFAULT_FB_PAGE,
      instagramUrl: normalizeUrl(igInput?.value) || DEFAULT_IG_PAGE,
      twitterUrl: '',
      spotifyUrl: ''
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
