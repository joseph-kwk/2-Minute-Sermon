import { getSermons } from './data/sermons.js';
import { getEvents } from './data/events.js';
import { getPreachers } from './data/preachers.js';
import { seasons } from './data/seasons.js';
import { topics } from './data/topics.js';
import { getDailyVerses } from './data/dailyVerse.js';
import { getLeadershipTeam } from './data/leadership.js';

// ─── Dynamic store getters — always return fresh data from localStorage ─────────────
const sermons    = () => getSermons();
const events     = () => getEvents();
const preachers  = () => getPreachers();
const scheduledDailyVerses = () => getDailyVerses();
const leadership = () => getLeadershipTeam();


let activeView = 'home';
let activeSeasonChip = 'all';
let currentCarouselIndex = 0;
let pendingPrayers = [
  { id: 'pr-1', name: 'Sarah M.', email: 'sarah@example.com', urgency: 'Health & Healing', msg: 'Please pray for my mother recovering from surgery.', status: 'New', date: '2026-08-22' },
  { id: 'pr-2', name: 'David K.', email: 'david@example.com', urgency: 'Family', msg: 'Praying for guidance and peace during a difficult season.', status: 'New', date: '2026-08-23' }
];

// Admin Auth (simple pin-based gate — replace with backend auth in production)
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? '';
let adminAuthenticated = false;

// SVG helpers
const svgPlay   = `<svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
const svgShare  = `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;
const svgClock  = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const svgBook   = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;

function getTodayDateStr() {
  return new Date().toISOString().split('T')[0];
}

function getVerseForDate(dateStr) {
  const list = scheduledDailyVerses();
  return list.find(v => v.publishDate === dateStr) || list[0];
}

// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  animateLogoTitle();
  setupScrollReveal();
  setupHeaderScroll();
  setupNavigation();
  setupExploreDropdown();
  setupMobileDrawer();
  setupHeroCtas();
  setupPromoVideo();
  setupSermonFilters();
  setupDailyVerse();
  setupPrayerForm();
  setupNewsletterForm();
  setupGeneralContactForm();
  setupAdminPortal();

  renderHomeSermons();
  filterAndRenderSermons();
  renderSeasonsHub();
  renderTopicsHub();
  renderPreachersHub();
  renderEventsGrid();
  renderAdminPreachersList();
  renderAboutOrganigram();
  updateFooterSocialLinks();

  // ─── Real-time Cloud Data Sync Listeners ─────────────────────────────────
  const refreshAllUI = () => {
    renderHomeSermons();
    filterAndRenderSermons();
    renderSeasonsHub();
    renderTopicsHub();
    renderPreachersHub();
    renderEventsGrid();
    renderAboutOrganigram();
    populateDropdownFilterOptions();
    setupDailyVerse();
    updateFooterSocialLinks();
  };

  window.addEventListener('storage', refreshAllUI);
  window.addEventListener('2ms:sermons:updated', refreshAllUI);
  window.addEventListener('2ms:preachers:updated', refreshAllUI);
  window.addEventListener('2ms:verses:updated', refreshAllUI);
  window.addEventListener('2ms:events:updated', refreshAllUI);
  window.addEventListener('2ms:leadership:updated', refreshAllUI);
});

// ─── LOGO TITLE ANIMATION ─────────────────────────────────────────────────────
function animateLogoTitle() {
  const el = document.getElementById('animatedLogoTitle');
  if (!el) return;

  const text   = '2-Minute Sermon';
  const words  = text.split(' ');
  let baseDelay = 120; // ms before first letter
  let html = '';

  words.forEach((word, wi) => {
    [...word].forEach((ch, ci) => {
      const delay = baseDelay + (wi * word.length + ci) * 48;
      html += `<span class="letter" style="animation-delay:${delay}ms">${ch}</span>`;
    });
    if (wi < words.length - 1) html += '<span class="word-space"></span>';
  });

  el.innerHTML = html;
}

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal-on-scroll, .stagger-children').forEach(el => {
    observer.observe(el);
  });
}

// Re-run reveal for newly rendered grids
function observeNewCards(container) {
  if (!container) return;
  container.classList.add('stagger-children');
  // Give browser a tick to paint, then trigger
  requestAnimationFrame(() => {
    requestAnimationFrame(() => container.classList.add('revealed'));
  });
}

// ─── HEADER SCROLL SHADOW ─────────────────────────────────────────────────────
function setupHeaderScroll() {
  const header = document.getElementById('appHeader');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      if (!targetView) return;
      if (targetView === 'admin') { openAdminPortal(); return; }
      switchView(targetView);
      closeDropdown();
      closeMobileDrawer();
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) switchView(hash);
  });

  if (window.location.hash) {
    const h = window.location.hash.replace('#', '');
    if (document.getElementById(`view-${h}`)) switchView(h);
  }
}

const VIEW_TITLES = {
  home: '2-Minute Sermon | Short, Scripture-Rooted Messages Worldwide',
  sermons: 'All Sermons | 2-Minute Sermon',
  seasons: 'Liturgical Seasons Hub | 2-Minute Sermon',
  topics: 'Topics & Pastoral Themes | 2-Minute Sermon',
  preachers: 'Preachers Directory | 2-Minute Sermon',
  'daily-verse': "Today's Daily Verse | 2-Minute Sermon",
  prayers: 'Prayer Requests & Community Wall | 2-Minute Sermon',
  events: 'Upcoming Ministry Events | 2-Minute Sermon',
  about: 'About Our Ministry | 2-Minute Sermon',
  contact: 'Contact & Minister Submissions | 2-Minute Sermon'
};

