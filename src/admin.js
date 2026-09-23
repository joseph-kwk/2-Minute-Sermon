// Admin CMS Portal — Standalone JS (admin.html)
// Sermon data is persisted in localStorage via the CMS store in sermons.js.

import { getSermons, upsertSermon, deleteSermon, extractVideoId, ytThumb, durationToSeconds } from './data/sermons.js';
import { getEvents, upsertEvent, deleteEvent, saveEvents } from './data/events.js';
import { getPreachers, savePreachers, upsertPreacher, deletePreacher } from './data/preachers.js';
import { seasons } from './data/seasons.js';
import { getDailyVerses, saveDailyVerses, deleteDailyVerse, getVerseForDate, upsertDailyVerse, getLocalDateStr } from './data/dailyVerse.js';
import { getLeadershipTeam, saveLeadershipTeam, upsertLeader, deleteLeader } from './data/leadership.js';
import { getPartners, savePartners, upsertPartner, deletePartner } from './data/partners.js';
import { getConversations, saveConversations, upsertConversation, deleteConversation } from './data/conversations.js';
import { getSubscribers, exportSubscribersToCsv } from './data/subscribers.js';
import { getAllReflections, deleteReflection, saveReflections } from './data/reflections.js';

// ── Runtime state ──────────────────────────────────────────────────────────
// Data arrays are read from localStorage — persistent across all reloads
let preachers = getPreachers();
const scheduledDailyVerses = getDailyVerses();
let pendingPrayers = [
  { id:'pr-1', name:'Sarah M.', email:'sarah@example.com', urgency:'Health & Healing', msg:'Please pray for my mother recovering from surgery.', date:'2026-08-22' },
  { id:'pr-2', name:'David K.', email:'david@example.com', urgency:'Family', msg:'Praying for guidance and peace during a difficult season.', date:'2026-08-23' }
];

const VALID_PASSWORDS = ['Serm0n$26', 'Serm0n', 'sermon2026'];
const SESSION_KEY     = '2ms_steward_authenticated';
let authenticated   = false;
let activePanel     = 'dashboard';

// ── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupAuth();
  updateTopbarDate();
  setupSidebarNav();
  setupQuickActions();
  setupVerseScheduler();
  setupSermonPublisher();
  setupPreachersManager();
  setupLeadershipManager();
  setupConversationsManager();
  setupPartnersManager();
  setupEventsManager();
  setupReflectionsManager();
  setupSettingsPanel();
  setupBackupPanel();
  setupSubscribersManager();
  populateSelects();

  // Restore authenticated session if active in current browser tab
  checkExistingSession();

  // ── Real-time Cloud Data Sync Listeners for Admin ─────────────────────────
  const refreshAdminView = () => {
    preachers = getPreachers();
    populateSelects();
    renderDashboardStats();
    renderSermonsList();
    renderVerseQueue();
    renderPreachersList();
    renderLeadershipList();
    renderConversationsList();
    renderPartnersList();
    renderEventsList();
    renderPrayerInbox();
    renderReflectionsList();
  };

  window.addEventListener('storage', refreshAdminView);
  window.addEventListener('2ms:sermons:updated', refreshAdminView);
  window.addEventListener('2ms:preachers:updated', refreshAdminView);
  window.addEventListener('2ms:conversations:updated', refreshAdminView);
  window.addEventListener('2ms:verses:updated', refreshAdminView);
  window.addEventListener('2ms:events:updated', refreshAdminView);
  window.addEventListener('2ms:leadership:updated', refreshAdminView);
  window.addEventListener('2ms:reflections:updated', refreshAdminView);
});

// ── Topbar date ──────────────────────────────────────────────────────────
function updateTopbarDate() {
  const el = document.getElementById('adminTopbarDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ── Check Existing Session on Load ───────────────────────────────────────
function checkExistingSession() {
  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    authenticated = true;
    const overlay = document.getElementById('adminAuthOverlay');
    const dash    = document.getElementById('adminDashboard');
    if (overlay && dash) {
      overlay.hidden = true;
      dash.hidden    = false;
      renderDashboardStats();
      renderSermonsList();
      renderVerseQueue();
      renderPreachersList();
      renderEventsList();
      renderPrayerInbox();
      renderReflectionsList();
    }
  }
}

// ── AUTH ─────────────────────────────────────────────────────────────────
function setupAuth() {
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
    const pass = (passInput?.value || '').trim();

    if (VALID_PASSWORDS.includes(pass)) {
      authenticated = true;
      sessionStorage.setItem(SESSION_KEY, 'true');

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
        renderSermonsList();
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

// ── Unified Sign Out (Clean session removal & mobile drawer dismissal) ────
function handleSignOut() {
  authenticated = false;
  sessionStorage.removeItem(SESSION_KEY);

  // Unconditionally close mobile drawer and backdrop if open
  const sidebar  = document.querySelector('.admin-sidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop');
  if (sidebar)  sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');

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
}

document.getElementById('adminSignOutBtn')?.addEventListener('click', handleSignOut);
document.getElementById('adminTopSignOutBtn')?.addEventListener('click', handleSignOut);
document.getElementById('adminTopbarSignOutBtn')?.addEventListener('click', handleSignOut);

// ── SIDEBAR NAV ─────────────────────────────────────────────────────────
function closeMobileSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop') || document.getElementById('adminNavBackdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

function openMobileSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop') || document.getElementById('adminNavBackdrop');
  if (sidebar) sidebar.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
}

function setupSidebarNav() {
  const sidebar = document.querySelector('.admin-sidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop') || document.getElementById('adminNavBackdrop');
  const menuBtn = document.getElementById('adminMobileMenuBtn');
  const closeBtn = document.getElementById('adminSidebarCloseBtn');

  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('open')) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileSidebar);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileSidebar);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileSidebar();
  });

  document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.getAttribute('data-panel');
      if (panel) switchPanel(panel);
      closeMobileSidebar();
    });
  });
}