export function switchView(viewId) {
  activeView = viewId;
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (VIEW_TITLES[viewId]) {
      document.title = VIEW_TITLES[viewId];
    }

    // Re-trigger scroll-reveal for elements inside newly-visible view
    setTimeout(() => {
      target.querySelectorAll('.reveal-on-scroll, .stagger-children').forEach(el => {
        el.classList.add('revealed');
      });
    }, 60);
  }

  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
  });
}
window.switchView = switchView;

// ─── EXPLORE DROPDOWN ─────────────────────────────────────────────────────────
function setupExploreDropdown() {
  const wrapper = document.getElementById('exploreDropdownWrapper');
  const btn = document.getElementById('exploreBtn');
  if (!btn || !wrapper) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    wrapper.classList.toggle('open');
    btn.setAttribute('aria-expanded', wrapper.classList.contains('open'));
  });

  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) closeDropdown();
  });
}

function closeDropdown() {
  const wrapper = document.getElementById('exploreDropdownWrapper');
  const btn = document.getElementById('exploreBtn');
  wrapper?.classList.remove('open');
  btn?.setAttribute('aria-expanded', 'false');
}

// ─── MOBILE DRAWER ────────────────────────────────────────────────────────────
function setupMobileDrawer() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    toggleBtn.classList.toggle('open', isOpen);
  });
}

function closeMobileDrawer() {
  document.getElementById('mobileDrawer')?.classList.remove('open');
  document.getElementById('mobileToggleBtn')?.classList.remove('open');
}

// ─── HERO & PROMO VIDEO ───────────────────────────────────────────────────────
const PROMO_VIDEO_ID = 'SJFqqNvTeh8';

function setupHeroCtas() {
  document.getElementById('heroPrimaryCta')?.addEventListener('click', (e) => {
    e.preventDefault();
    playPromoVideo();
  });

  document.getElementById('heroSecondaryCta')?.addEventListener('click', (e) => {
    e.preventDefault();
    const dvSection = document.querySelector('.section-daily-verse-widget');
    if (dvSection) {
      dvSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      switchView('daily-verse');
    }
  });

  // Re-render when sermons, events, verses, or preachers are updated in localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === '2ms_sermons') {
      renderHomeSermons();
      filterAndRenderSermons();
    }
    if (e.key === '2ms_events') {
      renderEventsGrid();
    }
    if (e.key === '2ms_preachers') {
      renderPreachersHub();
      populateDropdownFilterOptions();
    }
    if (e.key === '2ms_verses') {
      setupDailyVerse();
    }
  });
}

function setupPromoVideo() {
  const posterWrap = document.getElementById('promoPosterWrap');
  posterWrap?.addEventListener('click', () => playPromoVideo());
  posterWrap?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playPromoVideo();
    }
  });
}

function playPromoVideo() {
  const frame = document.getElementById('promoCinemaFrame');
  const posterWrap = document.getElementById('promoPosterWrap');
  const playerWrap = document.getElementById('promoPlayerWrap');
  if (!playerWrap || !posterWrap) return;

  posterWrap.style.display = 'none';
  playerWrap.hidden = false;
  playerWrap.innerHTML = `
    <iframe 
      src="https://www.youtube-nocookie.com/embed/${PROMO_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1" 
      title="2-Minute Sermon Promo Video" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen
      class="promo-iframe">
    </iframe>
  `;

  frame?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
window.playPromoVideo = playPromoVideo;

function renderHomeSermons() {
  const container = document.getElementById('homeSermonsGrid');
  if (!container) return;
  container.innerHTML = sermons().slice(0, 6).map(s => createSermonCardHtml(s)).join('');
  observeNewCards(container);
}

function createSermonCardHtml(s) {
  return `
    <div class="sermon-card">
      <div class="sermon-thumb-wrap">
        <img src="${s.thumbnailUrl}" alt="${s.title}" class="sermon-thumb-img" loading="lazy"
          onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='https://img.youtube.com/vi/${s.youtubeEmbedId}/hqdefault.jpg';}else{this.onerror=null;this.src='https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80';}">
        <span class="sermon-duration-badge">${svgClock} ${s.duration}</span>
      </div>
      <div class="sermon-card-content">
        <div class="carousel-badges" style="margin-bottom:8px;">
          <span class="badge badge-season">${s.primarySeason}</span>
        </div>
        <h3 class="sermon-card-title">${s.title}</h3>
        <div class="sermon-card-meta">${s.preacherName} &bull; ${s.scripture}</div>
        <p class="sermon-card-summary">${s.summary}</p>
        <div class="sermon-card-footer">
          <button class="btn btn-primary btn-sm" onclick="window.openSermonModal('${s.id}')">
            ${svgPlay} Watch
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.shareSermon('${s.title}', '${s.id}')">
            ${svgShare} Share
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── SERMON FILTERS ───────────────────────────────────────────────────────────
function setupSermonFilters() {
  const searchInput = document.getElementById('sermonSearchInput');
  const clearBtn    = document.getElementById('searchClearBtn');

  searchInput?.addEventListener('input', e => {
    if (clearBtn) clearBtn.hidden = !e.target.value;
    filterAndRenderSermons();
  });
  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.hidden = true;
    filterAndRenderSermons();
  });

  ['filterTopic','filterPreacher','filterScripture','filterSort'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', filterAndRenderSermons);
  });

  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.hidden = true;
    ['filterTopic','filterPreacher','filterScripture'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = 'all';
    });
    const sort = document.getElementById('filterSort');
    if (sort) sort.value = 'newest';
    activeSeasonChip = 'all';
    renderSeasonChips();
    filterAndRenderSermons();
  });

  renderSeasonChips();
}

function renderSeasonChips() {
  const c = document.getElementById('seasonChipsContainer');
  if (!c) return;
  c.innerHTML = seasons.map(s => `
    <button class="chip ${s.slug === activeSeasonChip ? 'active' : ''}" onclick="window.selectSeasonChip('${s.slug}')">
      ${s.name}
    </button>`).join('');
}

export function selectSeasonChip(slug) {
  activeSeasonChip = slug;
  renderSeasonChips();
  filterAndRenderSermons();
}
window.selectSeasonChip = selectSeasonChip;

function populateDropdownFilterOptions() {
  const topicSel   = document.getElementById('filterTopic');
  const preachSel  = document.getElementById('filterPreacher');
  const adminPre   = document.getElementById('adminPreacher');
  const adminSea   = document.getElementById('adminSeason');

  if (topicSel)
    topicSel.innerHTML = `<option value="all">All Topics</option>` +
      topics.map(t => `<option value="${t.name}">${t.name}</option>`).join('');

  if (preachSel)
    preachSel.innerHTML = `<option value="all">All Preachers</option>` +
      preachers().map(p => `<option value="${p.name}">${p.name}</option>`).join('');

  if (adminPre)
    adminPre.innerHTML = preachers().map(p => `<option value="${p.name}">${p.name}</option>`).join('');

  if (adminSea)
    adminSea.innerHTML = seasons.filter(s => s.slug !== 'all')
      .map(s => `<option value="${s.name}">${s.name}</option>`).join('');
}

function filterAndRenderSermons() {
  const search     = (document.getElementById('sermonSearchInput')?.value || '').toLowerCase().trim();
  const topic      = document.getElementById('filterTopic')?.value || 'all';
  const preacher   = document.getElementById('filterPreacher')?.value || 'all';
  const scripture  = document.getElementById('filterScripture')?.value || 'all';
  const sort       = document.getElementById('filterSort')?.value || 'newest';

  let results = sermons().filter(s => {
    if (activeSeasonChip !== 'all') {
      const primary   = s.primarySeason.toLowerCase().includes(activeSeasonChip);
      const secondary = s.secondarySeasons?.some(x => x.toLowerCase().includes(activeSeasonChip));
      if (!primary && !secondary) return false;
    }
    if (topic !== 'all' && !s.topics.includes(topic)) return false;
    if (preacher !== 'all' && s.preacherName !== preacher) return false;
    if (scripture !== 'all' && s.scriptureBook !== scripture) return false;
    if (search) {
      const hit = [s.title, s.preacherName, s.scripture, s.summary, ...(s.transcript || []).map(t => t.text)]
        .some(str => str.toLowerCase().includes(search));
      if (!hit) return false;
    }
    return true;
  });

  if (sort === 'newest') results.sort((a,b) => new Date(b.publishDate) - new Date(a.publishDate));
  else if (sort === 'views') results.sort((a,b) => b.views - a.views);
  else if (sort === 'title') results.sort((a,b) => a.title.localeCompare(b.title));

  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = results.length;

  const grid = document.getElementById('sermonsIndexGrid');
  if (!grid) return;

  if (!results.length) {
    grid.innerHTML = `
      <div class="sermons-empty-state" style="grid-column:1/-1;text-align:center;padding:56px 24px;background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.04);">
        <div style="font-size:2.8rem;margin-bottom:14px;">🔍</div>
        <h3 style="margin-bottom:8px;font-family:var(--font-heading);font-size:1.4rem;">No Sermons Found</h3>
        <p style="color:#666;max-width:380px;margin:0 auto 18px;font-size:0.95rem;line-height:1.5;">We couldn't find any sermons matching your active search keywords or filter criteria.</p>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('resetFiltersBtn')?.click()">
          ↺ Reset All Filters
        </button>
      </div>`;
  } else {
    grid.innerHTML = results.map(s => createSermonCardHtml(s)).join('');
    observeNewCards(grid);
  }
}

// ─── SERMON MODAL — YouTube redirect (no iframe, keeps site fast) ─────────────
export function openSermonModal(sermonId) {
  const s = sermons().find(x => x.id === sermonId);
  if (!s) return;
  const modal     = document.getElementById('sermonModal');
  const modalBody = document.getElementById('sermonModalBody');
  if (!modal || !modalBody) return;

  const youtubeUrl = s.youtubeUrl || `https://www.youtube.com/watch?v=${s.youtubeEmbedId}`;

  modalBody.innerHTML = `
    <!-- Thumbnail with YouTube CTA — no iframe, site stays fast -->
    <div class="sermon-thumb-hero" onclick="window.open('${youtubeUrl}','_blank')" role="button" tabindex="0" title="Watch on YouTube">
      <img src="${s.thumbnailUrl}" alt="${s.title}" class="sermon-thumb-hero-img" loading="eager"
        onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='https://img.youtube.com/vi/${s.youtubeEmbedId}/hqdefault.jpg';}else{this.onerror=null;this.src='https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80';}">
      <div class="sermon-thumb-hero-overlay">
        <div class="sermon-yt-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Watch on YouTube</span>
        </div>
        <span class="sermon-thumb-duration">${svgClock} ${s.duration}</span>
      </div>
    </div>

    <div class="sermon-modal-body-inner">
      <div class="carousel-badges" style="margin-bottom:12px;">
        <span class="badge badge-season">${s.primarySeason}</span>
        <span class="badge badge-scripture">${svgBook} ${s.scripture}</span>
      </div>
      <h2 class="sermon-modal-title">${s.title}</h2>
      <div class="sermon-modal-meta">
        By <strong>${s.preacherName}</strong>
        &bull; ${s.publishDate}
        &bull; ${svgClock} ${s.duration}
      </div>
      <p style="margin-bottom:24px;font-size:1.02rem;color:#444;line-height:1.75;">${s.summary}</p>

      ${s.transcript && s.transcript.length ? `
      <div class="transcript-box">
        <div class="transcript-header">Timestamped Transcript</div>
        ${s.transcript.map(l => `
          <div class="transcript-line">
            <span class="ts-tag">${l.time}</span>
            <span>${l.text}</span>
          </div>`).join('')}
      </div>` : ''}

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:4px;">
        <a href="${youtubeUrl}" target="_blank" rel="noopener" class="btn btn-primary">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Watch on YouTube
        </a>
        <button class="btn btn-outline" onclick="window.shareSermon('${s.title}','${s.id}')">
          ${svgShare} Share
        </button>
        <button class="btn btn-outline" onclick="window.openPrayerFromSermon()">
          🙏 Prayer Request
        </button>
      </div>
    </div>`;

  modal.hidden = false;
  document.title = `${s.title} — 2-Minute Sermon`;

  // Inject VideoObject JSON-LD Schema for SEO
  let schemaScript = document.getElementById('dynamicSermonSchema');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'dynamicSermonSchema';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }
  schemaScript.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": s.title,
    "description": s.summary,
    "thumbnailUrl": [s.thumbnailUrl],
    "uploadDate": s.publishDate,
    "duration": `PT${s.durationSec || 120}S`,
    "contentUrl": youtubeUrl,
    "embedUrl": `https://www.youtube.com/embed/${s.youtubeEmbedId}`
  });
}
window.openSermonModal = openSermonModal;