function setupQuickActions() {
  document.querySelectorAll('.admin-quick-btn, .admin-stat-card[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.getAttribute('data-panel');
      if (panel) {
        switchPanel(panel);
        closeMobileSidebar();
      }
    });
  });
}

const PANEL_TITLES = {
  dashboard:     'Dashboard',
  'daily-verse': 'Daily Verse Queue',
  reflections:   'Community Reflections Moderation',
  sermons:       'Sermon Publisher',
  preachers:     'Preachers Manager',
  events:        'Events Manager',
  leadership:    'Leadership & Team',
  conversations: 'The Conversation',
  partners:      'Ministry Partners',
  subscribers:   'Newsletter Subscribers',
  prayers:       'Prayer Inbox',
  settings:      'Ministry Settings',
  backup:        'Export & Backup'
};

function switchPanel(panelId) {
  activePanel = panelId;

  document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.toggle('active', b.getAttribute('data-panel') === panelId));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${panelId}`));

  const titleEl = document.getElementById('adminTopbarTitle');
  if (titleEl) titleEl.textContent = PANEL_TITLES[panelId] || panelId;

  if (panelId === 'reflections') {
    renderReflectionsList();
  } else if (panelId === 'dashboard') {
    renderDashboardStats();
  }
}

// ── DASHBOARD STATS ───────────────────────────────────────────────────────
function renderDashboardStats() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('statSermons',   getSermons().length);
  set('statVerses',    scheduledDailyVerses.length);
  set('statPreachers', preachers.length);
  set('statEvents',    getEvents().length);
  set('statPrayers',   pendingPrayers.length);
  const allReflections = getAllReflections();
  set('statReflections', allReflections.length);
  const refBadge = document.getElementById('reflectionsBadge');
  if (refBadge) refBadge.textContent = allReflections.length;
  updatePrayerBadge();
}

function updatePrayerBadge() {
  const b = document.getElementById('prayerBadge');
  if (b) b.textContent = pendingPrayers.length;
}

// ── DAILY VERSE SCHEDULER ─────────────────────────────────────────────────
function setupVerseScheduler() {
  const dateInput = document.getElementById('adminDvDate');
  if (dateInput) dateInput.value = getLocalDateStr();

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
    upsertDailyVerse(entry);

    e.target.reset();
    if (dateInput) dateInput.value = getLocalDateStr();
    renderVerseQueue();
    renderDashboardStats();
    toast(`📅 Verse scheduled for ${dateStr}`);
  });

  document.getElementById('clearQueueBtn')?.addEventListener('click', () => {
    if (!confirm('Clear all scheduled verses?')) return;
    scheduledDailyVerses.forEach(v => deleteDailyVerse(v.id));
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

  // Update live status banner
  const statusEl = document.getElementById('adminTodayVerseStatus');
  if (statusEl) {
    const todayStr = getLocalDateStr();
    const todayVerse = getVerseForDate(todayStr);
    if (!todayVerse.isFallback) {
      statusEl.className = 'admin-verse-status-banner is-scheduled';
      statusEl.innerHTML = `<span>🟢</span> <div><strong>Today (${todayStr}):</strong> Custom scheduled verse active on live site — <em>${todayVerse.book} ${todayVerse.chapter}:${todayVerse.verse}</em></div>`;
    } else {
      statusEl.className = 'admin-verse-status-banner is-fallback';
      statusEl.innerHTML = `<span>ℹ️</span> <div><strong>Today (${todayStr}):</strong> Auto-rotating from the <strong>Evergreen Devotional Collection</strong> (<em>${todayVerse.book} ${todayVerse.chapter}:${todayVerse.verse}</em>). The live site always displays fresh scripture automatically — you can schedule a custom verse anytime!</div>`;
    }
  }

  if (!c) return;

  if (!scheduledDailyVerses.length) {
    c.innerHTML = `<p style="color:rgba(255,255,255,0.3);text-align:center;padding:32px 0;">No custom verses scheduled yet.<br><small style="color:rgba(255,255,255,0.2);">Live site is automatically serving the daily evergreen devotional rotation.</small></p>`;
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
  const removed = scheduledDailyVerses.splice(idx, 1)[0];
  if (removed && removed.id) {
    deleteDailyVerse(removed.id);
  }
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

  if (preacherSel) {
    const list = getPreachers();
    preacherSel.innerHTML = list.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
  }

  if (seasonSel)
    seasonSel.innerHTML = seasons.filter(s => s.slug !== 'all')
      .map(s => `<option value="${s.name}">${s.name}</option>`).join('');
}

// ── Image Auto-Compressor & Downscaler (HTML5 Canvas) ─────────────────────
// ── PHOTO CROP MODAL ENGINE ────────────────────────────────────────────────
// Opens a circular drag-to-crop modal. onConfirm(dataUrl) is called with the
// final 280×280 JPEG data URL when the user clicks "Use This Photo".
function openPhotoCropModal(imageFile, onConfirm) {
  const modal  = document.getElementById('photoCropModal');
  const canvas = document.getElementById('cropCanvas');
  const stage  = document.getElementById('cropStage');
  const slider = document.getElementById('cropZoomSlider');
  if (!modal || !canvas || !stage || !slider) {
    // Fallback: skip crop and compress directly
    compressImageFile(imageFile, 280, 0.82).then(onConfirm).catch(() => {});
    return;
  }

  const STAGE = stage.offsetWidth || 300; // respect responsive size
  canvas.width  = STAGE;
  canvas.height = STAGE;
  const ctx = canvas.getContext('2d');

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      // Minimum scale: image must fully cover the circle
      const minScale = Math.max(STAGE / img.width, STAGE / img.height);
      let scale = minScale;
      // Center image initially
      let offsetX = (STAGE - img.width  * scale) / 2;
      let offsetY = (STAGE - img.height * scale) / 2;

      slider.min   = minScale;
      slider.max   = Math.min(minScale * 4, 6);
      slider.step  = 0.001;
      slider.value = scale;

      // Clamp: image must always cover all 4 edges of the circle
      function clamp(ox, oy, sc) {
        const iw = img.width  * sc;
        const ih = img.height * sc;
        return {
          x: Math.max(STAGE - iw, Math.min(0, ox)),
          y: Math.max(STAGE - ih, Math.min(0, oy))
        };
      }

      function draw() {
        ctx.clearRect(0, 0, STAGE, STAGE);
        ctx.fillStyle = '#0d0d0f';
        ctx.fillRect(0, 0, STAGE, STAGE);
        ctx.drawImage(img, offsetX, offsetY, img.width * scale, img.height * scale);
      }
      draw();
      modal.style.display = 'flex';

      // ── Drag to pan ──────────────────────────────────────────────────────
      let isDragging = false, dragX = 0, dragY = 0, startX = 0, startY = 0;

      function getXY(e) {
        return e.touches
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : { x: e.clientX,            y: e.clientY            };
      }

      function onDown(e) {
        e.preventDefault();
        isDragging = true;
        const p = getXY(e);
        dragX = p.x; dragY = p.y;
        startX = offsetX; startY = offsetY;
      }
      function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const p = getXY(e);
        const clamped = clamp(startX + (p.x - dragX), startY + (p.y - dragY), scale);
        offsetX = clamped.x; offsetY = clamped.y;
        draw();
      }
      function onUp() { isDragging = false; }

      stage.addEventListener('mousedown',  onDown, { passive: false });
      stage.addEventListener('touchstart', onDown, { passive: false });
      window.addEventListener('mousemove', onMove, { passive: false });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('mouseup',   onUp);
      window.addEventListener('touchend',  onUp);

      // ── Zoom slider ──────────────────────────────────────────────────────
      function onZoom() {
        const newScale = parseFloat(slider.value);
        // Zoom toward the circle center
        const cx = STAGE / 2, cy = STAGE / 2;
        const ratio = newScale / scale;
        const clamped = clamp(
          cx - (cx - offsetX) * ratio,
          cy - (cy - offsetY) * ratio,
          newScale
        );
        scale = newScale;
        offsetX = clamped.x; offsetY = clamped.y;
        draw();
      }
      slider.addEventListener('input', onZoom);

      // ── Cleanup helpers ──────────────────────────────────────────────────
      function cleanup() {
        stage.removeEventListener('mousedown',  onDown);
        stage.removeEventListener('touchstart', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup',   onUp);
        window.removeEventListener('touchend',  onUp);
        slider.removeEventListener('input', onZoom);
        modal.style.display = 'none';
      }

      // ── Confirm ──────────────────────────────────────────────────────────
      document.getElementById('btnCropConfirm').onclick = () => {
        // Export the live 300px canvas, scaled down to 280px output
        const out    = document.createElement('canvas');
        out.width    = 280;
        out.height   = 280;
        out.getContext('2d').drawImage(canvas, 0, 0, 280, 280);
        const dataUrl = out.toDataURL('image/jpeg', 0.82);
        const kb = Math.round(dataUrl.length * 0.75 / 1024);
        cleanup();
        onConfirm(dataUrl, kb);
      };

      // ── Cancel ───────────────────────────────────────────────────────────
      document.getElementById('btnCropCancel').onclick = cleanup;
    };
    img.onerror = () => toast('⚠️ Could not load image. Please try another file.');
    img.src = ev.target.result;
  };
  reader.readAsDataURL(imageFile);
}

// Ensures uploaded photos (which can be 5MB-12MB from phones) are smoothly
// downscaled to ~360-480px and compressed to ~25KB-40KB JPEG. This guarantees
// they never exceed Firestore's 1MB document limit or localStorage's 5MB origin quota.
function compressImageFile(file, maxDim = 400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not a supported image format.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target.result);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function updateBioWordCounter(textareaEl, counterEl, maxWords = 150) {
  if (!counterEl) return;
  const count = countWords(textareaEl?.value || '');
  if (count <= 130) {
    counterEl.textContent = `${count} / ${maxWords} words`;
    counterEl.style.color = 'var(--admin-text-muted, #9ca3af)';
    counterEl.style.fontWeight = '600';
  } else if (count <= maxWords) {
    counterEl.textContent = `${count} / ${maxWords} words`;
    counterEl.style.color = '#f59e0b';
    counterEl.style.fontWeight = '700';
  } else {
    const over = count - maxWords;
    counterEl.textContent = `⚠️ ${count} / ${maxWords} words (${over} over limit)`;
    counterEl.style.color = 'var(--admin-red, #ef4444)';
    counterEl.style.fontWeight = '800';
  }
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
  const bioCounterEl = document.getElementById('preacherBioWordCounter');

  const refreshPreacherBioCount = () => updateBioWordCounter(bioInput, bioCounterEl, 150);
  bioInput?.addEventListener('input', refreshPreacherBioCount);
  bioInput?.addEventListener('paste', () => setTimeout(refreshPreacherBioCount, 50));
  refreshPreacherBioCount();

  function convertToDirectImageUrl(url) {
    // Auto-convert Google Drive share links to a direct embeddable image URL.
    // lh3.googleusercontent.com/d/ID serves the image directly in <img> tags.
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    const driveOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (driveOpen) {
      return `https://lh3.googleusercontent.com/d/${driveOpen[1]}`;
    }
    return url;
  }

  function updateAvatarPreview() {
    const rawUrl = photoUrlInput?.value.trim();
    const customUrl = rawUrl ? convertToDirectImageUrl(rawUrl) : '';
    const name = nameInput?.value.trim() || 'Minister';
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;

    if (previewImg) {
      if (customUrl) {
        previewImg.src = customUrl;
        previewImg.onerror = () => { previewImg.src = fallback; };
        // Also update the input with the converted URL so it saves correctly
        if (photoUrlInput && customUrl !== rawUrl) photoUrlInput.value = customUrl;
      } else {
        previewImg.src = fallback;
      }
    }
  }

  nameInput?.addEventListener('input', () => {
    if (!photoUrlInput?.value) updateAvatarPreview();
  });

  // Listen on input, paste, and change so preview fires reliably in all browsers
  photoUrlInput?.addEventListener('input', updateAvatarPreview);
  photoUrlInput?.addEventListener('paste', () => setTimeout(updateAvatarPreview, 50));
  photoUrlInput?.addEventListener('change', updateAvatarPreview);

  btnTriggerUpload?.addEventListener('click', () => {
    photoFileInput?.click();
  });

  photoFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoFileInput) photoFileInput.value = ''; // reset so same file can be re-selected
    openPhotoCropModal(file, (dataUrl, kb) => {
      if (photoUrlInput) photoUrlInput.value = dataUrl;
      if (previewImg)    previewImg.src = dataUrl;
      toast(`✅ Photo cropped & ready! (${kb ?? '?'} KB) — Click Save to apply.`);
    });
  });

  btnDefaultAvatar?.addEventListener('click', () => {
    const name = nameInput?.value.trim() || 'Minister';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;
    if (photoUrlInput) photoUrlInput.value = avatarUrl;
    if (previewImg) previewImg.src = avatarUrl;
    toast('⚡ Default initials avatar set.');
  });

  const cancelBtn = document.getElementById('btnCancelPreacherEdit');
  const titleEl = document.getElementById('preacherFormTitle');
  const submitBtn = document.getElementById('btnPreacherSubmit');
  const editIdInput = document.getElementById('editPreacherId');

  function resetPreacherForm() {
    form.reset();
    if (editIdInput) editIdInput.value = '';
    if (titleEl) titleEl.textContent = 'Add Preacher Profile';
    if (submitBtn) submitBtn.textContent = '➕ Add Preacher to Directory';
    if (cancelBtn) cancelBtn.style.display = 'none';
    updateAvatarPreview();
    refreshPreacherBioCount();
  }

  cancelBtn?.addEventListener('click', () => {
    resetPreacherForm();
    toast('Edit cancelled.');
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const editId       = editIdInput?.value.trim();
    const name         = nameInput?.value.trim() || '';
    const denomination = denomInput?.value.trim() || '';
    const country      = countryInput?.value.trim() || '';
    let photoUrl       = photoUrlInput?.value.trim();
    const bio          = bioInput?.value.trim() || '';

    const bioWords = countWords(bio);
    if (bioWords > 150) {
      toast(`⚠️ Preacher bio cannot exceed 150 words (currently ${bioWords} words). Please shorten it.`);
      bioInput?.focus();
      return;
    }

    if (!photoUrl) {
      photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;
    }

    if (editId) {
      // Update existing preacher in place
      const idx = preachers.findIndex(p => p.id === editId);
      if (idx >= 0) {
        preachers[idx] = {
          ...preachers[idx],
          name,
          denomination,
          country,
          photoUrl,
          bio
        };
        upsertPreacher(preachers[idx]);
        preachers = getPreachers();
        populateSelects();
        renderPreachersList();
        renderDashboardStats();
        resetPreacherForm();
        toast(`✅ Preacher "${name}" updated successfully!`);
        return;
      }
    }

    // Creating new preacher
    const newPreacher = { 
      id: `p-${Date.now()}`, 
      name, 
      denomination, 
      country, 
      photoUrl, 
      bio 
    };

    upsertPreacher(newPreacher);
    preachers = getPreachers();
    populateSelects();
    renderPreachersList();
    renderDashboardStats();
    resetPreacherForm();
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
      <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;">
        <button class="admin-btn admin-btn-sm admin-btn-outline edit-preacher-btn" data-id="${p.id}" title="Edit minister details & photo">✏️ Edit</button>
        <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="removePreacher(${idx})" title="Remove minister">✕</button>
      </div>
    </div>`).join('');

  // Attach Edit Click Handlers
  c.querySelectorAll('.edit-preacher-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const p = preachers.find(item => item.id === id);
      if (!p) return;

      const editIdInput = document.getElementById('editPreacherId');
      const nameInput = document.getElementById('newPreacherName');
      const denomInput = document.getElementById('newPreacherDenomination');
      const countryInput = document.getElementById('newPreacherCountry');
      const photoUrlInput = document.getElementById('newPreacherPhoto');
      const bioInput = document.getElementById('newPreacherBio');
      const previewImg = document.getElementById('adminPreacherPhotoPreview');
      const titleEl = document.getElementById('preacherFormTitle');
      const submitBtn = document.getElementById('btnPreacherSubmit');
      const cancelBtn = document.getElementById('btnCancelPreacherEdit');

      if (editIdInput) editIdInput.value = p.id;
      if (nameInput) nameInput.value = p.name || '';
      if (denomInput) denomInput.value = p.denomination || '';
      if (countryInput) countryInput.value = p.country || '';
      if (bioInput) {
        bioInput.value = p.bio || '';
        updateBioWordCounter(bioInput, document.getElementById('preacherBioWordCounter'), 150);
      }
      if (photoUrlInput) photoUrlInput.value = p.photoUrl || '';
      if (previewImg && p.photoUrl) previewImg.src = p.photoUrl;

      if (titleEl) titleEl.textContent = `✏️ Edit Minister: ${p.name}`;
      if (submitBtn) submitBtn.textContent = '💾 Save Preacher Changes';
      if (cancelBtn) cancelBtn.style.display = 'block';

      // Smoothly scroll to the form
      document.getElementById('adminAddPreacherForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInput?.focus();
      toast(`✏️ Editing ${p.name}. Update photo, bio, or location above.`);
    });
  });
}

window.removePreacher = idx => {
  const p = preachers[idx];
  if (!p) return;
  const name = p.name;
  deletePreacher(p.id);
  preachers = getPreachers();
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
  const editIdInput = document.getElementById('editLeaderId');
  const heading = document.getElementById('leaderFormHeading');
  const submitBtn = document.getElementById('btnSubmitLeader');
  const cancelBtn = document.getElementById('btnCancelLeaderEdit');
  const importSelect = document.getElementById('leaderPreacherImportSelect');
  const nameInput = document.getElementById('newLeaderName');
  const roleInput = document.getElementById('newLeaderRole');
  const tierInput = document.getElementById('newLeaderTier');
  const photoUrlInput = document.getElementById('newLeaderPhoto');
  const photoFileInput = document.getElementById('newLeaderPhotoFile');
  const bioInput = document.getElementById('newLeaderBio');
  const previewImg = document.getElementById('adminLeaderPhotoPreview');
  const btnTriggerUpload = document.getElementById('btnTriggerLeaderPhotoUpload');
  const btnDefaultAvatar = document.getElementById('btnDefaultLeaderAvatar');
  const leaderBioCounterEl = document.getElementById('leaderBioWordCounter');

  const refreshLeaderBioCount = () => updateBioWordCounter(bioInput, leaderBioCounterEl, 150);
  bioInput?.addEventListener('input', refreshLeaderBioCount);
  bioInput?.addEventListener('paste', () => setTimeout(refreshLeaderBioCount, 50));
  refreshLeaderBioCount();

  // Populate Preachers quick-import dropdown
  function populateLeaderPreacherImport() {
    if (!importSelect) return;
    const pList = getPreachers();
    importSelect.innerHTML = '<option value="">-- Choose Preacher to Autofill --</option>' +
      pList.map(p => `<option value="${p.id}">${p.name}${p.title ? ` (${p.title})` : ''}</option>`).join('');
  }
  populateLeaderPreacherImport();
  window.addEventListener('2ms:preachers:updated', populateLeaderPreacherImport);

  importSelect?.addEventListener('change', () => {
    const selectedId = importSelect.value;
    if (!selectedId) return;
    const p = getPreachers().find(x => x.id === selectedId);
    if (p) {
      if (nameInput) nameInput.value = p.name || '';
      if (bioInput && p.bio) {
        bioInput.value = p.bio;
        refreshLeaderBioCount();
      }
      if (p.photoUrl) {
        if (photoUrlInput) photoUrlInput.value = p.photoUrl;
        if (previewImg) previewImg.src = p.photoUrl;
      }
      toast(`Autofilled photo & details from "${p.name}"!`);
    }
  });

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

  function resetLeaderForm() {
    form.reset();
    if (editIdInput) editIdInput.value = '';
    if (heading) heading.textContent = 'Add Leadership Member';
    if (submitBtn) submitBtn.textContent = '➕ Add to Who is Who (Team)';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (importSelect) importSelect.value = '';
    updateLeaderAvatarPreview();
    refreshLeaderBioCount();
  }

  cancelBtn?.addEventListener('click', resetLeaderForm);

  btnTriggerUpload?.addEventListener('click', () => photoFileInput?.click());

  nameInput?.addEventListener('input', () => {
    if (!photoUrlInput?.value) updateLeaderAvatarPreview();
  });

  photoUrlInput?.addEventListener('paste', () => setTimeout(updateLeaderAvatarPreview, 50));
  photoUrlInput?.addEventListener('change', updateLeaderAvatarPreview);

  photoFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoFileInput) photoFileInput.value = '';
    openPhotoCropModal(file, (dataUrl, kb) => {
      if (photoUrlInput) photoUrlInput.value = dataUrl;
      if (previewImg)    previewImg.src = dataUrl;
      toast(`✅ Photo cropped & ready! (${kb ?? '?'} KB) — Click Save to apply.`);
    });
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
    const editId   = editIdInput?.value;
    const name     = nameInput?.value.trim() || '';
    const role     = roleInput?.value.trim() || '';
    const tier     = tierInput?.value || 'Executive Board';
    let photoUrl   = photoUrlInput?.value.trim();
    const bio      = bioInput?.value.trim() || '';

    const bioWords = countWords(bio);
    if (bioWords > 150) {
      toast(`⚠️ Leader bio cannot exceed 150 words (currently ${bioWords} words). Please shorten it.`);
      bioInput?.focus();
      return;
    }

    let tierOrder = 1;
    if (tier === 'Department Coordinators' || tier.includes('Department')) tierOrder = 2;
    if (tier === 'Network Preachers' || tier.includes('Network') || tier.includes('Preacher')) tierOrder = 3;

    if (!photoUrl) {
      photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C62828&color=fff&size=160`;
    }

    const leaderItem = {
      id: editId || `lead-${Date.now()}`,
      name,
      role,
      tier,
      tierOrder,
      photoUrl,
      bio,
      email: ''
    };

    upsertLeader(leaderItem);
    renderLeadershipList();
    resetLeaderForm();
    toast(`👥 "${name}" saved to Who is Who (Team)!`);
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
      <div style="display:flex;gap:6px;">
        <button class="admin-btn admin-btn-sm admin-btn-outline edit-leader-btn" data-id="${m.id}" title="Edit leader details">✏️</button>
        <button class="admin-btn admin-btn-sm admin-btn-danger del-leader-btn" data-id="${m.id}" title="Remove from leadership">✕</button>
      </div>
    </div>
  `).join('');

  // Hook Edit buttons
  c.querySelectorAll('.edit-leader-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const target = getLeadershipTeam().find(x => x.id === id);
      if (!target) return;

      const editIdInput = document.getElementById('editLeaderId');
      const nameInput   = document.getElementById('newLeaderName');
      const roleInput   = document.getElementById('newLeaderRole');
      const tierInput   = document.getElementById('newLeaderTier');
      const photoUrlInput = document.getElementById('newLeaderPhoto');
      const bioInput    = document.getElementById('newLeaderBio');
      const previewImg  = document.getElementById('adminLeaderPhotoPreview');
      const heading     = document.getElementById('leaderFormHeading');
      const submitBtn   = document.getElementById('btnSubmitLeader');
      const cancelBtn   = document.getElementById('btnCancelLeaderEdit');

      if (editIdInput) editIdInput.value = target.id;
      if (nameInput) nameInput.value = target.name || '';
      if (roleInput) roleInput.value = target.role || '';
      if (tierInput) tierInput.value = target.tier || 'Executive Board';
      if (photoUrlInput) photoUrlInput.value = target.photoUrl || '';
      if (previewImg) previewImg.src = target.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(target.name)}&background=C62828&color=fff&size=160`;
      if (bioInput) {
        bioInput.value = target.bio || '';
        updateBioWordCounter(bioInput, document.getElementById('leaderBioWordCounter'), 150);
      }

      if (heading) heading.textContent = `Edit: "${target.name}"`;
      if (submitBtn) submitBtn.textContent = '💾 Update Team Member';
      if (cancelBtn) cancelBtn.style.display = 'inline-block';

      document.getElementById('adminAddLeadershipForm')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Hook Delete buttons
  c.querySelectorAll('.del-leader-btn').forEach(btn => {
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
    if (document.getElementById('newConvFormat')) document.getElementById('newConvFormat').value = 'conversation';
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
    const format = document.getElementById('newConvFormat')?.value || 'conversation';
    const category = document.getElementById('newConvCategory').value;
    const duration = document.getElementById('newConvDuration').value.trim() || '25:00';
    const panelists = document.getElementById('newConvPanelists').value.trim();
    const scriptures = document.getElementById('newConvScriptures').value.trim();
    const status = document.getElementById('newConvStatus').value;
    const publishDate = document.getElementById('newConvDate').value || new Date().toISOString().split('T')[0];
    const summary = document.getElementById('newConvSummary').value.trim();
    const featured = document.getElementById('newConvFeatured').checked;

    const embedId = extractVideoId(rawUrl) || 'gdxWYvV7hkg';
    const finalUrl = rawUrl.startsWith('http') ? rawUrl : `https://www.youtube.com/watch?v=${embedId}`;
    const thumbnailUrl = ytThumb(embedId);

    const episode = {
      id: editId || `conv-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      format,
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
    if (document.getElementById('newConvFormat')) document.getElementById('newConvFormat').value = 'conversation';
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
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
          ${item.format === 'plus' ? '<span class="admin-tag admin-tag-gold" style="font-size:0.68rem;background:rgba(217,119,6,0.2);color:#fbbf24;border:1px solid rgba(217,119,6,0.4);">2-MIN PLUS</span>' : ''}
          <span class="admin-tag" style="font-size:0.7rem;">${item.category}</span>
          <span class="admin-tag ${item.status === 'Published' ? 'admin-tag-green' : 'admin-tag-blue'}" style="font-size:0.7rem;">
            ${item.status}
          </span>
          ${item.featured ? '<span class="admin-tag admin-tag-gold" style="font-size:0.7rem;">★ Featured</span>' : ''}
          <span style="font-size:0.75rem;color:var(--admin-muted);">${item.publishDate}</span>
        </div>
        <strong style="color:var(--admin-text);display:block;font-size:0.95rem;margin-bottom:4px;">${item.title}</strong>
        <div style="font-size:0.8rem;color:var(--admin-muted);margin-bottom:8px;">
          👥 ${item.panelists}
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
      if (document.getElementById('newConvFormat')) {
        document.getElementById('newConvFormat').value = item.format || (item.title?.toLowerCase().includes('plus') ? 'plus' : 'conversation');
      }
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

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast('⏳ Optimizing logo...');
      const compressedDataUrl = await compressImageFile(file, 480, 0.85);
      if (previewImg) previewImg.src = compressedDataUrl;
      if (logoUrlInput) logoUrlInput.value = compressedDataUrl;
      toast('🖼️ Partner logo optimized & uploaded!');
    } catch (err) {
      console.warn('Partner logo compression error:', err);
      toast('⚠️ Could not process image. Please try another file or paste a URL.');
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

// ── COMMUNITY REFLECTIONS MODERATION ─────────────────────────────────────────
function setupReflectionsManager() {
  const searchInput = document.getElementById('adminReflectionsSearch');
  const dateFilter = document.getElementById('adminReflectionsDateFilter');

  searchInput?.addEventListener('input', () => renderReflectionsList());
  dateFilter?.addEventListener('change', () => renderReflectionsList());
  renderReflectionsList();
}

function renderReflectionsList() {
  const container = document.getElementById('adminReflectionsList');
  const countEl = document.getElementById('adminReflectionsCount');
  if (!container) return;

  const all = getAllReflections();

  // Update date filter options dynamically
  const dateFilter = document.getElementById('adminReflectionsDateFilter');
  if (dateFilter) {
    const dates = [...new Set(all.map(r => r.verseDate).filter(Boolean))].sort().reverse();
    dates.forEach(d => {
      if (!Array.from(dateFilter.options).some(o => o.value === d)) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `Date: ${d}`;
        dateFilter.appendChild(opt);
      }
    });
  }

  const selectedDate = dateFilter?.value || 'ALL';
  const searchTerm = (document.getElementById('adminReflectionsSearch')?.value || '').toLowerCase().trim();
  const todayStr = getLocalDateStr();

  let filtered = all.filter(r => {
    if (selectedDate === 'TODAY' && r.verseDate !== todayStr) return false;
    if (selectedDate !== 'ALL' && selectedDate !== 'TODAY' && r.verseDate !== selectedDate) return false;
    if (searchTerm) {
      const author = (r.author || '').toLowerCase();
      const content = (r.content || '').toLowerCase();
      if (!author.includes(searchTerm) && !content.includes(searchTerm)) return false;
    }
    return true;
  });

  if (countEl) {
    countEl.textContent = (filtered.length === all.length) ? all.length : `${filtered.length} of ${all.length}`;
  }

  if (!filtered.length) {
    if (selectedDate === 'TODAY' && all.length > 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:var(--admin-text-muted);">
          <p style="font-size:1.1rem;margin-bottom:6px;color:#fff;">💬 No reflections posted yet for today (${todayStr})</p>
          <p style="font-size:0.88rem;margin-bottom:16px;">There are ${all.length} community reflections from other dates in the database.</p>
          <button type="button" class="admin-btn admin-btn-sm admin-btn-primary" onclick="const f = document.getElementById('adminReflectionsDateFilter'); if (f) { f.value='ALL'; } window.renderReflectionsList();">
            View All ${all.length} Reflections
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:var(--admin-text-muted);">
          <p style="font-size:1.1rem;margin-bottom:6px;color:#fff;">💬 No reflections found</p>
          <p style="font-size:0.85rem;">${all.length ? 'Try changing your search term or date filter.' : 'No community comments have been posted yet.'}</p>
        </div>
      `;
    }
    return;
  }

  container.innerHTML = filtered.map(r => {
    const authorEscaped = escapeAdminHtml(r.author || 'Fellow Believer');
    const contentEscaped = escapeAdminHtml(r.content || '');
    const dateBadge = r.verseDate ? `<span class="admin-badge" style="background:rgba(245,158,11,0.15);color:#d97706;border:1px solid rgba(245,158,11,0.3);">📅 Verse: ${r.verseDate}</span>` : '';
    const likesBadge = `<span style="font-size:0.8rem;color:#f43f5e;font-weight:600;display:inline-flex;align-items:center;gap:4px;">❤️ ${r.likes || 0}</span>`;
    const timeFormatted = r.timestamp ? new Date(r.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

    return `
      <div class="admin-reflection-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 20px;display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#c62828,#b71c1c);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;">
              ${(r.author || 'B')[0].toUpperCase()}
            </div>
            <div>
              <strong style="color:#fff;font-size:0.95rem;">${authorEscaped}</strong>
              ${timeFormatted ? `<span style="font-size:0.75rem;color:var(--admin-text-muted);margin-left:8px;">${timeFormatted}</span>` : ''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            ${dateBadge}
            ${likesBadge}
          </div>
        </div>
        <p style="font-size:0.9rem;line-height:1.6;color:rgba(255,255,255,0.85);white-space:pre-wrap;margin:4px 0 8px;">${contentEscaped}</p>
        <div style="display:flex;justify-content:flex-end;">
          <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.deleteReflectionAdmin('${r.id}')" style="gap:5px;font-size:0.78rem;padding:6px 12px;">
            🗑️ Delete Reflection
          </button>
        </div>
      </div>
    `;
  }).join('');
}
window.renderReflectionsList = renderReflectionsList;

function escapeAdminHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.deleteReflectionAdmin = (id) => {
  const all = getAllReflections();
  const target = all.find(r => r.id === id);
  if (!confirm(`Are you sure you want to delete reflection by "${target?.author || 'this user'}"? This action cannot be undone.`)) {
    return;
  }
  deleteReflection(id);
  renderReflectionsList();
  renderDashboardStats();
  toast('🗑️ Reflection removed from community wall.');
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
        pendingPrayers,
        reflections: getAllReflections()
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

        if (Array.isArray(parsed.reflections) && parsed.reflections.length) {
          saveReflections(parsed.reflections);
          restoredItems.push(`${parsed.reflections.length} reflections`);
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
const DEFAULT_FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkjnbzgw';
const DEFAULT_YT_CHANNEL = 'https://www.youtube.com/c/2MinuteSermonP';
const DEFAULT_FB_PAGE    = 'https://www.facebook.com/2minutesermon';
const DEFAULT_IG_PAGE    = 'https://www.instagram.com/2_minutesermon/';
const DEFAULT_TIKTOK     = 'https://www.tiktok.com/@2minutesermon';
const DEFAULT_PROMO_URL  = 'https://www.youtube.com/watch?v=SJFqqNvTeh8';

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
      if (!parsed.endpointUrl) {
        parsed.endpointUrl = DEFAULT_FORMSPREE_ENDPOINT;
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
      if (!parsed.tiktokUrl) {
        parsed.tiktokUrl = DEFAULT_TIKTOK;
      }
      if (!parsed.promoVideoUrl) {
        parsed.promoVideoUrl = DEFAULT_PROMO_URL;
      }
      if (!parsed.timezone) {
        parsed.timezone = 'EST';
      }
      if (!parsed.seasonalMode) {
        parsed.seasonalMode = 'auto';
      }
      return parsed;
    }
  } catch (_) {}
  return {
    contactEmail: DEFAULT_MINISTRY_EMAIL,
    newsletterEmail: DEFAULT_MINISTRY_EMAIL,
    endpointUrl: DEFAULT_FORMSPREE_ENDPOINT,
    youtubeUrl: DEFAULT_YT_CHANNEL,
    facebookUrl: DEFAULT_FB_PAGE,
    instagramUrl: DEFAULT_IG_PAGE,
    tiktokUrl: DEFAULT_TIKTOK,
    promoVideoUrl: DEFAULT_PROMO_URL,
    timezone: 'EST',
    seasonalMode: 'auto',
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
    s.tiktokUrl = normalizeUrl(s.tiktokUrl) || DEFAULT_TIKTOK;
    s.promoVideoUrl = s.promoVideoUrl?.trim() || DEFAULT_PROMO_URL;
    s.timezone = s.timezone || 'EST';
    s.seasonalMode = s.seasonalMode || 'auto';
    if (s.endpointUrl) s.endpointUrl = normalizeUrl(s.endpointUrl);

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    localStorage.setItem('sermon_seasonal_global', s.seasonalMode);
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
  const tiktokInput     = document.getElementById('settingTiktokUrl');
  const timezoneSelect  = document.getElementById('settingTimezone');
  const promoInput      = document.getElementById('settingPromoVideoUrl');
  const seasonalSelect  = document.getElementById('settingSeasonalMode');
  const form            = document.getElementById('adminSettingsForm');

  const current = getSettings();
  if (contactInput)    contactInput.value    = current.contactEmail || DEFAULT_MINISTRY_EMAIL;
  if (newsletterInput) newsletterInput.value = current.newsletterEmail || DEFAULT_MINISTRY_EMAIL;
  if (endpointInput)   endpointInput.value   = current.endpointUrl || '';
  if (ytInput)         ytInput.value         = current.youtubeUrl || DEFAULT_YT_CHANNEL;
  if (fbInput)         fbInput.value         = current.facebookUrl || DEFAULT_FB_PAGE;
  if (igInput)         igInput.value         = current.instagramUrl || DEFAULT_IG_PAGE;
  if (tiktokInput)     tiktokInput.value     = current.tiktokUrl || DEFAULT_TIKTOK;
  if (timezoneSelect)  timezoneSelect.value  = current.timezone || 'EST';
  if (promoInput)      promoInput.value      = current.promoVideoUrl || DEFAULT_PROMO_URL;
  if (seasonalSelect)  seasonalSelect.value  = current.seasonalMode || 'auto';

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const updated = {
      contactEmail: contactInput?.value.trim() || DEFAULT_MINISTRY_EMAIL,
      newsletterEmail: newsletterInput?.value.trim() || DEFAULT_MINISTRY_EMAIL,
      endpointUrl: normalizeUrl(endpointInput?.value),
      youtubeUrl: normalizeUrl(ytInput?.value) || DEFAULT_YT_CHANNEL,
      facebookUrl: normalizeUrl(fbInput?.value) || DEFAULT_FB_PAGE,
      instagramUrl: normalizeUrl(igInput?.value) || DEFAULT_IG_PAGE,
      tiktokUrl: normalizeUrl(tiktokInput?.value) || DEFAULT_TIKTOK,
      timezone: timezoneSelect?.value || 'EST',
      promoVideoUrl: promoInput?.value.trim() || DEFAULT_PROMO_URL,
      seasonalMode: seasonalSelect?.value || 'auto',
      twitterUrl: '',
      spotifyUrl: ''
    };
    saveSettings(updated);
    toast('💾 Ministry settings & seasonal ambiance saved!');
  });
}

// ── NEWSLETTER SUBSCRIBERS MANAGER ────────────────────────────────────────
function setupSubscribersManager() {
  const c = document.getElementById('adminSubscribersList');
  const countEl = document.getElementById('subscribersCount');
  const exportBtn = document.getElementById('btnExportSubscribersCsv');

  const render = () => {
    const list = getSubscribers();
    if (countEl) countEl.textContent = list.length;
    if (!c) return;

    if (!list.length) {
      c.innerHTML = '<p style="color:var(--admin-muted);font-size:0.85rem;text-align:center;padding:24px;">No subscribers recorded yet.</p>';
      return;
    }

    c.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
        <thead>
          <tr style="text-align:left;border-bottom:1px solid var(--admin-border);color:var(--admin-muted);">
            <th style="padding:8px 6px;">Email</th>
            <th style="padding:8px 6px;">Subscribed</th>
            <th style="padding:8px 6px;">Source</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(s => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:8px 6px;color:#fff;font-weight:600;">${s.email}</td>
              <td style="padding:8px 6px;color:var(--admin-muted);font-size:0.78rem;">${s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : 'Active'}</td>
              <td style="padding:8px 6px;"><span class="admin-tag" style="font-size:0.68rem;">${s.source || 'Website'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  exportBtn?.addEventListener('click', () => {
    const csvContent = exportSubscribersToCsv();
    if (!csvContent) {
      toast('⚠️ No subscribers to export yet.');
      return;
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2ms_newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📥 Subscriber CSV exported successfully!');
  });

  render();
  window.addEventListener('2ms:subscribers:updated', render);
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