function closeSermonModal() {
  const modal = document.getElementById('sermonModal');
  if (modal && !modal.hidden) {
    modal.hidden = true;
    document.getElementById('sermonModalBody').innerHTML = '';
    const schemaScript = document.getElementById('dynamicSermonSchema');
    if (schemaScript) schemaScript.remove();
    if (VIEW_TITLES[activeView]) document.title = VIEW_TITLES[activeView];
  }
}
window.closeSermonModal = closeSermonModal;

document.getElementById('closeSermonModalBtn')?.addEventListener('click', closeSermonModal);

// Modal backdrop click
document.getElementById('sermonModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('sermonModal')) closeSermonModal();
});

// Keyboard Accessibility: Escape key closes modals and menus
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSermonModal();
    closeDropdown();
    closeMobileDrawer();
  }
});

// ─── DAILY VERSE ──────────────────────────────────────────────────────────────
function setupDailyVerse() {
  const verse = getVerseForDate(getTodayDateStr());

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('dvDateDisplay', verse.publishDate);
  setEl('dvQuoteDisplay', `"${verse.verseText}"`);
  setEl('dvRefDisplay', `— ${verse.book} ${verse.chapter}:${verse.verse}`);
  setEl('dvReflectionDisplay', verse.reflection);

  document.getElementById('dvListenBtn')?.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) { showToast('TTS not supported on this browser.'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${verse.book} chapter ${verse.chapter} verse ${verse.verse}. ${verse.verseText}`);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
    showToast('🔊 Reading Today\'s Verse aloud…');
  });

  document.getElementById('dvCopyBtn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(`"${verse.verseText}" — ${verse.book} ${verse.chapter}:${verse.verse}`);
    showToast('📋 Verse copied to clipboard!');
  });

  document.getElementById('dvShareBtn')?.addEventListener('click', () => shareSermon(`Daily Verse: ${verse.book}`, 'daily-verse'));

  const full = document.getElementById('dailyVerseFullContainer');
  if (full) {
    full.innerHTML = `
      <div class="daily-verse-card" style="margin-bottom:36px;">
        <div class="verse-header">
          <span class="verse-label">Today's Scheduled Verse</span>
          <span class="verse-date">${verse.publishDate}</span>
        </div>
        <blockquote class="verse-quote">"${verse.verseText}"</blockquote>
        <div class="verse-meta">— ${verse.book} ${verse.chapter}:${verse.verse}</div>
        <p class="verse-reflection">${verse.reflection}</p>
      </div>
      <h2 style="margin-bottom:20px;">Upcoming Verse Queue</h2>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${scheduledDailyVerses.map(v => `
          <div class="hub-card reveal-on-scroll">
            <span class="badge badge-season">${v.publishDate}</span>
            <h3 style="margin:10px 0 4px;">"${v.verseText}"</h3>
            <div style="font-weight:700;color:var(--color-sermon-red);margin-bottom:6px;">— ${v.book} ${v.chapter}:${v.verse}</div>
            <p style="font-size:0.88rem;color:#777;">${v.reflection}</p>
          </div>`).join('')}
      </div>`;
    // trigger reveal for newly injected cards
    setTimeout(() => full.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed')), 100);
  }
}

// ─── PRAYER FORM ──────────────────────────────────────────────────────────────
function setupPrayerForm() {
  document.getElementById('prayerSubmissionForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name    = (document.getElementById('prayerName')?.value || '').trim() || 'Anonymous';
    const email   = (document.getElementById('prayerEmail')?.value || '').trim();
    const urgency = document.getElementById('prayerUrgency')?.value || 'General';
    const msg     = (document.getElementById('prayerMessage')?.value || '').trim();

    if (!email) {
      showToast('⚠️ Please provide an email address so we can confirm receipt.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }
    if (!msg || msg.length < 5) {
      showToast('⚠️ Please share a short description of your prayer need.');
      return;
    }

    pendingPrayers.unshift({
      id: `pr-${Date.now()}`,
      name,
      email,
      urgency,
      msg,
      status: 'New',
      date: new Date().toISOString().split('T')[0]
    });

    e.target.reset();
    renderAdminPrayerInbox();
    showToast('🙏 Your prayer request has been received with love.');
  });

  document.querySelectorAll('.copy-prayer-btn').forEach(btn => {
    btn.addEventListener('click', () => showToast('📋 Written prayer copied!'));
  });
}

import { isFirebaseConfigured, subscribeCollection } from './firebase.js';

// Real-time Cloud Settings Sync
if (isFirebaseConfigured()) {
  subscribeCollection('settings', (remoteDocs) => {
    const ministryDoc = remoteDocs.find(d => d.id === 'ministry');
    if (ministryDoc) {
      try {
        localStorage.setItem('2ms_settings', JSON.stringify(ministryDoc));
        updateFooterSocialLinks();
      } catch (_) {}
    }
  });
}

function normalizeUrl(url) {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

const DEFAULT_MINISTRY_EMAIL = 'info2minutesermon@gmail.com';
const DEFAULT_YT_CHANNEL     = 'https://www.youtube.com/c/2MinuteSermonP';
const DEFAULT_FB_PAGE        = 'https://www.facebook.com/2minutesermon';
const DEFAULT_IG_PAGE        = 'https://www.instagram.com/2_minutesermon/';

// ─── SETTINGS HELPERS (reads from localStorage & Firestore) ─────────────────
function getMinistrySettings() {
  try {
    const raw = localStorage.getItem('2ms_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
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

function updateFooterSocialLinks() {
  const s = getMinistrySettings();
  
  const map = {
    youtube: normalizeUrl(s.youtubeUrl) || DEFAULT_YT_CHANNEL,
    facebook: normalizeUrl(s.facebookUrl) || DEFAULT_FB_PAGE,
    instagram: normalizeUrl(s.instagramUrl) || DEFAULT_IG_PAGE
  };

  const socialIcons = document.querySelectorAll('.social-icon');
  socialIcons.forEach(a => {
    const key = (a.getAttribute('data-social') || a.getAttribute('title') || a.getAttribute('aria-label') || '').toLowerCase();
    
    for (const [platform, url] of Object.entries(map)) {
      if (key.includes(platform)) {
        a.href = url;
        break;
      }
    }
  });

  // Also bind any direct data-social="<platform>" elements anywhere on page
  for (const [platform, url] of Object.entries(map)) {
    document.querySelectorAll(`[data-social="${platform}"]`).forEach(el => {
      el.href = url;
    });
  }
}

async function postToEndpoint(endpoint, payload) {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (_) { /* fail silently — toast already shown */ }
}

// ─── NEWSLETTER FORM ─────────────────────────────────────────────────────────
function setupNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    const email = input?.value.trim();
    if (!email || !email.includes('@')) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }
    const { endpointUrl } = getMinistrySettings();
    if (endpointUrl) {
      await postToEndpoint(endpointUrl, { type: 'newsletter', email, _subject: 'New Newsletter Subscriber' });
    }
    showToast('🎉 Thank you for subscribing to daily 2-Minute Sermons!');
    form.reset();
  });
}

// ─── GENERAL CONTACT FORM ───────────────────────────────────────────────────
function setupGeneralContactForm() {
  const form = document.getElementById('generalContactForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('contactName')?.value.trim();
    const email   = document.getElementById('contactEmail')?.value.trim();
    const subject = document.getElementById('contactSubject')?.value;
    const msg     = document.getElementById('contactMessage')?.value.trim();

    if (!name || !email || !msg) {
      showToast('⚠️ Please fill out all required fields.');
      return;
    }
    const { endpointUrl } = getMinistrySettings();
    if (endpointUrl) {
      await postToEndpoint(endpointUrl, { type: 'contact', name, email, subject, message: msg, _subject: `Contact: ${subject}` });
    }
    showToast(`✉️ Message sent! Our team will respond shortly.`);
    form.reset();
  });
}

window.openPrayerFromSermon = () => {
  document.getElementById('sermonModal').hidden = true;
  switchView('prayers');
};

// ─── ADMIN AUTH GATE ──────────────────────────────────────────────────────────
function openAdminPortal() {
  if (adminAuthenticated) { switchView('admin'); return; }

  // Render auth overlay
  const overlay = document.createElement('div');
  overlay.className = 'admin-auth-overlay';
  overlay.id = 'adminAuthOverlay';
  overlay.innerHTML = `
    <div class="admin-auth-card">
      <img src="/assets/logo.png" alt="2-Minute Sermon" class="admin-auth-logo">
      <h2 class="admin-auth-title">The Steward</h2>
      <p class="admin-auth-subtitle">Faithful management of sermons, schedules &amp; ministry content.</p>
      <form class="admin-auth-form" id="adminAuthForm">
        <input type="text" class="admin-auth-input" id="adminAuthUser" placeholder="Username" autocomplete="username" required>
        <input type="password" class="admin-auth-input" id="adminAuthPass" placeholder="Password" autocomplete="current-password" required>
        <div class="admin-auth-error" id="adminAuthError"></div>
        <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top:4px;">
          🔐 Enter The Steward
        </button>
      </form>
      <p class="admin-auth-hint">Enter your password to continue.</p>
    </div>`;

  document.body.appendChild(overlay);

  document.getElementById('adminAuthForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const pass = document.getElementById('adminAuthPass').value;
    const errEl = document.getElementById('adminAuthError');

    if (pass === ADMIN_PASSWORD) {
      adminAuthenticated = true;
      overlay.style.animation = 'fadeOut 0.25s ease forwards';
      setTimeout(() => { overlay.remove(); switchView('admin'); }, 250); 
      showToast('✅ Welcome to The Steward');
    } else {
      errEl.textContent = 'Incorrect password. Please try again.';
      document.getElementById('adminAuthPass').value = '';
      document.getElementById('adminAuthPass').focus();
      const card = overlay.querySelector('.admin-auth-card');
      card.style.animation = 'none';
      requestAnimationFrame(() => { card.style.animation = 'shake 0.4s ease'; });
    }
  });
}

// Shake animation for wrong password
const style = document.createElement('style');
style.textContent = `
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
  @keyframes fadeOut { to{opacity:0;transform:scale(0.97)} }
`;
document.head.appendChild(style);

// ─── ADMIN PORTAL SETUP ───────────────────────────────────────────────────────
function setupAdminPortal() {
  document.getElementById('adminHeaderBtn')?.addEventListener('click', openAdminPortal);

  // Sub-tab switching
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-admintab');
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`admintab-${tab}`)?.classList.add('active');
    });
  });

  // Set default date
  const dateInput = document.getElementById('adminDvDate');
  if (dateInput) dateInput.value = getTodayDateStr();

  // ── Daily Verse Scheduler ──
  document.getElementById('adminScheduleVerseForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const dateStr     = document.getElementById('adminDvDate').value;
    const ref         = document.getElementById('adminDvBook').value;
    const verseText   = document.getElementById('adminDvText').value;
    const reflection  = document.getElementById('adminDvReflection').value;

    const parts = ref.split(':');
    const chapterVerse = parts[1] || '1';
    const bookChap = (parts[0] || ref).trim();
    const bookWords = bookChap.split(' ');
    const chap = bookWords.pop();
    const book = bookWords.join(' ') || bookChap;

    const entry = { id: `dv-${dateStr}`, publishDate: dateStr, verseText, book, chapter: chap, verse: chapterVerse, reflection, tags: ['Scheduled'] };

    const idx = scheduledDailyVerses.findIndex(v => v.publishDate === dateStr);
    if (idx >= 0) scheduledDailyVerses[idx] = entry;
    else {
      scheduledDailyVerses.push(entry);
      scheduledDailyVerses.sort((a,b) => new Date(a.publishDate) - new Date(b.publishDate));
    }

    e.target.reset();
    if (dateInput) dateInput.value = getTodayDateStr();
    renderAdminVerseQueue();
    setupDailyVerse();
    showToast(`📅 Verse scheduled for ${dateStr}!`);
  });

  // ── Auto-fill 30 Days ──
  document.getElementById('adminAutoGenerate30DaysBtn')?.addEventListener('click', () => {
    const pool = [
      { text: "The Lord is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1", ref2: {book:"Psalm",chapter:"27",verse:"1"}, r: "Light dispels every shadow of doubt. Stand confident in His protection today." },
      { text: "Trust in the Lord with all your heart, and lean not on your own understanding.", ref: "Proverbs 3:5", ref2:{book:"Proverbs",chapter:"3",verse:"5"}, r: "Surrendering control opens the door to divine wisdom." },
      { text: "Cast all your anxiety on Him because He cares for you.", ref: "1 Peter 5:7", ref2:{book:"1 Peter",chapter:"5",verse:"7"}, r: "Your heavenly Father is attentive to your every burden." },
      { text: "Peace I leave with you; my peace I give to you.", ref: "John 14:27", ref2:{book:"John",chapter:"14",verse:"27"}, r: "Christ offers a tranquility the world cannot manufacture." }
    ];

    const start = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      if (scheduledDailyVerses.some(v => v.publishDate === dateStr)) continue;
      const sample = pool[i % pool.length];
      scheduledDailyVerses.push({ id: `dv-${dateStr}`, publishDate: dateStr, verseText: sample.text, ...sample.ref2, reflection: sample.r, tags: ['Auto-Queue'] });
    }
    scheduledDailyVerses.sort((a,b) => new Date(a.publishDate) - new Date(b.publishDate));
    renderAdminVerseQueue();
    setupDailyVerse();
    showToast('⚡ 30-Day verse queue auto-populated!');
  });

  // ── Sermon Publisher ──
  document.getElementById('adminQuickPublishForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const title    = document.getElementById('adminSermonTitle').value;
    const preacher = document.getElementById('adminPreacher').value;
    const scripture= document.getElementById('adminScripture').value;
    const season   = document.getElementById('adminSeason').value;
    const duration = document.getElementById('adminDuration').value;
    const raw      = document.getElementById('adminYoutubeUrl').value;
    const summary  = document.getElementById('adminSummary').value;

    let embedId = raw;
    if (raw.includes('v=')) embedId = raw.split('v=')[1].split('&')[0];
    else if (raw.includes('youtu.be/')) embedId = raw.split('youtu.be/')[1].split('?')[0];

    sermons.unshift({
      id: `sermon-${Date.now()}`, title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      preacherId: 'p1', preacherName: preacher,
      scripture, scriptureBook: scripture.split(' ')[0],
      primarySeason: season, secondarySeasons: [], topics: ['Faith'],
      duration, durationSec: 120, youtubeUrl: raw, youtubeEmbedId: embedId,
      thumbnailUrl: `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`,
      summary, publishDate: getTodayDateStr(), views: 1, featured: true,
      transcript: [{ time: '0:00', text: summary }, { time: '1:00', text: 'Walk boldly in God\'s promises today.' }]
    });

    renderFeaturedCarousel(true);
    renderHomeSermons();
    filterAndRenderSermons();
    populateDropdownFilterOptions();
    e.target.reset();
    showToast(`🚀 "${title}" published live!`);
  });

  // ── Add Preacher ──
  document.getElementById('adminAddPreacherForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name         = document.getElementById('newPreacherName').value;
    const denomination = document.getElementById('newPreacherDenomination').value;
    const country      = document.getElementById('newPreacherCountry').value;
    const photoUrl     = document.getElementById('newPreacherPhoto').value;
    const bio          = document.getElementById('newPreacherBio').value;

    const newPreacher = {
      id: `p-${Date.now()}`, name, denomination, country, photoUrl, bio
    };

    preachers.push(newPreacher);
    renderPreachersHub();
    renderAdminPreachersList();
    populateDropdownFilterOptions();
    e.target.reset();

    // Update stat counter in hero
    const counter = document.getElementById('homePreachersCount');
    if (counter) counter.textContent = `${preachers.length}+`;

    showToast(`🎙️ ${name} added to the Preachers Directory!`);
  });

  // ── CMS Export ──
  document.getElementById('adminExportJsonBtn')?.addEventListener('click', () => {
    const data = { exportedAt: new Date().toISOString(), scheduledDailyVerses, sermons, preachers, pendingPrayers };
    const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.href = url; a.download = `2ms-cms-backup-${getTodayDateStr()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    showToast('📥 CMS backup downloaded!');
  });
}

// ─── ADMIN RENDER HELPERS ──────────────────────────────────────────────────────
function renderAdminVerseQueue() {
  const c = document.getElementById('adminVerseQueueList');
  if (!c) return;
  if (!scheduledDailyVerses.length) {
    c.innerHTML = `<p style="color:#777;text-align:center;padding:24px;">No verses scheduled yet.</p>`;
    return;
  }
  c.innerHTML = scheduledDailyVerses.map((v, idx) => `
    <div class="admin-queue-item">
      <div class="admin-queue-header">
        <strong style="color:var(--color-sermon-red);">${v.publishDate}</strong>
        <span class="badge badge-scripture">${v.book} ${v.chapter}:${v.verse}</span>
      </div>
      <p style="font-size:0.88rem;color:#333;margin:4px 0;">"${v.verseText}"</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
        <span style="font-size:0.75rem;color:#777;">${v.reflection.substring(0, 52)}…</span>
        <button class="btn btn-sm btn-outline" onclick="window.removeScheduledVerse(${idx})" style="flex-shrink:0;">✕ Remove</button>
      </div>
    </div>`).join('');
}
window.removeScheduledVerse = idx => {
  scheduledDailyVerses.splice(idx, 1);
  renderAdminVerseQueue();
  setupDailyVerse();
  showToast('Verse removed from queue.');
};

function renderAdminPreachersList() {
  const c = document.getElementById('adminPreachersList');
  if (!c) return;
  c.innerHTML = preachers.map((p, idx) => `
    <div class="admin-preacher-item">
      <img src="${p.photoUrl}" alt="${p.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=C62828&color=fff'">
      <div class="admin-preacher-info">
        <strong>${p.name}</strong>
        <span>${p.denomination} &bull; ${p.country}</span>
      </div>
      <button class="btn btn-sm btn-outline" onclick="window.removePreacher(${idx})" style="flex-shrink:0;">
        ✕
      </button>
    </div>`).join('');
}
window.removePreacher = idx => {
  const name = preachers[idx]?.name;
  preachers.splice(idx, 1);
  renderPreachersHub();
  renderAdminPreachersList();
  populateDropdownFilterOptions();
  const counter = document.getElementById('homePreachersCount');
  if (counter) counter.textContent = `${preachers.length}+`;
  showToast(`${name} removed from directory.`);
};

function renderAdminPrayerInbox() {
  const c = document.getElementById('adminPrayerInboxList');
  const badge = document.getElementById('adminPendingBadge');
  if (badge) badge.textContent = pendingPrayers.length;
  if (!c) return;

  if (!pendingPrayers.length) {
    c.innerHTML = `<p style="color:#777;text-align:center;padding:24px;">No pending prayer requests. 🙌</p>`;
    return;
  }
  c.innerHTML = pendingPrayers.map((pr, idx) => `
    <div class="admin-prayer-item">
      <div class="admin-prayer-item-header">
        <strong>${pr.name} (${pr.email})</strong>
        <span class="badge badge-season">${pr.urgency}</span>
      </div>
      <p style="font-size:0.9rem;color:#333;margin:6px 0;">"${pr.msg}"</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
        <span style="font-size:0.75rem;color:#777;">Submitted: ${pr.date}</span>
        <button class="btn btn-sm btn-outline" onclick="window.markPrayerDone(${idx})">✓ Prayed For</button>
      </div>
    </div>`).join('');
}
window.markPrayerDone = idx => {
  pendingPrayers.splice(idx, 1);
  renderAdminPrayerInbox();
  showToast('✓ Prayer request marked as prayed for!');
};

// ─── HUBS ─────────────────────────────────────────────────────────────────────
function renderSeasonsHub() {
  const c = document.getElementById('seasonsHubGrid');
  if (!c) return;
  c.innerHTML = seasons.filter(s => s.slug !== 'all').map(s => `
    <div class="hub-card" onclick="window.selectSeasonChip('${s.slug}');window.switchView('sermons');">
      <h3 style="font-size:1.3rem;margin-bottom:8px;">${s.name}</h3>
      <p style="font-size:0.9rem;color:#777;margin-bottom:18px;line-height:1.5;">${s.description}</p>
      <span style="font-weight:700;color:var(--color-sermon-red);font-size:0.88rem;">Browse Season →</span>
    </div>`).join('');
  observeNewCards(c);
}

function renderTopicsHub() {
  const c = document.getElementById('topicsHubGrid');
  if (!c) return;
  c.innerHTML = topics.map(t => `
    <div class="hub-card" onclick="window.filterByTopicName('${t.name}')">
      <h3 style="font-size:1.3rem;margin-bottom:8px;">${t.name}</h3>
      <p style="font-size:0.9rem;color:#777;margin-bottom:18px;line-height:1.5;">${t.description}</p>
      <span style="font-weight:700;color:var(--color-sermon-red);font-size:0.88rem;">View ${t.count} Sermons →</span>
    </div>`).join('');
  observeNewCards(c);
}
window.filterByTopicName = name => {
  switchView('sermons');
  const s = document.getElementById('filterTopic');
  if (s) { s.value = name; filterAndRenderSermons(); }
};

function renderPreachersHub() {
  const c = document.getElementById('preachersHubGrid');
  if (!c) return;
  c.innerHTML = preachers().map(p => `
    <div class="hub-card text-center">
      <img src="${p.photoUrl}" alt="${p.name}" class="preacher-card-img"
           onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=C62828&color=fff&size=84'">
      <h3 style="font-size:1.2rem;margin-bottom:4px;">${p.name}</h3>
      <div style="font-size:0.8rem;color:var(--color-sermon-red);font-weight:600;margin-bottom:10px;">${p.denomination} &bull; ${p.country}</div>
      <p style="font-size:0.85rem;color:#777;margin-bottom:18px;line-height:1.5;">${p.bio}</p>
      <button class="btn btn-outline btn-sm btn-full" onclick="window.filterByPreacherName('${p.name}')">
        View Sermons
      </button>
    </div>`).join('');
  observeNewCards(c);
}
window.filterByPreacherName = name => {
  switchView('sermons');
  const s = document.getElementById('filterPreacher');
  if (s) { s.value = name; filterAndRenderSermons(); }
};

function renderEventsGrid() {
  const c = document.getElementById('eventsGrid');
  if (!c) return;
  const list = events();

  if (!list.length) {
    c.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:56px 24px;background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);">
        <div style="font-size:2.5rem;margin-bottom:12px;">📅</div>
        <h3 style="margin-bottom:8px;font-family:var(--font-heading);">No Upcoming Events Scheduled</h3>
        <p style="color:#666;max-width:380px;margin:0 auto;font-size:0.95rem;">Check back soon or follow our online broadcasts for upcoming ministry gatherings.</p>
      </div>`;
    return;
  }

  c.innerHTML = list.map(ev => `
    <div class="event-card">
      <div class="event-card-header">
        <span class="badge badge-season">${ev.category || 'Ministry Event'}</span>
        <span class="event-date-pill">${ev.date}${ev.time ? ` · ${ev.time}` : ''}</span>
      </div>
      <h3 class="event-card-title">${ev.title}</h3>
      <div class="event-card-location">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        <span>${ev.location}</span>
      </div>
      <p class="event-card-desc">${ev.description}</p>
      <div class="event-card-footer">
        <button class="btn btn-outline btn-sm btn-full" onclick="window.shareEvent('${encodeURIComponent(ev.title)}', '${encodeURIComponent(ev.date || '')}', '${encodeURIComponent(ev.location || '')}')">
          ${svgShare} Share Event
        </button>
      </div>
    </div>`).join('');
  observeNewCards(c);
}

window.shareEvent = (titleEnc, dateEnc, locEnc) => {
  const title = decodeURIComponent(titleEnc);
  const date  = decodeURIComponent(dateEnc);
  const loc   = decodeURIComponent(locEnc);
  const text  = `Join us for "${title}" on ${date} (${loc}) — 2-Minute Sermon Ministry: ${window.location.origin}/#events`;

  if (navigator.share) {
    navigator.share({ title, text, url: `${window.location.origin}/#events` }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text);
    showToast('📋 Event details copied to clipboard!');
  }
};

export function renderAboutOrganigram() {
  const container = document.getElementById('aboutOrganigramContainer');
  if (!container) return;

  const team = leadership();
  const exec = team.filter(m => m.tierOrder === 1 || m.tier === 'Executive Leadership');
  const advisory = team.filter(m => m.tierOrder === 2 || m.tier === 'Advisory & Governance');
  const depts = team.filter(m => m.tierOrder === 3 || m.tier === 'Department Directors' || (!exec.includes(m) && !advisory.includes(m)));

  const renderCard = (m, isExec = false) => `
    <div class="organigram-card ${isExec ? 'executive' : ''}">
      <img src="${m.photoUrl}" alt="${m.name}" class="organigram-card-avatar"
        onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=C62828&color=fff&size=160'">
      <span class="organigram-tier-badge">${m.tier || (isExec ? 'Executive Leadership' : 'Ministry Lead')}</span>
      <h3 class="organigram-name">${m.name}</h3>
      <div class="organigram-role">${m.role}</div>
      ${m.bio ? `<p class="organigram-bio">${m.bio}</p>` : ''}
    </div>
  `;

  let html = '';

  if (exec.length) {
    html += `
      <div class="organigram-tier tier-exec">
        ${exec.map(m => renderCard(m, true)).join('')}
      </div>
    `;
  }

  if (advisory.length) {
    html += `
      <div class="organigram-tier tier-advisory">
        ${advisory.map(m => renderCard(m, false)).join('')}
      </div>
    `;
  }

  if (depts.length) {
    html += `
      <div class="organigram-tier tier-depts">
        ${depts.map(m => renderCard(m, false)).join('')}
      </div>
    `;
  }

  container.innerHTML = html;
}
window.renderAboutOrganigram = renderAboutOrganigram;

// ─── UTILS ────────────────────────────────────────────────────────────────────
export function showToast(msg, duration = 4000) {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  c.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}
window.showToast = showToast;

export function shareSermon(title, id) {
  const url = `${window.location.origin}/#sermon-${id}`;
  if (navigator.share) {
    navigator.share({ title, text: `Watch "${title}" on 2-Minute Sermon`, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
    showToast(`🔗 Link copied for "${title}"`);
  }
}
window.shareSermon = shareSermon;
